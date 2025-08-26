import Phaser from "phaser";
import BootScene from "../scenes/BootScene.js";
import PreloadScene from "../scenes/PreloadScene.js";
import TitleScene from "../scenes/TitleScene.js";
import Scene1_Club from "../scenes/Scene1_Club.js";
import Scene2_Foundry from "../scenes/Scene2_Foundry.js";

export default {
  type: Phaser.AUTO,
  // width: 800,
  // height: 600,
  parent: "game",
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT, // Fit inside the #game box
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960, // your base game width
    height: 540, // your base game height (16:9 here)
  },
  scene: [BootScene, PreloadScene, TitleScene, Scene1_Club, Scene2_Foundry],
};

// export default {
//   type: Phaser.AUTO,
//   parent: 'game',               // Mount inside #game
//   backgroundColor: '#000000',
//   scale: {
//     mode: Phaser.Scale.FIT,     // Fit inside the #game box
//     autoCenter: Phaser.Scale.CENTER_BOTH,
//     width: 960,                 // your base game width
//     height: 540                 // your base game height (16:9 here)
//   },
