# STATUS REPORT TECHNIQUE — ALFRED PLAY V2

> Date : 23 février 2026
> Auteur : Agent Architecte & QA
> Commit de référence : `02ca55d` (master)

---

## 1. ARCHITECTURE GLOBALE (Stack & Routing)

### Stack confirmée

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework | Astro | ^5.3.0 |
| Rendu 3D | Three.js | ^0.172.0 |
| Scroll | Lenis + GSAP/ScrollTrigger | ^1.1.18 / ^3.12.7 |
| Audio | Howler.js | ^2.2.4 |
| GPU detection | detect-gpu | ^5.0.61 |
| Build tool | Vite (via Astro) | embarqué |
| Output | SSG statique (`output: 'static'`) | — |

**Chunk size warning** relevé à 600 KB pour accommoder Three.js (~530 KB minifié).

### Routing / Navigation entre décennies

Il n'y a **pas de routing** au sens SPA. Le site est une **single page** (`index.astro`) avec scroll continu.

**Flux de navigation :**

```
Lenis (smooth scroll)
  → GSAP ScrollTrigger.update() à chaque frame
    → createDecadeTrigger() par section .section-decade
      → onEnter()    : active la scène 3D, dispatch `decade:enter`
      → onLeave()    : désactive la scène 3D, dispatch `decade:leave`
      → onProgress() : transmet progress (0→1) à scene.onScroll()
```

**Paramètres Lenis :**
- `duration: 1.2`
- `easing: expo-out` (1.001 - 2^(-10t))
- `touchMultiplier: 2` (mobile)
- GSAP `lagSmoothing(0)` pour sync parfaite

**Trigger config :** `start: 'top center'`, `end: 'bottom center'`, `onEnterBack` et `onLeaveBack` couverts.

### Architecture 3 couches Z-index

```
Z-0  │ <canvas id="webgl-canvas">  │ position: fixed, fullscreen, pointer-events: none
Z-1  │ <main> (slot)               │ position: relative, scrollable
Z-2  │ <div class="ui-overlay">    │ position: fixed, AudioToggle
```

### Lazy loading Three.js

Three.js (~150 KB gzip) est chargé **dynamiquement** uniquement après :
- Clic sur le CTA "Commencer le voyage", OU
- Scroll vers la première section décennie

Fonction `initThreeJS()` dans `init.js` importe dynamiquement `SceneManager.js` + `SceneLoader.js`.

---

## 2. LE FOND (Moteur 3D & Objets)

### Les 7 scènes

| Scène | Fichier | Objet | Triangles | Scale | Interaction curseur |
|-------|---------|-------|-----------|-------|-------------------|
| 1960 | Scene1960.js | Souris Engelbart (bois, bouton rouge, câble, roulettes) | ~200 | 2.8 | Parallax 3D (X: 0.9, Z: 0.5) |
| 1970 | Scene1970.js | Terminal VT100 (CRT phosphore vert, clavier 3×10 touches) | ~300 | 1.2 | Écran glow (0.3→1.15) + curseur clignotant (2→8 Hz) |
| 1980 | Scene1980.js | Game Boy DMG-01 (D-pad, boutons A/B, grille HP, cartouche) | ~250 | 1.5 | Tilt 3D (Y: 0.4, X: 0.3) |
| 1990 | Scene1990.js | Globe wireframe + modem US Robotics (5 LEDs, câble) | ~400 | 1.08 | Rotation dynamique (boost: 0.06) |
| 2000 | Scene2000.js | iPod Classic (corps blanc, dos chrome, click wheel, LCD) | ~200 | 1.7 | Molette tourne (lerp: 0.3, atan2) |
| 2010 | Scene2010.js | iPhone (notch, écran bleu iOS, module caméra arrière) | ~200 | 1.2 | Écran glow (0.25→1.2) + PointLight (0.3→1.5) |
| 2020 | Scene2020.js | Cerveau IA (2 hémisphères, 12 nodes, 10 synapses, 3 anneaux, 6 particules) | ~500 | 1.8 | Anneaux dévient (0.01), particules attirées (0.5), nodes pulsent (0.8→1.3) |

### Génération des objets : PROCÉDURAL (pas de .glb)

