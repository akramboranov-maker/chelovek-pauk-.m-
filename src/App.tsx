/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { initGameScene, GameSceneHandle } from './three/gameScene';
import { ALL_SKINS } from './data/skinsData';
import { ALL_ENVIRONMENTS } from './data/environmentsData';
import { INITIAL_MISSIONS, STORY_CHAPTERS, BOSS_ROSTER } from './data/storyData';
import { SkinData, EnvironmentTheme, GameSettings, PlayerStats, Mission, BossData } from './types/game';
import { sound } from './audio/soundEngine';

import { MainMenu, MenuTab } from './components/MainMenu';
import { GameHUD } from './components/GameHUD';
import { SkinsMenu } from './components/SkinsMenu';
import { CitySelectMenu } from './components/CitySelectMenu';
import { MissionsMenu } from './components/MissionsMenu';
import { AbilitiesMenu } from './components/AbilitiesMenu';
import { CharactersMenu } from './components/CharactersMenu';
import { SettingsModal } from './components/SettingsModal';
import { TacticalMap } from './components/TacticalMap';
import { StoryDialogue } from './components/StoryDialogue';
import { TouchControls } from './components/TouchControls';
import { ExtrasMenu } from './components/ExtrasMenu';

type GameScreen =
  | 'MAIN_MENU'
  | 'GAMEPLAY'
  | 'SKINS'
  | 'CITY'
  | 'MISSIONS'
  | 'ABILITIES'
  | 'CHARACTERS'
  | 'SETTINGS'
  | 'EXTRAS'
  | 'TACTICAL_MAP'
  | 'STORY_DIALOGUE';

