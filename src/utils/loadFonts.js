// Ensures web fonts are available to the canvas before text is created
export async function loadWebFonts() {
  if (!document.fonts || !document.fonts.load) return; // older browsers fallback

  const requests = [
    document.fonts.load('16px "Press Start 2P"'),
    document.fonts.load('16px "VT323"'),
  ];

  try {
    await Promise.all(requests);
    await document.fonts.ready;
  } catch (e) {
    // Fail silently; Phaser will just use a fallback font
    console.warn('Web fonts may not have loaded in time:', e);
  }
}
