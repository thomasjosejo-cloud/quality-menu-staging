'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { KOTTicket, BOTTicket } from '@/types/order';

interface ThermalTicketModalProps {
  ticket: KOTTicket | BOTTicket | null;
  type: 'kot' | 'bot';
  isOpen: boolean;
  onClose: () => void;
}

export default function ThermalTicketModal({
  ticket,
  type,
  isOpen,
  onClose,
}: ThermalTicketModalProps) {
  if (!isOpen || !ticket) return null;

  const dateStr = new Date(ticket.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeStr = new Date(ticket.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const location = ticket.roomNumber
    ? `ROOM ${ticket.roomNumber}`
    : ticket.tableNumber
    ? `TABLE ${ticket.tableNumber}`
    : 'TAKEAWAY / LOBBY';

  const isKOT = type === 'kot';
  const title = isKOT ? 'KITCHEN ORDER TICKET (KOT)' : 'BAR ORDER TICKET (BOT)';
  const department = isKOT ? 'MAIN KITCHEN / PANTRY' : 'THE CHEERS BAR DISPENSE';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-white/20 p-4 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Controls Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isKOT
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              80mm Thermal Slip
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {ticket.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-[#C5A059] text-black font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-[#DFC27F] transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 80mm ESC/POS Simulated Thermal Paper ── */}
        <div className="overflow-y-auto mt-3 p-4 rounded-xl bg-[#FAF9F5] text-black font-mono text-xs shadow-inner select-text print:p-0 print:m-0 print:bg-white print:text-black">
          <div className="text-center font-bold">
            <div className="text-sm tracking-wider">QUALITY AIRPORT HOTEL</div>
            <div className="text-[10px] text-gray-700">NEDUMBASSERY · COCHIN AIRPORT</div>
            <div className="my-1 border-t border-b border-black py-0.5 font-bold tracking-widest text-xs">
              *** {title} ***
            </div>
            <div className="text-[10px] text-gray-800 uppercase tracking-wide">
              {department}
            </div>
          </div>

          <div className="mt-2 text-[11px] leading-tight border-b border-dashed border-gray-400 pb-1.5">
            <div className="flex justify-between">
              <span>TICKET: <strong className="font-bold">{ticket.id}</strong></span>
              <span>DATE: {dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span>ORDER : {ticket.orderId}</span>
              <span>TIME: {timeStr}</span>
            </div>
            <div className="mt-1 pt-1 border-t border-dotted border-gray-300 flex justify-between items-center text-sm font-bold bg-black/5 px-1 py-0.5 rounded-xs">
              <span>LOCATION:</span>
              <span className="underline">{location}</span>
            </div>
          </div>

          {/* Item Rows */}
          <div className="mt-2 border-b border-dashed border-gray-400 pb-2">
            <div className="flex justify-between font-bold text-[10px] border-b border-black pb-0.5 mb-1 uppercase">
              <span className="w-8">QTY</span>
              <span className="flex-1">ITEM DETAILS</span>
              <span className="w-14 text-right">SIZE</span>
            </div>

            {ticket.items.map((item, idx) => (
              <div key={idx} className="py-1 border-b border-dotted border-gray-200">
                <div className="flex justify-between items-baseline font-bold text-xs">
                  <span className="w-8 text-black">{item.quantity}x</span>
                  <span className="flex-1 text-black pr-1">{item.name}</span>
                  <span className="w-14 text-right text-[10px] text-gray-700">
                    {item.volume || (item.price ? `₹${item.price}` : 'STD')}
                  </span>
                </div>
                {item.notes && (
                  <div className="text-[10px] italic text-red-700 pl-8 font-semibold">
                    &gt;&gt; NOTE: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Special Instructions */}
          {ticket.specialInstructions && (
            <div className="mt-2 text-[11px] bg-amber-50 p-1.5 border border-amber-300 rounded-xs">
              <span className="font-bold text-red-800 block text-[9px] uppercase tracking-wider">
                Special Guest Instructions:
              </span>
              <span className="font-semibold text-black">
                {ticket.specialInstructions}
              </span>
            </div>
          )}

          {/* Footer Tear Line */}
          <div className="mt-4 pt-2 text-center text-[9px] text-gray-500 border-t border-dashed border-gray-400">
            <div>--- TEAR HERE / DISPATCH COPY ---</div>
            <div className="font-sans text-[8px] mt-0.5">
              QAH Cloud POS · System Generated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
