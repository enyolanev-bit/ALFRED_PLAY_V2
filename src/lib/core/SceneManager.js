/**
 * SceneManager — Orchestrateur central de la couche Three.js.
 *
 * Responsabilités :
 * - Initialise le WebGLRenderer unique sur le canvas global
 * - Gère la caméra perspective partagée
 * - Pilote la boucle de rendu RAF unique (pas de boucles multiples)
 * - Coordonne les scènes actives (active/désactive selon le scroll)
 * - Ajuste la qualité selon le GPU tier (via gpu-detect)
 */

import * as THREE from 'three';
import { getQualityConfig } from '../utils/gpu-detect.js';

/** Facteur de lerp pour le lissage curseur (0-1, plus bas = plus smooth) */
const CURSOR_LERP = 0.12;

/** Facteur de lerp pour le parallax caméra (plus lent que le curseur = mouvement doux) */
const CAMERA_PARALLAX_LERP = 0.08;
/** Amplitude du parallax caméra en X */
const CAMERA_PARALLAX_X = 0.3;
/** Amplitude du parallax caméra en Y */
const CAMERA_PARALLAX_Y = 0.15;

class SceneManager {
  constructor() {
    /** @type {THREE.WebGLRenderer | null} */
    this.renderer = null;

    /** @type {THREE.PerspectiveCamera | null} */
    this.camera = null;

    /** @type {Map<string, object>} Scènes enregistrées par ID */
    this.scenes = new Map();

    /** @type {Set<string>} IDs des scènes actuellement actives */
    this.activeScenes = new Set();

    /** @type {object | null} Configuration qualité GPU */
    this.qualityConfig = null;

    /** @type {boolean} */
    this.initialized = false;

    /** @type {number} ID de la boucle RAF */
    this._rafId = 0;

    /** @type {boolean} La boucle RAF tourne-t-elle ? */
    this._running = false;

    // --- Curseur normalisé (-1 à +1) avec interpolation douce ---
    /** @type {{ x: number, y: number }} Position lissée (lerp) */
    this.mouse = { x: 0, y: 0 };
    /** @type {{ x: number, y: number }} Position cible brute */
    this._mouseTarget = { x: 0, y: 0 };

    // --- Parallax caméra (lerp séparé, plus doux) ---
    /** @type {{ x: number, y: number }} Offset parallax actuel */
    this._cameraParallax = { x: 0, y: 0 };
    /** @type {{ x: number, y: number, z: number }} Position de base de la caméra */
    this._cameraBasePos = { x: 0, y: 0, z: 5 };

    // --- Raycaster pour détection de clics sur objets 3D ---
    /** @type {THREE.Raycaster} */
    this._raycaster = new THREE.Raycaster();
    /** @type {THREE.Vector2} */
    this._clickNDC = new THREE.Vector2();

    // Bind pour conserver le contexte
    this._onResize = this._onResize.bind(this);
    this._renderLoop = this._renderLoop.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onDeviceOrientation = this._onDeviceOrientation.bind(this);
    this._onCanvasClick = this._onCanvasClick.bind(this);
  }

