import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
    if (!error) setAppointments(data);
    setLoading(false);
  }

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    if (!error) fetchAppointments();
  };

  const handleCancel = async (id) => {
    if (window.confirm("¿Eliminar esta cita?")) {
      await supabase.from('appointments').delete().eq('id', id);
      fetchAppointments();
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Cargando panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-black text-white mb-10">Panel de Administración</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase">
              <th className="p-6">Cliente</th>
              <th className="p-6">Fecha y Hora</th>
              <th className="p-6">Estado</th>
              <th className="p-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {appointments.map(cita => (
              <tr key={cita.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-6">
                  <div className="text-white font-bold">{cita.client_name}</div>
                  <div className="text-zinc-500 text-sm">{cita.customer_email} - {cita.client_phone}</div>
                </td>
                <td className="p-6 text-white">{cita.appointment_date} a las {cita.appointment_time}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cita.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : cita.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {cita.status}
                  </span>
                </td>
                <td className="p-6 flex justify-center gap-2">
                  <button onClick={() => handleUpdateStatus(cita.id, 'confirmed')} className="p-2 bg-green-500/10 text-green-500 rounded-lg">✓</button>
                  <button onClick={() => handleUpdateStatus(cita.id, 'cancelled')} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">✕</button>
                  <button onClick={() => handleCancel(cita.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}