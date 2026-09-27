import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from any sub-path (GitHub Pages, Netlify, Capacitor WebView).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    proxy: { '/api': 'http://localhost:8787' },
  },
  build: { outDir: 'dist', sourcemap: false },
});
