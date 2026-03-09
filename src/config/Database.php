<?php
/**
 * SlackwareAlbert - Backend Database Manager
 * Conexión SQLite simple sin dependencias externas
 */

namespace SlackwareAlbert\Config;

class Database {
    private static $instance = null;
    private $pdo;
    private $dbPath;
    
    private function __construct() {
        $this->dbPath = __DIR__ . '/../../data/slackware.db';
        $this->connect();
        $this->initTables();
    }
    
    private function connect() {
        try {
            $dir = dirname($this->dbPath);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            $this->pdo = new \PDO('sqlite:' . $this->dbPath);
            $this->pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }
    
    private function initTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_messages_channel_created ON messages(channel_id, created_at DESC);
        ";
        
        $this->pdo->exec($sql);
        
        // Canal general por defecto
        $stmt = $this->pdo->prepare("INSERT OR IGNORE INTO channels (name, description) VALUES (?, ?)");
        $stmt->execute(['general', 'Canal general para toda la comunidad']);

        $stmt = $this->pdo->prepare("INSERT OR IGNORE INTO users (username) VALUES (?)");
        $stmt->execute(['Albert']);
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (\PDOException $e) {
            error_log('Query failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
