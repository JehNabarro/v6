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
  Apply translations to every [data-i18n] element within a scope.
  A data-i18n-attr attribute (optional) targets an attribute instead of text,
  for example data-i18n="nav.menu" data-i18n-attr="aria-label,title".
*/
function aplicar(secao) {
  const escopo = secao || document;
  const alvos = escopo.querySelectorAll('[data-i18n]');
  alvos.forEach((el) => {
    const chave = el.getAttribute('data-i18n');
    if (!chave) return;
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

const i18n = { aplicar, definirIdioma, idioma, IDIOMA_PADRAO };

/* Initialise with the default language and apply it. */
async function init() {
  await definirIdioma(IDIOMA_PADRAO);
  return i18n;
}

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

export default i18n;
export { init, aplicar, definirIdioma, idioma };
