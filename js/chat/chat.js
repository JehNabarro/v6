/*
  chat/chat.js
  The chat engine: the core of the site.

  One camera, two modes, now bound to a hash context. Opening the chat sets the
  hash to #chat; closing returns to the underlying section (#home by default).
  The router turns that hash into a camera MODE change and this controller
  subscribes to the camera: mode 'chat' opens, mode 'home' closes. The back
  button therefore works, and #chat is a shareable, reloadable context.

  The fixed #chat element (reserved in Phase 1, always a direct child of <body>)
  IS the chat surface. It never changes parent and is never reparented. There
  is no box: the chat lives on the page over the grid. Layout:

    [ Back ]                      <- top, below the header
    [ asked-question chips ]      <- the breadcrumb trail (incl. typed text)

    [ story steps ]              <- scrollable body, on the grid

    [ suggestion chips ]          <- 32px above the input
    [ input ................ > ]  <- anchored 128px from the bottom

  On open the hero copy and quick actions fade away and the hero search field
  descends to the bottom, becoming the chat input, using direct gsap.to tweens
  only (no Flip, no reparenting). Answers are told step by step: a typing beat,
  a step, a Continue rhythm, then follow up suggestions, accumulating in the
  scrollable body.
*/

import { gsap } from '../vendor/gsap/gsap.js';
import camera from '../camera.js';
import { intencoes, chipsPadrao, resolverIntencao } from './intents.js';

/* ---------------------------------------------------------------- */
/* Module state                                                     */
/* ---------------------------------------------------------------- */

let chatEl = null;      // the fixed surface (== #chat)
let internoEl = null;   // centred column
let topoEl = null;      // back + trail
let caminhoEl = null;   // breadcrumb trail (asked questions)
let corpoEl = null;     // scrollable step body
let suporteEl = null;   // bottom cluster (suggestions + input)
let chipsEl = null;     // follow up suggestion chips
let formEl = null;      // ask form (the input pill)
let inputEl = null;     // ask input

let aberto = false;
let pendingIntent = null; // intent waiting for the open to consume

// Hero references, captured at open time (live DOM in #app).
let paginaHomeEl = null;
let buscaEl = null;
let copyEl = null;
let actionsEl = null;

// Current narrative.
let defAtual = null;
let passos = [];
let indice = 0;

// Breadcrumb trail: [{ id, tipo:'intent'|'texto', rotulo }]. Only grows;
// clicking an earlier node drops the later ones.
let trilha = [];

// Motion tokens, read once from CSS at init.
let motion = { rapida: 0.24, media: 0.42, lenta: 0.6, easeEntrada: 'power3.out', easeSaida: 'power2.in' };

const BEAT_MS = 600;    // typing indicator beat before each step
const CTX_CHAT = 'chat';

// Intent ids that carry a chip label (chat.chip.<id>).
const IDS_COM_ROTULO = new Set([
  'projetos', 'diagnostico', 'motorline', 'momentos', 'coinple', 'sobre', 'contacto',
  'experiencia', 'stack', 'formacao', 'disponibilidade'
]);

// Home quick-action aliases (their data-intent values) count as known intents.
const ALIASES_HOME = new Set(['project', 'about', 'contact']);

/* ---------------------------------------------------------------- */
/* Small helpers                                                    */
/* ---------------------------------------------------------------- */

function reduzido() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Look up copy by key through the i18n engine, falling back to the key. */
function t(chave) {
  if (window.i18n && typeof window.i18n.texto === 'function') {
    return window.i18n.texto(chave);
  }
  return chave;
}

