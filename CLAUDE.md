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

## Interactions curseur (micro-interactions 3D)

Chaque scène implémente `onCursorMove(mx, my)` appelée par SceneManager à chaque frame.
Le curseur est normalisé en -1 à +1, lissé par lerp (CURSOR_LERP = 0.12) dans la boucle RAF.
Mobile : fallback `deviceorientation` (gyroscope).

### Scales actuels des objets 3D (NE PAS réduire de plus de 30% d'un coup)

| Scène | Scale | Interaction curseur |
|-------|-------|-------------------|
| 1960 Souris | 2.8 | Parallax 3D (position X/Z suit le curseur) |
| 1970 VT100 | 1.2 | Écran phosphore s'illumine + curseur clignote plus vite |
| 1980 Game Boy | 1.5 | Tilt 3D (inclinaison suit la souris) |
| 1990 Globe | 1.08 | Rotation accélère avec le mouvement curseur |
| 2000 iPod | 1.7 | Click wheel tourne vers la direction du curseur |
| 2010 iPhone | 1.2 | Écran s'allume plus fort au hover |
| 2020 Cerveau IA | 1.8 | Anneaux dévient, particules attirées, nodes pulsent |

### Leçons apprises

- Réduire les scales de 40% d'un coup rend certains objets invisibles — ajuster par paliers de 20-30% max
- Les amplitudes d'interaction doivent être exagérées (×3 du premier instinct) pour être perceptibles sur un canvas fullscreen
- Le lerp à 0.08 était trop lent, 0.12 donne un bon compromis fluidité/réactivité

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
