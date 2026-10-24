/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats, Mission, EnvironmentTheme, SkinData } from '../types/game';
import { Compass, Shield, Zap, Crosshair, Award, MapPin, Gauge } from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  currentMission: Mission | null;
  activeTheme: EnvironmentTheme;
  equippedSkin: SkinData;
  onOpenMap: () => void;
  onOpenMenu: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  currentMission,
  activeTheme,
  equippedSkin,
  onOpenMap,
  onOpenMenu,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const webPercent = Math.max(0, Math.min(100, (stats.webEnergy / stats.maxWebEnergy) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 select-none font-sans">
      {/* Top Bar: Hero Status & District Title */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Health & Web Meters */}
        <div className="flex flex-col gap-2">
          {/* Official Game Title Micro Badge with Animated Shimmer */}
          <div className="text-[10px] tracking-widest font-black uppercase drop-shadow flex items-center gap-1.5 animated-web-pulse">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_8px_#f59e0b] animate-ping"></span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent animated-title-gradient font-black">
              THE BEGINNING: SPIDER DIZERT
            </span>
          </div>

          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 min-w-[260px] shadow-2xl">
            {/* Health Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-gray-200 mb-1">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                VITALITY
              </span>
              <span className="font-mono text-emerald-400">{Math.round(stats.health)}/{stats.maxHealth}</span>
            </div>
            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Web Energy Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-gray-200 mt-2.5 mb-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                WEB CHARGE
              </span>
              <span className="font-mono text-cyan-400">{Math.round(stats.webEnergy)}/{stats.maxWebEnergy}</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-200"
                style={{ width: `${webPercent}%` }}
              />
            </div>

            {/* Current Suit Info */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span className="truncate max-w-[170px] text-gray-300 font-semibold">{equippedSkin.name}</span>
              <span className="text-amber-400 font-mono font-bold">#{String(equippedSkin.id).padStart(3, '0')}</span>
            </div>
          </div>
        </div>

        {/* Top Center: Combo Counter & Speedometer */}
        <div className="flex flex-col items-center">
          {stats.comboCount > 0 && (
            <div className="flex flex-col items-center animate-bounce">
              <div className="text-4xl font-black italic tracking-tighter text-amber-400 drop-shadow-[0_2px_12px_rgba(245,158,11,0.6)]">
                {stats.comboCount}
                <span className="text-lg text-white ml-1">HITS</span>
              </div>
              <div className="text-xs uppercase tracking-widest font-black text-rose-400">
                x{stats.comboMultiplier.toFixed(1)} MULTIPLIER
              </div>
            </div>
          )}

          {/* Speedometer (Speed In MPH) */}
          <div className="mt-2 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-black font-mono text-white tracking-wider">
              {stats.speedMph} <span className="text-[10px] text-cyan-400">MPH</span>
            </span>
            {stats.isSwinging && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded uppercase">
                SWINGING
              </span>
            )}
            {stats.isWallClimbing && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded uppercase border border-emerald-500/30">
                WALL-CLIMBING
              </span>
            )}
            {stats.isWallRunning && (
              <span className="text-[10px] font-bold text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded uppercase">
                WALL-RUN
              </span>
            )}
            {stats.isDiving && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded uppercase">
                DIVING
              </span>
            )}
          </div>
        </div>

        {/* Top Right: District Badge & Quick Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* District Title */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2.5 text-right shadow-2xl flex items-center gap-2.5">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">DISTRICT {activeTheme.id}/40</div>
              <div className="text-xs font-black text-white">{activeTheme.name}</div>
              <div className="text-[10px] text-amber-400">{activeTheme.districtTitle}</div>
            </div>
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>

          {/* Interactive Menu & Map Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto mt-1">
            <button
              onClick={onOpenMap}
              className="px-3 py-1.5 bg-black/70 hover:bg-cyan-600/80 text-white rounded border border-white/15 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              MAP [M]
            </button>
            <button
              onClick={onOpenMenu}
              className="px-3 py-1.5 bg-black/70 hover:bg-amber-600/80 text-white rounded border border-white/15 text-xs font-bold transition cursor-pointer shadow-lg"
            >
              MENU [ESC]
            </button>
          </div>
        </div>
      </div>

      {/* Middle Floating Alerts (Spider-Sense Danger Notice) */}
      <div className="flex flex-col items-center justify-center">
        {/* Dynamic spider sense is also visually rendered in 3D around Dizert's cowl */}
      </div>

      {/* Bottom Bar: Active Mission HUD & Controls Reference */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom Left: Mission Objective Card */}
        {currentMission && (
          <div className="bg-black/75 backdrop-blur-md border-l-4 border-l-amber-500 border border-white/10 rounded-r-lg p-3 max-w-md shadow-2xl">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-400 mb-0.5">
              <span>{currentMission.type.toUpperCase()} MISSION</span>
              <span>CHAPTER {currentMission.chapter}</span>
            </div>
            <div className="text-sm font-black text-white">{currentMission.title}</div>
            <div className="text-xs text-gray-300 mt-1 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{currentMission.objective}</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Reward: <span className="text-amber-400 font-bold">+{currentMission.rewardXP} XP</span>
            </div>
          </div>
        )}

        {/* Bottom Right: Quick Input Reminder Dock */}
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-[11px] text-gray-300 shadow-2xl flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-[10px]">SPACE / R-CLICK</span>
            <span className="text-amber-300">Swing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-[10px]">L-CLICK / F</span>
            <span className="text-amber-300">Attack</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-[10px]">E</span>
            <span className="text-cyan-300">Web Shot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-[10px]">Q</span>
            <span className="text-cyan-300">Point Launch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-[10px]">W / SPACE on wall</span>
            <span className="text-emerald-300">Climb</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-white text-[10px]">C / SHIFT</span>
            <span className="text-rose-300">Dive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
