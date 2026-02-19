# Architecture Document

## ALFRED_PLAY V2

**Date :** 2026-02-19
**Auteur :** Claude (System Architect)
**Version :** 1.0
**Projet Level :** 2
**PRD :** `docs/prd-alfred-play-v2-2026-02-19.md`
**Product Brief :** `docs/product-brief-alfred-play-v2-2026-02-18.md`

---

## 1. Architectural Drivers

Les exigences qui dictent les décisions architecturales, par ordre d'impact :

| Priorité | NFR | Exigence | Impact Architectural |
|----------|-----|----------|---------------------|
| 1 | NFR-002 | 60 FPS sur mobile milieu de gamme | Single canvas, GPU tier detection, dispose pattern, DPR limité |
| 2 | NFR-001 | < 5 Mo initial, FCP < 2s | Draco compression, lazy loading agressif, import dynamique |
| 3 | NFR-003 | Chrome/Safari/Firefox/Edge + mobile | WebGL2 fallback, pas de WebGPU, test cross-browser |
| 4 | NFR-006 | Code modulaire, commentaires FR | 1 composant/scène par décennie, structure claire |

Les NFR-004 (accessibilité), NFR-005 (scalabilité Vercel) et NFR-007 (SEO) sont importants mais ne structurent pas l'architecture profonde.

---

## 2. High-Level Architecture

### Pattern : Single-Page Scroll avec Canvas Global

ALFRED_PLAY V2 est un **site statique single-page** avec 3 couches superposées :

