import pool from '../config/database.js';

export class Patient {
  static async create({ userId, name, age, sex, ...otherData }) {
    const result = await pool.query(
      `INSERT INTO patients (user_id, name, age, sex)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, name, age, sex]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM patients WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.age !== undefined) {
      fields.push(`age = $${paramCount++}`);
      values.push(updates.age);
    }
    if (updates.sex !== undefined) {
      fields.push(`sex = $${paramCount++}`);
      values.push(updates.sex);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE patients 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0];
  }
}
