
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../types';
import { getStore } from '../store';

interface LoginProps {
  setUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const state = getStore();
    // Recherche de l'utilisateur (insensible à la casse pour le login également)
    const foundUser = state.users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('barberq_user', JSON.stringify(userWithoutPassword));
      navigate('/admin');
    } else {
      setError('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-800 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Authentification</h2>
        <p className="text-slate-500">Accès réservé au personnel du salon</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <UserIcon className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="votre identifiant"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="w-5 h-5" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition shadow-lg"
        >
          Se connecter
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400 italic">
          Comptes démo : superadmin/superadmin ou admin1/admin
        </p>
      </div>
    </div>
  );
};

export default Login;
