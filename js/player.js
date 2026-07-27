import * as THREE from './vendor/three.module.js';
import { checkCollision } from './arena.js';
import { isDown } from './inputManager.js';

export const PLAYER_RADIUS = 0.6;
export const EYE_HEIGHT = 1.6;
export const MAX_HEALTH = 5;

const MOVE_SPEED = 8; // units/sec
const TURN_SPEED = 2.2; // radians/sec
const FIRE_COOLDOWN = 0.4; // seconds

const UP_AXIS = new THREE.Vector3(0, 1, 0);

export class Player {
  constructor(x, z) {
    this.startX = x;
    this.startZ = z;
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.z = this.startZ;
    this.facingAngle = 0;
    this.health = MAX_HEALTH;
    this.fireTimer = 0;
    this.alive = true;
  }

  getForward() {
    return new THREE.Vector3(0, 0, -1).applyAxisAngle(UP_AXIS, this.facingAngle);
  }

  update(dt) {
    if (!this.alive) return;

    if (isDown('ArrowLeft')) this.facingAngle += TURN_SPEED * dt;
    if (isDown('ArrowRight')) this.facingAngle -= TURN_SPEED * dt;

    let moveDir = 0;
    if (isDown('ArrowUp')) moveDir += 1;
    if (isDown('ArrowDown')) moveDir -= 1;

    if (moveDir !== 0) {
      const forward = this.getForward();
      const newX = this.x + forward.x * moveDir * MOVE_SPEED * dt;
      const newZ = this.z + forward.z * moveDir * MOVE_SPEED * dt;
      if (!checkCollision(newX, this.z, PLAYER_RADIUS)) this.x = newX;
      if (!checkCollision(this.x, newZ, PLAYER_RADIUS)) this.z = newZ;
    }

    if (this.fireTimer > 0) this.fireTimer -= dt;
  }

  canFire() {
    return this.alive && this.fireTimer <= 0;
  }

  fire() {
    this.fireTimer = FIRE_COOLDOWN;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
  }
}
