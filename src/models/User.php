<?php
/**
 * SlackwareAlbert - User Model
 * Gestiona operaciones de usuarios
 */

namespace SlackwareAlbert\Models;

use SlackwareAlbert\Config\Database;

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Obtiene usuarios ordenados por nombre
     * @return array
     */
    public function getAll() {
        $stmt = $this->db->query("SELECT * FROM users ORDER BY username ASC");
        return $stmt->fetchAll();
    }

    /**
     * Crea un nuevo usuario
     * @param string $username
     * @return int
     */
    public function create($username) {
        $username = trim($username);

        if ($username === '') {
            throw new \InvalidArgumentException('El nombre de usuario no puede estar vacío');
        }

        if (strlen($username) > 50) {
            throw new \InvalidArgumentException('El nombre de usuario no debe superar 50 caracteres');
        }

        $this->db->query(
            "INSERT INTO users (username) VALUES (?)",
            [$username]
        );

        return (int)$this->db->getConnection()->lastInsertId();
    }
}
