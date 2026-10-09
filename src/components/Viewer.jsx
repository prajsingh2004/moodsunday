import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import './Viewer.css';

// Three.js (~500 KB) is split into its own chunk and only fetched when needed.
const PrintViewer = lazy(() => import('./PrintViewer'));

/** Lazy-mounted 3D viewer with a CSS fallback while loading or when WebGL is unavailable. */
export default function Viewer({ mode = 'preview', colour, geometry = null, eager = false, className = '', label }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(eager);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (mounted) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [mounted]);

  const fallback = <div className="viewer__fallback" style={{ '--c': colour.hex }} />;

  return (
    <div
      ref={ref}
      className={`viewer viewer--${mode} ${className}`}
      role="img"
      aria-label={label || '3D preview of a printed object'}
    >
      {failed ? (
        fallback
      ) : mounted ? (
        <Suspense fallback={fallback}>
          <PrintViewer mode={mode} colour={colour} geometry={geometry} onFail={() => setFailed(true)} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
