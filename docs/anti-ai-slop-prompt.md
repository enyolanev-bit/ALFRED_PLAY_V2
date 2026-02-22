# Prompt Anti-AI-Slop — À coller dans Claude Code

## Comment utiliser ce fichier

1. Ouvre PowerShell dans le dossier ALFRED_PLAY_V2
2. Lance `claude` (Claude Code)
3. Copie-colle le prompt ci-dessous pour démarrer la session de refonte design

---

## Prompt de démarrage

```
Lis d'abord @docs/design-system.md et @CLAUDE.md en entier.

Tu es un Design Engineer senior spécialisé en sites immersifs Three.js.
Tu as gagné 3 Awwwards SOTD. Ton style : éditorial, cinématique, muséal.
Référence : voku.studio (SOTD 21 février 2026 — 2 couleurs, espace blanc, assets réalistes).

CONTEXTE : ALFRED PLAY V2 est un portfolio qui raconte l'histoire de l'informatique de 1960 à 2020.
Le site fonctionne techniquement (Three.js, ScrollEngine, AudioManager, 7 scènes 3D) mais
il ressemble à du "AI slop" — trop de couleurs, font générique, tout centré, pas d'espace blanc.

TA MISSION : Refondre le CSS du site pour lui donner une âme, en suivant docs/design-system.md.

ÉTAPE 1 — Commencer par :
- Ajouter les Google Fonts (Space Grotesk + Plus Jakarta Sans) dans BaseLayout.astro
- Remplacer TOUTES les couleurs dans global.css par les CSS custom properties du design system
- Appliquer la typographie (font-family, tailles, line-heights)

Montre-moi les changements étape par étape. Je validerai avant que tu passes à la suite.
```

---

## Prompts de suivi (après l'étape 1)

### Étape 2 — Layout asymétrique
```
Maintenant, refais le layout des sections de décennie.
Consulte docs/design-system.md section 5 (Layout).
Objectif : grille 2 colonnes, texte à gauche / 3D à droite, qui alterne.
Les gros chiffres de décennie (1960, 1970...) doivent être en arrière-plan, très transparents.
Le hero (intro) reste la seule section centrée.
```

### Étape 3 — Espacement
```
Ajoute de l'espace blanc entre toutes les sections.
Consulte docs/design-system.md section 4 (Espacements).
Minimum 128px (--space-section) entre chaque décennie.
Le texte body ne doit pas dépasser 600px de large.
Les cartes de décennie doivent avoir du padding généreux.
```

### Étape 4 — Animations d'entrée
```
Ajoute des animations scroll-triggered sur les éléments de chaque section.
Consulte docs/design-system.md section 7 (Animations).
Utilise IntersectionObserver pour ajouter .is-visible quand une section entre dans le viewport.
Effet : fade-up staggeré avec les easing curves custom.
Pas de librairie externe — CSS transitions + JS IntersectionObserver suffisent.
```

### Étape 5 — Polish
```
Fais un audit visuel complet du site en lançant npm run dev.
Compare avec les règles de docs/design-system.md section 10 (Checklist).
Corrige tout ce qui ne respecte pas le design system.
Ajoute des hover states sur les éléments interactifs.
Vérifie le responsive sur 375px de large.
```

---

## Prompt bonus — Refonte d'une section spécifique

```
Refais la section [1980 / Le Game Boy] en suivant docs/design-system.md.
Inspiration : layout éditorial, texte à gauche, objet 3D à droite.
Le chiffre "1980" en background très transparent.
Titre "La révolution personnelle" en --color-accent avec --font-display.
Sous-titre "Le Game Boy" en --color-text-secondary.
Texte body en --font-body, max-width 38ch, line-height 1.7.
Bloc "MON HISTOIRE" avec border-left accent.
Animation fade-up staggerée au scroll.
```

---

## Rappel important

Claude Code va essayer de revenir à ses habitudes "AI slop" (centrer, mettre des couleurs partout,
utiliser des fonts génériques). C'est NORMAL — c'est la "convergence distributionnelle".

À chaque fois qu'il dévie, rappelle-lui :
```
Stop. Relis docs/design-system.md. Tu es en train de faire du AI slop.
[Précise le problème : "le texte est centré" / "tu as utilisé une couleur hors palette" / etc.]
```

Ça le remet immédiatement sur les rails.
