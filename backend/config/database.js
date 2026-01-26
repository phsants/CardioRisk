import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'easypanel.usegroup.com.br',
  port: parseInt(process.env.DB_PORT || '5434'),
  user: process.env.DB_USER || 'admrisk',
  password: process.env.DB_PASS || 'risk2026',
  database: process.env.DB_NAME || 'cardiorisk',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco:', err);
});

// Função para inicializar tabelas
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Criar tabelas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        age INTEGER,
        sex VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
        assessment_data JSONB NOT NULL,
        risk_category VARCHAR(50) NOT NULL,
        risk_percentage_10y REAL,
        risk_score INTEGER,
        ldl_current REAL,
        ldl_target REAL,
        ldl_at_target BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);
    `);

    await client.query('COMMIT');
    console.log('✅ Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
