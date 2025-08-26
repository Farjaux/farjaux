// src/objects/Powerups.js
import Phaser from "phaser";

class BasePowerup extends Phaser.GameObjects.Ellipse {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} color
   * @param {(player:any)=>void} applyFn
   */
  constructor(scene, x, y, color, applyFn) {
    super(scene, x, y, 18, 18, color, 1);
    this.applyFn = applyFn;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    /** @type {Phaser.Physics.Arcade.Body} */
    this.body = this.body;
    this.body.setAllowGravity(false).setImmovable(true);

    // gentle bobbing
    scene.tweens.add({
      targets: this,
      y: this.y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  enablePickup(scene, player) {
    scene.physics.add.overlap(player, this, () => {
      this.applyFn(player);
      // pop + remove
      scene.tweens.add({
        targets: this,
        scale: 1.4,
        alpha: 0,
        duration: 180,
        onComplete: () => this.destroy(),
      });
    });
  }
}

export class JumpBoots extends BasePowerup {
  constructor(scene, x, y, ms = 1000) {
    super(scene, x, y, 0x60ffa8, (player) => player.boostJump(1.2, ms));
  }
}

export class Invincibility extends BasePowerup {
  constructor(scene, x, y, ms = 4000) {
    super(scene, x, y, 0xffe066, (player) => player.grantInvincibility(ms));
  }
}
