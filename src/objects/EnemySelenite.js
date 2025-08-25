// src/objects/EnemySelenite.js
import Phaser from 'phaser';

/**
 * A simple patrolling enemy:
 * - Walks between minX and maxX at a set speed.
 * - Flips direction on walls/edges.
 * - Can be "stomped" if player is falling onto it -> enemy dies, player bounces.
 * - Otherwise damages/knockbacks the player (you handle health in the scene).
 */
export default class EnemySelenite extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {{ minX:number, maxX:number, speed?:number }} patrol
   */
  constructor(scene, x, y, patrol) {
    super(scene, x, y);

    this.minX = patrol.minX ?? x - 60;
    this.maxX = patrol.maxX ?? x + 60;
    this.speed = patrol.speed ?? 60;
    this.direction = 1; // 1 -> right, -1 -> left
    this.dead = false;

    // --- Body/appearance (triangle "moon-creature") ---
    const g = scene.add.graphics();
    g.fillStyle(0xf0e6c8, 1);
    // draw a triangle-ish shape
    g.fillTriangle(-12, 16, 12, 16, 0, -12);
    g.lineStyle(2, 0x3b2f2f, 1);
    g.strokeTriangle(-12, 16, 12, 16, 0, -12);

    // little eye
    g.fillStyle(0x1b1b1b, 1);
    g.fillCircle(0, 0, 2.5);

    this.add(g);
    scene.add.existing(this);

    // --- Physics body ---
    scene.physics.add.existing(this);
    /** @type {Phaser.Physics.Arcade.Body} */
    this.body = this.body;
    this.body.setSize(24, 28).setOffset(-12, -14);
    this.body.setAllowGravity(true);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);
    this.body.setMaxVelocity(this.speed, 600);

    // Start moving right
    this.body.setVelocityX(this.speed);

    // For stomp logic
    this.stompThreshold = 60; // how fast player must be falling to count as stomp
  }

  /**
   * Call every update tick.
   * @param {Phaser.GameObjects.GameObject} player
   */
  patrolUpdate(player) {
    if (this.dead) return;

    // Patrol between minX and maxX
    if (this.x <= this.minX && this.direction < 0) {
      this.direction = 1;
      this.body.setVelocityX(this.speed);
    } else if (this.x >= this.maxX && this.direction > 0) {
      this.direction = -1;
      this.body.setVelocityX(-this.speed);
    }

    // Flip visually based on direction
    this.setScale(this.direction, 1);

    // Optional: if blocked by a wall, flip direction
    if (this.body.blocked.left) {
      this.direction = 1;
      this.body.setVelocityX(this.speed);
    } else if (this.body.blocked.right) {
      this.direction = -1;
      this.body.setVelocityX(-this.speed);
    }

    // Stomp check (manual): if player is falling and above our top, count as stomp
    if (player && player.body) {
      const pBody = player.body;
      const isFalling = pBody.velocity.y > this.stompThreshold;
      const playerAbove = pBody.bottom <= this.body.y + 4; // top-ish

      if (isFalling && playerAbove && Phaser.Geom.Intersects.RectangleToRectangle(pBody, this.body)) {
        this.killByStomp(player);
      }
    }
  }

  killByStomp(player) {
    if (this.dead) return;
    this.dead = true;

    // Tiny squash animation then destroy
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      alpha: 0.2,
      duration: 150,
      ease: 'Quad.easeOut',
      onComplete: () => this.destroy()
    });

    // Bounce player upward a bit
    if (player && player.body) {
      player.body.setVelocityY(-300);
    }
  }

  /**
   * Called from overlap/collider when enemy hits the player not by stomp.
   * Return true if damage should be applied.
   */
  hitsPlayer(player) {
    if (this.dead) return false;
    // If player is coming from side or below, it's a hit.
    return true;
  }
}
