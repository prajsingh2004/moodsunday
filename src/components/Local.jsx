import { contact } from '../data/contact';
import Heading from './ui/Heading';
import './Local.css';

/** MADE IN BANDRA. A small abstract coastline + pin. No map. */
export default function Local() {
  return (
    <section className="local" aria-labelledby="local-heading">
      <div className="container local__grid">
        <div className="local__copy">
          <Heading lines={['MADE IN', 'BANDRA.']} id="local-heading" className="h2 local__heading" />
          <p className="lede">{contact.location}</p>
          <p className="muted">Pickup available · Mumbai delivery</p>
        </div>

        <figure className="local__art" aria-label={`Location marker, ${contact.coordinates}`}>
          <svg viewBox="0 0 420 300" aria-hidden="true">
            <g fill="none" stroke="var(--ink)" strokeWidth="1.4" opacity="0.55">
              <path d="M10 220c60-20 90 20 150 6s70-60 130-52 90 40 120 14" />
              <path d="M10 196c60-20 90 20 150 6s70-60 130-52 90 40 120 14" />
              <path d="M10 172c60-20 90 20 150 6s70-60 130-52 90 40 120 14" />
              <path d="M10 148c60-20 90 20 150 6s70-60 130-52 90 40 120 14" />
              <path d="M10 244c60-20 90 20 150 6s70-60 130-52 90 40 120 14" />
            </g>
            <circle className="local__pulse" cx="238" cy="132" r="14" fill="var(--accent)" />
            <circle cx="238" cy="132" r="7" fill="var(--ink)" />
          </svg>
          <figcaption>{contact.coordinates}</figcaption>
        </figure>
      </div>
    </section>
  );
}
