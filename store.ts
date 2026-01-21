
import { StoreState, Service, Barber, Chair, QueueItem, QueueStatus, Salon, User, UserRole } from './types';

const STORAGE_KEY = 'barberq_v2_data';

const DEFAULT_STATE: StoreState = {
  salons: [
    { id: 's1', name: 'Le Gentleman', address: '123 Rue de la Coiffe, Paris', slug: 'le-gentleman' },
    { id: 's2', name: 'Barber Shop 94', address: '45 Avenue de la République, Créteil', slug: 'barber-94' }
  ],
  users: [
    { id: 'u1', username: 'superadmin', password: 'superadmin', role: UserRole.SUPER_ADMIN },
    { id: 'u2', username: 'admin1', password: 'admin', role: UserRole.ADMIN, salonId: 's1' },
    { id: 'u3', username: 'admin2', password: 'admin', role: UserRole.ADMIN, salonId: 's2' },
  ],
  services: [
    { id: 'srv1', salonId: 's1', name: 'Coupe Classique', duration: 30 },
    { id: 'srv2', salonId: 's1', name: 'Barbe', duration: 15 },
    { id: 'srv3', salonId: 's2', name: 'Dégradé Américain', duration: 45 },
  ],
  chairs: [
    { id: 'c1', salonId: 's1', name: 'Fauteuil 1' },
    { id: 'c2', salonId: 's1', name: 'Fauteuil 2' },
    { id: 'c3', salonId: 's2', name: 'Trône Principal' },
  ],
  barbers: [
    { id: 'b1', salonId: 's1', name: 'Julien', photo: 'https://picsum.photos/seed/b1/200', chairId: 'c1' },
    { id: 'b2', salonId: 's1', name: 'Marc', photo: 'https://picsum.photos/seed/b2/200', chairId: 'c2' },
    { id: 'b3', salonId: 's2', name: 'Karim', photo: 'https://picsum.photos/seed/b3/200', chairId: 'c3' },
  ],
  queue: []
};

export const getStore = (): StoreState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : DEFAULT_STATE;
};

export const saveStore = (state: StoreState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const calculateWaitTime = (barberId: string, salonId: string, state: StoreState): number => {
  const barberQueue = state.queue.filter(q => 
    q.salonId === salonId && 
    q.barberId === barberId && 
    (q.status === QueueStatus.WAITING || q.status === QueueStatus.IN_PROGRESS)
  );
  
  let totalMinutes = 0;
  barberQueue.forEach(item => {
    item.serviceIds.forEach(sid => {
      const s = state.services.find(srv => srv.id === sid);
      if (s) totalMinutes += s.duration;
    });
  });

  return totalMinutes;
};

export const findFirstAvailableBarber = (salonId: string, state: StoreState): string => {
  const salonBarbers = state.barbers.filter(b => b.salonId === salonId);
  if (salonBarbers.length === 0) return '';

  let minWait = Infinity;
  let bestBarberId = salonBarbers[0].id;

  salonBarbers.forEach(barber => {
    const wait = calculateWaitTime(barber.id, salonId, state);
    if (wait < minWait) {
      minWait = wait;
      bestBarberId = barber.id;
    }
  });

  return bestBarberId;
};

export const addToQueue = (
  salonId: string,
  name: string, 
  phone: string, 
  barberId: string | 'auto', 
  serviceIds: string[]
): QueueItem => {
  const state = getStore();
  const selectedBarberId = barberId === 'auto' ? findFirstAvailableBarber(salonId, state) : barberId;
  
  const newItem: QueueItem = {
    id: Math.random().toString(36).substr(2, 9),
    salonId,
    clientId: Math.random().toString(36).substr(2, 9),
    clientName: name,
    clientPhone: phone,
    barberId: selectedBarberId,
    serviceIds,
    startTime: Date.now(),
    status: QueueStatus.WAITING,
    position: state.queue.filter(q => q.salonId === salonId && q.barberId === selectedBarberId && q.status !== QueueStatus.COMPLETED).length + 1
  };

  state.queue.push(newItem);
  saveStore(state);
  return newItem;
};
