# ALFRED PLAY V2 — Instructions pour Claude Code

## Projet

Portfolio immersif racontant l'histoire de l'informatique (1960-2020) avec Three.js + Astro.
Repository : https://github.com/enyolanev-bit/ALFRED_PLAY_V2

## Stack technique

- **Framework** : Astro v5
- **3D** : Three.js r172 (WebGL)
- **Scroll** : Lenis + GSAP (ScrollEngine)
- **Audio** : Howler.js (AudioManager)
- **Hébergement** : À définir (Vercel ou Cloudflare)

## Architecture fichiers

```
src/
├── layouts/BaseLayout.astro     ← Canvas WebGL + layout global
├── pages/index.astro            ← Page principale
├── lib/
│   ├── config/decades.js        ← Configuration par décennie
│   ├── core/
│   │   ├── init.js              ← Orchestrateur (lazy load Three.js après CTA)
│   │   ├── SceneManager.js      ← Singleton WebGL renderer
│   │   ├── SceneLoader.js       ← GLTF + DRACO loaders
│   │   ├── ScrollEngine.js      ← Lenis + GSAP scroll
│   │   ├── AudioManager.js      ← Howler.js + sessionStorage
│   │   └── InteractionHandler.js← Drag/touch rotation
│   ├── scenes/                  ← Scene1960.js → Scene2020.js
│   └── utils/                   ← dispose.js, gpu-detect.js
└── styles/global.css            ← Styles globaux
```

## Design System (OBLIGATOIRE)

**AVANT toute modification CSS ou visuelle, LIS `docs/design-system.md`.**

Ce fichier contient :
- La palette de couleurs (3 couleurs MAX)
- Les fonts (Space Grotesk display + Plus Jakarta Sans body)
- L'échelle typographique
- Les règles d'espacement
- Les règles de layout (asymétrique, JAMAIS tout centré)
- Les animations et easing curves
- La checklist avant commit

### Règles design non-négociables

1. **MAX 3 couleurs** : fond (#0A0A0A), texte (#F5F5F7), accent (#E63946)
2. **JAMAIS de font système** : utiliser Space Grotesk et Plus Jakarta Sans
3. **JAMAIS tout centrer** : layout asymétrique texte/3D sauf le hero
4. **Espace blanc GÉNÉREUX** : min 128px entre sections
5. **Animations SUBTILES** : cubic-bezier(0.16, 1, 0.3, 1), jamais de bounce sur texte
6. **Texte max 600px de large** : max-width: 38ch pour la lisibilité

## Code conventions

- Pas de frameworks CSS (pas de Tailwind, pas de Bootstrap)
- CSS custom properties pour tout (couleurs, fonts, spacings)
- Mobile-first responsive
- Lazy loading Three.js (se charge après le CTA ou premier scroll)
- Commentaires en français dans le code

## Git workflow

- Branche `master` = production
- Feature branches nommées `feature/STORY-XXX-description`
- Messages de commit en anglais, concis

## Commandes

```bash
npm run dev      # Serveur de dev (port 4321 ou 4322)
npm run build    # Build production
npm run preview  # Preview du build
```
