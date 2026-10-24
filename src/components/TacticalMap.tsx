/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mission, EnvironmentTheme } from '../types/game';
import { ALL_ENVIRONMENTS } from '../data/environmentsData';
import { sound } from '../audio/soundEngine';
import { Compass, MapPin, Target, Zap, Shield, Navigation } from 'lucide-react';

interface TacticalMapProps {
  playerPos: [number, number, number];
  missions: Mission[];
  currentMissionId: string;
  activeTheme: EnvironmentTheme;
  onFastTravel: (theme: EnvironmentTheme) => void;
  onSetMission: (mission: Mission) => void;
  onClose: () => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  playerPos,
  missions,
  currentMissionId,
  activeTheme,
  onFastTravel,
  onSetMission,
  onClose,
}) => {
  // Convert 3D world coordinates (-200..200) to 2D holographic map percentage (0%..100%)
  const toMapCoord = (x: number, z: number) => {
    const left = ((x + 200) / 400) * 100;
    const top = ((z + 200) / 400) * 100;
    return { left: `${Math.max(5, Math.min(95, left))}%`, top: `${Math.max(5, Math.min(95, top))}%` };
  };

  const heroCoord = toMapCoord(playerPos[0], playerPos[2]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-8 bg-black/90 backdrop-blur-2xl pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT TACTICAL HOLO-RADAR
          </div>
          <h2 className="text-2xl font-black text-white">
            METROPOLITAN OPEN-WORLD MAP
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 font-mono">
            COORDINATES: [{Math.round(playerPos[0])}, {Math.round(playerPos[1])}, {Math.round(playerPos[2])}]
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
          >
            CLOSE MAP [M]
          </button>
        </div>
      </div>

      {/* Main Holographic Map Canvas Grid */}
      <div className="flex-1 my-4 relative rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-b from-[#030d1a] to-[#010810] shadow-[inset_0_0_80px_rgba(6,182,212,0.15)] overflow-hidden flex items-center justify-center">
        {/* Holographic Radar Concentric Circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80%] h-[80%] rounded-full border border-cyan-500/10"></div>
          <div className="w-[50%] h-[50%] rounded-full border border-cyan-500/15"></div>
          <div className="w-[25%] h-[25%] rounded-full border border-cyan-500/20"></div>
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-cyan-500/10"></div>
          <div className="absolute h-full w-[1px] bg-cyan-500/10"></div>
        </div>

        {/* 12 Representative District Fast-Travel Hubs on the Grid */}
        {ALL_ENVIRONMENTS.slice(0, 16).map((env, idx) => {
          const angle = (idx / 16) * Math.PI * 2;
          const dist = 110 + (idx % 3) * 35;
          const gx = Math.cos(angle) * dist;
          const gz = Math.sin(angle) * dist;
          const coord = toMapCoord(gx, gz);
          const isCurrent = env.id === activeTheme.id;

          return (
            <div
              key={env.id}
              style={{ left: coord.left, top: coord.top }}
              onClick={() => {
                onFastTravel(env);
                sound.playFanfare();
                onClose();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/30 shadow-[0_0_15px_#f59e0b]'
                    : 'border-cyan-500/40 bg-cyan-950/40 group-hover:scale-125 group-hover:border-cyan-300'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'text-cyan-400'}`} />
              </div>
              <div className="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/90 border border-cyan-500/40 rounded px-2.5 py-1 text-[10px] whitespace-nowrap text-cyan-200 shadow-xl pointer-events-none z-10">
                <div className="font-bold text-white">{env.name}</div>
                <div className="text-[9px] text-amber-400">Click to Fast Travel</div>
              </div>
            </div>
          );
        })}

        {/* Mission Waypoint Pins */}
        {missions.map((m) => {
          const coord = toMapCoord(m.targetCoordinates[0], m.targetCoordinates[2]);
          const isTracking = m.id === currentMissionId;

          return (
            <div
              key={m.id}
              style={{ left: coord.left, top: coord.top }}
              onClick={() => {
                onSetMission(m);
                sound.playUiClick();
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isTracking
                    ? 'border-amber-400 bg-amber-500/40 animate-pulse shadow-[0_0_20px_#f59e0b]'
                    : 'border-rose-400 bg-rose-950/60 group-hover:scale-110'
                }`}
              >
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 rounded px-2 py-0.5 text-[10px] whitespace-nowrap text-white font-bold pointer-events-none">
                {m.title}
              </div>
            </div>
          );
        })}

        {/* Spider Dizert Current Player Marker */}
        <div
          style={{ left: heroCoord.left, top: heroCoord.top }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-[0_0_15px_#f59e0b] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>
            <span className="absolute -bottom-5 text-[9px] font-black uppercase text-amber-400 tracking-wider whitespace-nowrap drop-shadow">
              SPIDER DIZERT
            </span>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-white"></div>
            <span>Spider Dizert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300"></div>
            <span>Active Mission Objective</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-md bg-cyan-900 border border-cyan-400"></div>
            <span>District Fast-Travel Gate</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-500">
          Click any landmark icon to instantly deploy or set tactical waypoint
        </div>
      </div>
    </div>
  );
};
