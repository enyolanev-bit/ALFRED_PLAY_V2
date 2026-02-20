/**
 * Scene2020.js — Scène 3D de la décennie 2020 : L'Intelligence Artificielle.
 *
 * Modèle procédural low-poly : cerveau stylisé avec réseau neuronal,
 * nœuds lumineux, connexions synaptiques, aura d'énergie.
 * C'est la CONCLUSION VISUELLE du voyage — elle doit marquer.
 * Style : low-poly stylisé, matériaux PBR + émissifs forts.
 * Palette : futuriste violet/bleu, ambiance technologique avancée.
 *
 * Remplaçable par un .glb Blender via le pipeline SceneLoader.
 */

import * as THREE from 'three';

/** Palette couleurs 2020 — futuriste IA, violet/bleu profond */
const PALETTE = {
  brain: 0x2a1a4a,          // Violet sombre (masse cérébrale)
  brainHighlight: 0x4a2a7a, // Violet plus clair (gyri)
  synapse: 0x7c4dff,        // Violet vif — accent principal
  node: 0xbb86fc,           // Nœuds neuronaux lumineux
  nodeCore: 0xe0b0ff,       // Cœur des nœuds (très lumineux)
  circuit: 0x3700b3,        // Lignes de circuit
  aura: 0x6200ea,           // Aura d'énergie
  ring: 0x7c4dff,           // Anneau orbital
  ambient: 0xe8eaf6,        // Lumière ambiante violet pâle
  directional: 0xeeeeff,    // Lumière directionnelle froide
};

export default class Scene2020 {
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
    this.brainGroup = null;

    /** @type {THREE.Group} Anneaux orbitaux (rotation indépendante) */
    this._ringsGroup = null;

    /** @type {number} */
    this._scrollProgress = 0;

    /** @type {boolean} */
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    this._createLighting();
    this._createBrain();
    this._setInitialState();

