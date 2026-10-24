/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CityWorld, BuildingBox } from './cityGenerator';
import { sound } from '../audio/soundEngine';

export interface TraversalState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isGrounded: boolean;
  isSwinging: boolean;
  isWallRunning: boolean;
  isWallClimbing: boolean;
  isDiving: boolean;
  isAirTricking: boolean;
  webAnchor: THREE.Vector3 | null;
  webTensionLength: number;
  speedMph: number;
  currentPose: 'idle' | 'run' | 'sprint' | 'swing' | 'wallrun' | 'wallclimb' | 'dive' | 'punch' | 'kick' | 'airtrick';
  webLineMesh: THREE.Line | null;
  wallNormal: THREE.Vector3;
  climbingBuilding: BuildingBox | null;
  wallClimbCooldown: number;
}

export function createTraversalSystem(city: CityWorld, scene: THREE.Scene) {
  // Web Line 3D Mesh
  const webGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ]);
  const webMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 3,
    transparent: true,
    opacity: 0.9,
  });
  const webLineMesh = new THREE.Line(webGeom, webMat);
  webLineMesh.visible = false;
  scene.add(webLineMesh);

  const state: TraversalState = {
    position: new THREE.Vector3(0, 25, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    isGrounded: false,
    isSwinging: false,
    isWallRunning: false,
    isWallClimbing: false,
    isDiving: false,
    isAirTricking: false,
    webAnchor: null,
    webTensionLength: 0,
    speedMph: 0,
    currentPose: 'idle',
    webLineMesh,
    wallNormal: new THREE.Vector3(0, 0, 1),
    climbingBuilding: null,
    wallClimbCooldown: 0,
  };

  const GRAVITY = 26.0; // m/s^2 (snappy superhero gravity)
  const SWING_DAMPING = 0.994;
  const AIR_RESISTANCE = 0.992;
  const GROUND_FRICTION = 0.88;
  const HERO_RADIUS = 0.75; // Collision radius to prevent penetrating inside buildings

  // Input states
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    swing: false,
    dive: false,
    zip: false,
  };

  const setKey = (key: keyof typeof keys, value: boolean) => {
    keys[key] = value;
  };

  // Web Shoot / Anchor Connect
  const attachWeb = (lookDir: THREE.Vector3) => {
    if (state.isSwinging) return;
    if (state.isWallClimbing) {
      state.isWallClimbing = false;
      state.climbingBuilding = null;
    }
    const anchor = city.getWebAnchorPoint(state.position, lookDir, 130);
    if (anchor) {
      state.isSwinging = true;
      state.webAnchor = anchor.point.clone();
      state.webTensionLength = state.position.distanceTo(state.webAnchor);
      state.isDiving = false;
      webLineMesh.visible = true;
      sound.playWebShoot();
    }
  };

  const releaseWeb = () => {
    if (!state.isSwinging) return;
    state.isSwinging = false;
    state.webAnchor = null;
    webLineMesh.visible = false;
    sound.playWebRelease();

    // Release impulse boost based on forward momentum
    if (state.velocity.y > 0) {
      state.velocity.y *= 1.25; // Catapult jump
    }
    state.velocity.x *= 1.15;
    state.velocity.z *= 1.15;
  };

  // Point Launch / Web Zip
  const triggerPointLaunch = (lookDir: THREE.Vector3) => {
    const anchor = city.getWebAnchorPoint(state.position, lookDir, 140);
    if (anchor) {
      releaseWeb();
      state.isWallClimbing = false;
      state.climbingBuilding = null;
      const zipDir = new THREE.Vector3().subVectors(anchor.point, state.position).normalize();
      state.velocity.copy(zipDir.multiplyScalar(48)); // Rapid dash
      state.velocity.y += 12; // Vault over point
      sound.playPointLaunch();
      state.currentPose = 'sprint';
    }
  };

  // Strict Building Anti-Penetration & Wall Attachment Collision Resolution
  const resolveBuildingCollisions = (
    dt: number,
    inputDir: THREE.Vector3,
    wantsClimb: boolean
  ) => {
    const r = HERO_RADIUS;

    for (const b of city.buildings) {
      // 1. Check Rooftop Collision
      if (
        state.position.x >= b.min.x - 0.2 &&
        state.position.x <= b.max.x + 0.2 &&
        state.position.z >= b.min.z - 0.2 &&
        state.position.z <= b.max.z + 0.2
      ) {
        // If feet are near rooftop level and falling
        if (state.position.y >= b.height - 0.5 && state.position.y <= b.height + 0.8) {
          if (state.velocity.y <= 0) {
            state.position.y = b.height;
            state.velocity.y = 0;
            state.isGrounded = true;
            if (state.isWallClimbing) {
              state.isWallClimbing = false;
              state.climbingBuilding = null;
            }
            continue;
          }
        }
      }

      // 2. Check Exterior Wall Penetration
      if (state.position.y < b.height - 0.2 && state.position.y >= -0.5) {
        const isInsideX = state.position.x > b.min.x - r && state.position.x < b.max.x + r;
        const isInsideZ = state.position.z > b.min.z - r && state.position.z < b.max.z + r;

        if (isInsideX && isInsideZ) {
          // Calculate penetration depth from each of the 4 building walls
          const dLeft = state.position.x - (b.min.x - r);      // dist from -X face
          const dRight = (b.max.x + r) - state.position.x;     // dist from +X face
          const dFront = state.position.z - (b.min.z - r);     // dist from -Z face
          const dBack = (b.max.z + r) - state.position.z;      // dist from +Z face

          const minOverlap = Math.min(dLeft, dRight, dFront, dBack);

          let normal = new THREE.Vector3(0, 0, 1);
          const pushOutBuffer = 0.05; // Extra clearance to avoid frame re-penetration

          if (minOverlap === dLeft) {
            state.position.x = b.min.x - r - pushOutBuffer; // Push out to -X
            normal.set(-1, 0, 0);
            if (state.velocity.x > 0) state.velocity.x = 0;
          } else if (minOverlap === dRight) {
            state.position.x = b.max.x + r + pushOutBuffer; // Push out to +X
            normal.set(1, 0, 0);
            if (state.velocity.x < 0) state.velocity.x = 0;
          } else if (minOverlap === dFront) {
            state.position.z = b.min.z - r - pushOutBuffer; // Push out to -Z
            normal.set(0, 0, -1);
            if (state.velocity.z > 0) state.velocity.z = 0;
          } else {
            state.position.z = b.max.z + r + pushOutBuffer; // Push out to +Z
            normal.set(0, 0, 1);
            if (state.velocity.z < 0) state.velocity.z = 0;
          }

          // Latch onto wall only if airborne, moving toward wall, and not in jump/vault cooldown
          if (
            wantsClimb &&
            !state.isWallClimbing &&
            state.wallClimbCooldown <= 0 &&
            state.position.y > 1.2 &&
            !state.isGrounded &&
            !keys.jump
          ) {
            state.isWallClimbing = true;
            state.climbingBuilding = b;
            state.wallNormal.copy(normal);
            if (state.isSwinging) releaseWeb();
            sound.playDodge();
          }
        }
      }
    }
  };

  // Physics Simulation Step
  const update = (delta: number, cameraLookDir: THREE.Vector3, shooterHandPos: THREE.Vector3) => {
    const dt = Math.min(delta, 0.05);

    // Cooldown timer
    if (state.wallClimbCooldown > 0) {
      state.wallClimbCooldown -= dt;
    }

    // Camera forward vector projected onto XZ plane
    const forward = new THREE.Vector3(cameraLookDir.x, 0, cameraLookDir.z).normalize();
    const right = new THREE.Vector3(-forward.z, 0, forward.x).normalize();

    const inputDir = new THREE.Vector3();
    if (keys.forward) inputDir.add(forward);
    if (keys.backward) inputDir.sub(forward);
    if (keys.right) inputDir.add(right);
    if (keys.left) inputDir.sub(right);
    if (inputDir.lengthSq() > 0) inputDir.normalize();

    const wantsClimb = (keys.forward || keys.sprint) && !keys.jump;

    // 1. WALL CLIMBING & CRAWLING STATE ("devorlarga tirmashib chiqsin")
    if (state.isWallClimbing && state.climbingBuilding) {
      const b = state.climbingBuilding;
      state.isSwinging = false;
      state.isGrounded = false;
      state.currentPose = 'wallclimb';

      // Zero out gravity while gripping wall with bio-adhesion
      state.velocity.set(0, 0, 0);

      // Tangent vector along wall face for sideways crawling
      const wallTangent = new THREE.Vector3(
        -state.wallNormal.z,
        0,
        state.wallNormal.x
      ).normalize();

      const climbSpeed = keys.sprint ? 24 : 14;

      // Climb UP
      if (keys.forward) {
        state.position.y += climbSpeed * dt;
      }

      // Climb DOWN
      if (keys.backward) {
        state.position.y -= climbSpeed * dt;
        if (state.position.y <= 0.6) {
          state.position.y = 0;
          state.isWallClimbing = false;
          state.isGrounded = true;
          state.climbingBuilding = null;
          state.wallClimbCooldown = 0.4;
          return;
        }
      }

      // Crawl LEFT / RIGHT along wall surface
      if (keys.left) {
        state.position.addScaledVector(wallTangent, -climbSpeed * 0.8 * dt);
      }
      if (keys.right) {
        state.position.addScaledVector(wallTangent, climbSpeed * 0.8 * dt);
      }

      // Check if reached building corner edges in X or Z
      const r = HERO_RADIUS;
      if (state.wallNormal.x !== 0) {
        // Snapped on X face: keep X fixed
        state.position.x = state.wallNormal.x > 0 ? b.max.x + r + 0.05 : b.min.x - r - 0.05;
        if (state.position.z < b.min.z - r || state.position.z > b.max.z + r) {
          state.isWallClimbing = false;
          state.climbingBuilding = null;
          state.wallClimbCooldown = 0.4;
        }
      } else {
        // Snapped on Z face: keep Z fixed
        state.position.z = state.wallNormal.z > 0 ? b.max.z + r + 0.05 : b.min.z - r - 0.05;
        if (state.position.x < b.min.x - r || state.position.x > b.max.x + r) {
          state.isWallClimbing = false;
          state.climbingBuilding = null;
          state.wallClimbCooldown = 0.4;
        }
      }

      // Reached the Rooftop Cornice: Ledge Vault smoothly onto roof!
      if (state.position.y >= b.height - 0.35) {
        state.position.y = b.height;
        state.position.addScaledVector(state.wallNormal, -2.0); // step firmly onto rooftop
        state.velocity.set(0, 0, 0);
        state.isWallClimbing = false;
        state.isGrounded = true;
        state.climbingBuilding = null;
        state.wallClimbCooldown = 0.5;
        sound.playDodge();
        return;
      }

      // Jump off wall anytime SPACE is pressed (Leap off into air!)
      if (keys.jump) {
        state.isWallClimbing = false;
        state.climbingBuilding = null;
        state.wallClimbCooldown = 0.6; // High cooldown prevents re-latching while leaping
        state.velocity.copy(state.wallNormal).multiplyScalar(22); // Powerful kick away from wall
        state.velocity.y = 15; // High catapult vault
        sound.playDodge();
        return;
      }

      // Drop off wall if C is pressed
      if (keys.dive) {
        state.isWallClimbing = false;
        state.climbingBuilding = null;
        state.wallClimbCooldown = 0.5;
        state.velocity.copy(state.wallNormal).multiplyScalar(5);
        state.velocity.y = -6;
        sound.playDodge();
        return;
      }

      // Rotate hero to face directly against the building facade
      state.rotation.y = Math.atan2(-state.wallNormal.x, -state.wallNormal.z);

      state.speedMph = keys.forward || keys.backward || keys.left || keys.right ? Math.round(climbSpeed * 2.23694) : 0;
      sound.updateWindSpeed(state.speedMph);
      return;
    }

    // Ground Check (Streets or Building Rooftops)
    const surfaceY = city.checkGroundHeight(state.position.x, state.position.z, state.position.y);
    if (state.position.y <= surfaceY + 0.05) {
      state.position.y = surfaceY;
      state.isGrounded = true;
      state.velocity.y = 0;
      if (state.isSwinging) releaseWeb();
    } else {
      state.isGrounded = false;
    }

    // 2. SWINGING STATE (Tension Pendulum Physics)
    if (state.isSwinging && state.webAnchor) {
      state.currentPose = 'swing';

      // Gravity pulls down
      state.velocity.y -= GRAVITY * dt;

      // Player directional pumping
      if (inputDir.lengthSq() > 0) {
        state.velocity.addScaledVector(inputDir, 35 * dt);
      }

      // Constrain position to anchor sphere via tension
      const nextPos = state.position.clone().addScaledVector(state.velocity, dt);
      const toAnchor = new THREE.Vector3().subVectors(nextPos, state.webAnchor);
      const currentDist = toAnchor.length();

      if (currentDist > state.webTensionLength) {
        // Tension vector
        const tensionDir = toAnchor.clone().normalize();
        
        // Remove velocity component moving away from anchor
        const radialVel = tensionDir.dot(state.velocity);
        if (radialVel > 0) {
          state.velocity.addScaledVector(tensionDir, -radialVel);
        }

        // Snap to sphere radius
        toAnchor.setLength(state.webTensionLength);
        state.position.copy(state.webAnchor).add(toAnchor);

        // Centrifugal speed boost
        state.velocity.multiplyScalar(SWING_DAMPING);
      } else {
        state.position.copy(nextPos);
      }

      // Anti-penetration check during swing
      resolveBuildingCollisions(dt, inputDir, wantsClimb);

      // Update 3D Web Strand line from shooter hand to anchor
      const positions = webLineMesh.geometry.attributes.position.array as Float32Array;
      positions[0] = shooterHandPos.x;
      positions[1] = shooterHandPos.y;
      positions[2] = shooterHandPos.z;
      positions[3] = state.webAnchor.x;
      positions[4] = state.webAnchor.y;
      positions[5] = state.webAnchor.z;
      webLineMesh.geometry.attributes.position.needsUpdate = true;

      // Auto-orient face along trajectory
      if (state.velocity.lengthSq() > 1) {
        const hVel = new THREE.Vector2(state.velocity.x, state.velocity.z);
        state.rotation.y = Math.atan2(hVel.x, hVel.y);
      }

    } else {
      // 3. FREE ROAM / AIR / GROUND STATE
      if (state.isGrounded) {
        // Ground Locomotion
        const moveSpeed = keys.sprint ? 24 : 14;
        if (inputDir.lengthSq() > 0) {
          state.velocity.x = inputDir.x * moveSpeed;
          state.velocity.z = inputDir.z * moveSpeed;
          state.currentPose = keys.sprint ? 'sprint' : 'run';
          state.rotation.y = Math.atan2(inputDir.x, inputDir.z);
        } else {
          state.velocity.x *= GROUND_FRICTION;
          state.velocity.z *= GROUND_FRICTION;
          state.currentPose = 'idle';
        }

        // Jump
        if (keys.jump) {
          state.velocity.y = keys.sprint ? 18 : 14;
          state.isGrounded = false;
          sound.playDodge();
        }

      } else {
        // Airborne
        if (keys.dive) {
          state.isDiving = true;
          state.currentPose = 'dive';
          state.velocity.y -= GRAVITY * 1.8 * dt; // Rapid falcon dive
          state.velocity.x += inputDir.x * 20 * dt;
          state.velocity.z += inputDir.z * 20 * dt;
        } else {
          state.isDiving = false;
          state.velocity.y -= GRAVITY * dt;
          state.velocity.x += inputDir.x * 15 * dt;
          state.velocity.z += inputDir.z * 15 * dt;
          state.velocity.x *= AIR_RESISTANCE;
          state.velocity.z *= AIR_RESISTANCE;

          if (keys.sprint) {
            state.currentPose = 'airtrick';
          } else {
            state.currentPose = state.velocity.y > 0 ? 'sprint' : 'dive';
          }
        }

        // Orient facing movement in air
        if (state.velocity.x * state.velocity.x + state.velocity.z * state.velocity.z > 4) {
          state.rotation.y = Math.atan2(state.velocity.x, state.velocity.z);
        }
      }

      state.position.addScaledVector(state.velocity, dt);

      // Strict anti-penetration resolution: push out of building interiors
      resolveBuildingCollisions(dt, inputDir, wantsClimb);
    }

    // Calculate current speed in MPH
    const totalSpeedMps = state.velocity.length();
    state.speedMph = Math.round(totalSpeedMps * 2.23694);

    // Feed speed into sound engine for continuous wind sound
    sound.updateWindSpeed(state.speedMph);
  };

  return {
    state,
    setKey,
    attachWeb,
    releaseWeb,
    triggerPointLaunch,
    update,
    setWebColor: (hex: string) => {
      if (webMat) {
        webMat.color.set(hex);
        webMat.needsUpdate = true;
      }
    },
  };
}
