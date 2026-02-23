/**
 * Scene1970.js — Scène 3D de la décennie 1970 : Le terminal VT100.
 *
 * Modèle procédural low-poly du DEC VT100 (1978).
 * Écran CRT avec phosphore vert, boîtier arrondi, clavier intégré.
 * Style : low-poly stylisé, matériaux PBR simples.
 * Palette : tons verts terminal, ambiance Unix.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 1970 — tons verts terminal, ambiance Unix */
const PALETTE = {
  body: 0x3a3a3a,          // Boîtier gris foncé
  bodyLight: 0x4a4a4a,     // Boîtier partie claire
  screen: 0x0a200a,        // Écran éteint (vert très sombre)
  screenGlow: 0x33ff33,    // Phosphore vert (accent)
  bezel: 0x2a2a2a,         // Cadre écran
  keyboard: 0x2d2d2d,      // Clavier
  key: 0x4a4a4a,           // Touches
  ambient: 0xc8e6c9,       // Lumière ambiante verte douce
  directional: 0xe0ffe0,   // Lumière directionnelle verte pâle
};

export default class Scene1970 {
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
    this.terminalGroup = null;

    /** @type {number} */
    this._scrollProgress = 0;

    /** @type {number} Rotation ajoutée par l'interaction utilisateur (drag) */
    this._interactionRotation = 0;

    // --- Curseur : écran phosphore réactif ---
    /** @type {THREE.Mesh|null} Mesh de l'écran phosphore vert */
    this._screenMesh = null;
    /** @type {THREE.Mesh|null} Curseur clignotant sur l'écran */
    this._blinkCursor = null;
    /** @type {number} Activité curseur (0 = immobile, 1 = mouvement max) */
    this._cursorActivity = 0;
    /** @type {number} Phase du clignotement */
    this._blinkPhase = 0;

    /** @type {boolean} */
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    // Canvas transparent — CSS background visible derrière

    this._createLighting();
    this._createTerminal();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * @param {number} progress — 0 (entrée) à 1 (sortie)
   */
  onScroll(progress) {
    this._scrollProgress = progress;
    if (!this.terminalGroup) return;

    // Animation d'entrée (0 → 0.3)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3);

    // Scale immersif (×2.0 — terminal de taille moyenne)
    const scale = eased * 1.2;
    this.terminalGroup.scale.setScalar(scale);
    this.terminalGroup.visible = entranceProgress > 0.01;

    // Rotation douce + interaction utilisateur
    this.terminalGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation;

    // Centrage vertical (compense le centre local à y≈0.94) + oscillation douce
    this.terminalGroup.position.y = -0.94 * scale + Math.sin(progress * Math.PI) * 0.2;
  }

  /**
   * Micro-interaction curseur : écran phosphore réactif.
   * L'écran vert s'illumine au mouvement de souris, le curseur clignote plus vite.
   * @param {number} mx — Curseur X normalisé (-1 à +1)
   * @param {number} my — Curseur Y normalisé (-1 à +1)
   */
  onCursorMove(mx, my) {
    // Activité = distance au centre (0 quand immobile au centre, ~1.4 aux coins)
    this._cursorActivity = Math.sqrt(mx * mx + my * my);

    // Écran phosphore : intensité émissive varie de 0.3 (base) à 0.8 (actif)
    if (this._screenMesh) {
      this._screenMesh.material.emissiveIntensity = 0.3 + this._cursorActivity * 0.85;
    }

    // Curseur clignotant : fréquence accélère avec le mouvement
    if (this._blinkCursor) {
      // Vitesse de base 2Hz, monte à 8Hz avec l'activité curseur
      const speed = 2 + this._cursorActivity * 6;
      this._blinkPhase += speed * 0.016; // ~60fps
      this._blinkCursor.material.opacity = Math.sin(this._blinkPhase * Math.PI * 2) > 0 ? 0.9 : 0;
    }
  }

  /**
   * Applique la rotation d'interaction utilisateur (drag horizontal).
   * @param {number} rotationY — Rotation en radians
   */
  onInteraction(rotationY) {
    this._interactionRotation = rotationY;
  }

  /**
   * Remplace les primitives par un modèle GLTF importé.
   * Préserve le groupe principal (terminalGroup) pour que onScroll/onCursorMove fonctionnent.
   * @param {THREE.Object3D} gltfScene — Scène GLTF chargée
   */
  setModel(gltfScene) {
    if (!this.terminalGroup) return;

    while (this.terminalGroup.children.length > 0) {
      this.terminalGroup.remove(this.terminalGroup.children[0]);
    }

    this.terminalGroup.add(gltfScene);

    // Nullifier les références aux meshes primitifs
    this._screenMesh = null;
    this._blinkCursor = null;
  }