```
┌──────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Couche 3 — Overlay UI (position: fixed, z-index: 2)  │  │
│  │  Bouton audio mute/unmute + Indicateur de progression  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Couche 2 — Sections HTML (scrollables, z-index: 1)   │  │
│  │  ┌──────────────┐                                     │  │
│  │  │ IntroSection │  Écran d'accueil + CTA "Commencer"  │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 1960  │  Texte + overlay transparent        │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 1970  │  Le 3D est DERRIÈRE le HTML         │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 1980  │                                     │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 1990  │                                     │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 2000  │                                     │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 2010  │                                     │  │
│  │  ├──────────────┤                                     │  │
│  │  │ Decade 2020  │                                     │  │
│  │  ├──────────────┤                                     │  │
│  │  │ ContactCTA   │  Section contact / CTA final        │  │
│  │  └──────────────┘                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Couche 1 — Canvas WebGL (position: fixed, z-index: 0)│  │
│  │  Three.js — Plein écran — Renderer unique              │  │
│  │  Les scènes 3D sont chargées/disposées dynamiquement   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 Orchestration                          │  │
│  │  Lenis (smooth scroll, sans autoRaf)                   │  │
│  │  ←→ GSAP ticker (pilote lenis.raf + ScrollTrigger)     │  │
│  │  ←→ IntersectionObserver (charge/dispose scènes 3D)    │  │
│  │  ←→ Howler.js (crossfade audio entre décennies)        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Pourquoi ce pattern

| Décision | Raison |
|----------|--------|
| **1 seul canvas WebGL** | Les navigateurs limitent à ~8 contextes WebGL. Un canvas unique partagé évite les problèmes. |
| **HTML au-dessus du canvas** | Le texte reste du vrai HTML → SEO (NFR-007), accessibilité (NFR-004), lisibilité parfaite. |
| **Position fixed pour le canvas** | Le canvas ne scrolle pas, seul le HTML scrolle. ScrollTrigger contrôle ce qui s'affiche dans le canvas. |
| **Overlay UI en fixed** | Bouton audio et barre de progression toujours accessibles quel que soit le scroll. |
| **Lenis piloté par GSAP** | Synchronisation parfaite entre smooth scroll et animations. Pattern officiel recommandé. |

---

## 3. Technology Stack

### Frontend Framework

**Choix : Astro 5.x**

**Justification :**
- SSG (Static Site Generation) → zéro JS par défaut dans le HTML, idéal pour les performances (NFR-001)
- Islands Architecture → seuls les scripts interactifs (Three.js, GSAP) sont chargés côté client
- Vite intégré → bundling optimisé, code splitting automatique, tree-shaking
- Parfait pour un site single-page avec du contenu statique enrichi de scripts

**Trade-offs :**
- (+) Performance maximale, SEO natif, HTML-first
- (-) Pas de framework réactif (React/Vue) → interactions complexes en JS vanilla

### Rendu 3D

**Choix : Three.js r170+**

**Justification :**
- Standard de facto pour le WebGL dans le navigateur
- Écosystème mature : GLTFLoader, DRACOLoader, ShaderMaterial, post-processing
- Compatible WebGL2 et WebGPU (fallback transparent)
- Communauté massive, documentation exhaustive

**Trade-offs :**
- (+) Flexible, puissant, bien documenté
- (-) Verbose comparé à des abstractions comme React Three Fiber (mais on n'utilise pas React)

### Animation

**Choix : GSAP 3.x + ScrollTrigger**

**Justification :**
- Gold standard pour les animations liées au scroll
- Performance 60fps, battle-tested sur des milliers de sites Awwwards
- API déclarative claire : `gsap.to()`, `ScrollTrigger.create()`
- Gratuit pour usage non-commercial, licence business abordable

**Trade-offs :**
- (+) Fiable, performant, API intuitive
- (-) Licence commerciale requise pour usage business (mais gratuit pour portfolio)

### Smooth Scroll

**Choix : Lenis**

**Justification :**
- Ultra-léger (~3KB gzipped)
- Intégration officielle avec GSAP ScrollTrigger
- Smooth scroll natif, inertie configurable
- Maintenu par darkroom.engineering (créateurs de nombreux sites Awwwards)

### Audio

**Choix : Howler.js 2.x**

**Justification :**
- Gestion complète de l'autoplay mobile (AudioContext resume)
- Web Audio API avec fallback HTML5 Audio
- Sprites audio, crossfade, volume control
- Léger et simple d'utilisation

### GPU Detection

**Choix : detect-gpu (pmndrs)**

**Justification :**
- Classifie les GPU en tiers (0-3) basés sur benchmarks réels
- Permet des décisions de qualité adaptative dès le chargement
- Maintenu par l'équipe pmndrs (Three.js ecosystem)

### Optimisation Assets

**Choix : gltf-transform CLI**

**Justification :**
- Pipeline de compression : Draco (géométrie), WebP/KTX2 (textures)
- Merge meshes, strip unused data
- Standard de l'industrie pour l'optimisation glTF

### Déploiement

**Choix : Vercel**

**Justification :**
- Plan gratuit suffisant pour 5000 visiteurs/mois (NFR-005)
- CDN global automatique
- Preview deploys pour chaque PR
- Intégration native Astro

### Analytics

**Choix : Vercel Analytics (ou Plausible)**

**Justification :**
- Léger (< 1KB de script)
- RGPD-friendly, pas de cookies tiers
- Core Web Vitals intégrés
- Événements custom pour tracker le scroll par décennie

### Résumé Stack

| Catégorie | Technologie | Taille (gzip) |
|-----------|-------------|---------------|
| Framework | Astro 5.x | 0 KB (SSG) |
| 3D | Three.js r170+ | ~150 KB |
| Animation | GSAP 3 + ScrollTrigger | ~30 KB |
| Smooth Scroll | Lenis | ~3 KB |
| Audio | Howler.js 2 | ~10 KB |
| GPU Detection | detect-gpu | ~5 KB |
| Analytics | Vercel Analytics | ~1 KB |
| **Total JS** | | **~200 KB** |

---

## 4. System Components

### Component 1 : SceneManager

**Purpose :** Orchestrateur central de la couche Three.js

**Responsabilités :**
- Initialise le WebGLRenderer unique (canvas global)
- Gère la caméra perspective partagée
- Pilote la boucle de rendu (RAF)
- Coordonne les scènes actives (active/désactive selon le scroll)
- Ajuste la qualité selon le GPU tier (via detect-gpu)

**Interfaces :**
- `init(canvas)` → initialise le renderer
- `registerScene(id, sceneInstance)` → enregistre une scène
- `activateScene(id)` → active une scène (rendu)
- `deactivateScene(id)` → désactive + dispose
- `resize()` → gère le redimensionnement

**Dépendances :** Three.js, detect-gpu

**FRs adressés :** FR-005, FR-006, FR-007, FR-013, FR-014

---

### Component 2 : ScrollEngine

**Purpose :** Synchronisation Lenis + GSAP + ScrollTrigger

**Responsabilités :**
- Initialise Lenis (smooth scroll, sans autoRaf)
- Connecte Lenis au ticker GSAP (`lenis.on('scroll', ScrollTrigger.update)`)
- Pilote `lenis.raf(time * 1000)` depuis le ticker GSAP
- Désactive `lagSmoothing` pour synchronisation parfaite
- Crée les ScrollTrigger pour chaque section décennie

**Interfaces :**
- `init()` → setup Lenis + GSAP
- `createSectionTrigger(element, callbacks)` → ScrollTrigger par section
- `getProgress()` → progression globale (0-1)
- `destroy()` → cleanup

**Dépendances :** Lenis, GSAP, ScrollTrigger

**FRs adressés :** FR-001, FR-002, FR-003, FR-004

---

### Component 3 : AudioManager

**Purpose :** Gestion centralisée de l'audio par décennie

**Responsabilités :**
- Charge les fichiers audio (lazy, via Howler.js)
- Gère l'état global mute/unmute
- Crossfade entre décennies (500ms)
- Respect de l'autoplay policy (AudioContext resume après interaction)
- Mémorise l'état audio dans sessionStorage

**Interfaces :**
- `init()` → prépare Howler.js (pas encore de son)
- `unlock()` → débloque AudioContext (après clic "Commencer")
- `playDecade(id)` → joue l'ambiance de la décennie
- `crossfadeTo(id, duration)` → transition entre sons
- `toggleMute()` → mute/unmute global
- `isMuted()` → état courant

**Dépendances :** Howler.js

**FRs adressés :** FR-008, FR-009

---

### Component 4 : SceneLoader

**Purpose :** Chargement et gestion du cycle de vie des scènes 3D

**Responsabilités :**
- Singleton GLTFLoader + DRACOLoader (1 seule instance)
- Import dynamique des modules scène (`Scene1960.js`, etc.)
- Préchargement via IntersectionObserver (rootMargin 200px)
- Dispose complet (geometry, material, textures) quand hors viewport
- Monitoring de la mémoire GPU (`renderer.info.memory`)

**Interfaces :**
- `preload(sceneId)` → charge le .glb en avance
- `instantiate(sceneId)` → crée l'instance de scène
- `dispose(sceneId)` → libère toute la mémoire GPU
- `getMemoryUsage()` → debug : geometries + textures en mémoire

**Dépendances :** Three.js (GLTFLoader, DRACOLoader), IntersectionObserver

**FRs adressés :** FR-005, FR-013 (performance mobile)

---

### Component 5 : DecadeScene (×7 instances)

**Purpose :** Scène 3D individuelle pour une décennie

**Responsabilités :**
- Charge et affiche l'objet 3D de la décennie
- Gère les animations d'entrée/sortie liées au scroll
- Gère l'interaction utilisateur (rotation touch/souris)
- Applique la palette visuelle de l'époque (lighting, couleurs)
- Respecte les contraintes GPU tier (simplifie si tier bas)

**Interfaces :**
- `init(container, gpuConfig)` → setup scène + modèle
- `onScroll(progress)` → met à jour selon la position scroll
- `onInteraction(event)` → gère touch/mouse
- `dispose()` → libère les ressources

**Dépendances :** SceneManager, SceneLoader

**FRs adressés :** FR-005, FR-006, FR-007

---

### Component 6 : UIOverlay

**Purpose :** Interface utilisateur permanente (overlay fixed)

**Responsabilités :**
- Affiche le bouton audio toggle (mute/unmute)
- Affiche l'indicateur de progression (décennie courante)
- Met à jour l'UI selon le scroll (via ScrollEngine events)

**Interfaces :**
- Composants Astro : `AudioToggle.astro`, `ProgressBar.astro`
- Event listeners sur ScrollEngine pour les mises à jour

**Dépendances :** ScrollEngine, AudioManager

**FRs adressés :** FR-004, FR-009

---

### Diagramme des composants

```
                    ┌──────────────┐
                    │   Astro      │
                    │  (SSG Build) │
                    └──────┬───────┘
                           │ génère HTML statique
                           ▼
                    ┌──────────────┐
                    │  index.html  │
                    │  + sections  │
                    └──────┬───────┘
                           │ scripts client
              ┌────────────┼────────────┐
              ▼            ▼            ▼
      ┌──────────┐  ┌───────────┐  ┌────────────┐
      │ Scroll   │  │  Scene    │  │   Audio    │
      │ Engine   │  │  Manager  │  │   Manager  │
      │ (Lenis + │  │ (Three.js │  │ (Howler.js)│
      │  GSAP)   │  │  renderer)│  │            │
      └────┬─────┘  └─────┬─────┘  └────────────┘
           │               │
           │  ScrollTrigger │  IntersectionObserver
           │  events        │
           ▼               ▼
      ┌──────────┐  ┌───────────┐
      │  UI      │  │  Scene    │
      │  Overlay │  │  Loader   │
      │          │  │ (GLTF +   │
      │          │  │  Draco)   │
      └──────────┘  └─────┬─────┘
                          │ import dynamique
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
      ┌─────────┐   ┌─────────┐   ┌─────────┐
      │ Scene   │   │ Scene   │   │ Scene   │
      │ 1960    │   │ 1970    │   │ ...     │
      │ (souris)│   │(terminal)│  │         │
      └─────────┘   └─────────┘   └─────────┘
