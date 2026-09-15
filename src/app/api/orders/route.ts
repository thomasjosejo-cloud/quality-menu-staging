import { NextResponse } from 'next/server';
import {
  getAllOrders,
  getAllKOTs,
  getAllBOTs,
  createOrder,
  updateKOTStatus,
  updateBOTStatus,
} from '@/lib/order-store';
import { CreateOrderPayload, KOTStatus, BOTStatus } from '@/types/order';

export async function GET() {
  const orders = getAllOrders();
  const kots = getAllKOTs();
  const bots = getAllBOTs();

  return NextResponse.json({
    success: true,
    data: {
      orders,
      kots,
      bots,
      timestamp: new Date().toISOString(),
    },
  });
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

    return NextResponse.json({
      success: true,
      message: 'Order created successfully and split into KOT/BOT',
      data: order,
    });
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
      return NextResponse.json({ success: true, data: updated });
    } else if (type === 'bot') {
      const updated = updateBOTStatus(ticketId, status as BOTStatus);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'BOT ticket not found' },
          { status: 404 }
        );
      }
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