function tokenRaiz(nome) {
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

/* Parse a CSS time token ("0.42s" / "420ms") into seconds. */
function segundos(valor, fallback) {
  const v = (valor || '').trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return v.endsWith('ms') ? n / 1000 : n;
}

function lerMotion() {
  return {
    rapida: segundos(tokenRaiz('--duracao-rapida'), 0.24),
    media: segundos(tokenRaiz('--duracao-media'), 0.42),
    lenta: segundos(tokenRaiz('--duracao-lenta'), 0.6),
    easeEntrada: tokenRaiz('--ease-entrada') || 'power3.out',
    easeSaida: tokenRaiz('--ease-saida') || 'power2.in',
  };
}

function ehIntentConhecido(entrada) {
  const chave = (entrada || '').trim().toLowerCase();
  return Boolean(intencoes[chave]) || ALIASES_HOME.has(chave);
}

/* Build a trail node from an entry and its resolved intent id. */
function nodeDe(entrada, id) {
  if (ehIntentConhecido(entrada) && IDS_COM_ROTULO.has(id)) {
    return { id, tipo: 'intent', rotulo: t('chat.chip.' + id) };
  }
  return { id, tipo: 'texto', rotulo: (entrada || '').trim() };
}

function scrollFim() {
  if (corpoEl) corpoEl.scrollTop = corpoEl.scrollHeight;
}

/* The hero search pill rectangle: the origin/target of the descend tween. */
function rectPill() {
  const busca = buscaEl || document.querySelector('.home-search');
  if (busca) {
    const r = busca.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }
  // Fallback: the vertical centre, if the hero is not present for any reason.
  return { top: window.innerHeight / 2, left: 0, width: 0, height: 56 };
}

/* ---------------------------------------------------------------- */
/* Hero fade (open) and restore (close)                             */
/* ---------------------------------------------------------------- */

function esconderHero() {
  if (paginaHomeEl) paginaHomeEl.style.pointerEvents = 'none';
  const alvos = [copyEl, actionsEl].filter(Boolean);
  if (reduzido()) {
    gsap.set(alvos, { opacity: 0 });
    if (buscaEl) gsap.set(buscaEl, { opacity: 0 });
    return;
  }
  gsap.to(alvos, { opacity: 0, y: -16, duration: motion.media, ease: motion.easeSaida });
  // The search only fades (no transform) so its rect stays stable for close.
  if (buscaEl) gsap.to(buscaEl, { opacity: 0, duration: motion.rapida });
}

function mostrarHero() {
  const alvos = [copyEl, actionsEl].filter(Boolean);
  if (reduzido()) {
    gsap.set(alvos, { opacity: 1, y: 0 });
    if (buscaEl) gsap.set(buscaEl, { opacity: 1 });
  } else {
    gsap.to(alvos, { opacity: 1, y: 0, duration: motion.media, ease: motion.easeEntrada });
    if (buscaEl) gsap.to(buscaEl, { opacity: 1, duration: motion.media });
  }
  if (paginaHomeEl) paginaHomeEl.style.pointerEvents = '';
}

/* ---------------------------------------------------------------- */
/* Open / close choreography (direct tweens, no Flip)               */
/* ---------------------------------------------------------------- */

function abrir(intent) {
  // Capture the live hero nodes.
  paginaHomeEl = document.querySelector('.pagina-home');
  buscaEl = paginaHomeEl ? paginaHomeEl.querySelector('.home-search') : null;
  copyEl = paginaHomeEl ? paginaHomeEl.querySelector('.home-copy') : null;
  actionsEl = paginaHomeEl ? paginaHomeEl.querySelector('.home-actions') : null;

  const pill = rectPill();
  esconderHero();

  // Reveal the surface so its layout resolves, then measure the input's resting
  // rect. Measuring and the initial gsap.set happen in the same tick, before
  // paint, so there is no flash at the resting position.
  chatEl.hidden = false;
  chatEl.classList.add('esta-aberto');
  const restingInput = formEl.getBoundingClientRect();
  const deltaY = pill.top - restingInput.top; // hero is above the bottom: negative

  aberto = true;
  trilha = [];
  const id = resolverIntencao(intent);
  // The opening greeting is not a "question asked", so it gets no trail chip;
  // any real opener (a chip or typed question) starts the breadcrumb.
  if (id !== 'inicio') adicionarTrilha(nodeDe(intent, id));
  renderTrilha();
  iniciarNarrativa(id);
  adicionarListeners();

  if (reduzido()) {
    gsap.set([topoEl, corpoEl, suporteEl], { opacity: 1 });
    gsap.set(formEl, { y: 0, opacity: 1 });
    if (inputEl) inputEl.focus();
    return;
  }

  // The input descends from the hero search position to the bottom.
  gsap.set(formEl, { y: deltaY });
  gsap.to(formEl, { y: 0, duration: motion.media, ease: motion.easeEntrada });
  gsap.fromTo(formEl, { opacity: 0 }, { opacity: 1, duration: motion.rapida });

  // The rest of the chat fades in around it.
  gsap.fromTo([topoEl, corpoEl], { opacity: 0 }, { opacity: 1, duration: motion.media, ease: motion.easeEntrada });
  gsap.fromTo(suporteEl, { opacity: 0 }, { opacity: 1, duration: motion.rapida, delay: motion.rapida });

  if (inputEl) inputEl.focus();
}

function fechar() {
  if (!aberto) return;
  aberto = false;
  removerListeners();

  const pill = rectPill();
  const restingInput = formEl.getBoundingClientRect();
  const deltaY = pill.top - restingInput.top;

  mostrarHero();

  const finalizar = () => {
    chatEl.hidden = true;
    chatEl.classList.remove('esta-aberto');
    gsap.set([formEl, topoEl, corpoEl, suporteEl], { clearProps: 'opacity,transform' });
  };

  if (reduzido()) {
    gsap.set([topoEl, corpoEl, suporteEl, formEl], { opacity: 0 });
    finalizar();
    return;
  }

  gsap.to([topoEl, corpoEl], { opacity: 0, duration: motion.rapida });
  gsap.to(suporteEl, { opacity: 0, duration: motion.rapida });
  gsap.to(formEl, { y: deltaY, duration: motion.media, ease: motion.easeSaida });
  gsap.to(formEl, {
    opacity: 0, duration: motion.media, ease: motion.easeSaida, onComplete: finalizar,
  });
}

/* Ask the router to leave the chat context; the mode change closes the chat. */
function pedirFecho() {
  const sec = camera.get().section || 'home';
  location.hash = sec;
}

/* ---------------------------------------------------------------- */
/* Window level listeners, only while open                          */
/* ---------------------------------------------------------------- */

function onKey(evento) {
  if (evento.key === 'Escape' && aberto) pedirFecho();
}
function adicionarListeners() {
  document.addEventListener('keydown', onKey);
}
function removerListeners() {
  document.removeEventListener('keydown', onKey);
}

/* ---------------------------------------------------------------- */
/* Breadcrumb trail (asked questions, at the top)                   */
/* ---------------------------------------------------------------- */

function adicionarTrilha(node) {
  if (trilha.length && trilha[trilha.length - 1].id === node.id) return;
  trilha.push(node);
  renderTrilha();
}

function renderTrilha() {
  caminhoEl.replaceChildren();
  trilha.forEach((n, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip glass chat-trilha-chip';
    chip.dataset.indice = String(i);
    if (n.tipo === 'intent') {
      chip.setAttribute('data-i18n', 'chat.chip.' + n.id);
      chip.textContent = t('chat.chip.' + n.id);
    } else {
      chip.textContent = n.rotulo;
    }
    if (i === trilha.length - 1) chip.setAttribute('aria-current', 'true');
    caminhoEl.appendChild(chip);
  });
}

/* Clicking an earlier trail chip replays it and drops the later ones. */
function replayTrilha(i) {
  if (i < 0 || i >= trilha.length) return;
  trilha = trilha.slice(0, i + 1);
  renderTrilha();
  iniciarNarrativa(trilha[i].id);
}

/* ---------------------------------------------------------------- */
/* Step player                                                      */
/* ---------------------------------------------------------------- */

function limparCorpo() {
  if (corpoEl) corpoEl.replaceChildren();
  if (chipsEl) chipsEl.replaceChildren();
}

function removerContinuar() {
  const b = corpoEl.querySelector('.chat-continuar');
  if (b) b.remove();
}

function mostrarDigitando() {
  const d = document.createElement('div');
  d.className = 'chat-digitando';
  d.setAttribute('aria-hidden', 'true');
  d.innerHTML = '<span></span><span></span><span></span>';
  corpoEl.appendChild(d);
  scrollFim();
  return d;
}

function revelarPasso(def) {
  const passo = document.createElement('div');
  passo.className = 'chat-passo';
  
  const chaveTexto = typeof def === 'string' ? def : def.texto;
  const texto = document.createElement('p');
  texto.className = 'chat-resposta';
  texto.setAttribute('data-i18n', chaveTexto);
  texto.textContent = t(chaveTexto);
  passo.appendChild(texto);

  if (typeof def === 'object' && def.img) {
    const fig = document.createElement('figure');
    fig.className = 'chat-media';
    const img = document.createElement('img');
    img.src = def.img;
    img.alt = '';
    fig.appendChild(img);
    passo.appendChild(fig);
  }

  corpoEl.appendChild(passo);
  scrollFim();
  if (!reduzido()) {
    gsap.from(passo, { opacity: 0, y: 8, duration: motion.rapida, ease: motion.easeEntrada });
  }
}

function mostrarContinuar(passoAtual) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chat-continuar';
  
  const chaveBtn = (typeof passoAtual === 'object' && passoAtual.btn) ? passoAtual.btn : 'chat.continue';
  
  b.setAttribute('data-i18n', chaveBtn);
  b.textContent = t(chaveBtn);
  corpoEl.appendChild(b);
  scrollFim();
}

