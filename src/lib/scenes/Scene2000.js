/**
 * Scene2000.js — Scène 3D de la décennie 2000 : L'iPod.
 *
 * Modèle procédural low-poly de l'iPod Classic (2001).
 * Boîtier blanc iconique, molette click wheel, petit écran LCD,
 * dos chromé. La révolution de la musique numérique.
 * Style : low-poly stylisé, matériaux PBR simples.
 * Palette : blanc/chrome, ambiance musique numérique.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 2000 — blanc Apple, chrome, musique numérique */
const PALETTE = {
  body: 0xf0f0f0,          // Blanc iPod
  bodyEdge: 0xd8d8d8,      // Bord légèrement gris
  chrome: 0xc0c0c0,        // Dos chromé
  screen: 0x2a3a2a,        // Écran LCD éteint
  screenGlow: 0x88aa88,    // Écran LCD allumé (vert pâle)
  clickWheel: 0xe8e8e8,    // Molette blanche
  clickWheelRing: 0x9e9e9e, // Anneau de la molette (accent)
  centerButton: 0xd0d0d0,  // Bouton central
  ambient: 0xffffff,       // Lumière ambiante blanche
  directional: 0xf5f5f5,   // Lumière directionnelle neutre
};

export default class Scene2000 {
  /**
   * @param {object} options
   * @param {object} options.config — Config de la décennie (decades.js)
   * @param {object} options.qualityConfig — Config qualité GPU
   * @param {object} options.gltfLoader — Loader GLTF (non utilisé, modèle procédural)
   */
  constructor({ config, qualityConfig, gltfLoader }) {
    this.config = config;
    this.qualityConfig = qualityConfig;
    this.gltfLoader = gltfLoader;

    /** @type {THREE.Scene} */
    this.scene = new THREE.Scene();

    /** @type {THREE.Group} Groupe principal */
    this.ipodGroup = null;

    /** @type {number} */
    this._scrollProgress = 0;

    /** @type {number} Rotation ajoutée par l'interaction utilisateur (drag) */
    this._interactionRotation = 0;

    /** @type {boolean} */
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    // Canvas transparent — CSS background visible derrière

    this._createLighting();
    this._createIPod();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * @param {number} progress — 0 (entrée) à 1 (sortie)
   */
  onScroll(progress) {
    this._scrollProgress = progress;
    if (!this.ipodGroup) return;

    // Animation d'entrée (0 → 0.3)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3);

    // Scale immersif (×2.2 — iPod fin, doit remplir la hauteur)
    const scale = eased * 2.2;
    this.ipodGroup.scale.setScalar(scale);
    this.ipodGroup.visible = entranceProgress > 0.01;

    // Rotation douce + interaction utilisateur
    this.ipodGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation;

    // iPod déjà centré (y≈0) — oscillation douce seulement
    this.ipodGroup.position.y = Math.sin(progress * Math.PI) * 0.2;
  }

  /**
   * Applique la rotation d'interaction utilisateur (drag horizontal).
   * @param {number} rotationY — Rotation en radians
   */
  onInteraction(rotationY) {
    this._interactionRotation = rotationY;
  }

  dispose() {
    this.ipodGroup = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  /**
   * Éclairage adapté au fond clair (#f5f5f5).
   * Lumière plus douce pour que le blanc de l'iPod ressorte avec des ombres subtiles.
   */
  _createLighting() {
    // Ambiante plus basse pour garder du contraste sur fond clair
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.4);
    this.scene.add(ambient);

    // Lumière directionnelle principale (douce, neutre)
    const directional = new THREE.DirectionalLight(PALETTE.directional, 1.0);
    directional.position.set(2, 3, 3);
    this.scene.add(directional);

    // Contre-jour pour séparer l'objet du fond clair
    const fill = new THREE.DirectionalLight(0xccccdd, 0.4);
    fill.position.set(-3, 1, -2);
    this.scene.add(fill);

    // Rim light pour le dos chromé
    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, 2, -3);
    this.scene.add(rim);
  }

