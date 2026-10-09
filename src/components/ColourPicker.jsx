import { colours } from '../data/colours';
import { usePrint } from '../context/PrintContext';
import './ColourPicker.css';

/** Round PLA swatches. A radiogroup, so arrow keys work. size: "md" | "lg" */
export default function ColourPicker({ size = 'md', label = 'Colour', showName = true }) {
  const { colour, setColourId } = usePrint();

  const onKeyDown = (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const i = colours.findIndex((c) => c.id === colour.id);
    const next = colours[(i + keys[e.key] + colours.length) % colours.length];
    setColourId(next.id);
    e.currentTarget.querySelector(`[data-id="${next.id}"]`)?.focus();
  };

  return (
    <div className={`swatches swatches--${size}`}>
      <div className="swatches__head">
        <span id={`sw-${size}`} className="swatches__label">{label}</span>
        {showName && <span className="swatches__name" aria-live="polite">{colour.name}</span>}
      </div>
      <div className="swatches__row" role="radiogroup" aria-labelledby={`sw-${size}`} onKeyDown={onKeyDown}>
        {colours.map((c) => {
          const selected = c.id === colour.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              data-id={c.id}
              tabIndex={selected ? 0 : -1}
              className={`swatch ${selected ? 'is-selected' : ''}`}
              style={{ '--swatch': c.hex }}
              onClick={() => setColourId(c.id)}
            >
              <span className="swatch__tip" aria-hidden="true">{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
