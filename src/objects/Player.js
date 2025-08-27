// src/objects/Player.js
import Phaser from "phaser";

export default class Player extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    super(scene, x, y);

    // Appearance config (tweak colors to taste)
    this.palette = {
      skin: "#f2c29b",
      hat: "#d2b48c",
      coat: "#b22222",
      pants: "#1f1f1f",
      boots: "#5a3d2b",
      shirt: "#e6e6e6",
      eye: "#111111",
    };

    // Build pixel-art frames once per scene
    this._ensureFrames(scene);

    // Sprite inside container
    this.sprite = scene.add.sprite(0, 0, "farjaux-frames", 0);
    this.sprite.setOrigin(0.5, 1); // feet at y=0
    this.add(this.sprite);

    // Add to scene + physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    /** @type {Phaser.Physics.Arcade.Body} */
    this.body = /** @type {any} */ (this.body);
    // Match body to sprite footprint (about 28x40 like you had)
    this.bodyWidth = 28;
    this.bodyHeight = 40;

    this.body.setSize(this.bodyWidth, this.bodyHeight);
    // Anchor at feet: shift up by height so feet sit on y
    this.body.setOffset(-this.bodyWidth / 2, -this.bodyHeight);

    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);
    this.body.setGravityY(700);

    // Tunables
    this.speed = 180;

    // --- Jump system ---
    this.baseJumpVelocity = -360; // baseline jump impulse (negative = upward)
    this.jumpBoost = 1; // multiplier applied on each jump
    this._jumpBoostTimer = null;

    // Status flags
    this.invincible = false;

    // Animations
    this._ensureAnims(scene);
  }

  /**
   * Call from your scene's update().
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors
   */
  update(cursors) {
    if (!cursors) return;
    const body = /** @type {Phaser.Physics.Arcade.Body} */ (this.body);

    // Horizontal
    if (cursors.left.isDown) {
      body.setVelocityX(-this.speed);
      this.sprite.setFlipX(true); // face left
    } else if (cursors.right.isDown) {
      body.setVelocityX(this.speed);
      this.sprite.setFlipX(false); // face right
    } else {
      body.setVelocityX(0);
    }

    // Jump (only if on floor) — use JustDown to avoid multi-fire on same press
    const onGround = body.blocked.down || body.touching.down;
    const pressedJump =
      Phaser.Input.Keyboard.JustDown(cursors.up) ||
      Phaser.Input.Keyboard.JustDown(cursors.space);

    if (pressedJump && onGround) {
      body.setVelocityY(this.baseJumpVelocity * this.jumpBoost);
    }

    // Animation state
    const moving = Math.abs(body.velocity.x) > 5;

    if (!onGround) {
      this.sprite.anims.play("player-jump", true);
    } else if (moving) {
      this.sprite.anims.play("player-walk", true);
    } else {
      this.sprite.anims.play("player-idle", true);
    }
  }

  // ----- POWERUP HELPERS -----

  /**
   * Timed jump boost: increases jump impulse for `ms` milliseconds.
   * Does not change gravity or continuously push the player.
   */
  grantJumpBoost(multiplier = 1.35, ms = 5000) {
    // Set/refresh the boost
    this.jumpBoost = multiplier;

    if (this._jumpBoostTimer) this._jumpBoostTimer.remove(false);
    this._jumpBoostTimer = this.scene.time.addEvent({
      delay: ms,
      callback: () => {
        this.jumpBoost = 1;
        this._jumpBoostTimer = null;
      },
    });

    this._flashTint(0x9ae6b4);
    // UI popup now handled by Powerups/uiFx; no scene._flash call here.
  }

  /**
   * Back-compat alias (if anything still calls player.boostJump)
   */
  boostJump(multiplier = 1.35, ms = 5000) {
    this.grantJumpBoost(multiplier, ms);
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
      },
    });
  }

  _flashTint(color) {
    const fx = this.scene.add
      .rectangle(
        this.x,
        this.y - this.bodyHeight / 2,
        this.bodyWidth + 8,
        this.bodyHeight + 8,
        color,
        0.25
      )
      .setOrigin(0.5);
    fx.setDepth(1000);
    this.scene.tweens.add({
      targets: fx,
      alpha: 0,
      duration: 220,
      onComplete: () => fx.destroy(),
    });
  }

  // ----- SPRITE FRAMES / ANIMS -----

  _ensureFrames(scene) {
    if (scene.textures.exists("farjaux-frames")) return;

    const frameW = 16; // one frame width
    const frameH = 20; // one frame height
    const frames = 4;

    const key = "farjaux-frames";
    const canvasTex = scene.textures.createCanvas(key, frameW * frames, frameH);
    const ctx = canvasTex.getContext();

    for (let i = 0; i < frames; i++) {
      ctx.clearRect(i * frameW, 0, frameW, frameH);
      this._drawCharacterFrame(ctx, i * frameW, 0, frameW, frameH, i);
      canvasTex.add(i, 0, i * frameW, 0, frameW, frameH);
    }

    canvasTex.refresh();

    // no-op placeholder to mirror your original structure
    for (let i = 0; i < frames; i++) {
      scene.textures.addSpriteSheetFromAtlas ? null : null;
    }
  }

  _ensureAnims(scene) {
    const has = (k) => scene.anims.exists(k);

    if (!has("player-idle")) {
      scene.anims.create({
        key: "player-idle",
        frames: [{ key: "farjaux-frames", frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }

    if (!has("player-walk")) {
      scene.anims.create({
        key: "player-walk",
        frames: [
          { key: "farjaux-frames", frame: 1 },
          { key: "farjaux-frames", frame: 2 },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!has("player-jump")) {
      scene.anims.create({
        key: "player-jump",
        frames: [{ key: "farjaux-frames", frame: 3 }],
        frameRate: 1,
      });
    }

    // Scale up the tiny pixel art without smoothing
    this.sprite.setScale(3);
    this.sprite.setTexture("farjaux-frames", 0);
    this.sprite.setPipeline("TextureTintPipeline");
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  /**
   * Draws one pixel-art frame into the canvas.
   */
  _drawCharacterFrame(ctx, ox, oy, w, h, frameIndex) {
    const p = (x, y, cw, ch, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, cw, ch);
    };

    const C = this.palette;

    // --- Top Hat (3 rows)
    p(2, 2, 12, 1, C.hat);
    p(4, 0, 8, 2, C.hat);

    // --- Head
    p(5, 3, 6, 4, C.skin);
    p(9, 4, 1, 1, C.eye);

    // --- Shirt/Neck
    p(6, 7, 4, 1, C.shirt);

    // --- Coat (torso)
    p(4, 8, 8, 6, C.coat);
    p(5, 9, 1, 2, C.shirt);
    p(10, 9, 1, 2, C.shirt);

    // --- Arms
    if (frameIndex === 1) {
      p(3, 9, 1, 4, C.coat);
      p(12, 10, 1, 3, C.coat);
    } else if (frameIndex === 2) {
      p(3, 10, 1, 3, C.coat);
      p(12, 9, 1, 4, C.coat);
    } else {
      p(3, 9, 1, 4, C.coat);
      p(12, 9, 1, 4, C.coat);
    }

    // --- Pants
    p(5, 14, 6, 3, C.pants);

    // --- Legs
    if (frameIndex === 1) {
      p(5, 17, 2, 2, C.pants);
      p(9, 17, 2, 1, C.pants);
    } else if (frameIndex === 2) {
      p(5, 17, 2, 1, C.pants);
      p(9, 17, 2, 2, C.pants);
    } else if (frameIndex === 3) {
      p(6, 17, 4, 1, C.pants);
    } else {
      p(5, 17, 2, 2, C.pants);
      p(9, 17, 2, 2, C.pants);
    }

    // --- Boots
    if (frameIndex === 3) {
      p(6, 18, 4, 1, C.boots);
    } else {
      p(5, 19, 2, 1, C.boots);
      p(9, 19, 2, 1, C.boots);
    }
  }
}
