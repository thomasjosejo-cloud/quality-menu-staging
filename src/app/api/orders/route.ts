import { NextResponse } from 'next/server';
import {
  getAllOrders,
  getAllKOTs,
  getAllBOTs,
  createOrder,
  updateKOTStatus,
  updateBOTStatus,
  clearAllOrders,
  syncExternalOrder,
} from '@/lib/order-store';
import { CreateOrderPayload, KOTStatus, BOTStatus } from '@/types/order';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const NTFY_TOPIC = 'qah-kds-sync-v2-nedumbassery';

async function broadcastEvent(eventData: Record<string, unknown>) {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': 'QAH Live Order System',
        'Priority': 'high',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
  } catch (err) {
    console.error('Failed to broadcast event to ntfy:', err);
  }
}

// Hydrate in-memory store if fresh Vercel serverless lambda wakes up cold
async function hydrateStoreFromNtfy() {
  if (getAllOrders().length > 0) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return;
    const text = await res.text();
    const lines = text.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (!item.message) continue;
        const data = typeof item.message === 'string' ? JSON.parse(item.message) : item.message;
        if (data.event === 'NEW_ORDER' && data.order) {
          syncExternalOrder(data.order);
        } else if (data.event === 'STATUS_UPDATE') {
          if (data.type === 'kot' && data.ticketId && data.status) {
            updateKOTStatus(data.ticketId, data.status as KOTStatus);
          } else if (data.type === 'bot' && data.ticketId && data.status) {
            updateBOTStatus(data.ticketId, data.status as BOTStatus);
          }
        } else if (data.event === 'CLEAR_ORDERS') {
          clearAllOrders();
        }
      } catch {
        // ignore line parse errors
      }
    }
  } catch {
    // ignore hydration timeout or network errors
  }
}

export async function GET() {
  await hydrateStoreFromNtfy();
  const orders = getAllOrders();
  const kots = getAllKOTs();
  const bots = getAllBOTs();

  return NextResponse.json(
    {
      success: true,
      data: {
        orders,
        kots,
        bots,
        timestamp: new Date().toISOString(),
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body: CreateOrderPayload = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in order payload' },
        { status: 400 }
      );
    }

    if (!body.roomNumber && !body.tableNumber) {
      return NextResponse.json(
        { success: false, error: 'Either roomNumber or tableNumber is required' },
        { status: 400 }
      );
    }

    const order = createOrder(body);

    // Broadcast instant real-time event to Kitchen, Bar, and POS screens
    await broadcastEvent({
      event: 'NEW_ORDER',
      orderId: order.id,
      roomNumber: order.roomNumber,
      tableNumber: order.tableNumber,
      order,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully and split into KOT/BOT',
        data: order,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ticketId, type, status } = body;

    if (!ticketId || !type || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing ticketId, type, or status' },
        { status: 400 }
      );
    }

    if (type === 'kot') {
      const updated = updateKOTStatus(ticketId, status as KOTStatus);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'KOT ticket not found' },
          { status: 404 }
        );
      }

      await broadcastEvent({
        event: 'STATUS_UPDATE',
        type: 'kot',
        ticketId,
        status,
        timestamp: Date.now(),
      });

      return NextResponse.json({ success: true, data: updated });
    } else if (type === 'bot') {
      const updated = updateBOTStatus(ticketId, status as BOTStatus);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'BOT ticket not found' },
          { status: 404 }
        );
      }

      await broadcastEvent({
        event: 'STATUS_UPDATE',
        type: 'bot',
        ticketId,
        status,
        timestamp: Date.now(),
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid ticket type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  clearAllOrders();
  await broadcastEvent({
    event: 'CLEAR_ORDERS',
    timestamp: Date.now(),
  });

  return NextResponse.json(
    { success: true, message: 'All orders cleared successfully' },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
