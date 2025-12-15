<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Listar usuários (apenas para admin)
        $query = "SELECT id, nome_completo, email, data_nascimento, cnpj, data_criacao FROM usuarios WHERE ativo = 1";
        
        if (isset($_GET['id'])) {
            $query .= " AND id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $_GET['id']);
        } else {
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "status" => "success",
            "data" => $usuarios
        ]);
        break;
        
    case 'POST':
        // Criar novo usuário
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validações
        if (empty($data['nome_completo']) || empty($data['email']) || empty($data['senha']) || empty($data['data_nascimento'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Todos os campos obrigatórios devem ser preenchidos"
            ]);
            exit();
        }
        
        // Verificar idade
        $dataNascimento = new DateTime($data['data_nascimento']);
        $hoje = new DateTime();
        $idade = $hoje->diff($dataNascimento)->y;
        
        if ($idade < 18) {
            echo json_encode([
                "status" => "error",
                "message" => "É necessário ter 18 anos ou mais para se cadastrar"
            ]);
            exit();
        }
        
        // Verificar se email já existe
        $checkEmail = $db->prepare("SELECT id FROM usuarios WHERE email = :email");
        $checkEmail->bindParam(':email', $data['email']);
        $checkEmail->execute();
        
        if ($checkEmail->rowCount() > 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Este e-mail já está cadastrado"
            ]);
            exit();
        }
        
        // Hash da senha
        $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
        
        // Inserir usuário
        $query = "INSERT INTO usuarios (nome_completo, email, senha, data_nascimento, cnpj) 
                  VALUES (:nome, :email, :senha, :data_nascimento, :cnpj)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $data['nome_completo']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':senha', $senhaHash);
        $stmt->bindParam(':data_nascimento', $data['data_nascimento']);
        $stmt->bindParam(':cnpj', $data['cnpj']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Usuário criado com sucesso",
                "user_id" => $db->lastInsertId()
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao criar usuário"
            ]);
        }
        break;
        
    case 'PUT':
        // Atualizar usuário
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($_GET['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "ID do usuário não especificado"
            ]);
            exit();
        }
        
        $query = "UPDATE usuarios SET nome_completo = :nome, data_nascimento = :data_nascimento, cnpj = :cnpj WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->bindParam(':nome', $data['nome_completo']);
        $stmt->bindParam(':data_nascimento', $data['data_nascimento']);
        $stmt->bindParam(':cnpj', $data['cnpj']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Usuário atualizado com sucesso"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao atualizar usuário"
            ]);
        }
        break;
        
    case 'DELETE':
        // Desativar usuário
        if (!isset($_GET['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "ID do usuário não especificado"
            ]);
            exit();
        }
        
        $query = "UPDATE usuarios SET ativo = 0 WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Usuário desativado com sucesso"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao desativar usuário"
            ]);
        }
        break;
        
    default:
        echo json_encode([
            "status" => "error",
            "message" => "Método não permitido"
        ]);
        break;
}
?>