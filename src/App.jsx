import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Páginas
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';

// Componentes
import Navbar from './components/Navbar';

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId) {
    const { data } = await supabase.from('perfiles').select('role').eq('id', userId).single();
    setRole(data?.role || 'cliente');
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <BrowserRouter>
      <Navbar session={session} role={role} />
      <div className="pt-20 min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<Booking />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : '/mis-citas'} />} />
          <Route path="/registro" element={!session ? <Register /> : <Navigate to="/mis-citas" />} />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          <Route path="/mis-citas" element={session ? <ClientDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={session && role === 'admin' ? <Admin /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}