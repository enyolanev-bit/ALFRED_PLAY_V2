/**
 * Scene1980.js — Scène 3D de la décennie 1980 : Le Game Boy.
 *
 * Charge le modèle gameboy-1980.glb via le pipeline SceneLoader.
 * Interactions : tilt 3D (inclinaison suit la souris), easter egg clic.
 * Scale : 1.5 (3D-PIPELINE.md)
 */

import * as THREE from 'three';
import gsap from 'gsap';

/** Palette couleurs 1980 — éclairage rétro gaming */
const PALETTE = {
  screenGlow: 0x9bab2f,    // Écran allumé
  ambient: 0xf0e6ff,       // Lumière ambiante violette douce
  directional: 0xffe6f0,   // Lumière directionnelle rose pâle
};

export default class Scene1980 {
  /**
   * @param {object} options
   * @param {object} options.config — Config de la décennie (decades.js)
   * @param {object} options.qualityConfig — Config qualité GPU
   * @param {object} options.gltfLoader — Loader GLTF (utilisé par SceneLoader)
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

    /** @type {THREE.Mesh|null} Référence à un mesh pour le flash easter egg */
    this._screenMesh = null;

    /** @type {boolean} Easter egg en cours (anti-spam) */
    this._easterEggActive = false;

    /** @type {boolean} */
    this._initialized = false;
  }

  async init() {
    if (this._initialized) return;

    this._createLighting();

    // Groupe principal vide — le modèle .glb sera injecté par SceneLoader via setModel()
    this.gameboyGroup = new THREE.Group();
    this.scene.add(this.gameboyGroup);

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

    // Scale 1.5 (3D-PIPELINE.md)
    const scale = eased * 1.5;
    this.gameboyGroup.scale.setScalar(scale);
    this.gameboyGroup.visible = entranceProgress > 0.01;

    // Rotation douce + interaction utilisateur
    this.gameboyGroup.rotation.y = -0.3 + progress * Math.PI * 0.6 + this._interactionRotation + this._tiltY;

    // Tilt 3D : inclinaison qui suit le curseur (comme si on tient la console)
    this.gameboyGroup.rotation.x = this._tiltX;

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
   * Easter egg : clic sur le Game Boy.
   * Joue un bip 8-bit, flash l'écran vert, affiche "Press Start".
   * @param {object} _intersect — Objet d'intersection Three.js (non utilisé)
   */
  onClick(_intersect) {
    if (this._easterEggActive) return;
    this._easterEggActive = true;

    // 1. Son 8-bit via Web Audio API (bip de démarrage Game Boy)
    this._playStartupBip();

    // 2. Flash écran vert sur le modèle GLTF
    if (this._screenMesh && this._screenMesh.material) {
      const mat = this._screenMesh.material;
      // Sauvegarder les valeurs originales
      const origEmissive = mat.emissive ? mat.emissive.getHex() : 0x000000;
      const origIntensity = mat.emissiveIntensity || 0;

      if (mat.emissive) mat.emissive.setHex(0x00ff44);
      mat.emissiveIntensity = 0;

      gsap.to(mat, {
        emissiveIntensity: 0.9,
        duration: 0.1,
        onComplete: () => {
          gsap.to(mat, {
            emissiveIntensity: origIntensity,
            duration: 0.4,
            onComplete: () => {
              if (mat.emissive) mat.emissive.setHex(origEmissive);
            },
          });
        },
      });
    }

    // 3. Texte "Press Start" en CSS overlay
    this._showPressStart();

    // Débloquer après 2.5s (durée totale de l'animation)
    setTimeout(() => {
      this._easterEggActive = false;
    }, 2500);
  }

  /**
   * Génère un bip 8-bit via Web Audio API (deux tons courts : C5 → G5).
   */
  _playStartupBip() {
    try {
      const ctx = window.__audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square'; // Son 8-bit
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.12);        // Do5
      playTone(783.99, now + 0.15, 0.2);  // Sol5
    } catch {
      // Pas de Web Audio API — silencieux
    }
  }

  /**
   * Affiche "Press Start" au-dessus du canvas avec fade-out GSAP.
   */
  _showPressStart() {
    // Créer l'élément overlay
    const el = document.createElement('div');
    el.textContent = 'Press Start';
    Object.assign(el.style, {
      position: 'fixed',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: "'Space Grotesk', monospace",
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#9bab2f',
      textShadow: '0 0 12px rgba(155, 171, 47, 0.6)',
      zIndex: '10000',
      pointerEvents: 'none',
      opacity: '0',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    });
    document.body.appendChild(el);

    // Fade in → attente → fade out → suppression
    gsap.to(el, {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(el, {
          opacity: 0,
          duration: 0.6,
          delay: 1.4,
          ease: 'power2.in',
          onComplete: () => el.remove(),
        });
      },
    });
  }

  /**
   * Applique la rotation d'interaction utilisateur (drag horizontal).
   * @param {number} rotationY — Rotation en radians
   */
  onInteraction(rotationY) {
    this._interactionRotation = rotationY;
  }

  /**
   * Injecte le modèle GLTF chargé par SceneLoader.
   * Normalise la taille pour que le modèle fasse ~2 unités de haut
   * (avec le scale 1.5 de onScroll → ~3 unités → ~65% du viewport).
   * Oriente l'écran face caméra (+Z).
   * @param {THREE.Object3D} gltfScene — Scène GLTF chargée
   */
  setModel(gltfScene) {
    if (!this.gameboyGroup) return;

    // Vider le groupe (au cas où)
    while (this.gameboyGroup.children.length > 0) {
      this.gameboyGroup.remove(this.gameboyGroup.children[0]);
    }

    // --- Orienter l'écran face caméra ---
    // Le modèle Sketchfab a l'écran le long de l'axe X (X=59, Y=243, Z=154).
    // Rotation -90° autour de Y pour mettre l'écran face +Z (vers la caméra).
    gltfScene.rotation.y = -Math.PI / 2;

    // --- Mesurer la bounding box APRÈS rotation ---
    const box = new THREE.Box3().setFromObject(gltfScene);
    const size = box.getSize(new THREE.Vector3());

    console.log(`[Scene1980] Modèle GLB — taille après rotation : ${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)}`);

    // --- Normaliser par la hauteur (Y) ---
    // Hauteur cible : 2.0 unités (× scale 1.5 de onScroll = 3.0 = ~65% viewport)
    const TARGET_HEIGHT = 2.0;
    const normalizeScale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;

    gltfScene.scale.multiplyScalar(normalizeScale);

    // Recalculer le centre après scale et centrer
    const scaledBox = new THREE.Box3().setFromObject(gltfScene);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    gltfScene.position.sub(scaledCenter);

    this.gameboyGroup.add(gltfScene);

    // --- Chercher un mesh « écran » pour l'easter egg (le plus plat et large) ---
    this._screenMesh = null;
    let bestArea = 0;
    gltfScene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        const meshSize = child.geometry.boundingBox.getSize(new THREE.Vector3());
        const area = meshSize.x * meshSize.y;
        if (area > bestArea && child.material) {
          bestArea = area;
          this._screenMesh = child;
        }
      }
    });
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

  _setInitialState() {
    if (!this.gameboyGroup) return;
    this.gameboyGroup.scale.setScalar(0);
    this.gameboyGroup.visible = false;
  }
}
