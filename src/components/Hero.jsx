import { useEffect, useRef } from 'react';
import { usePrint } from '../context/PrintContext';
import { subscribeScroll } from '../utils/scrollStore';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import Button from './ui/Button';
import Heading from './ui/Heading';
import Viewer from './Viewer';
import './Hero.css';

export default function Hero() {
  const { colour } = usePrint();
  const ref = useRef(null);

  // Scroll progress → CSS variable (headline drift). No React re-renders.
  useEffect(
    () => subscribeScroll((s) => ref.current?.style.setProperty('--p', s.progress.toFixed(3))),
    [],
  );

  return (
    <section id="top" ref={ref} className="hero" aria-label="Mood Sunday">
      <div className="container hero__inner">
        <Heading as="h1" immediate lines={['YOU MAKE IT.', 'WE PRINT IT.']} className="hero__title" step={120} />

        <div className="hero__stage">
          <Viewer
            mode="hero"
            eager
            colour={colour}
            label="A 3D-printed twisted vessel slowly rotating, layer lines visible"
          />
        </div>

        <div className="hero__foot">
          <div className="hero__copy">
            <p className="lede">High-quality FDM 3D printing, made in Bandra.</p>
            <p className="hero__meta">FDM · PLA · BANDRA, MUMBAI</p>
          </div>
          <div className="hero__actions">
            <Button href="#quote" arrow="→">Upload your file</Button>
            <Button href={buildWhatsAppUrl()} variant="ghost" arrow="↗" external>WhatsApp us</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
