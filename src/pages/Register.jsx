import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Registro en la autenticación de Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      alert("Error al registrarse: " + error.message);
      setLoading(false);
      return;
    }

    // Nota: El disparador (Trigger) que pusimos en SQL se encargará 
    // automáticamente de crear el perfil en la tabla 'perfiles'.

    alert("¡Cuenta creada con éxito! Por favor, inicia sesión.");
    setLoading(false);
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto px-4 mt-20">
      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Efecto de luz de fondo */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/10 blur-3xl -z-10"></div>
        
        <h2 className="text-4xl font-black text-white mb-2">Crear Cuenta</h2>
        <p className="text-zinc-500 mb-8">Únete para gestionar tus citas de forma profesional.</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase ml-2">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="nombre@ejemplo.com" 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-purple-500 outline-none transition-all"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase ml-2">Contraseña</label>
            <input 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              required
              minLength="6"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white focus:border-purple-500 outline-none transition-all"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creando cuenta...
              </span>
            ) : 'Registrarse ahora'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-400">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-purple-400 font-bold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}