import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cloudflare-spa-fallback',
        buildStart() {
          const publicDir = path.resolve(import.meta.dirname ?? process.cwd(), 'public');
          const publicRedirects = path.join(publicDir, '_redirects');
          if (fs.existsSync(publicRedirects)) {
            fs.unlinkSync(publicRedirects);
          }
        },
        closeBundle() {
          const distDir = path.resolve(import.meta.dirname ?? process.cwd(), 'dist');
          const distRedirects = path.join(distDir, '_redirects');
          if (fs.existsSync(distRedirects)) {
            fs.unlinkSync(distRedirects);
          }
          const indexHtml = path.join(distDir, 'index.html');
          const fallbackHtml = path.join(distDir, '200.html');
          if (fs.existsSync(indexHtml)) {
            fs.copyFileSync(indexHtml, fallbackHtml);
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) {
              return 'firebase';
            }
            if (id.includes('node_modules/motion') || id.includes('node_modules/canvas-confetti')) {
              return 'animations';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
          }
        }
      }
    }
  };
});
