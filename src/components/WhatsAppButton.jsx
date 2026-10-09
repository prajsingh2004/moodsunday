import { useEffect, useState } from 'react';
import { contact } from '../data/contact';
import { buildWhatsAppUrl, telHref } from '../utils/whatsapp';
import './WhatsAppButton.css';

/** Desktop: floating pill (bottom-right). Mobile: fixed bottom bar with WhatsApp + Call. */
export default function WhatsAppButton() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(id);
  }, []);
  const href = buildWhatsAppUrl();

  return (
    <>
      <a
        className={`wa-pill ${ready ? 'is-ready' : ''}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Mood Sunday on WhatsApp"
      >
        <span className="wa-dot" aria-hidden="true" />
        <span>WhatsApp us</span>
        <span aria-hidden="true">↗</span>
      </a>

      <div className={`wa-bar ${ready ? 'is-ready' : ''}`}>
        <a className="wa-bar__wa" href={href} target="_blank" rel="noopener noreferrer">
          <span className="wa-dot" aria-hidden="true" />
          WhatsApp us
        </a>
        <a className="wa-bar__call" href={telHref} aria-label={`Call ${contact.phoneDisplay}`}>
          Call
        </a>
      </div>
    </>
  );
}
