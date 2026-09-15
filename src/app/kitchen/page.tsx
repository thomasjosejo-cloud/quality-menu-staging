'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  Clock, Flame, CheckCircle2, Printer, Volume2, VolumeX,
  RefreshCw, ChefHat, ArrowRight, Maximize2, Minimize2, Trash2,
  Sparkles, AlertCircle, Wifi, WifiOff
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

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // audio autoplay may be blocked until first user click
  }
}

export default function KitchenDisplayPage() {
  const [kots, setKots] = useState<KOTTicket[]>([]);
  const [filter, setFilter] = useState<'all_active' | 'new' | 'cooking' | 'ready'>('all_active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Thermal print modal
  const [activePrintTicket, setActivePrintTicket] = useState<KOTTicket | null>(null);

  const [, startTransition] = useTransition();

  // Load cached KOTs from localStorage on initial render
  useEffect(() => {
    try {
      const cached = localStorage.getItem('qah_kds_kots_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setKots(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Update live clock every second for elapsed timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save active tickets to localStorage whenever updated
  const updateKotsAndCache = useCallback((updater: (prev: KOTTicket[]) => KOTTicket[]) => {
    setKots((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('qah_kds_kots_v2', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Fetch KOTs from API
  const fetchKots = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data?.kots) {
        const incomingKots: KOTTicket[] = json.data.kots;

        updateKotsAndCache((prev) => {
          // Merge incoming KOTs with existing state, avoiding status regression
          const map = new Map<string, KOTTicket>();
          incomingKots.forEach((k) => map.set(k.id, k));

          // Check if there's any new KOT to chime
          const isNewTicket = incomingKots.some(
            (k) => !prev.some((p) => p.id === k.id)
          );
          if (isNewTicket && prev.length > 0 && soundEnabled) {
            playKitchenChime();
          }

          return incomingKots;
        });

        startTransition(() => {
          setLastRefreshed(new Date());
          setIsConnected(true);
        });
      }
    } catch (err) {
      console.error('Failed to poll kitchen orders:', err);
      setIsConnected(false);
    }
  }, [updateKotsAndCache, soundEnabled]);

  // Real-time synchronization layer: SSE + BroadcastChannel + Polling fallback
  useEffect(() => {
    // 1. Initial fetch
    fetchKots();

    // 2. Setup Server-Sent Events (SSE) via ntfy.sh for sub-second cross-device push
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('https://ntfy.sh/qah-kds-sync-v2-nedumbassery/sse');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.message) {
            const data = typeof payload.message === 'string' ? JSON.parse(payload.message) : payload.message;

            if (data.event === 'NEW_ORDER' && data.order?.kotTickets) {
              const newKots: KOTTicket[] = data.order.kotTickets;
              if (newKots.length > 0) {
                if (soundEnabled) playKitchenChime();
                updateKotsAndCache((prev) => {
                  const existingIds = new Set(prev.map((k) => k.id));
                  const toAdd = newKots.filter((k) => !existingIds.has(k.id));
                  return [...toAdd, ...prev];
                });
              }
            } else if (data.event === 'STATUS_UPDATE' && data.type === 'kot') {
              updateKotsAndCache((prev) =>
                prev.map((kot) =>
                  kot.id === data.ticketId ? { ...kot, status: data.status as KOTStatus } : kot
                )
              );
            } else if (data.event === 'CLEAR_ORDERS') {
              updateKotsAndCache(() => []);
            }
          }
        } catch {
          // ignore parse errors
        }
      };
    } catch (err) {
      console.warn('SSE not supported or failed to initialize:', err);
    }

    // 3. Setup BroadcastChannel for 0ms same-browser cross-tab sync
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('qah-orders-channel');
        channel.onmessage = (event) => {
          const data = event.data;
          if (data?.event === 'NEW_ORDER' && data.order?.kotTickets) {
            if (soundEnabled) playKitchenChime();
            updateKotsAndCache((prev) => {
              const existingIds = new Set(prev.map((k) => k.id));
              const toAdd = (data.order.kotTickets as KOTTicket[]).filter((k) => !existingIds.has(k.id));
              return [...toAdd, ...prev];
            });
          } else if (data?.event === 'STATUS_UPDATE' && data.type === 'kot') {
            updateKotsAndCache((prev) =>
              prev.map((kot) =>
                kot.id === data.ticketId ? { ...kot, status: data.status as KOTStatus } : kot
              )
            );
          } else if (data?.event === 'CLEAR_ORDERS') {
            updateKotsAndCache(() => []);
          }
        };
      }
    } catch {
      // ignore
    }

    // 4. Fallback Polling interval every 3 seconds
    const interval = setInterval(() => {
      fetchKots();
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [fetchKots, soundEnabled, updateKotsAndCache]);

  // Handle status update (New -> Cooking -> Ready -> Served)
  const handleStatusChange = async (ticketId: string, newStatus: KOTStatus) => {
    // Optimistic UI update
    updateKotsAndCache((prev) =>
      prev.map((kot) => (kot.id === ticketId ? { ...kot, status: newStatus } : kot))
    );

    // Broadcast on local channel immediately
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('qah-orders-channel');
        channel.postMessage({ event: 'STATUS_UPDATE', type: 'kot', ticketId, status: newStatus });
        channel.close();
      }
    } catch {}

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, type: 'kot', status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update ticket status on server:', err);
    }
  };

  // Clear all orders from board
  const handleClearBoard = async () => {
    setShowClearConfirm(false);
    updateKotsAndCache(() => []);

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('qah-orders-channel');
        channel.postMessage({ event: 'CLEAR_ORDERS' });
        channel.close();
      }
      await fetch('/api/orders', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear orders on server:', err);
    }
  };

  // Quick simulation helper to test KDS live
  const handleSimulateTestOrder = async () => {
    try {
      const roomNum = Math.floor(101 + Math.random() * 300).toString();
      const sampleItems = [
        {
          id: 'test-biryani',
          name: 'Malabar Chicken Biryani',
          quantity: 1,
          price: 340,
          category: 'Kerala Speciality',
          notes: 'Extra raita requested',
        },
        {
          id: 'test-bread',
          name: 'Butter Naan',
          quantity: 2,
          price: 60,
          category: 'Indian Breads',
        },
      ];

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomNum,
          outlet: 'landing',
          items: sampleItems,
          specialInstructions: 'Urgent airport departure in 40 mins',
        }),
      });

      fetchKots();
    } catch (err) {
      console.error('Failed to simulate test order:', err);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Listen to fullscreen exit event (e.g. Esc key)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Filter KOTs
  const activeKots = kots.filter((k) => k.status !== 'served');
  const displayedKots = activeKots.filter((k) => {
    if (filter === 'new') return k.status === 'new';
    if (filter === 'cooking') return k.status === 'cooking';
    if (filter === 'ready') return k.status === 'ready';
    return true;
  });

  const getUrgency = (createdAt: string) => {
    const createdMs = new Date(createdAt).getTime();
    const elapsedSeconds = Math.max(0, Math.floor((nowMs - createdMs) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeDisplay = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    if (mins >= 25) {
      return {
        mins,
        timeDisplay,
        statusColor: 'text-rose-700 bg-rose-100 border-rose-300',
        topBandColor: 'border-t-rose-600',
        headerBg: 'bg-rose-50/80',
        isOverdue: true,
        label: 'OVERDUE',
      };
    }
    if (mins >= 15) {
      return {
        mins,
        timeDisplay,
        statusColor: 'text-amber-800 bg-amber-100 border-amber-300',
        topBandColor: 'border-t-amber-500',
        headerBg: 'bg-amber-50/70',
        isOverdue: false,
        label: 'ATTENTION',
      };
    }
    return {
      mins,
      timeDisplay,
      statusColor: 'text-emerald-800 bg-emerald-100 border-emerald-300',
      topBandColor: 'border-t-emerald-500',
      headerBg: 'bg-emerald-50/50',
      isOverdue: false,
      label: 'ON TIME',
    };
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans p-3 sm:p-5 flex flex-col selection:bg-amber-200">
      {/* ── Top Commercial Operations Header Bar ── */}
      <header className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Branding & Station */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#8C6B1C] text-white flex items-center justify-center shadow-sm shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                Kitchen Display System (KDS)
              </h1>
              <span
                className={`text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
                    Live Cloud Sync
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    Connecting...
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Quality Airport Hotel · The Landing Main Kitchen & Pantry
            </p>
          </div>
        </div>

        {/* Operational Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
              soundEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
            title="Toggle kitchen bell chime on new orders"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Fullscreen TV/Tablet Toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Fullscreen Wall TV / Tablet Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'TV Kiosk'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchKots().finally(() => setIsRefreshing(false));
            }}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer shadow-2xs"
            title="Refresh Order Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* Reset / Clear Board */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Clear all completed tickets from board"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Clear Board</span>
          </button>

          {/* Simulate Test Order Button */}
          <button
            onClick={handleSimulateTestOrder}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            title="Send an instant test order to the kitchen display"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Test KOT</span>
          </button>

          {/* Module Switcher Links */}
          <div className="flex items-center gap-1 border-l pl-2 border-slate-200 text-xs font-bold">
            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Open Guest Digital Menu in new tab"
            >
              Guest Menu ↗
            </Link>
            <Link
              href="/bar"
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition"
            >
              🍸 Bar BOT
            </Link>
            <Link
              href="/pos"
              className="px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 transition"
            >
              🛎️ Dispatch POS
            </Link>
          </div>
        </div>
      </header>

      {/* ── Status Metrics & Station Filters Bar ── */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Filter Pills */}
        <div className="flex gap-1.5 sm:gap-2 text-xs flex-wrap">
          {[
            { key: 'all_active', label: 'All Active KOTs', count: activeKots.length, badgeBg: 'bg-slate-200 text-slate-800' },
            { key: 'new', label: 'New / Pending', count: activeKots.filter((k) => k.status === 'new').length, badgeBg: 'bg-blue-100 text-blue-800' },
            { key: 'cooking', label: 'Cooking', count: activeKots.filter((k) => k.status === 'cooking').length, badgeBg: 'bg-amber-100 text-amber-800' },
            { key: 'ready', label: 'Ready for Pickup', count: activeKots.filter((k) => k.status === 'ready').length, badgeBg: 'bg-emerald-100 text-emerald-800' },
          ].map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-3 py-1.5 sm:py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : tab.badgeBg
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Digital Clock & Auto Sync Time */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono font-bold">
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {new Date(nowMs).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            Sync: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ── KOT Grid Display (Light Commercial Theme) ── */}
      {displayedKots.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
            <ChefHat className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            All Kitchen Orders Clear!
          </h3>
          <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
            The board is standing by with live cloud sync. Real-time food orders placed by hotel guests or captains will instantly appear here with live preparation countdowns.
          </p>
          <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
            <button
              onClick={handleSimulateTestOrder}
              className="px-5 py-2.5 rounded-xl bg-[#8C6B1C] hover:bg-[#6D5213] text-white font-bold text-sm shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Send Sample Test Order</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition"
            >
              Open Guest Menu ↗
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 items-start">
          {displayedKots.map((kot) => {
            const urgency = getUrgency(kot.createdAt);
            const isCooking = kot.status === 'cooking';
            const isReady = kot.status === 'ready';

            return (
              <div
                key={kot.id}
                className={`bg-white rounded-2xl border-2 shadow-md transition-all duration-300 flex flex-col overflow-hidden ${
                  urgency.topBandColor
                } border-t-6 ${
                  isReady
                    ? 'border-emerald-400 shadow-emerald-100 ring-2 ring-emerald-500/20'
                    : isCooking
                    ? 'border-amber-400 shadow-amber-100 ring-2 ring-amber-500/20'
                    : 'border-slate-300 shadow-slate-200'
                }`}
              >
                {/* ── Ticket Card Header ── */}
                <div className={`p-3.5 border-b border-slate-200 flex items-center justify-between gap-2 ${urgency.headerBg}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Location Badge (Room or Table) */}
                    <span
                      className={`text-xs sm:text-sm font-extrabold uppercase tracking-wide px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5 ${
                        kot.roomNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-700 text-white'
                      }`}
                    >
                      {kot.roomNumber ? `🏨 ROOM ${kot.roomNumber}` : `🍽️ TABLE ${kot.tableNumber}`}
                    </span>

                    {/* Monospace KOT ID */}
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      #{kot.id}
                    </span>
                  </div>

                  {/* Elapsed Live Urgency Timer */}
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border shadow-2xs ${urgency.statusColor}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{urgency.timeDisplay}</span>
                  </div>
                </div>

                {/* ── Status Banner ── */}
                <div className="px-3.5 py-1.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 uppercase tracking-wider text-[10px]">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full uppercase text-[10px] tracking-wider font-extrabold ${
                      isReady
                        ? 'bg-emerald-600 text-white'
                        : isCooking
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {isReady ? '✓ Ready for Pickup' : isCooking ? '🔥 In Preparation' : '● New Order'}
                  </span>
                </div>

                {/* ── Ticket Items List ── */}
                <div className="p-3.5 flex-1 space-y-2.5 bg-white">
                  {kot.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-2.5"
                    >
                      {/* Quantity Badge */}
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {item.quantity}×
                      </span>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        {item.notes && (
                          <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5 mt-1 font-medium italic">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Special Guest Instructions Callout */}
                  {kot.specialInstructions && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-xs text-amber-950 font-medium">
                      <strong className="block text-[10px] uppercase font-bold text-amber-900">
                        Guest Instruction:
                      </strong>
                      &ldquo;{kot.specialInstructions}&rdquo;
                    </div>
                  )}
                </div>

                {/* ── Status Progression Action Buttons (Touch Friendly) ── */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                  {/* Thermal Slip Print */}
                  <button
                    onClick={() => setActivePrintTicket(kot)}
                    className="p-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition shadow-2xs cursor-pointer shrink-0"
                    title="Print 80mm ESC/POS KOT Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Flow Action: New -> Cooking */}
                  {kot.status === 'new' && (
                    <button
                      onClick={() => handleStatusChange(kot.id, 'cooking')}
                      className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Flame className="w-4 h-4 fill-white" />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {/* Flow Action: Cooking -> Ready */}
                  {kot.status === 'cooking' && (
                    <button
                      onClick={() => handleStatusChange(kot.id, 'ready')}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {/* Flow Action: Ready -> Served */}
                  {kot.status === 'ready' && (
                    <button
                      onClick={() => handleStatusChange(kot.id, 'served')}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      <span>Mark Served / Done</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Clear Board Confirmation Modal ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl max-w-sm w-full text-slate-900">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center">Clear Kitchen Display?</h3>
            <p className="text-xs text-slate-600 text-center mt-1 leading-relaxed">
              This will remove all active and completed KOT tickets from the kitchen screen and reset the board for a fresh shift.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearBoard}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
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