**Constat critique :** Les 7 scènes utilisent exclusivement des **primitives Three.js** (BoxGeometry, SphereGeometry, CylinderGeometry, PlaneGeometry, TorusGeometry). Aucun modèle .glb externe n'est chargé.

Le dossier `public/models/` existe mais est **vide**.

Cependant, l'infrastructure de chargement est **prête** :
- `SceneLoader.js` initialise GLTFLoader + DRACOLoader (WASM)
- Les décodeurs Draco sont présents dans `public/draco/`
- Chaque scène reçoit `gltfLoader` dans son constructeur
- `decades.js` référence des paths `.glb` (ex: `/models/souris-1960.glb`) mais ils ne sont pas utilisés
- Les commentaires de chaque scène indiquent : *"Remplaçable par un .glb Blender via le pipeline SceneLoader"*

**Conclusion :** Le pipeline est prêt pour le switch procédural → .glb. Il suffit de remplacer `_createModel()` par un appel `this.gltfLoader.load()`.

### Multiplicateurs d'interaction curseur — VÉRIFIÉS ET ACTIFS

**SceneManager.js (`_renderLoop`, appelé chaque frame) :**
```
CURSOR_LERP = 0.12
mouse.x += (_mouseTarget.x - mouse.x) * 0.12   ← lerp actif
mouse.y += (_mouseTarget.y - mouse.y) * 0.12   ← lerp actif
→ sceneInstance.onCursorMove(mouse.x, mouse.y)  ← dispatch actif
```

**Source du curseur :**
- Desktop : `window.mousemove` → normalise clientX/Y en -1 à +1
- Mobile : `window.deviceorientation` → gamma/beta normalisés (clamp ±45°)
- iOS 13+ : permission demandée au premier `touchstart`

### Gestion mémoire 3D

- `SceneLoader` limite à **3 scènes en mémoire** simultanément (LRU eviction)
- `dispose.js` nettoie geometry + material + textures récursivement
- IntersectionObserver prefetch à **200px** du viewport

### Qualité GPU adaptative

| Tier | Mode | DPR | Antialias | Shadows |
|------|------|-----|-----------|---------|
| 0 | fallback-2d | 1 | non | non |
| 1 | 3d-low | 1 | non | non |
| 2 | 3d-medium | 1.5 | non | non |
| 3 | 3d-high | 2 | oui | oui (PCFSoft) |

DPR cappé à 1.5 sur mobile, 2 sur desktop.

---

## 3. LA FORME (UI & Design System)

### Conformité design-system.md — VALIDÉE

| Règle | Statut | Détail |
|-------|--------|--------|
| MAX 3 couleurs | **OK** | `#0A0A0A` (bg), `#F5F5F7` (text), `#E63946` (accent) |
| Fonts custom | **OK** | Space Grotesk (display) + Plus Jakarta Sans (body) via Google Fonts |
| Layout asymétrique | **OK** | CSS Grid `1fr 1fr`, alternance `nth-child(even)` swap order |
| Espacement généreux | **OK** | `--space-section: clamp(8rem, 15vh, 16rem)` entre sections |
| Texte max 600px | **OK** | `max-width: 38ch` appliqué sur `.section-decade__text` |
| Easing custom | **OK** | `cubic-bezier(0.16, 1, 0.3, 1)` — pas de `ease` ni `linear` |
| Pas de bounce sur texte | **OK** | Bounce/elastic réservé aux objets 3D uniquement |
| Mobile responsive | **OK** | Grid collapse en 1 colonne sous 768px, `text-align: left` |
| Stagger animations | **OK** | `.reveal` avec `transition-delay` incrémental (0, 100, 200, 300ms) |

### Curseur custom (Point + Anneau avec easing)

**NON IMPLÉMENTÉ.**

Aucun curseur DOM custom n'existe dans le projet. Le site utilise le curseur navigateur par défaut. Aucun fichier ne contient de `.cursor-dot`, `.cursor-ring`, `mouse-follower`, ni de logique de curseur visuel.

Le tracking souris dans `SceneManager.js` sert **uniquement** aux interactions 3D (parallax, glow, tilt), pas à un curseur visuel.

### Layout asymétrique — CONFIRMÉ

