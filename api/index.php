<?php
/**
 * SlackwareAlbert - API Entry Point
 * Endpoint principal de la API REST
 * Version: 1.1.0
 */

// Autoloader simple para las clases
spl_autoload_register(function ($class) {
    $prefix = 'SlackwareAlbert\\';
    $baseDir = __DIR__ . '/../src/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

use SlackwareAlbert\Controllers\ApiController;

// Manejo de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Inicializa el controlador y procesa la petición
$controller = new ApiController();
$controller->handleRequest();
