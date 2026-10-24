/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SkinData } from '../types/game';

// Base generator data to ensure 200 distinct named skins with thematic coherence
const SUIT_THEMES = [
  // 1-20: Origin & Dizert Lineage
  { name: 'Dizert Prime (Canon)', cat: 'Desert', rar: 'Mythic', p: '#b83b1d', s: '#211815', a: '#e09848', e: '#ffb347', met: 0.3, rough: 0.5, pat: 'sand', pass: 'Bio-Resonance: +25% Swing Momentum in Desert & Sun' },
  { name: 'Duneshifter Exo', cat: 'Desert', rar: 'Legendary', p: '#c29b63', s: '#1b1b1f', a: '#e65c00', e: '#ff9900', met: 0.7, rough: 0.3, pat: 'hex', pass: 'Sand Veil: Evading kicks up blinding dust clouds' },
  { name: 'Onyx Mirage', cat: 'Stealth', rar: 'Epic', p: '#141416', s: '#292b30', a: '#9933ff', e: '#b84dff', met: 0.8, rough: 0.2, pat: 'carbon', pass: 'Mirage Camo: Undetected by robotic drones' },
  { name: 'Kalahari Vanguard', cat: 'Tactical', rar: 'Rare', p: '#8f6848', s: '#2e3328', a: '#d4883b', e: '#ffe066', met: 0.5, rough: 0.6, pat: 'camo', pass: 'Grip Padding: Wall-running distance increased 40%' },
  { name: 'Solstice Weaver', cat: 'Elemental', rar: 'Legendary', p: '#e67300', s: '#4a1505', a: '#ffdd55', e: '#ffaa00', met: 0.4, rough: 0.4, pat: 'circuit', pass: 'Solar Battery: Web energy regenerates 50% faster in daylight' },
  { name: 'Crimson Nomad', cat: 'Classic', rar: 'Rare', p: '#c41e3a', s: '#1f2438', a: '#f4d03f', e: '#ff3366', met: 0.2, rough: 0.7, pat: 'hex', pass: 'Acrobat Reflex: +15% Dodge window recovery' },
  { name: 'Sirocco Striker', cat: 'Futuristic', rar: 'Epic', p: '#d35400', s: '#111827', a: '#00e5ff', e: '#00ffff', met: 0.8, rough: 0.3, pat: 'digital', pass: 'Thermal Jets: Point launches gain 35% extra altitude' },
  { name: 'Sandstorm Phantom', cat: 'Stealth', rar: 'Legendary', p: '#594d3f', s: '#1a1614', a: '#8e44ad', e: '#c39bd3', met: 0.4, rough: 0.6, pat: 'sand', pass: 'Sand Shroud: Enemies miss first counter strike' },
  { name: 'Ankh Guardian', cat: 'Armored', rar: 'Epic', p: '#2c3e50', s: '#f39c12', a: '#e74c3c', e: '#f1c40f', met: 0.9, rough: 0.2, pat: 'hex', pass: 'Relic Plating: Incoming damage reduced by 20%' },
  { name: 'Bedouin Specter', cat: 'Stealth', rar: 'Rare', p: '#34495e', s: '#1f262d', a: '#16a085', e: '#1abc9c', met: 0.3, rough: 0.5, pat: 'organic', pass: 'Silent Step: Takedowns alert no nearby guards' },
  { name: 'Oasis Bio-Chitin', cat: 'Elemental', rar: 'Rare', p: '#16a085', s: '#2c3e50', a: '#2ecc71', e: '#58d68d', met: 0.5, rough: 0.4, pat: 'organic', pass: 'Hydration Reserve: Regenerates health slowly while swinging' },
  { name: 'Scorpion Alloy 2099', cat: 'Armored', rar: 'Mythic', p: '#212121', s: '#e67e22', a: '#f39c12', e: '#ff7700', met: 0.95, rough: 0.15, pat: 'circuit', pass: 'Stinger Burst: Heavy attacks unleash kinetic spikes' },
  { name: 'Dizert Apex Overdrive', cat: 'Prototype', rar: 'Mythic', p: '#962d1c', s: '#0d0d11', a: '#ff6b35', e: '#ff3d00', met: 0.85, rough: 0.2, pat: 'circuit', pass: 'Kinetic Core: Combos build 50% faster' },
  { name: 'Gobi Tracker', cat: 'Tactical', rar: 'Common', p: '#795548', s: '#3e2723', a: '#ffb74d', e: '#ffe082', met: 0.2, rough: 0.8, pat: 'camo', pass: 'Terrain Scanner: Reveals collectible tokens within 100m' },
  { name: 'Red Sands Sentinel', cat: 'Desert', rar: 'Epic', p: '#a93226', s: '#2c3e50', a: '#e59866', e: '#f5b041', met: 0.6, rough: 0.4, pat: 'hex', pass: 'Sand Blast: Ground slam kicks up area-of-effect shockwave' },
  { name: 'Nebula Strider', cat: 'Cosmic', rar: 'Cosmic', p: '#2e1065', s: '#0f172a', a: '#ec4899', e: '#38bdf8', met: 0.7, rough: 0.3, pat: 'crystal', pass: 'Zero-G Inertia: Free-falling charges a hyper-boost web' },
  { name: 'Obsidian Eclipse', cat: 'Stealth', rar: 'Legendary', p: '#090a0f', s: '#1e293b', a: '#6366f1', e: '#818cf8', met: 0.85, rough: 0.25, pat: 'carbon', pass: 'Shadow Weave: Invisibility during rooftop parkour' },
  { name: 'Sunburst Glider', cat: 'Futuristic', rar: 'Epic', p: '#f59e0b', s: '#b45309', a: '#fef08a', e: '#facc15', met: 0.6, rough: 0.35, pat: 'hex', pass: 'Aero Wings: Web gliding speed increased by 35%' },
  { name: 'Dizert Commando', cat: 'Tactical', rar: 'Rare', p: '#4b5563', s: '#1f2937', a: '#f97316', e: '#fb923c', met: 0.5, rough: 0.5, pat: 'camo', pass: 'Bandolier Reserves: Holds +2 extra web charges' },
  { name: 'Chronos Weaver', cat: 'Prototype', rar: 'Mythic', p: '#3b82f6', s: '#1e1b4b', a: '#67e8f9', e: '#22d3ee', met: 0.9, rough: 0.1, pat: 'circuit', pass: 'Time Warp: Perfect dodge slows enemy time for 3 seconds' }
];

