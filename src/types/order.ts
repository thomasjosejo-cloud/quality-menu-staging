export type OrderStatus = 'active' | 'completed' | 'cancelled';

export type KOTStatus = 'new' | 'cooking' | 'ready' | 'served';
export type BOTStatus = 'new' | 'pouring' | 'ready' | 'dispensed';

export type KitchenStation = 'curry' | 'tandoor' | 'continental' | 'pantry' | 'all';

export interface TicketItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  volume?: string;
  notes?: string;
  station?: KitchenStation;
}

export interface KOTTicket {
  id: string; // e.g. "KOT-1041"
  orderId: string;
  roomNumber?: string;
  tableNumber?: string;
  createdAt: string; // ISO string
  status: KOTStatus;
  items: TicketItem[];
  specialInstructions?: string;
  elapsedMinutes?: number;
}

export interface BOTTicket {
  id: string; // e.g. "BOT-0412"
  orderId: string;
  roomNumber?: string;
  tableNumber?: string;
  createdAt: string; // ISO string
  status: BOTStatus;
  items: TicketItem[];
  specialInstructions?: string;
  elapsedMinutes?: number;
}

export interface Order {
  id: string; // e.g. "QAH-1041"
  roomNumber?: string;
  tableNumber?: string;
  guestName?: string;
  outlet: 'landing' | 'cheers' | 'both';
  status: OrderStatus;
  createdAt: string; // ISO string
  specialInstructions?: string;
  kotTickets: KOTTicket[];
  botTickets: BOTTicket[];
  totalAmount: number;
  paymentStatus?: 'unpaid' | 'paid' | 'charged_to_room';
}

export interface CreateOrderPayload {
  roomNumber?: string;
  tableNumber?: string;
  guestName?: string;
  outlet: 'landing' | 'cheers' | 'both';
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number | string;
    category: string;
    volume?: string;
    notes?: string;
  }[];
  specialInstructions?: string;
}