```

---

## 5. Data Architecture

### Pas de base de données

ALFRED_PLAY V2 est un site 100% statique. Aucune BDD, aucun backend. Toutes les données sont dans le code.

### Modèle de données : Config par décennie

Chaque décennie est définie par un objet de configuration :

```javascript
// src/lib/config/decades.js
export const DECADES = [
  {
    id: '1960',
    label: '1960',
    title: "L'aube de l'interaction",
    model: '/models/souris-1960.glb',
    fallbackImage: '/images/fallback/fallback-1960.webp',
    audio: '/audio/ambiance-1960.mp3',
    colors: {
      background: '#1a1a2e',
      accent: '#e94560',
      text: '#eaeaea',
    },
    personalStory: "...", // Texte de l'histoire de Nevil pour cette époque
    historicalText: "...", // Texte historique
    sceneModule: () => import('../scenes/Scene1960.js'),
  },
  // ... 6 autres décennies
];
```

### Flux de données

```
Données statiques (decades.js)
       │
       ├──→ Sections HTML (Astro compile au build)
       │    └── Textes, couleurs, structure
       │
       ├──→ SceneLoader (runtime)
       │    └── Chemin .glb, fallback image
       │
       ├──→ AudioManager (runtime)
       │    └── Chemin .mp3
       │
       └──→ ScrollEngine (runtime)
            └── Nombre de sections, IDs
