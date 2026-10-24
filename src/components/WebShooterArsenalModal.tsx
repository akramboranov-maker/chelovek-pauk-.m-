/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { ALL_WEB_SHOOTERS } from '../data/webShootersData';
import { WebShooterData, WebShooterCategory, Rarity } from '../types/game';
import { sound } from '../audio/soundEngine';
import {
  Search,
  Check,
  Lock,
  Zap,
  Target,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Flame,
  Radio,
  Eye,
  Crosshair,
  Compass
} from 'lucide-react';

interface WebShooterArsenalModalProps {
  equippedShooterId: number;
  unlockedShooterIds: number[];
  onSelectShooter: (shooter: WebShooterData) => void;
  onEquipShooter: (shooter: WebShooterData) => void;
  onUnlockShooter?: (shooterId: number) => void;
  onClose: () => void;
  onToggleInspectMode?: (isWristCloseUp: boolean) => void;
}

export const WebShooterArsenalModal: React.FC<WebShooterArsenalModalProps> = ({
  equippedShooterId,
  unlockedShooterIds,
  onSelectShooter,
  onEquipShooter,
  onUnlockShooter,
  onClose,
  onToggleInspectMode,
}) => {
  const [selectedShooter, setSelectedShooter] = useState<WebShooterData>(
    ALL_WEB_SHOOTERS.find((s) => s.id === equippedShooterId) || ALL_WEB_SHOOTERS[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const [isWristCamera, setIsWristCamera] = useState<boolean>(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories: (string | WebShooterCategory)[] = [
    'All',
    'Pneumatic-Mechanical',
    'Nanotech-Cyber',
    'Desert-Mystic',
    'Symbiotic-Organic',
    'Plasma-Energy',
    'Tactical-Ballistic',
    'Steampunk-Brass',
    'Quantum-Void',
    'Cryo-Elemental',
    'Heavy-Artillery',
  ];

  const rarities = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic'];

  const filteredShooters = useMemo(() => {
    return ALL_WEB_SHOOTERS.filter((shooter) => {
      const matchesCat = categoryFilter === 'All' || shooter.category === categoryFilter;
      const matchesRarity = rarityFilter === 'All' || shooter.rarity === rarityFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        shooter.name.toLowerCase().includes(query) ||
        String(shooter.id).includes(query) ||
        shooter.category.toLowerCase().includes(query) ||
        shooter.specialPerk.toLowerCase().includes(query) ||
        shooter.nozzleStyle.toLowerCase().includes(query) ||
        shooter.canisterType.toLowerCase().includes(query);
      return matchesCat && matchesRarity && matchesSearch;
    });
  }, [categoryFilter, rarityFilter, searchQuery]);

  const handlePick = (shooter: WebShooterData) => {
    setSelectedShooter(shooter);
    onSelectShooter(shooter);
    sound.playUiClick();
  };

  const toggleCamera = () => {
    const next = !isWristCamera;
    setIsWristCamera(next);
    sound.playUiClick();
    if (onToggleInspectMode) {
      onToggleInspectMode(next);
    }
  };

  const scrollList = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'up' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ top: offset, behavior: 'smooth' });
    }
  };

  const isEquipped = equippedShooterId === selectedShooter.id;
  const isUnlocked =
    unlockedShooterIds.includes(selectedShooter.id) ||
    selectedShooter.unlocked ||
    selectedShooter.id <= 3;

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
        return 'text-cyan-400 border-cyan-500 bg-cyan-500/20';
      default:
        return 'text-gray-300 border-gray-600 bg-gray-800/40';
    }
  };

  const getCategoryColor = (cat: WebShooterCategory) => {
    switch (cat) {
      case 'Desert-Mystic':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'Nanotech-Cyber':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
      case 'Symbiotic-Organic':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      case 'Plasma-Energy':
        return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
      case 'Tactical-Ballistic':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'Steampunk-Brass':
        return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
      case 'Quantum-Void':
        return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
      case 'Cryo-Elemental':
        return 'text-sky-300 border-sky-400/40 bg-sky-500/10';
      case 'Heavy-Artillery':
        return 'text-red-400 border-red-500/40 bg-red-500/10';
      case 'Pneumatic-Mechanical':
      default:
        return 'text-blue-300 border-blue-400/40 bg-blue-500/10';
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 md:p-8 pointer-events-none select-none font-sans overflow-hidden bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60">
      {/* Top Banner & Filter Bar */}
      <div className="flex flex-col gap-2.5 max-w-6xl w-full mx-auto pointer-events-auto">
        <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black italic tracking-wider text-white">
                  WEB SHOOTER ARSENAL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  50 UNIQUE 1:1 MODELS
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Precision wrist gauntlets, modular nozzles, pressure dials & dynamic web line colorways
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 3D Camera Toggle Button */}
            <button
              onClick={toggleCamera}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-md ${
                isWristCamera
                  ? 'bg-amber-500 text-black border-amber-400 shadow-amber-500/30'
                  : 'bg-slate-800 text-gray-300 border-slate-700 hover:border-amber-500/50'
              }`}
              title="Toggle close-up wrist gauntlet camera"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isWristCamera ? 'Focus: Wrist Gauntlet' : 'Focus: Full Body'}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playUiClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all border border-red-500/40 shadow-lg"
            >
              CLOSE (ESC)
            </button>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search 50 web shooters, perks, nozzles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 text-white text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Rarity Dropdown or Quick Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 mr-1">Rarity:</span>
            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => {
                  sound.playUiClick();
                  setRarityFilter(r);
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  rarityFilter === r
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Category Scroll Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-slate-950/50 backdrop-blur px-2 rounded-lg border border-slate-800/60">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playUiClick();
                setCategoryFilter(cat);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-gray-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All (50)' : cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Center Area: Left Grid + Right Tech Specs Inspector */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch justify-between max-w-6xl w-full mx-auto my-3 overflow-hidden pointer-events-none">
        {/* Left Side: 50 Web Shooters Grid with Scroll Controls */}
        <div className="w-full md:w-7/12 flex flex-col relative pointer-events-auto bg-slate-950/75 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              SELECT GAUNTLET ({filteredShooters.length} Available)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollList('up')}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300"
                title="Scroll Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollList('down')}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300"
                title="Scroll Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto no-3d-zoom pr-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 custom-scrollbar"
            style={{ maxHeight: 'calc(100vh - 310px)' }}
          >
            {filteredShooters.map((shooter) => {
              const selected = selectedShooter.id === shooter.id;
              const equipped = equippedShooterId === shooter.id;
              const unlocked =
                unlockedShooterIds.includes(shooter.id) ||
                shooter.unlocked ||
                shooter.id <= 3;

              return (
                <div
                  key={shooter.id}
                  onClick={() => handlePick(shooter)}
                  className={`relative p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group ${
                    selected
                      ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Top Status & Rarity */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-gray-400">
                      #{String(shooter.id).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getRarityBadge(
                        shooter.rarity
                      )}`}
                    >
                      {shooter.rarity}
                    </span>
                  </div>

                  {/* 3D Color Swatch & Nozzle Icon Preview */}
                  <div className="flex items-center gap-2 my-1">
                    <div className="relative w-8 h-8 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: shooter.primaryColor }}
                    >
                      {/* Accent ring */}
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{
                          backgroundColor: shooter.accentColor,
                          borderColor: shooter.glowColor,
                          boxShadow: `0 0 8px ${shooter.glowColor}`,
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-black text-white truncate leading-tight group-hover:text-amber-300">
                        {shooter.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 truncate">
                        {shooter.category.split('-')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Stats Preview: Tension & Tether Color */}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-800/80 text-[10px]">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      <span>{shooter.tensionYield}%</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400">Tether:</span>
                      <div
                        className="w-3 h-3 rounded-full border border-white/50"
                        style={{
                          backgroundColor: shooter.webColor,
                          boxShadow: `0 0 5px ${shooter.webColor}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Equipped or Locked Badge Overlay */}
                  {equipped && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                      <Check className="w-2.5 h-2.5" />
                      EQ
                    </div>
                  )}
                  {!unlocked && !equipped && (
                    <div className="absolute top-1 right-1 flex items-center bg-slate-900/90 text-gray-400 p-1 rounded-full border border-slate-700">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Tech Schematics & Equip Console */}
        <div className="w-full md:w-5/12 flex flex-col pointer-events-auto bg-slate-950/85 backdrop-blur-md rounded-2xl border border-amber-500/30 p-4 shadow-2xl overflow-y-auto no-3d-zoom justify-between custom-scrollbar"
          style={{ maxHeight: 'calc(100vh - 310px)' }}
        >
          {/* Title & Category Badge */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(selectedShooter.category)}`}>
                {selectedShooter.category}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getRarityBadge(selectedShooter.rarity)}`}>
                {selectedShooter.rarity}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-wide mt-1">
              {selectedShooter.name}
            </h2>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              {selectedShooter.description}
            </p>

            {/* Lore Box */}
            <div className="my-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-gray-300 italic">
              "{selectedShooter.lore}"
            </div>

            {/* Component Architecture Chips */}
            <div className="grid grid-cols-2 gap-2 my-2.5">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                  Nozzle Style
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5" />
                  {selectedShooter.nozzleStyle.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                  Canister Type
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  {selectedShooter.canisterType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Live Telemetry Progress Meters */}
            <div className="space-y-2 my-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {/* Tensile Yield */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    Tensile Yield Strength
                  </span>
                  <span className="text-amber-400 font-mono">{selectedShooter.tensionYield}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300"
                    style={{ width: `${selectedShooter.tensionYield}%` }}
                  />
                </div>
              </div>

              {/* Fire Rate */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    Cycle Rate (Burst / Sec)
                  </span>
                  <span className="text-cyan-400 font-mono">{selectedShooter.fireRate} rps</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300"
                    style={{ width: `${(selectedShooter.fireRate / 8.5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Reservoir Capacity */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Reservoir Capacity
                  </span>
                  <span className="text-emerald-400 font-mono">{selectedShooter.capacity} units</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${(selectedShooter.capacity / 100) * 100}%` }}
                  />
                </div>
              </div>

              {/* Effective Range */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    Effective Tether Range
                  </span>
                  <span className="text-purple-400 font-mono">{selectedShooter.webRange}m</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-300"
                    style={{ width: `${(selectedShooter.webRange / 250) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Special Passive Perk */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 my-2">
              <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                UNIQUE PASSIVE PERK
              </span>
              <p className="text-xs font-semibold text-white">
                {selectedShooter.specialPerk}
              </p>
            </div>

            {/* Web Tether Color Bar */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 my-2">
              <span className="text-xs text-gray-300 font-medium">3D Tether Line Color</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 uppercase">{selectedShooter.webColor}</span>
                <div
                  className="w-5 h-5 rounded-md border-2 border-white shadow"
                  style={{
                    backgroundColor: selectedShooter.webColor,
                    boxShadow: `0 0 10px ${selectedShooter.webColor}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Equip / Unlock Controls */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            {isEquipped ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-black text-center text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                EQUIPPED ON HERO WRISTS
              </div>
            ) : isUnlocked ? (
              <button
                onClick={() => {
                  sound.playEquip();
                  onEquipShooter(selectedShooter);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/30 active:scale-98"
              >
                EQUIP WEB SHOOTER
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="w-full py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-gray-400 text-center text-[11px] font-semibold flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  {selectedShooter.unlockCondition}
                </div>
                {onUnlockShooter && (
                  <button
                    onClick={() => {
                      sound.playLevelUp();
                      onUnlockShooter(selectedShooter.id);
                    }}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30 transition-all"
                  >
                    UNLOCK PROTOCOL (DEV/DEBUG)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation Tip */}
      <div className="text-center text-[10px] text-gray-400 pointer-events-auto bg-slate-900/60 backdrop-blur py-1 px-4 rounded-full max-w-md mx-auto border border-slate-800">
        Click and drag in the 3D space to orbit rotate • Scroll mouse wheel to zoom into wrist gauntlets
      </div>
    </div>
  );
};
