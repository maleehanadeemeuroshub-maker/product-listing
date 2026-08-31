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
  // Shopify's Storefront API keys are public-safe by design (that's the point of the
  // storefront vs admin token split), so we expose the Vercel-provisioned SHOPIFY_*
  // vars to client code directly instead of duplicating them under VITE_ names.
  envPrefix: ['VITE_', 'SHOPIFY_', 'SUPABASE_'],
  build: {
    // three.js is now split into its own lazy-loaded chunk (see Card3DCanvasLazy /
    // Hero3DStageLazy / Product3DViewerLazy), so it no longer blocks the initial
    // page load — its size alone doesn't need to trip the default 500kB warning.
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: true,
  },
});
