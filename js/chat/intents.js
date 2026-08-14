/*
  intents.js
  The intent registry and the free text matcher.

  The chat is not a live language model. It is a scripted intent engine: a
  question maps to an intent, and an intent plays an authored narrative. This
  is deterministic, offline capable and safe to publish to GitHub Pages.

  This file holds STRUCTURE only. All chip and step COPY lives in the locale
  files (locales/en.json, locales/pt.json) and is looked up by key, so Phase 4
  can rewrite the narratives by editing data alone.

  Token names and copy keys are kept in Portuguese, matching the rest of the
  build; code comments are in English.
*/

/* Follow up chips offered by default at the end of a narrative. */
export const chipsPadrao = ['projetos', 'sobre', 'contacto'];

/*
  Each intent declares:
    passos       the ordered step keys, resolved to copy via i18n
    chips        the follow up chips shown after the last step
    paginaFinal  an optional case page to offer at the end (reserved for
                 Phase 4; for now it renders a placeholder "open case" chip)
*/
export const intencoes = {
  inicio:      { passos: ['chat.inicio.p1'],       chips: ['projetos', 'sobre', 'contacto'] },
  projetos:    { passos: ['chat.projetos.p1'],     chips: ['diagnostico', 'motorline', 'momentos', 'coinple'] },
  diagnostico: { passos: ['chat.diagnostico.p1', 'chat.diagnostico.p2', 'chat.diagnostico.p3', 'chat.diagnostico.p4'],
                 chips: ['motorline', 'contacto'], paginaFinal: 'diagnostico' },
  motorline:   { passos: ['chat.motorline.p1'],    chips: ['diagnostico', 'contacto'], paginaFinal: 'motorline' },
  momentos:    { passos: ['chat.momentos.p1'],     chips: ['projetos'] },
  coinple:     { passos: ['chat.coinple.p1'],      chips: ['projetos'] },
  sobre:       { passos: ['chat.sobre.p1'],        chips: ['projetos', 'contacto'] },
  contacto:    { passos: ['chat.contacto.p1'],     chips: ['projetos'] },
  fallback:    { passos: ['chat.fallback.p1'],     chips: ['projetos', 'sobre', 'contacto'] }
};

/*
  Free text matching. Bilingual triggers, first match wins, else fallback.
  Order matters: the more specific project names are tested before the broad
  "projects" bucket so "coinple" does not get swallowed by /projet|project/.
*/
export const gatilhos = [
  { regex: /coinple/i,                              id: 'coinple' },
  { regex: /momentos?/i,                            id: 'momentos' },
  { regex: /diagn[oó]stic|lideran[cç]a|leadership/i, id: 'diagnostico' },
  { regex: /motor\s*line/i,                         id: 'motorline' },
  { regex: /projet|project|work|trabalh|case/i,     id: 'projetos' },
  { regex: /sobre|about|quem|who|j[eé]ssica/i,       id: 'sobre' },
  { regex: /contact|contacto|e-?mail|falar|linkedin|hire|contrat/i, id: 'contacto' }
];

/*
  Resolve an entry to an intent id.
  `entrada` is either a known intent id (from a chip) or free text. A known id
  is returned as is; otherwise the first matching trigger wins, falling back to
  the fallback intent.
*/
export function resolverIntencao(entrada) {
  if (intencoes[entrada]) return entrada;
  const texto = (entrada || '').trim();
  const achado = gatilhos.find((g) => g.regex.test(texto));
  return achado ? achado.id : 'fallback';
}
