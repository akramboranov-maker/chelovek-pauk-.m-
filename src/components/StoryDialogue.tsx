/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { STORY_CHAPTERS, StoryChapter } from '../data/storyData';
import { sound } from '../audio/soundEngine';
import { ChevronRight, Radio, Shield } from 'lucide-react';

interface StoryDialogueProps {
  chapterId: number;
  onComplete: () => void;
}

export const StoryDialogue: React.FC<StoryDialogueProps> = ({ chapterId, onComplete }) => {
  const chapter = STORY_CHAPTERS.find((c) => c.id === chapterId) || STORY_CHAPTERS[0];
  const [lineIndex, setLineIndex] = useState(0);

  const currentLine = chapter.dialogueSequence[lineIndex];

  const handleNext = () => {
    sound.playUiClick();
    if (lineIndex < chapter.dialogueSequence.length - 1) {
      setLineIndex(lineIndex + 1);
    } else {
      sound.playFanfare();
      onComplete();
    }
  };

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case 'Spider Dizert':
        return 'text-amber-400 border-amber-500';
      case 'Dr. Thorne':
        return 'text-cyan-400 border-cyan-500';
      case 'Maya Sterling':
        return 'text-purple-400 border-purple-500';
      case 'Detective Ramos':
        return 'text-blue-400 border-blue-500';
      default:
        return 'text-rose-400 border-rose-500';
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end p-6 md:p-12 pointer-events-auto select-none font-sans bg-gradient-to-t from-black via-black/40 to-transparent">
      {/* Cinematic Letterbox Bars */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black flex items-center justify-between px-8 text-xs text-gray-400 border-b border-white/10">
        <span className="font-black tracking-widest text-amber-500 uppercase flex items-center gap-2">
          <Radio className="w-3.5 h-3.5" />
          THE BEGINNING: SPIDER DIZERT • CHAPTER {chapter.id}
        </span>
        <button
          onClick={onComplete}
          className="text-gray-400 hover:text-white transition font-mono uppercase text-[11px] cursor-pointer"
        >
          SKIP CUTSCENE [ESC]
        </button>
      </div>

      {/* Main Dialogue Box */}
      <div className="max-w-3xl mx-auto w-full bg-black/90 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getSpeakerColor(currentLine.speaker)} bg-white/5`}>
              {currentLine.speaker}
            </span>
            <span className="text-xs text-gray-400">
              COMM-LINK ACTIVE
            </span>
          </div>

          <span className="text-xs font-mono text-gray-500">
            {lineIndex + 1} / {chapter.dialogueSequence.length}
          </span>
        </div>

        <p className="text-base md:text-lg text-white font-medium leading-relaxed my-4 min-h-[4rem]">
          &ldquo;{currentLine.text}&rdquo;
        </p>

        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
          <span className="text-[11px] text-gray-400">
            Press CONTINUE or SPACE to advance dialogue
          </span>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            {lineIndex < chapter.dialogueSequence.length - 1 ? 'CONTINUE' : 'ENGAGE OBJECTIVE'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
