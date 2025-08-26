// src/scenes/BootScene.js
import Phaser from "phaser";
import { loadWebFonts } from "../utils/loadFonts";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // load images/sprites/audio if you want
  }

  async create() {
    // Ensure web fonts are ready before any text scenes render
    await loadWebFonts();

    // Start the persistent UI scene (top-right Restart button)
    this.scene.launch("UIScene");
    // Hide the button on the title screen
    this.game.events.emit("ui:hideRestart");

    // Go to the title
    this.scene.start("TitleScene");
  }
}
