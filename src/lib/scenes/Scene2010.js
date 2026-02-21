/**
 * Scene2010.js — Scène 3D de la décennie 2010 : L'iPhone.
 *
 * Modèle procédural low-poly d'un smartphone moderne.
 * Écran large, bezels fins, bouton home, caméra.
 * Style : low-poly stylisé, matériaux PBR simples.
 * Palette : smartphone élégant, ambiance apps/notifications.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 2010 — smartphone élégant, bleu Apple */
const PALETTE = {
  body: 0x1c1c1e,          // Noir sidéral
  bodyEdge: 0x3a3a3c,      // Bord aluminium sombre
  screen: 0x0a0a12,        // Écran éteint (noir profond)
  screenGlow: 0x007aff,    // Bleu iOS (accent)
  bezel: 0x2c2c2e,         // Cadre écran
  homeButton: 0x1c1c1e,    // Bouton home
  homeRing: 0x48484a,      // Anneau du bouton home
  camera: 0x2a2a2a,        // Module caméra
  notch: 0x1c1c1e,         // Encoche (notch)
  ambient: 0xf2f2f7,       // Lumière ambiante froide
  directional: 0xe8ecff,   // Lumière directionnelle bleutée
};

export default class Scene2010 {
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
    this.phoneGroup = null;

    /** @type {number} */
    this._scrollProgress = 0;

    /** @type {number} Rotation ajoutée par l'interaction utilisateur (drag) */
    this._interactionRotation = 0;

    /** @type {boolean} */
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    // Couleur de fond de la scène — visible à travers les sections HTML transparentes
    this.scene.background = new THREE.Color(this.config.colors.background);

    this._createLighting();
    this._createPhone();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * @param {number} progress — 0 (entrée) à 1 (sortie)
   */
  onScroll(progress) {
    this._scrollProgress = progress;
    if (!this.phoneGroup) return;

    // Animation d'entrée (0 → 0.3)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3);

    // Scale immersif (×2.0 — smartphone, taille moyenne)
    const scale = eased * 2.0;
    this.phoneGroup.scale.setScalar(scale);
    this.phoneGroup.visible = entranceProgress > 0.01;

    // Rotation douce + interaction utilisateur
    this.phoneGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation;

    // iPhone déjà centré (y≈0) — oscillation douce seulement
    this.phoneGroup.position.y = Math.sin(progress * Math.PI) * 0.2;
  }

  /**
   * Applique la rotation d'interaction utilisateur (drag horizontal).
   * @param {number} rotationY — Rotation en radians
   */
  onInteraction(rotationY) {
    this._interactionRotation = rotationY;
  }

  dispose() {
    this.phoneGroup = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  _createLighting() {
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.5);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(PALETTE.directional, 1.1);
    directional.position.set(3, 4, 2);
    this.scene.add(directional);

    const fill = new THREE.DirectionalLight(0x8888cc, 0.3);
    fill.position.set(-2, 1, -3);
    this.scene.add(fill);

    // Reflet bleu sur l'écran
    const screenReflect = new THREE.PointLight(PALETTE.screenGlow, 0.3, 3);
    screenReflect.position.set(0, 0.2, 0.5);
    this.scene.add(screenReflect);
  }

