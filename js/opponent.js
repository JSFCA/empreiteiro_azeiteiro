import * as THREE from './vendor/three.module.js';
import { checkCollision, isLineBlocked } from './arena.js';

export const OPPONENT_RADIUS = 0.6;
export const MAX_HEALTH = 5;

const MOVE_SPEED = 5; // units/sec
const TURN_SPEED = 3.0; // radians/sec
const FIRE_COOLDOWN = 0.9; // seconds
const AIM_TOLERANCE = 0.12; // radians
const PATROL_DURATION = 1.6; // seconds spent moving before pausing to aim
const AIM_DURATION = 1.1; // seconds spent aiming/shooting before resuming patrol
const WAYPOINT_ARRIVAL_DIST = 0.5;

const WAYPOINTS = [
  { x: 14, z: 14 },
  { x: -14, z: 14 },
  { x: -14, z: -14 },
  { x: 14, z: -14 },
];

const UP_AXIS = new THREE.Vector3(0, 1, 0);

function angleTo(fromX, fromZ, toX, toZ) {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  return Math.atan2(-dx, -dz);
}

function normalizeAngle(angle) {
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class Opponent {
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
    this.alive = true;
    this.waypointIndex = 0;
    this.mode = 'patrol';
    this.modeTimer = 0;
    this.fireTimer = FIRE_COOLDOWN * 0.5;
  }

  getForward() {
    return new THREE.Vector3(0, 0, -1).applyAxisAngle(UP_AXIS, this.facingAngle);
  }

  // Returns { angle } if it fires a shot this frame, otherwise null.
  update(dt, playerX, playerZ) {
    if (!this.alive) return null;

    if (this.fireTimer > 0) this.fireTimer -= dt;
    this.modeTimer += dt;

    if (this.mode === 'patrol') {
      const wp = WAYPOINTS[this.waypointIndex];
      const dist = Math.hypot(wp.x - this.x, wp.z - this.z);

      if (dist < WAYPOINT_ARRIVAL_DIST) {
        this.waypointIndex = (this.waypointIndex + 1) % WAYPOINTS.length;
      } else {
        this.facingAngle = angleTo(this.x, this.z, wp.x, wp.z);
        const forward = this.getForward();
        const newX = this.x + forward.x * MOVE_SPEED * dt;
        const newZ = this.z + forward.z * MOVE_SPEED * dt;
        if (!checkCollision(newX, this.z, OPPONENT_RADIUS)) this.x = newX;
        if (!checkCollision(this.x, newZ, OPPONENT_RADIUS)) this.z = newZ;
      }

      if (this.modeTimer >= PATROL_DURATION) {
        this.mode = 'aim';
        this.modeTimer = 0;
      }
      return null;
    }

    // mode === 'aim': turn to face the player and take a shot when lined up.
    const targetAngle = angleTo(this.x, this.z, playerX, playerZ);
    const diff = normalizeAngle(targetAngle - this.facingAngle);
    const maxTurn = TURN_SPEED * dt;
    this.facingAngle += Math.abs(diff) <= maxTurn ? diff : Math.sign(diff) * maxTurn;

    let firedShot = null;
    const aimed = Math.abs(normalizeAngle(targetAngle - this.facingAngle)) < AIM_TOLERANCE;
    if (aimed && this.fireTimer <= 0 && !isLineBlocked(this.x, this.z, playerX, playerZ)) {
      this.fireTimer = FIRE_COOLDOWN;
      const inaccuracy = (Math.random() - 0.5) * 0.15;
      firedShot = { angle: this.facingAngle + inaccuracy };
    }

    if (this.modeTimer >= AIM_DURATION) {
      this.mode = 'patrol';
      this.modeTimer = 0;
    }

    return firedShot;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) this.alive = false;
  }
}