/* Follow up suggestions live in the bottom cluster, above the input. */
function mostrarChipsSeguintes() {
  const ids = defAtual && defAtual.chips && defAtual.chips.length ? defAtual.chips : chipsPadrao;
  chipsEl.replaceChildren();

  ids.forEach((cid) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip glass chat-chip';
    chip.dataset.id = cid;
    chip.setAttribute('data-i18n', 'chat.chip.' + cid);
    chip.textContent = t('chat.chip.' + cid);
    chipsEl.appendChild(chip);
  });

  // The open case chip: navigates to the full case page route (see the chips
  // delegation in init). Shown only for intents that declare a paginaFinal.
  if (defAtual && defAtual.paginaFinal) {
    const caso = document.createElement('button');
    caso.type = 'button';
    caso.className = 'chip glass chat-chip chat-chip-caso';
    caso.dataset.caso = defAtual.paginaFinal;
    caso.setAttribute('data-i18n', 'chat.open_case');
    caso.textContent = t('chat.open_case');
    chipsEl.appendChild(caso);
  }
}

/* Reveal the next pending step (with a typing beat unless reduced motion). */
function avancar() {
  removerContinuar();

  const revelar = () => {
    const passoAtual = passos[indice];
    revelarPasso(passoAtual);
    indice += 1;
    if (indice < passos.length) mostrarContinuar(passoAtual);
    else mostrarChipsSeguintes();
  };

  if (reduzido()) {
    revelar();
    return;
  }

  const d = mostrarDigitando();
  window.setTimeout(() => {
    d.remove();
    revelar();
  }, BEAT_MS);
}

