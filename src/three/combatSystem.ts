/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Enemy, BossData } from '../types/game';
import { sound } from '../audio/soundEngine';

export interface CombatEvent {
  type: 'hit' | 'dodge' | 'web_shot' | 'finisher' | 'boss_phase' | 'defeat';
  combo: number;
  damage: number;
  position: THREE.Vector3;
}

export function createCombatSystem(scene: THREE.Scene) {
  const enemies: Enemy[] = [];
  const enemyMeshes: Map<string, THREE.Group> = new Map();

  let activeBoss: BossData | null = null;
  let bossMesh: THREE.Group | null = null;

  // Visual Effects Group (Hit sparks, Web cocoons, Spider-Sense Halos)
  const vfxGroup = new THREE.Group();
  vfxGroup.name = 'CombatVFX';
  scene.add(vfxGroup);

  // Spider-Sense Overhead Halo Mesh
  const haloShape = new THREE.RingGeometry(0.35, 0.45, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff0055,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const spiderSenseHalo = new THREE.Mesh(haloShape, haloMat);
  spiderSenseHalo.rotation.x = -Math.PI / 2;
  scene.add(spiderSenseHalo);

  let spiderSenseAlertActive = false;
  let spiderSenseTimer = 0;

  // Spawn Thugs / Mercenaries
  const spawnEnemySquad = (centerPos: THREE.Vector3, count = 4) => {
    for (let i = 0; i < count; i++) {
      const id = `enemy_${Date.now()}_${i}`;
      const angle = (i / count) * Math.PI * 2;
      const dist = 4 + Math.random() * 3;
      const pos: [number, number, number] = [
        centerPos.x + Math.cos(angle) * dist,
        centerPos.y,
        centerPos.z + Math.sin(angle) * dist,
      ];

      const type: Enemy['type'] = i === 0 ? 'enforcer' : i === 1 ? 'drone' : 'thug';
      const maxHp = type === 'enforcer' ? 120 : type === 'drone' ? 60 : 80;

      const enemy: Enemy = {
        id,
        type,
        name: type === 'enforcer' ? 'Syndicate Enforcer' : type === 'drone' ? 'Scout Drone' : 'Syndicate Mercenary',
        position: pos,
        health: maxHp,
        maxHealth: maxHp,
        isAlerted: true,
        isStunned: false,
        stunTimer: 0,
        attackCooldown: 1.5 + Math.random() * 2,
        isDefeated: false,
      };

      // 3D Mesh Representation for Enemy
      const group = new THREE.Group();
      if (type === 'drone') {
        const dMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.5, 1.2),
          new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9 })
        );
        dMesh.position.y = 1.8;
        group.add(dMesh);
      } else {
        const bodyColor = type === 'enforcer' ? 0x334155 : 0x78350f;
        const bMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 1.7, 0.3),
          new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6 })
        );
        bMesh.position.y = 0.85;
        bMesh.castShadow = true;
        group.add(bMesh);

        // Weapon
        const gun = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.15, 0.6),
          new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9 })
        );
        gun.position.set(0.3, 0.9, 0.3);
        group.add(gun);
      }

      group.position.set(pos[0], pos[1], pos[2]);
      scene.add(group);
      enemyMeshes.set(id, group);
      enemies.push(enemy);
    }
    sound.setMusicState('combat');
  };

  // Spawn Boss
  const spawnBoss = (bossData: BossData, spawnPos: THREE.Vector3) => {
    activeBoss = { ...bossData };

    if (bossMesh) {
      scene.remove(bossMesh);
    }

    bossMesh = new THREE.Group();
    bossMesh.name = `Boss_${activeBoss.id}`;

    if (activeBoss.id === 'titan_apex') {
      // 4-legged Goliath Siege Mech
      const core = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 3.5, 5.5),
        new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9, roughness: 0.2 })
      );
      core.position.y = 5.0;
      core.castShadow = true;
      bossMesh.add(core);

      // Glowing Reactor Core
      const reactor = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      reactor.position.set(0, 5.0, 2.5);
      bossMesh.add(reactor);

      // 4 Hydraulic Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.8 });
      for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 5, 8), legMat);
        const lx = i % 2 === 0 ? 2.8 : -2.8;
        const lz = i < 2 ? 2.5 : -2.5;
        leg.position.set(lx, 2.5, lz);
        leg.rotation.z = lx > 0 ? -0.3 : 0.3;
        bossMesh.add(leg);
      }
    } else if (activeBoss.id === 'vortex_phantom') {
      // Holographic Phase Infiltrator
      const pMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.5, 1.6, 8, 16),
        new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x9333ea,
          emissiveIntensity: 1.5,
          wireframe: true,
        })
      );
      pMesh.position.y = 1.3;
      bossMesh.add(pMesh);
    } else {
      // Dizert Overlord
      const oMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.4, 0.8),
        new THREE.MeshStandardMaterial({
          color: 0x7c2d12,
          emissive: 0xef4444,
          emissiveIntensity: 1.0,
          metalness: 0.85,
        })
      );
      oMesh.position.y = 1.2;
      bossMesh.add(oMesh);
    }

    bossMesh.position.copy(spawnPos);
    scene.add(bossMesh);
    sound.setMusicState('boss');
  };

  // Player Attack Trigger
  const executeAttack = (
    type: 'light' | 'heavy' | 'web' | 'finisher',
    heroPos: THREE.Vector3,
    heroDir: THREE.Vector3
  ): CombatEvent | null => {
    let targetEnemy: Enemy | null = null;
    let closestDist = type === 'web' ? 25 : 4.5;

    // Check boss first
    if (activeBoss && bossMesh) {
      const bDist = heroPos.distanceTo(bossMesh.position);
      if (bDist < (type === 'web' ? 30 : 6.5)) {
        let dmg = type === 'light' ? 35 : type === 'heavy' ? 85 : type === 'finisher' ? 220 : 40;
        activeBoss.currentHealth = Math.max(0, activeBoss.currentHealth - dmg);
        sound.playPunch();

        // Spawn hit spark
        createHitSpark(bossMesh.position.clone().add(new THREE.Vector3(0, 3, 0)));

        if (activeBoss.currentHealth <= 0 && activeBoss.phase < activeBoss.maxPhases) {
          activeBoss.phase++;
          activeBoss.currentHealth = activeBoss.maxHealth;
          sound.playFanfare();
          return { type: 'boss_phase', combo: 5, damage: dmg, position: bossMesh.position };
        } else if (activeBoss.currentHealth <= 0) {
          sound.playFanfare();
          return { type: 'defeat', combo: 10, damage: dmg, position: bossMesh.position };
        }

        return { type: 'hit', combo: 3, damage: dmg, position: bossMesh.position };
      }
    }

    // Check minions
    for (const e of enemies) {
      if (e.isDefeated) continue;
      const eMesh = enemyMeshes.get(e.id);
      if (!eMesh) continue;
      const d = heroPos.distanceTo(eMesh.position);
      if (d < closestDist) {
        closestDist = d;
        targetEnemy = e;
      }
    }

    if (!targetEnemy) return null;

    const tMesh = enemyMeshes.get(targetEnemy.id)!;

    if (type === 'web') {
      // Cocoon / Stun with web
      targetEnemy.isStunned = true;
      targetEnemy.stunTimer = 4.0;
      sound.playWebShoot();
      createWebCocoon(tMesh.position);
      return { type: 'web_shot', combo: 1, damage: 15, position: tMesh.position };
    }

    const damage = type === 'light' ? 30 : type === 'heavy' ? 65 : 150;
    targetEnemy.health -= damage;
    sound.playPunch();
    createHitSpark(tMesh.position.clone().add(new THREE.Vector3(0, 1, 0)));

    if (targetEnemy.health <= 0) {
      targetEnemy.isDefeated = true;
      // Knockback ragdoll drop
      tMesh.rotation.x = Math.PI / 2;
      tMesh.position.y = 0.2;
      return { type: 'defeat', combo: 2, damage, position: tMesh.position };
    }

    return { type: 'hit', combo: 1, damage, position: tMesh.position };
  };

  // Spider-Sense Alert Trigger
  const triggerSpiderSenseWarning = (heroPos: THREE.Vector3) => {
    spiderSenseAlertActive = true;
    spiderSenseTimer = 1.0;
    spiderSenseHalo.position.copy(heroPos).add(new THREE.Vector3(0, 2.2, 0));
    (spiderSenseHalo.material as THREE.MeshBasicMaterial).opacity = 0.85;
    sound.playSpiderSense();
  };

  // Visual Effect: Hit Spark
  const createHitSpark = (pos: THREE.Vector3) => {
    const sparkGeom = new THREE.SphereGeometry(0.4, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffdd55 });
    const spark = new THREE.Mesh(sparkGeom, sparkMat);
    spark.position.copy(pos);
    vfxGroup.add(spark);
    setTimeout(() => {
      vfxGroup.remove(spark);
    }, 120);
  };

  // Visual Effect: Web Cocoon
  const createWebCocoon = (pos: THREE.Vector3) => {
    const cocoonGeom = new THREE.IcosahedronGeometry(0.8, 1);
    const cocoonMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const cocoon = new THREE.Mesh(cocoonGeom, cocoonMat);
    cocoon.position.copy(pos).add(new THREE.Vector3(0, 0.8, 0));
    vfxGroup.add(cocoon);
    setTimeout(() => {
      vfxGroup.remove(cocoon);
    }, 4000);
  };

  // Combat AI Step
  const update = (delta: number, heroPos: THREE.Vector3): { heroDamaged: number } => {
    let heroDamaged = 0;

    // Update Spider-Sense Halo
    if (spiderSenseTimer > 0) {
      spiderSenseTimer -= delta;
      spiderSenseHalo.position.copy(heroPos).add(new THREE.Vector3(0, 2.2, 0));
      spiderSenseHalo.rotation.z += delta * 6;
      if (spiderSenseTimer <= 0) {
        spiderSenseAlertActive = false;
        (spiderSenseHalo.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }

    // Minion AI
    for (const e of enemies) {
      if (e.isDefeated) continue;
      const mesh = enemyMeshes.get(e.id);
      if (!mesh) continue;

      if (e.isStunned) {
        e.stunTimer -= delta;
        if (e.stunTimer <= 0) e.isStunned = false;
        continue;
      }

      // Approach hero
      const toHero = new THREE.Vector3().subVectors(heroPos, mesh.position);
      const dist = toHero.length();

      if (dist > 2.5) {
        toHero.y = 0;
        toHero.normalize();
        mesh.position.addScaledVector(toHero, 4.0 * delta);
        mesh.rotation.y = Math.atan2(toHero.x, toHero.z);
      }

      // Attack
      e.attackCooldown -= delta;
      if (e.attackCooldown <= 0.6 && e.attackCooldown > 0.5 && !spiderSenseAlertActive) {
        triggerSpiderSenseWarning(heroPos);
      }

      if (e.attackCooldown <= 0) {
        e.attackCooldown = 2.5 + Math.random() * 1.5;
        if (dist < 3.2) {
          heroDamaged += e.type === 'enforcer' ? 22 : 12;
        }
      }
    }

    // Boss AI
    if (activeBoss && bossMesh && activeBoss.currentHealth > 0) {
      const toHero = new THREE.Vector3().subVectors(heroPos, bossMesh.position);
      const dist = toHero.length();

      if (dist > 7) {
        toHero.y = 0;
        toHero.normalize();
        bossMesh.position.addScaledVector(toHero, 3.5 * delta);
        bossMesh.rotation.y = Math.atan2(toHero.x, toHero.z);
      }

      // Boss stomp shockwave
      const now = performance.now() * 0.001;
      if (Math.sin(now * 1.2) > 0.98 && dist < 12) {
        heroDamaged += 35;
        triggerSpiderSenseWarning(heroPos);
      }
    }

    return { heroDamaged };
  };

  return {
    enemies,
    activeBoss,
    spawnEnemySquad,
    spawnBoss,
    executeAttack,
    update,
  };
}
