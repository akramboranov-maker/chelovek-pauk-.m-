/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mission, BossData } from '../types/game';
import { STORY_CHAPTERS, BOSS_ROSTER } from '../data/storyData';
import { sound } from '../audio/soundEngine';
import { Target, Award, BookOpen, ShieldAlert, Crosshair, CheckCircle2, ChevronRight } from 'lucide-react';

interface MissionsMenuProps {
  missions: Mission[];
  currentMissionId: string;
  onSelectMission: (mission: Mission) => void;
  onStartBossBattle: (boss: BossData) => void;
  onOpenStoryDialogue: (chapterId: number) => void;
  onClose: () => void;
}

export const MissionsMenu: React.FC<MissionsMenuProps> = ({
  missions,
  currentMissionId,
  onSelectMission,
  onStartBossBattle,
  onOpenStoryDialogue,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'story' | 'bosses'>('missions');

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-8 bg-black/85 backdrop-blur-xl pointer-events-auto select-none font-sans overflow-hidden no-3d-zoom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            THE BEGINNING: SPIDER DIZERT MISSIONS & CAMPAIGN
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            OPERATIONS & ARCHIVES
          </h2>
        </div>

        {/* Tab Switcher & Close */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white/10 p-1 rounded-lg border border-white/15">
            <button
              onClick={() => { setActiveTab('missions'); sound.playUiClick(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'missions' ? 'bg-amber-500 text-black shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              Missions & Events
            </button>
            <button
              onClick={() => { setActiveTab('story'); sound.playUiClick(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'story' ? 'bg-amber-500 text-black shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              Story Chapters
            </button>
            <button
              onClick={() => { setActiveTab('bosses'); sound.playUiClick(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'bosses' ? 'bg-rose-500 text-white shadow' : 'text-gray-300 hover:text-white'
              }`}
            >
              Boss Dossiers
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition border border-white/20 cursor-pointer shadow"
          >
            RESUME
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto my-4 pr-2">
        {activeTab === 'missions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((m) => {
              const isActive = m.id === currentMissionId;
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    isActive
                      ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span className="text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                        {m.type}
                      </span>
                      <span className="text-gray-400">Chapter {m.chapter} • {m.district}</span>
                    </div>

                    <h3 className="text-lg font-black text-white mt-1">{m.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{m.description}</p>

                    <div className="mt-3 p-2.5 rounded bg-black/40 border border-white/5 flex items-center gap-2 text-xs text-gray-200">
                      <Crosshair className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{m.objective}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> +{m.rewardXP} XP
                    </span>

                    {isActive ? (
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> TRACKING OBJECTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onSelectMission(m);
                          sound.playUiClick();
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase transition cursor-pointer shadow"
                      >
                        SET WAYPOINT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'story' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {STORY_CHAPTERS.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-black tracking-widest text-cyan-400">
                    {ch.actName}
                  </div>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    Chapter {ch.id}: {ch.title}
                  </h3>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    {ch.synopsis}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onOpenStoryDialogue(ch.id);
                    sound.playUiClick();
                  }}
                  className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-cyan-600/30 flex items-center gap-2 whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4" />
                  REPLAY CUTSCENE & DIALOGUE
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bosses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BOSS_ROSTER.map((boss) => (
              <div
                key={boss.id}
                className="p-5 rounded-2xl bg-white/5 border border-rose-500/30 hover:border-rose-500 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ALPHA BOSS
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {boss.maxPhases} PHASES
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white">{boss.name}</h3>
                  <div className="text-xs text-rose-400 font-semibold mb-3">{boss.title}</div>

                  <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-xs text-gray-300 space-y-1.5 mb-4">
                    <div>
                      <span className="text-gray-400">Health Pool: </span>
                      <span className="font-mono font-bold text-white">{boss.maxHealth} HP</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Signature Strike: </span>
                      <span className="text-rose-300 font-semibold">{boss.specialMove}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onStartBossBattle(boss);
                    sound.playFanfare();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  ENGAGE BOSS ENCOUNTER
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