/* Start a narrative for an intent id. The trail is managed by the caller. */
function iniciarNarrativa(id) {
  defAtual = intencoes[id] || intencoes.fallback;
  passos = defAtual.passos.slice();
  indice = 0;
  limparCorpo();
  avancar();
}

/*
  Answer a new question (form submit or a follow up chip). Resolve the entry,
  grow the trail, and play the new narrative. The previous intent stays in the
  breadcrumb trail.
*/
function responder(entrada) {
  const limpo = (entrada || '').trim();
  if (!limpo) return;
  const id = resolverIntencao(limpo);
  adicionarTrilha(nodeDe(limpo, id));
  iniciarNarrativa(id);
}

/* ---------------------------------------------------------------- */
/* Build + wire (once, on init)                                     */
/* ---------------------------------------------------------------- */

const SHELL = `
  <div class="chat-interno">
    <div class="chat-topo">
      <button class="chat-voltar" type="button" data-i18n-aria="chat.back">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor"
            stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span data-i18n="chat.back"></span>
      </button>
      <nav class="chat-caminho" data-i18n-aria="chat.trail"></nav>
    </div>

    <div class="chat-corpo"></div>

    <div class="chat-suporte">
      <div class="chat-chips"></div>
      <form class="chat-form glass">
        <input type="text" autocomplete="off" data-i18n-placeholder="chat.placeholder" />
        <button class="chat-enviar" type="submit" data-i18n-aria="chat.send">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor"
              stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  </div>
`;

