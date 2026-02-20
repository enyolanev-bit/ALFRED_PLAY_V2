/**
 * InteractionHandler.js — Gestion des interactions 3D (drag souris / touch).
 *
 * Permet au visiteur de faire pivoter les objets 3D en glissant
 * horizontalement (souris ou touch) sans bloquer le scroll vertical Lenis.
 *
 * - Seuil de détection : horizontal → rotation objet, vertical → scroll
 * - Amortissement (damping) pour un feel naturel
 * - Retour automatique à la position par défaut après 2s d'inactivité
 * - Fonctionne sur les 7 scènes via sceneManager.scenes
 */

/** Seuil horizontal (px) pour distinguer rotation vs scroll */
const DRAG_THRESHOLD = 8;

/** Sensibilité de la rotation (radians par pixel) */
const ROTATION_SENSITIVITY = 0.008;

/** Facteur d'amortissement (0-1, plus bas = plus smooth) */
const DAMPING = 0.12;

/** Délai avant retour à la position par défaut (ms) */
const RESET_DELAY = 2000;

/** Vitesse de retour à la position par défaut (facteur par frame) */
const RESET_SPEED = 0.05;

class InteractionHandler {
  constructor() {
    /** @type {import('./SceneManager.js').SceneManager|null} */
    this._sceneManager = null;

    /** @type {boolean} */
    this._initialized = false;

    /** @type {boolean} Drag actif ? */
    this._isDragging = false;

    /** @type {boolean} Direction du drag déterminée ? */
    this._directionLocked = false;

    /** @type {boolean} Le drag est horizontal (rotation) ? */
    this._isHorizontalDrag = false;

    /** @type {number} Position X de départ du drag */
    this._startX = 0;

    /** @type {number} Position Y de départ du drag */
    this._startY = 0;

    /** @type {number} Rotation cible (accumulée par le drag) */
    this._targetRotation = 0;

    /** @type {number} Rotation actuelle (avec damping) */
    this._currentRotation = 0;

    /** @type {number|null} Timer de retour à zéro */
    this._resetTimer = null;

    /** @type {boolean} En train de revenir à la position par défaut */
    this._isResetting = false;

    /** @type {number|null} RAF id pour le damping */
    this._rafId = null;

    // Handlers liés (pour pouvoir les retirer proprement)
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  /**
   * Initialise l'InteractionHandler.
   * @param {import('./SceneManager.js').SceneManager} sceneManager
   */
  init(sceneManager) {
    if (this._initialized) return;
    this._initialized = true;
    this._sceneManager = sceneManager;

    // Écouter les événements pointer sur window (le canvas a pointer-events: none)
    window.addEventListener('pointerdown', this._onPointerDown, { passive: true });
    window.addEventListener('pointermove', this._onPointerMove, { passive: false });
    window.addEventListener('pointerup', this._onPointerUp, { passive: true });
    window.addEventListener('pointercancel', this._onPointerUp, { passive: true });

    // Démarrer la boucle de damping
    this._startDampingLoop();
  }

  /**
   * Libère les ressources.
   */
  dispose() {
    window.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerUp);

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    if (this._resetTimer) {
      clearTimeout(this._resetTimer);
      this._resetTimer = null;
    }

    this._initialized = false;
    this._sceneManager = null;
  }

  // --- Handlers d'événements ---

  /**
   * @param {PointerEvent} e
   */
  _onPointerDown(e) {
    // Ignorer les clics sur les éléments UI (boutons, liens)
    if (e.target.closest('button, a, .ui-overlay, .section-decade__inner')) return;

    // Ignorer le clic droit
    if (e.button && e.button !== 0) return;

    this._isDragging = true;
    this._directionLocked = false;
    this._isHorizontalDrag = false;
    this._startX = e.clientX;
    this._startY = e.clientY;

    // Arrêter le retour automatique si l'utilisateur reprend le contrôle
    this._isResetting = false;
    if (this._resetTimer) {
      clearTimeout(this._resetTimer);
      this._resetTimer = null;
    }
  }

  /**
   * @param {PointerEvent} e
   */
  _onPointerMove(e) {
    if (!this._isDragging) return;

    const dx = e.clientX - this._startX;
    const dy = e.clientY - this._startY;

    // Déterminer la direction du drag (une seule fois par drag)
    if (!this._directionLocked) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Attendre le seuil minimum
      if (absDx < DRAG_THRESHOLD && absDy < DRAG_THRESHOLD) return;

      this._directionLocked = true;
      this._isHorizontalDrag = absDx > absDy;

      // Si vertical → laisser le scroll Lenis prendre le relais
      if (!this._isHorizontalDrag) {
        this._isDragging = false;
        return;
      }
    }

    // Drag horizontal → rotation de l'objet 3D
    if (this._isHorizontalDrag) {
      // Empêcher le scroll pendant la rotation
      e.preventDefault();

      this._targetRotation += (e.clientX - this._startX) * ROTATION_SENSITIVITY;
      this._startX = e.clientX;
      this._startY = e.clientY;
    }
  }

  /**
   * @param {PointerEvent} _e
   */
  _onPointerUp(_e) {
    if (!this._isDragging) return;
    this._isDragging = false;
    this._directionLocked = false;

    // Programmer le retour à la position par défaut
    this._scheduleReset();
  }

  // --- Damping & Reset ---

  /**
   * Boucle RAF pour l'amortissement de la rotation et le retour automatique.
   */
  _startDampingLoop() {
    const loop = () => {
      this._rafId = requestAnimationFrame(loop);

      // Retour automatique vers 0
      if (this._isResetting) {
        this._targetRotation += (0 - this._targetRotation) * RESET_SPEED;

        // Considérer terminé quand très proche de 0
        if (Math.abs(this._targetRotation) < 0.001) {
          this._targetRotation = 0;
          this._isResetting = false;
        }
      }

      // Amortissement (lerp vers la cible)
      this._currentRotation += (this._targetRotation - this._currentRotation) * DAMPING;

      // Appliquer la rotation aux scènes actives
      this._applyRotation();
    };

    this._rafId = requestAnimationFrame(loop);
  }

  /**
   * Programme le retour automatique à la position par défaut.
   */
  _scheduleReset() {
    if (this._resetTimer) {
      clearTimeout(this._resetTimer);
    }

    this._resetTimer = setTimeout(() => {
      this._isResetting = true;
      this._resetTimer = null;
    }, RESET_DELAY);
  }

  /**
   * Applique la rotation d'interaction aux scènes actives.
   */
  _applyRotation() {
    if (!this._sceneManager || Math.abs(this._currentRotation) < 0.0001) return;

    for (const id of this._sceneManager.activeScenes) {
      const scene = this._sceneManager.scenes.get(id);
      if (scene?.onInteraction) {
        scene.onInteraction(this._currentRotation);
      }
    }
  }
}

/** Singleton exporté */
export const interactionHandler = new InteractionHandler();
