import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Three.js is loaded with a dynamic import() in src/components/Viewer.jsx,
// so Vite automatically splits it into its own lazy chunk.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 700 },
});
