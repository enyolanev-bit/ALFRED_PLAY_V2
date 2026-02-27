# BIBLE TECHNIQUES — ALFRED_PLAY V2

> Recherche GitHub 27 fév 2026 — Les 7 techniques extraites du code des meilleurs repos au monde.
> Source : adrianhajdin/gsap_macbook_landing, adrianhajdin/iphone, brunosimon/folio-2019

---

## Technique #1 — PIN + SCRUB (le secret Apple)

**Source :** adrianhajdin/gsap_macbook_landing (GitHub)

La section est épinglée à l'écran. Le scroll ne fait plus défiler — il CONTRÔLE l'animation au pixel près. C'est ce qui fait le « wow » d'Apple.com.

```js
gsap.timeline({
  scrollTrigger: {
    trigger: '#section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,    // lie le scroll à l'animation
    pin: true,   // ÉPINGLE la section
  }
})
```

**Pour ALFRED_PLAY :** Chaque décennie doit être pin+scrub. Le modèle 3D tourne, les textes apparaissent, le fond change — tout lié au scroll.

---

## Technique #2 — ROTATION 3D LIÉE AU SCROLL

**Source :** adrianhajdin/gsap_macbook_landing — Features.jsx

Le modèle 3D fait un tour complet (360°) synchronisé avec le scroll. Le contenu texte se synchronise avec la rotation.

```js
// Tour complet pendant le scroll
modelTimeline.to(groupRef.current.rotation, {
  y: Math.PI * 2,
  ease: 'power1.inOut'
})

// Texte synchronisé avec la rotation
timeline
  .call(() => setTexture('/videos/feature-1.mp4'))
  .to('.box1', { opacity: 1, y: 0, delay: 1 })
  .call(() => setTexture('/videos/feature-2.mp4'))
  .to('.box2', { opacity: 1, y: 0 })
```

**Pour ALFRED_PLAY :** Game Boy, souris Douglas, globe — tous doivent tourner avec le scroll et révéler des infos à chaque angle.

---

## Technique #3 — MASKING SVG + SCALE (transitions cinématiques)

**Source :** adrianhajdin/gsap_macbook_landing — Showcase.jsx

Une vidéo joue derrière un logo SVG. Au scroll, le logo fait un zoom (scale). Effet ultra cinématique.

```js
timeline
  .to('.mask img', { transform: 'scale(1.1)' })
  .to('.content', { opacity: 1, y: 0, ease: 'power1.in' })
```

```html
<div class="media">
  <video src="game.mp4" loop muted autoPlay playsInline />
  <div class="mask">
    <img src="mask-logo.svg" />
  </div>
</div>
```

**Pour ALFRED_PLAY :** Utiliser « ALFRED » en SVG géant comme transition entre sections, ou le logo de chaque décennie.

---

## Technique #4 — TEXTE APPLE-STYLE (opacity + y stagger)

**Source :** adrianhajdin/iphone — Hero.jsx + animations.js

Le texte n'apparaît JAMAIS d'un bloc. Chaque élément a son propre trigger scroll. Les mots clés sont en `<span>` blanc sur texte gris.

```js
// Fonction utilitaire — simple mais puissante
export const animateWithGsap = (target, animationProps, scrollProps) => {
  gsap.to(target, {
    ...animationProps,
    scrollTrigger: {
      trigger: target,
      toggleActions: 'restart reverse restart reverse',
      start: 'top 85%',
      ...scrollProps,
    }
  })
}

// Utilisation
animateWithGsap('#features_title', { y: 0, opacity: 1 })
animateWithGsap('.g_text', { y: 0, opacity: 1, ease: 'power2.inOut', duration: 1 })
```

**Pattern texte Apple :**
```html
<p class="feature-text g_text">
  iPhone 15 Pro is
  <span class="text-white">
    the first iPhone to feature an aerospace-grade titanium design
  </span>,
  using the same alloy that spacecrafts use for missions to Mars.
</p>
```

**Pour ALFRED_PLAY :** Texte gris + mots clés en blanc. Chaque paragraphe a son propre trigger scroll. Jamais de bloc de texte qui apparaît d'un coup.

---

## Technique #5 — MATCAPS AU LIEU DE LUMIÈRES (60 FPS)

**Source :** brunosimon/folio-2019 (GitHub, 4600 stars, MIT)

Bruno Simon n'utilise AUCUNE lumière Three.js classique. Zéro ombre calculée. Il utilise des **Matcaps** — des textures qui SIMULENT l'éclairage. C'est pour ça que son site tourne à 60 FPS même sur un téléphone de 2019.

