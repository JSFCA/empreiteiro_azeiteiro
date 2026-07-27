import * as THREE from './vendor/three.module.js';
import { buildArena } from './arena.js';
import { Player, PLAYER_RADIUS, EYE_HEIGHT, MAX_HEALTH as PLAYER_MAX_HEALTH } from './player.js';
import { Opponent, OPPONENT_RADIUS, MAX_HEALTH as OPPONENT_MAX_HEALTH } from './opponent.js';
import { Projectile } from './projectile.js';
import { isDown } from './inputManager.js';
import { updateHealth, onStart, onRestart, showEndOverlay, flashPlayerDamage, showBanter, hideBanter } from './ui.js';
import { randomBanter } from './banter.js';

const canvas = document.getElementById('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111118);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

buildArena(scene);

const player = new Player(0, 16);

const opponent = new Opponent(14, 14);
const OPPONENT_BASE_EMISSIVE = 0x220000;
const OPPONENT_FLASH_EMISSIVE = 0xffffff;
const OPPONENT_FLASH_DURATION = 0.15;
let opponentFlashTimer = 0;

const opponentBodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d0000,
  emissive: OPPONENT_BASE_EMISSIVE,
});
const opponentMesh = new THREE.Mesh(
  new THREE.CapsuleGeometry(OPPONENT_RADIUS, 0.8, 4, 8),
  opponentBodyMaterial,
);
opponentMesh.position.y = 0.4 + OPPONENT_RADIUS;
scene.add(opponentMesh);

const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x161616 });
const gunGroup = new THREE.Group();

const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.8), gunMaterial);
gunGroup.add(gunBody);

const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.6, 8), gunMaterial);
gunBarrel.rotation.x = Math.PI / 2;
gunBarrel.position.set(0, 0.02, -0.65);
gunGroup.add(gunBarrel);

const gunMagazine = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.45, 0.16), gunMaterial);
gunMagazine.position.set(0, -0.32, -0.05);
gunMagazine.rotation.x = 0.35;
gunGroup.add(gunMagazine);

const gunStock = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.16, 0.35), gunMaterial);
gunStock.position.set(0, 0, 0.55);
gunGroup.add(gunStock);

gunGroup.position.set(OPPONENT_RADIUS * 0.55, -0.05, -OPPONENT_RADIUS - 0.15);
opponentMesh.add(gunGroup);

const eyeMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 1.5,
});
const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.18, 0.55, -OPPONENT_RADIUS - 0.02);
const rightEye = leftEye.clone();
rightEye.position.x = 0.18;
opponentMesh.add(leftEye, rightEye);

const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
const helmetDome = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  helmetMaterial,
);
const helmetBrim = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.78, 0.06, 16),
  helmetMaterial,
);
const helmetGroup = new THREE.Group();
helmetGroup.add(helmetDome, helmetBrim);
helmetGroup.position.y = 0.95;
opponentMesh.add(helmetGroup);

let projectiles = [];

function spawnProjectile(owner, x, z, angle) {
  projectiles.push(new Projectile(scene, x, z, angle, owner));
}

let state = 'idle'; // 'idle' | 'playing' | 'ended'

function resetGame() {
  player.reset();
  opponent.reset();
  for (const p of projectiles) p.dispose(scene);
  projectiles = [];
  opponentFlashTimer = 0;
  opponentBodyMaterial.emissive.setHex(OPPONENT_BASE_EMISSIVE);
  hideBanter();
  updateHealth(player.health, PLAYER_MAX_HEALTH, opponent.health, OPPONENT_MAX_HEALTH);
}

onStart(() => {
  state = 'playing';
});

onRestart(() => {
  resetGame();
  state = 'playing';
});

resetGame();

function endGame(didPlayerWin) {
  state = 'ended';
  if (!didPlayerWin) showBanter(randomBanter('ON_WIN'));
  showEndOverlay(didPlayerWin);
}

function updatePlaying(dt) {
  player.update(dt);
  if (isDown('Space') && player.canFire()) {
    player.fire();
    spawnProjectile('player', player.x, player.z, player.facingAngle);
  }

  const shot = opponent.update(dt, player.x, player.z);
  if (shot) {
    spawnProjectile('opponent', opponent.x, opponent.z, shot.angle);
  }

  for (const p of projectiles) {
    p.update(dt);
    if (p.owner === 'player' && p.alive && p.hits(opponent.x, opponent.z, OPPONENT_RADIUS)) {
      opponent.takeDamage(1);
      opponentFlashTimer = OPPONENT_FLASH_DURATION;
      if (opponent.alive) showBanter(randomBanter('ON_TAKE_DAMAGE'));
      p.alive = false;
    } else if (p.owner === 'opponent' && p.alive && p.hits(player.x, player.z, PLAYER_RADIUS)) {
      player.takeDamage(1);
      flashPlayerDamage();
      if (player.alive) showBanter(randomBanter('ON_HIT_PLAYER'));
      p.alive = false;
    }
  }

  const stillAlive = [];
  for (const p of projectiles) {
    if (p.alive) {
      stillAlive.push(p);
    } else {
      p.dispose(scene);
    }
  }
  projectiles = stillAlive;

  opponentMesh.position.x = opponent.x;
  opponentMesh.position.z = opponent.z;
  opponentMesh.rotation.y = opponent.facingAngle;
  opponentMesh.visible = opponent.alive;

  if (opponentFlashTimer > 0) {
    opponentFlashTimer -= dt;
    opponentBodyMaterial.emissive.setHex(OPPONENT_FLASH_EMISSIVE);
  } else {
    opponentBodyMaterial.emissive.setHex(OPPONENT_BASE_EMISSIVE);
  }

  camera.position.set(player.x, EYE_HEIGHT, player.z);
  camera.rotation.y = player.facingAngle;

  updateHealth(player.health, PLAYER_MAX_HEALTH, opponent.health, OPPONENT_MAX_HEALTH);

  if (!player.alive) {
    endGame(false);
  } else if (!opponent.alive) {
    endGame(true);
  }
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (state === 'playing') {
    updatePlaying(dt);
  }

  renderer.render(scene, camera);
}

animate();
