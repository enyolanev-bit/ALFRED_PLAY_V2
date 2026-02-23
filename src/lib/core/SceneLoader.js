/**
 * SceneLoader — Chargement et gestion du cycle de vie des scènes 3D.
 *
 * Responsabilités :
 * - Singleton GLTFLoader + DRACOLoader (1 seule instance)
 * - Import dynamique des modules scène (Scene1960.js, etc.)
 * - Préchargement via IntersectionObserver (rootMargin 200px)
 * - Dispose complet quand hors viewport
 * - Maximum 2-3 scènes en mémoire simultanément
 */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { DECADES } from '../config/decades.js';
import { disposeObject } from '../utils/dispose.js';
import { sceneManager } from './SceneManager.js';

/** Nombre max de scènes en mémoire simultanément */
const MAX_SCENES_IN_MEMORY = 3;

class SceneLoader {
  constructor() {
    /** @type {GLTFLoader | null} */
    this.gltfLoader = null;

    /** @type {DRACOLoader | null} */
    this.dracoLoader = null;

    /** @type {Map<string, object>} Scènes instanciées en mémoire */
    this.loadedScenes = new Map();

    /** @type {Map<string, Promise>} Chargements en cours */
    this.pendingLoads = new Map();

    /** @type {string[]} Ordre d'utilisation des scènes (LRU) */
    this._lruOrder = [];

    /** @type {IntersectionObserver | null} */
    this._observer = null;

    /** @type {boolean} */
    this.initialized = false;
  }

  /**
   * Initialise les loaders (singleton) et l'IntersectionObserver.
   * Doit être appelé une seule fois.
   */
  init() {
    if (this.initialized) return;

    // DRACOLoader — décode les .glb compressés via Web Worker
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.dracoLoader.setDecoderConfig({ type: 'wasm' });

    // GLTFLoader — utilise Draco pour les modèles compressés
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.initialized = true;
  }

  /**
   * Observe les sections décennies et gère le préchargement / dispose.
   * Appelé après que les éléments DOM existent.
   *
   * @param {NodeListOf<Element>} sectionElements — Les éléments .section-decade
   */
  observeSections(sectionElements) {
    // Nettoyer un éventuel observer précédent
    if (this._observer) {
      this._observer.disconnect();
    }

    this._observer = new IntersectionObserver(
      (entries) => this._onIntersection(entries),
      {
        rootMargin: '200px 0px',
        threshold: 0,
      }
    );

    sectionElements.forEach((section) => {
      this._observer.observe(section);
    });
  }

  /**
   * Précharge une scène (import dynamique + chargement du modèle .glb).
   * Ne bloque pas — retourne une Promise.
   *
   * @param {string} decadeId — ID de la décennie (ex: '1960')
   * @returns {Promise<object | null>} L'instance de scène ou null
   */
  async preload(decadeId) {
    // Déjà en mémoire
    if (this.loadedScenes.has(decadeId)) {
      this._touchLru(decadeId);
      return this.loadedScenes.get(decadeId);
    }

    // Déjà en cours de chargement
    if (this.pendingLoads.has(decadeId)) {
      return this.pendingLoads.get(decadeId);
    }

    const loadPromise = this._loadScene(decadeId);
    this.pendingLoads.set(decadeId, loadPromise);

    try {
      const sceneInstance = await loadPromise;
      this.pendingLoads.delete(decadeId);

      if (sceneInstance) {
        this.loadedScenes.set(decadeId, sceneInstance);
        this._touchLru(decadeId);
        this._enforceMemoryLimit();

        // Enregistrer dans le SceneManager
        sceneManager.registerScene(decadeId, sceneInstance);
      }

      return sceneInstance;
    } catch (err) {
      this.pendingLoads.delete(decadeId);
      console.warn(`[SceneLoader] Échec du chargement de la scène ${decadeId}:`, err);
      return null;
    }
  }

  /**
   * Libère une scène et ses ressources GPU.
   *
   * @param {string} decadeId
   */
  dispose(decadeId) {
    const sceneInstance = this.loadedScenes.get(decadeId);
    if (!sceneInstance) return;

    // Désactiver dans le SceneManager
    sceneManager.deactivateScene(decadeId);
    sceneManager.unregisterScene(decadeId);

    // Dispose des ressources Three.js
    if (sceneInstance.scene) {
      disposeObject(sceneInstance.scene);
    }

    // Appeler le dispose custom de la scène si défini
    if (typeof sceneInstance.dispose === 'function') {
      sceneInstance.dispose();
    }

    this.loadedScenes.delete(decadeId);
    this._removeLru(decadeId);
  }

