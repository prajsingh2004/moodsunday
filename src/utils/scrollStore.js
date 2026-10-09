import { clamp } from './motion';

// One shared, rAF-throttled scroll listener. Components subscribe instead of
// each adding their own listener. `progress` is 0 → 1 across the first screen.
const listeners = new Set();
export const scrollStore = { y: 0, progress: 0 };

let ticking = false;
let started = false;

function update() {
  ticking = false;
  scrollStore.y = window.scrollY;
  scrollStore.progress = clamp(window.scrollY / (window.innerHeight * 0.9));
  listeners.forEach((fn) => fn(scrollStore));
}

export function startScrollStore() {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

export function subscribeScroll(fn) {
  listeners.add(fn);
  fn(scrollStore);
  return () => listeners.delete(fn);
}
