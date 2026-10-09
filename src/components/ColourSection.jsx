import { usePrint } from '../context/PrintContext';
import Heading from './ui/Heading';
import ColourPicker from './ColourPicker';
import Viewer from './Viewer';
import './ColourSection.css';

/** MAKE IT YOURS. Same object, any PLA colour. */
export default function ColourSection() {
  const { colour } = usePrint();
  return (
    <section id="colours" className="colours" aria-labelledby="colours-heading">
      <div className="container colours__grid">
        <div className="colours__copy">
          <Heading lines={['MAKE IT', 'YOURS.']} id="colours-heading" className="h2 colours__heading" />

          <p className="colours__name display" aria-hidden="true" key={colour.id}>{colour.name}</p>
          <ColourPicker size="lg" label="PLA colour" showName={false} />
          <p className="colours__hint muted">Pick a colour. Drag the object.</p>
        </div>

        <div className="colours__stage">
          <Viewer mode="preview" colour={colour} label={`The printed object in ${colour.name}`} />
        </div>
      </div>
    </section>
  );
}
