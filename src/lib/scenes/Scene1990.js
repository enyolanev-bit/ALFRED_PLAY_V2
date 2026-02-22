/**
 * Scene1990.js — Scène 3D de la décennie 1990 : Le monde connecté.
 *
 * Modèle procédural low-poly : globe terrestre en wireframe avec
 * connexions lumineuses, et un modem à la base.
 * Style : low-poly stylisé, matériaux PBR simples.
 * Palette : tons bleutés internet, ambiance modem dial-up.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 1990 — tons bleutés internet, ambiance modem */
const PALETTE = {
  globe: 0x0a3d5c,         // Bleu sombre du globe
  globeWire: 0x00bcd4,     // Cyan des lignes du globe (accent)
  connections: 0x00e5ff,    // Points de connexion lumineux
  modem: 0xd5d0c8,         // Boîtier modem beige
  modemDark: 0xa8a098,     // Modem partie sombre
  led: 0x00ff00,           // LED verte du modem
  ledOff: 0x333333,        // LED éteinte
  cable: 0x2a2a2a,         // Câble téléphone
  ambient: 0xe0f7fa,       // Lumière ambiante cyan douce
  directional: 0xe0f0ff,   // Lumière directionnelle bleutée
};

export default class Scene1990 {
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
    this.worldGroup = null;

    /** @type {THREE.Mesh} Globe pour rotation continue */
    this._globeMesh = null;

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
    this._createWorld();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * @param {number} progress — 0 (entrée) à 1 (sortie)
   */
  onScroll(progress) {
    this._scrollProgress = progress;
    if (!this.worldGroup) return;

    // Animation d'entrée (0 → 0.3)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3);

    // Scale immersif (×1.8 — globe + modem ensemble)
    const scale = eased * 1.8;
    this.worldGroup.scale.setScalar(scale);
    this.worldGroup.visible = entranceProgress > 0.01;

    // Le groupe tourne doucement + interaction utilisateur
    this.worldGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation;

    // Le globe interne tourne un peu plus vite (effet de rotation terrestre)
    if (this._globeMesh) {
      this._globeMesh.rotation.y = progress * Math.PI * 1.5;
    }

    // Centrage vertical (compense le centre local à y≈0.43) + oscillation douce
    this.worldGroup.position.y = -0.43 * scale + Math.sin(progress * Math.PI) * 0.2;
  }

  /**
   * Applique la rotation d'interaction utilisateur (drag horizontal).
   * @param {number} rotationY — Rotation en radians
   */
  onInteraction(rotationY) {
    this._interactionRotation = rotationY;
  }

  dispose() {
    this.worldGroup = null;
    this._globeMesh = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  _createLighting() {
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.5);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(PALETTE.directional, 1.0);
    directional.position.set(3, 4, 2);
    this.scene.add(directional);

    const fill = new THREE.DirectionalLight(0x8888cc, 0.3);
    fill.position.set(-2, 1, -3);
    this.scene.add(fill);

    // Lueur cyan émise par le globe
    const globeLight = new THREE.PointLight(PALETTE.connections, 0.5, 4);
    globeLight.position.set(0, 0.5, 0);
    this.scene.add(globeLight);
  }

