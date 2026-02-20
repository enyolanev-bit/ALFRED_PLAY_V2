/**
 * ScrollEngine — Synchronisation Lenis + GSAP + ScrollTrigger.
 *
 * Pattern officiel : Lenis sans autoRaf, piloté par le ticker GSAP.
 * - Lenis gère le smooth scroll (inertie, easing)
 * - GSAP ticker pilote lenis.raf() en millisecondes
 * - ScrollTrigger est mis à jour à chaque frame Lenis
 * - lagSmoothing(0) pour une synchronisation parfaite
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

class ScrollEngine {
  constructor() {
    /** @type {Lenis | null} */
    this.lenis = null;

    /** @type {ScrollTrigger[]} */
    this.triggers = [];

    /** @type {boolean} */
    this.initialized = false;
  }

  /**
   * Initialise Lenis + GSAP ticker + ScrollTrigger.
   * Doit être appelé une seule fois, après le DOM ready.
   */
  init() {
    if (this.initialized) return;

    // Lenis SANS autoRaf — GSAP prend le contrôle
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2, // Meilleure réactivité touch mobile
    });

    // Synchroniser Lenis → ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    // GSAP ticker pilote Lenis (time en secondes → convertir en millisecondes)
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    // Désactiver lag smoothing pour sync parfaite Lenis/GSAP
    gsap.ticker.lagSmoothing(0);

    this.initialized = true;
  }

  /**
   * Crée un ScrollTrigger pour une section décennie.
   * @param {HTMLElement} element — L'élément DOM de la section
   * @param {Object} callbacks — Callbacks optionnels
   * @param {Function} [callbacks.onEnter] — Quand la section entre dans le viewport
   * @param {Function} [callbacks.onLeave] — Quand la section quitte le viewport
   * @param {Function} [callbacks.onProgress] — Progression du scroll dans la section (0-1)
   * @returns {ScrollTrigger}
   */
  createDecadeTrigger(element, { onEnter, onLeave, onProgress } = {}) {
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => onEnter?.(),
      onLeave: () => onLeave?.(),
      onEnterBack: () => onEnter?.(),
      onLeaveBack: () => onLeave?.(),
      onUpdate: (self) => onProgress?.(self.progress),
    });

    this.triggers.push(trigger);
    return trigger;
  }

  /**
   * Retourne la progression globale du scroll (0-1).
   * @returns {number}
   */
  getProgress() {
    if (!this.lenis) return 0;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return 0;
    return this.lenis.scroll / scrollHeight;
  }

  /**
   * Nettoyage complet — appelé lors du démontage.
   */
  destroy() {
    this.triggers.forEach((t) => t.kill());
    this.triggers = [];

    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = null;
    }

    this.initialized = false;
  }
}

// Singleton — une seule instance pour tout le site
export const scrollEngine = new ScrollEngine();
