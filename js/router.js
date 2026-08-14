/*
  router.js
  Small hash based router. On load and on hashchange it reads the route from
  location.hash, finds the matching <template data-route>, clones it into #app,
  translates the new nodes, and updates the camera state.

  "One camera, two modes." The chat is not a template route: it is an OVERLAY
  context reached at #chat. When the hash is #chat the router keeps whatever
  section is already rendered in #app underneath (the resting home by default)
  and only flips the camera MODE to 'chat'. The chat controller subscribes to
  the camera and opens/closes from that mode change. Leaving #chat (for example
  #home) flips the mode back and the chat closes.

  Everything else stays data driven: a route -> template map plus one render
  function. New sections are added by dropping a <template data-route> into the
  HTML.
*/

import camera from './camera.js';

const ROTA_PADRAO = 'home';
const CTX_CHAT = 'chat';

let appEl = null;
let rotas = {}; // route name -> <template> element
let sectionRenderizada = null; // the section currently cloned into #app

/* Build the route map from every <template data-route> in the document. */
function indexarRotas() {
  rotas = {};
  document.querySelectorAll('template[data-route]').forEach((tpl) => {
    rotas[tpl.getAttribute('data-route')] = tpl;
  });
}

/*
  Derive the mode and the underlying section from the hash.
    #chat        -> mode 'chat', keep the current section underneath
    #home / ...  -> mode 'home', section is that route (or the default)
*/
function estadoDaHash() {
  const bruto = (location.hash || '').replace(/^#/, '').trim();
  if (bruto === CTX_CHAT) {
    return { mode: 'chat', section: sectionRenderizada || ROTA_PADRAO };
  }
  const section = rotas[bruto] ? bruto : ROTA_PADRAO;
  return { mode: 'home', section };
}

/* Clone the section template into #app when it changes, then sync the camera. */
function render() {
  if (!appEl) return;
  const { mode, section } = estadoDaHash();

  // Only re-clone when the underlying section actually changes, so entering and
  // leaving #chat never re-renders (and never resets) the home underneath.
  if (section !== sectionRenderizada) {
    const tpl = rotas[section];
    if (tpl) {
      appEl.replaceChildren(tpl.content.cloneNode(true));
      if (window.i18n && typeof window.i18n.aplicar === 'function') {
        window.i18n.aplicar(appEl);
      }
      sectionRenderizada = section;
      window.scrollTo(0, 0);
    }
  }

  // Keep the single navigation state in sync (mode drives the chat).
  camera.set({ mode, section });
}

/* Initialise: cache #app, index routes, wire hashchange, render once. */
function init() {
  appEl = document.getElementById('app');
  indexarRotas();

  window.addEventListener('hashchange', render);

  // Default to #home if the hash is neither a known section nor the chat
  // context. #chat is valid on its own: render() draws the home underlay and
  // flips the mode so the chat controller can open on load.
  const bruto = (location.hash || '').replace(/^#/, '').trim();
  const valido = Boolean(rotas[bruto]) || bruto === CTX_CHAT;
  if (!valido && bruto !== ROTA_PADRAO) {
    location.hash = ROTA_PADRAO;
    return; // render runs from the hashchange event
  }

  render();
}

export default { init, render };
export { init, render };
