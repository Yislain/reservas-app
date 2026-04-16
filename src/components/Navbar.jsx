import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ session, role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-white tracking-tighter hover:opacity-80 transition">
          <span className="text-blue-500">Cita</span>Fácil
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-white transition">Nueva Cita</Link>

          {session ? (
            <>
              {role === 'admin' ? (
                <Link to="/admin" className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-500 transition shadow-lg shadow-blue-900/20">Panel Admin</Link>
              ) : (
                <Link to="/mis-citas" className="px-5 py-2.5 text-sm font-bold bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition">Mis Citas</Link>
              )}
              <button onClick={handleLogout} className="text-sm font-medium text-red-400 hover:text-red-300 transition">Salir</button>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:bg-zinc-200 transition">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
}