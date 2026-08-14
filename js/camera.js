/*
  camera.js
  The "one camera": a single source of navigation state that the phases read
  from and react to. "One camera, two modes": the home and the chat share this
  single state, and opening the chat is a MODE change, not a new route.

  State shape:
    mode:    high level view mode. 'home' is the resting hero; 'chat' is the
             expanded chat panel. The hash does not change between them.
    section: the active route section ('home', 'about', ...).
    intent:  the last intent handed to the chat (a chip id or free text), or
             null at rest. Recorded by the home hero and by chat.js.
*/

const state = {
  mode: 'home',
  section: 'home',
  intent: null,
};

const subscribers = new Set();

/* Return a shallow copy so callers cannot mutate state directly. */
function get() {
  return { ...state };
}

/*
  Merge a patch into the state and notify subscribers.
  Only notifies when something actually changed.
*/
function set(patch) {
  let changed = false;
  for (const key of Object.keys(patch)) {
    if (state[key] !== patch[key]) {
      state[key] = patch[key];
      changed = true;
    }
  }
  if (changed) {
    const snapshot = get();
    for (const fn of subscribers) {
      fn(snapshot);
    }
  }
  return get();
}

/*
  Subscribe to state changes. Returns an unsubscribe function.
  The callback receives a snapshot of the current state.
*/
function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

const camera = { get, set, subscribe };

/* Mirror on window for quick inspection and for later phases. */
if (typeof window !== 'undefined') {
  window.camera = camera;
}

export default camera;
export { get, set, subscribe };