  /**
   * Crée le modèle procédural low-poly de l'iPod Classic.
   *
   * L'iPod (2001) : boîtier blanc rectangulaire arrondi, petit écran LCD
   * en haut, molette click wheel en bas avec bouton central.
   * Dos en chrome poli.
   *
   * Triangle count : ~200
   */
  _createIPod() {
    this.ipodGroup = new THREE.Group();

    // --- Matériaux ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: PALETTE.body,
      roughness: 0.25,
      metalness: 0.0,
    });

    const edgeMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bodyEdge,
      roughness: 0.3,
      metalness: 0.05,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: PALETTE.chrome,
      roughness: 0.1,
      metalness: 0.8,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: PALETTE.screen,
      roughness: 0.15,
      metalness: 0.0,
      emissive: PALETTE.screenGlow,
      emissiveIntensity: 0.2,
    });

    const wheelMat = new THREE.MeshStandardMaterial({
      color: PALETTE.clickWheel,
      roughness: 0.3,
      metalness: 0.0,
    });

    const wheelRingMat = new THREE.MeshStandardMaterial({
      color: PALETTE.clickWheelRing,
      roughness: 0.4,
      metalness: 0.15,
    });

    const centerMat = new THREE.MeshStandardMaterial({
      color: PALETTE.centerButton,
      roughness: 0.2,
      metalness: 0.05,
    });

    // --- Corps principal (face blanche) ---
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.4, 0.15, 1, 1, 1),
      bodyMat
    );
    body.position.set(0, 0, 0);
    this.ipodGroup.add(body);

    // Dos chromé
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 1.38, 0.05, 1, 1, 1),
      chromeMat
    );
    back.position.set(0, 0, -0.09);
    this.ipodGroup.add(back);

    // Cadre/bords
    const edgeTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.04, 0.17, 1, 1, 1),
      edgeMat
    );
    edgeTop.position.set(0, 0.72, 0);
    this.ipodGroup.add(edgeTop);

    const edgeBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.04, 0.17, 1, 1, 1),
      edgeMat
    );
    edgeBottom.position.set(0, -0.72, 0);
    this.ipodGroup.add(edgeBottom);

    // --- Écran LCD ---
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.4),
      screenMat
    );
    screen.position.set(0, 0.35, 0.08);
    this.ipodGroup.add(screen);

    // Cadre écran
    const screenFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.45, 0.02, 1, 1, 1),
      edgeMat
    );
    screenFrame.position.set(0, 0.35, 0.075);
    this.ipodGroup.add(screenFrame);

    // --- Click Wheel ---
    // Anneau extérieur
    const wheelOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16, 1),
      wheelRingMat
    );
    wheelOuter.position.set(0, -0.25, 0.08);
    wheelOuter.rotation.x = Math.PI / 2;
    this.ipodGroup.add(wheelOuter);

    // Surface de la molette
    const wheelSurface = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.025, 16, 1),
      wheelMat
    );
    wheelSurface.position.set(0, -0.25, 0.08);
    wheelSurface.rotation.x = Math.PI / 2;
    this.ipodGroup.add(wheelSurface);

    // Bouton central
    const centerBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12, 1),
      centerMat
    );
    centerBtn.position.set(0, -0.25, 0.085);
    centerBtn.rotation.x = Math.PI / 2;
    this.ipodGroup.add(centerBtn);

    // --- Port jack en bas ---
    const jack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6, 1),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.5 })
    );
    jack.position.set(0.15, -0.73, 0);
    this.ipodGroup.add(jack);

    // --- Positionnement final ---
    this.ipodGroup.position.set(0, 0, 0);
    this.ipodGroup.rotation.x = -0.1;

    this.scene.add(this.ipodGroup);
  }

  _setInitialState() {
    if (!this.ipodGroup) return;
    this.ipodGroup.scale.setScalar(0);
    this.ipodGroup.visible = false;
  }
}
