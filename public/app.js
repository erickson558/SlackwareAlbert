/**
 * SlackwareAlbert - Frontend Application
 * Cliente JavaScript para interactuar con la API REST
 * Version: 1.0.0
 */

const app = {
    // Configuración
    apiBaseUrl: '../api/index.php',
    currentChannel: null,
    currentUsername: 'Usuario',
    lastMessageId: 0,
    pollInterval: null,
    
    /**
     * Inicializa la aplicación
     */
    async init() {
        await this.loadVersion();

        // Obtener o crear username
        this.currentUsername = localStorage.getItem('slackware_username') || this.generateUsername();
        localStorage.setItem('slackware_username', this.currentUsername);
        document.getElementById('currentUsername').textContent = this.currentUsername;
        
        // Cargar canales
        await this.loadChannels();
        
        // Auto-resize textarea
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
    
    /**
     * Genera un nombre de usuario aleatorio
     */
    generateUsername() {
        const adjectives = ['Rápido', 'Veloz', 'Feliz', 'Brillante', 'Astuto', 'Valiente'];
        const nouns = ['Panda', 'Tigre', 'Delfín', 'Águila', 'Lobo', 'Zorro'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adj}${noun}${Math.floor(Math.random() * 100)}`;
    },
    
    /**
     * Carga la lista de canales
     */
    async loadChannels() {
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=channels`);
            const channels = await response.json();
            
            const container = document.getElementById('channelsList');
            container.innerHTML = '';
            
            if (channels.length === 0) {
                container.innerHTML = '<div class="empty-state">No hay canales</div>';
                return;
            }
            
            channels.forEach(channel => {
                const item = document.createElement('div');
                item.className = 'channel-item';
                if (this.currentChannel && this.currentChannel.id === channel.id) {
                    item.classList.add('active');
                }
                item.innerHTML = `
                    <span class="channel-prefix">#</span>
                    <span>${this.escapeHtml(channel.name)}</span>
                `;
                item.onclick = (event) => this.selectChannel(channel, event);
                container.appendChild(item);
            });
            
            // Seleccionar primer canal por defecto
            if (!this.currentChannel && channels.length > 0) {
                this.selectChannel(channels[0]);
            }
        } catch (error) {
            console.error('Error al cargar canales:', error);
            document.getElementById('channelsList').innerHTML = '<div class="empty-state">Error al cargar canales</div>';
        }
    },
    
    /**
     * Selecciona un canal
     */
    async selectChannel(channel, clickEvent) {
        this.currentChannel = channel;
        this.lastMessageId = 0;
        
        // Actualizar UI
        document.getElementById('channelName').textContent = `# ${channel.name}`;
        document.getElementById('channelDesc').textContent = channel.description || 'Sin descripción';
        
        // Actualizar clase active en sidebar
        document.querySelectorAll('.channel-item').forEach(item => {
            item.classList.remove('active');
        });

        if (clickEvent && clickEvent.target) {
            const selected = clickEvent.target.closest('.channel-item');
            if (selected) {
                selected.classList.add('active');
            }
        }
        
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
            const response = await fetch(`${this.apiBaseUrl}?action=messages&channel_id=${this.currentChannel.id}`);
            const messages = await response.json();
            
            const container = document.getElementById('messagesContainer');
            container.innerHTML = '';
            
            if (messages.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>Sin mensajes aún</h3><p>Sé el primero en escribir en este canal</p></div>';
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
            document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Error al cargar mensajes</div>';
        }
    },
    
    /**
     * Polling para nuevos mensajes
     */
    async pollNewMessages() {
        if (!this.currentChannel) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=poll&channel_id=${this.currentChannel.id}&after_id=${this.lastMessageId}`);
            const messages = await response.json();
            
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
        
        const time = new Date(message.created_at).toLocaleTimeString('es-ES', {
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
            const response = await fetch(`${this.apiBaseUrl}?action=messages`, {
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
            
            const result = await response.json();
            
            if (result.success) {
                input.value = '';
                input.style.height = 'auto';
                // El mensaje aparecerá via polling
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            alert('Error al enviar mensaje');
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
            const response = await fetch(`${this.apiBaseUrl}?action=channels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.hideNewChannelModal();
                await this.loadChannels();
            }
        } catch (error) {
            console.error('Error al crear canal:', error);
            alert('Error al crear canal');
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
