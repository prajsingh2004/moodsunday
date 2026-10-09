import { useEffect, useState } from 'react';
import { subscribeScroll } from '../utils/scrollStore';
import './Navbar.css';

export function Wordmark({ className = '' }) {
  return (
    <a href="#top" className={`wordmark ${className}`} aria-label="Mood Sunday, back to top">
      <svg className="wordmark__glyph" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4" width="14" height="4" rx="2" />
        <rect x="3" y="10" width="18" height="4" rx="2" />
        <rect x="5" y="16" width="14" height="4" rx="2" />
      </svg>
      <span>MOOD SUNDAY</span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(
    () => subscribeScroll((s) => setScrolled((prev) => (prev === s.y > 12 ? prev : s.y > 12))),
    [],
  );

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <div className="container nav__row">
        <Wordmark />
        <nav className="nav__right" aria-label="Main">
          <a className="nav__link" href="#print">Print</a>
          <a className="nav__link" href="#colours">Colours</a>
          <a className="nav__link" href="#contact">Contact</a>
          <a className="nav__cta" href="#quote">
            <span>Upload file</span>
            <span className="nav__arrow" aria-hidden="true">→</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
