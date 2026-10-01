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
        closeBundle() {
          const distDir = path.resolve(import.meta.dirname ?? process.cwd(), 'dist');
          const distRedirects = path.join(distDir, '_redirects');
          fs.writeFileSync(distRedirects, '/*    /index.html   200\n');
          const indexHtml = path.join(distDir, 'index.html');
          const fallbackHtml = path.join(distDir, '200.html');
          const errorHtml = path.join(distDir, '404.html');
          if (fs.existsSync(indexHtml)) {
            fs.copyFileSync(indexHtml, fallbackHtml);
            fs.copyFileSync(indexHtml, errorHtml);
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
      hmr: false,
      watch: null,
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
