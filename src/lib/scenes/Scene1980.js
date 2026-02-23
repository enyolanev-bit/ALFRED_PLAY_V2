/**
 * Scene1980.js — Scène 3D de la décennie 1980 : Le Game Boy.
 *
 * Modèle procédural low-poly du Nintendo Game Boy (1989).
 * Boîtier rectangulaire gris, écran vert-jaune, D-pad, boutons A/B,
 * grille haut-parleur, cartouche en haut.
 * Style : low-poly stylisé, matériaux PBR simples.
 * Palette : colorée rétro gaming, ambiance arcade.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 1980 — rétro gaming, ambiance arcade */
const PALETTE = {
  body: 0xc8c0b8,          // Gris Game Boy classique
  bodyDark: 0x8a8580,      // Gris foncé (bas du boîtier)
  screen: 0x8b9b2f,        // Écran vert-jaune (éteint)
  screenGlow: 0x9bab2f,    // Écran allumé
  bezel: 0x5c5852,         // Cadre écran
  dpad: 0x2a2a2a,          // D-pad noir
  buttonAB: 0x8a2252,      // Boutons A/B bordeaux
  accent: 0xff6ec7,        // Accent rose (couleur du site)
  speaker: 0xa8a098,       // Grille haut-parleur
  ambient: 0xf0e6ff,       // Lumière ambiante violette douce
  directional: 0xffe6f0,   // Lumière directionnelle rose pâle
};

export default class Scene1980 {
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
    this.gameboyGroup = null;

    /** @type {number} */
    this._scrollProgress = 0;

    /** @type {number} Rotation ajoutée par l'interaction utilisateur (drag) */
    this._interactionRotation = 0;

    // --- Curseur : tilt 3D (comme si on tient la console) ---
    /** @type {number} Tilt X cible (inclinaison haut/bas) */
    this._tiltX = 0;
    /** @type {number} Tilt Y cible (inclinaison gauche/droite) */
    this._tiltY = 0;

    /** @type {boolean} */
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    // Canvas transparent — CSS background visible derrière

    this._createLighting();
    this._createGameBoy();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * @param {number} progress — 0 (entrée) à 1 (sortie)
   */
  onScroll(progress) {
    this._scrollProgress = progress;
    if (!this.gameboyGroup) return;

    // Animation d'entrée (0 → 0.3)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3);

    // Scale immersif (×1.8 — Game Boy déjà grand, 2 unités de haut)
    const scale = eased * 1.5;
    this.gameboyGroup.scale.setScalar(scale);
    this.gameboyGroup.visible = entranceProgress > 0.01;

    // Rotation douce + interaction utilisateur
    this.gameboyGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation + this._tiltY;

    // Tilt 3D : inclinaison qui suit le curseur (comme si on tient la console)
    this.gameboyGroup.rotation.x = -0.1 + this._tiltX;

    // Centrage vertical (centre local quasi centré à y≈-0.1) + oscillation douce
    this.gameboyGroup.position.y = 0.1 * scale + Math.sin(progress * Math.PI) * 0.2;
  }

  /**
   * Micro-interaction curseur : tilt 3D.
   * La console s'incline comme si on la tenait et qu'on tourne le poignet.
   * @param {number} mx — Curseur X normalisé (-1 à +1)
   * @param {number} my — Curseur Y normalisé (-1 à +1)
   */
  onCursorMove(mx, my) {
    this._tiltY = mx * 0.4;
    this._tiltX = my * -0.3;
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
   * Préserve le groupe principal (gameboyGroup) pour que onScroll/onCursorMove fonctionnent.
   * @param {THREE.Object3D} gltfScene — Scène GLTF chargée
   */
  setModel(gltfScene) {
    if (!this.gameboyGroup) return;

    while (this.gameboyGroup.children.length > 0) {
      this.gameboyGroup.remove(this.gameboyGroup.children[0]);
    }

    this.gameboyGroup.add(gltfScene);
  }

  dispose() {
    this.gameboyGroup = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  _createLighting() {
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.6);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(PALETTE.directional, 1.1);
    directional.position.set(3, 4, 2);
    this.scene.add(directional);

    const fill = new THREE.DirectionalLight(0xcc88cc, 0.25);
    fill.position.set(-2, 1, -3);
    this.scene.add(fill);
  }

  /**
   * Crée le modèle procédural low-poly du Game Boy.
   *
   * Le Game Boy (1989) : boîtier rectangulaire gris avec bords arrondis,
   * écran vert-jaune avec cadre, D-pad circulaire, boutons A/B rouges,
   * boutons Start/Select, grille haut-parleur en bas à droite.
   *
   * Triangle count : ~250
   */
  _createGameBoy() {
    this.gameboyGroup = new THREE.Group();

    // --- Matériaux ---
    const bodyMat = new THREE.MeshStandardMaterial({
      color: PALETTE.body,
      roughness: 0.5,
      metalness: 0.05,
    });

    const bodyDarkMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bodyDark,
      roughness: 0.6,
      metalness: 0.05,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: PALETTE.screen,
      roughness: 0.15,
      metalness: 0.0,
      emissive: PALETTE.screenGlow,
      emissiveIntensity: 0.15,
    });