> « There are no lights, nor shadows in the scene. It's just illusions. A very old but efficient technique I used is called Matcap. »
> — Bruno Simon

**Architecture Bruno Simon :**
```
src/javascript/
├── Application.js      — point d'entrée
├── Camera.js           — caméra avec contrôles
├── Resources.js        — chargement de TOUS les assets
├── Geometries/         — formes 3D optimisées
├── Materials/          — Matcaps et shaders custom
├── World/              — les objets du monde
├── Utils/              — outils divers
└── Passes/             — post-processing
```

**Pour ALFRED_PLAY :** Auditer nos scènes 3D. Si on a des DirectionalLight ou PointLight avec ombres calculées → les remplacer par des Matcaps. Gain de performance massif.

---

## Technique #6 — LAYOUTS ASYMÉTRIQUES (casser la grille)

**Source :** Analyse des 15 sites Awwwards SOTD de février 2026

Les sites primés n'ont JAMAIS le même layout deux fois de suite. Ils alternent :

1. **Hero plein écran** — vidéo ou 3D en full viewport
2. **Split 60/40** — 3D à gauche, texte à droite
3. **Texte géant centré** — une phrase énorme qui scroll-fade
4. **Grid asymétrique** — 3 colonnes inégales
5. **Modèle 3D épinglé** — le modèle reste, le texte défile autour
6. **Stats géantes** — typo massive

**Layouts proposés par décennie :**

| Décennie | Layout | Description |
|----------|--------|-------------|
| 1960 | Hero plein écran | Souris de Douglas géante, texte minimal |
| 1970 | Split screen | Terminal VT100 à gauche, texte dactylographié à droite |
| 1980 | Pin + scrub | Game Boy 3D épinglé, texte qui défile autour |
| 1990 | Full screen vidéo | Modem dial-up puis globe 3D |
| 2000 | Grille asymétrique | Style iPod/iTunes |
| 2010 | Texte géant scrollant | « Le monde dans la poche » |
| 2020 | Split screen inversé | IA animation neurale |

**Problème actuel :** Toutes nos décennies ont le même layout (titre + 3D + texte × 7). C'est ça qui fait « template IA ».

---

## Technique #7 — VIDÉO/SHADER EN HERO (plus de texte sur fond noir)

**Source :** adrianhajdin/iphone — Hero.jsx

Le premier écran est une vidéo autoplay muted, pas du texte sur fond noir. Le titre apparaît en fade après 2 secondes.

```js
// Responsive : vidéo différente mobile/desktop
const videoSrc = window.innerWidth < 760 ? smallHeroVideo : heroVideo;

// Le titre apparaît en delayed fade
gsap.to('#hero', { opacity: 1, delay: 2 })
gsap.to('#cta', { opacity: 1, y: -50, delay: 2 })
```

**Pour ALFRED_PLAY :** L'intro « 1960 → 2026 / L'histoire de l'informatique » devrait être sur une vidéo/animation de fond. Même un simple shader animé (particules, grid, glitch) serait 10x mieux que du texte sur noir.

---

## Résumé — Impact × Difficulté

| # | Technique | Impact | Difficulté |
|---|-----------|--------|-----------|
| 1 | Pin + Scrub sur chaque décennie | Le scroll CONTRÔLE l'animation | Moyen |
| 2 | Rotation 3D liée au scroll | Les objets vivent, pas posés | Facile |
| 3 | Masking SVG pour transitions | Transitions cinématiques | Moyen |
| 4 | Texte stagger + mots clés blancs | Plus de blocs de texte | Facile |
| 5 | Matcaps au lieu de lumières | 60 FPS garanti | Moyen |
| 6 | Layouts asymétriques par décennie | Casse le pattern « template » | Gros |
| 7 | Vidéo/shader en hero | Plus de texte sur fond noir | Moyen |

---

## Repos GitHub étudiés

- **adrianhajdin/iphone** — Clone Apple iPhone 15, Three.js + GSAP (2800+ stars)
- **adrianhajdin/gsap_macbook_landing** — Clone Apple MacBook M4, Three.js + GSAP + scrub (2025)
- **brunosimon/folio-2019** — Portfolio voiture 3D, SOTM Awwwards (4600 stars, MIT license)
- **sanidhyy/apple-clone** — Clone Apple modernisé (2026)
- **adrianhajdin/3d-portfolio** — Portfolio 3D React + Three.js (2025)
