/**
 * init.js — Point d'entrée côté client.
 *
 * Initialise le ScrollEngine, l'AudioManager, le SceneManager (Three.js),
 * le SceneLoader, les animations GSAP de l'intro/contact, et l'AudioContext unlock.
 */

import { scrollEngine } from './ScrollEngine.js';
import { audioManager } from './AudioManager.js';
import { interactionHandler } from './InteractionHandler.js';
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
 * Crée un AudioContext et le résume immédiatement.
 * Débloque l'AudioManager et émet un événement pour afficher le bouton audio.
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

    // Stocker le contexte sur window pour référence
    window.__audioContext = ctx;

    // Débloquer l'AudioManager (résume aussi le contexte Howler)
    audioManager.unlock();

    // Événement custom pour les composants UI (AudioToggle)
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
 * Progressive Disclosure — révélation séquentielle des éléments de chaque section.
 * Utilise gsap.timeline() avec ScrollTrigger par section pour garantir l'ordre :
 * 1. Chiffre décennie (scale 0.8→1 + opacity)
 * 2. Titre (fade-in + slide-up)
 * 3. Sous-titre (fade-in + slide-up)
 * 4. Histoire personnelle (fade-in + slide-up)
 * 5. Texte historique (fade-in + slide-up)
 * 6. Teaser Zeigarnik (fade-in)
 *
 * Inclut aussi l'animation background-color par décennie (Partie B).
 */
function animateDecadeTexts() {
  const sections = document.querySelectorAll('.section-decade');

  sections.forEach((section) => {
    const bgColor = section.getAttribute('data-bg-color');

    // Timeline scrubée au scroll pour le stagger séquentiel
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'top 10%',
        scrub: 0.8,
      },
    });

    // 1. Chiffre décennie — scale de 0.8 à 1 + opacity 0→0.3
    const number = section.querySelector('[data-decade-number]');
    if (number) {
      tl.to(number, {
        opacity: 0.3,
        scale: 1,
        duration: 0.3,
        ease: 'none',
      }, 0);
    }

    // 2. Titre — fade-in + slide-up (délai 0.2)
    const title = section.querySelector('[data-decade-title]');
    if (title) {
      tl.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'none',
      }, 0.2);
    }

    // 3. Sous-titre — fade-in + slide-up (délai 0.3)
    const subtitle = section.querySelector('[data-decade-subtitle]');
    if (subtitle) {
      tl.to(subtitle, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'none',
      }, 0.3);
    }

    // 4. Histoire personnelle — fade-in + slide-up (délai 0.5)
    const personal = section.querySelector('[data-decade-personal]');
    if (personal) {
      tl.to(personal, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'none',
      }, 0.5);
    }

    // 5. Texte historique — fade-in + slide-up (délai 0.8)
    const history = section.querySelector('[data-decade-text]');
    if (history) {
      tl.to(history, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'none',
      }, 0.8);
    }

    // 6. Teaser Zeigarnik — fade-in en dernier
    const teaser = section.querySelector('.section-decade__teaser');
    if (teaser) {
      tl.to(teaser, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'none',
      }, 1.0);
    }

    // Background-color par décennie — fondu au scroll
    if (bgColor) {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'top 30%',
          scrub: 0.5,
        },
        backgroundColor: bgColor,
        ease: 'none',
      });

      // Fondu sortant — retour transparent en quittant la section
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'bottom 40%',
          end: 'bottom 10%',
          scrub: 0.5,
        },
        backgroundColor: 'transparent',
        ease: 'none',
      });
    }
  });
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
 *
 * Retourne une Promise partagée — tous les appelants attendent la même initialisation.
 * Corrige la race condition où onEnter appelait activateScene() avant la fin du chargement.
 */
/** @type {Promise<void> | null} */
let threeInitPromise = null;

function initThreeJS() {
  if (threeInitPromise) return threeInitPromise;

  threeInitPromise = (async () => {
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

    // Initialiser l'InteractionHandler (rotation drag/touch sur les objets 3D)
    interactionHandler.init(sceneManager);

    // Exposer les infos de debug sur window (dev only)
    if (import.meta.env.DEV) {
      window.__sceneManager = sceneManager;
      window.__sceneLoader = sceneLoader;
    }
  })();

  return threeInitPromise;
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

  // Initialiser l'AudioManager (écoute les événements decade:enter / audio:toggle)
  audioManager.init();

  // Animations de l'intro (entrée au chargement)
  animateIntro();

  // Setup du CTA "Commencer le voyage"
  setupCTA();

  // Animations des textes historiques (progressive disclosure au scroll)
  animateDecadeTexts();

  // Animations du contact (révélation au scroll)
  animateContact();

  // Créer un trigger pour chaque section décennie
  const decadeSections = document.querySelectorAll('.section-decade');

  decadeSections.forEach((section) => {
    const decadeId = section.getAttribute('data-decade');

    scrollEngine.createDecadeTrigger(section, {
      onEnter: async () => {
        section.classList.add('is-active');

        // Attendre que Three.js soit complètement initialisé (corrige la race condition)
        await initThreeJS();

        // Précharger la scène de cette décennie et l'activer
        if (sceneManager && sceneLoader) {
          await sceneLoader.preload(decadeId);
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
