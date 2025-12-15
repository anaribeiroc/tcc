<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Permitir CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// Obter dados do POST
$data = json_decode(file_get_contents("php://input"), true);

// Se não conseguir ler JSON, tentar form data
if (!$data && $_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = [
        'email' => $_POST['email'] ?? '',
        'senha' => $_POST['senha'] ?? ''
    ];
}

// Verificar se tem dados
if (empty($data['email']) || empty($data['senha'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "E-mail e senha são obrigatórios"
    ]);
    exit();
}

try {
    // Buscar usuário pelo email
    $query = "SELECT id, nome_completo, email, senha, token FROM usuarios WHERE email = :email AND ativo = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data['email']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Usuário não encontrado ou inativo"
        ]);
        exit();
    }
    
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verificar senha (hash: admin123 ou senha123)
    if (!password_verify($data['senha'], $usuario['senha'])) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "Senha incorreta"
        ]);
        exit();
    }
    
    // Gerar token simples
    $token = bin2hex(random_bytes(32));
    
    // Atualizar token no banco
    $updateQuery = "UPDATE usuarios SET token = :token WHERE id = :id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':token', $token);
    $updateStmt->bindParam(':id', $usuario['id']);
    $updateStmt->execute();
    
    // Retornar sucesso
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Login realizado com sucesso",
        "data" => [
            "id" => $usuario['id'],
            "nome" => $usuario['nome_completo'],
            "email" => $usuario['email'],
            "token" => $token
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro no servidor",
        "error" => $e->getMessage()
    ]);
}
?>