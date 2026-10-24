/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../audio/soundEngine';

interface TouchControlsProps {
  onSwingDown: () => void;
  onSwingUp: () => void;
  onAttack: () => void;
  onWebShot: () => void;
  onPointLaunch: () => void;
  onDive: () => void;
  onMoveChange: (forward: boolean, backward: boolean, left: boolean, right: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onSwingDown,
  onSwingUp,
  onAttack,
  onWebShot,
  onPointLaunch,
  onDive,
  onMoveChange,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between p-4 md:hidden select-none">
      {/* Virtual D-pad (Bottom Left) */}
      <div className="flex flex-col items-center justify-end pointer-events-auto">
        <div className="grid grid-cols-3 gap-1 w-36 h-36 bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10">
          <div></div>
          <button
            onTouchStart={() => onMoveChange(true, false, false, false)}
            onTouchEnd={() => onMoveChange(false, false, false, false)}
            className="rounded-full bg-white/15 active:bg-amber-500/60 text-white font-black text-sm flex items-center justify-center border border-white/20"
          >
            ▲
          </button>
          <div></div>

          <button
            onTouchStart={() => onMoveChange(false, false, true, false)}
            onTouchEnd={() => onMoveChange(false, false, false, false)}
            className="rounded-full bg-white/15 active:bg-amber-500/60 text-white font-black text-sm flex items-center justify-center border border-white/20"
          >
            ◀
          </button>
          <div className="rounded-full bg-white/5 flex items-center justify-center text-[10px] text-gray-400 font-bold">
            MOVE
          </div>
          <button
            onTouchStart={() => onMoveChange(false, false, false, true)}
            onTouchEnd={() => onMoveChange(false, false, false, false)}
            className="rounded-full bg-white/15 active:bg-amber-500/60 text-white font-black text-sm flex items-center justify-center border border-white/20"
          >
            ▶
          </button>

          <div></div>
          <button
            onTouchStart={() => onMoveChange(false, true, false, false)}
            onTouchEnd={() => onMoveChange(false, false, false, false)}
            className="rounded-full bg-white/15 active:bg-amber-500/60 text-white font-black text-sm flex items-center justify-center border border-white/20"
          >
            ▼
          </button>
          <div></div>
        </div>
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="flex flex-col items-end justify-end pointer-events-auto gap-2">
        <div className="flex items-center gap-2">
          {/* Wall Climb Button */}
          <button
            onTouchStart={() => onMoveChange(true, false, false, false)}
            onTouchEnd={() => onMoveChange(false, false, false, false)}
            className="w-13 h-13 rounded-full bg-emerald-600/80 active:bg-emerald-500 text-white text-[10px] font-black uppercase border border-emerald-400/50 shadow-lg flex items-center justify-center"
          >
            CLIMB
          </button>

          {/* Web Shot Button */}
          <button
            onTouchStart={() => onWebShot()}
            onClick={() => onWebShot()}
            className="w-13 h-13 rounded-full bg-cyan-600/80 active:bg-cyan-500 text-white text-[11px] font-black uppercase border border-cyan-400/50 shadow-lg flex items-center justify-center"
          >
            STUN
          </button>

          {/* Point Launch Button */}
          <button
            onTouchStart={() => onPointLaunch()}
            onClick={() => onPointLaunch()}
            className="w-13 h-13 rounded-full bg-purple-600/80 active:bg-purple-500 text-white text-[11px] font-black uppercase border border-purple-400/50 shadow-lg flex items-center justify-center"
          >
            ZIP
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Attack Button */}
          <button
            onTouchStart={() => onAttack()}
            onClick={() => onAttack()}
            className="w-15 h-15 rounded-full bg-rose-600/80 active:bg-rose-500 text-white text-xs font-black uppercase border border-rose-400/50 shadow-xl flex items-center justify-center"
          >
            ATTACK
          </button>

          {/* Web Swing Primary Button */}
          <button
            onTouchStart={() => onSwingDown()}
            onTouchEnd={() => onSwingUp()}
            className="w-18 h-18 rounded-full bg-amber-500 active:bg-amber-400 text-black text-xs font-black uppercase border-2 border-white shadow-2xl flex items-center justify-center shadow-amber-500/40"
          >
            SWING
          </button>
        </div>
      </div>
    </div>
  );
};
