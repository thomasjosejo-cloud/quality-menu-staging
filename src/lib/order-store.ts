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

  const now = Date.now();
  const tenMinsAgo = new Date(now - 14 * 60 * 1000).toISOString();
  const fiveMinsAgo = new Date(now - 6 * 60 * 1000).toISOString();
  const twoMinsAgo = new Date(now - 2 * 60 * 1000).toISOString();

  const initialOrders: Order[] = [
    {
      id: 'QAH-1041',
      roomNumber: '204',
      outlet: 'both',
      status: 'active',
      createdAt: tenMinsAgo,
      specialInstructions: 'Extra spicy curry please. Cut parottas into quarters.',
      totalAmount: 1100,
      paymentStatus: 'charged_to_room',
      kotTickets: [
        {
          id: 'KOT-501',
          orderId: 'QAH-1041',
          roomNumber: '204',
          createdAt: tenMinsAgo,
          status: 'cooking',
          specialInstructions: 'Extra spicy curry please. Cut parottas into quarters.',
          items: [
            { id: 'reg8', name: 'Alleppey Fish Curry', quantity: 1, price: 340, category: 'Regional', notes: 'Extra spicy' },
            { id: 'rot1', name: 'Kerala Parotta', quantity: 2, price: 50, category: 'Rotis & Breads' },
          ]
        }
      ],
      botTickets: [
        {
          id: 'BOT-201',
          orderId: 'QAH-1041',
          roomNumber: '204',
          createdAt: tenMinsAgo,
          status: 'ready',
          specialInstructions: 'Serve with fresh lime and ice cubes.',
          items: [
            { id: 'br1', name: 'Morpheus Blue', quantity: 1, price: 380, volume: '60 ML', category: 'Brandy', notes: 'With soda & ice' }
          ]
        }
      ]
    },
    {
      id: 'QAH-1042',
      tableNumber: '4',
      outlet: 'cheers',
      status: 'active',
      createdAt: fiveMinsAgo,
      specialInstructions: 'Chilled glasses for beer.',
      totalAmount: 1080,
      paymentStatus: 'unpaid',
      kotTickets: [
        {
          id: 'KOT-502',
          orderId: 'QAH-1042',
          tableNumber: '4',
          createdAt: fiveMinsAgo,
          status: 'new',
          specialInstructions: 'Mint chutney on side.',
          items: [
            { id: 'tan3', name: 'Chicken Tikka', quantity: 1, price: 400, category: 'Tandoor' }
          ]
        }
      ],
      botTickets: [
        {
          id: 'BOT-202',
          orderId: 'QAH-1042',
          tableNumber: '4',
          createdAt: fiveMinsAgo,
          status: 'pouring',
          items: [
            { id: 'beer1', name: 'Budweiser', quantity: 2, price: 340, volume: '650 ML', category: 'Beer' }
          ]
        }
      ]
    },
    {
      id: 'QAH-1043',
      roomNumber: '312',
      outlet: 'landing',
      status: 'active',
      createdAt: twoMinsAgo,
      specialInstructions: 'Brown bread for sandwich if available.',
      totalAmount: 980,
      paymentStatus: 'charged_to_room',
      kotTickets: [
        {
          id: 'KOT-503',
          orderId: 'QAH-1043',
          roomNumber: '312',
          createdAt: twoMinsAgo,
          status: 'new',
          specialInstructions: 'Brown bread for sandwich if available.',
          items: [
            { id: 'sw3', name: 'Quality Club Sandwich', quantity: 2, price: 290, category: 'Sandwiches' },
            { id: 'bv3', name: 'Cold Coffee', quantity: 2, price: 200, category: 'Beverages' }
          ]
        }
      ],
      botTickets: []
    }
  ];

  globalThis.__QAH_ORDER_STORE__ = {
    orders: initialOrders,
    nextKotNum: 504,
    nextBotNum: 203,
    nextOrderNum: 1044,
  };

  return globalThis.__QAH_ORDER_STORE__;
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