const SECONDARY_NAMES = [
  'Aegis', 'Vanguard', 'Apex', 'Specter', 'Viper', 'Phantom', 'Nexus', 'Matrix', 'Quantum', 'Titan',
  'Pulse', 'Helix', 'Zephyr', 'Inferno', 'Glacier', 'Echo', 'Wraith', 'Hydra', 'Vortex', 'Cypher',
  'Zenith', 'Chrono', 'Hyperion', 'Eclipse', 'Ronin', 'Gryphon', 'Cobalt', 'Vertex', 'Solaris', 'Ion',
  'Vector', 'Shogun', 'Tempest', 'Nova', 'Ranger', 'Stalker', 'Striker', 'Shadow', 'Enigma', 'Prism'
];

const SUIT_PREFIXES = [
  'Cyber', 'Nano', 'Bio', 'Dark', 'Golden', 'Silver', 'Iron', 'Plasma', 'Arcane', 'Tactical',
  'Stealth', 'Hyper', 'Neon', 'Void', 'Radiant', 'Chitin', 'Hazard', 'Heavy', 'Velocity', 'Shadow',
  'Cryo', 'Pyro', 'Electro', 'Astral', 'Carbon', 'Titanium', 'Desert', 'Urban', 'Deepsea', 'Magma',
  'Glacial', 'Sonic', 'Omega', 'Alpha', 'Delta', 'Zero', 'Spectrum', 'Aether', 'Valkyrie', 'Sentinel',
  'Gladiator', 'Sovereign', 'Ronin', 'Exo', 'Sub-Zero', 'Thermal', 'Proto', 'Aero', 'Graviton', 'Overclock'
];

