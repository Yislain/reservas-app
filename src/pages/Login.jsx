import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('perfiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/mis-citas');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 mt-20">
      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -z-10"></div>
        
        <h2 className="text-4xl font-black text-white mb-2">Bienvenido</h2>
        <p className="text-zinc-500 mb-8">Ingresa tus credenciales para continuar.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase ml-2">Email</label>
            <input 
              type="email" placeholder="correo@ejemplo.com" required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Contraseña</label>
              {/* --- ENLACE DE RECUPERACIÓN AÑADIDO --- */}
              <Link 
                to="/reset-password" 
                className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input 
              type="password" placeholder="••••••••" required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500">
            ¿No tienes cuenta? {' '}
            <Link to="/registro" className="text-blue-500 font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}