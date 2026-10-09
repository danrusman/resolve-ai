import { useEffect, useState, useContext } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Star, MessageSquare, History, User, MapPin, Tag, X, CheckCircle2, AlertCircle, ShieldAlert, UserCheck, Wrench } from 'lucide-react';

export default function OccurrenceList({ reloadKey }) {
  const { user } = useContext(AuthContext);
  const [occurrences, setOccurrences] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIA');
  const [assignedTo, setAssignedTo] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [observation, setObservation] = useState('');
  
  const [commentText, setCommentText] = useState('');
  const [selectedRating, setSelectedRating] = useState('5');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalSuccess, setEvalSuccess] = useState(false);

  const categories = [
    'Iluminação', 'Equipamentos', 'Acessibilidade', 'Limpeza', 
    'Vazamento', 'Segurança', 'Manutenção', 'Outros'
  ];

  const isFinalized = ['RESOLVIDA', 'CANCELADA'].includes(selectedOccurrence?.status);

  useEffect(() => {
    loadOccurrences();
  }, [filterStatus, filterCategory, filterPriority, reloadKey]);

  useEffect(() => {
    if (selectedOccurrence) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedOccurrence]);

  const loadOccurrences = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);
      if (filterPriority) params.append('priority', filterPriority);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await api(`/occurrences${queryString}`);
      setOccurrences(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      ABERTA: 'Aberta',
      EM_ANALISE: 'Em Análise',
      EM_ATENDIMENTO: 'Em Atendimento',
      RESOLVIDA: 'Resolvida',
      CANCELADA: 'Cancelada',
    };
    return statusMap[status] || status;
  };

  const openDetails = async (occ) => {
    setSelectedOccurrence(occ);
    setEvalSuccess(false);
    try {
      const data = await api(`/occurrences/${occ._id}`);
      const o = data.occurrence;
      setSelectedOccurrence(o);
      setHistory(data.history);
      
      // Inicializar campos do Gestor com os valores atuais da ocorrência
      setNewStatus(o.status || 'ABERTA');
      setNewPriority(o.priority || 'MEDIA');
      setAssignedTo(o.assignedTo || '');
      setSolutionDescription(o.solutionDescription || '');
      setObservation('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateByManager = async () => {
    try {
      await api(`/occurrences/${selectedOccurrence._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority || undefined,
          // Envia null se assignedTo for string vazia ou se o utilizador não selecionou ninguém
          assignedTo: assignedTo && assignedTo.trim() !== '' ? assignedTo : null,
          solutionDescription: solutionDescription || '',
          observation: observation || '',
        }),
      });

      setObservation('');
      openDetails(selectedOccurrence);
      loadOccurrences();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api(`/occurrences/${selectedOccurrence._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText('');
      openDetails(selectedOccurrence);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEvaluate = async () => {
    try {
      await api(`/occurrences/${selectedOccurrence._id}/evaluate`, {
        method: 'PATCH',
        body: JSON.stringify({
          rating: Number(selectedRating),
          feedback: evalFeedback,
        }),
      });
      setEvalSuccess(true);
      openDetails(selectedOccurrence);
      loadOccurrences();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICA': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ALTA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIA': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
      {/* Cabeçalho e Filtros Avançados */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {user.role === 'GESTOR' ? 'Painel de Ocorrências' : 'Minhas Ocorrências'}
          </h3>
          <p className="text-xs text-slate-500">
            Acompanhe o andamento, prioridades e o histórico das solicitações
          </p>
        </div>

        {/* Filtros por Status, Categoria e Prioridade */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="ABERTA">Aberta</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="EM_ATENDIMENTO">Em Atendimento</option>
            <option value="RESOLVIDA">Resolvida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">Todas Prioridades</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
        </div>
      </div>

      {/* Lista de Cartões de Ocorrência */}
      <div className="space-y-3">
        {occurrences.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Nenhuma ocorrência encontrada.
          </div>
        ) : (
          occurrences.map((occ) => (
            <div
              key={occ._id}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">{occ.title}</span>
                  <span className="text-[11px] font-medium bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-500" /> {occ.category}
                  </span>
                  {occ.priority && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(occ.priority)}`}>
                      {occ.priority}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{occ.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {occ.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> Solicitante: {occ.createdBy?.name || 'Anônimo'}
                  </span>
                  {occ.assignedTo && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <UserCheck className="w-3 h-3 text-blue-500" /> Responsável pela correção: {occ.assignedTo}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 uppercase">
                  {occ.status}
                </span>
                <button
                  onClick={() => openDetails(occ)}
                  className="text-xs bg-slate-900 hover:bg-black text-white font-medium px-3.5 py-1.5 rounded-lg transition-all shadow-xs"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Completo (Gestão, Histórico e Comentários) */}
      {selectedOccurrence && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-6">
            
            {/* Cabeçalho Modal */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedOccurrence.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">Status atual:</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedOccurrence.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOccurrence(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem do Anexo */}
            {selectedOccurrence.imageUrl && (
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                <img
                  src={selectedOccurrence.imageUrl}
                  alt="Anexo da Ocorrência"
                  className="max-h-60 rounded-lg mx-auto object-contain"
                />
              </div>
            )}

          {/* PAINEL COMPLETO DO GESTOR */}
            {user.role === 'GESTOR' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    <span>Painel de Administração e Gestão</span>
                  </div>
                  {isFinalized && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Ocorrência Finalizada (Modo Leitura)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                    <select
                      disabled={isFinalized}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="ABERTA">Aberta</option>
                      <option value="EM_ANALISE">Em Análise</option>
                      <option value="EM_ATENDIMENTO">Em Atendimento</option>
                      <option value="RESOLVIDA">Resolvida</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prioridade</label>
                    <select
                      disabled={isFinalized}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                    >
                      <option value="BAIXA">BAIXA</option>
                      <option value="MEDIA">MÉDIA</option>
                      <option value="ALTA">ALTA</option>
                      <option value="CRITICA">CRÍTICA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsável</label>
                    <input
                      type="text"
                      disabled={isFinalized}
                      placeholder="Ex: T.I. / Carlos"
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    />
                  </div>
                </div>

                {(newStatus === 'RESOLVIDA' || selectedOccurrence?.status === 'RESOLVIDA') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" /> Descrição da Solução Aplicada
                    </label>
                    <textarea
                      rows="2"
                      disabled={isFinalized}
                      placeholder="Descreva a solução técnica ou ação corretiva adotada..."
                      className="w-full border border-emerald-200 rounded-lg p-2 text-xs text-slate-800 bg-emerald-50/50 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-200 disabled:cursor-not-allowed"
                      value={solutionDescription}
                      onChange={(e) => setSolutionDescription(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    disabled={isFinalized}
                    placeholder="Observação da alteração (opcional)..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                  />
                </div>

                {!isFinalized && (
                  <button
                    onClick={handleUpdateByManager}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 rounded-lg transition shadow-xs"
                  >
                    Salvar Atualizações da Gestão
                  </button>
                )}
              </div>
            )}

            {/* Solução Apresentada (Para o Solicitante visualizar) */}
            {selectedOccurrence.solutionDescription && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-600" /> Solução Registrada pelo Gestor:
                </p>
                <p>{selectedOccurrence.solutionDescription}</p>
              </div>
            )}

            {/* Bloco de Avaliação da Resolução (Solicitante) */}
            {selectedOccurrence.status === 'RESOLVIDA' && user.role === 'SOLICITANTE' && (
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>Avaliar Resolução do Atendimento</span>
                </div>

                {selectedOccurrence.evaluation?.rating ? (
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs space-y-1">
                    <p className="font-semibold text-emerald-800">
                      Sua Nota: {selectedOccurrence.evaluation.rating} / 5 ⭐
                    </p>
                    {selectedOccurrence.evaluation.feedback && (
                      <p className="text-slate-600 italic">"{selectedOccurrence.evaluation.feedback}"</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {evalSuccess && (
                      <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Avaliação registrada com sucesso!
                      </p>
                    )}
                    <div className="flex gap-2">
                      <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="border border-emerald-300 rounded-lg p-2 text-xs bg-white text-slate-800"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                        <option value="4">⭐⭐⭐⭐ (Bom)</option>
                        <option value="3">⭐⭐⭐ (Regular)</option>
                        <option value="2">⭐⭐ (Ruim)</option>
                        <option value="1">⭐ (Péssimo)</option>
                      </select>
                      <button
                        onClick={handleEvaluate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
                      >
                        Enviar Avaliação
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Deixe um comentário sobre a resolução (opcional)..."
                      className="w-full border border-emerald-200 rounded-lg p-2 text-xs text-slate-800 placeholder:text-slate-400 bg-white"
                      value={evalFeedback}
                      onChange={(e) => setEvalFeedback(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {(selectedOccurrence.evaluation?.rating || selectedOccurrence.rating?.score) && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 my-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> 
                    Avaliação do Solicitante
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentRating = selectedOccurrence.evaluation?.rating || selectedOccurrence.rating?.score;
                      return (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= currentRating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      );
                    })}
                    <span className="text-xs font-bold text-amber-900 ml-1">
                      {(selectedOccurrence.evaluation?.rating || selectedOccurrence.rating?.score)}/5
                    </span>
                  </div>
                </div>

                {(selectedOccurrence.evaluation?.feedback || selectedOccurrence.rating?.comment) && (
                  <p className="text-xs text-amber-800 italic bg-white/80 p-2.5 rounded-lg border border-amber-100 mt-2">
                    "{selectedOccurrence.evaluation?.feedback || selectedOccurrence.rating?.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Timeline do Histórico */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" /> Histórico de Alterações
              </h4>
              <div className="space-y-3 border-l-2 border-blue-500 pl-4 ml-1">
                {history.map((h) => (
                  <div key={h._id} className="text-xs space-y-0.5">
                    <p className="font-semibold text-slate-800">
                      De <span className="text-slate-500">{formatStatus(h.previousStatus)}</span> ➔ Para <span className="text-blue-600">{formatStatus(h.newStatus)}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Por: {h.changedBy?.name || 'Sistema'} | {new Date(h.createdAt).toLocaleString('pt-BR')}
                    </p>
                    {h.observation && (
                      <p className="italic text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
                        "{h.observation}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comentários */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" /> Comentários
              </h4>
              <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
                {selectedOccurrence.comments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum comentário ainda.</p>
                ) : (
                  selectedOccurrence.comments?.map((c, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
                      <p className="font-bold text-slate-700 mb-0.5">{c.author?.name || 'Usuário'}:</p>
                      <p className="text-slate-600">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva um comentário..."
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
                >
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}