import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white font-sans selection:bg-blue-500/30">
        
        {/* Navbar Flotante (Glassmorphism) */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/70 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo Futurista */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-300">
                  CF
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-200 transition-colors">
                  CitaFácil
                </span>
              </Link>
              
              {/* Enlaces de Navegación */}
              <div className="flex items-center gap-6">
                <Link 
                  to="/" 
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                >
                  Cliente
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
                </Link>
                
                <Link 
                  to="/admin" 
                  className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:scale-105"
                >
                  Soy el Dueño
                </Link>
              </div>

            </div>
          </div>
        </nav>

        {/* Contenido Principal con Padding Top para compensar la navbar fija */}
        <div className="pt-24 pb-12">
          <Routes>
            <Route path="/" element={<Booking />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;