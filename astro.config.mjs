// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Site statique (SSG) — pas de serveur
  output: 'static',

  vite: {
    // Optimisation du bundling Three.js
    optimizeDeps: {
      include: ['three', 'gsap', 'lenis', 'howler', 'detect-gpu'],
    },
    build: {
      // Three.js (~530KB min) dépasse le seuil par défaut — c'est attendu
      chunkSizeWarningLimit: 600,
    },
  },
});
