import bcrypt from 'bcryptjs';

// Gerar hash para senha "admin123"
const hash1 = bcrypt.hashSync('admin123', 10);
console.log('\n=== HAShes Gerados ===\n');
console.log('Hash para admin123:');
console.log(hash1);
console.log('\n---\n');

// Gerar hash para senha "medico123"
const hash2 = bcrypt.hashSync('medico123', 10);
console.log('Hash para medico123:');
console.log(hash2);
console.log('\n=== SQL para inserir no banco ===\n');
console.log(`-- Usuário 1: Administrador
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'admin@cardiorisk.com',
  '${hash1}',
  'Administrador',
  'admin'
);

-- Usuário 2: Médico
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'medico@cardiorisk.com',
  '${hash2}',
  'Dr. Médico',
  'user'
);
`);
