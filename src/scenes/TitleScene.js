// src/scenes/TitleScene.js
import Phaser from "phaser";
import { FONTS } from "../config/typography";

export default class TitleScene extends Phaser.Scene {
  constructor() { super("TitleScene"); }

  create() {
    const { width, height } = this.scale;

    // Hide the persistent Restart button on the title
    this.game.events.emit("ui:hideRestart");

    this.add.text(width / 2, height / 2 - 10, "A Trip to the Moon", {
      ...FONTS.heading, align: "center",
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 40, "Click to begin: Scene 1 — The Club", {
      ...FONTS.subheading, align: "center",
    }).setOrigin(0.5);

    // Start on click or Enter/Space
    const start = () => this.scene.start("Scene1_Club");
    this.input.once("pointerdown", start);
    this.input.keyboard.once("keydown-ENTER", start);
    this.input.keyboard.once("keydown-SPACE", start);
  }
}
