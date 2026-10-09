import { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import OccurrenceForm from './components/OccurrenceForm';
import OccurrenceList from './components/OccurrenceList';
import Dashboard from './components/Dashboard';
import { ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';

function MainApp() {
  const { user, logout } = useContext(AuthContext);
  const [reloadKey, setReloadKey] = useState(0);

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-slate-900">Resolve Aí</h1>
              <span className="text-[10px] text-slate-400 font-medium">Plataforma de Gestão</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">
                <strong>{user.name}</strong> <span className="text-blue-600">({user.role})</span>
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {user.role === 'GESTOR' && <Dashboard key={reloadKey} />}
        {user.role === 'SOLICITANTE' && (
          <OccurrenceForm onOccurrenceCreated={() => setReloadKey((prev) => prev + 1)} />
        )}
        <OccurrenceList reloadKey={reloadKey} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}