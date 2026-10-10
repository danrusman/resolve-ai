import express from 'express';
import Occurrence from '../models/Occurrence.js';
import History from '../models/History.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// 1. POST /api/occurrences - Criar Ocorrência (Qualquer usuário autenticado)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location, imageUrl } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Título, descrição, categoria e localização são obrigatórios.',
      });
    }

    const occurrence = new Occurrence({
      title,
      description,
      category,
      location,
      imageUrl,
      createdBy: req.user.id,
    });

    await occurrence.save();

    // Registra o histórico inicial de criação
    await History.create({
      occurrenceId: occurrence._id,
      previousStatus: 'NOVA',
      newStatus: 'ABERTA',
      changedBy: req.user.id,
      observation: 'Ocorrência registrada no sistema.',
    });

    res.status(201).json({
      message: 'Ocorrência cadastrada com sucesso!',
      occurrence,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar ocorrência.', error: error.message });
  }
});

// 2. GET /api/occurrences - Listar Ocorrências (Com Filtros)
// Solicitante vê as suas e Gestor pode ver todas ou filtrar.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, status, priority } = req.query;
    let filter = {};

    // Se não for GESTOR, filtra apenas as criadas pelo próprio usuário
    if (req.user.role !== 'GESTOR') {
      filter.createdBy = req.user.id;
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const occurrences = await Occurrence.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(occurrences);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ocorrências.', error: error.message });
  }
});

// 3. GET /api/occurrences/:id - Detalhar Ocorrência + Histórico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const occurrence = await Occurrence.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name role');

    if (!occurrence) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    }

    // Busca todo o histórico de mudanças desta ocorrência
    const history = await History.find({ occurrenceId: occurrence._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: 1 });

    res.json({ occurrence, history });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar detalhes.', error: error.message });
  }
});

// 4. PATCH /api/occurrences/:id/status - Alterar Status (Exclusivo GESTOR)
router.patch('/:id/status', authenticateToken, authorizeRoles('GESTOR'), async (req, res) => {
  try {
    const { status, observation, assignedTo, priority } = req.body;
    const validStatuses = ['ABERTA', 'EM_ANALISE', 'EM_ATENDIMENTO', 'RESOLVIDA', 'CANCELADA'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status informado é inválido.' });
    }

    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    }

    const previousStatus = occurrence.status;

    if (status) occurrence.status = status;
    if (assignedTo) occurrence.assignedTo = assignedTo;
    if (priority) occurrence.priority = priority;

    await occurrence.save();

    // Registra alteração no Histórico se houver mudança de status
    if (status && status !== previousStatus) {
      await History.create({
        occurrenceId: occurrence._id,
        previousStatus,
        newStatus: status,
        changedBy: req.user.id,
        observation: observation || `Status alterado de ${previousStatus} para ${status}`,
      });
    }

    res.json({ message: 'Ocorrência atualizada com sucesso!', occurrence });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status.', error: error.message });
  }
});

// 5. POST /api/occurrences/:id/comments - Adicionar Comentário
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'O texto do comentário é obrigatório.' });
    }

    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    }

    occurrence.comments.push({
      author: req.user.id,
      text,
    });

    await occurrence.save();

    res.status(201).json({ message: 'Comentário adicionado!', occurrence });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar comentário.', error: error.message });
  }
});

// 6. POST /api/occurrences/:id/rate - Avaliar Resolução (Apenas Solicitante)
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Forneça uma nota válida entre 1 e 5.' });
    }

    const occurrence = await Occurrence.findById(req.params.id);
    if (!occurrence) {
      return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    }

    if (occurrence.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Apenas o criador da ocorrência pode avaliá-la.' });
    }

    if (occurrence.status !== 'RESOLVIDA') {
      return res.status(400).json({ message: 'Apenas ocorrências RESOLVIDAS podem ser avaliadas.' });
    }

    occurrence.rating = { score, comment };
    await occurrence.save();

    res.json({ message: 'Avaliação registrada com sucesso!', occurrence });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao avaliar ocorrência.', error: error.message });
  }
});

// 7. Rota para o solicitante avaliar a resolução
router.patch('/:id/evaluate', authenticateToken, async (req, res) => {  
  try {
    const { rating, feedback } = req.body;
    const occurrence = await Occurrence.findById(req.params.id);

    if (!occurrence) return res.status(404).json({ message: 'Ocorrência não encontrada.' });
    if (occurrence.status !== 'RESOLVIDA') {
      return res.status(400).json({ message: 'Apenas ocorrências resolvidas podem ser avaliadas.' });
    }

    occurrence.evaluation = { rating, feedback, evaluatedAt: new Date() };
    await occurrence.save();

    res.json({ message: 'Avaliação registada com sucesso!', occurrence });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. Rota para o gestor atualizar o status da ocorrência
router.patch('/:id/status', authenticateToken, authorizeRoles('GESTOR'), async (req, res) => {  
  try {
    if (req.user.role !== 'GESTOR') {
      return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem realizar esta ação.' });
    }

    let { status, observation, priority, assignedTo, solutionDescription } = req.body;

    if (assignedTo === '' || assignedTo === undefined) {
      assignedTo = null;
    }

    const occurrence = await Occurrence.findById(req.params.id);

    if (!occurrence) return res.status(404).json({ message: 'Ocorrência não encontrada.' });

    const previousStatus = occurrence.status;

    if (status) occurrence.status = status;
    if (priority) occurrence.priority = priority;
    
    // Atualiza o responsável (aceitando null se não for atribuído a ninguém)
    occurrence.assignedTo = assignedTo;
    
    if (solutionDescription) occurrence.solutionDescription = solutionDescription;

    await occurrence.save();

    // Registra no histórico auditável
    await OccurrenceHistory.create({
      occurrence: occurrence._id,
      previousStatus,
      newStatus: occurrence.status,
      changedBy: req.user._id || req.user.id,
      observation: observation || solutionDescription || 'Atualização realizada pelo gestor',
    });

    res.json({ message: 'Ocorrência atualizada com sucesso!', occurrence });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;