```

### Assets statiques

| Type | Format | Localisation | Budget total |
|------|--------|-------------|--------------|
| Modèles 3D | .glb (Draco) | `public/models/` | < 3.5 MB (7 × ~500KB) |
| Audio | .mp3 128kbps | `public/audio/` | < 1.5 MB (7 × ~200KB) |
| Images fallback | .webp | `public/images/fallback/` | < 700 KB (7 × ~100KB) |
| Workers Draco | .wasm + .js | `public/draco/` | ~300 KB |
| **Total assets** | | | **< 6 MB** |

**Note :** le budget < 5 Mo au premier chargement (NFR-001) est respecté grâce au lazy loading. Seuls les assets de l'intro + la première décennie sont chargés initialement (~1.5 Mo). Le reste se charge à la demande.

---

## 6. Pipeline Assets 3D

### Workflow Blender → Web

```
1. MODÉLISATION (Blender via MCP)
   ├── Contrainte : < 5000 triangles par modèle
   ├── Style : low-poly stylisé (pas de photoréalisme)
   ├── Matériaux : PBR simple (baseColor + metallic/roughness)
   └── Textures : max 1024×1024 (512×512 pour les petits objets)

2. EXPORT (Blender)
   ├── Format : glTF 2.0 Binary (.glb)
   ├── Options : Apply modifiers, Draco compression activé
   └── Vérification : pas de vertex colors inutiles, pas de custom properties

3. OPTIMISATION (gltf-transform CLI)
   ├── gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp
   ├── Vérification : taille < 500KB
   └── Preview : gltf-transform inspect output.glb (vérifier triangles, taille textures)

4. INTÉGRATION (public/models/)
   ├── Copier le .glb optimisé dans public/models/
   ├── Mettre à jour decades.js avec le chemin
   └── Créer l'image fallback .webp correspondante
```

### Objets 3D par décennie (proposition)

| Décennie | Objet iconique | Justification |
|----------|---------------|---------------|
| 1960 | Souris d'Engelbart (en bois) | Premier périphérique d'interaction homme-machine |
| 1970 | Terminal VT100 | L'ère des terminaux et d'Unix |
| 1980 | Game Boy | Le gaming personnel devient mainstream |
| 1990 | Modem / Globe web | Internet entre dans les foyers |
| 2000 | iPod | La musique numérique révolutionne l'industrie |
| 2010 | iPhone / Smartphone | Le mobile change tout |
| 2020 | Cerveau IA / Robot | L'IA devient le nouvel outil universel |

---

## 7. Stratégie Performance

### Qualité Adaptative par GPU Tier

```javascript
// src/lib/utils/gpu-detect.js
import { getGPUTier } from 'detect-gpu';

export async function getQualityConfig() {
  const gpuTier = await getGPUTier();

  const configs = {
    0: { // Très faible — fallback 2D
      mode: 'fallback-2d',
      dpr: 1,
      antialias: false,
      shadows: false,
      postProcessing: false,
      particles: false,
    },
    1: { // Faible — 3D minimale
      mode: '3d-low',
      dpr: 1,
      antialias: false,
      shadows: false,
      postProcessing: false,
      particles: false,
    },
    2: { // Milieu de gamme — 3D complète
      mode: '3d-medium',
      dpr: Math.min(1.5, window.devicePixelRatio),
      antialias: false,
      shadows: false,
      postProcessing: false,
      particles: false,
    },
    3: { // Puissant — 3D + effets
      mode: '3d-high',
      dpr: Math.min(2, window.devicePixelRatio),
      antialias: true,
      shadows: true,
      postProcessing: true,
      particles: true,
    },
  };

  return {
    tier: gpuTier.tier,
    isMobile: gpuTier.isMobile,
    config: configs[gpuTier.tier] ?? configs[1],
  };
}
```

### Budget de rendu par frame

| Métrique | Limite mobile | Limite desktop |
|----------|---------------|----------------|
| Triangles à l'écran | < 10 000 | < 50 000 |
| Draw calls | < 50 | < 100 |
| Textures en VRAM | < 20 MB | < 100 MB |
| DPR | 1 - 1.5 | 1.5 - 2 |
| Shader precision | mediump | highp |

### Lazy Loading Strategy

```
Page load (0s)
├── HTML statique (< 50KB gzip)
├── CSS critique (< 10KB)
├── JS core : Lenis + GSAP (~33KB)
└── detect-gpu (~5KB)
     │
     ▼ Après interaction "Commencer" (~1s)
