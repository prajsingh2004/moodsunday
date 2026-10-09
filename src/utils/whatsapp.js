import { contact } from '../data/contact';
import { formatINR, formatDuration } from './format';

export const GREETING = 'Hi Mood Sunday! I want to print a 3D file. Can you help me with a quote?';

export function buildWhatsAppUrl(message = GREETING) {
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const telHref = `tel:${contact.phoneTel}`;

export function buildQuoteMessage({ fileName, colourName, qualityLabel, quantity, quote }) {
  return [
    "Hi Mood Sunday! I'd like to print this file:",
    '',
    `File: ${fileName}`,
    `Colour: ${colourName} PLA`,
    `Quality: ${qualityLabel}`,
    `Quantity: ${quantity}`,
    `Estimated price: ${formatINR(quote.price)}`,
    `Estimated print time: ${formatDuration(quote.printMinutes)}`,
    `Estimated delivery: ${quote.deliveryLabel}`,
    '',
    "That's the website estimate, so please confirm. I'll attach the file in this chat.",
  ].join('\n');
}
