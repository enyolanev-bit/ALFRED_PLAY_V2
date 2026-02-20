/**
 * init.js — Point d'entrée côté client.
 *
 * Initialise le ScrollEngine et crée les triggers pour chaque section décennie.
 * Les managers Three.js et Audio seront ajoutés dans les stories suivantes.
 */

import { scrollEngine } from './ScrollEngine.js';

/**
 * Initialisation principale — exécutée une fois le DOM prêt.
 */
function init() {
  // Initialiser le smooth scroll (Lenis + GSAP + ScrollTrigger)
  scrollEngine.init();

  // Créer un trigger pour chaque section décennie
  const decadeSections = document.querySelectorAll('.section-decade');

  decadeSections.forEach((section) => {
    const decadeId = section.getAttribute('data-decade');

    scrollEngine.createDecadeTrigger(section, {
      onEnter: () => {
        // Marquer la section active
        section.classList.add('is-active');
        // Événement custom pour les autres systèmes (audio, 3D, etc.)
        window.dispatchEvent(
          new CustomEvent('decade:enter', { detail: { id: decadeId } })
        );
      },
      onLeave: () => {
        section.classList.remove('is-active');
        window.dispatchEvent(
          new CustomEvent('decade:leave', { detail: { id: decadeId } })
        );
      },
      onProgress: (progress) => {
        // Émettre la progression pour les animations futures
        window.dispatchEvent(
          new CustomEvent('decade:progress', {
            detail: { id: decadeId, progress },
          })
        );
      },
    });
  });
}

// Lancer l'init quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
