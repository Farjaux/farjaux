export const FONTS = {
  heading: {
    fontFamily: '"Press Start 2P", system-ui, sans-serif',
    fontSize: '36px',
    color: '#FFFFFF'
  },
  subheading: {
    fontFamily: '"Press Start 2P", system-ui, sans-serif',
    fontSize: '16px',
    color: '#CCCCCC'
  },
  body: {
    fontFamily: '"VT323", monospace',
    fontSize: '20px',
    color: '#E6E6E6'
  }
};

// Optional helper to scale font sizes based on width/height if you want responsiveness.
export function scaleFont(basePx, scale = 1) {
  return Math.round(basePx * scale) + 'px';
}
