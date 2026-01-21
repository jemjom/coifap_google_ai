
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useParams, useLocation } from 'react-router-dom';
import { Scissors, Calendar, Clock, Settings, User as UserIcon, LogOut, Menu, X, Shield, MapPin, Home as HomeIcon } from 'lucide-react';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Reservation from './pages/Reservation';
import WaitingPage from './pages/WaitingPage';
import { User, UserRole } from './types';
import { getStore } from './store';

// Un petit composant pour choisir son salon si on arrive à la racine
const SalonSelector: React.FC = () => {
  const state = getStore();
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-8">Trouvez votre Salon</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.salons.map(salon => (
          <Link 
            key={salon.id} 
            to={`/${salon.slug}`} 
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:border-amber-500 transition-all group"
          >
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{salon.name}</h2>
            <p className="text-slate-500 mt-2">{salon.address}</p>
            <div className="mt-6 inline-flex items-center text-amber-600 font-bold">
              Visiter le salon →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('barberq_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('barberq_user');
    setUser(null);
    setIsMenuOpen(false);
  };

  const isAdminOrSuper = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                <Scissors className="w-8 h-8 text-amber-400" />
                <span className="text-xl font-bold tracking-tight">BarberQ</span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-6">
                {user ? (
                   <button onClick={handleLogout} className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition">
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                ) : (
                  <Link to="/login" className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-amber-500/20">
                    Accès Pro
                  </Link>
                )}
                {isAdminOrSuper && (
                  <Link to="/admin" className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition flex items-center space-x-2 border border-slate-700">
                    {user?.role === UserRole.SUPER_ADMIN ? <Shield className="w-4 h-4 text-indigo-400" /> : <Settings className="w-4 h-4 text-slate-400" />}
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>

              {/* Mobile Controls */}
              <div className="flex items-center space-x-2 md:hidden">
                {!user && (
                  <Link to="/login" className="text-xs bg-amber-500 text-slate-900 px-3 py-1.5 rounded-full font-black uppercase tracking-wider shadow-lg">
                    Accès Pro
                  </Link>
                )}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-2 text-slate-300 hover:text-white transition"
                  aria-label="Menu"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Drawer */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-in slide-in-from-top duration-300">
              <div className="px-4 pt-2 pb-6 space-y-2">
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-slate-700 transition"
                >
                  <HomeIcon className="w-5 h-5 text-slate-400" />
                  <span className="font-bold">Accueil Salons</span>
                </Link>

                {isAdminOrSuper && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 transition"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-bold">Tableau de Bord Admin</span>
                  </Link>
                )}

                {user && (
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-4 rounded-xl bg-red-600/10 text-red-400 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">Se déconnecter</span>
                  </button>
                )}

                {!user && (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-amber-500 text-slate-900 transition"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="font-black uppercase tracking-widest text-sm">Espace Personnel</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Content */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<SalonSelector />} />
              <Route path="/login" element={user ? <Navigate to="/admin" /> : <Login setUser={setUser} />} />
              <Route path="/admin" element={isAdminOrSuper ? <AdminDashboard /> : <Navigate to="/login" />} />
              
              {/* Routes Dynamiques par Salon */}
              <Route path="/:salonSlug" element={<Home />} />
              <Route path="/:salonSlug/reservation" element={<Reservation />} />
              <Route path="/:salonSlug/wait/:id" element={<WaitingPage />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-8 text-center text-slate-400 text-xs">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <Scissors className="w-4 h-4" />
            <span className="font-black text-slate-900">BarberQ</span>
          </div>
          <p>© 2024 BarberQ - Solution de gestion multi-salons</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
