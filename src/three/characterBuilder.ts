/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SkinData, WebShooterData } from '../types/game';
import { buildWebShooterMesh } from './webShooterBuilder';
import { ALL_WEB_SHOOTERS } from '../data/webShootersData';

// Procedural pattern texture generator (zero external asset dependency)
function createSuitTexture(pattern: SkinData['patternType'], primaryHex: string, secondaryHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = secondaryHex;
  ctx.lineWidth = 2;

  if (pattern === 'hex') {
    const size = 24;
    const h = size * Math.sqrt(3);
    for (let y = 0; y < 512 + h; y += h) {
      for (let x = 0; x < 512 + size * 3; x += size * 3) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = x + size * Math.cos(angle);
          const py = y + size * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (pattern === 'circuit') {
    ctx.lineWidth = 3;
    for (let i = 0; i < 40; i++) {
      const sx = (i * 47) % 512;
      const sy = (i * 89) % 512;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 30, sy);
      ctx.lineTo(sx + 30, sy + 40);
      ctx.stroke();
      ctx.fillStyle = secondaryHex;
      ctx.beginPath();
      ctx.arc(sx + 30, sy + 40, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === 'carbon') {
    for (let x = 0; x < 512; x += 16) {
      for (let y = 0; y < 512; y += 16) {
        if ((x + y) % 32 === 0) {
          ctx.fillStyle = secondaryHex;
          ctx.fillRect(x, y, 16, 16);
        }
      }
    }
  } else if (pattern === 'sand') {
    ctx.lineWidth = 4;
    for (let y = 0; y < 512; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 30) {
        ctx.quadraticCurveTo(x + 15, y + 10 * Math.sin(x * 0.05), x + 30, y);
      }
      ctx.stroke();
    }
  } else {
    // Camo / organic / crystal
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = secondaryHex;
      ctx.beginPath();
      ctx.ellipse((i * 61) % 512, (i * 97) % 512, 28, 14, (i * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createNameplateTexture(suitName: string, id: number, accentColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 512, 128);

  // Holographic bracket backdrop with cyber gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
  grad.addColorStop(0.5, 'rgba(30, 41, 59, 0.9)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
  ctx.fillStyle = grad;

  ctx.strokeStyle = accentColor || '#f59e0b';
  ctx.lineWidth = 3;

  // Rounded rectangle
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(30, 16, 452, 96, 16);
  } else {
    ctx.rect(30, 16, 452, 96);
  }
  ctx.fill();
  ctx.stroke();

  // Cyber corner accents
  ctx.fillStyle = accentColor || '#f59e0b';
  ctx.fillRect(24, 12, 14, 4);
  ctx.fillRect(24, 12, 4, 14);
  ctx.fillRect(474, 12, 14, 4);
  ctx.fillRect(484, 12, 4, 14);

  // Title Text: SPIDER DIZERT
  ctx.font = '900 34px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = accentColor || '#f59e0b';
  ctx.shadowBlur = 12;
  ctx.fillText('✦ SPIDER DIZERT ✦', 256, 48);

  // Subtitle with suit name and ID
  ctx.shadowBlur = 0;
  ctx.font = '700 17px monospace';
  ctx.fillStyle = accentColor || '#f59e0b';
  ctx.fillText(`#${String(id).padStart(3, '0')} • ${suitName.toUpperCase()}`, 256, 82);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface SpiderDizertModel {
  root: THREE.Group;
  parts: {
    head: THREE.Group;
    torso: THREE.Mesh;
    chestEmblem: THREE.Mesh;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftForearm: THREE.Group;
    rightForearm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftShin: THREE.Group;
    rightShin: THREE.Group;
    leftEye: THREE.Mesh;
    rightEye: THREE.Mesh;
    webShooterL: THREE.Mesh;
    webShooterR: THREE.Mesh;
    webShooterGroupL: THREE.Group;
    webShooterGroupR: THREE.Group;
    nameplateSprite: THREE.Sprite;
  };
  materials: {
    suitPrimary: THREE.MeshStandardMaterial;
    suitSecondary: THREE.MeshStandardMaterial;
    accentTrim: THREE.MeshStandardMaterial;
    lenses: THREE.MeshStandardMaterial;
    emblem: THREE.MeshStandardMaterial;
  };
  updateSkin: (skin: SkinData) => void;
  updateWebShooter: (shooter: WebShooterData) => void;
  setAnimationPose: (
    pose: 'idle' | 'run' | 'sprint' | 'swing' | 'wallrun' | 'wallclimb' | 'dive' | 'punch' | 'kick' | 'airtrick',
    time: number,
    param?: number
  ) => void;
}

export function createSpiderDizert(initialSkin: SkinData, initialShooter?: WebShooterData): SpiderDizertModel {
  const root = new THREE.Group();
  root.name = 'SpiderDizert';

  // Base Materials
  const suitTex = createSuitTexture(initialSkin.patternType, initialSkin.primaryColor, initialSkin.secondaryColor);

  const matPrimary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialSkin.primaryColor),
    map: suitTex,
    roughness: initialSkin.roughness,
    metalness: initialSkin.metalness,
  });

  const matSecondary = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialSkin.secondaryColor),
    roughness: Math.max(0.2, initialSkin.roughness - 0.2),
    metalness: Math.min(0.9, initialSkin.metalness + 0.2),
  });

  const matTrim = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialSkin.accentColor),
    roughness: 0.2,
    metalness: 0.8,
  });

  const matLenses = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    emissive: new THREE.Color(initialSkin.emissiveColor),
    emissiveIntensity: initialSkin.emissiveIntensity,
    roughness: 0.1,
    metalness: 0.9,
  });

  const matEmblem = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialSkin.accentColor),
    emissive: new THREE.Color(initialSkin.emissiveColor),
    emissiveIntensity: initialSkin.emissiveIntensity * 0.8,
    roughness: 0.15,
    metalness: 0.85,
  });

  // HIERARCHICAL RIGGING (Anatomical Human Proportions - Heroic 1.85m tall)
  // 1. Torso & Spine
  const torsoGeom = new THREE.BoxGeometry(0.48, 0.62, 0.28);
  const torso = new THREE.Mesh(torsoGeom, matPrimary);
  torso.position.y = 1.25;
  torso.castShadow = true;
  torso.receiveShadow = true;
  root.add(torso);

  // Chest Armor Overlay & Spider Dizert Signature Emblem
  const chestPlateGeom = new THREE.BoxGeometry(0.5, 0.34, 0.08);
  const chestPlate = new THREE.Mesh(chestPlateGeom, matSecondary);
  chestPlate.position.set(0, 0.1, 0.12);
  torso.add(chestPlate);

  // Bespoke Spider Dizert Arachnid Emblem (Extruded angular spider with flared claws)
  const emblemShape = new THREE.Shape();
  emblemShape.moveTo(0, 0.12);
  emblemShape.lineTo(0.04, 0.05);
  emblemShape.lineTo(0.12, 0.08);
  emblemShape.lineTo(0.06, 0.01);
  emblemShape.lineTo(0.14, -0.05);
  emblemShape.lineTo(0.05, -0.04);
  emblemShape.lineTo(0.08, -0.12);
  emblemShape.lineTo(0, -0.08);
  emblemShape.lineTo(-0.08, -0.12);
  emblemShape.lineTo(-0.05, -0.04);
  emblemShape.lineTo(-0.14, -0.05);
  emblemShape.lineTo(-0.06, 0.01);
  emblemShape.lineTo(-0.12, 0.08);
  emblemShape.lineTo(-0.04, 0.05);
  emblemShape.closePath();

  const emblemGeom = new THREE.ShapeGeometry(emblemShape);
  const chestEmblem = new THREE.Mesh(emblemGeom, matEmblem);
  chestEmblem.position.set(0, 0.1, 0.17);
  torso.add(chestEmblem);

  // Belt & Utility Harness
  const beltGeom = new THREE.BoxGeometry(0.5, 0.08, 0.3);
  const belt = new THREE.Mesh(beltGeom, matSecondary);
  belt.position.set(0, -0.28, 0);
  torso.add(belt);

  // 2. Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.38, 0);
  torso.add(headGroup);

  const neckGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.14, 12);
  const neck = new THREE.Mesh(neckGeom, matSecondary);
  neck.position.y = 0.04;
  headGroup.add(neck);

  // Head Mask (Slightly tapered aerodynamic superhero cowl)
  const headGeom = new THREE.SphereGeometry(0.18, 24, 24);
  headGeom.scale(0.9, 1.15, 1.05);
  const head = new THREE.Mesh(headGeom, matPrimary);
  head.position.set(0, 0.18, 0);
  head.castShadow = true;
  headGroup.add(head);

  // Signature Expressive Angular Eye Lenses
  const eyeShape = new THREE.Shape();
  eyeShape.moveTo(0, 0.04);
  eyeShape.lineTo(0.07, 0.06);
  eyeShape.lineTo(0.09, 0.01);
  eyeShape.lineTo(0.03, -0.03);
  eyeShape.closePath();

  const eyeGeom = new THREE.ShapeGeometry(eyeShape);
  const leftEye = new THREE.Mesh(eyeGeom, matLenses);
  leftEye.position.set(0.05, 0.18, 0.18);
  leftEye.rotation.set(-0.1, 0.2, -0.05);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, matLenses);
  rightEye.position.set(-0.05, 0.18, 0.18);
  rightEye.rotation.set(-0.1, -0.2, 0.05);
  rightEye.scale.set(-1, 1, 1);
  headGroup.add(rightEye);

  // Modular Mask Archetype 1: Cyber Visor (Futuristic / Prototype)
  const visorGeom = new THREE.BoxGeometry(0.26, 0.07, 0.1);
  const cyberVisor = new THREE.Mesh(visorGeom, matLenses);
  cyberVisor.position.set(0, 0.18, 0.17);
  cyberVisor.visible = initialSkin.maskStyle === 'cyber_visor';
  headGroup.add(cyberVisor);

  // Modular Mask Archetype 2: Quad Night-Vision Sensors (Stealth)
  const quadSensors = new THREE.Group();
  const sensorGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8);
  sensorGeom.rotateX(Math.PI / 2);
  const s1 = new THREE.Mesh(sensorGeom, matLenses);
  s1.position.set(0.06, 0.21, 0.17);
  const s2 = new THREE.Mesh(sensorGeom, matLenses);
  s2.position.set(-0.06, 0.21, 0.17);
  const s3 = new THREE.Mesh(sensorGeom, matLenses);
  s3.position.set(0.04, 0.14, 0.17);
  const s4 = new THREE.Mesh(sensorGeom, matLenses);
  s4.position.set(-0.04, 0.14, 0.17);
  quadSensors.add(s1, s2, s3, s4);
  quadSensors.visible = initialSkin.maskStyle === 'quad_sensor';
  headGroup.add(quadSensors);

  // Modular Mask Archetype 3: Pharaoh Golden Crest (Desert / Ancient)
  const crestShape = new THREE.Shape();
  crestShape.moveTo(0, 0.1);
  crestShape.lineTo(0.08, 0.02);
  crestShape.lineTo(0, -0.04);
  crestShape.lineTo(-0.08, 0.02);
  crestShape.closePath();
  const pharaohCrest = new THREE.Mesh(new THREE.ShapeGeometry(crestShape), matTrim);
  pharaohCrest.position.set(0, 0.3, 0.15);
  pharaohCrest.scale.set(0.8, 0.8, 0.8);
  pharaohCrest.visible = initialSkin.maskStyle === 'pharaoh_crest';
  headGroup.add(pharaohCrest);

  // 3. Arms & Hands
  // Left Shoulder & Upper Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(0.32, 0.22, 0);
  torso.add(leftArm);

  const shoulderPadGeom = new THREE.SphereGeometry(0.11, 12, 12);
  const shoulderPadL = new THREE.Mesh(shoulderPadGeom, matSecondary);
  leftArm.add(shoulderPadL);

  const upperArmGeom = new THREE.CylinderGeometry(0.08, 0.07, 0.32, 12);
  const upperArmL = new THREE.Mesh(upperArmGeom, matPrimary);
  upperArmL.position.y = -0.16;
  leftArm.add(upperArmL);

  // Left Forearm & Hand
  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.32, 0);
  leftArm.add(leftForearm);

  const forearmGeom = new THREE.CylinderGeometry(0.07, 0.06, 0.3, 12);
  const forearmL = new THREE.Mesh(forearmGeom, matPrimary);
  forearmL.position.y = -0.15;
  leftForearm.add(forearmL);

  // Web Shooter Gauntlet Rigging (1:1 Modular Procedural Gauntlet)
  const webShooterGroupL = new THREE.Group();
  webShooterGroupL.position.set(0, -0.22, 0.04);
  leftForearm.add(webShooterGroupL);

  const shooterGeom = new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const webShooterL = new THREE.Mesh(shooterGeom, matTrim);
  webShooterL.visible = false;
  leftForearm.add(webShooterL);

  const handGeom = new THREE.BoxGeometry(0.08, 0.1, 0.06);
  const handL = new THREE.Mesh(handGeom, matSecondary);
  handL.position.y = -0.33;
  leftForearm.add(handL);

  // Right Shoulder & Upper Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(-0.32, 0.22, 0);
  torso.add(rightArm);

  const shoulderPadR = new THREE.Mesh(shoulderPadGeom, matSecondary);
  rightArm.add(shoulderPadR);

  const upperArmR = new THREE.Mesh(upperArmGeom, matPrimary);
  upperArmR.position.y = -0.16;
  rightArm.add(upperArmR);

  // Right Forearm & Hand
  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.32, 0);
  rightArm.add(rightForearm);

  const forearmR = new THREE.Mesh(forearmGeom, matPrimary);
  forearmR.position.y = -0.15;
  rightForearm.add(forearmR);

  const webShooterGroupR = new THREE.Group();
  webShooterGroupR.position.set(0, -0.22, 0.04);
  rightForearm.add(webShooterGroupR);

  const webShooterR = new THREE.Mesh(shooterGeom, matTrim);
  webShooterR.visible = false;
  rightForearm.add(webShooterR);

  const handR = new THREE.Mesh(handGeom, matSecondary);
  handR.position.y = -0.33;
  rightForearm.add(handR);

  // 4. Legs & Boots
  // Left Hip & Thigh
  const leftLeg = new THREE.Group();
  leftLeg.position.set(0.15, -0.32, 0);
  torso.add(leftLeg);

  const thighGeom = new THREE.CylinderGeometry(0.11, 0.09, 0.42, 12);
  const thighL = new THREE.Mesh(thighGeom, matPrimary);
  thighL.position.y = -0.21;
  thighL.castShadow = true;
  leftLeg.add(thighL);

  // Left Knee & Shin
  const leftShin = new THREE.Group();
  leftShin.position.set(0, -0.42, 0);
  leftLeg.add(leftShin);

  const shinGeom = new THREE.CylinderGeometry(0.09, 0.075, 0.42, 12);
  const shinL = new THREE.Mesh(shinGeom, matPrimary);
  shinL.position.y = -0.21;
  shinL.castShadow = true;
  leftShin.add(shinL);

  const bootGeom = new THREE.BoxGeometry(0.12, 0.14, 0.24);
  const bootL = new THREE.Mesh(bootGeom, matSecondary);
  bootL.position.set(0, -0.42, 0.04);
  bootL.castShadow = true;
  leftShin.add(bootL);

  // Right Hip & Thigh
  const rightLeg = new THREE.Group();
  rightLeg.position.set(-0.15, -0.32, 0);
  torso.add(rightLeg);

  const thighR = new THREE.Mesh(thighGeom, matPrimary);
  thighR.position.y = -0.21;
  thighR.castShadow = true;
  rightLeg.add(thighR);

  // Right Knee & Shin
  const rightShin = new THREE.Group();
  rightShin.position.set(0, -0.42, 0);
  rightLeg.add(rightShin);

  const shinR = new THREE.Mesh(shinGeom, matPrimary);
  shinR.position.y = -0.21;
  shinR.castShadow = true;
  rightShin.add(shinR);

  const bootR = new THREE.Mesh(bootGeom, matSecondary);
  bootR.position.set(0, -0.42, 0.04);
  bootR.castShadow = true;
  rightShin.add(bootR);

  // Contact Shadow Radial Grounding Plane (Directive 3.2)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.01;
  root.add(shadowPlane);

  // 5. Distinct Silhouette Modular Accessories
  // A. Four Articulated Mechanical Spider Waldo Arms (Back)
  const spiderWaldoes = new THREE.Group();
  spiderWaldoes.position.set(0, 0.05, -0.16);

  const waldoPack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.1), matTrim);
  spiderWaldoes.add(waldoPack);

  const createWaldoLeg = (isLeft: boolean, isUpper: boolean) => {
    const leg = new THREE.Group();
    const signX = isLeft ? 1 : -1;
    const signY = isUpper ? 1 : -0.6;

    const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.45, 8), matTrim);
    seg1.position.set(signX * 0.18, signY * 0.22, -0.15);
    seg1.rotation.set(isUpper ? -0.7 : 0.6, 0, signX * 0.7);
    leg.add(seg1);

    const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.5, 8), matTrim);
    seg2.position.set(signX * 0.35, signY * 0.45, 0.1);
    seg2.rotation.set(isUpper ? 1.2 : -0.8, signX * 0.3, 0);
    leg.add(seg2);

    const clawGeom = new THREE.ConeGeometry(0.035, 0.18, 6);
    clawGeom.rotateX(Math.PI);
    const claw = new THREE.Mesh(clawGeom, matLenses);
    claw.position.set(signX * 0.38, signY * 0.55, 0.3);
    leg.add(claw);

    return leg;
  };

  spiderWaldoes.add(
    createWaldoLeg(true, true),
    createWaldoLeg(false, true),
    createWaldoLeg(true, false),
    createWaldoLeg(false, false)
  );
  spiderWaldoes.visible = initialSkin.hasMechanicalSpiderArms;
  torso.add(spiderWaldoes);

  // B. Forearm Gauntlet Energy Blades (Tactical / Armored)
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(0.06, 0.28);
  bladeShape.lineTo(0, 0.35);
  bladeShape.lineTo(-0.02, 0);
  bladeShape.closePath();
  const bladeGeom = new THREE.ShapeGeometry(bladeShape);

  const bladeL = new THREE.Mesh(bladeGeom, matTrim);
  bladeL.position.set(0.06, -0.25, 0.05);
  bladeL.rotation.y = Math.PI / 2;
  bladeL.visible = initialSkin.hasGauntletBlades;
  leftForearm.add(bladeL);

  const bladeR = new THREE.Mesh(bladeGeom, matTrim);
  bladeR.position.set(-0.06, -0.25, 0.05);
  bladeR.rotation.y = -Math.PI / 2;
  bladeR.visible = initialSkin.hasGauntletBlades;
  rightForearm.add(bladeR);

  // C. Heavy Armored Shoulder Pauldrons (Armored)
  const pauldronGeom = new THREE.BoxGeometry(0.18, 0.12, 0.22);
  const pauldronL = new THREE.Mesh(pauldronGeom, matSecondary);
  pauldronL.position.set(0.08, 0.06, 0);
  pauldronL.rotation.z = -0.25;
  pauldronL.visible = initialSkin.hasShoulderPauldrons;
  leftArm.add(pauldronL);

  const pauldronR = new THREE.Mesh(pauldronGeom, matSecondary);
  pauldronR.position.set(-0.08, 0.06, 0);
  pauldronR.rotation.z = 0.25;
  pauldronR.visible = initialSkin.hasShoulderPauldrons;
  rightArm.add(pauldronR);

  // D. Underarm Aerodynamic Web Glider Wings (Classic / Futuristic)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.22, -0.25);
  wingShape.lineTo(0.04, -0.32);
  wingShape.closePath();
  const wingGeom = new THREE.ShapeGeometry(wingShape);

  const wingL = new THREE.Mesh(wingGeom, matTrim);
  wingL.position.set(0.18, -0.05, -0.05);
  wingL.visible = initialSkin.hasWebWings;
  torso.add(wingL);

  const wingR = new THREE.Mesh(wingGeom, matTrim);
  wingR.position.set(-0.18, -0.05, -0.05);
  wingR.scale.x = -1;
  wingR.visible = initialSkin.hasWebWings;
  torso.add(wingR);

  // E. Cosmic Orbiting Nano-Halo (Cosmic / Mythic)
  const haloTorus = new THREE.TorusGeometry(0.58, 0.02, 12, 36);
  const cosmicHalo = new THREE.Mesh(haloTorus, matLenses);
  cosmicHalo.rotation.x = Math.PI / 3;
  cosmicHalo.rotation.y = Math.PI / 6;
  cosmicHalo.visible = initialSkin.hasCosmicHalo;
  torso.add(cosmicHalo);

  // F. Holographic Floating Animated Nameplate Badge (Directive: Animated Player Name)
  const nameplateTex = createNameplateTexture(initialSkin.name, initialSkin.id, initialSkin.accentColor);
  const nameplateMat = new THREE.SpriteMaterial({
    map: nameplateTex,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const nameplateSprite = new THREE.Sprite(nameplateMat);
  nameplateSprite.scale.set(1.9, 0.48, 1.0);
  nameplateSprite.position.set(0, 2.15, 0);
  root.add(nameplateSprite);

  // Update skin method with silhouette accessory reconfiguration
  const updateSkin = (skin: SkinData) => {
    const newTex = createSuitTexture(skin.patternType, skin.primaryColor, skin.secondaryColor);
    matPrimary.color.set(skin.primaryColor);
    matPrimary.map = newTex;
    matPrimary.roughness = skin.roughness;
    matPrimary.metalness = skin.metalness;
    matPrimary.needsUpdate = true;

    matSecondary.color.set(skin.secondaryColor);
    matSecondary.roughness = Math.max(0.15, skin.roughness - 0.2);
    matSecondary.metalness = Math.min(0.95, skin.metalness + 0.2);
    matSecondary.needsUpdate = true;

    matTrim.color.set(skin.accentColor);
    matTrim.needsUpdate = true;

    matLenses.emissive.set(skin.emissiveColor);
    matLenses.emissiveIntensity = skin.emissiveIntensity;
    matLenses.needsUpdate = true;

    matEmblem.color.set(skin.accentColor);
    matEmblem.emissive.set(skin.emissiveColor);
    matEmblem.emissiveIntensity = skin.emissiveIntensity * 0.8;
    matEmblem.needsUpdate = true;

    // Update floating animated holographic nameplate
    const updatedNameplateTex = createNameplateTexture(skin.name, skin.id, skin.accentColor);
    if (nameplateMat.map) nameplateMat.map.dispose();
    nameplateMat.map = updatedNameplateTex;
    nameplateMat.needsUpdate = true;

    // Toggle physical silhouette accessories
    spiderWaldoes.visible = skin.hasMechanicalSpiderArms;
    bladeL.visible = skin.hasGauntletBlades;
    bladeR.visible = skin.hasGauntletBlades;
    pauldronL.visible = skin.hasShoulderPauldrons;
    pauldronR.visible = skin.hasShoulderPauldrons;
    wingL.visible = skin.hasWebWings;
    wingR.visible = skin.hasWebWings;
    cosmicHalo.visible = skin.hasCosmicHalo;

    // Update mask architecture
    if (skin.maskStyle === 'cyber_visor') {
      leftEye.visible = false;
      rightEye.visible = false;
      cyberVisor.visible = true;
      quadSensors.visible = false;
      pharaohCrest.visible = false;
    } else if (skin.maskStyle === 'quad_sensor') {
      leftEye.visible = false;
      rightEye.visible = false;
      cyberVisor.visible = false;
      quadSensors.visible = true;
      pharaohCrest.visible = false;
    } else if (skin.maskStyle === 'pharaoh_crest') {
      leftEye.visible = true;
      rightEye.visible = true;
      cyberVisor.visible = false;
      quadSensors.visible = false;
      pharaohCrest.visible = true;
    } else {
      leftEye.visible = true;
      rightEye.visible = true;
      cyberVisor.visible = false;
      quadSensors.visible = false;
      pharaohCrest.visible = false;
    }
  };

  // Dynamic 1:1 Web Shooter Gauntlet update
  const updateWebShooter = (shooter: WebShooterData) => {
    while (webShooterGroupL.children.length > 0) {
      const child = webShooterGroupL.children[0];
      webShooterGroupL.remove(child);
    }
    while (webShooterGroupR.children.length > 0) {
      const child = webShooterGroupR.children[0];
      webShooterGroupR.remove(child);
    }
    const meshL = buildWebShooterMesh(shooter, true);
    const meshR = buildWebShooterMesh(shooter, false);
    webShooterGroupL.add(meshL);
    webShooterGroupR.add(meshR);
  };

  // Mount initial 1:1 web shooter gauntlet
  updateWebShooter(initialShooter || ALL_WEB_SHOOTERS[0]);

  // Animation Pose Interpolator
  const setAnimationPose = (
    pose: 'idle' | 'run' | 'sprint' | 'swing' | 'wallrun' | 'wallclimb' | 'dive' | 'punch' | 'kick' | 'airtrick',
    time: number,
    param = 0
  ) => {
    // Dynamic holographic floating animation of hero title badge
    nameplateSprite.position.y = 2.15 + Math.sin(time * 2.8) * 0.05;
    nameplateMat.opacity = 0.82 + Math.sin(time * 3.6) * 0.18;

    switch (pose) {
      case 'idle': {
        const breath = Math.sin(time * 2) * 0.03;
        torso.position.y = 1.25 + breath;
        torso.rotation.set(0.05, 0, 0);
        headGroup.rotation.set(-0.05 + Math.sin(time * 1.5) * 0.02, 0, 0);
        leftArm.rotation.set(0.1, 0, -0.15);
        rightArm.rotation.set(0.1, 0, 0.15);
        leftForearm.rotation.set(0.2, 0, 0);
        rightForearm.rotation.set(0.2, 0, 0);
        leftLeg.rotation.set(-0.05, 0, 0.05);
        rightLeg.rotation.set(-0.05, 0, -0.05);
        leftShin.rotation.set(0.08, 0, 0);
        rightShin.rotation.set(0.08, 0, 0);
        break;
      }
      case 'run': {
        const cycle = time * 10;
        torso.position.y = 1.2 + Math.abs(Math.sin(cycle)) * 0.08;
        torso.rotation.set(0.25, Math.sin(cycle) * 0.1, 0);
        headGroup.rotation.set(-0.2, -Math.sin(cycle) * 0.1, 0);

        leftLeg.rotation.x = Math.sin(cycle) * 0.7;
        rightLeg.rotation.x = -Math.sin(cycle) * 0.7;
        leftShin.rotation.x = Math.max(0, -Math.sin(cycle) * 0.8);
        rightShin.rotation.x = Math.max(0, Math.sin(cycle) * 0.8);

        leftArm.rotation.x = -Math.sin(cycle) * 0.8;
        rightArm.rotation.x = Math.sin(cycle) * 0.8;
        leftForearm.rotation.x = 0.5;
        rightForearm.rotation.x = 0.5;
        break;
      }
      case 'sprint': {
        const cycle = time * 14;
        torso.position.y = 1.1 + Math.abs(Math.sin(cycle)) * 0.1;
        torso.rotation.set(0.45, Math.sin(cycle) * 0.15, 0);
        headGroup.rotation.set(-0.4, 0, 0);

        leftLeg.rotation.x = Math.sin(cycle) * 1.1;
        rightLeg.rotation.x = -Math.sin(cycle) * 1.1;
        leftShin.rotation.x = Math.max(0, -Math.sin(cycle) * 1.2);
        rightShin.rotation.x = Math.max(0, Math.sin(cycle) * 1.2);

        leftArm.rotation.x = -Math.sin(cycle) * 1.2;
        rightArm.rotation.x = Math.sin(cycle) * 1.2;
        leftForearm.rotation.x = 0.8;
        rightForearm.rotation.x = 0.8;
        break;
      }
      case 'swing': {
        // Tension arc: body leans back, one arm shoots up to tether, other arm balances
        const swingAngle = Math.sin(time * 3) * 0.4;
        torso.position.y = 1.35;
        torso.rotation.set(0.35 + swingAngle * 0.5, 0, -swingAngle * 0.3);
        headGroup.rotation.set(-0.3, 0, 0);

        // Leading web arm shoots up
        rightArm.rotation.set(-2.4, -0.2, 0.4);
        rightForearm.rotation.set(-0.2, 0, 0);
        leftArm.rotation.set(0.4, 0, -0.6);
        leftForearm.rotation.set(0.8, 0, 0);

        // Legs trailing in aerodynamic sweep
        leftLeg.rotation.set(0.6 + swingAngle * 0.2, 0, 0.2);
        rightLeg.rotation.set(0.8 + swingAngle * 0.2, 0, -0.1);
        leftShin.rotation.set(0.6, 0, 0);
        rightShin.rotation.set(0.4, 0, 0);
        break;
      }
      case 'dive': {
        // Falcon dive posture (head first, arms pinned back)
        torso.position.y = 1.3;
        torso.rotation.set(1.4, 0, 0);
        headGroup.rotation.set(-1.0, 0, 0);

        leftArm.rotation.set(1.6, 0, -0.3);
        rightArm.rotation.set(1.6, 0, 0.3);
        leftForearm.rotation.set(0.2, 0, 0);
        rightForearm.rotation.set(0.2, 0, 0);

        leftLeg.rotation.set(-0.2, 0, 0.1);
        rightLeg.rotation.set(-0.2, 0, -0.1);
        leftShin.rotation.set(0.2, 0, 0);
        rightShin.rotation.set(0.2, 0, 0);
        break;
      }
      case 'wallrun': {
        // Tilted body 90° onto wall with rapid strides
        const cycle = time * 12;
        torso.rotation.set(0.3, 0, -0.6);
        headGroup.rotation.set(-0.2, 0, 0.4);

        leftLeg.rotation.x = Math.sin(cycle) * 0.9;
        rightLeg.rotation.x = -Math.sin(cycle) * 0.9;
        leftShin.rotation.x = Math.max(0, -Math.sin(cycle) * 0.8);
        rightShin.rotation.x = Math.max(0, Math.sin(cycle) * 0.8);

        leftArm.rotation.set(0.3, 0, -0.8);
        rightArm.rotation.set(-0.5, 0, 0.3);
        break;
      }
      case 'wallclimb': {
        // Spider crawling vertically on wall:
        // Torso leans close to wall surface, angled forward
        const climbCycle = time * 12;
        torso.position.y = 1.0;
        torso.rotation.set(-1.1, 0, 0); // Flat against wall
        headGroup.rotation.set(1.2, 0, 0); // Head looks up towards the roof!

        // Arms reach out onto the wall, alternating in spider crawl rhythm
        const leftArmCycle = Math.sin(climbCycle);
        const rightArmCycle = Math.sin(climbCycle + Math.PI);

        leftArm.rotation.set(-1.2 + leftArmCycle * 0.4, 0.3, -0.6);
        leftForearm.rotation.set(0.6 + leftArmCycle * 0.3, 0, 0);

        rightArm.rotation.set(-1.2 + rightArmCycle * 0.4, -0.3, 0.6);
        rightForearm.rotation.set(0.6 + rightArmCycle * 0.3, 0, 0);

        // Legs bend, alternating crawl steps with boots on wall surface
        leftLeg.rotation.set(0.8 - leftArmCycle * 0.5, 0, 0.4);
        leftShin.rotation.set(0.9, 0, 0);

        rightLeg.rotation.set(0.8 - rightArmCycle * 0.5, 0, -0.4);
        rightShin.rotation.set(0.9, 0, 0);
        break;
      }
      case 'punch': {
        const strike = Math.sin(param * Math.PI);
        torso.rotation.set(0.1, strike * 0.6, 0);
        rightArm.rotation.set(-1.5 * strike, 0, strike * 0.4);
        rightForearm.rotation.set(-0.2 * strike, 0, 0);
        leftArm.rotation.set(0.5, 0, -0.4);
        break;
      }
      case 'kick': {
        const strike = Math.sin(param * Math.PI);
        torso.rotation.set(-0.3 * strike, 0, -strike * 0.4);
        rightLeg.rotation.set(-1.6 * strike, 0, strike * 0.3);
        rightShin.rotation.set(0.2 * strike, 0, 0);
        leftLeg.rotation.set(0.3, 0, 0);
        break;
      }
      case 'airtrick': {
        torso.rotation.x = time * 8;
        torso.rotation.y = time * 4;
        leftArm.rotation.set(-1.2, 0, -0.6);
        rightArm.rotation.set(-1.2, 0, 0.6);
        leftLeg.rotation.set(0.8, 0, 0.4);
        rightLeg.rotation.set(0.8, 0, -0.4);
        break;
      }
    }
  };

  return {
    root,
    parts: {
      head: headGroup,
      torso,
      chestEmblem,
      leftArm,
      rightArm,
      leftForearm,
      rightForearm,
      leftLeg,
      rightLeg,
      leftShin,
      rightShin,
      leftEye,
      rightEye,
      webShooterL,
      webShooterR,
      webShooterGroupL,
      webShooterGroupR,
      nameplateSprite,
    },
    materials: {
      suitPrimary: matPrimary,
      suitSecondary: matSecondary,
      accentTrim: matTrim,
      lenses: matLenses,
      emblem: matEmblem,
    },
    updateSkin,
    updateWebShooter,
    setAnimationPose,
  };
}