  dispose() {
    this.terminalGroup = null;
    this._screenMesh = null;
    this._blinkCursor = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  _createLighting() {
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.5);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(PALETTE.directional, 1.0);
    directional.position.set(3, 4, 2);
    this.scene.add(directional);

    // Contre-jour doux
    const fill = new THREE.DirectionalLight(0x88aa88, 0.3);
    fill.position.set(-2, 1, -3);
    this.scene.add(fill);

    // Lueur verte émise par l'écran
    const screenLight = new THREE.PointLight(PALETTE.screenGlow, 0.4, 3);
    screenLight.position.set(0, 0.6, 0.6);
    this.scene.add(screenLight);
  }

  /**
   * Crée le modèle procédural low-poly du terminal VT100.
   *
   * Le VT100 : un moniteur CRT avec écran vert phosphore incliné,
   * un boîtier arrondi et un clavier intégré en dessous.
   *
   * Triangle count : ~300
   */
  _createTerminal() {
    this.terminalGroup = new THREE.Group();

    // --- Matériaux ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: PALETTE.body,
      roughness: 0.7,
      metalness: 0.1,
    });

    const bodyLightMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bodyLight,
      roughness: 0.6,
      metalness: 0.1,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: PALETTE.screen,
      roughness: 0.2,
      metalness: 0.0,
      emissive: PALETTE.screenGlow,
      emissiveIntensity: 0.3,
    });

    const bezelMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bezel,
      roughness: 0.8,
      metalness: 0.05,
    });

    const keyboardMat = new THREE.MeshStandardMaterial({
      color: PALETTE.keyboard,
      roughness: 0.6,
      metalness: 0.15,
    });

    const keyMat = new THREE.MeshStandardMaterial({
      color: PALETTE.key,
      roughness: 0.5,
      metalness: 0.1,
    });

    // --- Corps du moniteur (forme trapézoïdale simplifiée) ---
    const monitorBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.3, 1.2, 1, 1, 1),
      bodyMat
    );
    monitorBody.position.set(0, 0.9, 0);
    this.terminalGroup.add(monitorBody);

    // Partie supérieure arrondie (haut du moniteur)
    const monitorTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.15, 1.15, 1, 1, 1),
      bodyLightMat
    );
    monitorTop.position.set(0, 1.6, 0);
    this.terminalGroup.add(monitorTop);

    // --- Cadre de l'écran (bezel) ---
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 1.0, 0.08, 1, 1, 1),
      bezelMat
    );
    bezel.position.set(0, 0.95, 0.61);
    this.terminalGroup.add(bezel);

    // --- Écran CRT (phosphore vert) ---
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.8),
      screenMat
    );
    screen.position.set(0, 0.95, 0.66);
    this.terminalGroup.add(screen);
    this._screenMesh = screen;

    // --- Curseur clignotant sur l'écran ---
    const blinkMat = new THREE.MeshBasicMaterial({
      color: PALETTE.screenGlow,
      transparent: true,
      opacity: 0.9,
    });
    const blinkCursor = new THREE.Mesh(
      new THREE.PlaneGeometry(0.06, 0.08),
      blinkMat
    );
    blinkCursor.position.set(-0.3, 0.92, 0.67);
    this.terminalGroup.add(blinkCursor);
    this._blinkCursor = blinkCursor;

    // --- Base du moniteur ---
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.12, 1.3, 1, 1, 1),
      bodyLightMat
    );
    base.position.set(0, 0.25, 0);
    this.terminalGroup.add(base);

    // --- Clavier (plateau devant le moniteur) ---
    const keyboardBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.08, 0.5, 1, 1, 1),
      keyboardMat
    );
    keyboardBase.position.set(0, 0.2, 0.9);
    this.terminalGroup.add(keyboardBase);

    // Rangées de touches (3 rangées simplifiées)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 10; col++) {
        const key = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.04, 0.08, 1, 1, 1),
          keyMat
        );
        key.position.set(
          -0.58 + col * 0.13,
          0.27,
          0.72 + row * 0.12
        );
        this.terminalGroup.add(key);
      }
    }

    // --- Positionnement final ---
    this.terminalGroup.position.set(0, -0.5, 0);
    this.terminalGroup.rotation.x = -0.1;

    this.scene.add(this.terminalGroup);
  }

  _setInitialState() {
    if (!this.terminalGroup) return;
    this.terminalGroup.scale.setScalar(0);
    this.terminalGroup.visible = false;
  }
}
