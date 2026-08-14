/*
  contact.js
  Wiring for the contact page.

  Static host, no backend: on submit we build a mailto: to the email and open it,
  after a light validation pass (all fields present, basic email shape). Uses
  document level delegation so it survives the router re-cloning the contact
  template, and patches the LinkedIn href from a single constant when the page
  renders.
*/

/* The one email address, confirmed with the visitor's own account on file. */
const EMAIL = 'jeh.nabarro@gmail.com';

/*
  PLACEHOLDER, COMPLETE BEFORE SHIPPING.
  Replace with Jéssica's real LinkedIn profile URL. Applied to the LinkedIn link
  by aplicarLinks() whenever the contact page is rendered.
*/
const LINKEDIN_URL = 'https://www.linkedin.com/in/jessica-nabarro/';

/*
  Optional inbox delivery without a page leave. Drop a Formspree (or similar)
  endpoint here and post the form to it instead of the mailto path. Left empty
  and commented so the static mailto stays the default.
*/
// const FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';

/* Basic, forgiving email shape check: something@something.something. */
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

/* Point the LinkedIn link at the real profile and show a readable value. */
function aplicarLinks() {
  const link = document.querySelector('[data-contacto-linkedin]');
  if (link) link.setAttribute('href', LINKEDIN_URL);
  const texto = document.querySelector('[data-contacto-linkedin-texto]');
  if (texto) {
    // Show the profile path without the scheme, kept in sync with the constant.
    texto.textContent = LINKEDIN_URL.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
}

function init() {
  // The router renders on hashchange before this listener runs (its listener is
  // wired first), so the contact nodes already exist when we patch the links.
  aplicarLinks();
  window.addEventListener('hashchange', aplicarLinks);

  document.addEventListener('submit', (evento) => {
    const form = evento.target?.closest?.('.contacto-form');
    if (!form) return;
    evento.preventDefault();

    const nome = form.nome.value.trim();
    const email = form.email.value.trim();
    const mensagem = form.mensagem.value.trim();
    const erro = form.querySelector('.contacto-erro');

    if (!nome || !mensagem || !emailValido(email)) {
      if (erro) erro.hidden = false;
      return;
    }
    if (erro) erro.hidden = true;

    const assunto = `Portfolio contact from ${nome}`;
    const corpo = `${mensagem}\n\n${nome} (${email})`;
    const mailto =
      `mailto:${EMAIL}` +
      `?subject=${encodeURIComponent(assunto)}` +
      `&body=${encodeURIComponent(corpo)}`;

    window.location.href = mailto;
  });
}

export default { init };
export { init };