  /**
   * Crée le modèle procédural low-poly du smartphone.
   *
   * Smartphone moderne : corps slim noir, grand écran,
   * bezels fins, bouton home rond, encoche caméra,
   * module caméra au dos.
   *
   * Triangle count : ~200
   */
  _createPhone() {
    this.phoneGroup = new THREE.Group();

    // --- Matériaux ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: PALETTE.body,
      roughness: 0.3,
      metalness: 0.2,
    });

    const edgeMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bodyEdge,
      roughness: 0.2,
      metalness: 0.6,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: PALETTE.screen,
      roughness: 0.05,
      metalness: 0.0,
      emissive: PALETTE.screenGlow,
      emissiveIntensity: 0.25,
    });

    const bezelMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bezel,
      roughness: 0.4,
      metalness: 0.1,
    });

    const homeRingMat = new THREE.MeshStandardMaterial({
      color: PALETTE.homeRing,
      roughness: 0.2,
      metalness: 0.4,
    });

    const cameraMat = new THREE.MeshStandardMaterial({
      color: PALETTE.camera,
      roughness: 0.3,
      metalness: 0.5,
    });

    // --- Corps principal ---
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 1.5, 0.1, 1, 1, 1),
      bodyMat
    );
    body.position.set(0, 0, 0);
    this.phoneGroup.add(body);

    // Cadre aluminium (bords)
    const frameTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.77, 0.02, 0.12, 1, 1, 1),
      edgeMat
    );
    frameTop.position.set(0, 0.76, 0);
    this.phoneGroup.add(frameTop);

    const frameBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.77, 0.02, 0.12, 1, 1, 1),
      edgeMat
    );
    frameBottom.position.set(0, -0.76, 0);
    this.phoneGroup.add(frameBottom);

    const frameLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.52, 0.12, 1, 1, 1),
      edgeMat
    );
    frameLeft.position.set(-0.385, 0, 0);
    this.phoneGroup.add(frameLeft);

    const frameRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.52, 0.12, 1, 1, 1),
      edgeMat
    );
    frameRight.position.set(0.385, 0, 0);
    this.phoneGroup.add(frameRight);

    // --- Écran ---
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 1.3),
      screenMat
    );
    screen.position.set(0, 0.05, 0.051);
    this.phoneGroup.add(screen);

    // Bezel haut (zone caméra/speaker)
    const bezelTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.08, 0.01, 1, 1, 1),
      bezelMat
    );
    bezelTop.position.set(0, 0.72, 0.051);
    this.phoneGroup.add(bezelTop);

    // Encoche (notch) caméra frontale
    const notch = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.04, 0.012, 1, 1, 1),
      new THREE.MeshStandardMaterial({ color: PALETTE.notch, roughness: 0.3, metalness: 0.1 })
    );
    notch.position.set(0, 0.72, 0.055);
    this.phoneGroup.add(notch);

    // Caméra frontale (petit cercle dans le notch)
    const frontCam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8, 1),
      cameraMat
    );
    frontCam.position.set(0.05, 0.72, 0.06);
    frontCam.rotation.x = Math.PI / 2;
    this.phoneGroup.add(frontCam);

    // --- Bouton Home ---
    const homeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.008, 8, 16),
      homeRingMat
    );
    homeRing.position.set(0, -0.68, 0.051);
    this.phoneGroup.add(homeRing);

    // --- Module caméra arrière ---
    const cameraModule = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.02, 1, 1, 1),
      cameraMat
    );
    cameraModule.position.set(-0.2, 0.55, -0.06);
    this.phoneGroup.add(cameraModule);

    // Lentilles caméra (2 cercles)
    const lensGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8, 1);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.3 });

    const lens1 = new THREE.Mesh(lensGeom, lensMat);
    lens1.position.set(-0.22, 0.58, -0.075);
    lens1.rotation.x = Math.PI / 2;
    this.phoneGroup.add(lens1);

    const lens2 = new THREE.Mesh(lensGeom, lensMat);
    lens2.position.set(-0.18, 0.52, -0.075);
    lens2.rotation.x = Math.PI / 2;
    this.phoneGroup.add(lens2);

    // --- Boutons latéraux ---
    // Volume
    const volBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.08, 0.04, 1, 1, 1),
      edgeMat
    );
    volBtn.position.set(-0.39, 0.3, 0);
    this.phoneGroup.add(volBtn);

    // Power
    const pwrBtn = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.1, 0.04, 1, 1, 1),
      edgeMat
    );
    pwrBtn.position.set(0.39, 0.35, 0);
    this.phoneGroup.add(pwrBtn);

    // --- Positionnement final ---
    this.phoneGroup.position.set(0, 0, 0);
    this.phoneGroup.rotation.x = -0.1;

    this.scene.add(this.phoneGroup);
  }

  _setInitialState() {
    if (!this.phoneGroup) return;
    this.phoneGroup.scale.setScalar(0);
    this.phoneGroup.visible = false;
  }
}
