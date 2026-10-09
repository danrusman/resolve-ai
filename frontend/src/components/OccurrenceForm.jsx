import { useState } from 'react';
import { api } from '../services/api';
import { PlusCircle, Image as ImageIcon, MapPin, Tag, AlignLeft, CheckCircle2, Upload, X } from 'lucide-react';

export default function OccurrenceForm({ onOccurrenceCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Iluminação',
    location: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    'Iluminação', 'Equipamentos', 'Acessibilidade', 'Limpeza', 
    'Vazamento', 'Segurança', 'Manutenção', 'Outros'
  ];

  // Converter o ficheiro do PC para Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api('/occurrences', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setFormData({ title: '', description: '', category: 'Iluminação', location: '', imageUrl: '' });
      setTimeout(() => setSuccess(false), 4000);
      if (onOccurrenceCreated) onOccurrenceCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Nova Ocorrência</h3>
          <p className="text-xs text-slate-500">Registe o problema com detalhes para encaminhamento rápido</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-lg mb-6 text-sm flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Ocorrência registada com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Título da Solicitação</label>
          <input
            type="text"
            required
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
            placeholder="Ex: Lâmpada a piscar no corredor principal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Categoria
            </label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Localização
            </label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              placeholder="Ex: Bloco B, Vaga 12"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400" /> Descrição
          </label>
          <textarea
            required
            rows="3"
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
            placeholder="Descreva a ocorrência em detalhe..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Caixas de Anexo de Imagem do PC */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Imagem da Anexo (Opcional)
          </label>

          {!formData.imageUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-xs text-slate-600 font-medium">
                  <span className="font-semibold text-blue-600">Clique para selecionar</span> uma imagem do computador
                </p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG ou JPEG</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          ) : (
            <div className="relative w-full p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={formData.imageUrl}
                  alt="Anexo"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Imagem selecionada</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Pronta para envio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Remover imagem"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? 'A submeter...' : 'Submeter Ocorrência'}
        </button>
      </form>
    </div>
  );
}