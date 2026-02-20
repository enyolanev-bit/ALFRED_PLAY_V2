/**
 * init.js — Point d'entrée côté client.
 *
 * Initialise le ScrollEngine, les animations GSAP de l'intro et du contact,
 * et gère le déblocage de l'AudioContext via le CTA "Commencer le voyage".
 */

import { scrollEngine } from './ScrollEngine.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  // Timeline d'entrée séquentielle
  const tl = gsap.timeline({ delay: 0.3 });

  tl.to(introElements, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
  });

  // Révéler l'indicateur de scroll après la séquence d'intro
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
 * Gestion du CTA "Commencer le voyage" — unlock audio + scroll vers la première section.
 */
function setupCTA() {
  const ctaButton = document.getElementById('cta-start');
  if (!ctaButton) return;

  ctaButton.addEventListener('click', () => {
    // 1. Débloquer l'AudioContext
    unlockAudioContext();

    // 2. Scroller vers la première section décennie
    const firstDecade = document.querySelector('.section-decade');
    if (firstDecade && scrollEngine.lenis) {
      scrollEngine.lenis.scrollTo(firstDecade, {
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }

    // 3. Marquer que l'intro a été passée (pour le futur AudioManager)
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
