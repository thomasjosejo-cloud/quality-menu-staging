'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  Wine, Clock, CheckCircle2, Printer, Volume2, VolumeX,
  RefreshCw, ArrowRight, GlassWater
} from 'lucide-react';
import { BOTTicket, BOTStatus } from '@/types/order';
import ThermalTicketModal from '@/components/ThermalTicketModal';

/* ── Web Audio Synthesizer for Bar Chime ── */
function playBarChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.15); // B5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // ignore audio block
  }
}

export default function BarDisplayPage() {
  const [bots, setBots] = useState<BOTTicket[]>([]);
  const [filter, setFilter] = useState<'all_active' | 'new' | 'pouring' | 'ready'>('all_active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [prevBotCount, setPrevBotCount] = useState(0);
  const [nowMs, setNowMs] = useState(0);

  const [activePrintTicket, setActivePrintTicket] = useState<BOTTicket | null>(null);
  const [, startTransition] = useTransition();

  const fetchBots = useCallback(async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data?.bots) {
        const fetchedBots: BOTTicket[] = json.data.bots;

        if (fetchedBots.length > prevBotCount && prevBotCount > 0 && soundEnabled) {
          playBarChime();
        }
        setPrevBotCount(fetchedBots.length);

        startTransition(() => {
          setBots(fetchedBots);
          setLastRefreshed(new Date());
          setNowMs(Date.now());
        });
      }
    } catch (err) {
      console.error('Failed to poll bar orders:', err);
    }
  }, [prevBotCount, soundEnabled]);

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      if (!isMounted) return;
      await fetchBots();
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchBots]);

  const handleStatusChange = async (ticketId: string, newStatus: BOTStatus) => {
    setBots((prev) =>
      prev.map((bot) => (bot.id === ticketId ? { ...bot, status: newStatus } : bot))
    );

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, type: 'bot', status: newStatus }),
      });
      fetchBots();
    } catch (err) {
      console.error('Failed to update BOT status:', err);
    }
  };

  const activeBots = bots.filter((b) => b.status !== 'dispensed');
  const displayedBots = activeBots.filter((b) => {
    if (filter === 'new') return b.status === 'new';
    if (filter === 'pouring') return b.status === 'pouring';
    if (filter === 'ready') return b.status === 'ready';
    return true;
  });

  const getUrgency = (createdAt: string) => {
    const baseNow = nowMs || new Date(createdAt).getTime();
    const elapsedMins = Math.floor((baseNow - new Date(createdAt).getTime()) / 60000);
    if (elapsedMins >= 15) {
      return { mins: elapsedMins, color: 'bg-rose-500 text-white animate-pulse' };
    }
    if (elapsedMins >= 8) {
      return { mins: elapsedMins, color: 'bg-amber-500 text-black' };
    }
    return { mins: elapsedMins, color: 'bg-sky-500/20 text-sky-300 border border-sky-500/40' };
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 font-sans p-3 sm:p-5 flex flex-col">
      {/* ── Top Bar Operations Bar ── */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#C5A059]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
            <Wine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-white">
                The Cheers Bar — Dispense Kiosk (BOT)
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live Dispense
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quality Airport Hotel · Single Malts, Brandy, Beers & Spirit Dispensing
            </p>
          </div>
        </div>

        {/* Prototype Navigation & Audio Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              soundEnabled
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchBots().finally(() => setIsRefreshing(false));
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
              href="/kitchen"
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition"
            >
              👨‍🍳 Kitchen KDS
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
            { key: 'all_active', label: 'All Active BOTs', count: activeBots.length },
            { key: 'new', label: 'Pending Dispense', count: activeBots.filter((b) => b.status === 'new').length },
            { key: 'pouring', label: 'Pouring / Chilling', count: activeBots.filter((b) => b.status === 'pouring').length },
            { key: 'ready', label: 'Ready at Counter', count: activeBots.filter((b) => b.status === 'ready').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE73] border-[#C5A059] text-black shadow-sm'
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

      {/* ── BOT Grid Display ── */}
      {displayedBots.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-24 text-slate-500">
          <Wine className="w-12 h-12 mb-2 text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">All Bar Orders Dispensed!</h3>
          <p className="text-xs max-w-sm mt-1">
            Incoming drink orders (Morpheus Blue, JW Black, Budweiser, Bombay Sapphire) will arrive here instantly with exact ML measures.
          </p>
          <Link
            href="/?outlet=cheers"
            className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#DFBE73] text-black font-bold text-xs hover:brightness-110 transition"
          >
            Order Drinks from Cheers Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 items-start">
          {displayedBots.map((bot) => {
            const urgency = getUrgency(bot.createdAt);
            const isReady = bot.status === 'ready';
            const isPouring = bot.status === 'pouring';

            return (
              <div
                key={bot.id}
                className={`rounded-2xl border flex flex-col overflow-hidden shadow-xl transition-all duration-300 ${
                  isReady
                    ? 'bg-blue-950/30 border-blue-400/50 shadow-blue-950/40'
                    : isPouring
                    ? 'bg-[#101E36] border-sky-400/40'
                    : 'bg-[#0B1526] border-white/15'
                }`}
              >
                {/* Ticket Top Header */}
                <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#E5C07B]">
                      {bot.id}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide font-sans ${
                        bot.roomNumber
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-400/30'
                          : 'bg-purple-600/30 text-purple-200 border border-purple-400/30'
                      }`}
                    >
                      {bot.roomNumber ? `Room ${bot.roomNumber}` : `Table ${bot.tableNumber}`}
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
                  {bot.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.quantity}x
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white leading-tight">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {item.category}
                            </span>
                            {item.volume && (
                              <span className="text-[10px] font-bold text-amber-300 font-mono flex items-center gap-0.5 bg-amber-400/10 px-1.5 py-0.2 rounded-md border border-amber-400/20">
                                <GlassWater className="w-2.5 h-2.5" />
                                {item.volume}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <div className="text-[11px] text-sky-300 font-medium italic mt-0.5">
                              Mixer: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Special Guest Instructions */}
                  {bot.specialInstructions && (
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-200">
                      <strong className="block text-[9px] uppercase font-bold text-blue-300">
                        Bar Note:
                      </strong>
                      &ldquo;{bot.specialInstructions}&rdquo;
                    </div>
                  )}
                </div>

                {/* Status Progression Actions Bar */}
                <div className="p-3 pt-2 bg-white/5 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActivePrintTicket(bot)}
                    className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Print 80mm Thermal BOT Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {bot.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(bot.id, 'pouring')}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                    >
                      <Wine className="w-3.5 h-3.5" />
                      <span>Start Pouring</span>
                    </button>
                  )}

                  {bot.status === 'pouring' && (
                    <button
                      onClick={() => handleStatusChange(bot.id, 'ready')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready at Counter</span>
                    </button>
                  )}

                  {bot.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(bot.id, 'dispensed')}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <span>Dispensed / Collected</span>
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
        type="bot"
        isOpen={!!activePrintTicket}
        onClose={() => setActivePrintTicket(null)}
      />
    </div>
  );
}
