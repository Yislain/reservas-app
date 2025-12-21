import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, earnings: 0 });

  useEffect(() => {
    // 1. Verificación de Seguridad: ¿Hay usuario logueado?
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        fetchAppointments();
      }
    };
    checkSession();
  }, [navigate]);

  // 2. Cargar Citas de la Base de Datos
  async function fetchAppointments() {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services ( name, price )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data);
      calculateStats(data);
    } catch (error) {
      alert('Error cargando citas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. Calcular Estadísticas (Dinero y Cantidad)
  function calculateStats(data) {
    const total = data.length;
    const pending = data.filter(a => a.status === 'pending').length;
    
    // Sumar el precio solo de las citas confirmadas
    const earnings = data
      .filter(a => a.status === 'confirmed')
      .reduce((acc, curr) => acc + (curr.services?.price || 0), 0);
    
    setStats({ total, pending, earnings });
  }

  // --- ACCIONES ACTUALIZADAS CON FEEDBACK ---

  // A. Marcar como Completada
  const handleComplete = async (id) => {
    if (!confirm("¿Confirmar que el servicio fue realizado y cobrado?")) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id);

    if (error) {
      alert("❌ Error al actualizar: " + error.message);
    } else {
      // Recargar la tabla para ver el cambio
      fetchAppointments();
    }
  };

  // B. Cancelar / Eliminar Cita
  const handleCancel = async (id) => {
    if (!confirm("⚠️ ¿Seguro que quieres ELIMINAR esta cita permanentemente?")) return;

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      alert("❌ Error al eliminar: " + error.message);
    } else {
      // Recargar la tabla para ver que desapareció
      fetchAppointments();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-500 bg-zinc-950">Cargando panel...</div>;

  return (
    <div className="min-h-screen p-4 md:p-10 relative overflow-hidden bg-zinc-950">
      {/* Fondo Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header + Botón Salir */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Panel de Control</h1>
            <p className="text-gray-400">Gestiona tu negocio en tiempo real</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-zinc-800 hover:bg-red-900/20 text-white hover:text-red-400 px-6 py-2.5 rounded-xl text-sm font-medium transition border border-zinc-700"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Citas Totales" value={stats.total} icon="📅" color="text-blue-400" />
          <StatCard title="Pendientes" value={stats.pending} icon="⏳" color="text-yellow-400" />
          <StatCard title="Ganancia Estimada" value={`$${stats.earnings}`} icon="💰" color="text-green-400" />
        </div>

        {/* Tabla Glassmorphism */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Fecha & Hora</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {appointments.map((cita) => (
                  <tr key={cita.id} className="group hover:bg-white/5 transition-colors">
                    {/* Fecha y Hora */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-white capitalize">
                        {new Date(cita.appointment_date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-blue-400 text-sm font-mono">{cita.appointment_time.slice(0, 5)}</div>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{cita.client_name}</div>
                      <div className="text-zinc-500 text-xs">{cita.client_phone}</div>
                    </td>

                    {/* Servicio */}
                    <td className="px-6 py-4 text-zinc-300 text-sm">
                      {cita.services?.name} <span className="text-zinc-500">(${cita.services?.price})</span>
                    </td>

                    {/* Estado (Badge) */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        cita.status === 'confirmed' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {cita.status === 'pending' ? 'Pendiente' : 'Completada'}
                      </span>
                    </td>

                    {/* Botones de Acción */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {cita.status === 'pending' && (
                        <button 
                          onClick={() => handleComplete(cita.id)} 
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition border border-green-500/20" 
                          title="Marcar como Completada"
                        >
                          ✅
                        </button>
                      )}
                      <button 
                        onClick={() => handleCancel(cita.id)} 
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition border border-red-500/20" 
                        title="Eliminar Cita"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}

                {appointments.length === 0 && (
                  <tr><td colSpan="5" className="p-12 text-center text-zinc-500">No hay citas registradas aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente pequeño para las tarjetas de arriba
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl flex items-center justify-between hover:border-zinc-600 transition-colors shadow-lg">
      <div>
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className="text-4xl opacity-80 bg-zinc-800/50 p-3 rounded-xl border border-zinc-700">{icon}</div>
    </div>
  );
}