  /**
   * Initialise le renderer, la caméra et la détection GPU.
   * Doit être appelé une seule fois avec le canvas global.
   *
   * @param {HTMLCanvasElement} canvas — Le canvas WebGL global
   * @returns {Promise<{ tier: number, isMobile: boolean, config: object }>}
   */
  async init(canvas) {
    if (this.initialized) return this.qualityConfig;

    // Détecter le GPU et obtenir la config qualité
    const qualityResult = await getQualityConfig();
    this.qualityConfig = qualityResult;

    // Si tier 0, pas de WebGL — fallback 2D géré ailleurs
    if (qualityResult.tier === 0) {
      this.initialized = true;
      return qualityResult;
    }

    // Créer le renderer unique
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: qualityResult.config.antialias,
      alpha: true,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(qualityResult.config.dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Shadows conditionnels (tier 3 uniquement)
    if (qualityResult.config.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Caméra perspective partagée
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 5);

    // Écouter le redimensionnement
    window.addEventListener('resize', this._onResize);

    // Écouter le curseur (desktop) et le gyroscope (mobile)
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    canvas.addEventListener('click', this._onCanvasClick);
    this._canvas = canvas;
    this._initDeviceOrientation();

    this.initialized = true;
    return qualityResult;
  }

  /**
   * Enregistre une scène avec son ID.
   * L'objet scène doit implémenter : { scene, onScroll?, onInteraction?, dispose? }
   *
   * @param {string} id — Identifiant unique (ex: '1960')
   * @param {object} sceneInstance — Instance de la scène décennie
   */
  registerScene(id, sceneInstance) {
    this.scenes.set(id, sceneInstance);
  }

  /**
   * Retire une scène du registre.
   *
   * @param {string} id
   */
  unregisterScene(id) {
    this.deactivateScene(id);
    this.scenes.delete(id);
  }

  /**
   * Active une scène — elle sera rendue dans la boucle RAF.
   *
   * @param {string} id
   */
  activateScene(id) {
    if (!this.scenes.has(id)) return;
    this.activeScenes.add(id);

    // Démarrer la boucle RAF si elle ne tourne pas encore
    if (!this._running && this.activeScenes.size > 0) {
      this._startRenderLoop();
    }
  }

  /**
   * Désactive une scène — elle ne sera plus rendue.
   *
   * @param {string} id
   */
  deactivateScene(id) {
    this.activeScenes.delete(id);

    // Arrêter la boucle RAF si plus aucune scène active
    if (this._running && this.activeScenes.size === 0) {
      this._stopRenderLoop();
    }
  }

  /**
   * Retourne les informations mémoire du renderer (debug).
   *
   * @returns {{ geometries: number, textures: number } | null}
   */
  getMemoryInfo() {
    if (!this.renderer) return null;
    const info = this.renderer.info;
    return {
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
    };
  }

  /**
   * Nettoyage complet — libère le renderer et les listeners.
   */
  destroy() {
    this._stopRenderLoop();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('deviceorientation', this._onDeviceOrientation);
    if (this._canvas) {
      this._canvas.removeEventListener('click', this._onCanvasClick);
      this._canvas = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.camera = null;
    this.mouse = { x: 0, y: 0 };
    this._mouseTarget = { x: 0, y: 0 };
    this.scenes.clear();
    this.activeScenes.clear();
    this.qualityConfig = null;
    this.initialized = false;
  }

  // --- Méthodes privées ---

  /**
   * Boucle de rendu unique — rend toutes les scènes actives.
   * Interpole le curseur (lerp) et transmet aux scènes.
   */
  _renderLoop() {
    this._rafId = requestAnimationFrame(this._renderLoop);

    if (!this.renderer || !this.camera) return;

    // Interpolation douce du curseur (lerp vers la cible)
    this.mouse.x += (this._mouseTarget.x - this.mouse.x) * CURSOR_LERP;
    this.mouse.y += (this._mouseTarget.y - this.mouse.y) * CURSOR_LERP;

    // Parallax caméra — lerp séparé, plus doux que le curseur
    const targetParallaxX = this.mouse.x * CAMERA_PARALLAX_X;
    const targetParallaxY = this.mouse.y * CAMERA_PARALLAX_Y;
    this._cameraParallax.x += (targetParallaxX - this._cameraParallax.x) * CAMERA_PARALLAX_LERP;
    this._cameraParallax.y += (targetParallaxY - this._cameraParallax.y) * CAMERA_PARALLAX_LERP;

    if (this.camera) {
      this.camera.position.x = this._cameraBasePos.x + this._cameraParallax.x;
      this.camera.position.y = this._cameraBasePos.y + this._cameraParallax.y;
    }

    // Rendre chaque scène active + transmettre le curseur
    for (const id of this.activeScenes) {
      const sceneInstance = this.scenes.get(id);
      if (!sceneInstance?.scene) continue;

      // Transmettre le curseur lissé à la scène si elle implémente onCursorMove
      if (sceneInstance.onCursorMove) {
        sceneInstance.onCursorMove(this.mouse.x, this.mouse.y);
      }

      this.renderer.render(sceneInstance.scene, this.camera);
    }
  }

  /**
   * Démarre la boucle RAF.
   */
  _startRenderLoop() {
    if (this._running) return;
    this._running = true;
    this._rafId = requestAnimationFrame(this._renderLoop);
  }

  /**
   * Arrête la boucle RAF.
   */
  _stopRenderLoop() {
    if (!this._running) return;
    cancelAnimationFrame(this._rafId);
    this._running = false;
  }

  /**
   * Normalise la position du curseur en -1 à +1.
   * Pas de calcul lourd ici — on stocke juste la cible, le lerp tourne dans le RAF.
   * @param {MouseEvent} e
   */
  _onMouseMove(e) {
    this._mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * Fallback mobile : utilise le gyroscope comme source de curseur.
   * beta (inclinaison avant/arrière) → Y, gamma (gauche/droite) → X.
   * @param {DeviceOrientationEvent} e
   */
  _onDeviceOrientation(e) {
    if (e.gamma === null || e.beta === null) return;
    // gamma : -90 à +90 → normaliser en -1 à +1 (clamp à ±45° pour confort)
    this._mouseTarget.x = Math.max(-1, Math.min(1, e.gamma / 45));
    // beta : 0 à 180 → centré autour de 60° (position naturelle du téléphone)
    this._mouseTarget.y = Math.max(-1, Math.min(1, -(e.beta - 60) / 45));
  }

  /**
   * Tente d'activer le gyroscope sur mobile (nécessite permission sur iOS 13+).
   */
  _initDeviceOrientation() {
    // Vérifier si l'API est disponible et si on est sur mobile/tablette
    if (!window.DeviceOrientationEvent) return;

    // iOS 13+ requiert une permission explicite
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // On ne demande pas la permission automatiquement — attendre une interaction
      const requestOnce = () => {
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', this._onDeviceOrientation, { passive: true });
            }
          })
          .catch(() => {});
        // Retirer le listener après la première tentative
        window.removeEventListener('touchstart', requestOnce);
      };
      window.addEventListener('touchstart', requestOnce, { once: true });
    } else {
      // Android / navigateurs sans permission
      window.addEventListener('deviceorientation', this._onDeviceOrientation, { passive: true });
    }
  }

  /**
   * Détecte les clics sur les objets 3D via raycasting.
   * Appelle sceneInstance.onClick(intersect) si la scène l'implémente.
   * @param {MouseEvent} e
   */
  _onCanvasClick(e) {
    if (!this.camera) return;

    // Normaliser la position du clic en NDC (-1 à +1)
    this._clickNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._clickNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this._raycaster.setFromCamera(this._clickNDC, this.camera);

    // Tester chaque scène active
    for (const id of this.activeScenes) {
      const sceneInstance = this.scenes.get(id);
      if (!sceneInstance?.onClick || !sceneInstance.scene) continue;

      const intersects = this._raycaster.intersectObjects(
        sceneInstance.scene.children,
        true
      );

      if (intersects.length > 0) {
        sceneInstance.onClick(intersects[0]);
        break; // Un seul clic traité à la fois
      }
    }
  }

  /**
   * Gère le redimensionnement du viewport.
   */
  _onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }
}

// Singleton — une seule instance pour tout le site
export const sceneManager = new SceneManager();
