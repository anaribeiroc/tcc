<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Listar doações
        $query = "SELECT d.*, u.nome_completo as doador_nome, i.nome as instituicao_nome 
                  FROM doacoes d 
                  LEFT JOIN usuarios u ON d.usuario_id = u.id 
                  LEFT JOIN instituicoes i ON d.instituicao_id = i.id 
                  WHERE 1=1";
        
        $params = [];
        
        if (isset($_GET['usuario_id'])) {
            $query .= " AND d.usuario_id = :usuario_id";
            $params[':usuario_id'] = $_GET['usuario_id'];
        }
        
        if (isset($_GET['instituicao_id'])) {
            $query .= " AND d.instituicao_id = :instituicao_id";
            $params[':instituicao_id'] = $_GET['instituicao_id'];
        }
        
        if (isset($_GET['status'])) {
            $query .= " AND d.status = :status";
            $params[':status'] = $_GET['status'];
        }
        
        $query .= " ORDER BY d.data_doacao DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $doacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "status" => "success",
            "data" => $doacoes
        ]);
        break;
        
    case 'POST':
        // Criar nova doação
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validações básicas
        if (empty($data['instituicao_id']) || empty($data['tipo_doacao'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Instituição e tipo de doação são obrigatórios"
            ]);
            exit();
        }
        
        // Se for doação monetária, valor é obrigatório
        if ($data['tipo_doacao'] === 'dinheiro' && empty($data['valor'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Para doações em dinheiro, o valor é obrigatório"
            ]);
            exit();
        }
        
        // === VERIFICAÇÃO DE DUPLICIDADE ADICIONADA AQUI ===
        if (!empty($data['usuario_id'])) {
            // Verificar se já existe uma doação similar nos últimos 5 minutos
            $timestampLimite = date('Y-m-d H:i:s', strtotime('-5 minutes'));
            $sqlVerifica = "SELECT id FROM doacoes 
                          WHERE usuario_id = :usuario_id 
                          AND instituicao_id = :instituicao_id 
                          AND tipo_doacao = :tipo_doacao 
                          AND data_doacao > :timestamp_limite 
                          LIMIT 1";
            
            $stmtVerifica = $db->prepare($sqlVerifica);
            $stmtVerifica->bindParam(':usuario_id', $data['usuario_id']);
            $stmtVerifica->bindParam(':instituicao_id', $data['instituicao_id']);
            $stmtVerifica->bindParam(':tipo_doacao', $data['tipo_doacao']);
            $stmtVerifica->bindParam(':timestamp_limite', $timestampLimite);
            $stmtVerifica->execute();
            
            if ($stmtVerifica->rowCount() > 0) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Doação já registrada recentemente. Aguarde alguns minutos."
                ]);
                exit();
            }
        }
        // === FIM DA VERIFICAÇÃO DE DUPLICIDADE ===
        
        $query = "INSERT INTO doacoes (usuario_id, instituicao_id, tipo_doacao, valor, descricao, motivacao) 
                  VALUES (:usuario_id, :instituicao_id, :tipo_doacao, :valor, :descricao, :motivacao)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':usuario_id', $data['usuario_id']);
        $stmt->bindParam(':instituicao_id', $data['instituicao_id']);
        $stmt->bindParam(':tipo_doacao', $data['tipo_doacao']);
        $stmt->bindParam(':valor', $data['valor']);
        $stmt->bindParam(':descricao', $data['descricao']);
        $stmt->bindParam(':motivacao', $data['motivacao']);
        
        if ($stmt->execute()) {
            $doacao_id = $db->lastInsertId();
            
            // Buscar detalhes da doação criada
            $queryDetalhes = "SELECT d.*, i.nome as instituicao_nome FROM doacoes d 
                             JOIN instituicoes i ON d.instituicao_id = i.id 
                             WHERE d.id = :id";
            $stmtDetalhes = $db->prepare($queryDetalhes);
            $stmtDetalhes->bindParam(':id', $doacao_id);
            $stmtDetalhes->execute();
            $doacaoDetalhes = $stmtDetalhes->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "status" => "success",
                "message" => "Doação registrada com sucesso",
                "data" => $doacaoDetalhes
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao registrar doação"
            ]);
        }
        break;
        
    case 'PUT':
        // Atualizar status da doação
        if (!isset($_GET['id'])) {
            echo json_encode([
                "status" => "error",
                "message" => "ID da doação não especificado"
            ]);
            exit();
        }
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!in_array($data['status'], ['pendente', 'confirmada', 'entregue'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Status inválido"
            ]);
            exit();
        }
        
        $query = "UPDATE doacoes SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->bindParam(':status', $data['status']);
        
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "Status da doação atualizado"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Erro ao atualizar status"
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