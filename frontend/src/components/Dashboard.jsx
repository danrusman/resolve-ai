import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Layers, AlertTriangle, Clock, Activity, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await api('/dashboard/metrics');
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!metrics) return null;

  const cards = [
    { label: 'Total', value: metrics.total, icon: Layers, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
    { label: 'Abertas', value: metrics.byStatus.abertas, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Em Análise', value: metrics.byStatus.emAnalise, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { label: 'Atendimento', value: metrics.byStatus.emAtendimento, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    { label: 'Resolvidas', value: metrics.byStatus.resolvidas, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Canceladas', value: metrics.byStatus.canceladas, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`bg-white p-4 rounded-xl shadow-sm border ${c.border} transition-all hover:translate-y-[-2px]`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{c.label}</span>
              <div className={`p-1.5 rounded-md ${c.bg} ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        );
      })}
    </div>
  );
}