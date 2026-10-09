import { useCallback, useEffect, useRef, useState } from 'react';
import { getExtension, ACCEPTED_EXTENSIONS } from '../utils/fileTypes';
import { pricing } from '../data/pricing';

const UNSUPPORTED = {
  title: "That file type isn't supported yet.",
  hint: 'Try STL, 3MF, OBJ or STEP.',
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function validate(file) {
  if (!ACCEPTED_EXTENSIONS.includes(getExtension(file.name))) return UNSUPPORTED;
  if (file.size === 0) return { title: 'That file looks empty.', hint: 'Export it again and give it another go.' };
  if (file.size > pricing.maxFileBytes) {
    return { title: 'That file is over 100 MB.', hint: 'Send it to us on WhatsApp instead.' };
  }
  return null;
}

// A sample so people can try the flow without a file in hand.
const SAMPLE = {
  file: { name: 'mood-sunday-sample.stl', size: 2_457_600, ext: 'stl' },
  analysis: { kind: 'sample', geometry: null, volumeCm3: 190, dimsMm: { x: 72, y: 105, z: 72 }, previewAvailable: true },
};

/**
 * All upload state in one place. Files are read in the browser only.
 * status: idle | loading | ready | error
 */
export function useFileUpload() {
  const [state, setState] = useState({ status: 'idle', file: null, analysis: null, error: null, loadingName: '' });
  const ticket = useRef(0);
  const geometryRef = useRef(null);

  const disposeGeometry = () => {
    geometryRef.current?.dispose();
    geometryRef.current = null;
  };
  useEffect(() => disposeGeometry, []);

  const accept = useCallback(async (file) => {
    if (!file) return;
    const problem = validate(file);
    if (problem) {
      setState((s) => ({ ...s, status: s.status === 'ready' ? 'ready' : 'error', error: problem }));
      return;
    }
    const id = ++ticket.current;
    setState((s) => ({ ...s, status: 'loading', error: null, loadingName: file.name }));
    try {
      // parse3d pulls in three.js, so it is only loaded when a file is actually chosen
      const { analyseFile } = await import('../utils/parse3d');
      const [analysis] = await Promise.all([analyseFile(file), wait(900)]);
      if (id !== ticket.current) return;
      disposeGeometry();
      geometryRef.current = analysis.geometry;
      setState({
        status: 'ready',
        file: { name: file.name, size: file.size, ext: getExtension(file.name) },
        analysis,
        error: null,
        loadingName: '',
      });
    } catch (err) {
      if (id !== ticket.current) return;
      setState((s) => ({
        ...s,
        status: s.file ? 'ready' : 'error',
        error: { title: "We couldn't read that file.", hint: 'Export it again, or send it on WhatsApp.' },
      }));
    }
  }, []);

  const loadSample = useCallback(async () => {
    const id = ++ticket.current;
    setState((s) => ({ ...s, status: 'loading', error: null, loadingName: SAMPLE.file.name }));
    await wait(700);
    if (id !== ticket.current) return;
    disposeGeometry();
    setState({ status: 'ready', file: SAMPLE.file, analysis: SAMPLE.analysis, error: null, loadingName: '' });
  }, []);

  const remove = useCallback(() => {
    ticket.current++;
    disposeGeometry();
    setState({ status: 'idle', file: null, analysis: null, error: null, loadingName: '' });
  }, []);

  return { ...state, accept, loadSample, remove };
}
