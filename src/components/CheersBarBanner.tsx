'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Sparkles, Plus, Minus, ChevronLeft, ChevronRight, GlassWater, Wine } from 'lucide-react';
import { MenuItem } from '@/types/menu';

interface CheersBarBannerProps {
  items: MenuItem[];
  tray: Record<string, { item: MenuItem; quantity: number }>;
  addToTray: (item: MenuItem) => void;
  decrementTray: (itemId: string) => void;
  isLight: boolean;
}

const MOODS = [
  {
    gradient: 'from-[#06101E] via-[#0B1D38] to-[#071324]',
    border: 'border-[#C5A059]/40',
    glow: 'bg-[#C5A059]/20',
    accentText: 'text-[#E5C07B]',
    pillActive: 'bg-[#C5A059]/20 border-[#C5A059] text-[#E5C07B]',
    badgeBg: 'bg-[#C5A059]/15 border-[#C5A059]/30 text-[#E5C07B]',
    emoji: '🥃',
  },
  {
    gradient: 'from-[#140F0A] via-[#241A12] to-[#120D08]',
    border: 'border-amber-500/40',
    glow: 'bg-amber-500/20',
    accentText: 'text-amber-400',
    pillActive: 'bg-amber-500/20 border-amber-400 text-amber-300',
    badgeBg: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
    emoji: '🥃',
  },
  {
    gradient: 'from-[#051426] via-[#0A2644] to-[#06172B]',
    border: 'border-sky-400/40',
    glow: 'bg-sky-400/20',
    accentText: 'text-sky-300',
    pillActive: 'bg-sky-500/20 border-sky-400 text-sky-200',
    badgeBg: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
    emoji: '🍸',
  },
  {
    gradient: 'from-[#1A0606] via-[#2F0B0E] to-[#170506]',
    border: 'border-rose-500/40',
    glow: 'bg-rose-500/20',
    accentText: 'text-rose-300',
    pillActive: 'bg-rose-500/20 border-rose-400 text-rose-200',
    badgeBg: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
    emoji: '🍺',
  },
];

export default function CheersBarBanner({
  items,
  tray,
  addToTray,
  decrementTray,
  isLight,
}: CheersBarBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = items.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto slide every 5s unless paused
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, total, handleNext]);

  // Touch navigation handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const mood = MOODS[currentIndex % MOODS.length];
  const trayEntry = tray[currentItem.id];
  const inTray = !!trayEntry;

  return (
    <div className="max-w-xl mx-auto px-4 pt-1 pb-3 relative z-10 select-none">
      {/* ── Section Title Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Wine className="w-4 h-4 text-[#8C6B1C] dark:text-[#E5C07B]" />
          <h3 className={`font-serif text-sm sm:text-base font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-[#E5C07B]'}`}>
            The Cheers Lounge Selections
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-sans tracking-wide">
            Sommelier Curated
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              aria-label="Previous bar highlight"
              className={`p-1 rounded-full border transition active:scale-90 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-[#0D1B2A] border-white/15 text-slate-300 hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next bar highlight"
              className={`p-1 rounded-full border transition active:scale-90 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                  : 'bg-[#0D1B2A] border-white/15 text-slate-300 hover:bg-white/10'
              }`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Luxury Hero Banner Card ── */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 shadow-lg bg-gradient-to-br ${mood.gradient} ${mood.border} text-white`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${mood.glow}`}
        />

        {/* Top Mini Header inside Banner */}
        <div className="px-3.5 pt-3 pb-1 flex items-center justify-between border-b border-white/10 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-slate-300">
              The Cheers · Signature Feature
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono tracking-wider text-slate-400">
              0{currentIndex + 1} / 0{total}
            </span>
          </div>
        </div>

        {/* Banner Content Body (Row Layout) */}
        <div className="p-3.5 sm:p-4 flex flex-row items-stretch gap-3 sm:gap-4 relative z-10">
          {/* Left: Drink Information & Order Actions */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              {/* Category & Volume Tag */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${mood.badgeBg} flex items-center gap-1`}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {currentItem.category}
                </span>
                {currentItem.volume && (
                  <span className="text-[10px] text-slate-300 font-medium flex items-center gap-0.5">
                    <GlassWater className="w-3 h-3 text-slate-400" />
                    {currentItem.volume}
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-tight tracking-wide line-clamp-1">
                {currentItem.name}
              </h4>

              {/* Flavor Profile */}
              {currentItem.flavorProfile && (
                <p className={`text-[11px] font-medium mt-0.5 italic ${mood.accentText} line-clamp-1`}>
                  {currentItem.flavorProfile}
                </p>
              )}

              {/* Tasting Notes */}
              {currentItem.description && (
                <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2 leading-relaxed font-sans">
                  {currentItem.description}
                </p>
              )}
            </div>

            {/* Price & Add to Tray Action */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-base sm:text-lg font-bold font-sans tabular-nums ${mood.accentText}`}>
                    {typeof currentItem.price === 'number' ? `₹${currentItem.price}` : currentItem.price}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-400">
                    Incl. Taxes
                  </span>
                </div>
              </div>

              {/* Tray Stepper or Add Button */}
              {inTray ? (
                <div className="flex items-center gap-1.5 bg-[#C5A059]/20 border border-[#C5A059] rounded-lg px-2 py-0.5 shrink-0">
                  <button
                    onClick={() => decrementTray(currentItem.id)}
                    className="p-1 text-slate-300 hover:text-rose-400 transition active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold px-1 tabular-nums text-white">
                    {trayEntry.quantity}
                  </span>
                  <button
                    onClick={() => addToTray(currentItem)}
                    className="p-1 text-slate-300 hover:text-emerald-400 transition active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToTray(currentItem)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-sm ${
                    mood.pillActive
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Tray</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Authentic Drink / Bottle Photography */}
          {currentItem.image && (
            <div className="w-28 sm:w-36 shrink-0 relative rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-inner group">
              <div className="relative h-full min-h-[140px] sm:min-h-[160px] w-full">
                <Image
                  src={currentItem.image}
                  alt={currentItem.name}
                  fill
                  sizes="(max-width: 640px) 120px, 150px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1.5 right-1.5 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white border border-white/20">
                  Official
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Selector Quick-Pills ── */}
        <div className="px-3 pb-3 pt-1 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none relative z-10">
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            const itemMood = MOODS[idx % MOODS.length];
            return (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 transition-all duration-300 ${
                  isActive
                    ? `${itemMood.pillActive} shadow-xs scale-102`
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{itemMood.emoji}</span>
                <span className="line-clamp-1">{item.name.split(' ')[0]}</span>
                <span className="font-sans font-normal opacity-70 tabular-nums">
                  ₹{item.price}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
