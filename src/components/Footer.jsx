import { contact } from '../data/contact';
import { buildWhatsAppUrl, telHref } from '../utils/whatsapp';
import './Footer.css';

export default function Footer() {
  const { instagram } = contact;
  return (
    <footer className="footer on-dark">
      <div className="container footer__row">
        <div>
          <p className="footer__brand">MOOD SUNDAY</p>
          <p className="footer__tag">3D PRINTING · BANDRA · MUMBAI</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <a href="#quote">Upload</a>
          <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={telHref}>Call</a>
          {instagram.url ? (
            <a href={instagram.url} target="_blank" rel="noopener noreferrer">Instagram</a>
          ) : (
            <span className="footer__soon">Instagram (soon)</span>
          )}
        </nav>
        <p className="footer__copy">© {contact.year} Mood Sunday</p>
      </div>
    </footer>
  );
}
