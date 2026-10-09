import { useReveal } from '../../hooks/useReveal';
import './Heading.css';

/**
 * Display heading where each line slides up from behind a mask.
 * `lines` is an array of strings, one per visual line.
 */
export default function Heading({ lines, as: Tag = 'h2', id, className = '', immediate = false, step = 90 }) {
  const [ref, shown] = useReveal({ immediate, threshold: 0.35 });
  return (
    <Tag ref={ref} id={id} className={`display ${className} ${shown ? 'is-shown' : ''}`.trim()}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, i) => (
        <span className="line" key={line} aria-hidden="true">
          <span className="line__inner" style={{ transitionDelay: `${i * step}ms` }}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
