/**
 * SlackwareAlbert - Frontend Application
 * Cliente JavaScript para interactuar con la API REST
 * Version: 1.1.0
 */

const app = {
    apiBaseUrl: '../api/index.php',
    currentChannel: null,
    currentUsername: 'Usuario',
    lastMessageId: 0,
    pollInterval: null,
    channels: [],
    users: [],
    language: 'es',
    i18n: {
        es: {
            'btn.changeUser': 'Cambiar usuario',
            'btn.newChannel': '+ Nuevo Canal',
            'btn.send': 'Enviar',
            'btn.cancel': 'Cancelar',
            'btn.createChannel': 'Crear Canal',
            'btn.save': 'Guardar',
            'sidebar.channels': 'Canales',
            'loading.channels': 'Cargando canales...',
            'loading.messages': 'Cargando mensajes...',
            'channel.defaultDesc': 'Canal general',
            'input.message': 'Escribe tu mensaje...',
            'modal.newChannel.title': 'Crear Nuevo Canal',
            'modal.newChannel.nameLabel': 'Nombre del Canal',
            'modal.newChannel.namePlaceholder': 'ej: desarrollo',
            'modal.newChannel.descLabel': 'Descripcion',
            'modal.newChannel.descPlaceholder': 'Describe el proposito de este canal...',
            'modal.user.title': 'Elegir o crear usuario',
            'modal.user.existingLabel': 'Usuario existente',
            'modal.user.newLabel': 'Nuevo usuario',
            'modal.user.newPlaceholder': 'ej: DevAlbert',
            'state.noChannels': 'No hay canales',
            'state.channelsError': 'Error al cargar canales',
            'state.noMessagesTitle': 'Sin mensajes aun',
            'state.noMessagesText': 'Se el primero en escribir en este canal',
            'state.messagesError': 'Error al cargar mensajes',
            'notify.channelCreated': 'Canal creado correctamente',
            'notify.userUpdated': 'Usuario actualizado',
            'notify.userCreated': 'Usuario creado correctamente',
            'notify.sendError': 'Error al enviar mensaje',
            'notify.channelError': 'Error al crear canal',
            'notify.userError': 'Error al guardar usuario',
            'generic.noDescription': 'Sin descripcion',
            'generic.selectUser': 'Selecciona un usuario'
        },
        en: {
            'btn.changeUser': 'Change user',
            'btn.newChannel': '+ New Channel',
            'btn.send': 'Send',
            'btn.cancel': 'Cancel',
            'btn.createChannel': 'Create Channel',
            'btn.save': 'Save',
            'sidebar.channels': 'Channels',
            'loading.channels': 'Loading channels...',
            'loading.messages': 'Loading messages...',
            'channel.defaultDesc': 'General channel',
            'input.message': 'Write your message...',
            'modal.newChannel.title': 'Create New Channel',
            'modal.newChannel.nameLabel': 'Channel Name',
            'modal.newChannel.namePlaceholder': 'eg: development',
            'modal.newChannel.descLabel': 'Description',
            'modal.newChannel.descPlaceholder': 'Describe the purpose of this channel...',
            'modal.user.title': 'Choose or create user',
            'modal.user.existingLabel': 'Existing user',
            'modal.user.newLabel': 'New user',
            'modal.user.newPlaceholder': 'eg: DevAlbert',
            'state.noChannels': 'No channels available',
            'state.channelsError': 'Failed to load channels',
            'state.noMessagesTitle': 'No messages yet',
            'state.noMessagesText': 'Be the first to write in this channel',
            'state.messagesError': 'Failed to load messages',
            'notify.channelCreated': 'Channel created successfully',
            'notify.userUpdated': 'User updated',
            'notify.userCreated': 'User created successfully',
            'notify.sendError': 'Error sending message',
            'notify.channelError': 'Error creating channel',
            'notify.userError': 'Error saving user',
            'generic.noDescription': 'No description',
            'generic.selectUser': 'Select a user'
        }
    },

    async init() {
        this.loadLanguagePreference();
        this.applyTranslations();
        await this.loadVersion();
        await this.loadUsers();
        await this.ensureCurrentUser();
        await this.loadChannels();

        const textarea = document.getElementById('messageInput');
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    },

    /**
     * Carga versión visible de la app desde archivo estático
     */
    async loadVersion() {
        try {
            const response = await fetch('./version.json', { cache: 'no-store' });
            if (!response.ok) {
                return;
            }
            const versionData = await response.json();
            const versionEl = document.getElementById('appVersion');
            if (versionEl && versionData.version) {
                versionEl.textContent = versionData.version;
            }
        } catch (error) {
            console.warn('No se pudo cargar version.json:', error);
        }
    },

    loadLanguagePreference() {
        const saved = localStorage.getItem('slackware_lang');
        if (saved && this.i18n[saved]) {
            this.language = saved;
        }

        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = this.language;
        }
    },

    changeLanguage(nextLanguage) {
        if (!this.i18n[nextLanguage]) {
            return;
        }
        this.language = nextLanguage;
        localStorage.setItem('slackware_lang', nextLanguage);
        this.applyTranslations();
        this.refreshHeaderTexts();
        this.renderChannels();
        this.loadMessages();
    },

    t(key) {
        const table = this.i18n[this.language] || this.i18n.es;
        return table[key] || key;
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', this.t(key));
        });
    },

    refreshHeaderTexts() {
        if (this.currentChannel) {
            document.getElementById('channelDesc').textContent = this.currentChannel.description || this.t('generic.noDescription');
        }
    },
    
    /**
     * Genera un nombre de usuario aleatorio
     */
    generateUsername() {
        const adjectives = ['Rapido', 'Veloz', 'Feliz', 'Brillante', 'Astuto', 'Valiente'];
        const nouns = ['Panda', 'Tigre', 'Delfin', 'Aguila', 'Lobo', 'Zorro'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
    },

    async fetchJson(url, options = {}) {
        const response = await fetch(url, options);
        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error('Respuesta invalida del servidor');
        }

        if (!response.ok) {
            const msg = data.error || 'Error de servidor';
            throw new Error(msg);
        }

        return data;
    },

    async loadUsers() {
        this.users = await this.fetchJson(`${this.apiBaseUrl}?action=users`);
        this.fillUsersSelect();
    },

    fillUsersSelect() {
        const select = document.getElementById('existingUserSelect');
        if (!select) {
            return;
        }

        select.innerHTML = `<option value="">${this.escapeHtml(this.t('generic.selectUser'))}</option>`;

        this.users.forEach((user) => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            select.appendChild(option);
        });

        if (this.currentUsername) {
            select.value = this.currentUsername;
        }
    },

    async ensureCurrentUser() {
        const savedUsername = localStorage.getItem('slackware_username');

        if (savedUsername && this.users.some((user) => user.username === savedUsername)) {
            this.currentUsername = savedUsername;
        } else if (this.users.length > 0) {
            this.currentUsername = this.users[0].username;
            localStorage.setItem('slackware_username', this.currentUsername);
        } else {
            const generatedUsername = this.generateUsername();
            await this.createUser(generatedUsername);
            this.currentUsername = generatedUsername;
            localStorage.setItem('slackware_username', this.currentUsername);
            await this.loadUsers();
        }

        document.getElementById('currentUsername').textContent = this.currentUsername;
    },

    showUserModal() {
        this.fillUsersSelect();
        const input = document.getElementById('newUsernameInput');
        input.value = '';
        document.getElementById('userModal').classList.add('active');
    },

    hideUserModal() {
        document.getElementById('userModal').classList.remove('active');
    },

    async saveUser(event) {
        event.preventDefault();

        const selected = document.getElementById('existingUserSelect').value.trim();
        const newUsername = document.getElementById('newUsernameInput').value.trim();

        try {
            if (newUsername) {
                await this.createUser(newUsername);
                this.currentUsername = newUsername;
                await this.loadUsers();
                alert(this.t('notify.userCreated'));
            } else if (selected) {
                this.currentUsername = selected;
                alert(this.t('notify.userUpdated'));
            } else {
                return;
            }

            localStorage.setItem('slackware_username', this.currentUsername);
            document.getElementById('currentUsername').textContent = this.currentUsername;
            this.hideUserModal();
        } catch (error) {
            alert(`${this.t('notify.userError')}: ${error.message}`);
        }
    },

    async createUser(username) {
        await this.fetchJson(`${this.apiBaseUrl}?action=users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
    },
    
    /**
     * Carga la lista de canales
     */
    async loadChannels() {
        try {
            this.channels = await this.fetchJson(`${this.apiBaseUrl}?action=channels`);
            this.renderChannels();

            if (!this.currentChannel && this.channels.length > 0) {
                await this.selectChannel(this.channels[0]);
            }
        } catch (error) {
            console.error('Error al cargar canales:', error);
            document.getElementById('channelsList').innerHTML = `<div class="empty-state">${this.escapeHtml(this.t('state.channelsError'))}</div>`;
        }
    },

    renderChannels() {
        const container = document.getElementById('channelsList');
        container.innerHTML = '';

        if (this.channels.length === 0) {
            container.innerHTML = `<div class="empty-state">${this.escapeHtml(this.t('state.noChannels'))}</div>`;
            return;
        }

        this.channels.forEach((channel) => {
            const item = document.createElement('div');
            item.className = 'channel-item';
            if (this.currentChannel && this.currentChannel.id === channel.id) {
                item.classList.add('active');
            }
            item.innerHTML = `
                <span class="channel-prefix">#</span>
                <span>${this.escapeHtml(channel.name)}</span>
            `;
            item.onclick = () => this.selectChannel(channel);
            container.appendChild(item);
        });
    },
    
    /**
     * Selecciona un canal
     */
    async selectChannel(channel) {
        this.currentChannel = channel;
        this.lastMessageId = 0;
        
        // Actualizar UI
        document.getElementById('channelName').textContent = `# ${channel.name}`;
        document.getElementById('channelDesc').textContent = channel.description || this.t('generic.noDescription');
        this.renderChannels();
        
        // Detener polling anterior
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        
        // Cargar mensajes
        await this.loadMessages();
        
        // Iniciar polling
        this.pollInterval = setInterval(() => this.pollNewMessages(), 2000);
    },
    
    /**
     * Carga los mensajes del canal actual
     */
    async loadMessages() {
        if (!this.currentChannel) return;
        
        try {
            const messages = await this.fetchJson(`${this.apiBaseUrl}?action=messages&channel_id=${this.currentChannel.id}`);
            
            const container = document.getElementById('messagesContainer');
            container.innerHTML = '';
            
            if (messages.length === 0) {
                container.innerHTML = `<div class="empty-state"><h3>${this.escapeHtml(this.t('state.noMessagesTitle'))}</h3><p>${this.escapeHtml(this.t('state.noMessagesText'))}</p></div>`;
                return;
            }
            
            messages.forEach(message => {
                this.appendMessage(message);
                if (message.id > this.lastMessageId) {
                    this.lastMessageId = message.id;
                }
            });
            
            this.scrollToBottom();
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            document.getElementById('messagesContainer').innerHTML = `<div class="empty-state">${this.escapeHtml(this.t('state.messagesError'))}</div>`;
        }
    },
    
    /**
     * Polling para nuevos mensajes
     */
    async pollNewMessages() {
        if (!this.currentChannel) return;
        
        try {
            const messages = await this.fetchJson(`${this.apiBaseUrl}?action=poll&channel_id=${this.currentChannel.id}&after_id=${this.lastMessageId}`);
            
            if (messages.length > 0) {
                messages.forEach(message => {
                    this.appendMessage(message);
                    if (message.id > this.lastMessageId) {
                        this.lastMessageId = message.id;
                    }
                });
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Error en polling:', error);
        }
    },
    
    /**
     * Agrega un mensaje al contenedor
     */
    appendMessage(message) {
        const container = document.getElementById('messagesContainer');
        
        // Remover empty state si existe
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.dataset.id = message.id;
        
        const locale = this.language === 'en' ? 'en-US' : 'es-ES';
        const time = new Date(message.created_at).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const initial = message.username.charAt(0).toUpperCase();
        
        messageEl.innerHTML = `
            <div class="message-avatar">${initial}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username">${this.escapeHtml(message.username)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.message)}</div>
            </div>
        `;
        
        container.appendChild(messageEl);
    },
    
    /**
     * Envía un mensaje
     */
    async sendMessage() {
        if (!this.currentChannel) return;
        
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        try {
            const result = await this.fetchJson(`${this.apiBaseUrl}?action=messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel_id: this.currentChannel.id,
                    username: this.currentUsername,
                    message: message
                })
            });
            
            if (result.success) {
                input.value = '';
                input.style.height = 'auto';
                // El mensaje aparecerá via polling
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert(`${this.t('notify.sendError')}: ${error.message}`);
        }
    },
    
    /**
     * Maneja el keydown en el textarea de mensaje
     */
    handleMessageKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    },
    
    /**
     * Muestra el modal de nuevo canal
     */
    showNewChannelModal() {
        document.getElementById('newChannelModal').classList.add('active');
        document.getElementById('channelNameInput').focus();
    },
    
    /**
     * Oculta el modal de nuevo canal
     */
    hideNewChannelModal() {
        document.getElementById('newChannelModal').classList.remove('active');
        document.getElementById('channelNameInput').value = '';
        document.getElementById('channelDescInput').value = '';
    },
    
    /**
     * Crea un nuevo canal
     */
    async createChannel(event) {
        event.preventDefault();
        
        const name = document.getElementById('channelNameInput').value.trim();
        const description = document.getElementById('channelDescInput').value.trim();
        
        if (!name) return;
        
        try {
            const result = await this.fetchJson(`${this.apiBaseUrl}?action=channels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })
            });
            
            if (result.success) {
                this.hideNewChannelModal();
                await this.loadChannels();
                alert(this.t('notify.channelCreated'));
            }
        } catch (error) {
            console.error('Error al crear canal:', error);
            alert(`${this.t('notify.channelError')}: ${error.message}`);
        }
    },
    
    /**
     * Scroll al final del contenedor de mensajes
     */
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    },
    
    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
