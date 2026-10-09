import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../utils/motion';

/** Returns [ref, shown]. `shown` flips true once the element scrolls into view. */
export function useReveal({ immediate = false, threshold = 0.3 } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    if (immediate) {
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate, threshold]);

  return [ref, shown];
}
