'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search, Phone, MessageSquare, Clock, Sparkles, X,
  Wine, UtensilsCrossed, ChevronDown, ArrowUp, Info, Sun, Moon,
  GlassWater, ShoppingBag, Plus, Minus, Trash2, BookOpen, Flame, Zap, ChefHat
} from 'lucide-react';
import { MENU_DATA, LANDING_SIGNATURES } from '@/data/menu-data';
import { CHEERS_BAR_DATA, CHEERS_SIGNATURES } from '@/data/cheers-bar-data';
import { OutletType, MenuSection, MenuItem, ItemVariant } from '@/types/menu';
import CheersBarBanner from '@/components/CheersBarBanner';
import LiveOrderModal from '@/components/LiveOrderModal';

/* ── Time-Aware Greeting ─────────────────── */
function getGreeting(): { text: string; activeSection?: string } {
  const hour = new Date().getHours();
  const minutes = new Date().getMinutes();
  const totalMinutes = hour * 60 + minutes;

  if (totalMinutes >= 420 && totalMinutes <= 630) {
    return { text: 'Good Morning', activeSection: 'breakfast' };
  } else if (hour >= 12 && hour < 15) {
    return { text: 'Good Afternoon' };
  } else if (hour >= 15 && hour < 19) {
    return { text: 'Good Evening', activeSection: 'desserts-beverages' };
  } else if (hour >= 19) {
    return { text: 'Good Evening' };
  }
  return { text: 'Welcome' };
}

/* ── Count items in a section ────────────── */
function countItems(section: MenuSection): number {
  return section.subsections?.reduce((sum, sub) => sum + sub.items.length, 0) ?? 0;
}

