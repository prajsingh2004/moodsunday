import { useState } from 'react';
import { pricing, qualityOrder } from '../data/pricing';
import { usePrint } from '../context/PrintContext';
import ColourPicker from './ColourPicker';
import QuoteCard from './QuoteCard';
import OrderDialog from './OrderDialog';
import './QuoteConfigurator.css';

/** "YOUR PRINT": colour, quality, quantity → live estimate → print dialog. */
export default function QuoteConfigurator({ file, quote, quality, setQuality, quantity, setQuantity }) {
  const { colour } = usePrint();
  const [orderOpen, setOrderOpen] = useState(false);
  const qualityLabel = pricing.quality[quality].label;
  const index = qualityOrder.indexOf(quality);

  const bump = (delta) => setQuantity((q) => Math.min(pricing.maxQuantity, Math.max(1, q + delta)));

  return (
    <div className="cfg">
      <h3 className="cfg__title display">Your print</h3>

      <ColourPicker />

      <div className="cfg__pair">
        <fieldset className="cfg__field">
          <legend>Quality</legend>
          <div className="seg" style={{ '--i': index }}>
            <span className="seg__thumb" aria-hidden="true" />
            {qualityOrder.map((id) => (
              <label key={id} className="seg__opt">
                <input
                  type="radio"
                  name="quality"
                  value={id}
                  checked={quality === id}
                  onChange={() => setQuality(id)}
                />
                <span>{pricing.quality[id].label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="cfg__field">
          <span className="cfg__legend" id="qty-label">Quantity</span>
          <div className="qty" role="group" aria-labelledby="qty-label">
            <button type="button" aria-label="Decrease quantity" onClick={() => bump(-1)} disabled={quantity <= 1}>−</button>
            <output aria-live="polite" aria-label={`Quantity ${quantity}`}>{quantity}</output>
            <button type="button" aria-label="Increase quantity" onClick={() => bump(1)} disabled={quantity >= pricing.maxQuantity}>+</button>
          </div>
        </div>
      </div>

      <QuoteCard
        quote={quote}
        colour={colour}
        qualityLabel={qualityLabel}
        quantity={quantity}
        onPrint={() => setOrderOpen(true)}
      />

      <OrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        fileName={file.name}
        colour={colour}
        qualityLabel={qualityLabel}
        quantity={quantity}
        quote={quote}
      />
    </div>
  );
}