const STORAGE_KEY = 'spider_dizert_save_v1';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneHandleRef = useRef<GameSceneHandle | null>(null);

  // Active Screen
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MAIN_MENU');
  const [activeStoryChapter, setActiveStoryChapter] = useState<number>(1);

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      graphicsQuality: 'HIGH',
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.4,
      cameraSensitivity: 1.0,
      motionBlur: true,
      showMinimap: true,
      invertY: false,
      spiderSenseAlerts: true,
    };
  });

  // Current Selections
  const [equippedSkin, setEquippedSkin] = useState<SkinData>(ALL_SKINS[0]);
  const [activeTheme, setActiveTheme] = useState<EnvironmentTheme>(ALL_ENVIRONMENTS[0]);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [currentMission, setCurrentMission] = useState<Mission | null>(INITIAL_MISSIONS[0]);

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stats`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          health: 100,
          webEnergy: 100,
          comboCount: 0,
          comboMultiplier: 1.0,
          comboTimer: 0,
          isSwinging: false,
          isWallRunning: false,
          isWallClimbing: false,
          isDiving: false,
          speedMph: 0,
        };
      }
    } catch {}
    return {
      health: 100,
      maxHealth: 100,
      webEnergy: 100,
      maxWebEnergy: 100,
      xp: 0,
      level: 1,
      comboCount: 0,
      comboMultiplier: 1.0,
      comboTimer: 0,
      selectedSkinId: 1,
      selectedEnvironmentId: 1,
      isSwinging: false,
      isWallRunning: false,
      isWallClimbing: false,
      isDiving: false,
      speedMph: 0,
      unlockedSkins: [1, 2, 5],
      unlockedAbilities: ['point_launch_boost'],
      skillPoints: 3,
      crimesStopped: 0,
      distanceTraveledMiles: 0,
      bossesDefeated: 0,
    };
  });

  // Autosave to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_stats`, JSON.stringify(stats));
    } catch {}
  }, [stats.level, stats.xp, stats.skillPoints, stats.unlockedSkins, stats.unlockedAbilities, stats.crimesStopped, stats.bossesDefeated]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Mount Three.js Scene
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const handle = initGameScene(
      canvasMountRef.current,
      equippedSkin,
      activeTheme,
      settings,
      (partialStats) => {
        setStats((prev) => ({
          ...prev,
          ...partialStats,
          distanceTraveledMiles: prev.distanceTraveledMiles + (partialStats.distanceTraveledMiles || 0),
        }));
      }
    );

    sceneHandleRef.current = handle;

    // Start background music loop
    sound.startMusicLoop();

    return () => {
      handle.dispose();
      sceneHandleRef.current = null;
      sound.stopMusic();
    };
  }, []);

  // Update Three.js scene camera mode when screen changes
  useEffect(() => {
    if (!sceneHandleRef.current) return;
    if (currentScreen === 'MAIN_MENU') {
      sceneHandleRef.current.setCameraMode('menu');
    } else if (currentScreen === 'SKINS') {
      sceneHandleRef.current.setCameraMode('skin_inspect');
    } else if (currentScreen === 'TACTICAL_MAP') {
      sceneHandleRef.current.setCameraMode('map');
    } else {
      sceneHandleRef.current.setCameraMode('gameplay');
    }
  }, [currentScreen]);

  // Keyboard Event Listeners for Movement, Swinging, and Combat
  useEffect(() => {
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      // Toggle Menu on ESC
      if (e.key === 'Escape') {
        if (currentScreen === 'GAMEPLAY') {
          setCurrentScreen('MAIN_MENU');
        } else if (currentScreen !== 'MAIN_MENU') {
          setCurrentScreen('GAMEPLAY');
        }
        return;
      }

      // Toggle Tactical Map on M
      if (e.key === 'm' || e.key === 'M') {
        if (currentScreen === 'GAMEPLAY') {
          setCurrentScreen('TACTICAL_MAP');
          sound.playUiClick();
        } else if (currentScreen === 'TACTICAL_MAP') {
          setCurrentScreen('GAMEPLAY');
        }
        return;
      }

      if (currentScreen !== 'GAMEPLAY' || !sceneHandleRef.current) return;
      const trav = sceneHandleRef.current.traversal;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') trav.setKey('forward', true);
      if (code === 'KeyS' || code === 'ArrowDown') trav.setKey('backward', true);
      if (code === 'KeyA' || code === 'ArrowLeft') trav.setKey('left', true);
      if (code === 'KeyD' || code === 'ArrowRight') trav.setKey('right', true);
      if (code === 'ShiftLeft' || code === 'ShiftRight') trav.setKey('sprint', true);
      if (code === 'KeyC') trav.setKey('dive', true);

      // Space: Contextual superhero jump, wall leap, or web-swinging
      if (code === 'Space') {
        e.preventDefault();
        trav.setKey('jump', true);
        // Only attach web line if already in air and NOT clinging to a wall
        if (!trav.state.isWallClimbing && !trav.state.isGrounded) {
          const lookDir = new THREE.Vector3(0, 0.2, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
          trav.attachWeb(lookDir);
        }
      }

      // Q to Point Launch / Web Zip
      if (code === 'KeyQ') {
        const lookDir = new THREE.Vector3(0, 0.3, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
        trav.triggerPointLaunch(lookDir);
      }

      // E to Web Shot (Cocoon)
      if (code === 'KeyE') {
        const heroPos = sceneHandleRef.current.hero.root.position;
        const heroDir = new THREE.Vector3(0, 0, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
        const event = sceneHandleRef.current.combat.executeAttack('web', heroPos, heroDir);
        if (event) {
          triggerHitCombo(event.combo);
        }
      }

      // F to Strike
      if (code === 'KeyF') {
        triggerMeleeAttack();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!sceneHandleRef.current) return;
      const trav = sceneHandleRef.current.traversal;
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') trav.setKey('forward', false);
      if (code === 'KeyS' || code === 'ArrowDown') trav.setKey('backward', false);
      if (code === 'KeyA' || code === 'ArrowLeft') trav.setKey('left', false);
      if (code === 'KeyD' || code === 'ArrowRight') trav.setKey('right', false);
      if (code === 'ShiftLeft' || code === 'ShiftRight') trav.setKey('sprint', false);
      if (code === 'KeyC') trav.setKey('dive', false);

      if (code === 'Space') {
        trav.setKey('jump', false);
        trav.releaseWeb();
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (currentScreen === 'GAMEPLAY' && sceneHandleRef.current) {
        if (e.button === 2) {
          // Right Click: Web Swing
          const trav = sceneHandleRef.current.traversal;
          const lookDir = new THREE.Vector3(0, 0.2, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
          trav.attachWeb(lookDir);
        } else if (e.button === 0) {
          // Left Click: Attack Strike
          triggerMeleeAttack();
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
      if (currentScreen === 'GAMEPLAY' && sceneHandleRef.current && e.button === 2) {
        sceneHandleRef.current.traversal.releaseWeb();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (currentScreen === 'SKINS' && isMouseDown && sceneHandleRef.current) {
        sceneHandleRef.current.onInspectDrag(dx, dy);
      } else if (currentScreen === 'GAMEPLAY' && isMouseDown && sceneHandleRef.current) {
        sceneHandleRef.current.onPointerMove(dx, dy);
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Do not zoom 3D character if scrolling inside UI menus or skins list!
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.no-3d-zoom')) {
        return; // Allow natural vertical up/down scrolling
      }
      if (currentScreen === 'SKINS' && sceneHandleRef.current) {
        sceneHandleRef.current.onInspectZoom(e.deltaY);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent default browser context menu on right click
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('wheel', onWheel);
    window.addEventListener('contextmenu', onContextMenu);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, [currentScreen]);

  // Melee Attack Helper
  const triggerMeleeAttack = () => {
    if (!sceneHandleRef.current) return;
    const heroPos = sceneHandleRef.current.hero.root.position;
    const heroDir = new THREE.Vector3(0, 0, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);

    // Punch animation
    sceneHandleRef.current.hero.setAnimationPose('punch', performance.now() * 0.001, 1.0);

    const event = sceneHandleRef.current.combat.executeAttack('light', heroPos, heroDir);
    if (event) {
      triggerHitCombo(event.combo);
      if (event.type === 'defeat') {
        setStats((prev) => ({
          ...prev,
          crimesStopped: prev.crimesStopped + 1,
          xp: prev.xp + 100,
          skillPoints: prev.xp + 100 >= prev.level * 500 ? prev.skillPoints + 1 : prev.skillPoints,
          level: prev.xp + 100 >= prev.level * 500 ? prev.level + 1 : prev.level,
        }));
      }
    }
  };

  const triggerHitCombo = (hits: number) => {
    setStats((prev) => ({
      ...prev,
      comboCount: prev.comboCount + hits,
      comboMultiplier: Math.min(4.0, 1.0 + (prev.comboCount + hits) * 0.1),
    }));
  };

  // Menu Selection Route
  const handleMainMenuSelect = (tab: MenuTab) => {
    switch (tab) {
      case 'PLAY':
        setCurrentScreen('GAMEPLAY');
        break;
      case 'STORY':
        setActiveStoryChapter(1);
        setCurrentScreen('STORY_DIALOGUE');
        break;
      case 'MISSIONS':
        setCurrentScreen('MISSIONS');
        break;
      case 'CITY':
        setCurrentScreen('CITY');
        break;
      case 'SKINS':
        setCurrentScreen('SKINS');
        break;
      case 'CHARACTERS':
        setCurrentScreen('CHARACTERS');
        break;
      case 'ABILITIES':
        setCurrentScreen('ABILITIES');
        break;
      case 'SETTINGS':
        setCurrentScreen('SETTINGS');
        break;
      case 'EXTRAS':
        setCurrentScreen('EXTRAS');
        break;
    }
  };

  // Equip Skin Handler
  const handleEquipSkin = (skin: SkinData) => {
    setEquippedSkin(skin);
    if (sceneHandleRef.current) {
      sceneHandleRef.current.setSkin(skin);
    }
    setStats((prev) => ({ ...prev, selectedSkinId: skin.id }));
  };

  // Unlock Skin Handler
  const handleUnlockSkin = (skinId: number) => {
    setStats((prev) => ({
      ...prev,
      unlockedSkins: prev.unlockedSkins.includes(skinId) ? prev.unlockedSkins : [...prev.unlockedSkins, skinId],
    }));
  };

  // Change Environment Theme Handler
  const handleSelectEnvironment = (theme: EnvironmentTheme) => {
    setActiveTheme(theme);
    if (sceneHandleRef.current) {
      sceneHandleRef.current.setEnvironment(theme);
    }
    setStats((prev) => ({ ...prev, selectedEnvironmentId: theme.id }));
  };

  // Start Boss Battle
  const handleStartBossBattle = (boss: BossData) => {
    if (sceneHandleRef.current) {
      const heroPos = sceneHandleRef.current.hero.root.position;
      const spawnPos = heroPos.clone().add(new THREE.Vector3(15, 0, 15));
      sceneHandleRef.current.combat.spawnBoss(boss, spawnPos);
    }
    setCurrentScreen('GAMEPLAY');
  };

  // Unlock Ability
  const handleUnlockAbility = (abilityId: string, cost: number) => {
    setStats((prev) => ({
      ...prev,
      skillPoints: Math.max(0, prev.skillPoints - cost),
      unlockedAbilities: [...prev.unlockedAbilities, abilityId],
    }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Dedicated 3D Canvas Mount (Skill Directive 4.1) */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Screen Overlays */}
      {currentScreen === 'MAIN_MENU' && (
        <MainMenu
          onSelectOption={handleMainMenuSelect}
          onStartGame={() => setCurrentScreen('GAMEPLAY')}
        />
      )}

      {currentScreen === 'GAMEPLAY' && (
        <>
          <GameHUD
            stats={stats}
            currentMission={currentMission}
            activeTheme={activeTheme}
            equippedSkin={equippedSkin}
            onOpenMap={() => setCurrentScreen('TACTICAL_MAP')}
            onOpenMenu={() => setCurrentScreen('MAIN_MENU')}
          />
          {/* Mobile / Touch Gamepad */}
          <TouchControls
            onSwingDown={() => {
              if (sceneHandleRef.current) {
                const lookDir = new THREE.Vector3(0, 0.2, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
                sceneHandleRef.current.traversal.attachWeb(lookDir);
              }
            }}
            onSwingUp={() => {
              if (sceneHandleRef.current) {
                sceneHandleRef.current.traversal.releaseWeb();
              }
            }}
            onAttack={() => triggerMeleeAttack()}
            onWebShot={() => {
              if (sceneHandleRef.current) {
                const heroPos = sceneHandleRef.current.hero.root.position;
                const heroDir = new THREE.Vector3(0, 0, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
                const event = sceneHandleRef.current.combat.executeAttack('web', heroPos, heroDir);
                if (event) triggerHitCombo(event.combo);
              }
            }}
            onPointLaunch={() => {
              if (sceneHandleRef.current) {
                const lookDir = new THREE.Vector3(0, 0.3, 1).applyEuler(sceneHandleRef.current.hero.root.rotation);
                sceneHandleRef.current.traversal.triggerPointLaunch(lookDir);
              }
            }}
            onDive={() => {
              if (sceneHandleRef.current) {
                sceneHandleRef.current.traversal.setKey('dive', true);
                setTimeout(() => sceneHandleRef.current?.traversal.setKey('dive', false), 800);
              }
            }}
            onMoveChange={(f, b, l, r) => {
              if (sceneHandleRef.current) {
                sceneHandleRef.current.traversal.setKey('forward', f);
                sceneHandleRef.current.traversal.setKey('backward', b);
                sceneHandleRef.current.traversal.setKey('left', l);
                sceneHandleRef.current.traversal.setKey('right', r);
              }
            }}
          />
        </>
      )}

      {currentScreen === 'SKINS' && (
        <SkinsMenu
          equippedSkinId={equippedSkin.id}
          unlockedSkinIds={stats.unlockedSkins}
          onSelectSkin={(skin) => {
            if (sceneHandleRef.current) {
              sceneHandleRef.current.setSkin(skin);
            }
          }}
          onEquipSkin={handleEquipSkin}
          onUnlockSkin={handleUnlockSkin}
          onClose={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {currentScreen === 'CITY' && (
        <CitySelectMenu
          currentEnvironmentId={activeTheme.id}
          onSelectEnvironment={handleSelectEnvironment}
          onClose={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {currentScreen === 'MISSIONS' && (
        <MissionsMenu
          missions={missions}
          currentMissionId={currentMission?.id || ''}
          onSelectMission={(m) => setCurrentMission(m)}
          onStartBossBattle={handleStartBossBattle}
          onOpenStoryDialogue={(chId) => {
            setActiveStoryChapter(chId);
            setCurrentScreen('STORY_DIALOGUE');
          }}
          onClose={() => setCurrentScreen('GAMEPLAY')}
        />
      )}

      {currentScreen === 'ABILITIES' && (
        <AbilitiesMenu
          unlockedAbilities={stats.unlockedAbilities}
          skillPoints={stats.skillPoints}
          onUnlockAbility={handleUnlockAbility}
          onClose={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {currentScreen === 'CHARACTERS' && (
        <CharactersMenu onClose={() => setCurrentScreen('MAIN_MENU')} />
      )}

      {currentScreen === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings((prev) => {
              const updated = { ...prev, ...newSettings };
              if (sceneHandleRef.current) {
                sceneHandleRef.current.setSettings(updated);
              }
              return updated;
            });
          }}
          onClose={() => setCurrentScreen('MAIN_MENU')}
        />
      )}

      {currentScreen === 'EXTRAS' && (
        <ExtrasMenu stats={stats} onClose={() => setCurrentScreen('MAIN_MENU')} />
      )}

      {currentScreen === 'TACTICAL_MAP' && (
        <TacticalMap
          playerPos={
            sceneHandleRef.current
              ? [
                  sceneHandleRef.current.hero.root.position.x,
                  sceneHandleRef.current.hero.root.position.y,
                  sceneHandleRef.current.hero.root.position.z,
                ]
              : [0, 0, 0]
          }
          missions={missions}
          currentMissionId={currentMission?.id || ''}
          activeTheme={activeTheme}
          onFastTravel={handleSelectEnvironment}
          onSetMission={(m) => setCurrentMission(m)}
          onClose={() => setCurrentScreen('GAMEPLAY')}
        />
      )}

      {currentScreen === 'STORY_DIALOGUE' && (
        <StoryDialogue
          chapterId={activeStoryChapter}
          onComplete={() => setCurrentScreen('GAMEPLAY')}
        />
      )}
    </div>
  );
}
