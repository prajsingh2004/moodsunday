import { createContext, useContext, useMemo, useState } from 'react';
import { colours, defaultColourId } from '../data/colours';

// One shared colour: the hero object, the quote preview, the colour section
// and the final quote all use the same selection.
const PrintContext = createContext(null);

export function PrintProvider({ children }) {
  const [colourId, setColourId] = useState(defaultColourId);
  const value = useMemo(
    () => ({ colour: colours.find((c) => c.id === colourId), setColourId }),
    [colourId],
  );
  return <PrintContext.Provider value={value}>{children}</PrintContext.Provider>;
}

export function usePrint() {
  const ctx = useContext(PrintContext);
  if (!ctx) throw new Error('usePrint must be used inside <PrintProvider>');
  return ctx;
}
