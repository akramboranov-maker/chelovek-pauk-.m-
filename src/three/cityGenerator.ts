/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { EnvironmentTheme } from '../types/game';

export interface BuildingBox {
  min: THREE.Vector3;
  max: THREE.Vector3;
  height: number;
  center: THREE.Vector3;
}

export interface CityWorld {
  root: THREE.Group;
  buildings: BuildingBox[];
  buildingMeshes: THREE.Mesh[];
  trafficGroup: THREE.Group;
  dronesGroup: THREE.Group;
  updateTheme: (theme: EnvironmentTheme) => void;
  updateAnimations: (delta: number) => void;
  getWebAnchorPoint: (heroPos: THREE.Vector3, lookDir: THREE.Vector3, maxRange?: number) => { point: THREE.Vector3; normal: THREE.Vector3 } | null;
  checkGroundHeight: (x: number, z: number, currentY?: number) => number;
}

export function createProceduralCity(initialTheme: EnvironmentTheme): CityWorld {
  const root = new THREE.Group();
  root.name = 'ProceduralCityWorld';

  const buildings: BuildingBox[] = [];
  const buildingMeshes: THREE.Mesh[] = [];

  // Ground plane & Road Network
  const groundGeom = new THREE.PlaneGeometry(800, 800, 16, 16);
  const groundMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialTheme.groundColor),
    roughness: 0.85,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // Road Markings Mesh
  const roadMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialTheme.roadMarkingColor),
    roughness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // Dynamic Building Materials based on Theme Palette
  const buildingMats: THREE.MeshStandardMaterial[] = initialTheme.buildingPalette.map(colorHex => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.4,
      metalness: 0.6,
    });
  });

  const windowGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialTheme.windowGlowColor),
    emissive: new THREE.Color(initialTheme.windowGlowColor),
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.9,
  });

  const neonMats: THREE.MeshBasicMaterial[] = initialTheme.neonColors.map(hex => {
    return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex) });
  });

  // Sky Backdrop Dome
  const skyGeom = new THREE.SphereGeometry(750, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initialTheme.skyColor),
    side: THREE.BackSide,
  });
  const skyDome = new THREE.Mesh(skyGeom, skyMat);
  root.add(skyDome);

  // Generate Grid of Buildings
  // 12 x 12 Blocks with wide boulevards
  const GRID_SIZE = 12;
  const BLOCK_SPACING = 38; // meters between centers
  const halfGrid = (GRID_SIZE * BLOCK_SPACING) / 2;

  const buildingGeoms: THREE.BoxGeometry[] = [];

  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gz = 0; gz < GRID_SIZE; gz++) {
      const cx = (gx * BLOCK_SPACING) - halfGrid + (Math.random() - 0.5) * 4;
      const cz = (gz * BLOCK_SPACING) - halfGrid + (Math.random() - 0.5) * 4;

      // Central plaza opening at (0,0)
      if (Math.abs(cx) < 30 && Math.abs(cz) < 30) continue;

      // Distance from center determines skyscraper tier
      const distFromCenter = Math.sqrt(cx * cx + cz * cz);
      const isCore = distFromCenter < 100;
      const isMidtown = distFromCenter < 180;

      const width = 16 + Math.random() * 12;
      const depth = 16 + Math.random() * 12;
      
      // Heights range from 30m up to 140m for central megaliths
      let height = 30 + Math.random() * 40;
      if (isCore) height = 80 + Math.random() * 70;
      else if (isMidtown) height = 50 + Math.random() * 45;

      const bGeom = new THREE.BoxGeometry(width, height, depth);
      const mat = buildingMats[(gx + gz) % buildingMats.length];
      const buildingMesh = new THREE.Mesh(bGeom, mat);
      buildingMesh.position.set(cx, height / 2, cz);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      root.add(buildingMesh);
      buildingMeshes.push(buildingMesh);

      // Store collision / anchor box
      buildings.push({
        min: new THREE.Vector3(cx - width / 2, 0, cz - depth / 2),
        max: new THREE.Vector3(cx + width / 2, height, cz + depth / 2),
        height,
        center: new THREE.Vector3(cx, height / 2, cz),
      });

      // Rooftop structures (Helipads, AC units, Antenna Spire)
      if (height > 60) {
        // Antenna spire
        const antennaGeom = new THREE.CylinderGeometry(0.15, 0.4, 18, 8);
        const antenna = new THREE.Mesh(antennaGeom, windowGlowMat);
        antenna.position.set(cx, height + 9, cz);
        root.add(antenna);

        // Rooftop LED Beacon
        const beaconGeom = new THREE.SphereGeometry(0.6, 8, 8);
        const beacon = new THREE.Mesh(beaconGeom, neonMats[0] || windowGlowMat);
        beacon.position.set(cx, height + 18, cz);
        root.add(beacon);
      } else {
        // AC Ducts on roof
        const acGeom = new THREE.BoxGeometry(4, 2, 4);
        const acMesh = new THREE.Mesh(acGeom, buildingMats[0]);
        acMesh.position.set(cx + 2, height + 1, cz + 2);
        root.add(acMesh);
      }

      // Neon Billboards on selected street fronts
      if ((gx + gz) % 3 === 0 && height > 40) {
        const billboardGeom = new THREE.BoxGeometry(width * 0.7, 6, 0.8);
        const bMat = neonMats[(gx + gz) % neonMats.length];
        const billboard = new THREE.Mesh(billboardGeom, bMat);
        billboard.position.set(cx, 16 + ((gx * gz) % 25), cz + depth / 2 + 0.4);
        root.add(billboard);
      }
    }
  }

  // Feature Props Group (Trees, Cacti, Cranes, Holograms, Monoliths)
  const propsGroup = new THREE.Group();
  propsGroup.name = 'DistrictFeatureProps';
  root.add(propsGroup);

  const populateProps = (theme: EnvironmentTheme) => {
    // Clear previous props
    while (propsGroup.children.length > 0) {
      propsGroup.remove(propsGroup.children[0]);
    }

    const type = theme.featureProps;
    if (type === 'trees' || type === 'palms') {
      // Create park trees along avenue medians
      const trunkGeom = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
      const foliageGeom = type === 'palms' ? new THREE.ConeGeometry(3, 4, 6) : new THREE.SphereGeometry(2.5, 8, 8);
      const foliageMat = new THREE.MeshStandardMaterial({ color: type === 'palms' ? 0x10b981 : 0x2e7d32 });

      for (let i = 0; i < 40; i++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 2;
        tree.add(trunk);
        const foliage = new THREE.Mesh(foliageGeom, foliageMat);
        foliage.position.y = 4.5;
        tree.add(foliage);

        const tx = (i % 8 - 4) * 35 + 12;
        const tz = (Math.floor(i / 8) - 2.5) * 35 + 12;
        tree.position.set(tx, 0, tz);
        propsGroup.add(tree);
      }
    } else if (type === 'cranes') {
      // Tower cranes atop mid-rise construction
      const craneMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      for (let i = 0; i < 6; i++) {
        const crane = new THREE.Group();
        const mast = new THREE.Mesh(new THREE.BoxGeometry(1.5, 30, 1.5), craneMat);
        mast.position.y = 15;
        crane.add(mast);
        const jib = new THREE.Mesh(new THREE.BoxGeometry(25, 1.2, 1.2), craneMat);
        jib.position.set(8, 30, 0);
        crane.add(jib);

        crane.position.set((i - 3) * 60, 50, (i % 2 === 0 ? 50 : -50));
        propsGroup.add(crane);
      }
    } else if (type === 'cacti') {
      // Desert saguaro cacti
      const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.7 });
      for (let i = 0; i < 35; i++) {
        const cactus = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 5, 8), cactusMat);
        cactus.position.set((Math.random() - 0.5) * 300, 2.5, (Math.random() - 0.5) * 300);
        propsGroup.add(cactus);
      }
    } else if (type === 'holograms') {
      // Cyberpunk floating 3D holographic wireframes
      const holoMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
      for (let i = 0; i < 10; i++) {
        const holo = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 1), holoMat);
        holo.position.set((i - 5) * 45, 55 + (i % 3) * 15, (i % 2 === 0 ? 30 : -30));
        propsGroup.add(holo);
      }
    } else if (type === 'monuments') {
      // Central Obelisk / Spire of Honor
      const obeliskGeom = new THREE.CylinderGeometry(1.5, 3.5, 45, 4);
      const obeliskMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
      const obelisk = new THREE.Mesh(obeliskGeom, obeliskMat);
      obelisk.position.set(0, 22.5, 0);
      propsGroup.add(obelisk);
    }
  };

  populateProps(initialTheme);

  // Moving Traffic Simulation with Realistic 1:1 Vehicle Archetypes & Skins
  const trafficGroup = new THREE.Group();
  trafficGroup.name = 'CityTraffic';
  root.add(trafficGroup);

  interface TrafficCar {
    mesh: THREE.Group;
    wheels: THREE.Mesh[];
    policeSirenR?: THREE.Mesh;
    policeSirenB?: THREE.Mesh;
    speed: number;
    axis: 'x' | 'z';
    dir: number;
    lane: number;
  }

  const trafficCars: TrafficCar[] = [];

  // Reusable materials for cars
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.2, metalness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.95 });
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const taxiSignMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

  const carSkins = [
    { type: 'supercar', name: 'Apex GT Crimson', body: 0xc41e3a, trim: 0x111827, spoiler: true },
    { type: 'taxi', name: 'Metro Yellow Cab', body: 0xf59e0b, trim: 0x000000, taxiRoof: true },
    { type: 'police', name: 'Interceptor Cruiser', body: 0x0f172a, trim: 0xf8fafc, policeBar: true },
    { type: 'cyber', name: 'Cyber Neon GT', body: 0x2e1065, trim: 0x00f0ff, neonUnder: true },
    { type: 'sedan', name: 'Executive Silver', body: 0x94a3b8, trim: 0x1e293b },
    { type: 'supercar', name: 'Velocity Cyan GT', body: 0x0284c7, trim: 0x0f172a, spoiler: true },
    { type: 'sedan', name: 'Midnight Onyx VIP', body: 0x090a0f, trim: 0xd4af37 },
    { type: 'van', name: 'Cargo Logistics', body: 0xe2e8f0, trim: 0xea580c }
  ];

  for (let i = 0; i < 48; i++) {
    const skin = carSkins[i % carSkins.length];
    const car = new THREE.Group();
    const wheels: THREE.Mesh[] = [];

    const carPaintMat = new THREE.MeshStandardMaterial({
      color: skin.body,
      metalness: skin.type === 'supercar' ? 0.9 : 0.7,
      roughness: 0.25,
    });
    const carTrimMat = new THREE.MeshStandardMaterial({
      color: skin.trim,
      metalness: 0.8,
      roughness: 0.3,
    });

    // 1. Lower Chassis (Realistic 1:1 Car Length 4.6m, Width 2.0m, Height 0.6m)
    const isTruck = skin.type === 'van';
    const cLength = isTruck ? 5.2 : 4.6;
    const cWidth = isTruck ? 2.2 : 2.0;
    const cHeight = isTruck ? 1.0 : 0.55;

    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(cWidth, cHeight, cLength), carPaintMat);
    lowerChassis.position.y = 0.5;
    lowerChassis.castShadow = true;
    car.add(lowerChassis);

    // Front Radiator Grille & Bumper
    const grille = new THREE.Mesh(new THREE.BoxGeometry(cWidth * 0.75, 0.25, 0.1), carTrimMat);
    grille.position.set(0, 0.45, cLength / 2 + 0.05);
    car.add(grille);

    // 2. Cabin Greenhouse & Sloped Windows
    const cabinLength = isTruck ? 3.4 : 2.5;
    const cabinHeight = isTruck ? 1.2 : 0.65;
    const cabinWidth = cWidth * 0.85;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength), glassMat);
    cabin.position.set(0, 0.5 + cHeight / 2 + cabinHeight / 2, isTruck ? 0.4 : -0.2);
    car.add(cabin);

    // Roof Panel
    const roof = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth * 0.96, 0.06, cabinLength * 0.9), carPaintMat);
    roof.position.set(0, 0.5 + cHeight / 2 + cabinHeight + 0.03, isTruck ? 0.4 : -0.2);
    car.add(roof);

    // 3. Headlights & Taillights
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), headlightMat);
    hlL.position.set(cWidth * 0.35, 0.52, cLength / 2 + 0.05);
    const hlR = hlL.clone();
    hlR.position.x = -cWidth * 0.35;
    car.add(hlL, hlR);

    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.1), taillightMat);
    tlL.position.set(cWidth * 0.35, 0.58, -cLength / 2 - 0.05);
    const tlR = tlL.clone();
    tlR.position.x = -cWidth * 0.35;
    car.add(tlL, tlR);

    // 4. Four Rotating Rubber Wheels with Chrome Rims (1:1 Wheel Scale radius 0.35m)
    const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 16);
    wheelGeom.rotateZ(Math.PI / 2);

    const wheelPos = [
      { x: cWidth / 2 + 0.08, z: cLength * 0.3 },
      { x: -cWidth / 2 - 0.08, z: cLength * 0.3 },
      { x: cWidth / 2 + 0.08, z: -cLength * 0.3 },
      { x: -cWidth / 2 - 0.08, z: -cLength * 0.3 }
    ];

    wheelPos.forEach((wp) => {
      const wheelMesh = new THREE.Mesh(wheelGeom, rubberMat);
      wheelMesh.position.set(wp.x, 0.35, wp.z);
      wheelMesh.castShadow = true;

      // Rim Disc Accent
      const rimDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 12), rimMat);
      rimDisc.rotateZ(Math.PI / 2);
      wheelMesh.add(rimDisc);

      car.add(wheelMesh);
      wheels.push(wheelMesh);
    });

    let policeSirenR: THREE.Mesh | undefined;
    let policeSirenB: THREE.Mesh | undefined;

    // 5. Specialized Skin Attachments
    if (skin.taxiRoof) {
      // Taxi Medallion Roof Sign
      const tSign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.3), taxiSignMat);
      tSign.position.set(0, 0.5 + cHeight / 2 + cabinHeight + 0.18, -0.2);
      car.add(tSign);
    } else if (skin.policeBar) {
      // Police Emergency Flashing Lightbar
      policeSirenR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      policeSirenR.position.set(0.25, 0.5 + cHeight / 2 + cabinHeight + 0.1, -0.2);

      policeSirenB = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
      policeSirenB.position.set(-0.25, 0.5 + cHeight / 2 + cabinHeight + 0.1, -0.2);

      car.add(policeSirenR, policeSirenB);
    } else if (skin.spoiler) {
      // GT Aerodynamic Spoiler Wing
      const wingBar = new THREE.Mesh(new THREE.BoxGeometry(cWidth * 0.9, 0.06, 0.35), carTrimMat);
      wingBar.position.set(0, 0.95, -cLength / 2 + 0.15);
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.15), carTrimMat);
      postL.position.set(cWidth * 0.3, 0.8, -cLength / 2 + 0.15);
      const postR = postL.clone();
      postR.position.x = -cWidth * 0.3;
      car.add(wingBar, postL, postR);
    } else if (skin.neonUnder) {
      // Cyber Neon Underglow
      const underglow = new THREE.Mesh(
        new THREE.PlaneGeometry(cWidth * 0.9, cLength * 0.9),
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 })
      );
      underglow.rotation.x = -Math.PI / 2;
      underglow.position.y = 0.06;
      car.add(underglow);
    }

    const axis = i % 2 === 0 ? 'x' : 'z';
    const dir = i % 4 < 2 ? 1 : -1;
    const lane = ((i % 6) - 3) * BLOCK_SPACING + (dir > 0 ? 4 : -4);

    car.position.set(
      axis === 'x' ? (Math.random() - 0.5) * 400 : lane,
      0,
      axis === 'z' ? (Math.random() - 0.5) * 400 : lane
    );
    if (axis === 'x') {
      car.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      car.rotation.y = dir > 0 ? 0 : Math.PI;
    }

    trafficGroup.add(car);
    trafficCars.push({
      mesh: car,
      wheels,
      policeSirenR,
      policeSirenB,
      speed: 16 + Math.random() * 12,
      axis,
      dir,
      lane
    });
  }

  // Flying Sky Drones / Patrol Helicopters
  const dronesGroup = new THREE.Group();
  dronesGroup.name = 'AirDrones';
  root.add(dronesGroup);

  const droneMeshes: THREE.Group[] = [];
  for (let i = 0; i < 8; i++) {
    const drone = new THREE.Group();
    const dBody = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 3), new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9 }));
    drone.add(dBody);
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true }));
    rotor.position.y = 0.6;
    drone.add(rotor);
    const searchlight = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 }));
    searchlight.position.y = -3;
    searchlight.rotation.x = Math.PI;
    drone.add(searchlight);

    drone.position.set((i - 4) * 50, 75 + (i % 3) * 15, (Math.random() - 0.5) * 200);
    dronesGroup.add(drone);
    droneMeshes.push(drone);
  }

  // Theme Swapping Method
  const updateTheme = (theme: EnvironmentTheme) => {
    skyMat.color.set(theme.skyColor);
    groundMat.color.set(theme.groundColor);
    roadMat.color.set(theme.roadMarkingColor);
    windowGlowMat.color.set(theme.windowGlowColor);
    windowGlowMat.emissive.set(theme.windowGlowColor);

    theme.buildingPalette.forEach((hex, idx) => {
      if (buildingMats[idx]) {
        buildingMats[idx].color.set(hex);
      }
    });

    theme.neonColors.forEach((hex, idx) => {
      if (neonMats[idx]) {
        neonMats[idx].color.set(hex);
      }
    });

    populateProps(theme);
  };

  // Traffic & Sky Animation Loop
  const updateAnimations = (delta: number) => {
    const now = performance.now() * 0.001;
    const sirenFlash = Math.sin(now * 16) > 0;

    // Advance cars & spin wheels
    trafficCars.forEach(tc => {
      const wheelSpin = (tc.speed / 0.35) * delta * (tc.dir > 0 ? 1 : -1);
      tc.wheels.forEach(w => {
        w.rotation.x += wheelSpin;
      });

      // Police alternating siren flash
      if (tc.policeSirenR && tc.policeSirenB) {
        (tc.policeSirenR.material as THREE.MeshBasicMaterial).color.setHex(sirenFlash ? 0xff0033 : 0x220008);
        (tc.policeSirenB.material as THREE.MeshBasicMaterial).color.setHex(sirenFlash ? 0x001144 : 0x0066ff);
      }

      if (tc.axis === 'x') {
        tc.mesh.position.x += tc.speed * tc.dir * delta;
        if (tc.mesh.position.x > 250) tc.mesh.position.x = -250;
        if (tc.mesh.position.x < -250) tc.mesh.position.x = 250;
      } else {
        tc.mesh.position.z += tc.speed * tc.dir * delta;
        if (tc.mesh.position.z > 250) tc.mesh.position.z = -250;
        if (tc.mesh.position.z < -250) tc.mesh.position.z = 250;
      }
    });

    // Drone flight patrol circles
    droneMeshes.forEach((dm, idx) => {
      const radius = 90 + idx * 15;
      const speed = 0.3 + idx * 0.05;
      dm.position.x = Math.cos(now * speed + idx) * radius;
      dm.position.z = Math.sin(now * speed + idx) * radius;
      dm.rotation.y = -(now * speed + idx) + Math.PI / 2;
    });
  };

  // Web Anchor Raycast / Proximity calculation
  const getWebAnchorPoint = (heroPos: THREE.Vector3, lookDir: THREE.Vector3, maxRange = 120) => {
    let bestAnchor: { point: THREE.Vector3; normal: THREE.Vector3 } | null = null;
    let closestDist = maxRange;

    // Search building bounding boxes higher than hero and within range
    for (const b of buildings) {
      if (b.height < heroPos.y + 5) continue; // Anchor must be above hero for realistic pendulum swing

      // Check if building is generally in forward half-space or nearby overhead
      const toBuilding = new THREE.Vector3().subVectors(b.center, heroPos);
      const dist = toBuilding.length();
      if (dist > maxRange) continue;

      const dot = lookDir.dot(toBuilding.clone().normalize());
      if (dot < -0.2) continue; // Skip buildings behind hero

      // Determine the optimal anchor point at building upper cornice
      const cornerX = heroPos.x > b.center.x ? b.max.x : b.min.x;
      const cornerZ = heroPos.z > b.center.z ? b.max.z : b.min.z;
      const anchorY = Math.min(b.height - 2, heroPos.y + 35);

      const candidatePoint = new THREE.Vector3(cornerX, anchorY, cornerZ);
      const candidateDist = heroPos.distanceTo(candidatePoint);

      // Web anchor must be at least 14m away so swinging has a natural pendulum arc
      if (candidateDist < 14) continue;

      if (candidateDist < closestDist) {
        closestDist = candidateDist;
        bestAnchor = {
          point: candidatePoint,
          normal: new THREE.Vector3(cornerX - b.center.x, 0, cornerZ - b.center.z).normalize(),
        };
      }
    }

    return bestAnchor;
  };

  const checkGroundHeight = (x: number, z: number, currentY = 0): number => {
    // Check if on top of a building rooftop (only if near or above rooftop height)
    for (const b of buildings) {
      if (x >= b.min.x - 0.2 && x <= b.max.x + 0.2 && z >= b.min.z - 0.2 && z <= b.max.z + 0.2) {
        if (currentY >= b.height - 1.5) {
          return b.height;
        }
      }
    }
    return 0; // Street level
  };

  return {
    root,
    buildings,
    buildingMeshes,
    trafficGroup,
    dronesGroup,
    updateTheme,
    updateAnimations,
    getWebAnchorPoint,
    checkGroundHeight,
  };
}
