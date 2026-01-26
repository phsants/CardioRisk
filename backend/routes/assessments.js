import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Assessment } from '../models/Assessment.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Listar avaliações do usuário
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const assessments = await Assessment.findByUserId(
      req.user.id,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(assessments);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

// Obter uma avaliação específica
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findByUserIdAndId(req.user.id, req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    res.json(assessment);
  } catch (error) {
    console.error('Erro ao buscar avaliação:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliação' });
  }
});

// Criar nova avaliação
router.post('/', async (req, res) => {
  try {
    const { assessmentData, riskClassification, patientId } = req.body;

    if (!assessmentData || !riskClassification) {
      return res.status(400).json({ error: 'Dados da avaliação são obrigatórios' });
    }

    const assessment = await Assessment.create({
      userId: req.user.id,
      patientId: patientId || null,
      assessmentData,
      riskClassification,
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  }
});

// Deletar avaliação
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Assessment.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }
    res.json({ message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({ error: 'Erro ao deletar avaliação' });
  }
});

// Estatísticas do usuário
router.get('/stats/summary', async (req, res) => {
  try {
    const assessments = await Assessment.findByUserId(req.user.id, 1000, 0);
    
    const stats = {
      total: assessments.length,
      atTarget: assessments.filter(a => a.ldl_at_target).length,
      notAtTarget: assessments.filter(a => !a.ldl_at_target).length,
      byCategory: {},
    };

    assessments.forEach(a => {
      stats.byCategory[a.risk_category] = (stats.byCategory[a.risk_category] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
