/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mission, BossData } from '../types/game';

export interface StoryChapter {
  id: number;
  title: string;
  actName: string;
  synopsis: string;
  unlockedSkinRewardId: number;
  dialogueSequence: {
    speaker: string;
    avatar: string;
    text: string;
  }[];
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'Awakening of the Dunes',
    actName: 'Prologue: Origins of the Resonance',
    synopsis: 'Spider Dizert surveys the Aegis Central skyline as mysterious kinetic seismic pulses ripple across the city. Strange bio-mechanical drones attack communication relays.',
    unlockedSkinRewardId: 1,
    dialogueSequence: [
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'Another quiet sunset over the city... or so I hoped. My sensory lenses are picking up massive resonance spikes from the financial grid.' },
      { speaker: 'Dr. Thorne', avatar: 'ally', text: 'Dizert! Check your HUD telemetry. Those aren’t typical seismic tremors. Someone is synchronizing high-frequency pulse emitters across the skyscraper spires!' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'Understood. Time to stretch the web-shooters and introduce them to Spider Dizert.' },
      { speaker: 'Maya Sterling', avatar: 'contact', text: 'Dizert, heads up—local precinct scanners are completely blinded. You’re our only eyes up there.' }
    ]
  },
  {
    id: 2,
    title: 'Shadows over Lucent Quarter',
    actName: 'Act I: The Neon Conspiracy',
    synopsis: 'The syndicate deploys armored mercenaries to hijack high-speed maglev lines in the Neon Night City district. Spider Dizert must intercept the convoy and protect civilian commuters.',
    unlockedSkinRewardId: 2,
    dialogueSequence: [
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'They’re cutting the power to the transit line! If that train derails at 200 mph, hundreds could get hurt.' },
      { speaker: 'Detective Ramos', avatar: 'police', text: 'Spider Dizert, this is Ramos. S.W.A.T. is pinned down on the lower bridge. Those armored thugs have military-grade kinetic shields!' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'Leave the shields to me, Detective. Keep the perimeter clear and watch the civilians!' },
      { speaker: 'Enforcer Lead', avatar: 'thug', text: 'The bug is here! Focus heavy repeaters on his web line—shred him into the pavement!' }
    ]
  },
  {
    id: 3,
    title: 'Clash of Steel: Titan Apex',
    actName: 'Act I Finale: The Iron Behemoth',
    synopsis: 'At the Vulcan Forge industrial shipyard, the syndicate unleashes the terrifying Titan Apex—a four-story mechanized walker designed to crush metropolitan infrastructure.',
    unlockedSkinRewardId: 12,
    dialogueSequence: [
      { speaker: 'Titan Apex', avatar: 'boss', text: 'TARGET IDENTIFIED: SPIDER DIZERT. THREAT LEVEL: MAXIMUM. COMMENCING OBLITERATION.' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'You know, for a giant walking toaster, your manners could really use an update!' },
      { speaker: 'Dr. Thorne', avatar: 'ally', text: 'Dizert! Its outer hull is invulnerable to direct punches! Aim for its kinetic heat vents during its ground slam shockwaves!' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'Find the glowing weak spot... classic video game rules. On it!' }
    ]
  },
  {
    id: 4,
    title: 'The Ghost in the Circuit',
    actName: 'Act II: Phantom Protocols',
    synopsis: 'A stealth assassin known as the Vortex Phantom begins stealing neural bio-chips from Silicon Matrix Hub, phasing through physical matter and setting holographic traps.',
    unlockedSkinRewardId: 3,
    dialogueSequence: [
      { speaker: 'Vortex Phantom', avatar: 'boss', text: 'You run fast, little spider. But can your spider-sense detect that which does not exist in your dimension?' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'I don’t need dimensions when I have web-tethers! Stop flickering and face me!' },
      { speaker: 'Maya Sterling', avatar: 'contact', text: 'Dizert, she is downloading the city’s emergency quarantine codes! Trap her before the upload finishes!' }
    ]
  },
  {
    id: 5,
    title: 'The Fall of the Spire',
    actName: 'Act III: Dizert Ascendant',
    synopsis: 'The mastermind reveals himself: The Dizert Overlord, wielding an ancient bio-resonance harness stolen from the sacred dunes. The final duel across the Stratosphere Colossus begins.',
    unlockedSkinRewardId: 40,
    dialogueSequence: [
      { speaker: 'Dizert Overlord', avatar: 'boss', text: 'You claim the name "Spider Dizert", yet you protect this rotting cage of concrete and steel! Together we could have ruled both sand and sky!' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'This city gave me my second chance. The people down there make it alive. And as long as I have breath in my lungs, you’ll never take it from them!' },
      { speaker: 'Dr. Thorne', avatar: 'ally', text: 'His core is destabilizing! Channel your web-momentum into one final kinetic bio-strike!' },
      { speaker: 'Spider Dizert', avatar: 'hero', text: 'This is where it ends. For the city. For Spider Dizert!' }
    ]
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_story',
    title: 'Prologue: Patrol the Skies',
    chapter: 1,
    type: 'story',
    district: 'Modern Downtown',
    description: 'Familiarize yourself with the advanced web-swinging physics. Attain 45+ mph and swing across the high-rise skyscraper canyon.',
    objective: 'Reach the designated communications relay rooftop antenna.',
    progress: 0,
    targetProgress: 1,
    completed: false,
    rewardXP: 500,
    rewardSkinId: 2,
    targetCoordinates: [0, 42, -50]
  },
  {
    id: 'm2_combat',
    title: 'Syndicate Ambush',
    chapter: 1,
    type: 'story',
    district: 'Aegis Central Plaza',
    description: 'A squad of armed syndicate thugs is cornering an armored transport on the avenue below.',
    objective: 'Defeat all 4 syndicate mercenaries using punches, web-shots, and dodge counters.',
    progress: 0,
    targetProgress: 4,
    completed: false,
    rewardXP: 750,
    rewardSkinId: 6,
    targetCoordinates: [-25, 2, 40]
  },
  {
    id: 'm3_chase',
    title: 'High-Velocity Drone Pursuit',
    chapter: 2,
    type: 'chase',
    district: 'Neon Night City',
    description: 'An autonomous scout drone is fleeing with stolen encrypted schematics. Swing at maximum velocity to intercept and web-yank it out of the air.',
    objective: 'Stay within 20m of the target drone and press Web Strike to intercept.',
    progress: 0,
    targetProgress: 1,
    completed: false,
    rewardXP: 1000,
    rewardSkinId: 7,
    targetCoordinates: [45, 55, -80]
  },
  {
    id: 'm4_boss_titan',
    title: 'Boss Battle: Titan Apex',
    chapter: 3,
    type: 'boss',
    district: 'Vulcan Forge Yards',
    description: 'The terrifying mechanized juggernaut has deployed at the shipyard. Evade its missile salvos and kinetic shockwaves to dismantle its power cores.',
    objective: 'Defeat Titan Apex (Phase 1 & Phase 2).',
    progress: 0,
    targetProgress: 1,
    completed: false,
    rewardXP: 2500,
    rewardSkinId: 12,
    targetCoordinates: [80, 5, 80]
  },
  {
    id: 'm5_rescue',
    title: 'Rooftop Hostage Rescue',
    chapter: 2,
    type: 'rescue',
    district: 'Financial District',
    description: 'Hostile operatives have trapped civilian engineers on a helipad atop Sovereign Tower.',
    objective: 'Infiltrate the helipad, neutralize the sentries, and secure the evac zone.',
    progress: 0,
    targetProgress: 3,
    completed: false,
    rewardXP: 800,
    rewardSkinId: 9,
    targetCoordinates: [-70, 75, -20]
  },
  {
    id: 'm6_challenge',
    title: 'Apex Traversal Time Trial',
    chapter: 1,
    type: 'challenge',
    district: 'Mega Skyscraper District',
    description: 'Pass through all 6 holographic rings suspended between high-rise cranes before the timer expires.',
    objective: 'Complete the aerial ring course in under 45 seconds.',
    progress: 0,
    targetProgress: 6,
    completed: false,
    rewardXP: 600,
    rewardSkinId: 18,
    targetCoordinates: [30, 60, 30]
  },
  {
    id: 'm7_boss_phantom',
    title: 'Boss Battle: Vortex Phantom',
    chapter: 4,
    type: 'boss',
    district: 'Silicon Matrix Hub',
    description: 'Confront the elusive phase-shifting assassin on the multi-tiered cyber-platform.',
    objective: 'Trap the Vortex Phantom using EMP web bursts and finish her holographic decoys.',
    progress: 0,
    targetProgress: 1,
    completed: false,
    rewardXP: 3000,
    rewardSkinId: 3,
    targetCoordinates: [-40, 30, 90]
  },
  {
    id: 'm8_boss_overlord',
    title: 'Final Confrontation: Dizert Overlord',
    chapter: 5,
    type: 'boss',
    district: 'Ultimate Central City',
    description: 'The fate of the entire conurbation rests on this clash atop the apex spire. Stop the Overlord from draining the bio-resonance capacitor!',
    objective: 'Defeat Dizert Overlord across all 3 combat phases.',
    progress: 0,
    targetProgress: 1,
    completed: false,
    rewardXP: 5000,
    rewardSkinId: 20,
    targetCoordinates: [0, 95, 0]
  }
];

export const BOSS_ROSTER: BossData[] = [
  {
    id: 'titan_apex',
    name: 'Titan Apex',
    title: 'Four-Legged Armored Siege Engine',
    maxHealth: 1500,
    currentHealth: 1500,
    phase: 1,
    maxPhases: 2,
    specialMove: 'Seismic Shockwave & Micro-Missile Barrage',
    avatarColor: '#f97316'
  },
  {
    id: 'vortex_phantom',
    name: 'Vortex Phantom',
    title: 'Quantum Phase-Shift Infiltrator',
    maxHealth: 1800,
    currentHealth: 1800,
    phase: 1,
    maxPhases: 2,
    specialMove: 'Holo-Decoy Ambush & Laser Shuriken',
    avatarColor: '#a855f7'
  },
  {
    id: 'dizert_overlord',
    name: 'Dizert Overlord',
    title: 'Mastermind of the Ancient Resonance',
    maxHealth: 2500,
    currentHealth: 2500,
    phase: 1,
    maxPhases: 3,
    specialMove: 'Sand Tempest Bio-Drain & Kinetic Spire Slam',
    avatarColor: '#ef4444'
  }
];
