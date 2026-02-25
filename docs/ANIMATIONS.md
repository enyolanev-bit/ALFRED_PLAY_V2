# ALFRED PLAY V2 — Animations & Scroll

> Chargé automatiquement quand tu touches `init.js`, `ScrollEngine.js`, `ProgressTimeline`, ou tout fichier GSAP.

---

## 1. Stack animation

- **GSAP** : animations scroll-triggered via ScrollTrigger
- **Lenis** : smooth scroll natif
- **ScrollEngine.js** : orchestrateur Lenis + GSAP

---

## 2. Progressive disclosure (ordre d'apparition)

Chaque section de décennie révèle ses éléments dans cet ordre strict :

1. **number** — le gros chiffre de décennie (ex: "1960"), fade-in subtil
2. **title** — titre principal (ex: "L'aube de l'interaction")
3. **subtitle** — sous-titre (ex: "La souris d'Engelbart")
4. **personalStory** — bloc "MON HISTOIRE" avec bordure accent
5. **historicalText** — texte historique principal
6. **transitionTeaser** — phrase cliffhanger vers la décennie suivante

Chaque élément a un **stagger de 100-150ms** par rapport au précédent.

---

## 3. Couleurs bgColor par décennie

Les backgrounds changent progressivement au scroll. Valeurs rgba définies dans `decades.js` :

| Décennie | bgColor | Ambiance |
|----------|---------|----------|
| 1960 | `rgba(0, 30, 10, 0.4)` | Vert sombre — labos, nature |
| 1970 | `rgba(30, 20, 0, 0.4)` | Ambre — phosphore terminal |
| 1980 | `rgba(20, 20, 30, 0.4)` | Bleu-gris — plastique Game Boy |
| 1990 | `rgba(0, 15, 40, 0.4)` | Bleu profond — océan web |
| 2000 | `rgba(30, 30, 30, 0.4)` | Gris neutre — minimalisme Apple |
| 2010 | `rgba(10, 10, 15, 0.4)` | Noir presque pur — écran OLED |
| 2020 | `rgba(20, 5, 30, 0.4)` | Violet sombre — IA, neural |

**Important** : ces couleurs s'appliquent en overlay sur le fond #0A0A0A. L'alpha à 0.4 garde la cohérence avec le design system.

---

## 4. Règles GSAP

### Timeline > animations individuelles

```js
// ✅ BON — une timeline coordonnée
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 0.8,
  }
});
tl.from(number, { opacity: 0, y: 50 })
  .from(title, { opacity: 0, y: 30 }, '-=0.3')
  .from(subtitle, { opacity: 0, y: 20 }, '-=0.2');

// ❌ MAUVAIS — animations individuelles non coordonnées
gsap.from(number, { scrollTrigger: {...}, opacity: 0 });
gsap.from(title, { scrollTrigger: {...}, opacity: 0 });
```

### Scrub 0.8

Toujours `scrub: 0.8` pour un suivi fluide du scroll. Pas `scrub: true` (trop rigide), pas `scrub: 2` (trop mou).

### Easing

- Entrées : `power3.out` ou `expo.out`
- Sorties : `power2.in`
- Jamais de `bounce` ou `elastic` sur du texte (réservé aux objets 3D)

---

## 5. Barre de progression — ProgressTimeline

La barre de progression indique la position dans la timeline globale :

- Position : fixe en bas ou sur le côté
- Met à jour via ScrollTrigger progress callback
- Affiche optionnellement la décennie active
- Style : fine, accent color, discrète

---

## 6. ScrollEngine.js — architecture

```
ScrollEngine
├── Lenis (smooth scroll)
├── GSAP ScrollTrigger (animations)
├── ProgressTimeline (barre progression)
└── Section triggers (bgColor transitions)
```

- Le ScrollEngine initialise Lenis puis branche GSAP ScrollTrigger dessus
- Chaque section de décennie a son propre ScrollTrigger
- Les transitions de bgColor se font via GSAP avec scrub

---

## 7. Ce qui est interdit

- ❌ Jamais d'animation sans ScrollTrigger (sauf rotation 3D idle)
- ❌ Jamais de `scrub: true` brut — toujours `scrub: 0.8`
- ❌ Jamais de stagger > 200ms entre éléments (l'attente devient gênante)
- ❌ Jamais de duration > 1.5s pour une animation scroll-triggered
- ❌ Jamais de bounce/elastic sur du texte
