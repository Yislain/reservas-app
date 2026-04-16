import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Los horarios completos que tenías originalmente
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function Booking() {
  const [submitting, setSubmitting] = useState(false);
  const [takenSlots, setTakenSlots] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', date: '', time: '' });
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setFormData(prev => ({ ...prev, email: user.email }));
        setIsLoggedIn(true);
      }
    });
  }, []);

  useEffect(() => {
    if (formData.date) checkAvailability(formData.date);
  }, [formData.date]);

  async function checkAvailability(date) {
    // 1. Buscamos citas de ese día que NO estén canceladas
    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date)
      .neq('status', 'cancelled'); // Si está cancelada, liberamos el espacio

    if (data) {
      // 2. Supabase devuelve "10:00:00". Aquí lo cortamos a "10:00" para que React lo reconozca
      const formattedSlots = data.map(app => app.appointment_time.substring(0, 5));
      setTakenSlots(formattedSlots);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Verificación final justo antes de guardar (por si alguien más lo tomó mientras escribía)
    const { data: verifyData } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', formData.date)
      .eq('appointment_time', formData.time)
      .neq('status', 'cancelled');

    if (verifyData && verifyData.length > 0) {
      alert("Lo sentimos, alguien acaba de reservar este horario. Por favor, elige otro.");
      setSubmitting(false);
      checkAvailability(formData.date);
      setFormData(prev => ({ ...prev, time: '' }));
      return;
    }

    const { error } = await supabase.from('appointments').insert([{ 
      client_name: formData.name,
      client_phone: formData.phone,
      customer_email: formData.email.trim(),
      appointment_date: formData.date,
      appointment_time: formData.time,
      status: 'pending'
    }]);

    setSubmitting(false);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("✅ ¡Cita reservada con éxito!");
      setFormData({ 
        name: '', 
        phone: '', 
        email: isLoggedIn ? formData.email : '', 
        date: '', 
        time: '' 
      });
      checkAvailability(formData.date);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-8">Reserva tu cita</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" placeholder="Nombre completo" required 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white" 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
          />
          
          <input 
            type="tel" placeholder="Teléfono" required 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white" 
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
          
          <input 
            type="email" placeholder="Email" required disabled={isLoggedIn} 
            className={`w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`} 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          
          <input 
            type="date" required min={new Date().toISOString().split('T')[0]} 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white [color-scheme:dark]" 
            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
          />
          
          {formData.date && (
            <div className="grid grid-cols-3 gap-3 pt-4">
              {TIME_SLOTS.map(time => (
                <button 
                  key={time} type="button" disabled={takenSlots.includes(time)} 
                  onClick={() => setFormData({...formData, time})} 
                  className={`py-3 rounded-xl font-bold transition-all ${takenSlots.includes(time) ? 'bg-zinc-950 text-zinc-700 cursor-not-allowed' : formData.time === time ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105 border border-blue-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}

          <button 
            disabled={!formData.time || submitting} 
            className="w-full py-5 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-600/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            {submitting ? 'Procesando...' : 'Confirmar Reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}