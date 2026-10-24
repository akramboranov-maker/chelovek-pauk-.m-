/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';
import { Users, Shield, Zap, Sparkles, BookOpen } from 'lucide-react';

interface CharacterDossier {
  id: string;
  name: string;
  role: 'Hero' | 'Ally' | 'Syndicate Boss' | 'Law Enforcement';
  alias?: string;
  voiceActorNote: string;
  biography: string;
  signatureAbility: string;
  loreOrigin: string;
  color: string;
}

const CHARACTERS: CharacterDossier[] = [
  {
    id: 'spider_dizert',
    name: 'Spider Dizert',
    role: 'Hero',
    alias: 'The Desert Arachnid',
    voiceActorNote: 'Determined, charismatic, acrobatic, quick-witted in combat',
    biography: 'Bonded with rare bio-resonance dunes during a cataclysmic sand expedition, Spider Dizert possesses superhuman agility, surface adhesion, and the instinctual precognition known as the Spider-Sense. He took up the mantle to protect the expanding conurbation from technological exploitation.',
    signatureAbility: 'Pendulum Kinetic Web-Swinging & Bio-Electric Impact Strikes',
    loreOrigin: 'Born of the ancient sands, recalibrated for modern high-rises',
    color: '#f59e0b',
  },
  {
    id: 'dr_thorne',
    name: 'Dr. Aris Thorne',
    role: 'Ally',
    alias: 'Chief Cybernetics Architect',
    voiceActorNote: 'Brilliant, analytical, mentor figure who monitors Dizert telemetry',
    biography: 'Dr. Thorne engineered Dizert’s signature mechanical web-shooters, calibrating their tension-yield limits and nanite refill mechanisms. He operates out of a concealed rooftop laboratory in the Lucent Quarter.',
    signatureAbility: 'Remote HUD Satellite Uplink & Suit Firmware Overclocks',
    loreOrigin: 'Former lead researcher at Apex Robotics',
    color: '#06b6d4',
  },
  {
    id: 'maya_sterling',
    name: 'Maya Sterling',
    role: 'Ally',
    alias: 'Investigative Journalist',
    voiceActorNote: 'Tenacious, fast-talking, fearlessly exposes syndicate corruption',
    biography: 'Maya was the first to realize that the seismic tremors across the metropolis were not natural occurrences. Her encrypted network feeds Dizert crime tips and syndicate supply convoy coordinates.',
    signatureAbility: 'Underground Scanner Intercepts & Whistleblower Intelligence',
    loreOrigin: 'Senior investigative writer for the Daily Herald',
    color: '#a855f7',
  },
  {
    id: 'detective_ramos',
    name: 'Detective Cole Ramos',
    role: 'Law Enforcement',
    alias: 'Metropolitan Precinct Captain',
    voiceActorNote: 'Grizzled, seasoned, tough-edged protector of ordinary citizens',
    biography: 'Initially distrustful of masked vigilantes, Ramos witnessed Spider Dizert save a derailed transit car from plunging off the bridge. Today, they maintain a reluctant, respectful hotline.',
    signatureAbility: 'Tactical Police Support & Metropolitan Perimeter Quarantine',
    loreOrigin: '22-year veteran of the High Heights Police Department',
    color: '#3b82f6',
  },
  {
    id: 'titan_apex',
    name: 'Titan Apex',
    role: 'Syndicate Boss',
    alias: 'The Walking Fortress',
    voiceActorNote: 'Deep metallic synthetic growl, seismic rumblings',
    biography: 'A 20-ton robotic siege walker equipped with hydraulic impact pistons and thermal missile silos. Deployed by the syndicate to demolish the city’s power conduits.',
    signatureAbility: 'Seismic Shockwave Ground Pound & Reactive Armor Plating',
    loreOrigin: 'Manufactured in the deep Vulcan Forge shipyard',
    color: '#f97316',
  },
  {
    id: 'vortex_phantom',
    name: 'Vortex Phantom',
    role: 'Syndicate Boss',
    alias: 'The Phase Assassin',
    voiceActorNote: 'Whispering ethereal tone, cold, calculating assassin',
    biography: 'Wielding quantum phase-shifting cloaks, the Vortex Phantom can walk through concrete walls and leave deadly holographic after-images that mislead target radar.',
    signatureAbility: 'Dimensional Warp & Laser Shuriken Barrage',
    loreOrigin: 'Black-budget operative vanished from the Silicon Matrix',
    color: '#c084fc',
  },
  {
    id: 'dizert_overlord',
    name: 'Dizert Overlord',
    role: 'Syndicate Boss',
    alias: 'The Mastermind of the Dune',
    voiceActorNote: 'Commanding, megalomaniacal, ancient resonance harness',
    biography: 'The supreme mastermind behind the entire metropolitan plot. Believing that modern cities have forgotten the primordial balance of the dunes, he seeks to drain the city’s electrical grid to fuel his cosmic resonance capacitor.',
    signatureAbility: 'Sand Tempest Bio-Drain & Kinetic Spire Cataclysm',
    loreOrigin: 'Custodian of the forbidden bio-resonance core',
    color: '#ef4444',
  },
];

export const CharactersMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedChar, setSelectedChar] = useState<CharacterDossier>(CHARACTERS[0]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-10 bg-black/85 backdrop-blur-xl pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT ARCHIVES
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            CHARACTER PROFILES & DOSSIERS
          </h2>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
        >
          RETURN
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch gap-6 my-6 overflow-hidden">
        {/* Left List of Characters */}
        <div className="w-full md:w-80 flex flex-col gap-2 overflow-y-auto pr-1">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selectedChar.id;
            return (
              <button
                key={char.id}
                onClick={() => {
                  setSelectedChar(char);
                  sound.playUiClick();
                }}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-sm font-black text-white">{char.name}</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: char.color }}>
                    {char.role}
                  </div>
                </div>
                <div
                  className="w-3 h-3 rounded-full border border-white/50"
                  style={{ backgroundColor: char.color }}
                />
              </button>
            );
          })}
        </div>

        {/* Right Dossier Detail */}
        <div className="flex-1 bg-black/90 border border-white/15 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] uppercase font-black px-3 py-1 rounded-full border bg-white/5"
                style={{ color: selectedChar.color, borderColor: selectedChar.color }}
              >
                {selectedChar.role}
              </span>
              <span className="text-xs font-mono text-gray-400">
                {selectedChar.alias}
              </span>
            </div>

            <h3 className="text-3xl font-black text-white mt-1">{selectedChar.name}</h3>
            <div className="text-xs text-gray-400 italic mb-4">
              Voice: {selectedChar.voiceActorNote}
            </div>

            <p className="text-sm text-gray-200 leading-relaxed mb-6 font-medium">
              {selectedChar.biography}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Signature Prowess
                </div>
                <div className="text-xs text-white font-semibold">
                  {selectedChar.signatureAbility}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Background Origin
                </div>
                <div className="text-xs text-white font-semibold">
                  {selectedChar.loreOrigin}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>The Beginning: Spider Dizert Canon Dossier</span>
            <span className="font-mono text-amber-400 font-bold">CLASSIFIED // LEVEL 5</span>
          </div>
        </div>
      </div>
    </div>
  );
};
