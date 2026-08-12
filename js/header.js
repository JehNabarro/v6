/*
  header.js
  Thin header module: brand mark plus the circular menu button.

  Phase 1 wires the menu button to a no-op (it toggles a data attribute and
  logs) so the seam exists. The drawer contents arrive in Phase 4, which can
  extend this module without rewriting it.
*/

let headerEl = null;
let botaoMenu = null;

/* Placeholder menu handler: toggle a data attribute, no drawer yet. */
function alternarMenu() {
  if (!headerEl) return;
  const aberto = headerEl.getAttribute('data-menu') === 'aberto';
  const proximo = aberto ? 'fechado' : 'aberto';
  headerEl.setAttribute('data-menu', proximo);
  if (botaoMenu) {
    botaoMenu.setAttribute('aria-expanded', String(!aberto));
  }
  // Phase 4 will open the real drawer here.
  console.log(`header: menu -> ${proximo} (drawer arrives in Phase 4)`);
}

/* Initialise: cache elements and wire the button. */
function init() {
  headerEl = document.querySelector('.cabecalho');
  botaoMenu = document.querySelector('.botao-menu');

  if (headerEl) {
    headerEl.setAttribute('data-menu', 'fechado');
  }
  if (botaoMenu) {
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.addEventListener('click', alternarMenu);
  }
}

export default { init, alternarMenu };
export { init, alternarMenu };
