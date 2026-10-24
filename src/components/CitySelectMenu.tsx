/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ALL_ENVIRONMENTS } from '../data/environmentsData';
import { EnvironmentTheme } from '../types/game';
import { sound } from '../audio/soundEngine';
import { Globe, MapPin, CloudRain, Sun, Moon, Wind, Check, Navigation } from 'lucide-react';

interface CitySelectMenuProps {
  currentEnvironmentId: number;
  onSelectEnvironment: (theme: EnvironmentTheme) => void;
  onClose: () => void;
}

export const CitySelectMenu: React.FC<CitySelectMenuProps> = ({
  currentEnvironmentId,
  onSelectEnvironment,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<EnvironmentTheme>(
    ALL_ENVIRONMENTS.find((e) => e.id === currentEnvironmentId) || ALL_ENVIRONMENTS[0]
  );
  const [filterQuery, setFilterQuery] = useState('');

  const filteredEnvironments = ALL_ENVIRONMENTS.filter((env) =>
    env.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    env.districtTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
    String(env.id).includes(filterQuery)
  );

  const handlePick = (theme: EnvironmentTheme) => {
    setSelectedTheme(theme);
    sound.playUiClick();
  };

  const handleFastTravel = (theme: EnvironmentTheme) => {
    onSelectEnvironment(theme);
    sound.playFanfare();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-8 bg-black/80 backdrop-blur-lg pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT METROPOLITAN ATLAS
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            40 DISTRICT ENVIRONMENTS
          </h2>
          <div className="text-xs text-gray-400">
            Select any district to instantly reconfigure the open-world architecture, sky, weather, and atmosphere
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search district name or #..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-emerald-400 w-52 md:w-64"
          />
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
          >
            RETURN
          </button>
        </div>
      </div>

      {/* Main Body: Grid of 40 Districts on Left + Selected District Detail Card on Right */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-6 my-4 overflow-hidden">
        {/* Left: Scrollable 40 Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[calc(100vh-220px)]">
          {filteredEnvironments.map((env) => {
            const isSelected = selectedTheme.id === env.id;
            const isCurrent = currentEnvironmentId === env.id;

            return (
              <div
                key={env.id}
                onClick={() => handlePick(env)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Visual Sky & Fog Accent Strip */}
                <div
                  className="h-1.5 w-full rounded-full mb-2.5"
                  style={{
                    background: `linear-gradient(to right, ${env.skyColor}, ${env.sunColor}, ${env.neonColors[0] || env.windowGlowColor})`,
                  }}
                />

                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-gray-400">
                    DISTRICT #{String(env.id).padStart(2, '0')}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-black px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> ACTIVE
                    </span>
                  )}
                </div>

                <div className="text-sm font-black text-white mt-1">{env.name}</div>
                <div className="text-[11px] text-amber-400 font-medium truncate mb-2">
                  {env.districtTitle}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-400 border-t border-white/5 pt-2">
                  <span className="capitalize">{env.defaultWeather}</span>
                  <span>•</span>
                  <span className="capitalize">{env.defaultTime}</span>
                  <span>•</span>
                  <span className="capitalize">{env.featureProps}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected District Showcase Card */}
        <div className="w-full lg:w-96 bg-black/90 border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DISTRICT #{String(selectedTheme.id).padStart(2, '0')} / 40
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                METROPOLITAN SECTOR
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-0.5">
              {selectedTheme.name}
            </h3>
            <div className="text-xs font-bold text-amber-400 mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {selectedTheme.districtTitle}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {selectedTheme.description}
            </p>

            {/* Atmosphere Specs */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" /> Climate & Weather
                </span>
                <span className="font-bold text-white uppercase">{selectedTheme.defaultWeather}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" /> Lighting Phase
                </span>
                <span className="font-bold text-white uppercase">{selectedTheme.defaultTime}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-400" /> District Landmarks
                </span>
                <span className="font-bold text-white uppercase">{selectedTheme.featureProps}</span>
              </div>
            </div>

            {/* Architectural Swatches */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                Architecture Color Signatures
              </div>
              <div className="flex items-center gap-2">
                {selectedTheme.buildingPalette.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md border border-white/30 shadow"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action: Fast Travel / Warp */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => handleFastTravel(selectedTheme)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-black" />
              TRAVEL TO {selectedTheme.name.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
