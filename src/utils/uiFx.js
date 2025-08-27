// src/utils/uiFx.js
export function flash(scene, text, opts = {}) {
  const {
    camFlash = true,
    y = 80,
    fontSize = 32,          // bigger default so change is obvious
    scale = 1,              // optional extra scale
    color = "#ffe9b0",
    stroke = "#000",
    strokeThickness = 4,
    duration = 900,
    depth = 1000,
  } = opts;

  const { width } = scene.scale;

  const msg = scene.add
    .text(width / 2, y, text, {
      fontFamily: '"Press Start 2P", monospace', // ← quoted + fallback
      fontSize: `${fontSize}px`,
      color,
      stroke,
      strokeThickness,
      align: "center",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(depth);

  // Enforce after creation (Phaser re-measures once set)
  msg.setFontFamily('"Press Start 2P", monospace');
  msg.setFontSize(fontSize);
  if (scale !== 1) msg.setScale(scale);

  scene.tweens.add({
    targets: msg,
    alpha: 0,
    duration,
    ease: "Sine.easeOut",
    onComplete: () => msg.destroy(),
  });

  if (camFlash) scene.cameras.main.flash(120, 255, 255, 255);
}

export function hitFlash(scene, x, y, w = 40, h = 50, color = 0xff0000) {
  const fx = scene.add.rectangle(x, y, w, h, color, 0.25).setOrigin(0.5);
  fx.setDepth(1000);
  scene.tweens.add({
    targets: fx,
    alpha: 0,
    duration: 180,
    onComplete: () => fx.destroy(),
  });
}
