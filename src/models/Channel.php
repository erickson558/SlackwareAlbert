<?php
/**
 * SlackwareAlbert - Channel Model
 * Gestiona operaciones CRUD de canales
 */

namespace SlackwareAlbert\Models;

use SlackwareAlbert\Config\Database;

class Channel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Obtiene todos los canales
     * @return array Lista de canales
     */
    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM channels ORDER BY name ASC");
        return $stmt->fetchAll();
    }
    
    /**
     * Obtiene un canal por ID
     * @param int $id ID del canal
     * @return array|false Canal o false si no existe
     */
    public function getById($id) {
        $stmt = $this->db->query("SELECT * FROM channels WHERE id = ?", [$id]);
        return $stmt->fetch();
    }
    
    /**
     * Crea un nuevo canal
     * @param string $name Nombre del canal
     * @param string $description Descripción del canal
     * @return int ID del canal creado
     */
    public function create($name, $description = '') {
        $name = trim($name);
        if (empty($name)) {
            throw new \InvalidArgumentException('El nombre del canal no puede estar vacío');
        }
        
        $stmt = $this->db->query(
            "INSERT INTO channels (name, description) VALUES (?, ?)",
            [$name, $description]
        );
        
        return $this->db->getConnection()->lastInsertId();
    }
    
    /**
     * Actualiza un canal existente
     * @param int $id ID del canal
     * @param string $name Nuevo nombre
     * @param string $description Nueva descripción
     * @return bool true si se actualizó correctamente
     */
    public function update($id, $name, $description) {
        $stmt = $this->db->query(
            "UPDATE channels SET name = ?, description = ? WHERE id = ?",
            [$name, $description, $id]
        );
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Elimina un canal
     * @param int $id ID del canal
     * @return bool true si se eliminó correctamente
     */
    public function delete($id) {
        $stmt = $this->db->query("DELETE FROM channels WHERE id = ?", [$id]);
        return $stmt->rowCount() > 0;
    }
}
