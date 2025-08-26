import Phaser from "phaser";
import phaserConfig from "./config/phaserConfig";

// --- 8-bit coin sound (no asset needed) ---
let audioCtx;
function playCoinSound() {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    // Square waves for retro timbre
    o1.type = "square";
    o2.type = "square";

    // Classic coin pitch sweep
    o1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    o1.frequency.exponentialRampToValueAtTime(
      1760,
      audioCtx.currentTime + 0.08
    );

    o2.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 (an octave below)
    o2.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);

    // Quick plucky envelope
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

    o1.connect(g);
    o2.connect(g);
    g.connect(audioCtx.destination);
    o1.start();
    o2.start();
    o1.stop(audioCtx.currentTime + 0.2);
    o2.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    // fail silently if AudioContext unavailable
  }
}

// --- Boot the game only after Start ---
const boot = () => new Phaser.Game(phaserConfig);

// If user started before module loaded, boot immediately
if (document.body.classList.contains("started")) {
  playCoinSound();
  boot();
} else {
  window.addEventListener(
    "farjaux:start",
    () => {
      playCoinSound(); // plays on user gesture -> safe for autoplay policies
      boot();
    },
    { once: true }
  );
}
