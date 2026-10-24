/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createSpiderDizert, SpiderDizertModel } from './characterBuilder';
import { createProceduralCity, CityWorld } from './cityGenerator';
import { createTraversalSystem } from './webSwingingPhysics';
import { createCombatSystem } from './combatSystem';
import { SkinData, EnvironmentTheme, GameSettings, PlayerStats, WebShooterData } from '../types/game';
import { ALL_WEB_SHOOTERS } from '../data/webShootersData';

// Module-level reusable math helpers to prevent garbage collection allocations in render tick
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();

export interface GameSceneHandle {
  canvas: HTMLCanvasElement;
  hero: SpiderDizertModel;
  city: CityWorld;
  traversal: ReturnType<typeof createTraversalSystem>;
  combat: ReturnType<typeof createCombatSystem>;
  setCameraMode: (mode: 'gameplay' | 'menu' | 'skin_inspect' | 'shooter_inspect' | 'map') => void;
  setSkin: (skin: SkinData) => void;
  setWebShooter: (shooter: WebShooterData) => void;
  setEnvironment: (theme: EnvironmentTheme) => void;
  setSettings: (settings: GameSettings) => void;
  onPointerMove: (dx: number, dy: number) => void;
  onInspectDrag: (dx: number, dy: number) => void;
  onInspectZoom: (zoomDelta: number) => void;
  dispose: () => void;
}

