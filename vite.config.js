import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Supabase's publishable key is public-safe by design, so we expose the
  // Vercel-provisioned SUPABASE_* vars to client code directly instead of
  // duplicating them under VITE_ names.
  envPrefix: ['VITE_', 'SUPABASE_'],
  build: {
    // three.js is now split into its own lazy-loaded chunk (see Card3DCanvasLazy /
    // Hero3DStageLazy / Product3DViewerLazy), so it no longer blocks the initial
    // page load — its size alone doesn't need to trip the default 500kB warning.
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: true,
    // Forwards /api/* to the local Express dev server (see server/dev.js —
    // start it with `npm run dev:api`, or both together with `npm run dev:full`).
    // In production this isn't needed: Vercel serves api/ natively at the same paths.
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
