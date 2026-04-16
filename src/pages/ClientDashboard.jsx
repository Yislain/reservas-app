import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ClientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCitas();
  }, []);

  async function fetchMyCitas() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_email', user.email)
      .order('appointment_date', { ascending: false });
    
    setAppointments(data || []);
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-black text-white mb-2">Mis Citas</h1>
      <p className="text-zinc-500 mb-10">Historial y estado de tus reservas.</p>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-zinc-900 rounded-2xl"></div>
          <div className="h-20 bg-zinc-900 rounded-2xl"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-20 border-2 border-dashed border-zinc-800 rounded-[3rem] text-center">
          <p className="text-zinc-600 font-medium">No has realizado ninguna reserva aún.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map(cita => (
            <div key={cita.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{cita.appointment_time}</span>
                <h3 className="text-2xl font-bold text-white">{cita.appointment_date}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${cita.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <p className="text-sm text-zinc-500 capitalize">{cita.status}</p>
                </div>
              </div>
              <div className="bg-zinc-800 px-4 py-2 rounded-xl text-zinc-500 font-mono text-xs">
                REF: {cita.id.slice(0, 5)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}