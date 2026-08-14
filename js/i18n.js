/*
  i18n.js
  Custom vanilla translation engine driven by data-i18n attributes.

  The locale JSON files (locales/en.json, locales/pt.json) are the single
  source of truth for copy: no strings are duplicated in the HTML or in JS.

  Public API (also mirrored on window.i18n):
    aplicar(secao)         apply translations to a scope (default: document)
    definirIdioma(lang)    set the active language and re-apply everywhere

  English is the default. A missing key falls back to the key name and warns
  once in the console. Language choice is held in memory for the session only
  (no localStorage; it can be added later if needed).
*/

const IDIOMA_PADRAO = 'en';
const IDIOMAS = ['en', 'pt'];

const dicionarios = {}; // lang -> { key: value }
let idiomaAtual = IDIOMA_PADRAO;
const avisosDados = new Set(); // keys we already warned about, avoids spam

/* Load one locale JSON file. Cached after first load. */
async function carregar(lang) {
  if (dicionarios[lang]) return dicionarios[lang];
  try {
    const resposta = await fetch(`locales/${lang}.json`);
    if (!resposta.ok) {
      throw new Error(`HTTP ${resposta.status}`);
    }
    dicionarios[lang] = await resposta.json();
  } catch (erro) {
    console.warn(`i18n: could not load locale "${lang}" (${erro.message})`);
    dicionarios[lang] = {};
  }
  return dicionarios[lang];
}

/* Resolve a single key in the active language, with fallback. */
function traduzir(chave) {
  const dic = dicionarios[idiomaAtual] || {};
  if (Object.prototype.hasOwnProperty.call(dic, chave)) {
    return dic[chave];
  }
  if (!avisosDados.has(chave)) {
    console.warn(`i18n: missing key "${chave}" for language "${idiomaAtual}"`);
    avisosDados.add(chave);
  }
  return chave; // fall back to the key name
}

/*
  Apply translations within a scope. Each element may carry any of:
    data-i18n              set textContent (or, with data-i18n-attr, a list of
                           attributes such as aria-label,title)
    data-i18n-html         set innerHTML (values may contain a highlight span,
                           for example <span class="destaque">...</span>)
    data-i18n-placeholder  set the placeholder attribute
    data-i18n-aria         set the aria-label attribute
    data-i18n-alt          set the alt attribute
  All highlighted words live inside the translated value, so each language
  keeps its own natural word order.
*/
const SELETOR_I18N = [
  '[data-i18n]',
  '[data-i18n-attr]',
  '[data-i18n-html]',
  '[data-i18n-placeholder]',
  '[data-i18n-aria]',
  '[data-i18n-alt]',
].join(',');

function aplicar(secao) {
  const escopo = secao || document;
  const alvos = escopo.querySelectorAll(SELETOR_I18N);
  alvos.forEach((el) => {
    // textContent, or an explicit attribute list (Phase 1 behaviour)
    const chave = el.getAttribute('data-i18n');
    if (chave) {
      const valor = traduzir(chave);
      const attrLista = el.getAttribute('data-i18n-attr');
      if (attrLista) {
        attrLista.split(',').forEach((attr) => {
          const nome = attr.trim();
          if (nome) el.setAttribute(nome, valor);
        });
      } else {
        el.textContent = valor;
      }
    }

    // innerHTML: values are authored in our own trusted locale files.
    const chaveHtml = el.getAttribute('data-i18n-html');
    if (chaveHtml) el.innerHTML = traduzir(chaveHtml);

    // Single attribute targets.
    const chavePh = el.getAttribute('data-i18n-placeholder');
    if (chavePh) el.setAttribute('placeholder', traduzir(chavePh));

    const chaveAria = el.getAttribute('data-i18n-aria');
    if (chaveAria) el.setAttribute('aria-label', traduzir(chaveAria));

    const chaveAlt = el.getAttribute('data-i18n-alt');
    if (chaveAlt) el.setAttribute('alt', traduzir(chaveAlt));
  });

  // Long form copy is authored as sibling [data-lang] blocks (see the About
  // page) rather than in the JSON. Show the block matching the active language
  // and hide the others. Runs on every apply, so both a language switch
  // (aplicar(document)) and a router re-render (aplicar(appEl)) stay correct.
  escopo.querySelectorAll('[data-lang]').forEach((bloco) => {
    bloco.hidden = bloco.getAttribute('data-lang') !== idiomaAtual;
  });
}

/* Set the active language, load it if needed, then re-apply document wide. */
async function definirIdioma(lang) {
  if (!IDIOMAS.includes(lang)) {
    console.warn(`i18n: unknown language "${lang}", keeping "${idiomaAtual}"`);
    return idiomaAtual;
  }
  idiomaAtual = lang;
  document.documentElement.setAttribute('lang', lang);
  await carregar(lang);
  aplicar(document);
  return idiomaAtual;
}

/* The active language code. */
function idioma() {
  return idiomaAtual;
}

/*
  Public single key lookup. Used by the chat step player to pull step and chip
  copy by key at runtime (window.i18n.texto(chave)). Same fallback and warn
  behaviour as the attribute driven path.
*/
function texto(chave) {
  return traduzir(chave);
}

const i18n = { aplicar, definirIdioma, idioma, texto, IDIOMA_PADRAO };

/* Initialise with the default language and apply it. */
async function init() {
  await definirIdioma(IDIOMA_PADRAO);
  return i18n;
}

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

export default i18n;
export { init, aplicar, definirIdioma, idioma, texto };
