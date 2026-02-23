/**
 * Scene1960.js — Scène 3D de la décennie 1960 : La souris d'Engelbart.
 *
 * Modèle procédural low-poly de la première souris informatique (1968).
 * Boîtier en bois rectangulaire, un bouton rouge, un câble, deux roulettes.
 * Style : low-poly stylisé, matériaux PBR simples.
 * Palette : tons sombres, accent chaleureux.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 1960 — tons sombres, accent chaleureux */
const PALETTE = {
  wood: 0x8b6914,       // Bois chêne foncé
  woodDark: 0x5c4a0e,   // Bois ombre
  button: 0xE63946,      // Accent rouge (couleur du site)
  cable: 0x2a2a2a,       // Câble noir
  wheel: 0x3d3d3d,       // Roulettes métal sombre
  ambient: 0xfff0e0,     // Lumière ambiante chaude
  directional: 0xffeedd, // Lumière directionnelle chaude
};

export default class Scene1960 {
  /**
   * @param {object} options
   * @param {object} options.config — Config de la décennie (decades.js)
   * @param {object} options.qualityConfig — Config qualité GPU
   * @param {object} options.gltfLoader — Loader GLTF (non utilisé ici, modèle procédural)
   */
  constructor({ config, qualityConfig, gltfLoader }) {
    this.config = config;
    this.qualityConfig = qualityConfig;
    this.gltfLoader = gltfLoader;

    /** @type {THREE.Scene} Scène Three.js (requis par SceneManager) */
    this.scene = new THREE.Scene();

    /** @type {THREE.Group} Groupe principal de l'objet 3D */
    this.mouseGroup = null;

    /** @type {number} Progression du scroll (0-1) */
    this._scrollProgress = 0;

    /** @type {number} Rotation ajoutée par l'interaction utilisateur (drag) */
    this._interactionRotation = 0;

    // --- Curseur : parallax 3D ---
    /** @type {number} Position curseur X lissée (-1 à +1) */
    this._cursorX = 0;
    /** @type {number} Position curseur Y lissée (-1 à +1) */
    this._cursorY = 0;

    /** @type {boolean} La scène a-t-elle été initialisée ? */
    this._initialized = false;
  }

