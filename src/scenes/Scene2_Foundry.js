// src/scenes/Scene2_Foundry.js
import Phaser from "phaser";
import Player from "../objects/Player.js";
import CollectibleStar from "../objects/CollectibleStar.js";
import { JumpBoots, Invincibility } from "../objects/Powerups.js";
import EnemySelenite from "../objects/EnemySelenite.js";
import { FONTS } from "../config/typography"; // ← shared retro styles

export default class Scene2_Foundry extends Phaser.Scene {
  constructor() {
    super("Scene2_Foundry");
    this.player = null;
    this.cursors = null;
    this.enemies = null;
  }

  create() {
    this.game.events.emit("ui:showRestart");
    const { width, height } = this.scale;

    // World & camera (keep viewport-sized for this scene)
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setBackgroundColor("#0f0b0a"); // warmer, foundry vibe

    // Background plates (simple layered graphics)
    this._makeFoundryBackground(width, height);

    // --- Static platforms ---
    const platforms = this.physics.add.staticGroup();

    // Ground
    platforms
      .create(width / 2, height - 20, "ground")
      .setDisplaySize(width, 40)
      .refreshBody();

    // Foundry catwalks
    platforms
      .create(width * 0.2, height - 110, "ledge")
      .setDisplaySize(140, 18)
      .refreshBody();
    platforms
      .create(width * 0.5, height - 160, "ledge")
      .setDisplaySize(180, 18)
      .refreshBody();
    platforms
      .create(width * 0.8, height - 190, "ledge")
      .setDisplaySize(160, 18)
      .refreshBody();

    // Paint bodies
    this._paintStaticBodies(platforms, 0x3a2e2e);

    // --- Player (reusable object) ---
    this.player = new Player(this, 40, height - 80);
    this.physics.add.collider(this.player, platforms);

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // HUD (pinned)
    this.add
      .text(16, 16, "Scene 2: The Foundry", {
        ...FONTS.body,
        fontSize: "20px",
        color: "#ffffff",
      })
      .setScrollFactor(1);

    // --- Collectibles & Powerups ---
    // Star on the highest catwalk
    const ledgesSorted = platforms
      .getChildren()
      .sort((a, b) => a.body.y - b.body.y);
    const topLedge = ledgesSorted[0];
    const star = new CollectibleStar(
      this,
      topLedge.body.x + topLedge.body.width / 2,
      topLedge.body.y - 12
    );
    star.onPickup = () => this._flash("★ +100");
    star.enablePickup(this, this.player);

    // Jump Boots on middle ledge
    const boots = new JumpBoots(this, width * 0.5 + 40, height - 220 - 22);
    boots.enablePickup(this, this.player);

    // Invincibility on left ledge
    const inv = new Invincibility(this, width * 0.2, height - 140 - 22);
    inv.enablePickup(this, this.player);

    // --- Enemies (reusable Selenites) ---
    this.enemies = this.add.group();

    // Ground patrol
    const e1 = new EnemySelenite(this, width * 0.35, height - 60, {
      minX: width * 0.2,
      maxX: width * 0.45,
      speed: 55,
    });
    // Catwalk patrols
    const e2 = new EnemySelenite(this, width * 0.5, height - 220 - 12, {
      minX: width * 0.42,
      maxX: width * 0.66,
      speed: 65,
    });
    const e3 = new EnemySelenite(this, width * 0.8, height - 300 - 12, {
      minX: width * 0.72,
      maxX: width * 0.9,
      speed: 60,
    });

    this.enemies.addMultiple([e1, e2, e3]);
    this.enemies
      .getChildren()
      .forEach((e) => this.physics.add.collider(e, platforms));

    // Player vs enemies overlap (stomp handled in patrolUpdate; side hit = knockback + i-frames)
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.dead) return;
      if (!this.player.invincible) {
        const dir = this.player.x < enemy.x ? -1 : 1;
        this.player.body.setVelocity(dir * -220, -220);
        this._flashHit();
        this.player.grantInvincibility(1000);
      }
    });

    // Dev convenience: back to Title
    this.input.keyboard.once("keydown-B", () => this.scene.start("TitleScene"));
  }

  update() {
    if (this.player) this.player.update(this.cursors);
    this.enemies?.getChildren().forEach((e) => e.patrolUpdate(this.player));
  }

  // ---------- Helpers ----------
  _paintStaticBodies(staticGroup, color = 0x2e2e3a) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    staticGroup.getChildren().forEach((obj) => {
      const b = obj.body;
      g.fillRoundedRect(b.x, b.y, b.width, b.height, 6);
    });
  }

  _makeFoundryBackground(width, height) {
    // Back wall glow
    const back = this.add.graphics();
    back.fillGradientStyle(0x140e0b, 0x140e0b, 0x1e1410, 0x1e1410, 1);
    back.fillRect(0, 0, width, height);
    back.setDepth(-100);

    // Pipes/silhouettes
    const mid = this.add.graphics();
    mid.lineStyle(4, 0x2a1f1a, 1);
    for (let x = 20; x < width; x += 80) {
      mid.strokeLineShape(new Phaser.Geom.Line(x, height - 60, x, 60));
      mid.strokeRect(x + 10, 80, 40, 16);
    }
    mid.setDepth(-90);

    // Foreground rails
    const near = this.add.graphics();
    near.fillStyle(0x2b2320, 1);
    near.fillRect(0, height - 90, width, 6);
    near.fillRect(0, height - 120, width, 4);
    near.setDepth(-80);
  }

  _flash(text) {
    const { width } = this.scale;
    const msg = this.add
      .text(width / 2, 80, text, {
        ...FONTS.subheading,
        fontSize: "18px",
        color: "#ffe9b0",
      })
      .setOrigin(0.5);
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
}
