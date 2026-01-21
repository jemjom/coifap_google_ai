
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, User, Phone, Scissors, Clock, Info } from 'lucide-react';
import { getStore, addToQueue, calculateWaitTime } from '../store';

const Reservation: React.FC = () => {
  const { salonSlug } = useParams<{ salonSlug: string }>();
  const state = getStore();
  const salon = state.salons.find(s => s.slug === salonSlug);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState<'auto' | string>('auto');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [estimatedWait, setEstimatedWait] = useState(0);

  if (!salon) return <div>Salon introuvable.</div>;

  const salonBarbers = state.barbers.filter(b => b.salonId === salon.id);
  const salonServices = state.services.filter(s => s.salonId === salon.id);

  useEffect(() => {
    if (selectedBarberId === 'auto') {
      let minWait = Infinity;
      salonBarbers.forEach(b => {
        const wait = calculateWaitTime(b.id, salon.id, state);
        if (wait < minWait) minWait = wait;
      });
      setEstimatedWait(minWait === Infinity ? 0 : minWait);
    } else {
      setEstimatedWait(calculateWaitTime(selectedBarberId, salon.id, state));
    }
  }, [selectedBarberId, state]);

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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-white text-center">
          <Calendar className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Réserver chez {salon.name}</h1>
          <p className="text-slate-400">Prenez votre place en un clic</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-slate-200" placeholder="Nom complet" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border-slate-200" placeholder="Téléphone" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Coiffeur</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button type="button" onClick={() => setSelectedBarberId('auto')} className={`p-3 rounded-xl border-2 text-sm transition ${selectedBarberId === 'auto' ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold' : 'border-slate-100 text-slate-500'}`}>Sans préférence</button>
              {salonBarbers.map(barber => (
                <button key={barber.id} type="button" onClick={() => setSelectedBarberId(barber.id)} className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm transition ${selectedBarberId === barber.id ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold' : 'border-slate-100 text-slate-500'}`}>
                  <img src={barber.photo} className="w-6 h-6 rounded-full" /> <span>{barber.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Services</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {salonServices.map(service => (
                <div key={service.id} onClick={() => handleToggleService(service.id)} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${selectedServiceIds.includes(service.id) ? 'border-slate-900 bg-slate-50' : 'border-slate-100'}`}>
                   <span className="font-medium text-slate-700">{service.name}</span>
                   <span className="text-sm text-slate-400">{service.duration} min</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-amber-700 font-medium">Attente estimée</p>
                <p className="text-3xl font-black text-amber-800">{estimatedWait} min</p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 transition shadow-lg">
            RESERVER MAINTENANT
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reservation;