export function initGameScene(
  container: HTMLElement,
  initialSkin: SkinData,
  initialTheme: EnvironmentTheme,
  initialSettings: GameSettings,
  onStatsUpdate: (stats: Partial<PlayerStats>) => void,
  initialShooter?: WebShooterData
): GameSceneHandle {
  // Software WebGL Guard (Skill Directive 2.1)
  const isSoftwareGl = (() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(initialTheme.skyColor);
  scene.fog = new THREE.FogExp2(initialTheme.fogColor, isSoftwareGl ? 0.003 : initialTheme.fogDensity);

  // Mandatory Studio Environment Reflection (Skill Directive 2.2)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  pmremGenerator.dispose();

  // Cameras
  const camera = new THREE.PerspectiveCamera(65, width / height, 0.2, 1000);
  camera.position.set(0, 30, 15);

  // Balanced Lighting Rig (Skill Directive 3.1)
  const keyLight = new THREE.DirectionalLight(initialTheme.sunColor, 2.2);
  keyLight.position.set(60, 120, 60);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 300;
    const d = 80;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const fillLight = new THREE.HemisphereLight(
    initialTheme.ambientColor,
    initialTheme.groundColor,
    1.2
  );
  scene.add(fillLight);

  // Create City
  const city = createProceduralCity(initialTheme);
  scene.add(city.root);

  // Create Hero Model
  const hero = createSpiderDizert(initialSkin, initialShooter || ALL_WEB_SHOOTERS[0]);
  scene.add(hero.root);

  // Traversal & Combat Systems
  const traversal = createTraversalSystem(city, scene);
  if (initialShooter) {
    traversal.setWebColor(initialShooter.webColor);
  }
  const combat = createCombatSystem(scene);

  // Initial hero position on central spire overlook
  traversal.state.position.set(0, 62, -10);

  // Camera State & Orbit Rotation Angles
  let cameraMode: 'gameplay' | 'menu' | 'skin_inspect' | 'shooter_inspect' | 'map' = 'menu';
  let yaw = 0;
  let pitch = 0.15;
  let inspectYaw = 0;
  let inspectPitch = 0.2;
  let inspectDist = 3.2;

  // Clock
  const clock = new THREE.Clock();
  let frameId = 0;
  let isRunning = true;

  // Input Handlers
  const onPointerMove = (dx: number, dy: number) => {
    if (cameraMode !== 'gameplay') return;
    const sens = 0.0025;
    yaw -= dx * sens;
    pitch -= dy * sens;
    pitch = Math.max(-0.6, Math.min(1.1, pitch));
  };

  const onInspectDrag = (dx: number, dy: number) => {
    if (cameraMode !== 'skin_inspect' && cameraMode !== 'shooter_inspect') return;
    inspectYaw += dx * 0.008;
    inspectPitch = Math.max(-0.4, Math.min(0.8, inspectPitch + dy * 0.006));
  };

  const onInspectZoom = (zoomDelta: number) => {
    if (cameraMode !== 'skin_inspect' && cameraMode !== 'shooter_inspect') return;
    inspectDist = Math.max(1.0, Math.min(6.0, inspectDist + zoomDelta * 0.004));
  };

  const setCameraMode = (mode: 'gameplay' | 'menu' | 'skin_inspect' | 'shooter_inspect' | 'map') => {
    cameraMode = mode;
    if (mode === 'skin_inspect' || mode === 'shooter_inspect') {
      hero.root.position.set(0, 0, 0);
      hero.root.rotation.set(0, 0, 0);
      hero.setAnimationPose('idle', 0);
    }
  };

  const setSkin = (skin: SkinData) => {
    hero.updateSkin(skin);
    if (traversal.state.webLineMesh) {
      (traversal.state.webLineMesh.material as THREE.LineBasicMaterial).color.set(skin.webColor);
    }
  };

  const setWebShooter = (shooter: WebShooterData) => {
    hero.updateWebShooter(shooter);
    traversal.setWebColor(shooter.webColor);
  };

  const setEnvironment = (theme: EnvironmentTheme) => {
    scene.background = new THREE.Color(theme.skyColor);
    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.set(theme.fogColor);
      (scene.fog as THREE.FogExp2).density = isSoftwareGl ? 0.003 : theme.fogDensity;
    }
    keyLight.color.set(theme.sunColor);
    fillLight.color.set(theme.ambientColor);
    fillLight.groundColor.set(theme.groundColor);
    city.updateTheme(theme);
  };

  const setSettings = (settings: GameSettings) => {
    if (!renderer) return;
    const quality = settings.graphicsQuality;
    if (quality === 'LOW' || isSoftwareGl) {
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = false;
    } else if (quality === 'MEDIUM') {
      renderer.setPixelRatio(1);
      renderer.shadowMap.enabled = true;
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'CINEMATIC' ? 2 : 1.5));
      renderer.shadowMap.enabled = true;
    }
  };

  // Resize Listener
  const handleResize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  // Software WebGL pace helper (Skill Directive 2.3)
  function afterDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        frameId = window.setTimeout(cb, 60);
      }
    };
    frameId = window.setTimeout(poll, 5);
  }

  // Master Render & Physics Game Loop
  let accumulatedTime = 0;

  const tick = () => {
    if (!isRunning) return;

    const delta = clock.getDelta();
    accumulatedTime += delta;

    // Update traffic and ambient sky drones
    city.updateAnimations(delta);

    if (cameraMode === 'gameplay') {
      // 1. Camera Look Direction
      _vec3A.set(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(yaw) * Math.cos(pitch)
      ).normalize();

      // Right shooter hand position in world space
      _vec3B.copy(hero.parts.webShooterR.position);
      hero.parts.webShooterR.localToWorld(_vec3B);

      // Traversal step
      traversal.update(delta, _vec3A, _vec3B);

      // Sync Hero 3D mesh with physics state
      hero.root.position.copy(traversal.state.position);
      hero.root.rotation.copy(traversal.state.rotation);
      hero.setAnimationPose(traversal.state.currentPose, accumulatedTime);

      // Dynamic Third-Person Cinematic Camera Follow
      // FOV dynamically expands from 65° to 85° based on speed!
      const targetFov = 65 + Math.min(traversal.state.speedMph * 0.35, 20);
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 6, delta);
      camera.updateProjectionMatrix();

      // Camera offset behind hero with exponential damping
      const camDist = traversal.state.isSwinging ? 6.2 : 4.8;
      const targetCamPos = traversal.state.position.clone()
        .sub(_vec3A.clone().multiplyScalar(camDist))
        .add(new THREE.Vector3(0, 1.8, 0));

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 8, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 8, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 8, delta);

      const lookTarget = traversal.state.position.clone().add(new THREE.Vector3(0, 1.4, 0));
      camera.lookAt(lookTarget);

      // Combat step
      const { heroDamaged } = combat.update(delta, traversal.state.position);

      // Report player state to React HUD
      onStatsUpdate({
        isSwinging: traversal.state.isSwinging,
        isWallRunning: traversal.state.isWallRunning,
        isWallClimbing: traversal.state.isWallClimbing,
        isDiving: traversal.state.isDiving,
        speedMph: traversal.state.speedMph,
        distanceTraveledMiles: traversal.state.speedMph > 0 ? delta * (traversal.state.speedMph / 3600) : 0,
      });

    } else if (cameraMode === 'menu') {
      // Cinematic Main Menu Hero Showcase perched on spire
      const menuRadius = 5.5;
      const menuAngle = accumulatedTime * 0.25;
      hero.root.position.set(0, 62, -10);
      hero.setAnimationPose('idle', accumulatedTime);

      camera.position.set(
        Math.sin(menuAngle) * menuRadius,
        63.2 + Math.sin(accumulatedTime * 0.5) * 0.3,
        -10 + Math.cos(menuAngle) * menuRadius
      );
      camera.lookAt(0, 63, -10);

    } else if (cameraMode === 'skin_inspect') {
      // 3D Suit Inspection Showroom
      hero.root.position.set(0, -0.6, 0);
      hero.setAnimationPose('idle', accumulatedTime);

      camera.position.set(
        Math.sin(inspectYaw) * Math.cos(inspectPitch) * inspectDist,
        Math.sin(inspectPitch) * inspectDist + 0.6,
        Math.cos(inspectYaw) * Math.cos(inspectPitch) * inspectDist
      );
      camera.lookAt(0, 0.6, 0);

    } else if (cameraMode === 'shooter_inspect') {
      // Close-up 1:1 Wrist Gauntlet Inspection Showroom
      hero.root.position.set(0, -0.6, 0);
      hero.setAnimationPose('idle', accumulatedTime);

      // Focus point directly on hero's left forearm web shooter
      const focusX = 0.32;
      const focusY = 0.72;
      const dist = Math.min(inspectDist * 0.45, 1.8);
      camera.position.set(
        focusX + Math.sin(inspectYaw) * Math.cos(inspectPitch) * dist,
        focusY + Math.sin(inspectPitch) * dist,
        Math.cos(inspectYaw) * Math.cos(inspectPitch) * dist
      );
      camera.lookAt(focusX, focusY, 0);

    } else if (cameraMode === 'map') {
      // Overhead High-Altitude Tactical Hologram Map View
      camera.position.set(0, 240, 0.1);
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }
  };

  // Start Loop
  tick();

  const dispose = () => {
    isRunning = false;
    cancelAnimationFrame(frameId);
    clearTimeout(frameId);
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  };

  return {
    canvas: renderer.domElement,
    hero,
    city,
    traversal,
    combat,
    setCameraMode,
    setSkin,
    setWebShooter,
    setEnvironment,
    setSettings,
    onPointerMove,
    onInspectDrag,
    onInspectZoom,
    dispose,
  };
}