/* ── Keyword Highlight Helper ────────────── */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-300/40 dark:bg-amber-400/30 text-inherit font-bold rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/* ── Parse Numeric Price for Totals ───────── */
function parsePrice(price: number | string): number {
  if (typeof price === 'number') return price;
  const match = price.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/* ── Main Menu Content ───────────────────── */
function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table');
  const roomNumber = searchParams.get('room');
  const initialOutlet = searchParams.get('outlet');

  const greeting = useMemo(() => getGreeting(), []);

  const [activeOutlet, setActiveOutlet] = useState<OutletType>(() => {
    if (initialOutlet === 'bar' || initialOutlet === 'cheers') return 'cheers';
    return 'landing';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'nonveg' | 'special' | 'express'>('all');

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const isBar = initialOutlet === 'bar' || initialOutlet === 'cheers';
    const dataset = isBar ? CHEERS_BAR_DATA : MENU_DATA;
    const defaultSection = !isBar && greeting.activeSection
      ? greeting.activeSection
      : dataset[0]?.id;
    return defaultSection ? new Set([defaultSection]) : new Set();
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [themeTransition, setThemeTransition] = useState(false);

  /* ── 9.8+ Interactive Tray & Category Drawer State ── */
  const [tray, setTray] = useState<Record<string, { item: MenuItem; variant?: ItemVariant; quantity: number }>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');

  // Load saved theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qah-theme') as 'light' | 'dark' | null;
      if (saved && (saved === 'light' || saved === 'dark')) {
        requestAnimationFrame(() => setTheme(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    setThemeTransition(true);
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('qah-theme', next);
    } catch {
      // ignore
    }
    setTimeout(() => setThemeTransition(false), 350);
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeDataset: MenuSection[] = activeOutlet === 'landing' ? MENU_DATA : CHEERS_BAR_DATA;
  const activeSignatures: MenuItem[] = activeOutlet === 'landing' ? LANDING_SIGNATURES : CHEERS_SIGNATURES;

  // Filter items
  const filteredSections = useMemo(() => {
    return activeDataset
      .map((section) => {
        const filteredSub = section.subsections
          ?.map((sub) => {
            const items = sub.items.filter((item) => {
              const q = searchQuery.toLowerCase();
              const matchesSearch =
                item.name.toLowerCase().includes(q) ||
                (item.description && item.description.toLowerCase().includes(q)) ||
                item.category.toLowerCase().includes(q) ||
                (item.variants && item.variants.some((v) => v.name.toLowerCase().includes(q)));

              let matchesDiet = true;
              if (dietaryFilter === 'veg') {
                matchesDiet = item.isVeg === true || (item.variants && item.variants.some((v) => v.isVeg === true)) === true;
              }
              if (dietaryFilter === 'nonveg') {
                matchesDiet = item.isVeg === false || (item.variants && item.variants.some((v) => v.isVeg === false)) === true;
              }
              if (dietaryFilter === 'special') matchesDiet = item.isChefSpecial === true;
              if (dietaryFilter === 'express') matchesDiet = item.isExpress === true;

              return matchesSearch && matchesDiet;
            });
            return { ...sub, items };
          })
          .filter((sub) => sub.items.length > 0);

        return { ...section, subsections: filteredSub };
      })
      .filter((section) => section.subsections && section.subsections.length > 0);
  }, [activeDataset, searchQuery, dietaryFilter]);

  const isSearching = searchQuery.length > 0 || dietaryFilter !== 'all';

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const jumpToSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
    setIsCategoryDrawerOpen(false);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, []);

  /* ── Variant Selection Helper ── */
  const getActiveVariant = useCallback(
    (item: MenuItem): ItemVariant | undefined => {
      if (!item.variants || item.variants.length === 0) return undefined;
      const selectedId = selectedVariants[item.id];
      if (selectedId) {
        const found = item.variants.find((v) => v.id === selectedId);
        if (found) return found;
      }
      if (dietaryFilter === 'veg') {
        const vegVar = item.variants.find((v) => v.isVeg === true);
        if (vegVar) return vegVar;
      }
      if (dietaryFilter === 'nonveg') {
        const nonVegVar = item.variants.find((v) => v.isVeg === false);
        if (nonVegVar) return nonVegVar;
      }
      return item.variants[0];
    },
    [selectedVariants, dietaryFilter]
  );

  /* ── Tray Manipulation ── */
  const addToTray = (item: MenuItem, variant?: ItemVariant) => {
    const activeVar = variant || getActiveVariant(item);
    const key = activeVar ? activeVar.id : item.id;

    setTray((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          item,
          variant: activeVar,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const decrementTray = (key: string) => {
    setTray((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  };

  const removeFromTray = (key: string) => {
    setTray((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearTray = () => setTray({});

  const totalTrayCount = useMemo(() => {
    return Object.values(tray).reduce((sum, entry) => sum + entry.quantity, 0);
  }, [tray]);

  const totalTrayPrice = useMemo(() => {
    return Object.values(tray).reduce((sum, entry) => {
      const unitPrice = entry.variant ? entry.variant.price : parsePrice(entry.item.price);
      return sum + unitPrice * entry.quantity;
    }, 0);
  }, [tray]);

  const [isLiveOrderModalOpen, setIsLiveOrderModalOpen] = useState(false);

  const handlePlaceLiveOrder = async (location: { roomNumber?: string; tableNumber?: string }) => {
    const payloadItems = Object.values(tray).map((entry) => {
      const displayName = entry.variant
        ? `${entry.item.name} (${entry.variant.name})`
        : entry.item.name;
      const unitPrice = entry.variant ? entry.variant.price : parsePrice(entry.item.price);

      return {
        id: entry.variant ? entry.variant.id : entry.item.id,
        name: displayName,
        quantity: entry.quantity,
        price: unitPrice,
        category: entry.item.category,
        volume: entry.item.volume,
        notes: specialNotes,
      };
    });

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomNumber: location.roomNumber || roomNumber || undefined,
        tableNumber: location.tableNumber || tableNumber || undefined,
        outlet: activeOutlet,
        items: payloadItems,
        specialInstructions: specialNotes,
      }),
    });

    if (!res.ok) throw new Error('Failed to create order');
    const json = await res.json();
    if (json.success && json.data) {
      setTray({});
      return json.data;
    }
    throw new Error(json.error || 'Failed to create order');
  };

  const locationText = tableNumber
    ? `Table ${tableNumber}`
    : roomNumber
      ? `Room ${roomNumber}`
      : null;

  /* ── 9.8+ Structured WhatsApp Message Builder ── */
  const buildWhatsAppUrl = () => {
    let msg = `*🛎️ QUALITY AIRPORT HOTEL — ORDER REQUEST*\n`;
    msg += `*Outlet:* ${activeOutlet === 'landing' ? 'The Landing (Dining)' : 'The Cheers (Bar)'}\n`;
    if (tableNumber) msg += `*Table:* ${tableNumber}\n`;
    if (roomNumber) msg += `*Room:* ${roomNumber}\n`;
    msg += `────────────────────────\n`;

    if (totalTrayCount > 0) {
      msg += `*ITEMS ORDERED:*\n`;
      Object.values(tray).forEach((entry, idx) => {
        const displayName = entry.variant
          ? `${entry.item.name} (${entry.variant.name})`
          : entry.item.name;
        const unitPrice = entry.variant ? entry.variant.price : parsePrice(entry.item.price);
        const itemTotal = `₹${(unitPrice * entry.quantity).toLocaleString('en-IN')}`;
        msg += `${idx + 1}. *${displayName}* (x${entry.quantity}) — ${itemTotal}\n`;
      });
      msg += `────────────────────────\n`;
      msg += `*Estimated Subtotal:* ₹${totalTrayPrice.toLocaleString('en-IN')}\n`;
      if (specialNotes.trim()) {
        msg += `*Special Instructions:* ${specialNotes.trim()}\n`;
      }
      msg += `────────────────────────\n`;
      msg += `Please confirm preparation time. Thank you!`;
    } else {
      msg += `Hello! I am viewing the digital menu at ${locationText || 'the hotel'} and would like to place an order.`;
    }

    return `https://wa.me/919526319995?text=${encodeURIComponent(msg)}`;
  };

  const isLight = theme === 'light';

  // Ticker marquee phrases
  const marqueeItems = activeOutlet === 'landing' ? [
    'THE LANDING · ALL-DAY FINE DINING',
    'KERALA’S GATEWAY · EST. 2001',
    'CHEF’S SIGNATURE SPECIALS',
    'AUTHENTIC MALABAR DELICACIES',
    'FRESH CLAY TANDOOR & ROTIS',
    'CONTINENTAL & ASIAN CLASSICS',
    '20–30 MIN FRESH PREPARATION',
    'ROOM SERVICE & TABLE ORDERING'
  ] : [
    'THE CHEERS · EXECUTIVE LOUNGE & BAR',
    'SINGLE MALTS & PREMIUM SCOTCH',
    'IMPORTED SPIRITS & FINE WINES',
    'CHILLED DRAUGHT & CRAFT BEERS',
    'RATES INCLUSIVE OF ALL TAXES',
    'NEDUMBASSERY · COCHIN AIRPORT',
    'ENJOY RESPONSIBLY'
  ];

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isLight ? 'luxury-texture-light text-[#0F172A]' : 'luxury-texture-dark text-slate-100'
      }`}
    >
      {/* ── Ambient Glow (Top) ── */}
      <div
        className={`fixed top-0 left-0 right-0 h-44 pointer-events-none z-0 ${
          isLight
            ? 'bg-gradient-to-b from-[#C5A059]/15 via-[#C5A059]/5 to-transparent'
            : 'bg-gradient-to-b from-[#C5A059]/12 via-[#C5A059]/4 to-transparent'
        }`}
      />

      {/* ══════════════════════════════════════ */}
      {/* ── REVAMPED BRAND HEADER ── */}
      {/* ══════════════════════════════════════ */}
      <header
        className={`relative z-40 border-b sticky top-0 px-4 py-2.5 shadow-sm transition-colors ${
          isLight
            ? 'border-slate-200/80 bg-[#F8F6F0]'
            : 'border-[#C5A059]/20 bg-[#060E18] shadow-black/40'
        }`}
        style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}
      >
        <div className="max-w-xl mx-auto">
          {/* Top Brand Bar with Official Logo */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 sm:h-9 w-28 sm:w-32 shrink-0">
                <Image
                  src={isLight ? '/logo-light.png' : '/logo-dark.png'}
                  alt="Quality Airport Hotels"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>

              <div className="hidden sm:block border-l pl-2.5 border-slate-300/40 dark:border-white/15">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C6B1C] dark:text-[#E5C07B] block">
                  Cochin Airport
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-serif italic">
                  Est. 2001
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Drawer Trigger Pill */}
              <button
                onClick={() => setIsCategoryDrawerOpen(true)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                    : 'bg-[#0D1B2A] border-[#C5A059]/35 text-[#E5C07B] hover:bg-[#C5A059]/15'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#8C6B1C] dark:text-[#E5C07B]" />
                <span>Index</span>
              </button>

              {/* Location Badge */}
              {locationText && (
                <div
                  className={`border rounded-xl px-2.5 py-1 text-right ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-[#0D1B2A] border-[#C5A059]/35'
                  }`}
                >
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">
                    Location
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isLight ? 'text-slate-900' : 'text-[#E5C07B]'
                    }`}
                  >
                    {locationText}
                  </span>
                </div>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle light or dark theme"
                className={`p-2 rounded-xl border transition-all duration-300 active:scale-90 flex items-center justify-center ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                    : 'bg-[#0D1B2A] border-[#C5A059]/40 text-[#E5C07B] hover:bg-[#C5A059]/15'
                }`}
              >
                <span className={`inline-flex transition-transform duration-300 ${themeTransition ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                  {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-300" />}
                </span>
              </button>
            </div>
          </div>

          {/* Outlet Subtitle & Time Greeting */}
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className={`font-serif text-sm sm:text-base font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {activeOutlet === 'landing' ? 'The Landing' : 'The Cheers'}
              </span>
              <span
                className={`text-[9px] font-sans tracking-normal px-2 py-0.5 rounded-full font-bold uppercase ${
                  isLight
                    ? 'bg-[#8C6B1C]/15 text-[#705411] border border-[#8C6B1C]/25'
                    : 'bg-[#C5A059]/15 text-[#E5C07B] border border-[#C5A059]/30'
                }`}
              >
                {activeOutlet === 'landing' ? 'All-Day Dining' : 'Premium Bar'}
              </span>
            </div>

            <p className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className={`font-bold ${isLight ? 'text-[#8C6B1C]' : 'text-[#E5C07B]'}`}>
                {greeting.text}
              </span>
            </p>
          </div>

          {/* 1-Tap Outlet Switcher */}
          <div
            className={`mt-2.5 grid grid-cols-2 p-1 rounded-xl border text-xs sm:text-sm ${
              isLight ? 'bg-[#EAE6DC]/70 border-slate-300/60' : 'bg-[#0D1B2A] border-white/10'
            }`}
          >
            <button
              onClick={() => {
                setActiveOutlet('landing');
                setSearchQuery('');
                setDietaryFilter('all');
                setExpandedSections(new Set([MENU_DATA[0]?.id]));
              }}
              className={`py-2 px-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeOutlet === 'landing'
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE73] text-[#070F1A] font-bold shadow-sm'
                  : isLight
                  ? 'text-slate-700 hover:text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              The Landing (Dining)
            </button>
            <button
              onClick={() => {
                setActiveOutlet('cheers');
                setSearchQuery('');
                setDietaryFilter('all');
                setExpandedSections(new Set([CHEERS_BAR_DATA[0]?.id]));
              }}
              className={`py-2 px-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeOutlet === 'cheers'
                  ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBE73] text-[#070F1A] font-bold shadow-sm'
                  : isLight
                  ? 'text-slate-700 hover:text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              The Cheers (Bar)
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════ */}
      {/* ── LUXURY INFINITE MARQUEE TICKER ── */}
      {/* ══════════════════════════════════════ */}
      <div
        className={`border-y overflow-hidden relative z-20 py-1.5 backdrop-blur-xs select-none ${
          isLight
            ? 'bg-white/80 border-slate-200/90 text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
            : 'bg-[#091524] border-[#C5A059]/20 text-slate-300'
        }`}
      >
        <div className="animate-marquee whitespace-nowrap text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase flex items-center">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <span key={idx} className="flex items-center">
              <span className={`mx-3 text-[9px] ${isLight ? 'text-[#8C6B1C]' : 'text-[#C5A059]'}`}>✦</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* ── CONTROLS: Search + Dietary Filters ── */}
      {/* ══════════════════════════════════════ */}
      <div className="max-w-xl mx-auto px-4 pt-3.5 pb-2 relative z-10">
        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute left-3.5 top-3 w-4 h-4 ${
              isLight ? 'text-slate-500' : 'text-[#C5A059]'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeOutlet === 'landing'
                ? 'Search biryani, fish curry, parotta, tandoor...'
                : 'Search single malt, brandy, draught beer, rum...'
            }
            className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm transition focus:outline-none ${
              isLight
                ? 'bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 shadow-xs focus:border-[#8C6B1C]'
                : 'bg-[#0D1B2A] border border-[#C5A059]/20 text-white placeholder-slate-500 focus:border-[#C5A059]/60'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dietary Filters (Landing only) */}
        {activeOutlet === 'landing' && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              {
                key: 'all' as const,
                label: 'All Items',
                activeCls: isLight
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-[#C5A059] text-black border-[#C5A059]',
                inactiveCls: isLight
                  ? 'bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-slate-300'
                  : 'bg-[#0D1B2A] text-slate-300 border-white/10'
              },
              {
                key: 'veg' as const,
                label: 'Veg Only',
                activeCls: 'bg-emerald-700 text-white border-emerald-700 shadow-xs',
                inactiveCls: isLight
                  ? 'bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-slate-300'
                  : 'bg-[#0D1B2A] text-slate-300 border-white/10',
                dot: 'bg-emerald-500'
              },
              {
                key: 'nonveg' as const,
                label: 'Non-Veg',
                activeCls: 'bg-rose-700 text-white border-rose-700 shadow-xs',
                inactiveCls: isLight
                  ? 'bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-slate-300'
                  : 'bg-[#0D1B2A] text-slate-300 border-white/10',
                dot: 'bg-rose-500'
              },
              {
                key: 'special' as const,
                label: 'Chef Specials',
                activeCls: 'bg-amber-700 text-white border-amber-700 shadow-xs',
                inactiveCls: isLight
                  ? 'bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-slate-300'
                  : 'bg-[#0D1B2A] text-slate-300 border-white/10',
                icon: true
              },
              {
                key: 'express' as const,
                label: '⏱️ 15m Express',
                activeCls: 'bg-blue-700 text-white border-blue-700 shadow-xs',
                inactiveCls: isLight
                  ? 'bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-slate-300'
                  : 'bg-[#0D1B2A] text-slate-300 border-white/10',
              }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setDietaryFilter(f.key)}
                className={`px-3 py-1.5 rounded-full border whitespace-nowrap flex items-center gap-1.5 transition font-medium ${
                  dietaryFilter === f.key ? f.activeCls : f.inactiveCls
                }`}
              >
                {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot} inline-block`} />}
                {f.icon && <Sparkles className="w-3 h-3 text-amber-300" />}
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Spirit Jump Pills (Cheers Bar only) */}
        {activeOutlet === 'cheers' && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All Spirits' },
              { id: 'scotch-whisky', label: '🥃 Scotch & Whisky' },
              { id: 'indian-whisky', label: '🥃 Indian Whisky' },
              { id: 'brandy', label: '🍷 Brandy' },
              { id: 'rum-vodka', label: '🍹 Rum & Vodka' },
              { id: 'gin-tequila', label: '🍸 Gin & Tequila' },
              { id: 'beer-wine', label: '🍺 Chilled Beer' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  if (chip.id === 'all') {
                    setSearchQuery('');
                  } else {
                    jumpToSection(chip.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-full border whitespace-nowrap flex items-center gap-1.5 transition font-medium ${
                  isLight
                    ? 'bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-slate-300'
                    : 'bg-[#0D1B2A] text-slate-300 border-white/10 hover:border-white/25'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* ── 9.8+ CURATED CHEF SIGNATURES / BAR BANNER ── */}
      {/* ══════════════════════════════════════ */}
      {!isSearching && (
        activeOutlet === 'cheers' ? (
          <CheersBarBanner
            items={CHEERS_SIGNATURES}
            tray={tray}
            addToTray={addToTray}
            decrementTray={decrementTray}
            isLight={isLight}
          />
        ) : (
          <div className="max-w-xl mx-auto px-4 pt-2 pb-3 relative z-10">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className={`font-serif text-base font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-[#E5C07B]'}`}>
                <Sparkles className="w-4 h-4 text-[#8C6B1C] dark:text-[#E5C07B]" />
                Chef&apos;s Signature Delicacies
              </h3>
              <span className="text-[10px] text-slate-500 font-sans tracking-wide">
                Handcrafted by Master Chefs
              </span>
            </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {activeSignatures.map((sig) => {
              const activeSigVariant = getActiveVariant(sig);
              const sigKey = activeSigVariant ? activeSigVariant.id : sig.id;
              const trayEntry = tray[sigKey];
              const inTray = !!trayEntry;
              const sigPrice = activeSigVariant ? activeSigVariant.price : parsePrice(sig.price);

              return (
                <div
                  key={sig.id}
                  className={`w-60 sm:w-64 shrink-0 snap-start rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
                    isLight
                      ? 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
                      : 'bg-[#0D1B2A] border-[#C5A059]/25 shadow-black/40'
                  }`}
                >
                  {/* Hero Photography */}
                  {sig.image && (
                    <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <Image
                        src={sig.image}
                        alt={sig.name}
                        fill
                        sizes="(max-width: 640px) 240px, 260px"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-amber-300 border border-amber-400/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {sig.flavorProfile || sig.category}
                      </span>
                    </div>
                  )}

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className={`text-sm font-bold leading-snug line-clamp-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {sig.name}
                        </h4>
                        <span className={`font-sans text-sm font-bold tabular-nums shrink-0 ${isLight ? 'text-slate-900' : 'text-[#E5C07B]'}`}>
                          ₹{sigPrice}
                        </span>
                      </div>

                      {sig.description && (
                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {sig.description}
                        </p>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {sig.spiceLevel && (
                          <span className="text-[10px] text-rose-600 font-bold flex items-center" title={`Spice: Level ${sig.spiceLevel}`}>
                            {Array.from({ length: sig.spiceLevel }).map((_, i) => (
                              <Flame key={i} className="w-3 h-3 text-rose-500 fill-rose-500" />
                            ))}
                          </span>
                        )}
                        {sig.volume && (
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                            <GlassWater className="w-3 h-3" /> {sig.volume}
                          </span>
                        )}
                      </div>

                      {/* Tray Stepper Button */}
                      {inTray ? (
                        <div className="flex items-center gap-1.5 bg-[#C5A059]/15 border border-[#C5A059] rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => decrementTray(sigKey)}
                            className="p-1 hover:text-rose-600 transition active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 tabular-nums">
                            {trayEntry.quantity}
                          </span>
                          <button
                            onClick={() => addToTray(sig, activeSigVariant)}
                            className="p-1 hover:text-emerald-600 transition active:scale-90"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToTray(sig, activeSigVariant)}
                          className={`text-xs px-3 py-1 rounded-lg border font-bold flex items-center gap-1 transition active:scale-95 ${
                            isLight
                              ? 'bg-[#8C6B1C]/10 border-[#8C6B1C]/30 text-[#8C6B1C] hover:bg-[#8C6B1C]/20'
                              : 'bg-[#C5A059]/15 border-[#C5A059]/30 text-[#E5C07B] hover:bg-[#C5A059]/25'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          Add to Tray
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    )}

      {/* ══════════════════════════════════════ */}
      {/* ── MENU SECTIONS (Accordion) ── */}
      {/* ══════════════════════════════════════ */}
      <main className="max-w-xl mx-auto px-4 pb-40 space-y-4 relative z-10 pt-1">
        {filteredSections.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 text-slate-400">
            <Search
              className={`w-10 h-10 mx-auto mb-3 ${
                isLight ? 'text-slate-400' : 'text-[#C5A059]/40'
              }`}
            />
            <p
              className={`text-lg font-serif ${
                isLight ? 'text-slate-800 font-bold' : 'text-[#E5C07B]/80'
              }`}
            >
              No items found
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try a different search term or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('all');
              }}
              className={`text-sm px-5 py-2.5 rounded-lg border transition font-medium ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-xs'
                  : 'bg-[#C5A059]/15 border-[#C5A059]/30 text-[#E5C07B] hover:bg-[#C5A059]/25'
              }`}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredSections.map((section, sectionIndex) => {
            const isExpanded = isSearching || expandedSections.has(section.id);
            const itemCount = countItems(section);

            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-48 fade-in-up"
                style={{ animationDelay: `${sectionIndex * 30}ms` }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => !isSearching && toggleSection(section.id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <h2
                        className={`font-serif text-lg sm:text-xl tracking-wide flex items-center gap-1.5 font-bold ${
                          isLight ? 'text-slate-900' : 'text-[#E5C07B]'
                        }`}
                      >
                        {section.romanNumeral && (
                          <span
                            className={`italic ${isLight ? 'text-[#8C6B1C]' : 'text-[#C5A059]'}`}
                          >
                            {section.romanNumeral}.
                          </span>
                        )}
                        <span
                          className={`transition ${
                            isLight ? 'group-hover:text-[#8C6B1C]' : 'group-hover:text-white'
                          }`}
                        >
                          {section.title}
                        </span>
                        <span className="text-[11px] font-sans text-slate-400 font-normal ml-1">
                          ({itemCount})
                        </span>
                      </h2>
                      {section.subtitle && (
                        <p
                          className={`text-[11px] mt-0.5 font-serif italic ${
                            isLight ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {section.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {section.timing && (
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            isLight
                              ? 'text-[#8C6B1C] bg-[#8C6B1C]/10 border-[#8C6B1C]/25'
                              : 'text-[#C5A059] bg-[#C5A059]/10 border-[#C5A059]/20'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {section.timing}
                        </span>
                      )}
                      {!isSearching && (
                        <ChevronDown
                          className={`w-5 h-5 chevron ${
                            isLight ? 'text-[#8C6B1C]' : 'text-[#C5A059]'
                          } ${isExpanded ? 'open' : ''}`}
                        />
                      )}
                    </div>
                  </div>

                  <div className={isLight ? 'gold-divider-light' : 'gold-divider-dark'}>
                    <span
                      className={`text-[10px] ${
                        isLight ? 'text-[#8C6B1C]/60' : 'text-[#C5A059]/50'
                      }`}
                    >
                      ✦
                    </span>
                  </div>
                </button>

                {/* Accordion Content */}
                <div
                  className={`accordion-content ${isExpanded ? 'expanded' : 'collapsed'}`}
                  style={{ maxHeight: isExpanded ? '9999px' : '0' }}
                >
                  <div className="space-y-5 pt-3 pb-2">
                    {section.subsections?.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        {/* Subsection Title */}
                        {sub.title && (
                          <div className="pl-1">
                            <span
                              className={`text-[11px] uppercase tracking-[0.18em] font-extrabold px-2.5 py-0.5 rounded-md border inline-flex items-center gap-1.5 ${
                                isLight
                                  ? 'text-[#705411] bg-[#F2EDE2] border-[#8C6B1C]/20'
                                  : 'text-[#C5A059] bg-[#C5A059]/10 border-[#C5A059]/20'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                              {sub.title}
                            </span>
                          </div>
                        )}

                        {/* SOLID Card Background */}
                        <div
                          className={`divide-y rounded-2xl border overflow-hidden transition-colors ${
                            isLight
                              ? 'divide-slate-100 bg-white border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03),0_1px_2px_rgba(15,23,42,0.04)]'
                              : 'divide-white/[0.04] bg-[#0D1B2A]/50 border-[#C5A059]/10'
                          }`}
                        >
                          {sub.items.map((item) => {
                            const activeVariant = getActiveVariant(item);
                            const effectivePrice = activeVariant ? activeVariant.price : parsePrice(item.price);
                            const effectiveIsVeg = activeVariant?.isVeg !== undefined ? activeVariant.isVeg : item.isVeg;
                            const effectiveEgg = activeVariant?.containsEgg !== undefined ? activeVariant.containsEgg : item.containsEgg;
                            const hasVegBadge = effectiveIsVeg !== undefined;

                            const trayKey = activeVariant ? activeVariant.id : item.id;
                            const trayEntry = tray[trayKey];
                            const inTray = !!trayEntry;

                            return (
                              <div
                                key={item.id}
                                className={`px-4 py-3.5 transition-colors group border-l-2 border-transparent ${
                                  isLight
                                    ? 'hover:bg-slate-50/80 active:bg-slate-100/80 hover:border-[#8C6B1C]/50'
                                    : 'hover:bg-[#C5A059]/[0.04] active:bg-[#C5A059]/[0.07] hover:border-[#C5A059]/40'
                                }`}
                              >
                                <div className="flex items-baseline justify-between gap-3">
                                  {/* Left: Badges & Name */}
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    {/* Veg/Non-Veg Badge */}
                                    {hasVegBadge && (
                                      <span
                                        className={`w-4 h-4 border-[1.5px] flex items-center justify-center rounded-sm shrink-0 ${
                                          effectiveIsVeg ? 'border-emerald-600' : effectiveEgg ? 'border-amber-600' : 'border-red-600'
                                        }`}
                                      >
                                        <span
                                          className={`w-2 h-2 rounded-full ${
                                            effectiveIsVeg ? 'bg-emerald-600' : effectiveEgg ? 'bg-amber-600' : 'bg-red-600'
                                          }`}
                                        />
                                      </span>
                                    )}

                                    {/* Item Name with Highlight */}
                                    <h4
                                      className={`text-[15px] sm:text-base font-semibold transition ${
                                        isLight
                                          ? 'text-slate-900 group-hover:text-[#8C6B1C]'
                                          : 'text-slate-100 group-hover:text-[#E5C07B]'
                                      }`}
                                    >
                                      <HighlightedText text={item.name} query={searchQuery} />
                                    </h4>

                                    {/* Chef Special Badge */}
                                    {item.isChefSpecial && (
                                      <span
                                        className={`shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-0.5 font-bold ${
                                          isLight
                                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                                            : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/15 text-amber-300 border-amber-400/30'
                                        }`}
                                      >
                                        <Sparkles className={`w-2.5 h-2.5 ${isLight ? 'text-amber-600' : 'text-amber-300'}`} />
                                        Special
                                      </span>
                                    )}

                                    {/* Express 15m Badge */}
                                    {item.isExpress && (
                                      <span
                                        className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                                          isLight
                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                            : 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                                        }`}
                                      >
                                        <Zap className="w-2.5 h-2.5" />
                                        15m Express
                                      </span>
                                    )}

                                    {/* Spice Indicator */}
                                    {item.spiceLevel && (
                                      <span className="shrink-0 flex items-center text-rose-500">
                                        {Array.from({ length: item.spiceLevel }).map((_, i) => (
                                          <Flame key={i} className="w-2.5 h-2.5 fill-rose-500" />
                                        ))}
                                      </span>
                                    )}
                                  </div>

                                  {/* Right: Price & Quick Add Button */}
                                  <div className="flex items-center gap-2.5 shrink-0">
                                    <span
                                      className={`font-sans text-[15px] sm:text-base font-bold tabular-nums tracking-tight ${
                                        isLight ? 'text-slate-900' : 'text-[#E5C07B]'
                                      }`}
                                    >
                                      ₹{effectivePrice}
                                    </span>

                                    {inTray ? (
                                      <div className="flex items-center gap-1 bg-[#C5A059]/15 border border-[#C5A059] rounded-lg px-1.5 py-0.5">
                                        <button
                                          onClick={() => decrementTray(trayKey)}
                                          className="p-1 hover:text-rose-600 transition active:scale-90"
                                          aria-label="Decrease quantity"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold px-1 tabular-nums">
                                          {trayEntry.quantity}
                                        </span>
                                        <button
                                          onClick={() => addToTray(item, activeVariant)}
                                          className="p-1 hover:text-emerald-600 transition active:scale-90"
                                          aria-label="Increase quantity"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => addToTray(item, activeVariant)}
                                        aria-label={`Add ${item.name} to order tray`}
                                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition active:scale-90 ${
                                          isLight
                                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-[#8C6B1C]/10 hover:border-[#8C6B1C]/40 hover:text-[#8C6B1C]'
                                            : 'bg-[#0D1B2A] border-white/10 text-slate-300 hover:bg-[#C5A059]/20 hover:border-[#C5A059]/40 hover:text-[#E5C07B]'
                                        }`}
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Description */}
                                {item.description && (
                                  <p
                                    className={`text-[12px] mt-1 leading-relaxed ${hasVegBadge ? 'pl-6' : 'pl-0'} ${
                                      isLight ? 'text-slate-600 font-normal' : 'text-slate-400/90'
                                    }`}
                                  >
                                    <HighlightedText text={item.description} query={searchQuery} />
                                  </p>
                                )}

                                {/* Interactive Variant Selector Pills */}
                                {item.variants && item.variants.length > 0 && (
                                  <div className={`mt-2.5 flex items-center gap-1.5 flex-wrap ${hasVegBadge ? 'pl-6' : 'pl-0'}`}>
                                    {item.variants.map((variant) => {
                                      const isSelected = activeVariant?.id === variant.id;
                                      const vTrayCount = tray[variant.id]?.quantity || 0;
                                      return (
                                        <button
                                          key={variant.id}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedVariants((prev) => ({ ...prev, [item.id]: variant.id }));
                                          }}
                                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 ${
                                            isSelected
                                              ? isLight
                                                ? 'bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-xs font-semibold'
                                                : 'bg-[#C5A059] text-black border-[#C5A059] shadow-xs font-bold'
                                              : isLight
                                              ? 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                              : 'bg-[#0D1B2A] text-slate-300 border-white/10 hover:border-white/20 hover:bg-white/5'
                                          }`}
                                        >
                                          {variant.isVeg !== undefined && (
                                            <span
                                              className={`w-1.5 h-1.5 rounded-full ${
                                                variant.isVeg ? 'bg-emerald-500' : variant.containsEgg ? 'bg-amber-500' : 'bg-red-500'
                                              }`}
                                            />
                                          )}
                                          <span>{variant.name}</span>
                                          <span className={`text-[10px] tabular-nums font-medium ${
                                            isSelected ? (isLight ? 'text-amber-100' : 'text-slate-900') : 'opacity-70'
                                          }`}>
                                            ₹{variant.price}
                                          </span>
                                          {vTrayCount > 0 && (
                                            <span
                                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                                                isSelected
                                                  ? isLight ? 'bg-white text-[#8C6B1C]' : 'bg-black text-[#C5A059]'
                                                  : 'bg-[#C5A059]/25 text-[#C5A059] border border-[#C5A059]/40'
                                              }`}
                                            >
                                              {vTrayCount}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Serving Volume (Bar) */}
                                {item.volume && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full border mt-1.5 font-medium ${hasVegBadge ? 'ml-6' : 'ml-0'} ${
                                      isLight
                                        ? 'bg-slate-100 border-slate-200 text-slate-800'
                                        : 'bg-[#C5A059]/10 border-[#C5A059]/20 text-[#E5C07B]'
                                    }`}
                                  >
                                    <GlassWater className="w-3 h-3" />
                                    {item.volume}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}

        {/* Footer */}
        <div
          className={`text-center pt-8 pb-4 border-t space-y-2 ${
            isLight ? 'border-slate-200/80' : 'border-white/[0.06]'
          }`}
        >
          <p
            className={`tracking-[0.25em] uppercase text-[10px] font-bold ${
              isLight ? 'text-[#8C6B1C]' : 'text-[#C5A059]'
            }`}
          >
            Quality Airport Hotel · Nedumbassery
          </p>
          <p
            className={`text-[11px] italic font-serif ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Opposite Cochin International Airport, Nedumbassery, Ernakulam – 683 585
          </p>
          <div
            className={`flex items-center justify-center gap-1 text-[11px] ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>
              {activeOutlet === 'cheers'
                ? 'The rates are inclusive of all taxes.'
                : 'Government taxes extra as applicable. Food preparation: 20–30 minutes.'}
            </span>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════ */}
      {/* ── 9.8+ CATEGORY INDEX BOTTOM DRAWER ── */}
      {/* ══════════════════════════════════════ */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            onClick={() => setIsCategoryDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
          />
          <div
            className={`relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-hidden flex flex-col border shadow-2xl animate-slide-up ${
              isLight
                ? 'bg-[#FAF8F5] border-slate-200 text-slate-900'
                : 'bg-[#0B1728] border-[#C5A059]/30 text-white'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#8C6B1C] dark:text-[#E5C07B]" />
                  Menu Index
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeOutlet === 'landing' ? 'The Landing — 10 Sections' : 'The Cheers Bar — 6 Sections'}
                </p>
              </div>
              <button
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sections List */}
            <div className="p-3 overflow-y-auto divide-y divide-slate-200/40 dark:divide-white/5 space-y-1">
              {activeDataset.map((sec) => {
                const count = countItems(sec);
                return (
                  <button
                    key={sec.id}
                    onClick={() => jumpToSection(sec.id)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition group ${
                      isLight
                        ? 'hover:bg-white active:bg-white/80'
                        : 'hover:bg-[#132338] active:bg-[#132338]/80'
                    }`}
                  >
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold group-hover:text-[#8C6B1C] dark:group-hover:text-[#E5C07B] transition flex items-center gap-2">
                        {sec.romanNumeral && (
                          <span className="text-xs opacity-60 italic">{sec.romanNumeral}.</span>
                        )}
                        {sec.title}
                      </h4>
                      {sec.subtitle && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          {sec.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {count} items
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ── 9.8+ INTERACTIVE ORDER TRAY MODAL ── */}
      {/* ══════════════════════════════════════ */}
      {isTrayOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            onClick={() => setIsTrayOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
          />
          <div
            className={`relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col border shadow-2xl animate-slide-up ${
              isLight
                ? 'bg-[#FAF8F5] border-slate-200 text-slate-900'
                : 'bg-[#0B1728] border-[#C5A059]/30 text-white'
            }`}
          >
            {/* Tray Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#8C6B1C] dark:text-[#E5C07B]" />
                <div>
                  <h3 className="font-serif text-lg font-bold">Your Order Tray</h3>
                  <p className="text-[11px] text-slate-500">
                    {activeOutlet === 'landing' ? 'The Landing' : 'The Cheers Bar'}
                    {locationText ? ` · ${locationText}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totalTrayCount > 0 && (
                  <button
                    onClick={clearTray}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsTrayOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tray Items List */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-200/60 dark:divide-white/10">
              {totalTrayCount === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-serif text-lg text-slate-600 dark:text-slate-300 font-bold">
                    Your tray is empty
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tap the &ldquo;+&rdquo; button beside any dish or drink to build your order.
                  </p>
                </div>
              ) : (
                Object.values(tray).map(({ item, variant, quantity }) => {
                  const unitPrice = variant ? variant.price : parsePrice(item.price);
                  const itemTotal = unitPrice * quantity;
                  const key = variant ? variant.id : item.id;
                  const effectiveVeg = variant?.isVeg !== undefined ? variant.isVeg : item.isVeg;
                  const effectiveEgg = variant?.containsEgg !== undefined ? variant.containsEgg : item.containsEgg;

                  return (
                    <div key={key} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {effectiveVeg !== undefined && (
                            <span
                              className={`w-3 h-3 border-[1px] flex items-center justify-center rounded-xs shrink-0 ${
                                effectiveVeg ? 'border-emerald-600' : effectiveEgg ? 'border-amber-600' : 'border-red-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  effectiveVeg ? 'bg-emerald-600' : effectiveEgg ? 'bg-amber-600' : 'bg-red-600'
                                }`}
                              />
                            </span>
                          )}
                          <h4 className="text-sm font-semibold truncate">
                            {item.name}
                          </h4>
                          {variant && (
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold bg-[#C5A059]/15 text-[#8C6B1C] dark:text-[#E5C07B] border border-[#C5A059]/30">
                              {variant.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                          ₹{unitPrice} each
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 border border-slate-300 dark:border-white/15 rounded-lg px-2 py-1">
                          <button
                            onClick={() => decrementTray(key)}
                            className="p-0.5 hover:text-rose-600 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 tabular-nums">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToTray(item, variant)}
                            className="p-0.5 hover:text-emerald-600 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold tabular-nums w-16 text-right">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>

                        <button
                          onClick={() => removeFromTray(key)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Special Instructions Input */}
            {totalTrayCount > 0 && (
              <div className="px-4 py-3 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Cooking Notes / Special Requests (Optional)
                </label>
                <input
                  type="text"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Less spicy, no onion, extra ice..."
                  className={`w-full rounded-xl px-3 py-2 text-xs border transition focus:outline-none ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 focus:border-[#8C6B1C]'
                      : 'bg-[#060E18] border-white/10 text-white focus:border-[#C5A059]'
                  }`}
                />
              </div>
            )}

            {/* Tray Footer & Action Button */}
            {totalTrayCount > 0 && (
              <div className="p-4 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#070F1A]">
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-slate-500 font-medium">
                    Subtotal ({totalTrayCount} {totalTrayCount === 1 ? 'item' : 'items'}):
                  </span>
                  <span className="text-lg font-bold font-sans tabular-nums text-[#8C6B1C] dark:text-[#E5C07B]">
                    ₹{totalTrayPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Primary Live Order Dispatch (KOT & BOT) */}
                <button
                  onClick={() => setIsLiveOrderModalOpen(true)}
                  className="w-full mb-2 bg-gradient-to-r from-[#C5A059] to-[#DFBE73] text-black font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:brightness-105 active:scale-[0.98] transition text-sm"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Send Order to Hotel System (Live KOT &amp; BOT)</span>
                </button>

                {/* Secondary WhatsApp Backup */}
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-[0.98] transition text-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Or Send via WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-28 right-4 z-30 w-10 h-10 rounded-full border flex items-center justify-center shadow-lg active:scale-90 transition ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-md'
              : 'bg-[#0D1B2A] border-[#C5A059]/40 text-[#E5C07B] hover:bg-[#C5A059]/15'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* ══════════════════════════════════════ */}
      {/* ── 9.8+ SMART FLOATING ACTION BAR ── */}
      {/* ══════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div
          className={`h-6 ${
            isLight
              ? 'bg-gradient-to-t from-[#F8F6F0] to-transparent'
              : 'bg-gradient-to-t from-[#060E18] to-transparent'
          }`}
        />
        <div
          className={`px-3 pt-1 shadow-lg ${isLight ? 'bg-[#F8F6F0] border-t border-slate-200/80' : 'bg-[#060E18] border-t border-white/10'}`}
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-xl mx-auto flex gap-2.5 items-center">
            {totalTrayCount > 0 ? (
              /* Live Order Tray Summary */
              <>
                <button
                  onClick={() => setIsTrayOpen(true)}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-between transition active:scale-[0.98] ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 shadow-sm hover:bg-slate-50'
                      : 'bg-[#0D1B2A] border-[#C5A059]/40 text-white shadow-black/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#8C6B1C] dark:bg-[#C5A059] text-white dark:text-black font-bold text-xs flex items-center justify-center">
                      {totalTrayCount}
                    </span>
                    <span className="text-xs font-semibold">View Tray</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-[#8C6B1C] dark:text-[#E5C07B]">
                    ₹{totalTrayPrice.toLocaleString('en-IN')}
                  </span>
                </button>

                <button
                  onClick={() => setIsLiveOrderModalOpen(true)}
                  className="bg-gradient-to-r from-[#C5A059] to-[#DFBE73] text-black font-bold py-3 px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-black/25 hover:brightness-105 active:scale-[0.97] transition text-xs sm:text-sm shrink-0"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Place Order</span>
                </button>

                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-lg shadow-emerald-950/25 hover:brightness-110 active:scale-[0.97] transition shrink-0"
                  title="Order via WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </>
            ) : (
              /* Default Action Bar */
              <>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 hover:brightness-110 active:scale-[0.97] transition text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Order via WhatsApp
                </a>
                <a
                  href="tel:+914842610678"
                  className={`border py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition text-sm font-medium ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
                      : 'bg-[#0D1B2A] border-[#C5A059]/40 text-[#E5C07B] hover:bg-[#C5A059]/15'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Live KOT / BOT Dispatch Modal ── */}
      <LiveOrderModal
        isOpen={isLiveOrderModalOpen}
        onClose={() => setIsLiveOrderModalOpen(false)}
        defaultRoom={roomNumber}
        defaultTable={tableNumber}
        onConfirmOrder={handlePlaceLiveOrder}
      />
    </div>
  );
}

/* ── Shimmer Skeleton Loader ─────────────── */
function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="space-y-3 w-full max-w-xs">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.3em] text-[#8C6B1C] uppercase font-bold">
            Quality Airport Hotel
          </p>
          <p className="font-serif text-xl text-[#0F2238] mt-1">Loading Menu...</p>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DigitalMenuPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent />
    </Suspense>
  );
}
