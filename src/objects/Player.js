// src/objects/Player.js
import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    super(scene, x, y);

    // Body/appearance (white rectangle placeholder)
    this.bodyWidth = 28;
    this.bodyHeight = 40;

    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-this.bodyWidth / 2, -this.bodyHeight / 2, this.bodyWidth, this.bodyHeight, 4);
    this.add(g);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    /** @type {Phaser.Physics.Arcade.Body} */
    this.body = this.body;
    this.body.setSize(this.bodyWidth, this.bodyHeight).setOffset(-this.bodyWidth / 2, -this.bodyHeight / 2);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);
    this.body.setGravityY(700);

    // Tunables
    this.speed = 180;
    this.jumpVelocity = -360;

    // Status flags
    this.invincible = false;
  }

  /**
   * Call from your scene's update().
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors
   */
  update(cursors) {
    if (!cursors) return;
    const body = this.body;

    // Horizontal
    if (cursors.left.isDown) {
      body.setVelocityX(-this.speed);
      this.setScale(-1, 1); // fake flip
    } else if (cursors.right.isDown) {
      body.setVelocityX(this.speed);
      this.setScale(1, 1);
    } else {
      body.setVelocityX(0);
    }

    // Jump (only if on floor)
    if ((cursors.up.isDown || cursors.space.isDown) && body.blocked.down) {
      body.setVelocityY(this.jumpVelocity);
    }
  }

  // Convenience helpers for powerups
  boostJump(multiplier = 1.35, ms = 6000) {
    const original = this.jumpVelocity;
    this.jumpVelocity = original * multiplier;
    this.scene.time.delayedCall(ms, () => (this.jumpVelocity = original));
    this._flashTint(0x9ae6b4);
  }

  grantInvincibility(ms = 4000) {
    if (this.invincible) return;
    this.invincible = true;
    this._blink(ms, () => (this.invincible = false));
  }

  _blink(ms, done) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      yoyo: true,
      repeat: Math.floor(ms / 120),
      duration: 60,
      onComplete: () => {
        this.setAlpha(1);
        done && done();
      }
    });
  }

  _flashTint(color) {
    const fx = this.scene.add.rectangle(this.x, this.y, this.bodyWidth + 8, this.bodyHeight + 8, color, 0.25).setOrigin(0.5);
    fx.setDepth(1000);
    this.scene.tweens.add({ targets: fx, alpha: 0, duration: 220, onComplete: () => fx.destroy() });
  }
}
