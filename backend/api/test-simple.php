<?php
// Script de teste muito simples
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    "status" => "success",
    "message" => "API funcionando!",
    "timestamp" => date('Y-m-d H:i:s'),
    "data" => [
        "endpoints" => [
            "login.php" => "POST {email, senha}",
            "usuarios.php" => "GET, POST, PUT, DELETE",
            "instituicoes.php" => "GET, POST, PUT, DELETE",
            "doacoes.php" => "GET, POST, PUT"
        ]
    ]
]);
?>