function init() {
  chatEl = document.getElementById('chat');
  if (!chatEl) {
    console.warn('chat: #chat mount not found, chat disabled');
    return;
  }

  chatEl.classList.add('chat');
  chatEl.setAttribute('role', 'dialog');
  chatEl.setAttribute('aria-modal', 'false');
  chatEl.innerHTML = SHELL;

  internoEl = chatEl.querySelector('.chat-interno');
  topoEl = chatEl.querySelector('.chat-topo');
  caminhoEl = chatEl.querySelector('.chat-caminho');
  corpoEl = chatEl.querySelector('.chat-corpo');
  suporteEl = chatEl.querySelector('.chat-suporte');
  chipsEl = chatEl.querySelector('.chat-chips');
  formEl = chatEl.querySelector('.chat-form');
  inputEl = formEl.querySelector('input');

  motion = lerMotion();

  // Ask form: keep asking without leaving the chat.
  formEl.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const valor = inputEl.value;
    inputEl.value = '';
    responder(valor);
  });

  // Back closes the chat context (returns to the underlying section).
  chatEl.querySelector('.chat-voltar').addEventListener('click', pedirFecho);

  // Body delegation: Continue advances the story.
  corpoEl.addEventListener('click', (evento) => {
    if (evento.target.closest && evento.target.closest('.chat-continuar')) avancar();
  });

  // Suggestions delegation: the reserved case chip, and follow up chips.
  chipsEl.addEventListener('click', (evento) => {
    const alvo = evento.target;
    if (!alvo || !alvo.closest) return;
    const caso = alvo.closest('.chat-chip-caso');
    if (caso) {
      // Open the full case page. Navigating to its route flips the camera mode
      // back to 'home', which closes the chat, and the router renders the case.
      const rota = caso.dataset.caso;
      if (rota) location.hash = rota;
      return;
    }
    const chip = alvo.closest('.chat-chip');
    if (chip) responder(chip.dataset.id || '');
  });

  // Trail delegation: replay an earlier node, dropping the later ones.
  caminhoEl.addEventListener('click', (evento) => {
    const chip = evento.target.closest && evento.target.closest('.chat-trilha-chip');
    if (!chip) return;
    replayTrilha(parseInt(chip.dataset.indice, 10));
  });

  // Translate the static shell labels for the current language.
  if (window.i18n && typeof window.i18n.aplicar === 'function') {
    window.i18n.aplicar(chatEl);
  }

  // The camera mode drives open/close. #chat -> 'chat' (open), leaving -> close.
  camera.subscribe((estado) => {
    if (estado.mode === 'chat') {
      if (!aberto) abrir(consumirIntent());
    } else if (aberto) {
      fechar();
    }
  });

  // If the page loaded directly on #chat, the router already set mode 'chat'.
  if (camera.get().mode === 'chat' && !aberto) {
    abrir(consumirIntent());
  }
}

/* The intent to open with: whatever the hero handed us, else the opener. */
function consumirIntent() {
  const intent = pendingIntent || 'inicio';
  pendingIntent = null;
  return intent;
}

/*
  The seam Phase 2 already imports and calls. Signature unchanged.
  Records the intent and navigates to the #chat context; the router flips the
  camera mode and the subscription opens the chat. If the chat is already open,
  the intent is treated as a new question so nothing is lost.
*/
function abrirChat(intent) {
  if (!chatEl) init();
  if (aberto) {
    responder(intent);
    return;
  }
  pendingIntent = intent;
  const hash = (location.hash || '').replace(/^#/, '');
  if (hash !== CTX_CHAT) {
    location.hash = CTX_CHAT;
  } else if (camera.get().mode === 'chat') {
    // Already on #chat but not open (edge case): open directly.
    abrir(consumirIntent());
  }
}

export default { init, abrirChat };
export { init, abrirChat };
