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

    // Bind pour conserver le contexte
    this._onResize = this._onResize.bind(this);
    this._renderLoop = this._renderLoop.bind(this);
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

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.camera = null;
    this.scenes.clear();
    this.activeScenes.clear();
    this.qualityConfig = null;
    this.initialized = false;
  }

  // --- Méthodes privées ---

  /**
   * Boucle de rendu unique — rend toutes les scènes actives.
   */
  _renderLoop() {
    this._rafId = requestAnimationFrame(this._renderLoop);

    if (!this.renderer || !this.camera) return;

    // Rendre chaque scène active
    for (const id of this.activeScenes) {
      const sceneInstance = this.scenes.get(id);
      if (sceneInstance?.scene) {
        this.renderer.render(sceneInstance.scene, this.camera);
      }
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