├── Three.js (~150KB)
├── Draco workers (~300KB, en background)
├── Howler.js (~10KB)
├── Scene1960.js + souris-1960.glb (~600KB)
└── ambiance-1960.mp3 (~200KB)
     │
     ▼ Pendant le scroll (à la demande, 200px avant)
├── Scene1970.js + terminal-1970.glb
├── ambiance-1970.mp3
├── ... (décennie par décennie)
└── Dispose des scènes passées
```

**Premier chargement effectif : ~550KB** (HTML + CSS + JS core + detect-gpu)
**Après "Commencer" : ~1.3MB** (Three.js + première scène + premier son)
**Chaque décennie : ~800KB** (scène + modèle + audio)

### Cycle de vie mémoire GPU

```
         ┌──────────────────────────────────────────────────┐
         │            IntersectionObserver                   │
         │         (rootMargin: '200px 0px')                 │
         └──────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
    HORS VIEWPORT        APPROCHE              VISIBLE         QUITTE
    (idle)            (preload zone)          (active)        (dispose)

    Rien en mémoire   Import dynamique      RAF actif        dispose()
    0 impact GPU      + charge .glb         rendu WebGL      Libère geometry,
                      Draco decode          + animations      material, textures
                      (Web Worker)                            Libère VRAM
```

**Règle : maximum 2-3 scènes en mémoire simultanément.** La scène courante + la suivante (préchargée) + éventuellement la précédente (pas encore disposée).

### Dispose Pattern

```javascript
// src/lib/utils/dispose.js
export function disposeScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (object.material) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value && value.isTexture) {
            value.dispose();
            // Libérer ImageBitmap si utilisé
            if (value.source?.data?.close) {
              value.source.data.close();
            }
          }
        }
        material.dispose();
      }
    }
  });

  scene.clear();
}
```

---

## 8. Architecture Audio

### Design

```
AudioManager (singleton)
│
├── État global
│   ├── muted: boolean (mémorisé en sessionStorage)
│   ├── unlocked: boolean (AudioContext résumé après interaction)
│   └── currentDecade: string | null
│
├── Sons (Howl instances, chargés à la demande)
│   ├── ambiance-1960 (loop: true)
│   ├── ambiance-1970 (loop: true)
│   ├── ... (7 total)
│   └── Chaque son est chargé quand la décennie approche
│
└── Comportements
    ├── unlock() → appelé sur clic "Commencer", résume AudioContext
    ├── playDecade(id) → joue le son de la décennie (loop)
    ├── crossfadeTo(id, 500ms) → fade out actuel, fade in nouveau
    └── toggleMute() → mute/unmute global, sauvegarde en sessionStorage
