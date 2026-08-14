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
  inicio:          { passos: ['chat.inicio.p1'],       chips: ['projetos', 'sobre', 'contacto'] },
  projetos:        { passos: ['chat.projetos.p1'],     chips: ['diagnostico', 'motorline', 'momentos', 'coinple'] },
  diagnostico:     { passos: [
                       { texto: 'chat.diagnostico.p1', btn: 'chat.diagnostico.btn1' },
                       { texto: 'chat.diagnostico.p2', btn: 'chat.diagnostico.btn2' },
                       { texto: 'chat.diagnostico.p3', btn: 'chat.diagnostico.btn3' },
                       { texto: 'chat.diagnostico.p4' }
                     ],
                     chips: ['motorline', 'contacto'], paginaFinal: 'diagnostico' },
  motorline:       { passos: [
                       { texto: 'chat.motorline.p1', btn: 'chat.motorline.btn1', img: 'assets/img/Motorline/Producao.webp' },
                       { texto: 'chat.motorline.p2', btn: 'chat.motorline.btn2', img: 'assets/img/Motorline/Producao2.webp' },
                       { texto: 'chat.motorline.p3' }
                     ],
                     chips: ['diagnostico', 'contacto'], paginaFinal: 'motorline' },
  momentos:        { passos: [
                       { texto: 'chat.momentos.p1', btn: 'chat.momentos.btn1', img: 'assets/img/Momentos/tela1.webp' },
                       { texto: 'chat.momentos.p2', btn: 'chat.momentos.btn2', img: 'assets/img/Momentos/Tela2.webp' },
                       { texto: 'chat.momentos.p3' }
                     ],
                     chips: ['projetos'] },
  coinple:         { passos: [
                       { texto: 'chat.coinple.p1', btn: 'chat.coinple.btn1', img: 'assets/img/Coinple/Coinple-IA.webp' },
                       { texto: 'chat.coinple.p2', btn: 'chat.coinple.btn2' },
                       { texto: 'chat.coinple.p3' }
                     ],
                     chips: ['projetos'] },
  sobre:           { passos: ['chat.sobre.p1'],        chips: ['experiencia', 'stack', 'formacao', 'projetos'] },
  contacto:        { passos: ['chat.contacto.p1'],     chips: ['projetos'] },
  experiencia:     { passos: ['chat.experiencia.p1', 'chat.experiencia.p2'], chips: ['stack', 'projetos', 'contacto'] },
  stack:           { passos: ['chat.stack.p1'],        chips: ['projetos', 'contacto'] },
  formacao:        { passos: ['chat.formacao.p1'],     chips: ['experiencia', 'projetos'] },
  disponibilidade: { passos: ['chat.disponibilidade.p1'], chips: ['contacto', 'projetos'] },
  fallback:        { passos: ['chat.fallback.p1'],     chips: ['projetos', 'sobre', 'contacto'] }
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
  { regex: /sobre|about|quem|who|j[eé]ssica|voc[eê]|you/i, id: 'sobre' },
  { regex: /contact|contacto|e-?mail|falar|linkedin|message/i, id: 'contacto' },
  { regex: /experi[eê]ncia|experience|background|hist[oó]ria|history|curr[ií]culo|cv|resume/i, id: 'experiencia' },
  { regex: /stack|ferramenta|tools|figma|html|css|js|javascript|tecnologia/i, id: 'stack' },
  { regex: /forma[cç][aã]o|education|estudo|study|faculdade|university|degree/i, id: 'formacao' },
  { regex: /dispon[ií]vel|freela|contrat|hire|available|work/i, id: 'disponibilidade' }
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
