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
  },
});
