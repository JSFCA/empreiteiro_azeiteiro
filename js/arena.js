import * as THREE from './vendor/three.module.js';

export const ARENA_HALF_SIZE = 20;
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 1;

export const OBSTACLES = [
  { x: 8, z: 8, halfX: 1.5, halfZ: 1.5 },
  { x: -8, z: 8, halfX: 1.5, halfZ: 1.5 },
  { x: 8, z: -8, halfX: 1.5, halfZ: 1.5 },
  { x: -8, z: -8, halfX: 1.5, halfZ: 1.5 },
  { x: 0, z: 0, halfX: 2, halfZ: 2 },
];

export function buildArena(scene) {
  const floorGeo = new THREE.PlaneGeometry(ARENA_HALF_SIZE * 2, ARENA_HALF_SIZE * 2);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x555566 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x333344 });
  const wallLength = ARENA_HALF_SIZE * 2 + WALL_THICKNESS * 2;
  const wallPositions = [
    { x: 0, z: ARENA_HALF_SIZE + WALL_THICKNESS / 2, w: wallLength, d: WALL_THICKNESS },
    { x: 0, z: -ARENA_HALF_SIZE - WALL_THICKNESS / 2, w: wallLength, d: WALL_THICKNESS },
    { x: ARENA_HALF_SIZE + WALL_THICKNESS / 2, z: 0, w: WALL_THICKNESS, d: wallLength },
    { x: -ARENA_HALF_SIZE - WALL_THICKNESS / 2, z: 0, w: WALL_THICKNESS, d: wallLength },
  ];
  for (const wp of wallPositions) {
    const geo = new THREE.BoxGeometry(wp.w, WALL_HEIGHT, wp.d);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(wp.x, WALL_HEIGHT / 2, wp.z);
    scene.add(mesh);
  }

  const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x8899aa });
  for (const ob of OBSTACLES) {
    const geo = new THREE.BoxGeometry(ob.halfX * 2, WALL_HEIGHT, ob.halfZ * 2);
    const mesh = new THREE.Mesh(geo, obstacleMat);
    mesh.position.set(ob.x, WALL_HEIGHT / 2, ob.z);
    scene.add(mesh);
  }

  buildConstructionProps(scene);
}

// Purely decorative construction-site dressing (not collidable) placed clear
// of the obstacles and the opponent's patrol perimeter.
function buildConstructionProps(scene) {
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff6a00 });
  const conePositions = [
    { x: 2.5, z: 2.5 },
    { x: -2.5, z: 2.5 },
    { x: 2.5, z: -2.5 },
    { x: -2.5, z: -2.5 },
  ];
  for (const p of conePositions) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 12), coneMat);
    cone.position.set(p.x, 0.45, p.z);
    scene.add(cone);
  }

  const barrelBodyMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  const barrelStripeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const barrelPositions = [
    { x: 10, z: 3 },
    { x: -10, z: -3 },
    { x: 3, z: 10 },
  ];
  for (const p of barrelPositions) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 16), barrelBodyMat);
    barrel.position.set(p.x, 0.55, p.z);
    scene.add(barrel);

    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.22, 16), barrelStripeMat);
    stripe.position.set(p.x, 0.55, p.z);
    scene.add(stripe);
  }
}

export function isBlockedByObstacle(x, z, radius) {
  for (const ob of OBSTACLES) {
    const closestX = Math.max(ob.x - ob.halfX, Math.min(x, ob.x + ob.halfX));
    const closestZ = Math.max(ob.z - ob.halfZ, Math.min(z, ob.z + ob.halfZ));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < radius * radius) return true;
  }
  return false;
}

export function isWithinBounds(x, z, radius) {
  const limit = ARENA_HALF_SIZE - radius;
  return Math.abs(x) <= limit && Math.abs(z) <= limit;
}

export function checkCollision(x, z, radius) {
  return !isWithinBounds(x, z, radius) || isBlockedByObstacle(x, z, radius);
}

// Samples the segment between two points to see if any obstacle blocks line-of-sight,
// used by the AI to decide whether it can actually hit the player from here.
export function isLineBlocked(fromX, fromZ, toX, toZ) {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const dist = Math.hypot(dx, dz);
  const steps = Math.max(1, Math.ceil(dist / 0.5));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = fromX + dx * t;
    const z = fromZ + dz * t;
    if (isBlockedByObstacle(x, z, 0.2)) return true;
  }
  return false;
}
