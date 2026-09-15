import { Order, KOTTicket, BOTTicket, CreateOrderPayload, KOTStatus, BOTStatus, TicketItem } from '@/types/order';

// List of categories and keywords that route to The Cheers Bar (BOT)
const BAR_CATEGORIES = new Set([
  'scotch',
  'whisky',
  'whiskey',
  'indian whisky',
  'brandy',
  'rum',
  'vodka',
  'gin',
  'tequila',
  'beer',
  'wine',
  'cocktail',
  'mocktail'
]);

function isBarItem(item: { category: string; volume?: string }): boolean {
  const cat = item.category.toLowerCase().trim();
  if (BAR_CATEGORIES.has(cat)) return true;
  if (item.volume && (item.volume.includes('ML') || item.volume.includes('Bottle') || item.volume.includes('Can'))) {
    return true;
  }
  return false;
}

function parsePrice(price: number | string): number {
  if (typeof price === 'number') return price;
  const match = price.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// Global in-memory singleton to persist across requests in Next.js
declare global {
  var __QAH_ORDER_STORE__: {
    orders: Order[];
    nextKotNum: number;
    nextBotNum: number;
    nextOrderNum: number;
  } | undefined;
}

function initializeStore() {
  if (globalThis.__QAH_ORDER_STORE__) {
    return globalThis.__QAH_ORDER_STORE__;
  }

  globalThis.__QAH_ORDER_STORE__ = {
    orders: [],
    nextKotNum: 501,
    nextBotNum: 201,
    nextOrderNum: 1001,
  };

  return globalThis.__QAH_ORDER_STORE__;
}

export function clearAllOrders(): Order[] {
  const store = initializeStore();
  store.orders = [];
  return store.orders;
}

export function syncExternalOrder(order: Order): Order {
  const store = initializeStore();
  const existingIdx = store.orders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    store.orders[existingIdx] = order;
  } else {
    store.orders.unshift(order);
  }
  return order;
}

export function getAllOrders(): Order[] {
  const store = initializeStore();
  return [...store.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  const store = initializeStore();
  return store.orders.find((o) => o.id === id);
}

export function getAllKOTs(): KOTTicket[] {
  const store = initializeStore();
  const kots: KOTTicket[] = [];
  store.orders.forEach((order) => {
    order.kotTickets.forEach((kot) => {
      kots.push(kot);
    });
  });
  return kots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAllBOTs(): BOTTicket[] {
  const store = initializeStore();
  const bots: BOTTicket[] = [];
  store.orders.forEach((order) => {
    order.botTickets.forEach((bot) => {
      bots.push(bot);
    });
  });
  return bots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createOrder(payload: CreateOrderPayload): Order {
  const store = initializeStore();
  const orderId = `QAH-${store.nextOrderNum++}`;
  const now = new Date().toISOString();

  const kotItems: TicketItem[] = [];
  const botItems: TicketItem[] = [];
  let totalAmount = 0;

  payload.items.forEach((item) => {
    const itemPrice = parsePrice(item.price);
    const lineTotal = itemPrice * item.quantity;
    totalAmount += lineTotal;

    const ticketItem: TicketItem = {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: itemPrice,
      category: item.category,
      volume: item.volume,
      notes: item.notes,
    };

    if (isBarItem(item)) {
      botItems.push(ticketItem);
    } else {
      kotItems.push(ticketItem);
    }
  });

  const kotTickets: KOTTicket[] = [];
  if (kotItems.length > 0) {
    kotTickets.push({
      id: `KOT-${store.nextKotNum++}`,
      orderId,
      roomNumber: payload.roomNumber,
      tableNumber: payload.tableNumber,
      createdAt: now,
      status: 'new',
      items: kotItems,
      specialInstructions: payload.specialInstructions,
    });
  }

  const botTickets: BOTTicket[] = [];
  if (botItems.length > 0) {
    botTickets.push({
      id: `BOT-${store.nextBotNum++}`,
      orderId,
      roomNumber: payload.roomNumber,
      tableNumber: payload.tableNumber,
      createdAt: now,
      status: 'new',
      items: botItems,
      specialInstructions: payload.specialInstructions,
    });
  }

  const effectiveOutlet =
    kotTickets.length > 0 && botTickets.length > 0
      ? 'both'
      : botTickets.length > 0
      ? 'cheers'
      : 'landing';

  const newOrder: Order = {
    id: orderId,
    roomNumber: payload.roomNumber,
    tableNumber: payload.tableNumber,
    guestName: payload.guestName,
    outlet: effectiveOutlet,
    status: 'active',
    createdAt: now,
    specialInstructions: payload.specialInstructions,
    kotTickets,
    botTickets,
    totalAmount,
    paymentStatus: payload.roomNumber ? 'charged_to_room' : 'unpaid',
  };

  store.orders.unshift(newOrder);
  return newOrder;
}

export function updateKOTStatus(kotId: string, status: KOTStatus): KOTTicket | null {
  const store = initializeStore();
  for (const order of store.orders) {
    const kot = order.kotTickets.find((k) => k.id === kotId);
    if (kot) {
      kot.status = status;
      checkAndCompleteOrder(order);
      return kot;
    }
  }
  return null;
}

export function updateBOTStatus(botId: string, status: BOTStatus): BOTTicket | null {
  const store = initializeStore();
  for (const order of store.orders) {
    const bot = order.botTickets.find((b) => b.id === botId);
    if (bot) {
      bot.status = status;
      checkAndCompleteOrder(order);
      return bot;
    }
  }
  return null;
}

function checkAndCompleteOrder(order: Order) {
  const allKotsServed = order.kotTickets.every((k) => k.status === 'served');
  const allBotsDispensed = order.botTickets.every((b) => b.status === 'dispensed');
  if (allKotsServed && allBotsDispensed) {
    order.status = 'completed';
  }
}