  /**
   * Retourne les statistiques mémoire (nombre de scènes chargées).
   *
   * @returns {{ loaded: number, pending: number, ids: string[] }}
   */
  getMemoryUsage() {
    return {
      loaded: this.loadedScenes.size,
      pending: this.pendingLoads.size,
      ids: [...this.loadedScenes.keys()],
    };
  }

  /**
   * Nettoyage complet — libère toutes les scènes et les loaders.
   */
  destroy() {
    // Disposer toutes les scènes chargées
    for (const id of [...this.loadedScenes.keys()]) {
      this.dispose(id);
    }

    // Déconnecter l'observer
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    // Libérer les loaders
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
      this.dracoLoader = null;
    }
    this.gltfLoader = null;

    this.initialized = false;
  }

  /**
   * Tente de charger un modèle .glb pour une décennie.
   * Retourne la scène GLTF si le fichier existe, null sinon (fallback primitives).
   *
   * @param {string} decadeId — ID de la décennie (ex: '1960')
   * @returns {Promise<import('three').Object3D | null>}
   */
  async loadModel(decadeId) {
    const decadeConfig = DECADES.find((d) => d.id === decadeId);
    if (!decadeConfig?.model || !this.gltfLoader) return null;

    try {
      const gltf = await this.gltfLoader.loadAsync(decadeConfig.model);
      console.log(`[SceneLoader] Modèle GLTF chargé : ${decadeConfig.model}`);
      return gltf.scene;
    } catch (err) {
      // 404 ou erreur réseau — fallback sur les primitives procédurales
      console.log(`[SceneLoader] Pas de modèle GLTF pour ${decadeId} — fallback primitives`);
      return null;
    }
  }

  // --- Méthodes privées ---

  /**
   * Callback de l'IntersectionObserver — précharge ou dispose les scènes.
   *
   * @param {IntersectionObserverEntry[]} entries
   */
  _onIntersection(entries) {
    for (const entry of entries) {
      const decadeId = entry.target.getAttribute('data-decade');
      if (!decadeId) continue;

      if (entry.isIntersecting) {
        // Section visible (ou dans le rootMargin) → précharger
        this.preload(decadeId);
      } else {
        // Section hors viewport → dispose si trop de scènes en mémoire
        // On ne dispose pas immédiatement, le LRU s'en charge
      }
    }
  }

  /**
   * Charge dynamiquement le module scène et le modèle .glb d'une décennie.
   *
   * @param {string} decadeId
   * @returns {Promise<object | null>}
   */
  async _loadScene(decadeId) {
    const decadeConfig = DECADES.find((d) => d.id === decadeId);
    if (!decadeConfig) return null;

    // Le module scène n'est pas encore défini → la scène sera créée dans STORY-004+
    if (!decadeConfig.sceneModule) return null;

    // Import dynamique du module scène
    const module = await decadeConfig.sceneModule();
    const SceneClass = module.default || module;

    // Instancier la scène avec la config qualité et le loader
    const sceneInstance = new SceneClass({
      config: decadeConfig,
      qualityConfig: sceneManager.qualityConfig?.config,
      gltfLoader: this.gltfLoader,
    });

    // Initialiser la scène (chargement du modèle, setup lumières, etc.)
    if (typeof sceneInstance.init === 'function') {
      await sceneInstance.init();
    }

    // Tenter de charger le modèle .glb (fallback sur les primitives si 404)
    const gltfScene = await this.loadModel(decadeId);
    if (gltfScene && typeof sceneInstance.setModel === 'function') {
      sceneInstance.setModel(gltfScene);
    }

    return sceneInstance;
  }

  /**
   * Met à jour la position LRU d'une scène (la plus récente en fin).
   *
   * @param {string} decadeId
   */
  _touchLru(decadeId) {
    this._removeLru(decadeId);
    this._lruOrder.push(decadeId);
  }

  /**
   * Retire une scène de l'ordre LRU.
   *
   * @param {string} decadeId
   */
  _removeLru(decadeId) {
    const index = this._lruOrder.indexOf(decadeId);
    if (index !== -1) {
      this._lruOrder.splice(index, 1);
    }
  }

  /**
   * Applique la limite mémoire : dispose les scènes les plus anciennes (LRU)
   * quand on dépasse MAX_SCENES_IN_MEMORY.
   */
  _enforceMemoryLimit() {
    while (this.loadedScenes.size > MAX_SCENES_IN_MEMORY && this._lruOrder.length > 0) {
      const oldestId = this._lruOrder[0];

      // Ne pas disposer une scène actuellement active
      if (sceneManager.activeScenes.has(oldestId)) {
        this._lruOrder.shift();
        this._lruOrder.push(oldestId);
        continue;
      }

      this.dispose(oldestId);
    }
  }
}

// Singleton — une seule instance pour tout le site
export const sceneLoader = new SceneLoader();
