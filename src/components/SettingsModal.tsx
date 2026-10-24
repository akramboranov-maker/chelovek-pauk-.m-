/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSettings, GraphicsQuality } from '../types/game';
import { sound } from '../audio/soundEngine';
import { Settings, Monitor, Volume2, Gamepad2, Eye } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const qualities: GraphicsQuality[] = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA', 'CINEMATIC'];

  const handleQualityChange = (q: GraphicsQuality) => {
    sound.playUiClick();
    onUpdateSettings({ graphicsQuality: q });
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-10 bg-black/85 backdrop-blur-xl pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT SYSTEM
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            GAME SETTINGS & PERFORMANCE
          </h2>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow"
        >
          APPLY & RETURN
        </button>
      </div>

      {/* Main Settings Sections */}
      <div className="flex-1 my-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
        {/* 1. Graphics Presets */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <Monitor className="w-4 h-4 text-cyan-400" />
              GRAPHICS QUALITY PRESET
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Scales rendering resolution, shadow map precision, and post-processing.
            </p>

            <div className="flex flex-col gap-2">
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 px-3.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    settings.graphicsQuality === q
                      ? 'bg-cyan-500 text-black font-black shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>{q}</span>
                  {settings.graphicsQuality === q && <span className="text-[10px] uppercase font-black">ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-400">
            Recommended: <span className="text-white font-bold">HIGH</span> for modern desktop GPUs; <span className="text-white font-bold">MEDIUM</span> for laptops.
          </div>
        </div>

        {/* 2. Audio Sliders */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <Volume2 className="w-4 h-4 text-amber-400" />
              AUDIO CONTROLS
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Procedural Web Audio mixing for wind, swinging, combat, and cinematic score.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Master Volume</span>
                  <span className="font-mono">{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSettings({ masterVolume: val });
                    sound.setVolumes(val, settings.sfxVolume, settings.musicVolume);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Sound Effects (SFX)</span>
                  <span className="font-mono">{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSettings({ sfxVolume: val });
                    sound.setVolumes(settings.masterVolume, val, settings.musicVolume);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Dynamic Music Soundtrack</span>
                  <span className="font-mono">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onUpdateSettings({ musicVolume: val });
                    sound.setVolumes(settings.masterVolume, settings.sfxVolume, val);
                  }}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-400">
            Real-time Web Audio API dynamic synthesis.
          </div>
        </div>

        {/* 3. Controls Reference & Camera */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-black text-sm mb-1">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              KEYBOARD & CONTROLS GUIDE
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Full input bindings for movement, swinging, and combat.
            </p>

            <div className="space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Move / Run</span>
                <span className="font-mono font-bold text-white">W, A, S, D</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Web Swing</span>
                <span className="font-mono font-bold text-amber-400">SPACE / R-CLICK</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Light / Heavy Strike</span>
                <span className="font-mono font-bold text-rose-400">L-CLICK / F</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Web Shot (Stun)</span>
                <span className="font-mono font-bold text-cyan-400">E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Point Launch / Zip</span>
                <span className="font-mono font-bold text-cyan-400">Q</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Falcon Dive / Sprint</span>
                <span className="font-mono font-bold text-white">SHIFT / C</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Look Around</span>
                <span className="font-mono font-bold text-white">Mouse Drag</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-400">
            Touch controls automatically active on touchscreens.
          </div>
        </div>
      </div>
    </div>
  );
};
