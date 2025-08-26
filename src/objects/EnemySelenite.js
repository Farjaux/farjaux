// src/objects/EnemySelenite.js
import Phaser from "phaser";

/**
 * Patrolling Selenite enemy inspired by Méliès:
 * - 2-frame walk cycle (chitinous arms swing)
 * - Single forward-facing eye (flipX controls facing)
 * - Works with existing patrol/stomp logic
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

    // Palette (tweak if you like)
    this.palette = {
      skin: "#b5d08a", // pale greenish skin
      shell: "#6c8d3e", // darker ribbed torso
      limb: "#3d5c2a", // limbs/outline
      eye: "#101010", // pupil
      highlight: "#dfeacc", // light rib highlight
    };

    // Build frames once
    this._ensureFrames(scene);

    // Sprite (16x18 logical pixels, scaled up)
    this.sprite = scene.add.sprite(0, 0, "selenite-frames", 0);
    this.sprite.setOrigin(0.5, 1); // feet at y=0 of container
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.sprite.setScale(3); // size on screen
    this.add(this.sprite);

    // Add to scene + physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    /** @type {Phaser.Physics.Arcade.Body} */
    this.body = this.body;

    // Physics body roughly matching the sprite footprint
    const bodyW = 24,
      bodyH = 28;
    this.body.setSize(bodyW, bodyH).setOffset(-bodyW / 2, -bodyH);
    this.body.setAllowGravity(true);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);
    this.body.setMaxVelocity(this.speed, 600);

    // Start moving right
    this.body.setVelocityX(this.speed);

    // For stomp logic
    this.stompThreshold = 60;

    // Animations
    this._ensureAnims(scene);
    this.sprite.anims.play("selenite-walk", true);
  }

  /**
   * Call every update tick.
   * @param {Phaser.GameObjects.GameObject & { body?: Phaser.Physics.Arcade.Body }} player
   */
  patrolUpdate(player) {
    if (this.dead) return;

    // Patrol bounds
    if (this.x <= this.minX && this.direction < 0) {
      this.direction = 1;
      this.body.setVelocityX(this.speed);
    } else if (this.x >= this.maxX && this.direction > 0) {
      this.direction = -1;
      this.body.setVelocityX(-this.speed);
    }

    // Face direction (controls which side the eye appears on)
    this.sprite.setFlipX(this.direction < 0);

    // Flip when hitting walls
    if (this.body.blocked.left) {
      this.direction = 1;
      this.body.setVelocityX(this.speed);
    } else if (this.body.blocked.right) {
      this.direction = -1;
      this.body.setVelocityX(-this.speed);
    }

    // Stomp detection (player falling & overlapping near top)
    if (player && player.body) {
      const pBody = player.body;
      const isFalling = pBody.velocity.y > this.stompThreshold;
      const playerAbove = pBody.bottom <= this.body.y + 4;

      if (
        isFalling &&
        playerAbove &&
        Phaser.Geom.Intersects.RectangleToRectangle(pBody, this.body)
      ) {
        this.killByStomp(player);
      }
    }
  }

  killByStomp(player) {
    if (this.dead) return;
    this.dead = true;

    // Squash/fade like a puff (quick Méliès "poof")
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.2,
      alpha: 0.2,
      duration: 150,
      ease: "Quad.easeOut",
      onComplete: () => this.destroy(),
    });

    // Bounce player
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
    return true;
  }

  // ---------- Frames & Anims ----------

  _ensureFrames(scene) {
    if (scene.textures.exists("selenite-frames")) return;

    const frameW = 16; // logical pixels
    const frameH = 18;
    const frames = 2; // walk A/B
    const key = "selenite-frames";

    const tex = scene.textures.createCanvas(key, frameW * frames, frameH);
    const ctx = tex.getContext();

    for (let i = 0; i < frames; i++) {
      ctx.clearRect(i * frameW, 0, frameW, frameH);
      this._drawSeleniteFrame(ctx, i * frameW, 0, frameW, frameH, i);
      // slice out each frame
      tex.add(i, 0, i * frameW, 0, frameW, frameH);
    }
    tex.refresh();
  }

  _ensureAnims(scene) {
    if (!scene.anims.exists("selenite-walk")) {
      scene.anims.create({
        key: "selenite-walk",
        frames: [
          { key: "selenite-frames", frame: 0 },
          { key: "selenite-frames", frame: 1 },
        ],
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  /**
   * Draw a tiny pixel Selenite:
   * - Crescent/rounded head
   * - Single forward-facing eye (drawn on right side; flipX mirrors it)
   * - Ribbed torso plates
   * - Spindly arms & legs that swing between frames
   */
  _drawSeleniteFrame(ctx, ox, oy, w, h, frameIndex) {
    const C = this.palette;
    const p = (x, y, ww, hh, col) => {
      ctx.fillStyle = col;
      ctx.fillRect(ox + x, oy + y, ww, hh);
    };

    // Head (rounded/crescent)
    p(6, 0, 4, 2, C.skin);
    p(5, 2, 6, 2, C.skin);

    // Eye on the RIGHT side (mirrors with flipX when facing left)
    p(8.3, 1, 1, 1, C.eye);

    // Neck
    p(7, 4, 2, 1, C.skin);

    // Ribbed torso shell
    p(4, 5, 8, 7, C.shell);
    // rib highlights
    p(5, 6, 6, 1, C.highlight);
    p(5, 8, 6, 1, C.highlight);
    p(5, 10, 6, 1, C.highlight);

    // Arms (swing between frames)
    if (frameIndex === 0) {
      // left forward, right back
      p(3, 6, 1, 4, C.limb);
      p(12, 7, 1, 3, C.limb);
    } else {
      // right forward, left back
      p(3, 7, 1, 3, C.limb);
      p(12, 6, 1, 4, C.limb);
    }

    // Pelvis
    p(6, 12, 4, 1, C.shell);

    // Legs (alternating)
    if (frameIndex === 0) {
      p(6, 13, 2, 4, C.limb); // left long
      p(8, 13, 2, 3, C.limb); // right short
    } else {
      p(6, 13, 2, 3, C.limb); // left short
      p(8, 13, 2, 4, C.limb); // right long
    }

    // Feet
    p(6, 17, 2, 1, C.limb);
    p(8, 17, 2, 1, C.limb);
  }
}
