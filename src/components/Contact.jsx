import { contact } from '../data/contact';
import { buildWhatsAppUrl, telHref } from '../utils/whatsapp';
import Button from './ui/Button';
import Heading from './ui/Heading';
import './Contact.css';

/** Final CTA. Dark, loud, one job. */
export default function Contact() {
  const { instagram } = contact;
  return (
    <section id="contact" className="contact on-dark" aria-labelledby="contact-heading">
      <div className="container">
        <Heading lines={['GOT A FILE?', "LET'S PRINT IT."]} id="contact-heading" className="h2 contact__heading" />

        <div className="contact__actions">
          <Button href="#quote" variant="accent" arrow="→">Upload your file</Button>
          <Button href={buildWhatsAppUrl()} variant="ghost" tone="dark" arrow="↗" external>WhatsApp us</Button>
        </div>

        <div className="contact__details">
          <div>
            <p className="contact__brand">MOOD SUNDAY</p>
            <p>{contact.location.toUpperCase()}</p>
          </div>
          <div>
            <p>
              <a href={telHref}>{contact.phoneDisplay}</a>
            </p>
            <p>
              <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              {' · '}
              <a href={telHref}>Call</a>
            </p>
          </div>
          <div>
            <p>
              Instagram →{' '}
              {instagram.url ? (
                <a href={instagram.url} target="_blank" rel="noopener noreferrer">{instagram.handle}</a>
              ) : (
                <span>{instagram.handle}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
