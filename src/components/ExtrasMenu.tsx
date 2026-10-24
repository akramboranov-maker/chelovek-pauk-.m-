/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { sound } from '../audio/soundEngine';
import { Award, Trophy, Camera, BarChart3, CheckCircle2 } from 'lucide-react';

interface ExtrasMenuProps {
  stats: PlayerStats;
  onClose: () => void;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  completed: boolean;
}

export const ExtrasMenu: React.FC<ExtrasMenuProps> = ({ stats, onClose }) => {
  const achievements: Achievement[] = [
    {
      id: 'first_swing',
      title: 'First Flight Across the Glass Canyon',
      desc: 'Execute your first pendulum swing between city skyscrapers.',
      completed: stats.distanceTraveledMiles > 0.05,
    },
    {
      id: 'speed_demon',
      title: 'Supersonic Arachnid',
      desc: 'Attain 55+ MPH during a high-altitude dive bomb.',
      completed: stats.speedMph >= 55,
    },
    {
      id: 'wardrobe_master',
      title: 'Armory of the Dizert',
      desc: 'Unlock and equip 5 distinct Spider Dizert suits.',
      completed: stats.unlockedSkins.length >= 3,
    },
    {
      id: 'boss_slayer',
      title: 'Titan Dismantler',
      desc: 'Overcome the Titan Apex siege mechanoid in combat.',
      completed: stats.bossesDefeated >= 1,
    },
    {
      id: 'city_traveler',
      title: 'Metropolitan Nomad',
      desc: 'Swing across 5 miles of open-world cityscape.',
      completed: stats.distanceTraveledMiles >= 5,
    },
  ];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-10 bg-black/85 backdrop-blur-xl pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT ARCHIVES
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            HERO EXTRAS & ACHIEVEMENTS
          </h2>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
        >
          RETURN
        </button>
      </div>

      {/* Hero Career Statistics */}
      <div className="my-6">
        <div className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          HERO CAREER TELEMETRY
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Total Miles Swung</div>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
              {stats.distanceTraveledMiles.toFixed(2)} <span className="text-xs text-white">MI</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Suits Unlocked</div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {stats.unlockedSkins.length} <span className="text-xs text-white">/ 200</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Crimes Stopped</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {stats.crimesStopped}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Bosses Neutralized</div>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              {stats.bossesDefeated}
            </div>
          </div>
        </div>
      </div>

      {/* Trophy / Achievements List */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          UNLOCKED HERO ACHIEVEMENTS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition ${
                ach.completed
                  ? 'border-amber-400/50 bg-amber-500/10'
                  : 'border-white/10 bg-white/5 opacity-60'
              }`}
            >
              <div>
                <h4 className="text-sm font-black text-white">{ach.title}</h4>
                <p className="text-xs text-gray-300 mt-0.5">{ach.desc}</p>
              </div>

              {ach.completed ? (
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 ml-3" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0 ml-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
