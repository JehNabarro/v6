/*
  camera.js
  The "one camera": a single source of navigation state that later phases
  (grid choreography, chat) will all read from and react to. Phase 1 sets up
  the seam only. No visual behaviour lives here yet.

  State shape:
    mode:    high level view mode ('home' now; a second mode arrives later,
             giving us "one camera, two modes").
    section: the active route section ('home', 'about', ...).
*/

const state = {
  mode: 'home',
  section: 'home',
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
