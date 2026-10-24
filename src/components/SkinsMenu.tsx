/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { ALL_SKINS } from '../data/skinsData';
import { SkinData, Rarity } from '../types/game';
import { sound } from '../audio/soundEngine';
import {
  Search,
  RotateCcw,
  Check,
  Lock,
  Sparkles,
  Zap,
  Shield,
  Wind,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  Eye,
  Crosshair,
  SlidersHorizontal
} from 'lucide-react';

interface SkinsMenuProps {
  equippedSkinId: number;
  unlockedSkinIds: number[];
  onSelectSkin: (skin: SkinData) => void;
  onEquipSkin: (skin: SkinData) => void;
  onUnlockSkin: (skinId: number) => void;
  onClose: () => void;
  onOpenWebShooters?: () => void;
}

export const SkinsMenu: React.FC<SkinsMenuProps> = ({
  equippedSkinId,
  unlockedSkinIds,
  onSelectSkin,
  onEquipSkin,
  onUnlockSkin,
  onClose,
  onOpenWebShooters,
}) => {
  const [selectedSkin, setSelectedSkin] = useState<SkinData>(
    ALL_SKINS.find((s) => s.id === equippedSkinId) || ALL_SKINS[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 24;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Desert', 'Classic', 'Futuristic', 'Stealth', 'Armored', 'Tactical', 'Cosmic', 'Elemental', 'Prototype', 'Urban'];

  const filteredSkins = useMemo(() => {
    return ALL_SKINS.filter((skin) => {
      const matchesCat = categoryFilter === 'All' || skin.category === categoryFilter;
      const matchesSearch =
        skin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(skin.id).includes(searchQuery) ||
        skin.rarity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skin.maskStyle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredSkins.length / ITEMS_PER_PAGE) || 1;
  const paginatedSkins = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSkins.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSkins, currentPage]);

  const handlePick = (skin: SkinData) => {
    setSelectedSkin(skin);
    onSelectSkin(skin);
    sound.playUiClick();
  };

  const scrollList = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'up' ? -180 : 180;
      scrollContainerRef.current.scrollBy({ top: offset, behavior: 'smooth' });
    }
  };

  const isEquipped = equippedSkinId === selectedSkin.id;
  const isUnlocked = unlockedSkinIds.includes(selectedSkin.id) || selectedSkin.id <= 2;

  const getRarityBadge = (rarity: Rarity) => {
    switch (rarity) {
      case 'Cosmic':
        return 'text-fuchsia-400 border-fuchsia-500 bg-fuchsia-500/20';
      case 'Mythic':
        return 'text-rose-400 border-rose-500 bg-rose-500/20';
      case 'Legendary':
        return 'text-amber-400 border-amber-500 bg-amber-500/20';
      case 'Epic':
        return 'text-purple-400 border-purple-500 bg-purple-500/20';
      case 'Rare':
        return 'text-blue-400 border-blue-500 bg-blue-500/20';
      default:
        return 'text-gray-300 border-gray-600 bg-gray-500/20';
    }
  };

  const getMaskStyleName = (style: SkinData['maskStyle']) => {
    switch (style) {
      case 'cyber_visor': return 'Holographic Cyber-Visor';
      case 'quad_sensor': return 'Quad Night-Vision Lenses';
      case 'pharaoh_crest': return 'Golden Ancient Crest';
      case 'stealth_cowl': return 'Tactical Shadow Cowl';
      default: return 'Classic Angular Ocular Lenses';
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-3 md:p-6 pointer-events-none select-none font-sans overflow-hidden">
      {/* Top Header & Search Bar */}
      <div className="no-3d-zoom flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 shadow-2xl">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT SUIT ARCHIVE (200 BESPOKE SKINS)
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            200 UNIQUE SPIDER DIZERT SUITS
          </h2>
          <div className="text-xs text-gray-400">
            Each suit features distinct physical geometry, masks, waldoes, and accessories • {unlockedSkinIds.length}/200 Unlocked
          </div>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search suit name, #, or style..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-amber-400 w-48 md:w-64"
            />
          </div>

          {onOpenWebShooters && (
            <button
              onClick={() => {
                sound.playUiClick();
                onOpenWebShooters();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition border border-amber-500/40 cursor-pointer shadow"
            >
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>WEB SHOOTERS (50)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
          >
            BACK TO GAME
          </button>
        </div>
      </div>

      {/* Center 3D Drag Tip */}
      <div className="flex items-center justify-center my-auto pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm border border-white/15 px-4 py-1.5 rounded-full text-[11px] text-gray-200 flex items-center gap-2 shadow-lg">
          <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Drag in center 3D viewport to inspect suit in 360°</span>
        </div>
      </div>

      {/* Bottom Interface: Suits Carousel & Selected Suit Dossier */}
      <div className="no-3d-zoom flex flex-col lg:flex-row items-stretch gap-4 pointer-events-auto">
        {/* Left: Filter Buttons, Scrollable Suits Grid & Page Navigation */}
        <div className="flex-1 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Scroll / Page Toolbar */}
            <div className="flex items-center justify-between text-xs text-gray-400 my-1 px-1 border-b border-white/5 pb-1.5">
              <span className="font-mono text-[11px]">
                Showing {filteredSkins.length} Suits (Page {currentPage} of {totalPages})
              </span>

              <div className="flex items-center gap-1">
                {/* Scroll Down & Up explicit buttons */}
                <button
                  onClick={() => scrollList('up')}
                  title="Scroll Up"
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Up
                </button>
                <button
                  onClick={() => scrollList('down')}
                  title="Scroll Down"
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" /> Down
                </button>

                <div className="w-[1px] h-3 bg-white/20 mx-1" />

                {/* Page Prev & Next */}
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Suits with natural vertical scrolling */}
          <div
            ref={scrollContainerRef}
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-12 gap-2 max-h-56 overflow-y-auto mt-2 pr-1 scroll-smooth"
            style={{ overscrollBehavior: 'contain' }}
          >
            {paginatedSkins.map((skin) => {
              const selected = selectedSkin.id === skin.id;
              const equipped = equippedSkinId === skin.id;
              const unlocked = unlockedSkinIds.includes(skin.id) || skin.id <= 2;

              return (
                <button
                  key={skin.id}
                  onClick={() => handlePick(skin)}
                  className={`relative p-2 rounded-lg border transition-all duration-150 flex flex-col items-center justify-center cursor-pointer ${
                    selected
                      ? 'border-amber-400 bg-amber-500/25 scale-105 shadow-md shadow-amber-500/40 ring-1 ring-amber-400'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Color Swatch Dot */}
                  <div
                    className="w-5 h-5 rounded-full mb-1 border border-white/40 shadow-inner flex items-center justify-center relative"
                    style={{ backgroundColor: skin.primaryColor }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: skin.accentColor }}
                    />
                    {skin.hasMechanicalSpiderArms && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black" title="4 Mechanical Spider Waldo Arms" />
                    )}
                  </div>

                  <span className="text-[10px] font-mono font-bold text-gray-200">
                    #{String(skin.id).padStart(3, '0')}
                  </span>
                  <span className="text-[9px] truncate w-full text-center text-gray-400 font-medium">
                    {skin.name}
                  </span>

                  {equipped && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-black rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {!unlocked && (
                    <span className="absolute -top-1 -left-1 bg-black/80 text-gray-400 rounded-full p-0.5">
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Suit Detailed Dossier & Silhouette Specs */}
        <div className="w-full lg:w-96 bg-black/90 backdrop-blur-md border border-white/15 rounded-xl p-4 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${getRarityBadge(selectedSkin.rarity)}`}>
                {selectedSkin.rarity}
              </span>
              <span className="text-xs font-mono font-bold text-gray-400">
                SUIT #{String(selectedSkin.id).padStart(3, '0')} / 200
              </span>
            </div>

            <h3 className="text-lg font-black text-white">{selectedSkin.name}</h3>
            <div className="text-[11px] text-amber-400 uppercase font-bold tracking-wider mb-2">
              Category: {selectedSkin.category} • Pattern: {selectedSkin.patternType}
            </div>

            {/* Visual Silhouette & Physical Geometry Badges ("bir biriga o'xshamasin") */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 mb-3 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-gray-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                UNIQUE SUIT GEOMETRY & ARCHETYPE
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {getMaskStyleName(selectedSkin.maskStyle)}
                </span>
                {selectedSkin.hasMechanicalSpiderArms && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> 4 Mechanical Waldo Arms
                  </span>
                )}
                {selectedSkin.hasGauntletBlades && (
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                    Gauntlet Blades
                  </span>
                )}
                {selectedSkin.hasShoulderPauldrons && (
                  <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300">
                    Armored Pauldrons
                  </span>
                )}
                {selectedSkin.hasWebWings && (
                  <span className="px-2 py-0.5 rounded bg-teal-950/60 border border-teal-500/40 text-teal-300">
                    Web Glider Wings
                  </span>
                )}
                {selectedSkin.hasCosmicHalo && (
                  <span className="px-2 py-0.5 rounded bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-300 font-bold">
                    Orbiting Nano-Halo
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              {selectedSkin.description}
            </p>

            {/* Passive Ability */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                SIGNATURE PASSIVE
              </div>
              <div className="text-xs text-amber-200 mt-0.5 font-medium">
                {selectedSkin.passiveAbility}
              </div>
            </div>

            {/* Stat Modifiers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded p-2 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Wind className="w-3 h-3 text-cyan-400" /> Swing Vel.
                </span>
                <span className="font-mono font-bold text-cyan-400">+{selectedSkin.statBonus.swingSpeed}%</span>
              </div>
              <div className="bg-white/5 rounded p-2 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Shield className="w-3 h-3 text-emerald-400" /> Defense
                </span>
                <span className="font-mono font-bold text-emerald-400">+{selectedSkin.statBonus.defense}</span>
              </div>
              <div className="bg-white/5 rounded p-2 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3 text-rose-400" /> Damage
                </span>
                <span className="font-mono font-bold text-rose-400">+{selectedSkin.statBonus.damage}</span>
              </div>
              <div className="bg-white/5 rounded p-2 flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-400" /> Web Recharge
                </span>
                <span className="font-mono font-bold text-amber-400">+{selectedSkin.statBonus.webRecharge}%</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-gray-400">
              <span className="font-bold text-gray-300">Unlock: </span>
              {selectedSkin.unlockCondition}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 pt-3 border-t border-white/10">
            {isEquipped ? (
              <button
                disabled
                className="w-full py-2.5 rounded-lg bg-emerald-600/50 border border-emerald-500 text-white text-xs font-black uppercase flex items-center justify-center gap-2 cursor-default"
              >
                <Check className="w-4 h-4 text-emerald-300" />
                CURRENTLY EQUIPPED
              </button>
            ) : isUnlocked ? (
              <button
                onClick={() => {
                  onEquipSkin(selectedSkin);
                  sound.playFanfare();
                }}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                EQUIP SUIT
              </button>
            ) : (
              <button
                onClick={() => {
                  onUnlockSkin(selectedSkin.id);
                  onEquipSkin(selectedSkin);
                  sound.playFanfare();
                }}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                UNLOCK & EQUIP SUIT
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
