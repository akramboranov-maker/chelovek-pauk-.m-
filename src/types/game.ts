/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Cosmic';
export type WebShooterCategory =
  | 'Pneumatic-Mechanical'
  | 'Nanotech-Cyber'
  | 'Desert-Mystic'
  | 'Symbiotic-Organic'
  | 'Plasma-Energy'
  | 'Tactical-Ballistic'
  | 'Steampunk-Brass'
  | 'Quantum-Void'
  | 'Cryo-Elemental'
  | 'Heavy-Artillery';

export type WebShooterNozzleStyle =
  | 'dual_barrel'
  | 'plasma_bore'
  | 'revolver_cylinder'
  | 'sand_spire'
  | 'quantum_ring'
  | 'bio_fang'
  | 'steampunk_brass'
  | 'triple_gatling'
  | 'nano_matrix'
  | 'tactical_rail';

export type WebShooterCanisterType =
  | 'dual_cartridge'
  | 'fluid_vial'
  | 'revolver_magazine'
  | 'energy_core'
  | 'crystal_shard'
  | 'plasma_capsule'
  | 'bio_pod'
  | 'steam_boiler'
  | 'singularity_cell'
  | 'drum_loader';

export interface WebShooterData {
  id: number;
  name: string;
  category: WebShooterCategory;
  rarity: Rarity;
  description: string;
  lore: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  webColor: string;
  metalness: number;
  roughness: number;
  nozzleStyle: WebShooterNozzleStyle;
  canisterType: WebShooterCanisterType;
  tensionYield: number; // 50 - 100%
  fireRate: number; // shots per sec
  capacity: number; // shots per recharge
  webRange: number; // meters
  specialPerk: string;
  unlocked: boolean;
  unlockCondition: string;
}

export type MaskStyle = 'classic_angular' | 'cyber_visor' | 'quad_sensor' | 'pharaoh_crest' | 'stealth_cowl';

export interface SkinData {
  id: number;
  name: string;
  category: 'Classic' | 'Futuristic' | 'Stealth' | 'Armored' | 'Tactical' | 'Desert' | 'Cosmic' | 'Elemental' | 'Prototype' | 'Urban';
  rarity: Rarity;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  emissiveColor: string;
  metalness: number;
  roughness: number;
  emissiveIntensity: number;
  webColor: string;
  patternType: 'hex' | 'circuit' | 'carbon' | 'organic' | 'camo' | 'crystal' | 'sand' | 'digital';
  maskStyle: MaskStyle;
  hasMechanicalSpiderArms: boolean;
  hasGauntletBlades: boolean;
  hasShoulderPauldrons: boolean;
  hasWebWings: boolean;
  hasCosmicHalo: boolean;
  passiveAbility: string;
  statBonus: {
    swingSpeed: number; // percentage bonus
    damage: number;
    defense: number;
    webRecharge: number;
  };
  unlockCondition: string;
  unlocked: boolean;
}

export type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'heavy-rain' | 'fog' | 'storm' | 'snow' | 'sandstorm' | 'cyber-smog';
export type TimeOfDay = 'sunrise' | 'morning' | 'afternoon' | 'sunset' | 'evening' | 'midnight';

export interface EnvironmentTheme {
  id: number;
  name: string;
  districtTitle: string;
  skyColor: string;
  fogColor: string;
  fogDensity: number;
  ambientColor: string;
  sunColor: string;
  buildingPalette: string[];
  windowGlowColor: string;
  groundColor: string;
  roadMarkingColor: string;
  neonColors: string[];
  defaultWeather: WeatherType;
  defaultTime: TimeOfDay;
  description: string;
  featureProps: 'trees' | 'cranes' | 'holograms' | 'ruins' | 'snowdrifts' | 'cacti' | 'palms' | 'containers' | 'monuments';
  waterFeature: boolean;
}

export interface Enemy {
  id: string;
  type: 'thug' | 'enforcer' | 'drone' | 'hunter' | 'assassin' | 'boss';
  name: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  isAlerted: boolean;
  isStunned: boolean;
  stunTimer: number;
  attackCooldown: number;
  meshIndex?: number;
  isDefeated: boolean;
}

export interface BossData {
  id: string;
  name: string;
  title: string;
  maxHealth: number;
  currentHealth: number;
  phase: number;
  maxPhases: number;
  specialMove: string;
  avatarColor: string;
}

export interface Mission {
  id: string;
  title: string;
  chapter: number;
  type: 'story' | 'side' | 'rescue' | 'chase' | 'stealth' | 'boss' | 'challenge';
  district: string;
  description: string;
  objective: string;
  progress: number;
  targetProgress: number;
  completed: boolean;
  rewardXP: number;
  rewardSkinId?: number;
  targetCoordinates: [number, number, number];
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  webEnergy: number;
  maxWebEnergy: number;
  xp: number;
  level: number;
  comboCount: number;
  comboMultiplier: number;
  comboTimer: number;
  selectedSkinId: number;
  equippedWebShooterId: number;
  selectedEnvironmentId: number;
  isSwinging: boolean;
  isWallRunning: boolean;
  isWallClimbing: boolean;
  isDiving: boolean;
  speedMph: number;
  unlockedSkins: number[];
  unlockedWebShooters: number[];
  unlockedAbilities: string[];
  skillPoints: number;
  crimesStopped: number;
  distanceTraveledMiles: number;
  bossesDefeated: number;
}

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' | 'CINEMATIC';

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  cameraSensitivity: number;
  motionBlur: boolean;
  showMinimap: boolean;
  invertY: boolean;
  spiderSenseAlerts: boolean;
}
