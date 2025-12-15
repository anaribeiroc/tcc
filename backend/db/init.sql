-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS abraco_solidario;
USE abraco_solidario;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    cnpj VARCHAR(18),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de instituições
CREATE TABLE IF NOT EXISTS instituicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    imagem VARCHAR(255),
    endereco TEXT,
    horario_funcionamento VARCHAR(100),
    itens_necessarios TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de doações
CREATE TABLE IF NOT EXISTS doacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    instituicao_id INT,
    tipo_doacao VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2),
    descricao TEXT,
    motivacao TEXT,
    status ENUM('pendente', 'confirmada', 'entregue') DEFAULT 'pendente',
    data_doacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (instituicao_id) REFERENCES instituicoes(id) ON DELETE SET NULL
);

-- Inserir dados das instituições
INSERT INTO instituicoes (nome, descricao, imagem, endereco, horario_funcionamento, itens_necessarios) VALUES
('Patas Felizes', 'Refúgio para animais abandonados e vítimas de maus-tratos.', 'cachorro.png', 'Rua dos Animais, 123 - Centro, São Paulo - SP', 'Seg-Sáb: 8h-18h', 'Ração, Medicamentos, Cobertores'),
('Casa de Todos', 'Espaço de reabilitação para quem busca um novo começo com dignidade e apoio.', 'casatodos.png', 'Av. da Solidariedade, 456 - São Paulo - SP', 'Todos os dias: 9h-17h', 'Alimentos, Produtos higiene, Roupas'),
('Recanto da Sabedoria', 'Lar acolhedor para idosos que merecem todo o carinho e respeito.', 'Recanto da Sabedoria.png', 'Travessa da Paz, 789 - São Paulo - SP', 'Seg-Sex: 7h-19h', 'Fraldas, Suplementos, Medicamentos'),
('Sonho Colorido', 'Farol de esperança para crianças em comunidades carentes.', 'sonhocolidido.png', 'Rua Esperança, 101 - São Paulo - SP', 'Seg-Sex: 13h-17h', 'Material escolar, Brinquedos, Roupas'),
('Florescer', 'Espaço de acolhimento e apoio para quem vive em vulnerabilidade.', 'florescer.png', 'Alameda Renovação, 202 - São Paulo - SP', 'Seg-Sex: 10h-16h', 'Cestas básicas, Higiene, Roupas'),
('Brilho do Sol', 'Lar acolhedor onde crianças encontram amor, segurança e esperança.', 'brilhosol.png', 'Praça Criança, 303 - São Paulo - SP', 'Todos os dias: 8h-20h', 'Leite em pó, Fraldas, Roupas bebê');

-- Criar usuário administrador (senha: admin123)
INSERT INTO usuarios (nome_completo, email, senha, data_nascimento) VALUES
('Administrador', 'admin@abracosolidario.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-01-01');