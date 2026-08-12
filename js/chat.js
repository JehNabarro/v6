/*
  chat.js
  The chat seam.

  The hero search field is the chat in its RESTING state. When the visitor
  submits the field or clicks a quick action, the chosen intent is handed here
  through abrirChat(intent).

  Phase 2 keeps this a documented no-op: it only logs. Phase 3 implements the
  real behaviour and will decide whether the resting search field morphs into
  the fixed #chat element in body, or simply hands the intent to it. Phase 2
  deliberately hardcodes nothing that would block either path: it does not
  touch the layout, does not navigate, and does not assume where the chat UI
  lives. It only records the intent (on camera state, done by the caller) and
  calls this function.
*/

function abrirChat(intent) {
  // Placeholder seam. Phase 3 replaces the body of this function.
  console.log(`abrirChat (seam): intent = ${JSON.stringify(intent)} (Phase 3 will implement)`);
}

export default { abrirChat };
export { abrirChat };
