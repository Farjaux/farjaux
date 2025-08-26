// src/scenes/UIScene.js
import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
    this.btn = null;
    this.btnW = 128;
    this.btnH = 36;
  }

  create() {
    // Keep UI above other scenes and route pointer to top-most objects
    this.scene.bringToTop();
    this.input.setTopOnly(true);

    // ---- Restart button (top-right, pinned to camera) ----
    this.btn = this.add.container(0, 0).setScrollFactor(0).setDepth(10000);

    const bg = this.add
      .rectangle(0, 0, this.btnW, this.btnH, 0x0a0a0a, 0.9)
      .setStrokeStyle(2, 0x1a1a1a)
      .setInteractive({ useHandCursor: true }); // ← one interactive is enough

    const label = this.add
      .text(0, 0, "RESTART", {
        fontFamily: '"Press Start 2P", system-ui, sans-serif',
        fontSize: "12px",
        color: "#00ffb9",
      })
      .setOrigin(0.5);

    this.btn.add([bg, label]);

    // Hover/press feedback
    bg.on("pointerover", () => bg.setFillStyle(0x0f0f0f, 1));
    bg.on("pointerout", () => bg.setFillStyle(0x0a0a0a, 0.9));
    bg.on("pointerdown", () =>
      this.tweens.add({
        targets: this.btn,
        scale: 0.98,
        duration: 80,
        yoyo: true,
      })
    );
    // Start gameplay fresh at Scene1_Club
    bg.on("pointerup", () => this.restartTo("TitleScene"));

    // Initial layout + on resize
    this.layout();
    this.scale.on("resize", this.layout, this);

    // Show/hide controls via game-wide events
    this.game.events.on("ui:showRestart", this.showRestart, this);
    this.game.events.on("ui:hideRestart", this.hideRestart, this);

    // Hidden by default (TitleScene should hide it)
    this.hideRestart();
  }

  layout() {
    const pad = 12;
    const { width } = this.scale;
    // Position container so its center sits at the padded corner
    this.btn.setPosition(width - pad - this.btnW / 2, pad + this.btnH / 2);
  }

  showRestart() {
    this.btn.setVisible(true).setActive(true);
    this.scene.bringToTop(); // ensure UI is above whichever scene just started
  }

  hideRestart() {
    this.btn.setVisible(false).setActive(false);
  }

restartTo(sceneKey) {
  const mgr = this.game.scene;                 // SceneManager (not ScenePlugin)
  const isTitle = sceneKey === "TitleScene";   // <-- define it first

  const getActiveScenes = () => {
    if (typeof mgr.getScenes === "function") return mgr.getScenes(true);
    return mgr.scenes.filter(s =>
      s.sys.isActive ? s.sys.isActive() : s.sys.settings.status === Phaser.Scenes.RUNNING
    );
  };

  const getSceneByKey = (key) => {
    if (typeof mgr.getScene === "function") return mgr.getScene(key);
    return mgr.scenes.find(s => s.sys.settings.key === key);
  };

  const target = getSceneByKey(sceneKey);
  const targetIsActive = !!(target &&
    (target.sys.isActive ? target.sys.isActive() : target.sys.settings.status === Phaser.Scenes.RUNNING));

  if (targetIsActive) {
    // Already there → just restart
    target.scene.restart();
    if (isTitle) this.hideRestart(); else { this.showRestart(); this.scene.bringToTop(); }
    return;
  }

  // Stop all non-UI scenes
  getActiveScenes().forEach(s => {
    const key = s.sys.settings.key;
    if (key !== "UIScene") mgr.stop(key);
  });

  // Start target without killing the UI
  mgr.start(sceneKey);

  // Only show the button for non-title scenes
  if (isTitle) this.hideRestart(); else { this.showRestart(); this.scene.bringToTop(); }
}

}
