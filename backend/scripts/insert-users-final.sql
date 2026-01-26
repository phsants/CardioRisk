-- Script SQL para inserir usuários no banco de dados
-- Execute este script no seu banco PostgreSQL

-- Usuário 1: Administrador
-- Email: admin@cardiorisk.com
-- Senha: admin123
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'admin@cardiorisk.com',
  '$2a$10$Pv4DWcm0/oMU.wy2J7Z7uu7fNPFM1zZw98cMR40Eyh.kJUWZt267m',
  'Administrador',
  'admin'
);

-- Usuário 2: Médico
-- Email: medico@cardiorisk.com
-- Senha: medico123
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'medico@cardiorisk.com',
  '$2a$10$u58T/4b499tcw0QklVcsuuOPfpmBQjVgosl6LrWa3rLQCpwkUxIpK',
  'Dr. Médico',
  'user'
);
