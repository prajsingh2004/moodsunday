import { useEffect, useRef } from 'react';
import { formatDuration, formatINR } from '../utils/format';
import { buildQuoteMessage, buildWhatsAppUrl, telHref } from '../utils/whatsapp';
import Button from './ui/Button';
import './OrderDialog.css';

/**
 * Native <dialog>: focus trap, Esc to close and inert background come for free.
 * Nothing is submitted anywhere — this only builds a WhatsApp message.
 */
export default function OrderDialog({ open, onClose, fileName, colour, qualityLabel, quantity, quote }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const message = buildQuoteMessage({ fileName, colourName: colour.name, qualityLabel, quantity, quote });

  return (
    <dialog
      ref={ref}
      className="order"
      aria-labelledby="order-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="order__panel">
        <h2 id="order-title" className="display order__title">Ready to print?</h2>
        <p className="order__lede">Send these details to us on WhatsApp.</p>

        <div className="order__summary">
          <span className="order__dot" style={{ background: colour.hex }} aria-hidden="true" />
          <div>
            <p className="order__spec">{colour.name} PLA · {qualityLabel} quality · Qty {quantity}</p>
            <p className="order__price">
              {formatINR(quote.price)} <span>· {formatDuration(quote.printMinutes)} · {quote.deliveryLabel}</span>
            </p>
          </div>
        </div>

        <p className="order__note">
          Nothing is charged and nothing is uploaded. Your file stays on your device, so attach it in the chat.
          The price is an estimate until we confirm it.
        </p>

        <div className="order__actions">
          <Button href={buildWhatsAppUrl(message)} variant="primary" arrow="→" external>Send to WhatsApp</Button>
          <Button href={telHref} variant="ghost">Call us</Button>
          <button type="button" className="order__change" onClick={onClose}>Change details</button>
        </div>
      </div>
    </dialog>
  );
}