  /**
   * Crée le modèle procédural low-poly du globe connecté + modem.
   *
   * Un globe wireframe représente le World Wide Web naissant.
   * Des points lumineux simulent les connexions entre les continents.
   * Un modem US Robotics est posé en dessous.
   *
   * Triangle count : ~400
   */
  _createWorld() {
    this.worldGroup = new THREE.Group();

    // --- Matériaux ---
    const globeMat = new THREE.MeshStandardMaterial({
      color: PALETTE.globe,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: PALETTE.globeWire,
      wireframe: true,
    });

    const connectionMat = new THREE.MeshStandardMaterial({
      color: PALETTE.connections,
      emissive: PALETTE.connections,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.0,
    });

    const modemMat = new THREE.MeshStandardMaterial({
      color: PALETTE.modem,
      roughness: 0.5,
      metalness: 0.05,
    });

    const modemDarkMat = new THREE.MeshStandardMaterial({
      color: PALETTE.modemDark,
      roughness: 0.6,
      metalness: 0.1,
    });

    const ledMat = new THREE.MeshStandardMaterial({
      color: PALETTE.led,
      emissive: PALETTE.led,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      metalness: 0.0,
    });

    const ledOffMat = new THREE.MeshStandardMaterial({
      color: PALETTE.ledOff,
      roughness: 0.7,
      metalness: 0.1,
    });

    const cableMat = new THREE.MeshStandardMaterial({
      color: PALETTE.cable,
      roughness: 0.6,
      metalness: 0.2,
    });

    // --- Globe terrestre ---
    // Sphère solide semi-transparente (représente la terre)
    const globeSolid = new THREE.Mesh(
      new THREE.SphereGeometry(0.75, 12, 8),
      globeMat
    );
    globeSolid.position.set(0, 0.6, 0);

    // Wireframe par-dessus (réseau de connexions)
    const globeWire = new THREE.Mesh(
      new THREE.SphereGeometry(0.77, 12, 8),
      wireMat
    );
    globeWire.position.set(0, 0.6, 0);

    // Grouper globe solide + wire
    const globeGroup = new THREE.Group();
    globeGroup.add(globeSolid);
    globeGroup.add(globeWire);
    this._globeMesh = globeGroup;
    this.worldGroup.add(globeGroup);

    // --- Points de connexion lumineux sur le globe ---
    const connectionGeom = new THREE.SphereGeometry(0.04, 6, 4);
    const connectionPositions = [
      [0.3, 0.9, 0.6],     // Amérique du Nord
      [-0.1, 0.85, 0.65],  // Europe
      [0.5, 0.5, 0.5],     // Amérique du Sud
      [-0.4, 0.7, -0.5],   // Asie
      [0.0, 0.4, -0.6],    // Océanie
      [-0.5, 0.8, 0.3],    // Afrique
    ];

    for (const pos of connectionPositions) {
      const point = new THREE.Mesh(connectionGeom, connectionMat);
      point.position.set(pos[0], pos[1], pos[2]);
      this.worldGroup.add(point);
    }

    // --- Anneau orbital (symbolise les données qui circulent) ---
    const ringGeom = new THREE.TorusGeometry(0.95, 0.015, 6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: PALETTE.globeWire,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(0, 0.6, 0);
    ring.rotation.x = Math.PI * 0.35;
    this.worldGroup.add(ring);

    // --- Modem (base, sous le globe) ---
    const modemBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.15, 0.6, 1, 1, 1),
      modemMat
    );
    modemBody.position.set(0, -0.35, 0);
    this.worldGroup.add(modemBody);

    // Partie avant du modem (plus sombre)
    const modemFront = new THREE.Mesh(
      new THREE.BoxGeometry(1.18, 0.06, 0.02, 1, 1, 1),
      modemDarkMat
    );
    modemFront.position.set(0, -0.32, 0.31);
    this.worldGroup.add(modemFront);

    // LEDs du modem (rangée de petites lumières)
    const ledGeom = new THREE.BoxGeometry(0.03, 0.03, 0.02, 1, 1, 1);
    const ledLabels = ['TX', 'RX', 'CD', 'OH', 'AA'];
    for (let i = 0; i < ledLabels.length; i++) {
      const isActive = i < 3; // TX, RX, CD allumées
      const led = new THREE.Mesh(
        ledGeom,
        isActive ? ledMat : ledOffMat
      );
      led.position.set(-0.35 + i * 0.12, -0.27, 0.31);
      this.worldGroup.add(led);
    }

    // --- Câble téléphone (sort du modem) ---
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6, 1),
      cableMat
    );
    cable.position.set(0.55, -0.35, -0.1);
    cable.rotation.z = Math.PI / 2;
    this.worldGroup.add(cable);

    // --- Positionnement final ---
    this.worldGroup.position.set(0, 0, 0);
    this.worldGroup.rotation.x = -0.1;

    this.scene.add(this.worldGroup);
  }

  _setInitialState() {
    if (!this.worldGroup) return;
    this.worldGroup.scale.setScalar(0);
    this.worldGroup.visible = false;
  }
}
