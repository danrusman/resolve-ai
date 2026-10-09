import express from 'express';
import Occurrence from '../models/Occurrence.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/dashboard/metrics - Indicadores do Gestor
router.get('/metrics', authenticateToken, authorizeRoles('GESTOR'), async (req, res) => {
  try {
    const total = await Occurrence.countDocuments();
    const abertas = await Occurrence.countDocuments({ status: 'ABERTA' });
    const emAnalise = await Occurrence.countDocuments({ status: 'EM_ANALISE' });
    const emAtendimento = await Occurrence.countDocuments({ status: 'EM_ATENDIMENTO' });
    const resolvidas = await Occurrence.countDocuments({ status: 'RESOLVIDA' });
    const canceladas = await Occurrence.countDocuments({ status: 'CANCELADA' });

    res.json({
      total,
      byStatus: {
        abertas,
        emAnalise,
        emAtendimento,
        resolvidas,
        canceladas,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar métricas.', error: error.message });
  }
});

export default router;