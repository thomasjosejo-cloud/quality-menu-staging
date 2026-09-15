'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  BellRing, CheckCircle2, Printer,
  RefreshCw, UtensilsCrossed, Wine, ChefHat, X
} from 'lucide-react';
import { Order } from '@/types/order';

export default function PosDispatchPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [, startTransition] = useTransition();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data?.orders) {
        startTransition(() => {
          setOrders(json.data.orders);
          setLastRefreshed(new Date());
        });
      }
    } catch (err) {
      console.error('Failed to poll POS orders:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('https://ntfy.sh/qah-kds-sync-v2-nedumbassery/sse');
      eventSource.onmessage = () => {
        fetchOrders();
      };
    } catch {}

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('qah-orders-channel');
        channel.onmessage = () => {
          fetchOrders();
        };
      }
    } catch {}

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const activeOrders = orders.filter((o) => o.status === 'active');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 font-sans p-3 sm:p-5 flex flex-col">
      {/* ── Top POS Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-white">
                F&B Captain Dispatch & POS Hub
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-1">
                Room & Table Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quality Airport Hotel · Dual KOT + BOT Readiness & Folio Billing
            </p>
          </div>
        </div>

        {/* Prototype Switcher Navigation */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchOrders().finally(() => setIsRefreshing(false));
            }}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
          >
            Guest Menu
          </Link>
          <Link
            href="/kitchen"
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition"
          >
            👨‍🍳 Kitchen KDS
          </Link>
          <Link
            href="/bar"
            className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition"
          >
            🍸 Cheers Bar
          </Link>
        </div>
      </header>

      {/* ── Main Operations Grid (Orders List + Bill Drawer) ── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 items-start">
        {/* Active Orders List (Span 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Active Hotel Orders ({activeOrders.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Refreshed {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </h2>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="font-bold text-slate-300 text-sm">No Active Orders</p>
              <p className="text-xs mt-1 text-slate-500">All guest orders have been delivered and settled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeOrders.map((order) => {
                const isFoodReady =
                  order.kotTickets.length === 0 ||
                  order.kotTickets.every((k) => k.status === 'ready' || k.status === 'served');
                const isBarReady =
                  order.botTickets.length === 0 ||
                  order.botTickets.every((b) => b.status === 'ready' || b.status === 'dispensed');
                const allReadyForDelivery = isFoodReady && isBarReady;

                const location = order.roomNumber ? `Room ${order.roomNumber}` : `Table ${order.tableNumber}`;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      allReadyForDelivery
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                        : selectedOrder?.id === order.id
                        ? 'bg-[#121E33] border-[#C5A059]'
                        : 'bg-[#0D1626] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Top Order Row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold font-serif text-white">
                              {location}
                            </span>
                            <span className="font-mono text-xs text-[#E5C07B]">
                              {order.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <span className="font-sans text-sm font-bold text-white tabular-nums">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Ready for Dispatch Banner */}
                      {allReadyForDelivery && (
                        <div className="mb-3 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between text-xs font-bold text-emerald-300">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Ready for Dispatch!
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-emerald-400/20">
                            Runner Alert
                          </span>
                        </div>
                      )}

                      {/* Dual Ticket Status Breakdown */}
                      <div className="space-y-1.5 border-t border-white/10 pt-2.5 text-xs">
                        {/* KOT Status Row */}
                        {order.kotTickets.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                              <span>Kitchen KOT ({order.kotTickets[0].items.length} dishes)</span>
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                order.kotTickets[0].status === 'ready'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : order.kotTickets[0].status === 'cooking'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-white/10 text-slate-300'
                              }`}
                            >
                              {order.kotTickets[0].status}
                            </span>
                          </div>
                        )}

                        {/* BOT Status Row */}
                        {order.botTickets.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Wine className="w-3.5 h-3.5 text-blue-400" />
                              <span>Bar BOT ({order.botTickets[0].items.length} drinks)</span>
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                order.botTickets[0].status === 'ready'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : order.botTickets[0].status === 'pouring'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  : 'bg-white/10 text-slate-300'
                              }`}
                            >
                              {order.botTickets[0].status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Click to view bill & folio</span>
                      <span className="text-[#C5A059] font-bold">Inspect &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed Orders Summary */}
          {completedOrders.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Settled / Delivered Orders Today ({completedOrders.length})
              </h3>
              <div className="space-y-1.5">
                {completedOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-2 rounded-xl bg-white/5 flex items-center justify-between text-xs text-slate-400"
                  >
                    <span>{o.roomNumber ? `Room ${o.roomNumber}` : `Table ${o.tableNumber}`} · {o.id}</span>
                    <span className="font-bold text-slate-300">₹{o.totalAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Folio Bill & Check Preview (Right Column) ── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/15 bg-[#0C1524] p-4 shadow-xl sticky top-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-serif font-bold text-base text-white">
                Guest Folio Check
              </h3>
              {selectedOrder && (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedOrder ? (
              <div className="mt-3 space-y-3 font-sans text-xs">
                {/* Folio Metadata */}
                <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Folio ID:</span>
                    <strong className="font-mono text-white">{selectedOrder.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <strong className="text-[#E5C07B]">
                      {selectedOrder.roomNumber ? `Room ${selectedOrder.roomNumber}` : `Table ${selectedOrder.tableNumber}`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billing:</span>
                    <span className="capitalize font-bold text-emerald-400">
                      {selectedOrder.paymentStatus?.replace(/_/g, ' ') || 'Charged to Room'}
                    </span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="border-t border-b border-white/10 py-2 space-y-1.5 max-h-60 overflow-y-auto">
                  {selectedOrder.kotTickets.flatMap((k) => k.items).map((item, i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-mono tabular-nums font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {selectedOrder.botTickets.flatMap((b) => b.items).map((item, i) => (
                    <div key={i} className="flex justify-between text-blue-300">
                      <span>{item.quantity}x {item.name} ({item.volume})</span>
                      <span className="font-mono tabular-nums font-semibold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST & Taxes (Incl.):</span>
                    <span className="font-mono">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white border-t border-white/10 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="text-[#E5C07B] font-mono text-base">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Print Master Check Action */}
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#DFC27F] text-black font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-md mt-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Guest Bill / Check</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select an active order card from the left to view the item breakdown, print the check, or verify dispatch status.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