const CATEGORIES: SkinData['category'][] = [
  'Classic', 'Futuristic', 'Stealth', 'Armored', 'Tactical', 'Desert', 'Cosmic', 'Elemental', 'Prototype', 'Urban'
];

const RARITIES: SkinData['rarity'][] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic'];

const COLOR_PALETTES = [
  { p: '#b83b1d', s: '#1a1a24', a: '#f1a945', e: '#ff9900', pat: 'hex' },
  { p: '#0f172a', s: '#1e293b', a: '#38bdf8', e: '#00f0ff', pat: 'digital' },
  { p: '#831843', s: '#500724', a: '#f472b6', e: '#ff2d55', pat: 'circuit' },
  { p: '#14532d', s: '#052e16', a: '#4ade80', e: '#10b981', pat: 'organic' },
  { p: '#312e81', s: '#1e1b4b', a: '#a78bfa', e: '#8b5cf6', pat: 'crystal' },
  { p: '#7c2d12', s: '#431407', a: '#fdba74', e: '#f97316', pat: 'sand' },
  { p: '#1e293b', s: '#0f172a', a: '#e2e8f0', e: '#ffffff', pat: 'carbon' },
  { p: '#713f12', s: '#362306', a: '#fde047', e: '#eab308', pat: 'hex' },
  { p: '#134e4a', s: '#042f2e', a: '#5eead4', e: '#14b8a6', pat: 'circuit' },
  { p: '#701a75', s: '#4a044e', a: '#f0abfc', e: '#d946ef', pat: 'camo' },
  { p: '#854d0e', s: '#422006', a: '#facc15', e: '#fbbf24', pat: 'sand' },
  { p: '#0369a1', s: '#0c4a6e', a: '#7dd3fc', e: '#38bdf8', pat: 'hex' }
] as const;

