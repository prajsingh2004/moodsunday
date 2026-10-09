import { PrintProvider } from './context/PrintContext.jsx';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import QuoteSection from './components/QuoteSection';
import PrinterSection from './components/PrinterSection';
import ColourSection from './components/ColourSection';
import Process from './components/Process';
import Local from './components/Local';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <PrintProvider>
      <a className="skip-link" href="#quote">Skip to quote</a>
      <Navbar />
      <main>
        <Hero />
        <QuoteSection />
        <PrinterSection />
        <ColourSection />
        <Process />
        <Local />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </PrintProvider>
  );
}
