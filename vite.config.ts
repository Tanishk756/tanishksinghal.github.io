import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configurable base path: defaults to GitHub Pages repository path in production build,
// or '/' for local development and root/custom domain deployments.
export default defineConfig(({ command }) => {
  const base = process.env.VITE_BASE_PATH ?? (command === 'serve' ? '/' : '/tanishksinghal.github.io/');

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
  };
});

