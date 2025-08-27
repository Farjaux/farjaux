// src/scenes/Scene1_Club.js
import Phaser from "phaser";
import Player from "../objects/Player.js";
import CollectibleStar from "../objects/CollectibleStar.js";
import { JumpBoots } from "../objects/Powerups.js";
import EnemySelenite from "../objects/EnemySelenite.js";
import { FONTS } from "../config/typography"; // ← shared retro styles

export default class Scene1_Club extends Phaser.Scene {
  constructor() {
    super("Scene1_Club");
    this.player = null;
    this.cursors = null;
    this.door = null;
    this.exiting = false;
    this.enemies = null;
  }

  create() {
    this.game.events.emit("ui:showRestart");
    const { width, height } = this.scale;

    const worldWidth = width * 3;
    const worldHeight = height;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBackgroundColor("#0a0a12");
    this._makeParallaxLayers(worldWidth, height);

    // Platforms
    const platforms = this.physics.add.staticGroup();
    platforms
      .create(worldWidth / 2, height - 20, "ground")
      .setDisplaySize(worldWidth, 40)
      .refreshBody();
    platforms
      .create(width * 0.5, height - 120, "ledge")
      .setDisplaySize(160, 20)
      .refreshBody();
    platforms
      .create(width * 0.8, height - 140, "ledge2")
      .setDisplaySize(180, 20)
      .refreshBody();
    platforms
      .create(width * 1.1, height - 160, "ledge3")
      .setDisplaySize(140, 20)
      .refreshBody();
    platforms
      .create(width * 1.4, height - 180, "ledge4")
      .setDisplaySize(140, 20)
      .refreshBody();
    platforms
      .create(width * 1.8, height - 200, "ledge5")
      .setDisplaySize(140, 20)
      .refreshBody();
    platforms
      .create(width * 2.2, height - 260, "ledge6")
      .setDisplaySize(140, 20)
      .refreshBody();
    this._paintStaticBodies(platforms);

    // Player
    this.player = new Player(this, 80, height - 80);
    this.physics.add.collider(this.player, platforms);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // === HUD ===
    this.add
      .text(16, 16, "Scene 1: The Club", {
        ...FONTS.body,
        fontSize: "20px",
        color: "#ffffff",
      })
      .setScrollFactor(1)
      .setDepth(1000);

    // Collectible star (on the highest platform)
    const topLedge = platforms
      .getChildren()
      .sort((a, b) => a.body.y - b.body.y)[0];
    const star = new CollectibleStar(
      this,
      topLedge.body.x + topLedge.body.width / 2,
      topLedge.body.y - 12
    );
    // NOTE: no custom onPickup needed; CollectibleStar defaults to flash "+100"
    star.enablePickup(this, this.player);

    // Powerup: Jump Boots on second ledge
    // (JumpBoots now shows "JUMP BOOST!" via Powerups.js and applies player.grantJumpBoost)
    const boots = new JumpBoots(this, width * 1.3, height - 220 - 26);
    boots.enablePickup(this, this.player);

    // Enemies
    this.enemies = this.add.group();
    const s1 = new EnemySelenite(this, 360, height - 60, {
      minX: 260,
      maxX: 520,
      speed: 55,
    });
    const s2 = new EnemySelenite(this, width * 1.3, height - 220 - 12, {
      minX: width * 1.1,
      maxX: width * 1.45,
      speed: 70,
    });
    const s3 = new EnemySelenite(this, worldWidth - 200, height - 60, {
      minX: worldWidth - 320,
      maxX: worldWidth - 80,
      speed: 60,
    });
    this.enemies.addMultiple([s1, s2, s3]);
    this.enemies
      .getChildren()
      .forEach((e) => this.physics.add.collider(e, platforms));

    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.dead) return;
      if (!this.player.invincible) {
        const dir = this.player.x < enemy.x ? -1 : 1;
        this.player.body.setVelocity(dir * -220, -220);
        this._flashHit();
        this.player.grantInvincibility(1000);
      }
    });

    // Exit door
    this.door = this.add.rectangle(
      worldWidth - 40,
      height - 60,
      24,
      80,
      0x00ff00,
      0
    );
    this.physics.add.existing(this.door, true);

    const dbg = this.add.graphics();
    dbg.lineStyle(2, 0x6ee7b7, 1).strokeRectShape(this.door.getBounds());

    // EXIT label in retro font
    this.add.text(worldWidth - 100, height - 110, "EXIT ➜", {
      ...FONTS.subheading,
      fontSize: "14px",
      color: "#a7f3d0",
    });

    this.physics.add.overlap(this.player, this.door, () => {
      if (this.exiting) return;
      this.exiting = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => this.scene.start("Scene2_Foundry")
      );
    });
  }

  update() {
    if (this.player) this.player.update(this.cursors);
    this.enemies?.getChildren().forEach((e) => e.patrolUpdate(this.player));
  }

  _paintStaticBodies(staticGroup) {
    const g = this.add.graphics();
    g.fillStyle(0x2e2e3a, 1);
    staticGroup.getChildren().forEach((obj) => {
      const b = obj.body;
      g.fillRoundedRect(b.x, b.y, b.width, b.height, 6);
    });
  }

  // (Kept for now; no longer used for star or jump boots)
  _flash(text) {
    const { width } = this.scale;
    const msg = this.add
      .text(width / 2, 80, text, {
        ...FONTS.subheading,
        fontSize: "18px",
        color: "#ffe9b0",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) // ← pin to camera
      .setDepth(1000);
    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 900,
      ease: "Sine.easeOut",
      onComplete: () => msg.destroy(),
    });
    this.cameras.main.flash(120, 255, 255, 255);
  }

  _flashHit() {
    const fx = this.add
      .rectangle(this.player.x, this.player.y, 40, 50, 0xff0000, 0.25)
      .setOrigin(0.5);
    fx.setDepth(1000);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      duration: 180,
      onComplete: () => fx.destroy(),
    });
  }

  _makeParallaxLayers(worldWidth, height) {
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0c0f1a, 0x0c0f1a, 0x111826, 0x111826, 1);
    sky.fillRect(0, 0, worldWidth, height);
    sky.setScrollFactor(0.1, 0).setDepth(-100);

    const far = this.add.graphics();
    far.fillStyle(0xffffff, 0.5);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * worldWidth;
      const y = Math.random() * (height * 0.6);
      const r = Math.random() * 1.2 + 0.3;
      far.fillCircle(x, y, r);
    }
    far.setScrollFactor(0.2, 0).setDepth(-90);

    const mid = this.add.graphics();
    mid.fillStyle(0x1c1d26, 1);
    const blockW = 140;
    for (let x = 0; x < worldWidth + blockW; x += blockW) {
      const h = height * (0.25 + Math.random() * 0.15);
      mid.fillRect(x, height - 40 - h, blockW - 12, h);
      if (Math.random() < 0.5)
        mid.fillRect(x + 18, height - 40 - h - 18, 6, 18);
    }
    mid.setScrollFactor(0.5, 0).setDepth(-80);

    const near = this.add.graphics();
    near.fillStyle(0x242633, 1);
    const y = height - 80;
    for (let x = 0; x < worldWidth; x += 60) {
      near.fillRect(x, y, 48, 6);
    }
    near.setScrollFactor(0.75, 0).setDepth(-70);
  }
}
