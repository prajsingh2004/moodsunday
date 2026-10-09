import { useEffect, useRef, useState } from 'react';
import { easeOutCubic, prefersReducedMotion } from '../utils/motion';

/** Smoothly animates a number towards `target`. */
export function useTweenedNumber(target, duration = 520) {
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion() || current.current === target) {
      current.current = target;
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    const origin = current.current;
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = origin + (target - origin) * easeOutCubic(t);
      current.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