```

### Budget audio

| Fichier | Durée | Format | Taille estimée |
|---------|-------|--------|----------------|
| ambiance-1960.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| ambiance-1970.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| ambiance-1980.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| ambiance-1990.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| ambiance-2000.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| ambiance-2010.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| ambiance-2020.mp3 | 30-60s loop | MP3 128kbps | ~200 KB |
| **Total** | | | **< 1.5 MB** |

### Gestion Autoplay Mobile

1. Le site charge SANS son (pas d'autoplay)
2. L'écran d'intro affiche "Commencer le voyage" (FR-003)
3. Au clic → `AudioManager.unlock()` → `Howler.ctx.resume()`
4. Le son de la première décennie commence
5. Si le visiteur refuse le son → l'expérience fonctionne sans (NFR-004)

---

## 9. Scroll & Animation Architecture

### Setup Lenis + GSAP (pattern officiel)

```javascript
// src/lib/core/ScrollEngine.js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class ScrollEngine {
  constructor() {
    this.lenis = null;
    this.triggers = [];
  }

  init() {
    // Lenis SANS autoRaf (GSAP prend le contrôle)
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Synchroniser Lenis → ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    // GSAP ticker pilote Lenis (secondes → millisecondes)
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    // Désactiver lag smoothing pour sync parfaite
    gsap.ticker.lagSmoothing(0);
  }

  createDecadeTrigger(element, { onEnter, onLeave, onProgress }) {
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top center',
      end: 'bottom center',
      onEnter,
      onLeave,
      onUpdate: (self) => onProgress?.(self.progress),
    });
    this.triggers.push(trigger);
    return trigger;
  }
}
```

### Animations par décennie

Chaque section décennie utilise ScrollTrigger pour :
1. **Entrée** : fade in du texte, animation d'apparition de l'objet 3D
2. **Pendant** : parallax léger, rotation douce de l'objet 3D selon la progression
3. **Sortie** : fade out, transition de couleur vers la décennie suivante
4. **Audio** : crossfade vers le son de la décennie suivante

---

## 10. NFR Coverage

### NFR-001 : Performance — Temps de Chargement

**Exigence :** < 5 Mo initial, FCP < 2s sur 4G, Lighthouse > 90

**Solution architecturale :**
- Astro SSG → HTML statique, zéro JS par défaut
- Premier chargement effectif ~550KB (HTML + CSS + JS core)
- Import dynamique de Three.js après interaction
- Draco compression sur tous les .glb
- Lazy loading de chaque scène via IntersectionObserver
- Images en WebP pour les fallbacks

**Validation :**
- Lighthouse audit avant chaque déploiement
- Vérifier FCP avec WebPageTest sur 4G throttled
- Monitorer le poids du bundle avec `astro build --analyze`

---

### NFR-002 : Performance — Framerate Mobile

**Exigence :** 60 FPS sur Samsung Galaxy A milieu de gamme

**Solution architecturale :**
- detect-gpu → qualité adaptative (DPR, antialias, effets)
- DPR max 1.5 sur mobile
- Objets < 5000 triangles, max 10K à l'écran
- Dispose des scènes hors viewport (max 2-3 en mémoire)
- Shader precision mediump sur mobile
- Pas de shadows ni post-processing en tier < 3
- RAF unique partagé (pas de boucles multiples)

**Validation :**
- Test sur vrai appareil Galaxy A (Chrome DevTools remote)
- Performance monitor : viser < 16.6ms par frame
- `renderer.info.render.calls` pour compter les draw calls

---

### NFR-003 : Compatibilité — Navigateurs

**Exigence :** Chrome 90+, Safari 15+, Firefox 90+, Edge 90+, iOS Safari, Chrome Android

**Solution architecturale :**
- WebGL2 uniquement (pas de WebGPU obligatoire)
- Polyfill IntersectionObserver si nécessaire (très rare en 2026)
- Test de feature detection avant initialisation Three.js
- Fallback 2D complet si WebGL non disponible
- CSS modern reset avec fallbacks

**Validation :**
- BrowserStack ou test manuels sur Safari, Firefox, Chrome
- Vérifier WebGL2 support via `canvas.getContext('webgl2')`

---

### NFR-004 : Usabilité — Accessibilité

**Exigence :** Contrastes WCAG AA, expérience valide sans son, alt-text

**Solution architecturale :**
- HTML sémantique (Astro génère du vrai HTML)
- Les textes sont dans le DOM, pas dans le canvas 3D
- Contrastes vérifiés par palette dans `decades.js`
- `aria-label` sur les contrôles interactifs (bouton audio, CTA)
- L'expérience est compréhensible sans son ni 3D (texte HTML)

**Validation :**
- Lighthouse Accessibility audit
- Test avec son coupé → le voyage reste compréhensible

---

### NFR-005 : Scalabilité — Trafic

**Exigence :** 5000+ visiteurs/mois, Vercel gratuit

**Solution architecturale :**
- Site 100% statique (Astro SSG) → pas de serveur
- Vercel CDN global pour tous les assets
- Pas de dépendance serveur, BDD ou API
- Assets en cache longue durée (immutable hashing par Vite)

**Validation :**
- Vercel dashboard : vérifier les limites du plan gratuit
- Si besoin : Cloudflare Pages comme alternative gratuite

---

### NFR-006 : Maintenabilité — Qualité du Code

**Exigence :** Code modulaire, commentaires en français

**Solution architecturale :**
- 1 composant Astro par section décennie
- 1 module JS par scène 3D
- Config centralisée dans `decades.js`
- Commentaires en français (convention CLAUDE.md)
- Nommage clair : `SceneManager`, `ScrollEngine`, `AudioManager`

**Validation :**
- Review de la structure avant chaque sprint
- Pas de fichier > 300 lignes (signe de refactoring nécessaire)

---

### NFR-007 : SEO — Indexabilité

**Exigence :** Meta tags, OG tags, sitemap, robots.txt

**Solution architecturale :**
- Astro gère nativement les meta tags dans le `<head>`
- `@astrojs/sitemap` pour la génération automatique du sitemap
- Open Graph tags dans le layout (og:title, og:description, og:image)
- Twitter Card tags
- robots.txt dans `public/`
- Le contenu textuel est dans le HTML (pas caché dans le canvas)

**Validation :**
- Google Search Console après déploiement
- Test OG avec https://www.opengraph.xyz/

---

## 11. Security

### Surface d'attaque minimale

Ce site est **statique**. Pas de backend, pas de BDD, pas de formulaire côté serveur, pas d'authentification. La surface d'attaque est quasi nulle.

**Mesures :**
- HTTPS forcé (Vercel par défaut)
- Headers de sécurité dans `vercel.json` :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy` restrictive
- Pas de données utilisateur collectées
- Analytics sans cookies (RGPD-friendly)
- Le formulaire de contact (si présent) sera un lien `mailto:` ou un lien LinkedIn, pas un formulaire backend

