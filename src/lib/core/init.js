/**
 * init.js — Point d'entrée côté client.
 *
 * Initialise le ScrollEngine, le SceneManager (Three.js), le SceneLoader,
 * les animations GSAP de l'intro/contact, et l'AudioContext unlock.
 */

import { scrollEngine } from './ScrollEngine.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// SceneManager et SceneLoader sont importés dynamiquement pour code-splitting.
// Three.js (~150KB gzip) n'est chargé qu'après interaction utilisateur.
/** @type {import('./SceneManager.js').SceneManager | null} */
let sceneManager = null;
/** @type {import('./SceneLoader.js').SceneLoader | null} */
let sceneLoader = null;

/**
 * Déblocage de l'AudioContext — satisfait la politique autoplay des navigateurs.
 * Crée un AudioContext et le résume immédiatement. Émet un événement custom
 * pour que le futur AudioManager (STORY-005) puisse s'y connecter.
 */
function unlockAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Résumer si suspendu (politique autoplay)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stocker le contexte sur window pour que AudioManager puisse le récupérer
    window.__audioContext = ctx;

    // Événement custom pour les systèmes futurs
    window.dispatchEvent(new CustomEvent('audio:unlocked', { detail: { context: ctx } }));
  } catch (e) {
    // Pas de support AudioContext — l'expérience continue sans son
  }
}

/**
 * Animations d'entrée de l'IntroSection — séquence staggered GSAP.
 */
function animateIntro() {
  const introElements = document.querySelectorAll('[data-intro-anim]');
  if (!introElements.length) return;

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to(introElements, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
  });

  const scrollHint = document.getElementById('scroll-hint');
  if (scrollHint) {
    tl.to(scrollHint, {
      opacity: 0.5,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.2');
  }
}

/**
 * Animations de la ContactSection — révélation au scroll.
 */
function animateContact() {
  const contactElements = document.querySelectorAll('[data-contact-anim]');
  if (!contactElements.length) return;

  gsap.to(contactElements, {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 75%',
      once: true,
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
  });
}

/**
 * Initialise le pipeline 3D (SceneManager + SceneLoader).
 * Appelé de façon lazy : après le CTA clic ou quand la première décennie est visible.
 */
let threeInitialized = false;

async function initThreeJS() {
  if (threeInitialized) return;
  threeInitialized = true;

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Import dynamique — Three.js n'est chargé qu'ici (code-splitting)
  const [{ sceneManager: sm }, { sceneLoader: sl }] = await Promise.all([
    import('./SceneManager.js'),
    import('./SceneLoader.js'),
  ]);
  sceneManager = sm;
  sceneLoader = sl;

  // Initialiser le SceneManager (détection GPU + renderer + caméra)
  const qualityResult = await sceneManager.init(canvas);

  // Si tier 0 → pas de 3D, on reste en fallback 2D
  if (qualityResult.tier === 0) {
    document.body.classList.add('no-webgl');
    return;
  }

  // Initialiser le SceneLoader (GLTFLoader + DRACOLoader singletons)
  sceneLoader.init();

  // Observer les sections décennies pour le préchargement / dispose
  const decadeSections = document.querySelectorAll('.section-decade');
  if (decadeSections.length > 0) {
    sceneLoader.observeSections(decadeSections);
  }

  // Exposer les infos de debug sur window (dev only)
  if (import.meta.env.DEV) {
    window.__sceneManager = sceneManager;
    window.__sceneLoader = sceneLoader;
  }
}

/**
 * Gestion du CTA "Commencer le voyage" — unlock audio + init Three.js + scroll.
 */
function setupCTA() {
  const ctaButton = document.getElementById('cta-start');
  if (!ctaButton) return;

  ctaButton.addEventListener('click', () => {
    // 1. Débloquer l'AudioContext
    unlockAudioContext();

    // 2. Initialiser Three.js (lazy — premier déclenchement)
    initThreeJS();

    // 3. Scroller vers la première section décennie
    const firstDecade = document.querySelector('.section-decade');
    if (firstDecade && scrollEngine.lenis) {
      scrollEngine.lenis.scrollTo(firstDecade, {
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }

    // 4. Marquer que l'intro a été passée
    window.__introCompleted = true;
  });
}

/**
 * Initialisation principale — exécutée une fois le DOM prêt.
 */
function init() {
  // Initialiser le smooth scroll (Lenis + GSAP + ScrollTrigger)
  scrollEngine.init();

  // Animations de l'intro (entrée au chargement)
  animateIntro();

  // Setup du CTA "Commencer le voyage"
  setupCTA();

  // Animations du contact (révélation au scroll)
  animateContact();

  // Créer un trigger pour chaque section décennie
  const decadeSections = document.querySelectorAll('.section-decade');

  decadeSections.forEach((section) => {
    const decadeId = section.getAttribute('data-decade');

    scrollEngine.createDecadeTrigger(section, {
      onEnter: () => {
        section.classList.add('is-active');

        // Initialiser Three.js si ce n'est pas encore fait (scroll direct sans CTA)
        initThreeJS();

        // Activer la scène 3D de cette décennie (si le manager est chargé)
        if (sceneManager) {
          sceneManager.activateScene(decadeId);
        }

        window.dispatchEvent(
          new CustomEvent('decade:enter', { detail: { id: decadeId } })
        );
      },
      onLeave: () => {
        section.classList.remove('is-active');

        // Désactiver la scène 3D de cette décennie
        if (sceneManager) {
          sceneManager.deactivateScene(decadeId);
        }

        window.dispatchEvent(
          new CustomEvent('decade:leave', { detail: { id: decadeId } })
        );
      },
      onProgress: (progress) => {
        // Transmettre la progression à la scène 3D pour les animations
        const sceneInstance = sceneManager?.scenes.get(decadeId);
        if (sceneInstance?.onScroll) {
          sceneInstance.onScroll(progress);
        }

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
