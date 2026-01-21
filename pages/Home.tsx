
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Phone, CheckCircle2, UserCheck, Sparkles, MapPin } from 'lucide-react';
import { getStore, addToQueue } from '../store';
import { Salon } from '../types';

const Home: React.FC = () => {
  const { salonSlug } = useParams<{ salonSlug: string }>();
  const state = getStore();
  const salon = state.salons.find(s => s.slug === salonSlug);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState<'auto' | string>('auto');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  if (!salon) {
    return <div className="text-center py-20 text-xl font-bold">Salon introuvable.</div>;
  }

  // Filtrer les données pour ce salon spécifique
  const salonBarbers = state.barbers.filter(b => b.salonId === salon.id);
  const salonServices = state.services.filter(s => s.salonId === salon.id);

  const handleToggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(s => s !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      alert('Veuillez choisir au moins une prestation.');
      return;
    }
    const newItem = addToQueue(salon.id, name, phone, selectedBarberId, selectedServiceIds);
    navigate(`/${salon.slug}/wait/${newItem.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{salon.name}</h1>
        <p className="text-slate-500 flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" /> {salon.address}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-amber-500" /> Vos informations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom" className="w-full px-4 py-3 rounded-xl border-slate-200"
                />
                <input
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Votre téléphone" className="w-full px-4 py-3 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Choisissez votre coiffeur</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button" onClick={() => setSelectedBarberId('auto')}
                  className={`p-4 rounded-2xl border-2 transition text-center ${selectedBarberId === 'auto' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-600'}`}
                >
                  <Sparkles className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-semibold">Premier disponible</span>
                </button>
                {salonBarbers.map(barber => (
                  <button
                    key={barber.id} type="button" onClick={() => setSelectedBarberId(barber.id)}
                    className={`p-4 rounded-2xl border-2 transition text-center ${selectedBarberId === barber.id ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-600'}`}
                  >
                    <img src={barber.photo} alt={barber.name} className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />
                    <span className="text-sm font-semibold">{barber.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Sélectionnez les services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {salonServices.map(service => (
                  <label key={service.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${selectedServiceIds.includes(service.id) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-600'}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="hidden" checked={selectedServiceIds.includes(service.id)} onChange={() => handleToggleService(service.id)} />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <span className="text-sm opacity-70">{service.duration} min</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition shadow-xl">
              S'inscrire sur la file
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-lg">
             <h4 className="text-xl font-bold mb-6">File actuelle</h4>
             <div className="space-y-4">
                {salonBarbers.map(barber => {
                  const waitingCount = state.queue.filter(q => q.salonId === salon.id && q.barberId === barber.id && q.status === 'WAITING').length;
                  return (
                    <div key={barber.id} className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={barber.photo} className="w-10 h-10 rounded-full" />
                        <span className="font-medium">{barber.name}</span>
                      </div>
                      <span className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
                        {waitingCount} en attente
                      </span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
