/*
  router.js
  Small hash based router. On load and on hashchange it reads the route from
  location.hash, finds the matching <template data-route>, clones it into #app,
  translates the new nodes, and updates the camera state.

  It is deliberately data driven: a route -> template map plus a single render
  function. New routes are added by dropping a <template data-route> into the
  HTML.
*/

import camera from './camera.js';

const ROTA_PADRAO = 'home';

let appEl = null;
let rotas = {}; // route name -> <template> element

/* Build the route map from every <template data-route> in the document. */
function indexarRotas() {
  rotas = {};
  document.querySelectorAll('template[data-route]').forEach((tpl) => {
    rotas[tpl.getAttribute('data-route')] = tpl;
  });
}

/* Read the current route from the hash, defaulting when empty or unknown. */
function rotaAtual() {
  const bruto = (location.hash || '').replace(/^#/, '').trim();
  return rotas[bruto] ? bruto : ROTA_PADRAO;
}

/* Clone the matching template into #app and translate it. */
function render() {
  const nome = rotaAtual();
  const tpl = rotas[nome];
  if (!appEl || !tpl) return;

  appEl.replaceChildren(tpl.content.cloneNode(true));

  // Translate the freshly cloned nodes.
  if (window.i18n && typeof window.i18n.aplicar === 'function') {
    window.i18n.aplicar(appEl);
  }

  // Keep the single navigation state in sync.
  camera.set({ section: nome });
}

/* Initialise: cache #app, index routes, wire hashchange, render once. */
function init() {
  appEl = document.getElementById('app');
  indexarRotas();

  window.addEventListener('hashchange', render);

  // Default to #home if no (valid) hash is present.
  if (!rotas[(location.hash || '').replace(/^#/, '').trim()]) {
    // Setting the hash triggers hashchange -> render. If the hash is already
    // empty this assignment still leads to a single render.
    if (location.hash.replace(/^#/, '') !== ROTA_PADRAO) {
      location.hash = ROTA_PADRAO;
      return; // render runs from the hashchange event
    }
  }

  render();
}

export default { init, render };
export { init, render };