    const bezelMat = new THREE.MeshStandardMaterial({
      color: PALETTE.bezel,
      roughness: 0.7,
      metalness: 0.05,
    });

    const dpadMat = new THREE.MeshStandardMaterial({
      color: PALETTE.dpad,
      roughness: 0.6,
      metalness: 0.1,
    });

    const buttonMat = new THREE.MeshStandardMaterial({
      color: PALETTE.buttonAB,
      roughness: 0.4,
      metalness: 0.1,
      emissive: PALETTE.accent,
      emissiveIntensity: 0.08,
    });

    const speakerMat = new THREE.MeshStandardMaterial({
      color: PALETTE.speaker,
      roughness: 0.8,
      metalness: 0.0,
    });

    // --- Texture face avant (Photopea) ---
    const textureLoader = new THREE.TextureLoader();
    const frontTexture = textureLoader.load('/textures/gameboy-front.png');
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.flipY = true;

    const frontMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.5,
      metalness: 0.05,
    });

    // --- Corps principal (6 matériaux : texture sur la face avant) ---
    // BoxGeometry faces : +X, -X, +Y, -Y, +Z (front/caméra), -Z (arrière)
    const bodyMaterials = [
      bodyMat,  // +X droite
      bodyMat,  // -X gauche
      bodyMat,  // +Y haut
      bodyMat,  // -Y bas
      frontMat, // +Z face avant (texture Photopea)
      bodyMat,  // -Z arrière
    ];

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.7, 0.35, 1, 1, 1),
      bodyMaterials
    );
    body.position.set(0, 0, 0);
    this.gameboyGroup.add(body);

    // Partie basse (plus large, grip)
    const bodyBottom = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.5, 0.38, 1, 1, 1),
      bodyDarkMat
    );
    bodyBottom.position.set(0, -0.6, 0);
    this.gameboyGroup.add(bodyBottom);

    // --- Cadre écran ---
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.65, 0.05, 1, 1, 1),
      bezelMat
    );
    bezel.position.set(0, 0.35, 0.18);
    this.gameboyGroup.add(bezel);

    // --- Écran ---
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.5),
      screenMat
    );
    screen.position.set(0, 0.35, 0.21);
    this.gameboyGroup.add(screen);

    // --- D-pad (croix directionnelle) ---
    // Barre horizontale
    const dpadH = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.06, 1, 1, 1),
      dpadMat
    );
    dpadH.position.set(-0.2, -0.15, 0.18);
    this.gameboyGroup.add(dpadH);

    // Barre verticale
    const dpadV = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.3, 0.06, 1, 1, 1),
      dpadMat
    );
    dpadV.position.set(-0.2, -0.15, 0.18);
    this.gameboyGroup.add(dpadV);

    // Centre du D-pad
    const dpadCenter = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.08, 0.07, 1, 1, 1),
      dpadMat
    );
    dpadCenter.position.set(-0.2, -0.15, 0.19);
    this.gameboyGroup.add(dpadCenter);

    // --- Boutons A et B ---
    const buttonGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8, 1);

    const buttonA = new THREE.Mesh(buttonGeom, buttonMat);
    buttonA.position.set(0.3, -0.1, 0.18);
    buttonA.rotation.x = Math.PI / 2;
    this.gameboyGroup.add(buttonA);

    const buttonB = new THREE.Mesh(buttonGeom, buttonMat);
    buttonB.position.set(0.15, -0.2, 0.18);
    buttonB.rotation.x = Math.PI / 2;
    this.gameboyGroup.add(buttonB);

    // --- Boutons Start / Select ---
    const smallBtnGeom = new THREE.BoxGeometry(0.15, 0.04, 0.04, 1, 1, 1);

    const startBtn = new THREE.Mesh(smallBtnGeom, bodyDarkMat);
    startBtn.position.set(0.08, -0.42, 0.18);
    startBtn.rotation.z = -0.3;
    this.gameboyGroup.add(startBtn);

    const selectBtn = new THREE.Mesh(smallBtnGeom, bodyDarkMat);
    selectBtn.position.set(-0.08, -0.42, 0.18);
    selectBtn.rotation.z = -0.3;
    this.gameboyGroup.add(selectBtn);

    // --- Grille haut-parleur (lignes diagonales simplifiées) ---
    for (let i = 0; i < 4; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.015, 0.02, 1, 1, 1),
        speakerMat
      );
      line.position.set(0.28, -0.5 + i * 0.04, 0.18);
      line.rotation.z = 0.5;
      this.gameboyGroup.add(line);
    }

    // --- Cartouche (dépasse en haut) ---
    const cartridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.2, 0.25, 1, 1, 1),
      bodyDarkMat
    );
    cartridge.position.set(0, 0.9, -0.03);
    this.gameboyGroup.add(cartridge);

    // --- Positionnement final ---
    this.gameboyGroup.position.set(0, 0, 0);
    this.gameboyGroup.rotation.x = -0.1;

    this.scene.add(this.gameboyGroup);
  }

  _setInitialState() {
    if (!this.gameboyGroup) return;
    this.gameboyGroup.scale.setScalar(0);
    this.gameboyGroup.visible = false;
  }
}
