<?php
/**
 * SlackwareAlbert - Message Model
 * Gestiona operaciones CRUD de mensajes
 */

namespace SlackwareAlbert\Models;

use SlackwareAlbert\Config\Database;

class Message {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Obtiene mensajes de un canal con paginación
     * @param int $channelId ID del canal
     * @param int $limit Límite de mensajes
     * @param int $offset Offset para paginación
     * @return array Lista de mensajes
     */
    public function getByChannel($channelId, $limit = 50, $offset = 0) {
        $stmt = $this->db->query(
            "SELECT * FROM messages WHERE channel_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [$channelId, $limit, $offset]
        );
        return array_reverse($stmt->fetchAll());
    }
    
    /**
     * Crea un nuevo mensaje
     * @param int $channelId ID del canal
     * @param string $username Nombre de usuario
     * @param string $message Contenido del mensaje
     * @return int ID del mensaje creado
     */
    public function create($channelId, $username, $message) {
        $username = trim($username);
        $message = trim($message);
        
        if (empty($username)) {
            throw new \InvalidArgumentException('El nombre de usuario no puede estar vacío');
        }
        
        if (empty($message)) {
            throw new \InvalidArgumentException('El mensaje no puede estar vacío');
        }
        
        $stmt = $this->db->query(
            "INSERT INTO messages (channel_id, username, message) VALUES (?, ?, ?)",
            [$channelId, $username, $message]
        );
        
        return $this->db->getConnection()->lastInsertId();
    }
    
    /**
     * Obtiene los últimos mensajes después de un ID específico (para polling)
     * @param int $channelId ID del canal
     * @param int $afterId ID del último mensaje recibido
     * @return array Lista de mensajes nuevos
     */
    public function getAfter($channelId, $afterId) {
        $stmt = $this->db->query(
            "SELECT * FROM messages WHERE channel_id = ? AND id > ? ORDER BY created_at ASC",
            [$channelId, $afterId]
        );
        return $stmt->fetchAll();
    }
    
    /**
     * Elimina un mensaje
     * @param int $id ID del mensaje
     * @return bool true si se eliminó correctamente
     */
    public function delete($id) {
        $stmt = $this->db->query("DELETE FROM messages WHERE id = ?", [$id]);
        return $stmt->rowCount() > 0;
    }
}
