<?php
/**
 * SlackwareAlbert - API Controller
 * Controlador central de la API REST
 */

namespace SlackwareAlbert\Controllers;

use SlackwareAlbert\Models\Channel;
use SlackwareAlbert\Models\Message;
use SlackwareAlbert\Models\User;

class ApiController {
    private $channel;
    private $message;
    private $user;
    
    public function __construct() {
        $this->channel = new Channel();
        $this->message = new Message();
        $this->user = new User();
    }
    
    /**
     * Enruta las peticiones a los métodos correspondientes
     */
    public function handleRequest() {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        
        try {
            $method = $_SERVER['REQUEST_METHOD'];
            $path = isset($_GET['action']) ? $_GET['action'] : '';
            
            switch ($path) {
                case 'channels':
                    $this->handleChannels($method);
                    break;
                case 'messages':
                    $this->handleMessages($method);
                    break;
                case 'poll':
                    $this->handlePoll();
                    break;
                case 'users':
                    $this->handleUsers($method);
                    break;
                default:
                    $this->sendError('Endpoint no encontrado', 404);
            }
        } catch (\InvalidArgumentException $e) {
            $this->sendError($e->getMessage(), 400);
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
                $this->sendError('Este valor ya existe', 409);
                return;
            }
            $this->sendError('Error de base de datos', 500);
        } catch (\Exception $e) {
            $this->sendError($e->getMessage(), 500);
        }
    }

    /**
     * Gestiona operaciones sobre usuarios
     */
    private function handleUsers($method) {
        switch ($method) {
            case 'GET':
                $this->sendResponse($this->user->getAll());
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $username = isset($data['username']) ? $data['username'] : '';
                $id = $this->user->create($username);
                $this->sendResponse(['id' => $id, 'success' => true], 201);
                break;

            default:
                $this->sendError('Método no permitido', 405);
        }
    }
    
    /**
     * Gestiona operaciones sobre canales
     */
    private function handleChannels($method) {
        switch ($method) {
            case 'GET':
                if (isset($_GET['id'])) {
                    $channel = $this->channel->getById($_GET['id']);
                    $this->sendResponse($channel ? $channel : ['error' => 'Canal no encontrado']);
                } else {
                    $this->sendResponse($this->channel->getAll());
                }
                break;
                
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $name = isset($data['name']) ? $data['name'] : '';
                $description = isset($data['description']) ? $data['description'] : '';
                $id = $this->channel->create($name, $description);
                $this->sendResponse(['id' => $id, 'success' => true], 201);
                break;
                
            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);
                $id = isset($data['id']) ? $data['id'] : 0;
                $name = isset($data['name']) ? $data['name'] : '';
                $description = isset($data['description']) ? $data['description'] : '';
                $success = $this->channel->update($id, $name, $description);
                $this->sendResponse(['success' => $success]);
                break;
                
            case 'DELETE':
                $data = json_decode(file_get_contents('php://input'), true);
                $id = isset($data['id']) ? $data['id'] : 0;
                $success = $this->channel->delete($id);
                $this->sendResponse(['success' => $success]);
                break;
                
            default:
                $this->sendError('Método no permitido', 405);
        }
    }
    
    /**
     * Gestiona operaciones sobre mensajes
     */
    private function handleMessages($method) {
        switch ($method) {
            case 'GET':
                $channelId = isset($_GET['channel_id']) ? (int)$_GET['channel_id'] : 0;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                if ($channelId === 0) {
                    $this->sendError('channel_id es requerido', 400);
                    return;
                }
                
                $messages = $this->message->getByChannel($channelId, $limit, $offset);
                $this->sendResponse($messages);
                break;
                
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $channelId = isset($data['channel_id']) ? (int)$data['channel_id'] : 0;
                $username = isset($data['username']) ? $data['username'] : '';
                $messageText = isset($data['message']) ? $data['message'] : '';
                
                $id = $this->message->create($channelId, $username, $messageText);
                $this->sendResponse(['id' => $id, 'success' => true], 201);
                break;
                
            case 'DELETE':
                $data = json_decode(file_get_contents('php://input'), true);
                $id = isset($data['id']) ? $data['id'] : 0;
                $success = $this->message->delete($id);
                $this->sendResponse(['success' => $success]);
                break;
                
            default:
                $this->sendError('Método no permitido', 405);
        }
    }
    
    /**
     * Polling para obtener nuevos mensajes
     */
    private function handlePoll() {
        $channelId = isset($_GET['channel_id']) ? (int)$_GET['channel_id'] : 0;
        $afterId = isset($_GET['after_id']) ? (int)$_GET['after_id'] : 0;
        
        if ($channelId === 0) {
            $this->sendError('channel_id es requerido', 400);
            return;
        }
        
        $messages = $this->message->getAfter($channelId, $afterId);
        $this->sendResponse($messages);
    }
    
    /**
     * Envía respuesta JSON exitosa
     */
    private function sendResponse($data, $code = 200) {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    /**
     * Envía respuesta JSON de error
     */
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
