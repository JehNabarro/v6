/*
  header.js
  The header brand mark, the hamburger button and the navigation drawer.

  Drawer logic copied from the jessy reference:
    - The hamburger toggles body.drawer-aberto and updates aria-expanded plus the
      button aria-label (open vs close).
    - Escape closes the drawer.
    - A click anywhere outside the drawer and the button closes it. The button
      toggles itself, so its own clicks are ignored by the outside handler.
    - A drawer link navigates via the router hash and then closes the drawer.
      Project links open the chat storytelling instead of navigating. Without JS
      the anchors still resolve on their own.

  The body class drives every visual (see css/menu.css); this module only flips
  state and manages focus and labels.
*/

import { abrirChat } from './chat/chat.js';

let headerEl = null;
let botaoMenu = null;
let drawerEl = null;
let aberto = false;

/* Keep the button aria-label in step with the open state and the language. */
function atualizarRotulo() {
  if (!botaoMenu || !window.i18n) return;
  const chave = aberto ? 'nav.close' : 'nav.open';
  botaoMenu.setAttribute('aria-label', window.i18n.texto(chave));
}

/* Mark the active language button in the footer toggle. */
function marcarIdiomaAtivo() {
  if (!drawerEl || !window.i18n) return;
  const atual = window.i18n.idioma();
  drawerEl.querySelectorAll('[data-lang-set]').forEach((botao) => {
    const ativo = botao.dataset.langSet === atual;
    botao.classList.toggle('is-ativo', ativo);
    botao.setAttribute('aria-pressed', String(ativo));
  });
}

function abrir() {
  if (aberto) return;
  aberto = true;
  document.body.classList.add('drawer-aberto');
  if (botaoMenu) botaoMenu.setAttribute('aria-expanded', 'true');
  if (drawerEl) {
    drawerEl.setAttribute('aria-hidden', 'false');
    // Move focus into the drawer for keyboard and screen reader users.
    const primeiro = drawerEl.querySelector('button, a');
    if (primeiro) primeiro.focus();
  }
  atualizarRotulo();
}

function fechar() {
  if (!aberto) return;
  aberto = false;
  document.body.classList.remove('drawer-aberto');
  if (botaoMenu) {
    botaoMenu.setAttribute('aria-expanded', 'false');
    // Return focus to the trigger so keyboard users are not stranded.
    botaoMenu.focus();
  }
  if (drawerEl) drawerEl.setAttribute('aria-hidden', 'true');
  atualizarRotulo();
}

function alternar() {
  aberto ? fechar() : abrir();
}

/* Initialise: cache elements, wire the button and the drawer interactions. */
function init() {
  headerEl = document.querySelector('.cabecalho');
  botaoMenu = document.querySelector('.botao-menu');
  drawerEl = document.getElementById('drawer-menu');

  if (botaoMenu) {
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.addEventListener('click', alternar);
  }
  atualizarRotulo();
  marcarIdiomaAtivo();

  // Drawer clicks: projects open the chat, links navigate then close, the
  // language buttons switch the language live.
  if (drawerEl) {
    drawerEl.addEventListener('click', (evento) => {
      const alvo = evento.target;
      if (!alvo || !alvo.closest) return;

      const projeto = alvo.closest('.drawer-projeto');
      if (projeto) {
        fechar();
        // A project rendered as an anchor has its own case page: let the href
        // drive the router (like the section links). A button opens the chat
        // storytelling for cases whose page does not exist yet.
        if (projeto.tagName === 'A') return;
        abrirChat(projeto.dataset.intent || '');
        return;
      }

      const link = alvo.closest('.drawer-link');
      if (link) {
        // The anchor href drives the router via the hash; just close after.
        fechar();
        return;
      }

      const idioma = alvo.closest('[data-lang-set]');
      if (idioma && window.i18n) {
        window.i18n.definirIdioma(idioma.dataset.langSet);
        marcarIdiomaAtivo();
        atualizarRotulo(); // definirIdioma re-applies i18n; keep our label right
        return;
      }
    });
  }

  // Escape closes the drawer.
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && aberto) fechar();
  });

  // Outside click closes the drawer. The button toggles itself, so ignore it
  // here; clicks inside the drawer are handled above and must not close it.
  document.addEventListener('click', (evento) => {
    if (!aberto) return;
    const alvo = evento.target;
    if (botaoMenu && botaoMenu.contains(alvo)) return;
    if (drawerEl && drawerEl.contains(alvo)) return;
    fechar();
  });
}

export default { init, abrir, fechar, alternar };
export { init, abrir, fechar, alternar };
