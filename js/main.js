/*
  main.js
  Single entry point, loaded with <script type="module">.

  Init order:
    1. tokens are already applied by tokens.css (CSS loads before this module)
    2. camera state (the one camera)
    3. grid (reads tokens, paints the background)
    4. i18n (loads and applies the default language)
    5. router (renders the current hash, or defaults to #home)
    6. header (brand mark and menu button)

  We confirm GSAP is importable and log a one line ready message. Nothing is
  animated in Phase 1.
*/

import { gsap } from './vendor/gsap/gsap.js';
import camera from './camera.js';
import * as grid from './grid.js';
import * as i18n from './i18n.js';
import * as router from './router.js';
import * as header from './header.js';
import * as home from './home.js';
import * as contact from './contact.js';
import * as chat from './chat/chat.js';

async function bootstrap() {
  // 2. Camera: seed the navigation state.
  camera.set({ mode: 'home', section: 'home' });

  // 3. Grid: paint the 64px background from tokens.
  grid.init();

  // 4. i18n: load and apply the default language (English).
  await i18n.init();

  // 5. Router: render the current route (defaults to #home).
  router.init();

  // 6. Header: brand mark and menu button.
  header.init();

  // 7. Home hero interactions (resting state only). Delegated listeners, so
  //    this is wired once and survives router re-renders.
  home.init();

  // 7b. Contact page: delegated form submit (mailto) and the LinkedIn link.
  contact.init();

  // 8. Chat engine. Builds the fixed #chat internals once and wires the
  //    open/close choreography and the step player. abrirChat() (called by the
  //    home hero) drives the rest.
  chat.init();

  // Confirm GSAP is vendored and importable, and the chat engine is wired.
  console.log(
    `Portfolio Phase 3 ready. GSAP ${gsap.version} vendored and importable. ` +
    `Language: ${i18n.idioma()}. Grid cell: ${grid.default.cellSize}px.`
  );
}

/* The no-JS guard already added .js and set scrollRestoration in the head.
   Kick off once the DOM is parsed. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
