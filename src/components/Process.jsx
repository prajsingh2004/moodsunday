import { useReveal } from '../hooks/useReveal';
import Heading from './ui/Heading';
import './Process.css';

const glyphs = {
  upload: <path d="M12 30V8m-8 8 8-8 8 8M4 34v2a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2v-2" />,
  choose: (
    <>
      <circle cx="12" cy="14" r="6" />
      <circle cx="26" cy="14" r="6" />
      <circle cx="19" cy="26" r="6" />
    </>
  ),
  print: (
    <>
      <rect x="9" y="8" width="18" height="6" rx="3" />
      <rect x="6" y="17" width="24" height="6" rx="3" />
      <rect x="9" y="26" width="18" height="6" rx="3" />
    </>
  ),
  ship: <path d="M5 13 18 6l13 7v14l-13 7-13-7V13Zm0 0 13 7m0 0 13-7m-13 7v14" />,
};

const steps = [
  { n: '01', label: 'Upload', glyph: 'upload' },
  { n: '02', label: 'Choose', glyph: 'choose' },
  { n: '03', label: 'Print', glyph: 'print' },
  { n: '04', label: 'Ship', glyph: 'ship' },
];

/** THAT'S IT. Four steps, no paragraphs. The line draws itself once, then stays. */
export default function Process() {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  return (
    <section className="process" aria-labelledby="process-heading">
      <div className="container">
        <Heading lines={["THAT'S IT."]} id="process-heading" className="h2 process__heading" />

        <ol ref={ref} className={`process__steps ${shown ? 'is-shown' : ''}`}>
          {steps.map((s, i) => (
            <li key={s.n} className="step" style={{ '--i': i }}>
              <span className="step__n">{s.n}</span>
              <svg className="step__glyph" viewBox="0 0 36 40" aria-hidden="true">{glyphs[s.glyph]}</svg>
              <span className="step__label display">{s.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