```css
/* global.css */
.section-decade {
  display: grid;
  grid-template-columns: 1fr 1fr;     /* Texte | 3D */
  gap: var(--space-lg);                /* 64px */
}

/* Alternance pair/impair */
.section-decade:nth-child(even) .section-decade__text   { order: 2; }
.section-decade:nth-child(even) .section-decade__visual { order: 1; }
```

- **IntroSection** : centré (autorisé — c'est le hero)
- **DecadeSection** : asymétrique, alternance gauche/droite
- **ContactSection** : centré (autorisé — c'est le footer hero)

### Audio

- 7 fichiers `ambiance-*.mp3` présents (15.9 KB chacun — placeholders)
- Crossfade 500ms entre décennies
- État mute persisté en `sessionStorage`
- AudioContext unlock sur premier `touchstart`/CTA click

---

## 4. DETTE TECHNIQUE & NEXT STEPS

### Bloquants critiques

| # | Problème | Impact | Priorité |
|---|----------|--------|----------|
| 1 | **Pas de modèles 3D réalistes** — Les 7 objets sont des primitives procédurales (BoxGeometry, etc.). Le dossier `public/models/` est vide. | Disqualifiant pour Awwwards. Les objets actuels sont des placeholders. | **P0** |
| 2 | **Pas de curseur custom** — Le curseur navigateur par défaut est affiché. Un site Awwwards nécessite un curseur stylisé (dot + ring + easing). | Manque de polish visible immédiatement. | **P1** |
| 3 | **Audio placeholder** — Les 7 MP3 font 15.9 KB chacun (< 1 seconde). Ce sont des fichiers vides/silence. | L'ambiance sonore est absente. | **P1** |

### Optimisations manquantes

| # | Sujet | État actuel | Cible Awwwards |
|---|-------|-------------|---------------|
| 4 | Post-processing | `postProcessing: false` sur tous les tiers sauf tier 3. Aucun effet implémenté. | Bloom subtil sur les éléments émissifs (écrans, nodes), vignette légère |
| 5 | Transitions entre décennies | Cut sec (activate/deactivate). | Crossfade 3D ou morphing entre objets |
| 6 | Preloader / loading screen | Aucun. Le site affiche le contenu dès le DOM ready. | Animation de chargement séquencée (%, barre, transition vers le hero) |
| 7 | Textures PBR | Matériaux simples (couleur + roughness). Pas de normal maps, pas de environment maps. | Environment map HDRI pour les reflets (chrome iPod, écran iPhone) |
| 8 | Scroll indicator | Un `#scroll-hint` existe dans l'intro mais aucun indicateur de progression globale. | Progress bar ou indicateur de décennie active |
| 9 | Favicon & OG tags | `favicon.svg` présent. Pas de meta OG (Open Graph), pas de `og:image`. | OG image, Twitter card, meta description dynamique |
| 10 | Performance monitoring | Aucun outil de monitoring FPS en production. | Stats.js en dev, Web Vitals en production |

### Points positifs (acquis solides)

- Architecture modulaire propre (singleton SceneManager, scenes indépendantes, lazy loading)
- Gestion mémoire GPU (LRU 3 scènes max, dispose récursif)
- GPU tier detection avec fallback gracieux (tier 0 → 2D)
- Design system strict et appliqué (3 couleurs, fonts custom, espacement généreux)
- Interactions curseur sur les 7 scènes avec lerp fluide et fallback gyroscope mobile
- Drag/touch rotation avec amortissement et auto-reset
- Audio architecture complète (crossfade, mute persistant, AudioContext unlock)
- Code-splitting Three.js (150 KB gzip chargé après interaction)

---

## RÉSUMÉ EXÉCUTIF

Le projet a une **architecture technique solide** et un **design system bien appliqué**. Le moteur 3D, le scroll, l'audio et les interactions curseur sont fonctionnels.

Les **3 lacunes majeures** avant soumission Awwwards sont :
1. Remplacer les primitives Three.js par des modèles .glb réalistes (pipeline prêt, assets manquants)
2. Implémenter un curseur custom DOM (dot + ring + easing cubic-bezier)
3. Produire des ambiances audio réelles pour chaque décennie

Le site est actuellement à un stade **prototype fonctionnel avancé** — l'ossature est là, il manque le vernis final.
