// src/objects/CollectibleStar.js
import Phaser from 'phaser';

export default class CollectibleStar extends Phaser.GameObjects.Star {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {{ inner?:number, outer?:number, color?:number, onPickup?:(player)=>void }} [opts]
   */
  constructor(scene, x, y, opts = {}) {
    const inner = opts.inner ?? 6;
    const outer = opts.outer ?? 12;
    super(scene, x, y, 5, inner, outer, opts.color ?? 0xfff1a8);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    /** @type {Phaser.Physics.Arcade.Body} */
    this.body = this.body;
    this.body.setAllowGravity(false).setImmovable(true);
    this.picked = false;

    // Cute twinkle
    scene.tweens.add({ targets: this, angle: 360, duration: 3000, repeat: -1, ease: 'Linear' });

    this.onPickup = opts.onPickup ?? (() => {});
  }

  enablePickup(scene, player) {
    scene.physics.add.overlap(player, this, () => {
      if (this.picked) return;
      this.picked = true;

      // simple pop
      scene.tweens.add({
        targets: this,
        scale: 1.6,
        alpha: 0,
        duration: 180,
        onComplete: () => this.destroy()
      });

      this.onPickup(player);
    });
  }
}
