import * as THREE from './vendor/three.module.js';
import { checkCollision } from './arena.js';

const SPEED = 22; // units/sec
const RADIUS = 0.15;
const MAX_LIFETIME = 2.5; // seconds
const SPAWN_HEIGHT = 1.4;

const geometry = new THREE.SphereGeometry(RADIUS, 8, 8);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x66ff99, emissive: 0x224422 });
const opponentMaterial = new THREE.MeshStandardMaterial({ color: 0xff6666, emissive: 0x442222 });

export class Projectile {
  constructor(scene, x, z, angle, owner) {
    this.owner = owner; // 'player' | 'opponent'
    this.x = x;
    this.z = z;
    this.velocityX = -Math.sin(angle) * SPEED;
    this.velocityZ = -Math.cos(angle) * SPEED;
    this.age = 0;
    this.alive = true;

    this.mesh = new THREE.Mesh(geometry, owner === 'player' ? playerMaterial : opponentMaterial);
    this.mesh.position.set(x, SPAWN_HEIGHT, z);
    scene.add(this.mesh);
  }

  update(dt) {
    this.x += this.velocityX * dt;
    this.z += this.velocityZ * dt;
    this.age += dt;
    this.mesh.position.x = this.x;
    this.mesh.position.z = this.z;

    if (this.age >= MAX_LIFETIME || checkCollision(this.x, this.z, RADIUS)) {
      this.alive = false;
    }
  }

  hits(targetX, targetZ, targetRadius) {
    const dx = this.x - targetX;
    const dz = this.z - targetZ;
    return Math.hypot(dx, dz) < targetRadius + RADIUS;
  }

  dispose(scene) {
    scene.remove(this.mesh);
  }
}
