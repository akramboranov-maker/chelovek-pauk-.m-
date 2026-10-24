/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Play, BookOpen, Target, Globe, Shirt, Users, Zap, Settings, Award, Crosshair, ChevronUp, ChevronDown } from 'lucide-react';
import { sound } from '../audio/soundEngine';

export type MenuTab = 'PLAY' | 'STORY' | 'MISSIONS' | 'CITY' | 'SKINS' | 'WEB_SHOOTERS' | 'CHARACTERS' | 'ABILITIES' | 'SETTINGS' | 'EXTRAS';

interface MainMenuProps {
  onSelectOption: (option: MenuTab) => void;
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectOption, onStartGame }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const menuButtons: { id: MenuTab; label: string; icon: React.ReactNode; desc: string; hotkey: string }[] = [
    { id: 'PLAY', label: 'PLAY', icon: <Play className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />, desc: 'Jump directly into the open-world city', hotkey: '1' },
    { id: 'STORY', label: 'STORY', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />, desc: 'Campaign chapters & cinematic cutscenes', hotkey: '2' },
    { id: 'MISSIONS', label: 'MISSIONS', icon: <Target className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />, desc: 'Track quests, street crimes & boss battles', hotkey: '3' },
    { id: 'CITY', label: 'CITY', icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />, desc: 'Explore all 40 unique environment themes', hotkey: '4' },
    { id: 'SKINS', label: 'SKINS', icon: <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />, desc: 'Inspect & equip all 200 Spider Dizert suits', hotkey: '5' },
    { id: 'WEB_SHOOTERS', label: 'WEB SHOOTERS (50)', icon: <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />, desc: 'Inspect & equip all 50 unique 1:1 gauntlet models', hotkey: '6' },
    { id: 'CHARACTERS', label: 'CHARACTERS', icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />, desc: 'Hero dossier, allies & syndicate bosses', hotkey: '7' },
    { id: 'ABILITIES', label: 'ABILITIES', icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />, desc: 'Upgrade combat, web velocity & suit tech', hotkey: '8' },
    { id: 'SETTINGS', label: 'SETTINGS', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />, desc: 'Graphics presets, audio & control mapping', hotkey: '9' },
    { id: 'EXTRAS', label: 'EXTRAS', icon: <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />, desc: 'Achievements, statistics & photo mode', hotkey: '0' },
  ];

  const handleClick = (id: MenuTab) => {
    sound.playUiClick();
    if (id === 'PLAY') {
      onStartGame();
    } else {
      onSelectOption(id);
    }
  };

  const scrollUp = () => {
    sound.playUiClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -140, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    sound.playUiClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 140, behavior: 'smooth' });
    }
  };

  // Keyboard navigation (1-9 hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= menuButtons.length) {
        const item = menuButtons[num - 1];
        if (item) {
          handleClick(item.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-10 pointer-events-none select-none font-sans overflow-hidden">
      {/* Top Header & Official Game Title */}
      <div className="flex flex-col items-start max-w-xl pointer-events-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
          <span className="text-[10px] sm:text-xs uppercase font-black tracking-widest text-amber-400">
            OFFICIAL AAA SUPERHERO EXPERIENCE
          </span>
        </div>

        {/* Master Game Title with Dynamic Animated Shimmer & Electric Glow */}
        <div className="relative group animated-web-pulse">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter text-white leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            <span className="tracking-wider block text-white/95 text-2xl sm:text-3xl md:text-5xl">
              THE BEGINNING:
            </span>
            <span className="block bg-gradient-to-r from-amber-400 via-orange-500 via-rose-500 to-amber-300 bg-clip-text text-transparent animated-title-gradient animated-title-glow mt-1">
              SPIDER DIZERT
            </span>
          </h1>
          {/* Subtle animated neon underline */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-transparent rounded-full mt-2 opacity-80" />
        </div>
        <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs md:text-sm text-gray-300 font-medium max-w-md drop-shadow line-clamp-2 sm:line-clamp-none">
          A new dawn rises over the metropolis. Master dynamic pendulum web-swinging, crawl skyscrapers without clipping, investigate the syndicate threat, and explore 40 living districts with 200 unique suits.
        </p>
      </div>

      {/* Main Navigation Menu List with Smooth Scrolling and .no-3d-zoom */}
      <div className="flex flex-col my-auto max-w-md pointer-events-auto no-3d-zoom relative">
        {/* Scroll Up Button */}
        <button
          onClick={scrollUp}
          title="Scroll Up"
          className="flex items-center justify-center gap-1.5 py-1 px-3 mb-1 text-[11px] font-bold text-amber-400/80 hover:text-amber-300 bg-black/60 hover:bg-black/90 border border-white/10 hover:border-amber-500/50 rounded-md transition cursor-pointer shadow"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>SCROLL UP</span>
        </button>

        {/* Scrollable Container with Custom Scrollbar */}
        <div
          ref={scrollContainerRef}
          className="flex flex-col gap-2 max-h-[48vh] sm:max-h-[52vh] md:max-h-[56vh] overflow-y-auto pr-2 custom-scrollbar"
        >
          {menuButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleClick(btn.id)}
              className="group flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 hover:border-amber-500/80 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/20 hover:translate-x-1.5 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded bg-white/5 group-hover:bg-amber-500/20 transition flex-shrink-0">
                  {btn.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm md:text-base font-black tracking-wide text-white group-hover:text-amber-400 transition flex items-center gap-2">
                    <span>{btn.label}</span>
                    <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-1 rounded group-hover:text-amber-400 group-hover:border-amber-500/40 border border-transparent">
                      [{btn.hotkey}]
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 group-hover:text-gray-300 truncate max-w-[210px] sm:max-w-xs">
                    {btn.desc}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-500 group-hover:text-amber-400 transition ml-2">
                &rarr;
              </span>
            </button>
          ))}
        </div>

        {/* Scroll Down Button */}
        <button
          onClick={scrollDown}
          title="Scroll Down"
          className="flex items-center justify-center gap-1.5 py-1 px-3 mt-1 text-[11px] font-bold text-amber-400/80 hover:text-amber-300 bg-black/60 hover:bg-black/90 border border-white/10 hover:border-amber-500/50 rounded-md transition cursor-pointer shadow"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>SCROLL DOWN</span>
        </button>
      </div>

      {/* Footer / Copyright & Version */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-xs text-gray-400 pointer-events-auto border-t border-white/10 pt-2 sm:pt-3 gap-1">
        <div>
          <span className="font-bold text-gray-200">The Beginning: Spider Dizert</span> &copy; 2026. All rights reserved. Original superhero universe.
        </div>
        <div className="font-mono text-gray-500">
          v2.5.0 • 200 SUITS • 40 DISTRICTS
        </div>
      </div>
    </div>
  );
};
