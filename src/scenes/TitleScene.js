// src/scenes/TitleScene.js
import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 10, 'A Trip to the Moon', {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 40, 'Click to begin: Scene 1 — The Club', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#cccccc'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Scene1_Club'));
  }
}
