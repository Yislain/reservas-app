import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function Booking() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('services').select('*');
      if (!error) {
        setServices(data);
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.date) checkAvailability(formData.date);
  }, [formData.date]);

  async function checkAvailability(date) {
    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date);
      
    if (data) {
      setTakenSlots(data.map(cita => cita.appointment_time.slice(0, 5)));
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.time || !formData.date) return;

    const { error } = await supabase.from('appointments').insert([{
      service_id: selectedService.id,
      client_name: formData.name,
      client_phone: formData.phone,
      appointment_date: formData.date,
      appointment_time: formData.time,
      status: 'pending'
    }]);

    if (error) alert("Error: " + error.message);
    else {
      // Éxito con estilo (podríamos poner un modal bonito luego)
      alert("¡Reserva confirmada!");
      setSelectedService(null);
      setFormData({ name: '', phone: '', date: '', time: '' });
      setTakenSlots([]);
    }
  };

  // --- VISTA 1: GRID DE SERVICIOS (Diseño Futurista) ---
  if (!selectedService) {
    return (
      <div className="min-h-screen px-4 py-12 flex flex-col items-center relative overflow-hidden">
        {/* Fondo decorativo (Glow) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />

        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text tracking-tight">
          Elige tu Experiencia
        </h1>
        <p className="text-gray-400 text-lg mb-12 text-center max-w-2xl">
          Servicios profesionales diseñados para ti. Selecciona una opción para comenzar.
        </p>
        
        {loading ? (
          <div className="text-blue-400 animate-pulse text-xl">Cargando catálogo...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {services.map((service) => (
              <div 
                key={service.id} 
                onClick={() => setSelectedService(service)}
                className="group relative bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
              >
                {/* Icono decorativo */}
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                  <span className="text-2xl">⚡️</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{service.name}</h2>
                <div className="flex justify-between items-end mt-8">
                  <div className="flex items-center text-gray-400 text-sm">
                    <span className="mr-2">🕒</span> {service.duration_min} min
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tighter">
                    ${service.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- VISTA 2: FORMULARIO DE RESERVA (Glassmorphism) ---
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
       {/* Fondos decorativos animados */}
       <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10 animate-pulse" />
       <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl relative">
        
        {/* Botón Volver */}
        <button 
          onClick={() => setSelectedService(null)}
          className="absolute top-8 right-8 text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-2"
        >
          ✕ Cancelar
        </button>

        <div className="mb-10">
          <span className="text-blue-400 font-bold tracking-wider text-xs uppercase mb-2 block">Reservando</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedService.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-gray-400">
            <span>${selectedService.price}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>{selectedService.duration_min} minutos</span>
          </div>
        </div>

        <form onSubmit={handleBooking} className="space-y-8">
          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Tu Nombre</label>
              <input 
                type="text" required placeholder="Ej: Juan Pérez"
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-zinc-600"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">WhatsApp</label>
              <input 
                type="tel" required placeholder="Ej: 55 1234 5678"
                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-zinc-600"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Fecha</label>
            <input 
              type="date" required
              className="w-full bg-zinc-950/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all [color-scheme:dark]"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})}
            />
          </div>

          {/* Selector de Horarios Sci-Fi */}
          {formData.date && (
            <div className="space-y-3 animate-fade-in-up">
              <label className="text-sm font-medium text-gray-400 ml-1">Horarios Disponibles</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {TIME_SLOTS.map((time) => {
                  const isTaken = takenSlots.includes(time);
                  const isSelected = formData.time === time;
                  return (
                    <button
                      key={time} type="button" disabled={isTaken}
                      onClick={() => setFormData({...formData, time})}
                      className={`
                        relative py-2 text-sm font-medium rounded-lg transition-all duration-300
                        ${isTaken 
                          ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-transparent' 
                          : isSelected
                            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105 border border-blue-400'
                            : 'bg-zinc-800 text-gray-300 border border-zinc-700 hover:border-blue-500 hover:text-blue-400'
                        }
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!formData.time}
            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg
              ${formData.time 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:scale-[1.02]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
            `}
          >
            {formData.time ? 'Confirmar Reserva ✨' : 'Selecciona una hora'}
          </button>
        </form>
      </div>
    </div>
  );
}