-- Script SQL para inserir usuários no banco de dados
-- Execute este script no seu banco PostgreSQL

-- IMPORTANTE: Execute primeiro o script generate-hash.js para gerar os hashes
-- e substitua HASH1 e HASH2 pelos hashes gerados

-- Usuário 1: Administrador
-- Email: admin@cardiorisk.com
-- Senha: admin123
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'admin@cardiorisk.com',
  'HASH1',  -- Substitua pelo hash gerado para 'admin123'
  'Administrador',
  'admin'
);

-- Usuário 2: Médico
-- Email: medico@cardiorisk.com
-- Senha: medico123
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'medico@cardiorisk.com',
  'HASH2',  -- Substitua pelo hash gerado para 'medico123'
  'Dr. Médico',
  'user'
);
