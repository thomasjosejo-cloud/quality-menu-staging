'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search, Phone, MessageSquare, Clock, Sparkles, X,
  Wine, UtensilsCrossed, ChevronDown, ArrowUp, Info, Sun, Moon, GlassWater
} from 'lucide-react';
import { MENU_DATA } from '@/data/menu-data';
import { CHEERS_BAR_DATA } from '@/data/cheers-bar-data';
import { OutletType, MenuSection } from '@/types/menu';

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
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'nonveg' | 'special'>('all');

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qah-theme') as 'light' | 'dark' | null;
      if (saved && (saved === 'light' || saved === 'dark')) {
        requestAnimationFrame(() => setTheme(saved));
      }
    } catch {
      // ignore storage access errors
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
                item.category.toLowerCase().includes(q);

              let matchesDiet = true;
              if (dietaryFilter === 'veg') matchesDiet = item.isVeg === true;
              if (dietaryFilter === 'nonveg') matchesDiet = item.isVeg === false;
              if (dietaryFilter === 'special') matchesDiet = item.isChefSpecial === true;

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

  const locationText = tableNumber
    ? `Table ${tableNumber}`
    : roomNumber
      ? `Room ${roomNumber}`
      : null;

  const whatsappMsg = encodeURIComponent(
    `Hello Quality Airport Hotel! I am viewing the digital menu${locationText ? ` at ${locationText}` : ''} (${
      activeOutlet === 'landing' ? 'The Landing' : 'The Cheers Bar'
    }). I would like to place an order.`
  );

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
      {/* ── REVAMPED LUXURY HEADER ── */}
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
              {/* Hotel Official Logo */}
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
      {/* Replaces the clunky pill row with motion */}
      {/* ══════════════════════════════════════ */}
      <div
        className={`border-y overflow-hidden relative z-20 py-1.5 backdrop-blur-xs select-none ${
          isLight
            ? 'bg-white/80 border-slate-200/90 text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
            : 'bg-[#091524] border-[#C5A059]/20 text-slate-300'
        }`}
      >
        <div className="animate-marquee whitespace-nowrap text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase flex items-center">
          {/* Loop twice for seamless infinite scroll */}
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
                ? 'Search biryani, beef, appam, pasta...'
                : 'Search whisky, brandy, beer, rum...'
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
                {f.icon && <Sparkles className={`w-3 h-3 ${isLight ? 'text-amber-300' : 'text-amber-300'}`} />}
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* ── MENU SECTIONS (Accordion) ── */}
      {/* ══════════════════════════════════════ */}
      <main className="max-w-xl mx-auto px-4 pb-36 space-y-4 relative z-10 pt-1">
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
                style={{ animationDelay: `${sectionIndex * 40}ms` }}
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

                        {/* SOLID Card Background for 100% Crisp Legibility */}
                        <div
                          className={`divide-y rounded-2xl border overflow-hidden transition-colors ${
                            isLight
                              ? 'divide-slate-100 bg-white border-slate-200/90 shadow-[0_2px_10px_rgba(15,23,42,0.03),0_1px_2px_rgba(15,23,42,0.04)]'
                              : 'divide-white/[0.04] bg-[#0D1B2A]/50 border-[#C5A059]/10'
                          }`}
                        >
                          {sub.items.map((item) => {
                            const hasVegBadge = item.isVeg !== undefined;

                            return (
                              <div
                                key={item.id}
                                className={`px-4 py-3.5 transition-colors group border-l-2 border-transparent ${
                                  isLight
                                    ? 'hover:bg-slate-50/80 active:bg-slate-100/80 hover:border-[#8C6B1C]/50'
                                    : 'hover:bg-[#C5A059]/[0.04] active:bg-[#C5A059]/[0.07] hover:border-[#C5A059]/40'
                                }`}
                              >
                                <div className="menu-item-row">
                                  {/* Veg/Non-Veg Badge */}
                                  {hasVegBadge && (
                                    <span
                                      className={`w-4 h-4 border-[1.5px] flex items-center justify-center rounded-sm shrink-0 ${
                                        item.isVeg ? 'border-emerald-600' : 'border-red-600'
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                        }`}
                                      />
                                    </span>
                                  )}

                                  {/* Item Name */}
                                  <h4
                                    className={`text-[15px] sm:text-base font-semibold transition shrink-0 ${
                                      isLight
                                        ? 'text-slate-900 group-hover:text-[#8C6B1C]'
                                        : 'text-slate-100 group-hover:text-[#E5C07B]'
                                    }`}
                                  >
                                    {item.name}
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

                                  {/* Dotted Leader Line */}
                                  <span
                                    className={
                                      isLight ? 'menu-item-dots-light' : 'menu-item-dots-dark'
                                    }
                                  />

                                  {/* Price: Clean Sans-Serif Matching Item Font Family */}
                                  <span
                                    className={`font-sans text-[15px] sm:text-base font-bold shrink-0 tabular-nums tracking-tight ${
                                      isLight ? 'text-slate-900' : 'text-[#E5C07B]'
                                    }`}
                                  >
                                    {typeof item.price === 'number' ? `₹${item.price}` : item.price}
                                  </span>
                                </div>

                                {/* Description */}
                                {item.description && (
                                  <p
                                    className={`text-[12px] mt-1 leading-relaxed ${hasVegBadge ? 'pl-6' : 'pl-0'} ${
                                      isLight ? 'text-slate-600 font-normal' : 'text-slate-400/90'
                                    }`}
                                  >
                                    {item.description}
                                  </p>
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

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-24 right-4 z-30 w-10 h-10 rounded-full border flex items-center justify-center shadow-lg active:scale-90 transition ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-md'
              : 'bg-[#0D1B2A] border-[#C5A059]/40 text-[#E5C07B] hover:bg-[#C5A059]/15'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* ── FLOATING ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div
          className={`h-6 ${
            isLight
              ? 'bg-gradient-to-t from-[#F8F6F0] to-transparent'
              : 'bg-gradient-to-t from-[#060E18] to-transparent'
          }`}
        />
        <div
          className={`px-3 pt-1 ${isLight ? 'bg-[#F8F6F0] border-t border-slate-200/80' : 'bg-[#060E18]'}`}
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-xl mx-auto flex gap-2.5">
            <a
              href={`https://wa.me/919526319995?text=${whatsappMsg}`}
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
          </div>
        </div>
      </div>
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
