'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChefHat, Wine, CheckCircle2, ArrowRight, X, Hotel,
  UtensilsCrossed, Sparkles, Loader2
} from 'lucide-react';
import { Order } from '@/types/order';

interface LiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoom: string | null;
  defaultTable: string | null;
  onConfirmOrder: (location: { roomNumber?: string; tableNumber?: string }) => Promise<Order | null>;
}

export default function LiveOrderModal({
  isOpen,
  onClose,
  defaultRoom,
  defaultTable,
  onConfirmOrder,
}: LiveOrderModalProps) {
  const [locationType, setLocationType] = useState<'room' | 'table'>(
    defaultTable ? 'table' : 'room'
  );
  const [numberInput, setNumberInput] = useState(defaultRoom || defaultTable || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = numberInput.trim();
    if (!val) {
      setErrorMessage(`Please enter a valid ${locationType === 'room' ? 'Room' : 'Table'} number`);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const order = await onConfirmOrder(
        locationType === 'room' ? { roomNumber: val } : { tableNumber: val }
      );
      if (order) {
        setCreatedOrder(order);
      }
    } catch {
      setErrorMessage('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedOrder(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0B1526] border border-[#C5A059]/30 p-5 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* State 1: Order Success Confirmation */}
        {createdOrder ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E5C07B] block">
              Order Dispatched Successfully
            </span>
            <h3 className="font-serif text-xl font-bold mt-1 text-white">
              Order #{createdOrder.id}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Delivering to{' '}
              <strong className="text-white">
                {createdOrder.roomNumber ? `Room ${createdOrder.roomNumber}` : `Table ${createdOrder.tableNumber}`}
              </strong>
            </p>

            {/* KOT / BOT Dispatch Cards */}
            <div className="my-4 space-y-2 text-left text-xs">
              {createdOrder.kotTickets.map((kot) => (
                <div
                  key={kot.id}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300 block">
                        Kitchen Ticket ({kot.id})
                      </span>
                      <span className="text-[11px] text-slate-300">
                        {kot.items.length} food {kot.items.length === 1 ? 'item' : 'items'} sent to Main Kitchen
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/kitchen"
                    target="_blank"
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1 shrink-0"
                  >
                    <span>View KDS</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              ))}

              {createdOrder.botTickets.map((bot) => (
                <div
                  key={bot.id}
                  className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Wine className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold text-blue-300 block">
                        Bar Ticket ({bot.id})
                      </span>
                      <span className="text-[11px] text-slate-300">
                        {bot.items.length} beverage {bot.items.length === 1 ? 'item' : 'items'} sent to The Cheers Bar
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/bar"
                    target="_blank"
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition flex items-center gap-1 shrink-0"
                  >
                    <span>View Bar</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic mb-4">
              Our chef and sommelier have begun preparing your order. Estimated time: 20–25 minutes.
            </p>

            <div className="flex gap-2">
              <Link
                href="/pos"
                target="_blank"
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-400/30 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>View Dispatch POS</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#C5A059] text-black font-bold text-xs hover:bg-[#DFBE73] transition active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Location Verification Form */
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E5C07B]">
                Order Confirmation
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              Where are we delivering to?
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Your order will be split automatically into KOT (Kitchen) and BOT (The Cheers Bar).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Delivery Destination Toggle */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setLocationType('room')}
                  className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    locationType === 'room'
                      ? 'bg-[#C5A059] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hotel className="w-3.5 h-3.5" />
                  <span>Hotel Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('table')}
                  className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    locationType === 'table'
                      ? 'bg-[#C5A059] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Dining Table</span>
                </button>
              </div>

              {/* Number Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {locationType === 'room' ? 'Room Number' : 'Table Number'}
                </label>
                <input
                  type="text"
                  value={numberInput}
                  onChange={(e) => {
                    setNumberInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={locationType === 'room' ? 'e.g. 204' : 'e.g. 5'}
                  autoFocus
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                />
                {errorMessage && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBE73] text-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Routing KOT &amp; BOT...</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4" />
                    <span>Confirm &amp; Dispatch Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
