/*
  grid.js
  Canvas 2D background grid. Vanilla JS. Fixed 64px cell size.

  Colours come from the CSS tokens (--cor-linha-grade, --cor-fundo) read via
  getComputedStyle, so the grid always matches tokens.css. Redraws on resize
  with devicePixelRatio handling so lines stay crisp on retina displays.

  Phase 1 does not port the jessy "hold to open cell" interaction. Instead it
  exposes a small geometry API (cellSize, snap, intersections) so future
  content can align to the grid even though nothing consumes it yet.
*/

const SPACING = 64; // fixed grid cell size in CSS pixels

let canvas = null;
let ctx = null;
let cssWidth = 0;  // viewport width in CSS pixels
let cssHeight = 0; // viewport height in CSS pixels

/* Read a CSS custom property off the document root. */
function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Resize the canvas backing store to match the viewport and pixel ratio. */
function resize() {
  const dpr = window.devicePixelRatio || 1;
  cssWidth = window.innerWidth;
  cssHeight = window.innerHeight;

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  // Draw in CSS pixel units; the transform maps them to device pixels.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  draw();
}

/* Paint the faint grid. */
function draw() {
  if (!ctx) return;

  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const lineColor = token('--cor-linha-grade') || 'rgba(255,255,255,0.05)';

  ctx.lineWidth = 1;
  ctx.strokeStyle = lineColor;
  ctx.beginPath();

  // Vertical lines. The 0.5 offset keeps 1px lines crisp.
  for (let x = 0; x <= cssWidth; x += SPACING) {
    const px = Math.round(x) + 0.5;
    ctx.moveTo(px, 0);
    ctx.lineTo(px, cssHeight);
  }
  // Horizontal lines.
  for (let y = 0; y <= cssHeight; y += SPACING) {
    const py = Math.round(y) + 0.5;
    ctx.moveTo(0, py);
    ctx.lineTo(cssWidth, py);
  }

  ctx.stroke();
}

/* ---- Geometry API (queryable now, consumed by later phases) ---- */

/* Nearest grid intersection to a point, in CSS pixels. */
function snap(x, y) {
  return {
    x: Math.round(x / SPACING) * SPACING,
    y: Math.round(y / SPACING) * SPACING,
  };
}

/*
  All grid intersections currently on screen, as {x, y} points.
  Useful for future content that wants to anchor to the grid.
*/
function intersections() {
  const points = [];
  for (let x = 0; x <= cssWidth; x += SPACING) {
    for (let y = 0; y <= cssHeight; y += SPACING) {
      points.push({ x, y });
    }
  }
  return points;
}

const grid = {
  cellSize: SPACING,
  snap,
  intersections,
  redraw: draw,
  get size() {
    return { width: cssWidth, height: cssHeight };
  },
};

/* Initialise: find the canvas, wire resize, do the first paint. */
function init() {
  canvas = document.getElementById('grid-canvas');
  if (!canvas) {
    console.warn('grid: #grid-canvas not found, grid disabled');
    return grid;
  }
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resize, { passive: true });
  resize();

  return grid;
}

/* Mirror on window for now so future content can query grid geometry. */
if (typeof window !== 'undefined') {
  window.grid = grid;
}

export default grid;
export { init, snap, intersections, SPACING };
