import { useTweenedNumber } from '../hooks/useTweenedNumber';
import { formatDuration, formatINR } from '../utils/format';
import Button from './ui/Button';
import './QuoteCard.css';

function Row({ label, children }) {
  return (
    <div className="qc__row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** The "ESTIMATED PRINT" receipt. Numbers tween when settings change. */
export default function QuoteCard({ quote, colour, qualityLabel, quantity, onPrint }) {
  const price = useTweenedNumber(quote.price);
  const grams = useTweenedNumber(quote.gramsPerPart, 380);
  const minutes = useTweenedNumber(quote.printMinutes, 380);

  return (
    <section className="qc" aria-labelledby="qc-title">
      <header className="qc__head">
        <h3 id="qc-title" className="qc__title">Estimated print</h3>
        <span className="qc__tag">Estimated quote</span>
      </header>

      <dl className="qc__rows">
        <Row label="Material">PLA</Row>
        <Row label="Colour">{colour.name}</Row>
        <Row label="Quality">{qualityLabel}</Row>
        <Row label="Quantity">{quantity}</Row>
        <Row label="Estimated weight">
          {Math.round(grams)}g{quantity > 1 ? ' each' : ''}
        </Row>
        <Row label="Estimated print time">{formatDuration(minutes)}</Row>
        <Row label="Estimated delivery">{quote.deliveryLabel}</Row>
      </dl>

      <div className="qc__price">
        <span aria-hidden="true" className="qc__amount">{formatINR(price)}</span>
        <span className="sr-only" aria-live="polite">Estimated price {formatINR(quote.price)}</span>
      </div>

      <Button variant="primary" arrow="→" className="qc__cta" onClick={onPrint}>
        Print this
      </Button>

      <p className="qc__note">
        {quote.isRough
          ? "Rough estimate. We can't read this file type in the browser, so we'll check it and confirm the price."
          : 'Estimate only, not an invoice. We confirm the final price on WhatsApp.'}
        {quote.tooBig && ' This one looks big, so we will check it fits.'}
      </p>
    </section>
  );
}
