
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Scissors, Layout, Plus, Trash2, Edit2, 
  Save, CheckCircle, RefreshCcw, UserPlus, Armchair, Shield, Key, Store, MapPin, Clock, ListOrdered, Download, Upload, AlertTriangle,
  Settings, ChevronRight, Info
} from 'lucide-react';
import { getStore, saveStore } from '../store';
import { StoreState, Service, Barber, Chair, QueueStatus, User, UserRole, Salon } from '../types';

const AdminDashboard: React.FC = () => {
  const [state, setState] = useState<StoreState>(getStore());
  const [activeTab, setActiveTab] = useState<'barbers' | 'services' | 'queue' | 'users' | 'salons_list' | 'maintenance'>('queue');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for forms
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newBarberName, setNewBarberName] = useState('');

  // States for Multi-Salon Management (SuperAdmin)
  const [newSalonName, setNewSalonName] = useState('');
  const [newSalonAddress, setNewSalonAddress] = useState('');
  const [newSalonSlug, setNewSalonSlug] = useState('');

  // States for User Management
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.ADMIN);
  const [newUserSalonId, setNewUserSalonId] = useState('');

  // Synchronisation avec le localStorage dès que le state change
  useEffect(() => {
    saveStore(state);
    
    // Si on est Super Admin et qu'on n'a pas de salon sélectionné, on prend le premier de la liste
    if (currentUser?.role === UserRole.SUPER_ADMIN && !selectedSalonId && state.salons.length > 0) {
      setSelectedSalonId(state.salons[0].id);
    }
  }, [state, currentUser, selectedSalonId]);

  // Chargement de l'utilisateur au montage
  useEffect(() => {
    const savedUser = localStorage.getItem('barberq_user');
    if (savedUser) {
      const u: User = JSON.parse(savedUser);
      setCurrentUser(u);
      
      if (u.role === UserRole.ADMIN || u.role === UserRole.BARBER) {
        setSelectedSalonId(u.salonId || '');
        setActiveTab('queue');
      } else {
        setActiveTab('salons_list');
        const store = getStore();
        if (store.salons.length > 0) {
          setSelectedSalonId(store.salons[0].id);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  const addSalon = () => {
    if (!newSalonName || !newSalonSlug) {
      alert("Veuillez remplir le nom et le slug du salon.");
      return;
    }
    const newSalon: Salon = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSalonName,
      address: newSalonAddress,
      slug: newSalonSlug.toLowerCase().replace(/\s+/g, '-')
    };
    setState(prev => ({ ...prev, salons: [...prev.salons, newSalon] }));
    
    // On sélectionne automatiquement le nouveau salon si c'était le premier
    if (state.salons.length === 0) {
      setSelectedSalonId(newSalon.id);
    }
    
    setNewSalonName('');
    setNewSalonAddress('');
    setNewSalonSlug('');
  };

  const addService = () => {
    if (!newServiceName) {
      alert("Le nom du service est requis.");
      return;
    }
    if (!selectedSalonId) {
      alert("Erreur: Aucun salon sélectionné. Créez d'abord un salon.");
      return;
    }

    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      salonId: selectedSalonId,
      name: newServiceName,
      duration: newServiceDuration
    };

    setState(prev => ({ 
      ...prev, 
      services: [...prev.services, newService] 
    }));
    
    setNewServiceName('');
    setNewServiceDuration(30);
  };

  const addBarber = () => {
    if (!newBarberName) {
      alert("Le nom du coiffeur est requis.");
      return;
    }
    if (!selectedSalonId) {
      alert("Erreur: Aucun salon sélectionné. Créez d'abord un salon.");
      return;
    }

    const newBarber: Barber = {
      id: Math.random().toString(36).substr(2, 9),
      salonId: selectedSalonId,
      name: newBarberName,
      photo: `https://picsum.photos/seed/${Math.random()}/200`,
      chairId: 'default'
    };

    setState(prev => ({ 
      ...prev, 
      barbers: [...prev.barbers, newBarber] 
    }));
    
    setNewBarberName('');
  };

  const addUser = () => {
    if (!newUserName || !newUserPassword) {
      alert("Nom d'utilisateur et mot de passe requis.");
      return;
    }

    // VERIFICATION ANTI-DOUBLONS
    const userExists = state.users.some(u => u.username.toLowerCase() === newUserName.toLowerCase());
    if (userExists) {
      alert(`L'utilisateur "${newUserName}" existe déjà. Veuillez choisir un autre nom.`);
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUserName,
      password: newUserPassword,
      role: newUserRole,
      salonId: newUserRole === UserRole.SUPER_ADMIN ? undefined : newUserSalonId
    };

    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    
    // Reset form
    setNewUserName('');
    setNewUserPassword('');
    setNewUserSalonId('');
    alert("Utilisateur créé avec succès !");
  };

  const deleteUser = (id: string) => {
    const userToDelete = state.users.find(u => u.id === id);
    if (userToDelete?.role === UserRole.SUPER_ADMIN && state.users.filter(u => u.role === UserRole.SUPER_ADMIN).length <= 1) {
      alert("Sécurité : Impossible de supprimer le dernier Super Admin du système.");
      return;
    }
    if (confirm(`Supprimer l'utilisateur ${userToDelete?.username} ?`)) {
      setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    }
  };

  const updateQueueStatus = (id: string, status: QueueStatus) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(q => q.id === id ? { ...q, status } : q)
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `barberq_backup_${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.salons && json.users) {
          setState(json);
          alert('Données importées avec succès !');
        } else {
          alert('Format de fichier invalide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier.');
      }
    };
    reader.readAsText(file);
  };

  const resetToDefault = () => {
    if (confirm("⚠️ ALERTE : Êtes-vous sûr ? Tous les salons, coiffeurs et utilisateurs seront supprimés.")) {
      localStorage.removeItem('barberq_v2_data');
      window.location.reload();
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Initialisation du système...</div>;

  // Filtrage des données selon le salon sélectionné
  const salonQueue = state.queue.filter(q => q.salonId === selectedSalonId);
  const salonBarbers = state.barbers.filter(b => b.salonId === selectedSalonId);
  const salonServices = state.services.filter(s => s.salonId === selectedSalonId);
  
  const totalClients = salonQueue.filter(q => q.status !== QueueStatus.CANCELLED && q.status !== QueueStatus.COMPLETED).length;
  let totalTime = 0;
  salonQueue.filter(q => q.status === QueueStatus.WAITING || q.status === QueueStatus.IN_PROGRESS).forEach(item => {
    item.serviceIds.forEach(sid => {
      const s = state.services.find(srv => srv.id === sid);
      if (s) totalTime += s.duration;
    });
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      {/* Super Admin Top Header */}
      {isSuperAdmin && (
        <div className="mb-6 bg-slate-900 p-4 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-3 rounded-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Console Super Admin</p>
              <h2 className="text-xl font-bold">Gestion des structures</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 w-full sm:w-64">
            <Store className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={selectedSalonId} 
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="bg-transparent font-bold outline-none cursor-pointer flex-grow text-sm py-1"
            >
              {state.salons.length === 0 && <option value="">Aucun salon créé</option>}
              {state.salons.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Barre Latérale */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
            <button onClick={() => setActiveTab('queue')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition ${activeTab === 'queue' ? 'bg-amber-500 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><RefreshCcw className="w-5 h-5" /><span className="font-bold">File d'attente</span></button>
            <button onClick={() => setActiveTab('barbers')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition ${activeTab === 'barbers' ? 'bg-amber-500 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><Users className="w-5 h-5" /><span className="font-bold">Coiffeurs</span></button>
            <button onClick={() => setActiveTab('services')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition ${activeTab === 'services' ? 'bg-amber-500 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><Scissors className="w-5 h-5" /><span className="font-bold">Services</span></button>
          </div>
          
          {isSuperAdmin && (
            <div className="bg-slate-100 p-2 rounded-3xl border border-slate-200">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Système</div>
              <button onClick={() => setActiveTab('salons_list')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition ${activeTab === 'salons_list' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><Store className="w-5 h-5" /><span className="font-bold">Salons</span></button>
              <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><Shield className="w-5 h-5" /><span className="font-bold">Accès</span></button>
              <button onClick={() => setActiveTab('maintenance')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition ${activeTab === 'maintenance' ? 'bg-red-600 text-white shadow-lg' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><Settings className="w-5 h-5" /><span className="font-bold">Maintenance</span></button>
            </div>
          )}
        </aside>

        {/* Zone de Contenu */}
        <div className="flex-grow bg-white rounded-[40px] shadow-sm p-6 sm:p-10 border border-slate-100 min-h-[700px]">
          
          {/* TAB: FILE D'ATTENTE */}
          {activeTab === 'queue' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">File Active</h3>
                  <p className="text-slate-400 text-sm font-medium">{state.salons.find(s => s.id === selectedSalonId)?.name || 'Aucun salon sélectionné'}</p>
                </div>
                <button 
                  onClick={() => setState(prev => ({...prev, queue: prev.queue.filter(q => q.salonId !== selectedSalonId || (q.status !== QueueStatus.COMPLETED && q.status !== QueueStatus.CANCELLED))}))} 
                  className="text-xs font-black text-slate-300 hover:text-red-500 flex items-center gap-2 transition bg-slate-50 px-4 py-2 rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5" /> EFFACER HISTORIQUE
                </button>
              </div>
              
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Client</th>
                      <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Coiffeur</th>
                      <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Prestations</th>
                      <th className="pb-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {salonQueue.slice().reverse().map(item => {
                      const itemServices = item.serviceIds.map(sid => state.services.find(s => s.id === sid));
                      const itemTotalTime = itemServices.reduce((acc, s) => acc + (s?.duration || 0), 0);
                      
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 pr-4">
                            <div className="font-black text-slate-800">{item.clientName}</div>
                            <div className="text-xs text-slate-400 font-medium">{item.clientPhone}</div>
                          </td>
                          <td className="py-5 pr-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                 <img src={state.barbers.find(b => b.id === item.barberId)?.photo} className="w-full h-full object-cover" />
                               </div>
                               <span className="text-sm font-bold text-slate-600">
                                 {state.barbers.find(b => b.id === item.barberId)?.name || 'Auto'}
                               </span>
                            </div>
                          </td>
                          <td className="py-5 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {itemServices.map((s, idx) => (
                                <span key={idx} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-sm">
                                  {s?.name}
                                </span>
                              ))}
                              <div className="w-full text-[10px] font-black text-amber-600 mt-1">{itemTotalTime} min</div>
                            </div>
                          </td>
                          <td className="py-5 text-right">
                            <select 
                              value={item.status}
                              onChange={(e) => updateQueueStatus(item.id, e.target.value as QueueStatus)}
                              className={`text-[10px] font-black px-4 py-2 rounded-2xl border-none focus:ring-0 cursor-pointer shadow-sm appearance-none text-center ${
                                item.status === 'WAITING' ? 'bg-amber-100 text-amber-700' : 
                                item.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' :
                                item.status === 'CANCELLED' ? 'bg-slate-100 text-slate-400' :
                                'bg-green-100 text-green-700'
                              }`}
                            >
                              <option value={QueueStatus.WAITING}>EN ATTENTE</option>
                              <option value={QueueStatus.IN_PROGRESS}>EN COURS</option>
                              <option value={QueueStatus.COMPLETED}>TERMINÉ</option>
                              <option value={QueueStatus.CANCELLED}>ANNULÉ</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {salonQueue.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-300 font-bold">Aucune activité enregistrée pour le moment.</p>
                  </div>
                )}
              </div>

              {salonQueue.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-slate-50">
                  <div className="bg-indigo-50/50 p-6 rounded-[32px] flex items-center gap-5 border border-indigo-100/50">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Clients Actifs</p>
                      <p className="text-3xl font-black text-indigo-900">{totalClients}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50/50 p-6 rounded-[32px] flex items-center gap-5 border border-amber-100/50">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Charge estimée</p>
                      <p className="text-3xl font-black text-amber-900">{totalTime} <span className="text-sm">min</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: COIFFEURS */}
          {activeTab === 'barbers' && (
             <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Coiffeurs</h3>
                  <p className="text-slate-400 text-sm font-medium">Équipe du salon {state.salons.find(s => s.id === selectedSalonId)?.name}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {salonBarbers.map(barber => (
                     <div key={barber.id} className="p-5 border border-slate-100 rounded-3xl bg-white shadow-sm flex items-center justify-between group hover:border-amber-500 transition-all">
                        <div className="flex items-center gap-4">
                          <img src={barber.photo} className="w-14 h-14 rounded-2xl object-cover shadow-inner" />
                          <span className="font-black text-slate-800">{barber.name}</span>
                        </div>
                        <button onClick={() => setState(prev => ({...prev, barbers: prev.barbers.filter(b => b.id !== barber.id)}))} className="p-2 text-slate-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                     </div>
                   ))}
                   {salonBarbers.length === 0 && <div className="col-span-full py-12 text-center text-slate-300 italic">Veuillez ajouter votre premier coiffeur.</div>}
                </div>

                <div className="p-8 bg-slate-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                   <h4 className="text-lg font-black mb-6 flex items-center gap-3"><UserPlus className="w-6 h-6 text-amber-400" /> Ajouter un Coiffeur</h4>
                   <div className="flex flex-col sm:flex-row gap-4">
                     <input 
                       type="text" value={newBarberName} onChange={e => setNewBarberName(e.target.value)} 
                       className="p-4 bg-white/5 border border-white/10 rounded-2xl flex-grow outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder:text-slate-600 font-bold" 
                       placeholder="Prénom du coiffeur" 
                     />
                     <button onClick={addBarber} className="bg-amber-500 text-slate-900 py-4 px-10 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-xl active:scale-95">AJOUTER À L'ÉQUIPE</button>
                   </div>
                </div>
             </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
             <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Prestations</h3>
                  <p className="text-slate-400 text-sm font-medium">Catalogue des services disponibles</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {salonServices.map(service => (
                     <div key={service.id} className="p-5 border border-slate-100 rounded-3xl flex justify-between items-center bg-white shadow-sm group hover:border-amber-500 transition-all">
                        <div>
                          <p className="font-black text-slate-800">{service.name}</p>
                          <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{service.duration} minutes</p>
                        </div>
                        <button onClick={() => setState(prev => ({...prev, services: prev.services.filter(s => s.id !== service.id)}))} className="p-2 text-slate-200 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                     </div>
                   ))}
                </div>

                <div className="p-8 bg-slate-50 border border-slate-200 rounded-[40px]">
                   <h4 className="font-black mb-6 text-slate-900 flex items-center gap-3"><Plus className="w-6 h-6 text-indigo-600" /> Nouvelle Prestation</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="sm:col-span-2 p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold" placeholder="Ex: Coupe + Barbe" />
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4">
                      <input type="number" value={newServiceDuration} onChange={e => setNewServiceDuration(Number(e.target.value))} className="w-full bg-transparent outline-none font-black text-center" />
                      <span className="text-[10px] font-black text-slate-400">MIN</span>
                    </div>
                   </div>
                   <button onClick={addService} className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition shadow-xl active:scale-95">ENREGISTRER LE SERVICE</button>
                </div>
             </div>
          )}

          {/* TAB: SALONS (SuperAdmin) */}
          {activeTab === 'salons_list' && isSuperAdmin && (
            <div className="space-y-10">
              <h3 className="text-2xl font-black text-slate-900">Salons</h3>
              <div className="grid grid-cols-1 gap-5">
                {state.salons.map(salon => (
                  <div key={salon.id} className="p-6 border border-slate-100 rounded-[32px] bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-indigo-600">
                        <Store className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xl">{salon.name}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {salon.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button onClick={() => { setSelectedSalonId(salon.id); setActiveTab('queue'); }} className="flex-1 sm:flex-none text-[10px] font-black bg-indigo-100 text-indigo-700 px-6 py-3 rounded-2xl hover:bg-indigo-200 transition">ADMINISTRER</button>
                      <Link to={`/${salon.slug}`} className="flex-1 sm:flex-none text-[10px] font-black bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl hover:bg-amber-400 transition text-center shadow-lg shadow-amber-500/20">VOIR PUBLIC</Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-10 bg-indigo-50/50 rounded-[40px] border border-indigo-100 mt-12">
                <h4 className="font-black text-indigo-900 text-xl mb-8">Créer un Nouveau Salon</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Nom commercial</label>
                    <input type="text" value={newSalonName} onChange={e => setNewSalonName(e.target.value)} placeholder="Ex: Barber Shop 94" className="w-full p-4 rounded-2xl border-white bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Slug URL (sans espaces)</label>
                    <input type="text" value={newSalonSlug} onChange={e => setNewSalonSlug(e.target.value)} placeholder="ex: barber-shop-94" className="w-full p-4 rounded-2xl border-white bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Adresse physique</label>
                    <input type="text" value={newSalonAddress} onChange={e => setNewSalonAddress(e.target.value)} placeholder="Numéro, rue, code postal, ville" className="w-full p-4 rounded-2xl border-white bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                </div>
                <button onClick={addSalon} className="mt-10 w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-indigo-700 transition shadow-2xl active:scale-[0.98]">VALIDER LA CRÉATION</button>
              </div>
            </div>
          )}

          {/* TAB: USERS (SuperAdmin) */}
          {activeTab === 'users' && isSuperAdmin && (
            <div className="space-y-10">
               <h3 className="text-2xl font-black text-slate-900">Gestion des Comptes</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.users.map(user => (
                    <div key={user.id} className="p-5 border border-slate-100 rounded-3xl bg-white flex justify-between items-center shadow-sm group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors"><UserPlus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" /></div>
                        <div>
                          <div className="font-black text-slate-800">{user.username}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role} {user.salonId ? `• ${state.salons.find(s => s.id === user.salonId)?.name}` : '• Système'}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteUser(user.id)} className="text-slate-200 hover:text-red-500 transition p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
               
               <div className="p-10 bg-slate-900 rounded-[40px] text-white shadow-2xl mt-12 border border-white/5">
                  <h4 className="text-xl font-black mb-8 flex items-center gap-3"><Key className="w-7 h-7 text-amber-400" /> Créer un Accès Professionnel</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Identifiant" className="p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                    <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="Mot de passe" className="p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold" />
                    <select value={newUserSalonId} onChange={e => setNewUserSalonId(e.target.value)} className="p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-white/50">
                      <option value="" className="text-slate-900">Assigner à un salon (Optionnel)</option>
                      {state.salons.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
                    </select>
                    <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} className="p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-white/50">
                      <option value={UserRole.ADMIN} className="text-slate-900">ADMINISTRATEUR SALON</option>
                      <option value={UserRole.BARBER} className="text-slate-900">COIFFEUR</option>
                      <option value={UserRole.SUPER_ADMIN} className="text-slate-900">SUPER ADMIN SYSTÈME</option>
                    </select>
                  </div>
                  <button onClick={addUser} className="mt-8 w-full bg-amber-500 text-slate-900 py-5 rounded-[24px] font-black text-lg hover:bg-amber-400 transition shadow-xl active:scale-[0.98]">GÉNÉRER L'ACCÈS</button>
               </div>
            </div>
          )}

          {/* TAB: MAINTENANCE */}
          {activeTab === 'maintenance' && isSuperAdmin && (
            <div className="space-y-12">
              <h3 className="text-2xl font-black text-slate-900">Maintenance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] group hover:bg-indigo-50 transition-colors">
                  <Download className="w-8 h-8 text-indigo-600 mb-6" />
                  <h4 className="font-black text-lg mb-3">Exportation Globale</h4>
                  <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">Téléchargez une copie complète de toutes les données au format JSON pour archive ou migration.</p>
                  <button onClick={exportData} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg active:scale-95">SAUVEGARDER MAINTENANT</button>
                </div>
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-[40px] group hover:bg-amber-50 transition-colors">
                  <Upload className="w-8 h-8 text-amber-600 mb-6" />
                  <h4 className="font-black text-lg mb-3">Restauration</h4>
                  <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">Importez un fichier de sauvegarde pour restaurer l'intégralité du système.</p>
                  <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                  <button onClick={handleImportClick} className="w-full bg-amber-500 text-slate-900 py-4 rounded-2xl font-black hover:bg-amber-400 transition shadow-lg active:scale-95">CHARGER UN FICHIER</button>
                </div>
              </div>
              <div className="p-10 bg-red-50/50 border border-red-100 rounded-[40px]">
                <div className="flex items-center gap-4 text-red-600 mb-6">
                  <AlertTriangle className="w-10 h-10" />
                  <h4 className="font-black text-xl">DANGER : RAZ SYSTÈME</h4>
                </div>
                <p className="text-sm text-red-700/60 font-medium mb-10 max-w-xl">Cette action est irréversible. Elle supprimera absolument TOUT (salons, users, coiffeurs, historiques) pour remettre le système à zéro.</p>
                <button onClick={resetToDefault} className="w-full bg-red-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-red-700 transition shadow-xl shadow-red-500/20 active:scale-95">RÉINITIALISER TOUTES LES DONNÉES</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
