import Heading from './ui/Heading';
import './PrinterSection.css';

const LAYERS = [0, 1, 2, 3, 4, 5, 6];

/** A stylised enclosed printer, drawn in SVG. Not a photo or the manufacturer's artwork. */
function PrinterArt() {
  return (
    <svg className="printer__art" viewBox="0 0 560 520" role="img" aria-label="Illustration of an enclosed 3D printer with a layered object on its bed">
      <ellipse cx="280" cy="492" rx="210" ry="14" fill="rgba(23,22,27,0.18)" />
      {/* body */}
      <rect x="70" y="40" width="420" height="440" rx="34" fill="#17161B" />
      <rect x="92" y="62" width="376" height="330" rx="22" fill="#2b2933" />
      {/* glass */}
      <rect x="100" y="70" width="360" height="314" rx="16" fill="#f2efe9" opacity="0.16" />
      <path d="M118 84 L214 84 L150 370 L118 370 Z" fill="#fff" opacity="0.07" />
      {/* gantry + toolhead */}
      <g className="printer__gantry">
        <rect x="108" y="128" width="344" height="10" rx="5" fill="#8c8a94" />
        <g className="printer__head">
          <rect x="246" y="116" width="52" height="40" rx="10" fill="#f2efe9" />
          <rect x="264" y="154" width="16" height="14" rx="3" fill="#BBA8FF" />
        </g>
      </g>
      {/* bed */}
      <rect x="116" y="352" width="328" height="12" rx="6" fill="#8c8a94" />
      {/* printed object, layer by layer */}
      <g>
        {LAYERS.map((i) => (
          <rect
            key={i}
            className="printer__layer"
            x={226 + i * 3 - (i > 3 ? (i - 3) * 8 : 0)}
            y={338 - i * 14}
            width={108 - i * 6 + (i > 3 ? (i - 3) * 16 : 0)}
            height="12"
            rx="6"
            fill="#BBA8FF"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </g>
      {/* front panel */}
      <rect x="92" y="404" width="376" height="56" rx="16" fill="#0f0e12" />
      <circle cx="124" cy="432" r="7" fill="#25d366" />
      <text x="146" y="438" fill="#f2efe9" fontFamily="'Space Grotesk Variable', sans-serif" fontWeight="700" fontSize="18" letterSpacing="1.5">X2D</text>
      <rect x="360" y="424" width="84" height="16" rx="8" fill="#2b2933" />
    </svg>
  );
}

export default function PrinterSection() {
  return (
    <section id="print" className="printer" aria-labelledby="printer-heading">
      <div className="container printer__grid">
        <div className="printer__copy">
          <Heading lines={['PRINTED ON', 'BAMBU LAB X2D.']} id="printer-heading" className="h2 printer__heading" />
          <p className="lede printer__sub">FDM · PLA · High quality</p>
          <ul className="printer__list">
            <li>Clean surfaces</li>
            <li>Sharp details</li>
            <li>Consistent prints</li>
          </ul>
        </div>
        <div className="printer__visual">
          <PrinterArt />
        </div>
      </div>
    </section>
  );
}
