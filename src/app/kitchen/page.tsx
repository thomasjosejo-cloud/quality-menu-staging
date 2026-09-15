'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  Clock, Flame, CheckCircle2, Printer, Volume2, VolumeX,
  RefreshCw, ChefHat, ArrowRight
} from 'lucide-react';
import { KOTTicket, KOTStatus } from '@/types/order';
import ThermalTicketModal from '@/components/ThermalTicketModal';

/* ── Web Audio Synthesizer for Kitchen Chime ── */
function playKitchenChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // ignore audio block
  }
}

export default function KitchenDisplayPage() {
  const [kots, setKots] = useState<KOTTicket[]>([]);
  const [filter, setFilter] = useState<'all_active' | 'new' | 'cooking' | 'ready'>('all_active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [prevKotCount, setPrevKotCount] = useState(0);
  const [nowMs, setNowMs] = useState(0);

  // Thermal modal state
  const [activePrintTicket, setActivePrintTicket] = useState<KOTTicket | null>(null);

  const [, startTransition] = useTransition();

  const fetchKots = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data?.kots) {
        const fetchedKots: KOTTicket[] = json.data.kots;
        
        // Sound alert on new ticket
        if (fetchedKots.length > prevKotCount && prevKotCount > 0 && soundEnabled) {
          playKitchenChime();
        }
        setPrevKotCount(fetchedKots.length);

        startTransition(() => {
          setKots(fetchedKots);
          setLastRefreshed(new Date());
          setNowMs(Date.now());
        });
      }
    } catch (err) {
      console.error('Failed to poll kitchen orders:', err);
    }
  }, [prevKotCount, soundEnabled]);

  // Live polling every 3 seconds
  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      if (!isMounted) return;
      await fetchKots();
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchKots]);

  const handleStatusChange = async (ticketId: string, newStatus: KOTStatus) => {
    // Optimistic UI update
    setKots((prev) =>
      prev.map((kot) => (kot.id === ticketId ? { ...kot, status: newStatus } : kot))
    );

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, type: 'kot', status: newStatus }),
      });
      fetchKots();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  // Filter KOTs
  const activeKots = kots.filter((k) => k.status !== 'served');
  const displayedKots = activeKots.filter((k) => {
    if (filter === 'new') return k.status === 'new';
    if (filter === 'cooking') return k.status === 'cooking';
    if (filter === 'ready') return k.status === 'ready';
    return true;
  });

  const getUrgency = (createdAt: string) => {
    const baseNow = nowMs || new Date(createdAt).getTime();
    const elapsedMins = Math.floor((baseNow - new Date(createdAt).getTime()) / 60000);
    if (elapsedMins >= 25) {
      return { mins: elapsedMins, color: 'bg-rose-500 text-white animate-pulse', label: 'Overdue' };
    }
    if (elapsedMins >= 15) {
      return { mins: elapsedMins, color: 'bg-amber-500 text-black', label: 'Attention' };
    }
    return { mins: elapsedMins, color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', label: 'On Time' };
  };

  return (
    <div className="min-h-screen bg-[#060D17] text-slate-100 font-sans p-3 sm:p-5 flex flex-col">
      {/* ── Top Kitchen Operations Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-white">
                Kitchen Display System (KDS)
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quality Airport Hotel · Main Kitchen & Pantry Routing
            </p>
          </div>
        </div>

        {/* Prototype Navigation & Audio Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchKots().finally(() => setIsRefreshing(false));
            }}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Prototype Switcher Links */}
          <div className="flex items-center gap-1 border-l pl-2 border-white/10 text-xs">
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
            >
              Guest Menu
            </Link>
            <Link
              href="/bar"
              className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition"
            >
              🍸 Cheers Bar
            </Link>
            <Link
              href="/pos"
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition"
            >
              🛎️ Dispatch POS
            </Link>
          </div>
        </div>
      </header>

      {/* ── Status Metrics & Filters ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        {/* Filter Pills */}
        <div className="flex gap-2 text-xs">
          {[
            { key: 'all_active', label: 'All Active KOTs', count: activeKots.length },
            { key: 'new', label: 'New / Pending', count: activeKots.filter((k) => k.status === 'new').length },
            { key: 'cooking', label: 'Cooking', count: activeKots.filter((k) => k.status === 'cooking').length },
            { key: 'ready', label: 'Ready for Pickup', count: activeKots.filter((k) => k.status === 'ready').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                filter === tab.key
                  ? 'bg-[#C5A059] border-[#C5A059] text-black shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === tab.key ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Updated: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* ── KOT Grid Display ── */}
      {displayedKots.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-24 text-slate-500">
          <ChefHat className="w-12 h-12 mb-2 text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">All Kitchen Orders Clear!</h3>
          <p className="text-xs max-w-sm mt-1">
            Incoming food orders from hotel rooms and dining tables will instantly land here with live preparation timers.
          </p>
          <Link
            href="/"
            className="mt-4 px-4 py-2 rounded-xl bg-[#C5A059] text-black font-bold text-xs hover:bg-[#DFC27F] transition"
          >
            Place Test Order from Guest Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 items-start">
          {displayedKots.map((kot) => {
            const urgency = getUrgency(kot.createdAt);
            const isReady = kot.status === 'ready';
            const isCooking = kot.status === 'cooking';

            return (
              <div
                key={kot.id}
                className={`rounded-2xl border flex flex-col overflow-hidden shadow-xl transition-all duration-300 ${
                  isReady
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-950/40'
                    : isCooking
                    ? 'bg-[#121A28] border-amber-500/40'
                    : 'bg-[#0E1726] border-white/15'
                }`}
              >
                {/* Ticket Top Header */}
                <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#E5C07B]">
                      {kot.id}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide font-sans ${
                        kot.roomNumber
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-400/30'
                          : 'bg-purple-600/30 text-purple-200 border border-purple-400/30'
                      }`}
                    >
                      {kot.roomNumber ? `Room ${kot.roomNumber}` : `Table ${kot.tableNumber}`}
                    </span>
                  </div>

                  {/* Elapsed Urgency Badge */}
                  <div className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1 ${urgency.color}`}>
                    <Clock className="w-3 h-3" />
                    <span>{urgency.mins}m</span>
                  </div>
                </div>

                {/* Ticket Items List */}
                <div className="p-3 flex-1 space-y-2 font-sans">
                  {kot.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#C5A059]/20 text-[#E5C07B] font-bold text-xs flex items-center justify-center shrink-0">
                          {item.quantity}x
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white leading-tight">
                            {item.name}
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          {item.notes && (
                            <div className="text-[11px] text-amber-300 font-medium italic mt-0.5">
                              Note: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Special Guest Instructions */}
                  {kot.specialInstructions && (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200">
                      <strong className="block text-[9px] uppercase font-bold text-rose-300">
                        Chef Note from Guest:
                      </strong>
                      &ldquo;{kot.specialInstructions}&rdquo;
                    </div>
                  )}
                </div>

                {/* Status Progression Actions Bar */}
                <div className="p-3 pt-2 bg-white/5 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActivePrintTicket(kot)}
                    className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Print 80mm Thermal KOT Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {kot.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(kot.id, 'cooking')}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                    >
                      <Flame className="w-3.5 h-3.5 fill-black" />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {kot.status === 'cooking' && (
                    <button
                      onClick={() => handleStatusChange(kot.id, 'ready')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {kot.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(kot.id, 'served')}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <span>Served / Dispatched</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 80mm ESC/POS Thermal Slip Modal ── */}
      <ThermalTicketModal
        ticket={activePrintTicket}
        type="kot"
        isOpen={!!activePrintTicket}
        onClose={() => setActivePrintTicket(null)}
      />
    </div>
  );
}
