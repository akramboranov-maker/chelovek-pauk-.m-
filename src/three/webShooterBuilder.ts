/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WebShooterData } from '../types/game';

// Procedural texture for the pressure gauge dial
function createDialTexture(accentHex: string, glowHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = accentHex || '#f59e0b';
  ctx.stroke();

  // Dial markings
  for (let a = -Math.PI * 0.75; a <= Math.PI * 0.75; a += Math.PI * 0.25) {
    const x1 = 64 + Math.cos(a) * 44;
    const y1 = 64 + Math.sin(a) * 44;
    const x2 = 64 + Math.cos(a) * 54;
    const y2 = 64 + Math.sin(a) * 54;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Needle pointing to high pressure
  ctx.strokeStyle = glowHex || '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 64);
  ctx.lineTo(64 + Math.cos(Math.PI * 0.3) * 48, 64 + Math.sin(Math.PI * 0.3) * 48);
  ctx.stroke();

  // Center pin
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(64, 64, 5, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildWebShooterMesh(shooter: WebShooterData, isLeft: boolean): THREE.Group {
  const root = new THREE.Group();
  root.name = `WebShooter_${shooter.id}_${isLeft ? 'L' : 'R'}`;

  // Shared Materials
  const matPrimary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shooter.primaryColor),
    metalness: shooter.metalness,
    roughness: shooter.roughness,
  });

  const matSecondary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shooter.secondaryColor),
    metalness: Math.min(0.95, shooter.metalness + 0.1),
    roughness: Math.max(0.1, shooter.roughness - 0.1),
  });

  const matTrim = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shooter.accentColor),
    metalness: 0.9,
    roughness: 0.15,
  });

  const matGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shooter.glowColor),
    emissive: new THREE.Color(shooter.glowColor),
    emissiveIntensity: 2.2,
    roughness: 0.1,
  });

  const matGlass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(shooter.glowColor),
    emissive: new THREE.Color(shooter.glowColor),
    emissiveIntensity: 0.6,
    roughness: 0.05,
    transmission: 0.85,
    thickness: 0.02,
    transparent: true,
    opacity: 0.85,
  });

  // Mirror multiplier for symmetric arm mounting
  const signX = isLeft ? 1 : -1;

  // 1. BASE WRIST BRACER / CUFF
  const cuffGeom = new THREE.CylinderGeometry(0.076, 0.072, 0.11, 16, 1, true);
  const cuff = new THREE.Mesh(cuffGeom, matPrimary);
  cuff.position.set(0, 0, 0);
  root.add(cuff);

  // Armored Dorsal & Ventral Plates
  const plateGeom = new THREE.BoxGeometry(0.082, 0.1, 0.02);
  const dorsalPlate = new THREE.Mesh(plateGeom, matSecondary);
  dorsalPlate.position.set(0, 0, 0.075);
  root.add(dorsalPlate);

  const ventralPlate = new THREE.Mesh(plateGeom, matSecondary);
  ventralPlate.position.set(0, 0, -0.072);
  root.add(ventralPlate);

  // Gold / Accent Straps & Clasps
  const strapGeom = new THREE.TorusGeometry(0.077, 0.005, 8, 24);
  const strapTop = new THREE.Mesh(strapGeom, matTrim);
  strapTop.rotation.x = Math.PI / 2;
  strapTop.position.y = 0.04;
  root.add(strapTop);

  const strapBottom = new THREE.Mesh(strapGeom, matTrim);
  strapBottom.rotation.x = Math.PI / 2;
  strapBottom.position.y = -0.04;
  root.add(strapBottom);

  // 2. PALM TRIGGER MECHANISM & BRAIDED CONDUIT
  // Palm actuator pad situated directly under the hero's palm
  const palmPadGeom = new THREE.BoxGeometry(0.035, 0.04, 0.012);
  const palmPad = new THREE.Mesh(palmPadGeom, matTrim);
  palmPad.position.set(0, -0.1, -0.05);
  root.add(palmPad);

  const palmSensor = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 10), matGlow);
  palmSensor.rotation.x = Math.PI / 2;
  palmSensor.position.set(0, -0.1, -0.044);
  root.add(palmSensor);

  // Flexible braided fiber-optic trigger cable running from dorsal/ventral cuff to palm pad
  const conduitGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.08, 6);
  const conduit = new THREE.Mesh(conduitGeom, matTrim);
  conduit.position.set(signX * 0.03, -0.06, -0.055);
  conduit.rotation.z = signX * 0.15;
  root.add(conduit);

  // 3. CANISTER / RESERVOIR (Based on shooter.canisterType)
  const canisterGroup = new THREE.Group();
  canisterGroup.position.set(0, 0.01, 0.085);
  root.add(canisterGroup);

  switch (shooter.canisterType) {
    case 'dual_cartridge': {
      // Twin pressurized steel cylinders with fluid level window
      const cylGeom = new THREE.CylinderGeometry(0.013, 0.013, 0.075, 12);
      const cyl1 = new THREE.Mesh(cylGeom, matSecondary);
      cyl1.position.set(-0.02, 0, 0);
      const cyl2 = new THREE.Mesh(cylGeom, matSecondary);
      cyl2.position.set(0.02, 0, 0);

      // Glowing fluid status rings
      const ringGeom = new THREE.TorusGeometry(0.014, 0.003, 8, 16);
      const ring1 = new THREE.Mesh(ringGeom, matGlow);
      ring1.rotation.x = Math.PI / 2;
      ring1.position.set(-0.02, 0, 0);
      const ring2 = new THREE.Mesh(ringGeom, matGlow);
      ring2.rotation.x = Math.PI / 2;
      ring2.position.set(0.02, 0, 0);

      canisterGroup.add(cyl1, cyl2, ring1, ring2);
      break;
    }
    case 'fluid_vial': {
      // Cylindrical glass vial inside a protective metallic roll cage
      const vialGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12);
      const vial = new THREE.Mesh(vialGeom, matGlass);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 12), matGlow);
      
      const cageBarGeom = new THREE.CylinderGeometry(0.002, 0.002, 0.075, 6);
      for (let i = 0; i < 4; i++) {
        const bar = new THREE.Mesh(cageBarGeom, matTrim);
        const ang = (Math.PI / 2) * i;
        bar.position.set(Math.cos(ang) * 0.02, 0, Math.sin(ang) * 0.02);
        canisterGroup.add(bar);
      }
      canisterGroup.add(vial, core);
      break;
    }
    case 'revolver_magazine': {
      // 6-shot rotary cylinder chamber
      const drumGeom = new THREE.CylinderGeometry(0.026, 0.026, 0.05, 12);
      const drum = new THREE.Mesh(drumGeom, matSecondary);
      drum.rotation.x = Math.PI / 2;
      canisterGroup.add(drum);

      // 6 cartridge rims
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.052, 8), matTrim);
        shell.rotation.x = Math.PI / 2;
        shell.position.set(Math.cos(ang) * 0.015, 0, Math.sin(ang) * 0.015);
        canisterGroup.add(shell);
      }
      break;
    }
    case 'energy_core': {
      // Hexagonal pulsing micro-fusion reactor core with heat sinks
      const coreGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6);
      const core = new THREE.Mesh(coreGeom, matGlow);
      core.rotation.x = Math.PI / 2;
      const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.044, 6, 1, true), matPrimary);
      shroud.rotation.x = Math.PI / 2;
      canisterGroup.add(core, shroud);
      break;
    }
    case 'crystal_shard': {
      // Asymmetric cut crystal power shard
      const crystalGeom = new THREE.OctahedronGeometry(0.025, 0);
      crystalGeom.scale(0.8, 1.8, 0.8);
      const crystal = new THREE.Mesh(crystalGeom, matGlass);
      crystal.rotation.z = Math.PI / 6;
      canisterGroup.add(crystal);
      break;
    }
    case 'plasma_capsule': {
      // High-voltage magnetic containment capsule with glowing coils
      const capGeom = new THREE.CapsuleGeometry(0.015, 0.04, 8, 12);
      const cap = new THREE.Mesh(capGeom, matGlass);
      const coilGeom = new THREE.TorusGeometry(0.017, 0.002, 6, 16);
      const coil1 = new THREE.Mesh(coilGeom, matTrim);
      coil1.rotation.x = Math.PI / 2;
      coil1.position.y = 0.015;
      const coil2 = new THREE.Mesh(coilGeom, matTrim);
      coil2.rotation.x = Math.PI / 2;
      coil2.position.y = -0.015;
      canisterGroup.add(cap, coil1, coil2);
      break;
    }
    case 'bio_pod': {
      // Organic pulsing sac with chitin veins
      const podGeom = new THREE.SphereGeometry(0.025, 12, 10);
      podGeom.scale(0.7, 1.4, 0.9);
      const pod = new THREE.Mesh(podGeom, matGlass);
      canisterGroup.add(pod);
      break;
    }
    case 'steam_boiler': {
      // Bulbous brass pressure boiler with copper serpentine coils
      const boilerGeom = new THREE.SphereGeometry(0.028, 12, 12);
      boilerGeom.scale(0.9, 1.1, 0.9);
      const boiler = new THREE.Mesh(boilerGeom, matSecondary);
      const pipe = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.004, 6, 16, Math.PI), matTrim);
      pipe.position.y = 0.01;
      canisterGroup.add(boiler, pipe);
      break;
    }
    case 'singularity_cell': {
      // Floating black orb surrounded by dual gimbal rings
      const orbGeom = new THREE.SphereGeometry(0.016, 16, 16);
      const orb = new THREE.Mesh(orbGeom, matGlow);
      const gimbal1 = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.002, 6, 20), matTrim);
      const gimbal2 = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.002, 6, 20), matSecondary);
      gimbal1.rotation.x = Math.PI / 3;
      gimbal2.rotation.y = Math.PI / 4;
      canisterGroup.add(orb, gimbal1, gimbal2);
      break;
    }
    case 'drum_loader':
    default: {
      // Heavy tactical drum magazine
      const drumGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.035, 16);
      const drum = new THREE.Mesh(drumGeom, matPrimary);
      drum.rotation.z = Math.PI / 2;
      const ledStripe = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.006, 0.02), matGlow);
      canisterGroup.add(drum, ledStripe);
      break;
    }
  }

  // 4. NOZZLE / EMITTER ASSEMBLY (Situated at distal end facing hand: y = -0.06 to -0.1)
  const nozzleGroup = new THREE.Group();
  nozzleGroup.position.set(0, -0.06, 0.07);
  root.add(nozzleGroup);

  switch (shooter.nozzleStyle) {
    case 'dual_barrel': {
      // Twin rifled precision micro-tubes
      const barrelGeom = new THREE.CylinderGeometry(0.006, 0.007, 0.05, 10);
      const b1 = new THREE.Mesh(barrelGeom, matTrim);
      b1.position.set(-0.012, -0.02, 0);
      const b2 = new THREE.Mesh(barrelGeom, matTrim);
      b2.position.set(0.012, -0.02, 0);

      // Emitter orifices with laser guide glow
      const tip1 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8), matGlow);
      tip1.position.set(-0.012, -0.045, 0);
      const tip2 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8), matGlow);
      tip2.position.set(0.012, -0.045, 0);

      nozzleGroup.add(b1, b2, tip1, tip2);
      break;
    }
    case 'plasma_bore': {
      // Flared plasma accelerator with magnetic ring
      const boreGeom = new THREE.ConeGeometry(0.018, 0.04, 12, 1, true);
      boreGeom.rotateX(Math.PI);
      const bore = new THREE.Mesh(boreGeom, matSecondary);
      bore.position.y = -0.02;

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 8, 16), matTrim);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.04;

      const plasmaCore = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 10), matGlow);
      plasmaCore.position.y = -0.035;

      nozzleGroup.add(bore, ring, plasmaCore);
      break;
    }
    case 'revolver_cylinder': {
      // 6-hole revolving muzzle brake
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.04, 12), matSecondary);
      base.position.y = -0.02;
      nozzleGroup.add(base);

      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.005, 6), matGlow);
        hole.position.set(Math.cos(ang) * 0.012, -0.04, Math.sin(ang) * 0.012);
        nozzleGroup.add(hole);
      }
      break;
    }
    case 'sand_spire': {
      // Ancient faceted needle spire with golden engraved grooves
      const spireGeom = new THREE.ConeGeometry(0.015, 0.065, 4);
      spireGeom.rotateX(Math.PI);
      const spire = new THREE.Mesh(spireGeom, matTrim);
      spire.position.y = -0.03;

      const tipGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.007), matGlow);
      tipGem.position.y = -0.065;
      nozzleGroup.add(spire, tipGem);
      break;
    }
    case 'quantum_ring': {
      // Concentric levitating quantum rings around a dark matter aperture
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.003, 8, 16), matTrim);
      r1.rotation.x = Math.PI / 2;
      r1.position.y = -0.02;
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0025, 8, 16), matSecondary);
      r2.rotation.x = Math.PI / 2;
      r2.position.y = -0.035;
      const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 10), matGlow);
      emitter.position.y = -0.035;
      nozzleGroup.add(r1, r2, emitter);
      break;
    }
    case 'bio_fang': {
      // Curved organic chitin fangs flanking venom micro-duct
      const fangGeom = new THREE.ConeGeometry(0.008, 0.05, 6);
      fangGeom.rotateX(Math.PI);
      const f1 = new THREE.Mesh(fangGeom, matTrim);
      f1.position.set(-0.012, -0.025, 0);
      f1.rotation.z = 0.15;
      const f2 = new THREE.Mesh(fangGeom, matTrim);
      f2.position.set(0.012, -0.025, 0);
      f2.rotation.z = -0.15;

      const gland = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), matGlow);
      gland.position.y = -0.03;
      nozzleGroup.add(f1, f2, gland);
      break;
    }
    case 'steampunk_brass': {
      // Fluted Victorian brass horn with miniature gear teeth
      const hornGeom = new THREE.CylinderGeometry(0.018, 0.01, 0.045, 12, 1, true);
      const horn = new THREE.Mesh(hornGeom, matTrim);
      horn.position.y = -0.022;

      const valve = new THREE.Mesh(new THREE.TorusGeometry(0.01, 0.003, 6, 12), matSecondary);
      valve.rotation.x = Math.PI / 2;
      valve.position.y = -0.045;

      nozzleGroup.add(horn, valve);
      break;
    }
    case 'triple_gatling': {
      // Triangular cluster of 3 rotary barrels
      const barrelGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.05, 8);
      for (let i = 0; i < 3; i++) {
        const ang = (Math.PI * 2 / 3) * i;
        const b = new THREE.Mesh(barrelGeom, matSecondary);
        b.position.set(Math.cos(ang) * 0.01, -0.025, Math.sin(ang) * 0.01);
        const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.004, 6), matGlow);
        muzzle.position.set(Math.cos(ang) * 0.01, -0.05, Math.sin(ang) * 0.01);
        nozzleGroup.add(b, muzzle);
      }
      break;
    }
    case 'nano_matrix': {
      // Hexagonal honeycomb grid of micro-jets
      const matrixPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 6), matSecondary);
      matrixPlate.position.y = -0.015;
      const ledGrid = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 6), matGlow);
      ledGrid.position.y = -0.016;
      nozzleGroup.add(matrixPlate, ledGrid);
      break;
    }
    case 'tactical_rail':
    default: {
      // Heavy rectangular rail receiver with muzzle slots
      const railGeom = new THREE.BoxGeometry(0.035, 0.05, 0.035);
      const rail = new THREE.Mesh(railGeom, matPrimary);
      rail.position.y = -0.025;

      const muzzleSlots = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.008, 0.02), matTrim);
      muzzleSlots.position.y = -0.045;

      const laserSight = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.01, 8), matGlow);
      laserSight.position.set(0.015, -0.04, 0.015);
      laserSight.rotation.x = Math.PI / 2;

      nozzleGroup.add(rail, muzzleSlots, laserSight);
      break;
    }
  }

  // 5. GAUGES & STATUS LED
  // Analog pressure dial with glowing needle texture
  const dialTex = createDialTexture(shooter.accentColor, shooter.glowColor);
  const dialMat = new THREE.MeshBasicMaterial({ map: dialTex, transparent: true });
  const dialGeom = new THREE.CircleGeometry(0.014, 16);
  const dialMesh = new THREE.Mesh(dialGeom, dialMat);
  dialMesh.position.set(signX * 0.042, 0.01, 0.06);
  dialMesh.rotation.y = signX * (Math.PI / 4);
  root.add(dialMesh);

  // Status Bar LED
  const statusLedGeom = new THREE.BoxGeometry(0.006, 0.03, 0.004);
  const statusLed = new THREE.Mesh(statusLedGeom, matGlow);
  statusLed.position.set(-signX * 0.042, 0.01, 0.06);
  root.add(statusLed);

  return root;
}