    this._initialized = true;
  }

  /**
   * @param {number} progress — 0 (entrée) à 1 (sortie)
   */
  onScroll(progress) {
    this._scrollProgress = progress;
    if (!this.brainGroup) return;

    // Animation d'entrée (0 → 0.3)
    const entranceProgress = Math.min(progress / 0.3, 1);
    const eased = 1 - Math.pow(1 - entranceProgress, 3);

    const scale = eased * 1;
    this.brainGroup.scale.setScalar(scale);
    this.brainGroup.visible = entranceProgress > 0.01;

    // Rotation douce du groupe principal
    this.brainGroup.rotation.y = -0.3 + progress * Math.PI * 0.6;

    // Les anneaux orbitaux tournent plus vite (effet d'activité neuronale)
    if (this._ringsGroup) {
      this._ringsGroup.rotation.y = progress * Math.PI * 2.0;
      this._ringsGroup.rotation.z = progress * Math.PI * 0.5;
    }

    // Oscillation verticale
    this.brainGroup.position.y = Math.sin(progress * Math.PI) * 0.15;
  }

  dispose() {
    this.brainGroup = null;
    this._ringsGroup = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  _createLighting() {
    const ambient = new THREE.AmbientLight(PALETTE.ambient, 0.4);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(PALETTE.directional, 0.9);
    directional.position.set(3, 4, 2);
    this.scene.add(directional);

    const fill = new THREE.DirectionalLight(0x6644aa, 0.3);
    fill.position.set(-2, 1, -3);
    this.scene.add(fill);

    // Forte lueur violette émise par le cerveau (conclusion impactante)
    const brainGlow = new THREE.PointLight(PALETTE.synapse, 0.8, 5);
    brainGlow.position.set(0, 0, 0);
    this.scene.add(brainGlow);

    // Lueur secondaire pour l'aura
    const auraGlow = new THREE.PointLight(PALETTE.aura, 0.4, 4);
    auraGlow.position.set(0, 0.5, 0.5);
    this.scene.add(auraGlow);
  }

  /**
   * Crée le modèle procédural low-poly du cerveau IA.
   *
   * Un cerveau stylisé composé de deux hémisphères déformés,
   * des nœuds lumineux (neurones), des connexions synaptiques,
   * et des anneaux orbitaux d'énergie.
   *
   * Triangle count : ~500
   */
  _createBrain() {
    this.brainGroup = new THREE.Group();

    // --- Matériaux ---
    const brainMat = new THREE.MeshStandardMaterial({
      color: PALETTE.brain,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });

    const highlightMat = new THREE.MeshStandardMaterial({
      color: PALETTE.brainHighlight,
      roughness: 0.5,
      metalness: 0.15,
      emissive: PALETTE.synapse,
      emissiveIntensity: 0.1,
    });

    const synapseMat = new THREE.MeshStandardMaterial({
      color: PALETTE.synapse,
      emissive: PALETTE.synapse,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.0,
    });

    const nodeMat = new THREE.MeshStandardMaterial({
      color: PALETTE.node,
      emissive: PALETTE.nodeCore,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.0,
    });

    const circuitMat = new THREE.MeshBasicMaterial({
      color: PALETTE.circuit,
      transparent: true,
      opacity: 0.4,
    });

    // --- Hémisphère gauche ---
    const leftHemi = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI),
      brainMat
    );
    leftHemi.position.set(-0.15, 0, 0);
    leftHemi.rotation.y = Math.PI / 2;
    leftHemi.scale.set(1, 0.8, 0.9);
    this.brainGroup.add(leftHemi);

    // --- Hémisphère droit ---
    const rightHemi = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI),
      brainMat
    );
    rightHemi.position.set(0.15, 0, 0);
    rightHemi.rotation.y = -Math.PI / 2;
    rightHemi.scale.set(1, 0.8, 0.9);
    this.brainGroup.add(rightHemi);

    // --- Sillons cérébraux (lignes sur la surface) ---
    const sulcusGeom = new THREE.TorusGeometry(0.45, 0.015, 4, 12);
    const sulcus1 = new THREE.Mesh(sulcusGeom, highlightMat);
    sulcus1.position.set(0, 0.1, 0);
    sulcus1.rotation.x = Math.PI / 2;
    sulcus1.rotation.z = 0.3;
    this.brainGroup.add(sulcus1);

    const sulcus2 = new THREE.Mesh(sulcusGeom, highlightMat);
    sulcus2.position.set(0, -0.05, 0);
    sulcus2.rotation.x = Math.PI / 2;
    sulcus2.rotation.z = -0.2;
    sulcus2.scale.setScalar(0.85);
    this.brainGroup.add(sulcus2);

    // --- Nœuds neuronaux lumineux (dispersés sur la surface) ---
    const nodeGeom = new THREE.SphereGeometry(0.04, 6, 4);
    const nodePositions = [
      [-0.3, 0.25, 0.35],
      [0.35, 0.2, 0.3],
      [-0.15, -0.15, 0.45],
      [0.2, -0.2, 0.4],
      [-0.4, 0.0, 0.2],
      [0.4, 0.05, 0.15],
      [0.0, 0.35, 0.25],
      [-0.25, 0.1, -0.35],
      [0.3, -0.1, -0.3],
      [0.05, -0.3, 0.3],
      [-0.1, 0.3, -0.2],
      [0.15, 0.15, -0.4],
    ];

    for (const pos of nodePositions) {
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.set(pos[0], pos[1], pos[2]);
      this.brainGroup.add(node);
    }

    // --- Connexions synaptiques (lignes entre nœuds) ---
    const connectionPairs = [
      [0, 1], [1, 3], [2, 4], [0, 6], [5, 1],
      [6, 7], [3, 5], [8, 11], [9, 2], [10, 7],
    ];

    for (const [a, b] of connectionPairs) {
      const posA = nodePositions[a];
      const posB = nodePositions[b];
      const mid = [
        (posA[0] + posB[0]) / 2,
        (posA[1] + posB[1]) / 2,
        (posA[2] + posB[2]) / 2,
      ];
      const dx = posB[0] - posA[0];
      const dy = posB[1] - posA[1];
      const dz = posB[2] - posA[2];
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const line = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, length, 4, 1),
        synapseMat
      );
      line.position.set(mid[0], mid[1], mid[2]);
      line.lookAt(posB[0], posB[1], posB[2]);
      line.rotateX(Math.PI / 2);
      this.brainGroup.add(line);
    }

    // --- Anneaux orbitaux d'énergie (signature visuelle de l'IA) ---
    this._ringsGroup = new THREE.Group();

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: PALETTE.ring,
      transparent: true,
      opacity: 0.35,
    });

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: PALETTE.synapse,
      transparent: true,
      opacity: 0.25,
    });

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.012, 6, 32),
      ringMat1
    );
    ring1.rotation.x = Math.PI * 0.4;
    this._ringsGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.01, 6, 32),
      ringMat2
    );
    ring2.rotation.x = Math.PI * 0.6;
    ring2.rotation.z = Math.PI * 0.3;
    this._ringsGroup.add(ring2);

    const ring3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.008, 6, 32),
      circuitMat
    );
    ring3.rotation.x = Math.PI * 0.25;
    ring3.rotation.z = -Math.PI * 0.15;
    this._ringsGroup.add(ring3);

    this.brainGroup.add(this._ringsGroup);

    // --- Particules d'énergie flottantes (petites sphères) ---
    const particleGeom = new THREE.SphereGeometry(0.02, 4, 3);
    const particleMat = new THREE.MeshStandardMaterial({
      color: PALETTE.nodeCore,
      emissive: PALETTE.nodeCore,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.0,
    });

    const particlePositions = [
      [0.7, 0.3, 0.2],
      [-0.6, -0.2, 0.4],
      [0.4, -0.5, -0.3],
      [-0.3, 0.6, -0.2],
      [0.1, -0.4, 0.6],
      [-0.5, 0.1, -0.5],
    ];

    for (const pos of particlePositions) {
      const particle = new THREE.Mesh(particleGeom, particleMat);
      particle.position.set(pos[0], pos[1], pos[2]);
      this.brainGroup.add(particle);
    }

    // --- Positionnement final ---
    this.brainGroup.position.set(0, 0, 0);
    this.brainGroup.rotation.x = -0.1;

    this.scene.add(this.brainGroup);
  }

  _setInitialState() {
    if (!this.brainGroup) return;
    this.brainGroup.scale.setScalar(0);
    this.brainGroup.visible = false;
  }
}
