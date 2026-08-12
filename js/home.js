/*
  home.js
  Wiring for the home hero, resting state only.

  Uses event delegation on document so it survives the router re-cloning the
  home template into #app: listeners are attached once and match elements by
  class, no re-binding per render.

  Behaviour (Phase 2):
    - Submitting the search field (Enter or the send button) or clicking a chip
      records the intent on camera state and calls the chat seam abrirChat().
      No layout change, no navigation.
    - data-scroll-explore smooth scrolls to the reserved #explorar anchor
      (jumps instantly if reduced motion is preferred).
    - Avatar photo is optional: if it fails to load, we fall back to an empty
      transparent image so the ringed circle still holds (background fill).
*/

import camera from './camera.js';
import { abrirChat } from './chat.js';

/* A 1x1 transparent SVG, used when the avatar photo is missing. */
const AVATAR_VAZIO =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E';

/* Record an intent and hand it to the chat seam. */
function registrarIntent(intent) {
  const limpo = (intent || '').trim();
  if (!limpo) return;
  camera.set({ intent: limpo });
  abrirChat(limpo);
}

/* Submit the search field with whatever the visitor typed. */
function enviarBusca(input) {
  if (!input) return;
  registrarIntent(input.value);
}

/* Smooth scroll to the reserved explore anchor, respecting reduced motion. */
function irParaExplorar() {
  const alvo = document.getElementById('explorar');
  if (!alvo) return;
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
}

function init() {
  // Clicks: send button, chips, scroll-explore link.
  document.addEventListener('click', (evento) => {
    const alvo = evento.target;
    if (!alvo || !alvo.closest) return;

    const send = alvo.closest('.home-search__send');
    if (send) {
      const input = send.closest('.home-search')?.querySelector('.home-search__input');
      enviarBusca(input);
      return;
    }

    const chip = alvo.closest('.chip');
    if (chip) {
      registrarIntent(chip.dataset.intent || '');
      return;
    }

    const scrollLink = alvo.closest('[data-scroll-explore]');
    if (scrollLink) {
      irParaExplorar();
      return;
    }
  });

  // Enter inside the search field submits.
  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter') return;
    const input = evento.target?.closest?.('.home-search__input');
    if (input) {
      evento.preventDefault();
      enviarBusca(input);
    }
  });

  // Avatar fallback. The error event does not bubble, so we listen in the
  // capture phase and match the target by class.
  document.addEventListener(
    'error',
    (evento) => {
      const alvo = evento.target;
      if (
        alvo &&
        alvo.classList &&
        alvo.classList.contains('home-avatar') &&
        alvo.getAttribute('src') !== AVATAR_VAZIO
      ) {
        alvo.classList.add('home-avatar--vazio');
        alvo.src = AVATAR_VAZIO; // remove the broken image glyph, keep the ring
      }
    },
    true
  );
}

export default { init };
export { init };