---

## 12. Development & Deployment

### Code Organization

```
ALFRED_PLAY_V2/
├── src/
│   ├── layouts/           Layouts Astro (BaseLayout avec canvas)
│   ├── pages/             Pages (index.astro uniquement)
│   ├── components/
│   │   ├── sections/      1 composant Astro par section
│   │   └── ui/            UI overlay (audio toggle, progress)
│   ├── lib/
│   │   ├── core/          Managers (Scene, Scroll, Audio)
│   │   ├── scenes/        1 scène Three.js par décennie
│   │   ├── utils/         Helpers (GPU detect, loader, dispose)
│   │   └── config/        Config décennies
│   └── styles/            CSS global + par décennie
├── public/
│   ├── models/            .glb compressés
│   ├── audio/             .mp3 par décennie
│   ├── draco/             Workers Draco
│   └── images/            Fallbacks 2D + OG image
├── docs/                  BMAD docs (briefs, PRD, architecture)
├── astro.config.mjs       Config Astro
├── package.json
└── CLAUDE.md
```

### Testing Strategy

| Type | Outil | Cible |
|------|-------|-------|
| Performance | Lighthouse CI | Score > 90 |
| Framerate | Chrome DevTools (Performance tab) | 60 FPS sur mobile |
| Cross-browser | Test manuel (Chrome, Safari, Firefox) | Pas de bugs visuels |
| Mobile | Chrome Remote Debugging sur vrai appareil | Touch, scroll, 3D OK |
| Accessibilité | Lighthouse + test manuel | Contrastes, navigation clavier |
| SEO | Lighthouse + Search Console | Meta tags, sitemap |

### CI/CD Pipeline

```
git push → Vercel auto-deploy
├── Build : astro build
├── Preview : URL de preview par commit
├── Production : merge sur main → deploy prod
└── Rollback : 1 clic dans Vercel dashboard
```

Pas de CI complexe nécessaire pour un Level 2. Vercel gère le build + deploy automatiquement.

### Environments

| Environnement | URL | Usage |
|---------------|-----|-------|
| Développement | `localhost:4321` | `astro dev` local |
| Preview | `*.vercel.app` | Auto-deploy par commit/PR |
| Production | `alfredplay.com` (TBD) | Merge sur `main` |

---

## 13. FR Traceability

| FR ID | FR Name | Components | Notes |
|-------|---------|------------|-------|
| FR-001 | Navigation scroll vertical | ScrollEngine | Lenis + GSAP ScrollTrigger |
| FR-002 | 7 sections décennies | Sections Astro (×7) | 1 composant par décennie |
| FR-003 | Écran d'intro | IntroSection | Débloque audio, lance le voyage |
| FR-004 | Indicateur de progression | UIOverlay (ProgressBar) | Mis à jour via ScrollEngine |
| FR-005 | Objet 3D par décennie | DecadeScene (×7), SceneLoader | Import dynamique + lazy load |
| FR-006 | Interaction 3D | DecadeScene | Touch/mouse rotation |
| FR-007 | Ambiance visuelle | DecadeScene, decades.js | Couleurs + lighting par époque |
| FR-008 | Son immersif | AudioManager | Howler.js, crossfade |
| FR-009 | Contrôle audio | UIOverlay (AudioToggle), AudioManager | Mute/unmute + sessionStorage |
| FR-010 | Textes historiques | Sections Astro | HTML natif, animations GSAP |
| FR-011 | Histoire personnelle | Sections Astro, decades.js | Intégrée dans le flow HTML |
| FR-012 | Section contact | ContactSection | CTA LinkedIn + email |
| FR-013 | Mobile-first | Tous les composants | DPR adaptatif, touch support |
| FR-014 | Desktop enrichi | SceneManager, DecadeScene | Config GPU tier 3 |
| FR-015 | SEO & Open Graph | BaseLayout | Meta tags Astro natifs |
| FR-016 | Analytics | BaseLayout | Vercel Analytics script |
| FR-017 | Easter eggs | DecadeScene (2-3 spécifiques) | Interactions cachées |