  /**
   * Initialise la scène : crée le modèle, les lumières, positionne tout.
   */
  async init() {
    if (this._initialized) return;

    // Pas de scene.background — canvas transparent (alpha: true), CSS #0A0A0A visible derrière

    this._createLighting();
    this._createMouse();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * Met à jour la scène selon la progression du scroll dans la section (0-1).
   * Appelé par init.js via le ScrollTrigger.
   *
   * @param {number} progress — 0 (entrée section) à 1 (sortie section)
   */
  onScroll(progress) {
    this._scrollProgress = progress;

    if (!this.mouseGroup) return;

    // Animation d'entrée progressive (0 → 0.3 du scroll)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3); // ease-out cubic

    // Apparition progressive : scale immersif (×3.5 — objet petit, doit remplir le viewport)
    const scale = eased * 2.8;
    this.mouseGroup.scale.setScalar(scale);
    this.mouseGroup.visible = entranceProgress > 0.01;

    // Rotation douce selon la progression globale + interaction utilisateur
    this.mouseGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation;

    // Centrage vertical (compense le centre local à y≈0.3) + oscillation douce
    this.mouseGroup.position.y = -0.3 * scale + Math.sin(progress * Math.PI) * 0.2;

    // Parallax 3D : l'objet flotte doucement vers le curseur
    this.mouseGroup.position.x = this._cursorX * 0.9;
    this.mouseGroup.position.z = this._cursorY * 0.5;
  }

  /**
   * Micro-interaction curseur : parallax 3D.
   * L'objet suit légèrement la position du curseur — comme s'il flottait.
   * @param {number} mx — Curseur X normalisé (-1 à +1)
   * @param {number} my — Curseur Y normalisé (-1 à +1)
   */
  onCursorMove(mx, my) {
    this._cursorX = mx;
    this._cursorY = my;
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
   * Préserve le groupe principal (mouseGroup) pour que onScroll/onCursorMove fonctionnent.
   * @param {THREE.Object3D} gltfScene — Scène GLTF chargée
   */
  setModel(gltfScene) {
    if (!this.mouseGroup) return;

    // Supprimer les primitives du groupe
    while (this.mouseGroup.children.length > 0) {
      this.mouseGroup.remove(this.mouseGroup.children[0]);
    }

    // Ajouter le modèle GLTF
    this.mouseGroup.add(gltfScene);
  }

  dispose() {
    this.mouseGroup = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  /**
   * Crée l'éclairage de la scène 1960.
   * Ambiance chaude, lumière douce — évoque les années 60.
   */
  _createLighting() {
    // Lumière ambiante chaude
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.6);
    this.scene.add(ambient);

    // Lumière directionnelle principale (simule une lampe de bureau)
    const directional = new THREE.DirectionalLight(PALETTE.directional, 1.2);
    directional.position.set(3, 4, 2);
    this.scene.add(directional);

    // Contre-jour doux (fill light)
    const fill = new THREE.DirectionalLight(0xaabbcc, 0.3);
    fill.position.set(-2, 1, -3);
    this.scene.add(fill);
  }

  /**
   * Crée le modèle procédural low-poly de la souris d'Engelbart.
   *
   * La souris de 1968 était un boîtier en bois rectangulaire (~10×7×4 cm)
   * avec un seul bouton rouge, un câble sortant du haut, et deux roulettes
   * perpendiculaires en dessous.
   *
   * Triangle count total : ~200 (bien en dessous de la limite de 5000)
   */
  _createMouse() {
    this.mouseGroup = new THREE.Group();

    // --- Matériaux PBR simples ---
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.wood,
      roughness: 0.75,
      metalness: 0.05,
    });

    const woodDarkMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.woodDark,
      roughness: 0.8,
      metalness: 0.05,
    });

    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.button,
      roughness: 0.4,
      metalness: 0.1,
      emissive: PALETTE.button,
      emissiveIntensity: 0.15,
    });

    const cableMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.cable,
      roughness: 0.6,
      metalness: 0.2,
    });

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: PALETTE.wheel,
      roughness: 0.3,
      metalness: 0.7,
    });

    // --- Corps principal (boîtier en bois) ---
    const bodyGeom = new THREE.BoxGeometry(1.4, 0.5, 1.0, 1, 1, 1);
    const body = new THREE.Mesh(bodyGeom, woodMaterial);
    body.position.y = 0.25;
    this.mouseGroup.add(body);

    // Fond du boîtier (légèrement plus sombre)
    const bottomGeom = new THREE.BoxGeometry(1.38, 0.08, 0.98, 1, 1, 1);
    const bottom = new THREE.Mesh(bottomGeom, woodDarkMaterial);
    bottom.position.y = 0.04;
    this.mouseGroup.add(bottom);

    // --- Bouton rouge (unique, sur le dessus) ---
    const buttonGeom = new THREE.BoxGeometry(0.5, 0.08, 0.35, 1, 1, 1);
    const button = new THREE.Mesh(buttonGeom, buttonMaterial);
    button.position.set(0.2, 0.54, 0);
    this.mouseGroup.add(button);

    // --- Câble (sort du haut/avant de la souris) ---
    // Segment droit
    const cableGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6, 1);
    const cable = new THREE.Mesh(cableGeom, cableMaterial);
    cable.position.set(0.7, 0.55, 0);
    cable.rotation.z = Math.PI * 0.38;
    this.mouseGroup.add(cable);

    // Petit connecteur à la base du câble
    const connectorGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6, 1);
    const connector = new THREE.Mesh(connectorGeom, wheelMaterial);
    connector.position.set(0.72, 0.45, 0);
    connector.rotation.z = Math.PI / 2;
    this.mouseGroup.add(connector);

    // --- Roulettes (2 roues perpendiculaires sous la souris) ---
    const wheelGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8, 1);

    // Roulette X (gauche-droite)
    const wheelX = new THREE.Mesh(wheelGeom, wheelMaterial);
    wheelX.position.set(0, -0.02, 0);
    wheelX.rotation.z = Math.PI / 2;
    this.mouseGroup.add(wheelX);

    // Roulette Z (avant-arrière)
    const wheelZ = new THREE.Mesh(wheelGeom, wheelMaterial);
    wheelZ.position.set(0, -0.02, 0);
    wheelZ.rotation.x = Math.PI / 2;
    this.mouseGroup.add(wheelZ);

    // --- Positionnement final ---
    this.mouseGroup.position.set(0, 0, 0);
    this.mouseGroup.rotation.x = -0.15; // Légère inclinaison pour montrer le dessus

    this.scene.add(this.mouseGroup);
  }

  /**
   * État initial avant l'animation d'entrée (invisible, petit).
   */
  _setInitialState() {
    if (!this.mouseGroup) return;
    this.mouseGroup.scale.setScalar(0);
    this.mouseGroup.visible = false;
  }
}
