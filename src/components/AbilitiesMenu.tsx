/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../audio/soundEngine';
import { Zap, Wind, Shield, Sparkles, Check, ArrowRight } from 'lucide-react';

interface AbilitiesMenuProps {
  unlockedAbilities: string[];
  skillPoints: number;
  onUnlockAbility: (abilityId: string, cost: number) => void;
  onClose: () => void;
}

interface AbilityNode {
  id: string;
  name: string;
  branch: 'Combat' | 'Traversal' | 'Web-Tech' | 'Suit';
  cost: number;
  description: string;
  statEffect: string;
}

const ALL_ABILITIES: AbilityNode[] = [
  {
    id: 'point_launch_boost',
    name: 'Kinetic Catapult Launch',
    branch: 'Traversal',
    cost: 1,
    description: 'Press Q at building cornices to supercharge the web-zip into a high-altitude slingshot.',
    statEffect: '+45% Vertical Vault Height',
  },
  {
    id: 'air_trick_momentum',
    name: 'Acrobatic Velocity Pump',
    branch: 'Traversal',
    cost: 2,
    description: 'Performing aerial rolls and flips charges kinetic capacitor energy, boosting next swing speed.',
    statEffect: '+25% Peak Swing Speed',
  },
  {
    id: 'dive_shockwave',
    name: 'Falcon Ground Slam',
    branch: 'Combat',
    cost: 2,
    description: 'Diving from high altitude into street level emits an expanding kinetic shockwave that knocks back enemies.',
    statEffect: '10m Area of Effect Stun',
  },
  {
    id: 'perfect_dodge_counter',
    name: 'Spider-Sense Reflex Counter',
    branch: 'Combat',
    cost: 3,
    description: 'Dodging right as the spider-sense halo flashes triggers a slow-motion counter punch.',
    statEffect: 'Instant Web Cocoon on Attacker',
  },
  {
    id: 'web_tether_double',
    name: 'Dual Web Strike',
    branch: 'Web-Tech',
    cost: 2,
    description: 'Fire twin web lines simultaneously to slam two adjacent syndicate mercenaries together.',
    statEffect: 'Multi-Target Takedown',
  },
  {
    id: 'nano_regen',
    name: 'Bio-Chitin Cell Repair',
    branch: 'Suit',
    cost: 3,
    description: 'Integrated nano-threads constantly mend minor suit punctures during high-speed swinging.',
    statEffect: '+2 HP/sec while in air',
  },
];

export const AbilitiesMenu: React.FC<AbilitiesMenuProps> = ({
  unlockedAbilities,
  skillPoints,
  onUnlockAbility,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-10 bg-black/85 backdrop-blur-xl pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT PROGRESSION
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            HERO SKILL TREE & UPGRADES
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-gray-200">AVAILABLE SKILL POINTS:</span>
            <span className="text-lg font-mono font-black text-amber-400">{skillPoints}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
          >
            RESUME
          </button>
        </div>
      </div>

      {/* Grid of Upgrades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6 overflow-y-auto">
        {ALL_ABILITIES.map((node) => {
          const isUnlocked = unlockedAbilities.includes(node.id);
          const canAfford = skillPoints >= node.cost;

          return (
            <div
              key={node.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isUnlocked
                  ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : canAfford
                  ? 'border-amber-500/50 bg-white/5 hover:bg-amber-500/10'
                  : 'border-white/10 bg-white/5 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300">
                    {node.branch}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {node.cost} SKILL POINT{node.cost > 1 ? 'S' : ''}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white">{node.name}</h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">{node.description}</p>

                <div className="mt-3 p-2 rounded bg-black/40 border border-white/5 text-xs text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {node.statEffect}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10">
                {isUnlocked ? (
                  <div className="w-full py-2.5 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-xs font-black uppercase flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> MASTERED
                  </div>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      onUnlockAbility(node.id, node.cost);
                      sound.playFanfare();
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    UNLOCK UPGRADE
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
