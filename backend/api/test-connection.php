<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $host = "localhost";
    $dbname = "abraco_solidario";
    $username = "root";
    $password = "";
    
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo json_encode([
        "status" => "success",
        "message" => "Conexão com MySQL estabelecida com sucesso!",
        "database" => $dbname
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Erro na conexão com MySQL",
        "error" => $e->getMessage(),
        "dica" => "Verifique se: 1) MySQL está rodando, 2) Banco 'abraco_solidario' existe, 3) Usuário/senha estão corretos"
    ]);
}
?>