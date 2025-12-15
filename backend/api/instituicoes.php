<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Listar instituições
        $query = "SELECT * FROM instituicoes WHERE 1=1";
        $params = [];
        
        if (isset($_GET['id'])) {
            $query .= " AND id = :id";
            $params[':id'] = $_GET['id'];
        }
        
        if (isset($_GET['nome'])) {
            $query .= " AND nome LIKE :nome";
            $params[':nome'] = '%' . $_GET['nome'] . '%';
        }
        
        $query .= " ORDER BY nome";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $instituicoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "status" => "success",
            "data" => $instituicoes
        ]);
        break;
        
    case 'POST':
        // Criar nova instituição (apenas admin)
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['nome']) || empty($data['descricao'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Nome e descrição são obrigatórios"
            ]);
            exit();
        }
        
        $query = "INSERT INTO instituicoes (nome, descricao, imagem, endereco, horario_funcionamento, itens_necessarios) 
                  VALUES (:nome, :descricao, :imagem, :endereco, :horario, :itens)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nome', $data['nome']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':imagem', $data['imagem']);
        $stmt->bindParam(':endereco', $data['endereco']);
        $stmt->bindParam(':horario', $data['horario_funcionamento']);
        $stmt->bindParam(':itens', $data['itens_necessarios']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Instituição criada com sucesso",
                "data" => [
                    "id" => $db->lastInsertId(),
                    "nome" => $data['nome']
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao criar instituição"
            ]);
        }
        break;
        
    case 'PUT':
        // Atualizar instituição
        if (!isset($_GET['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "ID da instituição não especificado"
            ]);
            exit();
        }
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE instituicoes SET 
                  nome = :nome,
                  descricao = :descricao,
                  imagem = :imagem,
                  endereco = :endereco,
                  horario_funcionamento = :horario,
                  itens_necessarios = :itens
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->bindParam(':nome', $data['nome']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':imagem', $data['imagem']);
        $stmt->bindParam(':endereco', $data['endereco']);
        $stmt->bindParam(':horario', $data['horario_funcionamento']);
        $stmt->bindParam(':itens', $data['itens_necessarios']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Instituição atualizada com sucesso"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao atualizar instituição"
            ]);
        }
        break;
        
    case 'DELETE':
        // Excluir instituição
        if (!isset($_GET['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "ID da instituição não especificado"
            ]);
            exit();
        }
        
        // Verificar se há doações para esta instituição
        $checkDoacoes = $db->prepare("SELECT COUNT(*) as total FROM doacoes WHERE instituicao_id = :id");
        $checkDoacoes->bindParam(':id', $_GET['id']);
        $checkDoacoes->execute();
        $result = $checkDoacoes->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Não é possível excluir instituição que possui doações registradas"
            ]);
            exit();
        }
        
        $query = "DELETE FROM instituicoes WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Instituição excluída com sucesso"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao excluir instituição"
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