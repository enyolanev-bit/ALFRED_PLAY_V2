# ALFRED PLAY V2 — Design System

> "Le code sans design system = AI slop. Le code AVEC design system = site premium."

Ce document est la source de vérité pour TOUT le CSS du projet.
Claude Code DOIT le lire avant chaque modification visuelle.

---

## 1. Philosophie

ALFRED PLAY raconte l'histoire de l'informatique de 1960 à 2020, mêlée à l'histoire personnelle de Nevil.
C'est un **portfolio immersif**, pas un site corporate. Le design doit évoquer :

- **Cinématique** — comme un film documentaire interactif
- **Éditorial** — comme un long-form du New York Times
- **Muséal** — comme une exposition au Centre Pompidou

Référence principale : [Voku Studio](https://voku.studio/) — Awwwards SOTD 21/02/2026, score 7.25/10.
Stack identique au nôtre (Three.js + SSG). 2 couleurs seulement. Espace blanc généreux.

---

## 2. Palette de couleurs

### RÈGLE ABSOLUE : Maximum 3 couleurs + variations d'opacité

```css
:root {
  /* === FOND === */
  --color-bg:            #0A0A0A;    /* Noir profond — fond principal */
  --color-bg-elevated:   #141414;    /* Cartes, sections surélevées */
  --color-bg-subtle:     #1A1A1A;    /* Hover states, bordures subtiles */

  /* === TEXTE === */
  --color-text-primary:  #F5F5F7;    /* Texte principal — blanc cassé Apple */
  --color-text-secondary:#86868B;    /* Sous-titres, descriptions, dates */
  --color-text-muted:    #48484A;    /* Labels discrets, metadata */

  /* === ACCENT === */
  --color-accent:        #E63946;    /* Rouge vif — UN SEUL accent */
  --color-accent-hover:  #FF4D5A;    /* Hover state de l'accent */
  --color-accent-muted:  rgba(230, 57, 70, 0.15); /* Background subtil accent */

  /* === UTILITAIRES === */
  --color-border:        rgba(255, 255, 255, 0.08); /* Bordures très subtiles */
  --color-overlay:       rgba(0, 0, 0, 0.6);        /* Overlay sur 3D */
}
```

### CE QUI EST INTERDIT

- ❌ Pas de couleur par décennie (pas de vert 1970, bleu 2010, etc.)
- ❌ Pas de gradient multicolore
- ❌ Pas de glow/neon/shadow coloré
- ❌ Pas de background-color autre que les 3 variantes de --color-bg
- ❌ Pas de texte coloré sauf --color-accent pour les titres de section

### DIFFÉRENCIER LES DÉCENNIES SANS COULEUR

Utiliser la **typographie**, la **taille des éléments 3D**, et les **textures** pour distinguer les époques.
Pas la couleur. La couleur reste uniforme sur tout le site.

---

## 3. Typographie

### Fonts

```css
/* Display — titres, dates, chiffres grands */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* Body — texte courant, descriptions */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Space Grotesk', sans-serif;
  --font-body:    'Plus Jakarta Sans', sans-serif;
}
```

### Échelle typographique

```css
:root {
  /* Display */
  --text-hero:     clamp(4rem, 8vw, 8rem);     /* Titre hero uniquement */
  --text-decade:   clamp(5rem, 12vw, 12rem);    /* Les gros chiffres 1960, 1970... */
  --text-h1:       clamp(2rem, 4vw, 3.5rem);    /* Titres de section */
  --text-h2:       clamp(1.5rem, 3vw, 2rem);    /* Sous-titres */
  --text-h3:       clamp(1.125rem, 2vw, 1.5rem);/* Labels */

  /* Body */
  --text-body:     clamp(1rem, 1.5vw, 1.125rem);   /* Texte courant */
  --text-small:    clamp(0.8rem, 1.2vw, 0.875rem);  /* Captions, metadata */
  --text-tiny:     0.75rem;                           /* Labels très petits */
}
```

### Règles typographiques

- Les chiffres de décennie (1960, 1970...) utilisent `--font-display` en `--text-decade` avec `font-weight: 700` et `color: var(--color-text-muted)` (très subtil en background)
- Les titres de section ("L'aube de l'interaction") utilisent `--font-display` en `--text-h1` avec `color: var(--color-accent)`
- Le texte courant utilise `--font-body` en `--text-body` avec `color: var(--color-text-primary)` et `line-height: 1.7`
- Les sous-titres ("La souris d'Engelbart") utilisent `--font-body` en `--text-h3` avec `color: var(--color-text-secondary)` et `text-transform: none`
- La mention "MON HISTOIRE" utilise `--font-display` en `--text-small` avec `color: var(--color-accent)` et `letter-spacing: 0.15em` et `text-transform: uppercase`
- Le label "SCROLLEZ" utilise `--font-display` en `--text-tiny` avec `letter-spacing: 0.3em` et `text-transform: uppercase`

### CE QUI EST INTERDIT

- ❌ Jamais de font système (sans-serif, Arial, Helvetica, Times)
- ❌ Jamais de font-weight en dessous de 300 (trop fin sur écran)
- ❌ Jamais de text-align: center sur du texte body de plus de 2 lignes
- ❌ Jamais de line-height en dessous de 1.5 pour le body text

---

## 4. Espacements

### Système de spacing

```css
:root {
  --space-xs:   0.5rem;    /* 8px */
  --space-sm:   1rem;      /* 16px */
  --space-md:   2rem;      /* 32px */
  --space-lg:   4rem;      /* 64px */
  --space-xl:   8rem;      /* 128px */
  --space-2xl:  12rem;     /* 192px */
  --space-section: clamp(8rem, 15vh, 16rem); /* Entre les sections décennie */
}
```

### Règles d'espacement

- Entre deux sections de décennie : `--space-section` minimum (PAS moins de 128px)
- Padding interne des cartes texte : `--space-lg` vertical, `--space-md` horizontal
- Entre le titre et le sous-titre : `--space-sm`
- Entre le sous-titre et le texte body : `--space-md`
- Marge latérale du contenu texte : `max(5vw, 2rem)` sur les côtés

### CE QUI EST INTERDIT

- ❌ Jamais de margin: 0 entre deux blocs de contenu
- ❌ Jamais de sections qui se "collent" visuellement
- ❌ Toujours au moins --space-lg entre le texte et un objet 3D

---

## 5. Layout

### Grille

```css
.section-decade {
  display: grid;
  grid-template-columns: 1fr 1fr;        /* Texte | 3D (ou inversé) */
  gap: var(--space-lg);
  align-items: center;
  min-height: 100vh;
  padding: var(--space-xl) max(5vw, 2rem);
}

/* Alterner gauche/droite pour le rythme */
.section-decade:nth-child(even) .content-text { order: 2; }
.section-decade:nth-child(even) .content-3d   { order: 1; }

/* Mobile */
@media (max-width: 768px) {
  .section-decade {
    grid-template-columns: 1fr;
    text-align: left; /* JAMAIS center sur mobile */
  }
}
```

### Règles de layout

- **Layout asymétrique** — texte d'un côté, 3D de l'autre. JAMAIS tout empilé centré
- **Alternance** — une section texte à gauche / 3D droite, la suivante inversée
- **Le texte ne dépasse jamais 600px de large** (max-width: 38ch ou 600px)
- **Les chiffres de décennie** sont en position absolute, très grand, très transparent, en arrière-plan
- **Le canvas WebGL** reste en `position: fixed` fullscreen avec `z-index: 0`
- **Le contenu HTML** scrolle par-dessus avec `position: relative` et `z-index: 1`

### CE QUI EST INTERDIT

- ❌ Jamais de `text-align: center` sur une section entière (sauf le hero)
- ❌ Jamais de `margin: 0 auto` sur les blocs texte des décennies
- ❌ Le hero est la SEULE section autorisée à être centrée

---

## 6. Composants

### Carte de décennie (texte)

```css
.decade-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
  max-width: 600px;
  backdrop-filter: blur(20px);
}
```

### Bloc "Mon Histoire"

```css
.personal-story {
  border-left: 3px solid var(--color-accent);
  padding-left: var(--space-md);
  margin-top: var(--space-md);
}

.personal-story__label {
  font-family: var(--font-display);
  font-size: var(--text-small);
  color: var(--color-accent);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: var(--space-xs);
}

.personal-story__text {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-text-secondary);
  font-style: italic;
  line-height: 1.7;
}
```

### Chiffres de décennie (background)

```css
.decade-number {
  font-family: var(--font-display);
  font-size: var(--text-decade);
  font-weight: 700;
  color: var(--color-text-muted);
  opacity: 0.3;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  user-select: none;
  pointer-events: none;
  z-index: 0;
}
```

---

## 7. Animations & Transitions

### Easing curves

```css
:root {
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);      /* Entrées principales */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);      /* Transitions douces */
  --ease-in-out:    cubic-bezier(0.76, 0, 0.24, 1);      /* Hover states */
  --duration-fast:  200ms;
  --duration-base:  400ms;
  --duration-slow:  800ms;
  --duration-enter: 1200ms;  /* Animation d'entrée de section */
}
```

### Animations d'entrée (scroll-triggered)

```css
/* Fade up staggeré — les éléments d'une section apparaissent l'un après l'autre */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity var(--duration-slow) var(--ease-out-expo),
              transform var(--duration-slow) var(--ease-out-expo);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger : chaque enfant a un délai croissant */
.reveal:nth-child(1) { transition-delay: 0ms; }
.reveal:nth-child(2) { transition-delay: 100ms; }
.reveal:nth-child(3) { transition-delay: 200ms; }
.reveal:nth-child(4) { transition-delay: 300ms; }
```

### Hover states

```css
/* Liens et éléments interactifs */
a, button, .interactive {
  transition: color var(--duration-fast) var(--ease-in-out),
              transform var(--duration-fast) var(--ease-in-out);
}

a:hover {
  color: var(--color-accent);
}

.interactive:hover {
  transform: scale(1.02);
}
```

### CE QUI EST INTERDIT

- ❌ Jamais de `transition: all` (toujours spécifier les propriétés)
- ❌ Jamais de `ease` ou `linear` (utiliser les customs ci-dessus)
- ❌ Jamais d'animation qui dure plus de 1.5s (sauf entrée de page initiale)
- ❌ Jamais de bounce/elastic sur du texte (réservé aux objets 3D)

---

## 8. Objets 3D

### Règles pour les scènes Three.js

- Chaque objet 3D doit être un **modèle réaliste** (GLB/GLTF depuis Blender), PAS une forme géométrique primitive
- Taille cible : **<500KB** par modèle, textures compressées (KTX2 si possible)
- Éclairage : **1 directional light** (blanc chaud) + **1 ambient light** (très faible) + **1 rim light** optionnel
- L'objet doit avoir une **rotation lente automatique** (0.002 rad/frame) + répondre au drag utilisateur
- Le fond du canvas doit être **transparent** (`alpha: true` sur le WebGLRenderer) pour se fondre avec le CSS

### Assets cibles par décennie

| Décennie | Objet principal | Style |
|----------|----------------|-------|
| 1960 | Souris d'Engelbart en bois | Réaliste, textures bois |
| 1970 | Terminal VT100 | Écran vert phosphore, boîtier beige |
| 1980 | Game Boy (DMG-01) | Gris plastique, écran vert-jaune |
| 1990 | Navigateur Netscape (écran) | Fenêtre OS classique |
| 2000 | iPod Classic (1ère gen) | Blanc, molette circulaire |
| 2010 | iPhone (original) | Noir, écran tactile |
| 2020 | Casque VR / forme IA abstraite | Moderne, matériaux PBR |

### En attendant les modèles Blender

Tant que les modèles réalistes ne sont pas prêts, utiliser des **wireframes stylisés** plutôt que des formes pleines géométriques. Un wireframe assume qu'il est un placeholder. Un cube plein prétend être un objet fini.

---

## 9. Responsive

### Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm - tablette portrait */ }
@media (min-width: 1024px) { /* md - tablette paysage / laptop */ }
@media (min-width: 1440px) { /* lg - desktop */ }
@media (min-width: 1920px) { /* xl - grand écran */ }
```

### Règles responsive

- Sur mobile : layout 1 colonne, texte à gauche (jamais centré), 3D au-dessus ou en dessous
- Les objets 3D réduisent leur taille mais restent visibles
- Les chiffres de décennie en background deviennent plus petits mais restent
- Le texte body ne dépasse JAMAIS 75 caractères par ligne (max-width: 38ch)

---

## 10. Checklist avant commit

Avant de commit une modification CSS, vérifier :

- [ ] Aucune couleur hors de la palette définie ci-dessus
- [ ] Fonts Space Grotesk et Plus Jakarta Sans utilisées (pas de font système)
- [ ] Au moins 128px d'espace entre chaque section
- [ ] Le texte body n'est PAS centré (sauf hero)
- [ ] Layout asymétrique (texte d'un côté, 3D de l'autre)
- [ ] Les animations utilisent les easing curves custom
- [ ] Max-width sur le texte (38ch ou 600px)
- [ ] Le site est lisible sur mobile (tester 375px de large)
