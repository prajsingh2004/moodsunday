import { useEffect, useMemo, useRef, useState } from 'react';
import { usePrint } from '../context/PrintContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { calculateQuote } from '../utils/quoteCalculator';
import Heading from './ui/Heading';
import { Dropzone, FileChip } from './FileUpload';
import QuoteConfigurator from './QuoteConfigurator';
import Viewer from './Viewer';
import './QuoteSection.css';

/** SEE → UPLOAD → QUOTE: the functional heart of the site. */
export default function QuoteSection() {
  const upload = useFileUpload();
  const { colour } = usePrint();
  const [quality, setQuality] = useState('high');
  const [quantity, setQuantity] = useState(1);
  const rightRef = useRef(null);

  const ready = upload.status === 'ready';

  const quote = useMemo(
    () =>
      ready
        ? calculateQuote({ analysis: upload.analysis, fileSizeBytes: upload.file.size, quality, quantity })
        : null,
    [ready, upload.analysis, upload.file, quality, quantity],
  );

  // On small screens, bring the configurator into view once a file is ready.
  useEffect(() => {
    if (ready && window.matchMedia('(max-width: 900px)').matches) {
      rightRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [ready]);

  const dims = upload.analysis?.dimsMm;
  const caption = !ready
    ? ''
    : upload.analysis.previewAvailable
      ? dims
        ? `${Math.round(dims.x)} × ${Math.round(dims.z)} × ${Math.round(dims.y)} mm · drag to rotate`
        : 'Drag to rotate'
      : "No preview for this file type, but we can print it. We'll check it when you send it.";

  return (
    <section id="quote" className="quote" aria-labelledby="quote-heading">
      <div className="container quote__grid">
        <div className="quote__left">
          <Heading lines={['GET A', 'QUOTE.']} id="quote-heading" className="h2 quote__heading" />
          <p className="lede quote__sub">Drop your 3D file. We'll do the rest.</p>

          {ready && (
            <div className="quote__file">
              <FileChip upload={upload} />
              <div className="quote__preview">
                {upload.analysis.previewAvailable ? (
                  <Viewer mode="preview" colour={colour} geometry={upload.analysis.geometry} label="Preview of your file in the chosen colour" />
                ) : (
                  <div className="quote__nopreview" style={{ '--c': colour.hex }} role="img" aria-label="No preview available for this file type">
                    <span>.{upload.file.ext.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <p className="quote__caption">{caption}</p>
            </div>
          )}
        </div>

        <div className="quote__right" ref={rightRef}>
          {ready ? (
            <QuoteConfigurator
              file={upload.file}
              quote={quote}
              quality={quality}
              setQuality={setQuality}
              quantity={quantity}
              setQuantity={setQuantity}
            />
          ) : (
            <Dropzone upload={upload} />
          )}
        </div>
      </div>
    </section>
  );
}