**Couverture : 17/17 FRs → 100%**

---

## 14. NFR Traceability

| NFR ID | NFR Name | Solution | Validation |
|--------|----------|----------|------------|
| NFR-001 | Perf — Chargement | SSG + lazy load + Draco + import dynamique | Lighthouse > 90, FCP < 2s |
| NFR-002 | Perf — Framerate | detect-gpu + DPR adaptatif + dispose + budget tri | 60 FPS Galaxy A |
| NFR-003 | Compatibilité | WebGL2 + feature detection + fallback 2D | Test cross-browser |
| NFR-004 | Accessibilité | HTML sémantique + contrastes + aria + sans-son OK | Lighthouse a11y |
| NFR-005 | Scalabilité | Vercel SSG + CDN | Dashboard Vercel |
| NFR-006 | Maintenabilité | 1 module/décennie + config centralisée + FR comments | Review structure |
| NFR-007 | SEO | Astro meta + sitemap + OG tags | Search Console |

**Couverture : 7/7 NFRs → 100%**

---

## 15. Trade-offs

### Décision 1 : Canvas unique vs. Canvas par section

**Choix :** Canvas unique global (position fixed)

**Trade-off :**
- (+) Évite la limite de contextes WebGL (~8 par navigateur)
- (+) Un seul renderer = une seule boucle RAF = meilleure performance
- (-) Plus complexe à orchestrer (SceneManager doit switch entre scènes)
- (-) Pas de rendu 3D isolé par section (tout passe par le même pipeline)

**Justification :** La performance prime (NFR-002). Un seul renderer est significativement plus performant que 7 renderers séparés.

---

### Décision 2 : Astro Islands vs. Script global

**Choix :** Script global dans le layout (pas d'Islands pour Three.js)

**Trade-off :**
- (+) Contrôle total sur le cycle de vie Three.js
- (+) Pas de surcoût d'hydratation de framework
- (+) Plus simple à debugger
- (-) Pas de composant réactif (React/Vue) pour le 3D
- (-) Gestion manuelle de l'état

**Justification :** Three.js est impératif par nature. L'encapsuler dans un Island React ajouterait de la complexité sans bénéfice. Le JS vanilla est plus léger et plus performant.

---

### Décision 3 : Dispose agressif vs. Cache en mémoire

**Choix :** Dispose des scènes quand elles quittent le viewport

**Trade-off :**
- (+) Mémoire GPU maîtrisée (max 2-3 scènes)
- (+) Pas de crash sur mobile faible
- (-) Re-chargement si le visiteur scrolle en arrière rapidement
- (-) Légère latence au re-chargement

**Justification :** Sur mobile milieu de gamme, la VRAM est limitée (~1-2 GB partagés). Garder 7 scènes en mémoire risque un crash. La latence de re-chargement est atténuée par Draco (décodage rapide dans un Worker).

---

### Décision 4 : MP3 vs. WebM/OGG pour l'audio

**Choix :** MP3 128kbps

**Trade-off :**
- (+) Compatibilité universelle (tous navigateurs)
- (+) Bon ratio qualité/taille pour de l'ambiance
- (-) Pas le codec le plus efficace (Opus serait mieux mais support inégal)

**Justification :** La compatibilité (NFR-003) prime sur l'optimisation audio. 200KB par décennie en MP3 est acceptable.

---

## 16. Risques Architecturaux

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Lenis + GSAP désynchronisés | Scroll saccadé | Low | Pattern officiel documenté. Test dès Phase 0. |
| Fuite mémoire GPU | Crash mobile | Medium | Dispose pattern + monitoring `renderer.info.memory` |
| Draco decode lent sur mobile faible | Lag au changement de décennie | Low | Préchargement 200px avant. Worker thread ne bloque pas le main. |
| Safari WebGL quirks | Rendu cassé sur iOS | Medium | Test iOS Safari dès Phase 0. Fallback 2D en plan B. |
| GSAP license en usage commercial | Blocage légal | Low | Portfolio personnel = usage gratuit. Vérifier si freelance plus tard. |

---

## 17. Open Architectural Questions (résolues au sprint)

1. **Taille réelle des .glb** — à valider quand les premiers modèles Blender sont créés
2. **Nombre exact de draw calls** — à mesurer avec les vrais modèles
3. **Safari iOS ScrollTrigger** — connu pour avoir des quirks, tester Phase 0
4. **Format audio optimal** — tester MP3 vs OGG Vorbis sur mobile Safari

---

**Ce document a été créé avec la méthode BMAD v6 — Phase 3 (Solutioning)**

*Pour continuer : Lancer `/bmad:sprint-planning` pour décomposer les epics en user stories et planifier les sprints d'implémentation.*
