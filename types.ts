
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BARBER = 'BARBER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  salonId?: string; // Rataché à un salon pour les ADMIN et BARBER
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  slug: string; // Pour des URLs plus propres (ex: /le-gentleman)
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  duration: number;
}

export interface Barber {
  id: string;
  salonId: string;
  name: string;
  photo: string;
  chairId: string;
}

export interface Chair {
  id: string;
  salonId: string;
  name: string;
}

export enum QueueStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface QueueItem {
  id: string;
  salonId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  serviceIds: string[];
  startTime: number;
  status: QueueStatus;
  position: number;
}

export interface StoreState {
  salons: Salon[];
  services: Service[];
  barbers: Barber[];
  chairs: Chair[];
  queue: QueueItem[];
  users: User[];
}