export const ALL_SKINS: SkinData[] = (() => {
  const skins: SkinData[] = [];

  // Seed with curated first 20 iconic hero suits
  SUIT_THEMES.forEach((t, i) => {
    skins.push({
      id: i + 1,
      name: t.name,
      category: t.cat as SkinData['category'],
      rarity: t.rar as SkinData['rarity'],
      description: `Original Spider Dizert suit #${String(i + 1).padStart(3, '0')}. Engineered with ${t.pat} weave and reinforced with micro-chitin polymer for high-velocity metropolitan maneuvers.`,
      primaryColor: t.p,
      secondaryColor: t.s,
      accentColor: t.a,
      emissiveColor: t.e,
      metalness: t.met,
      roughness: t.rough,
      emissiveIntensity: t.rar === 'Cosmic' ? 2.5 : t.rar === 'Mythic' ? 1.8 : 1.0,
      webColor: t.e,
      patternType: t.pat as SkinData['patternType'],
      maskStyle: t.cat === 'Futuristic' || t.cat === 'Prototype' ? 'cyber_visor' : t.cat === 'Stealth' ? 'quad_sensor' : t.cat === 'Desert' ? 'pharaoh_crest' : 'classic_angular',
      hasMechanicalSpiderArms: i === 11 || i === 12 || i === 15 || i === 19, // Scorpion Alloy, Dizert Apex Overdrive, Nebula Strider, Chronos Weaver
      hasGauntletBlades: i === 3 || i === 11 || i === 18,
      hasShoulderPauldrons: i === 1 || i === 8 || i === 11 || i === 18,
      hasWebWings: i === 0 || i === 6 || i === 17,
      hasCosmicHalo: i === 15 || i === 19,
      passiveAbility: t.pass,
      statBonus: {
        swingSpeed: 5 + (i % 6) * 4,
        damage: 10 + (i % 5) * 5,
        defense: 5 + (i % 4) * 6,
        webRecharge: 10 + (i % 5) * 5
      },
      unlockCondition: i === 0 ? 'Unlocked by Default (Canon Hero)' : `Earned via Chapter ${(i % 8) + 1} progression or Dizert Challenge`,
      unlocked: i === 0 || i === 1 || i === 5 // First few ready to play
    });
  });

  // Programmatically generate remaining up to exactly 200 with bespoke combinations
  for (let id = 21; id <= 200; id++) {
    const prefix = SUIT_PREFIXES[(id * 7) % SUIT_PREFIXES.length];
    const secondary = SECONDARY_NAMES[(id * 11) % SECONDARY_NAMES.length];
    const cat = CATEGORIES[(id * 3) % CATEGORIES.length];
    const palette = COLOR_PALETTES[(id * 5) % COLOR_PALETTES.length];
    
    let rar: SkinData['rarity'] = 'Common';
    if (id % 25 === 0) rar = 'Cosmic';
    else if (id % 12 === 0) rar = 'Mythic';
    else if (id % 5 === 0) rar = 'Legendary';
    else if (id % 3 === 0) rar = 'Epic';
    else if (id % 2 === 0) rar = 'Rare';

    const metalness = (id % 4 === 0) ? 0.9 : (id % 3 === 0) ? 0.65 : 0.25;
    const roughness = (id % 4 === 0) ? 0.2 : (id % 3 === 0) ? 0.4 : 0.65;
    const emissiveIntensity = rar === 'Cosmic' ? 2.4 : rar === 'Mythic' ? 1.9 : rar === 'Legendary' ? 1.4 : 0.8;

    const patterns: SkinData['patternType'][] = ['hex', 'circuit', 'carbon', 'organic', 'camo', 'crystal', 'sand', 'digital'];
    const pattern = patterns[id % patterns.length];

    const passives = [
      'Nanite Web-Tension: +20% initial swing pull velocity',
      'Kinetic Shockwave: Finishers emit a 5m EMP wave',
      'Thermal Underlayer: Immune to environmental freeze & frost slow',
      'Overclocked Servos: Sprint speed and wall-run accelerated +30%',
      'Holo-Decoy: Evading leaves a holographic duplicate that draws aggro',
      'Vibration Sensor: Spider-sense triggers 0.5s earlier with visual radar',
      'Onyx Resonance: Heavy punch launches enemies 50% farther into web traps',
      'Solar Absorb: Perfect aerial acrobatics grant 15 Web Energy points',
      'Nano-Weave Armor: Melee hits take 25% reduced chip damage',
      'Hyper-Tether: Web lines can tether two enemies simultaneously'
    ];
    const passiveAbility = passives[id % passives.length];

    skins.push({
      id,
      name: `${prefix} ${secondary} Mk-${(id % 9) + 1}`,
      category: cat,
      rarity: rar,
      description: `Bespoke Spider Dizert suit design #${String(id).padStart(3, '0')}. Built for specialized ${cat.toLowerCase()} tactical operations with ${pattern} mesh reinforcement and micro-actuator joints.`,
      primaryColor: palette.p,
      secondaryColor: palette.s,
      accentColor: palette.a,
      emissiveColor: palette.e,
      metalness,
      roughness,
      emissiveIntensity,
      webColor: palette.e,
      patternType: pattern,
      maskStyle: cat === 'Futuristic' || cat === 'Prototype' ? 'cyber_visor' : cat === 'Stealth' ? 'quad_sensor' : cat === 'Desert' ? 'pharaoh_crest' : (id % 5 === 0) ? 'stealth_cowl' : 'classic_angular',
      hasMechanicalSpiderArms: (id % 4 === 0) || rar === 'Cosmic' || rar === 'Mythic',
      hasGauntletBlades: (id % 3 === 0) || cat === 'Tactical' || cat === 'Armored',
      hasShoulderPauldrons: (id % 2 === 0) || cat === 'Armored',
      hasWebWings: (id % 5 === 1) || cat === 'Classic',
      hasCosmicHalo: rar === 'Cosmic' || (id % 15 === 0),
      passiveAbility,
      statBonus: {
        swingSpeed: 5 + ((id * 3) % 25),
        damage: 10 + ((id * 4) % 30),
        defense: 5 + ((id * 2) % 25),
        webRecharge: 10 + ((id * 5) % 30)
      },
      unlockCondition: `Discover in District #${(id % 40) + 1} or complete Arena Trial ${(id % 15) + 1}`,
      unlocked: false
    });
  }

  return skins;
})();
