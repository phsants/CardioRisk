import pool from '../config/database.js';

export class Assessment {
  static async create({ userId, patientId, assessmentData, riskClassification }) {
    const result = await pool.query(
      `INSERT INTO assessments (
        user_id, patient_id, assessment_data, risk_category,
        risk_percentage_10y, risk_score, ldl_current, ldl_target, ldl_at_target
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        patientId || null,
        JSON.stringify(assessmentData),
        riskClassification.category,
        riskClassification.risk_percentage_10y || null,
        riskClassification.risk_score || null,
        assessmentData.lipids?.ldl_c || null,
        riskClassification.ldl_target || null,
        (assessmentData.lipids?.ldl_c || 0) <= (riskClassification.ldl_target || Infinity)
      ]
    );

    const assessment = result.rows[0];
    assessment.assessment_data = JSON.parse(assessment.assessment_data);
    return assessment;
  }

  static async findByUserId(userId, limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM assessments 
       WHERE user_id = $1 
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map(row => ({
      ...row,
      assessment_data: typeof row.assessment_data === 'string' 
        ? JSON.parse(row.assessment_data) 
        : row.assessment_data
    }));
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM assessments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const assessment = result.rows[0];
    assessment.assessment_data = typeof assessment.assessment_data === 'string'
      ? JSON.parse(assessment.assessment_data)
      : assessment.assessment_data;
    return assessment;
  }

  static async findByUserIdAndId(userId, id) {
    const result = await pool.query(
      'SELECT * FROM assessments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) return null;

    const assessment = result.rows[0];
    assessment.assessment_data = typeof assessment.assessment_data === 'string'
      ? JSON.parse(assessment.assessment_data)
      : assessment.assessment_data;
    return assessment;
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM assessments WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0];
  }

  static async countByUserId(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM assessments WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}
