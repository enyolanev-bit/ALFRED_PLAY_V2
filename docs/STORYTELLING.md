# ALFRED PLAY V2 — Storytelling

> Chargé automatiquement quand tu touches `decades.js`, `DecadeSection.astro`, ou le contenu textuel.

---

## 1. Structure decades.js

Chaque décennie dans `DECADES[]` contient :

```js
{
  id: '1960',              // Identifiant unique
  label: '1960',           // Affiché dans la nav/timeline
  title: "L'aube...",      // Titre principal de la section
  subtitle: 'La souris...', // Sous-titre descriptif
  model: '/models/...',    // Chemin vers le modèle 3D
  fallbackImage: '/images/fallback/...', // Image si WebGL indisponible
  audio: '/audio/...',     // Son d'ambiance
  bgColor: 'rgba(...)',    // Couleur de fond en overlay
  personalStory: '...',    // OBLIGATOIRE — histoire personnelle de Nevil
  historicalText: '...',   // Contexte historique de la décennie
  transitionTeaser: '...', // Cliffhanger vers la section suivante (null pour 2020)
  sceneModule: () => import('...'), // Import dynamique de la scène 3D
}
```

---

## 2. Règle absolue : personalStory TOUJOURS remplie

La `personalStory` ne doit **JAMAIS** être vide, null, ou un placeholder.

Chaque décennie raconte comment Nevil a vécu cette époque, même indirectement :
- 1960 : l'héritage d'Engelbart qui l'inspire encore
- 1970 : la beauté de la simplicité terminal
- 1980 : le Game Boy comme premier objet tech
- 1990 : né en 1999, la découverte tardive du numérique
- 2000 : arrivée en France à 7 ans, découverte d'Internet
- 2010 : début de la compréhension des systèmes
- 2020 : l'IA générative comme amplificateur de création

---

## 3. Effet Zeigarnik — teasers cliffhanger

Le **transitionTeaser** entre chaque section crée une tension narrative (effet Zeigarnik : le cerveau retient mieux les histoires inachevées).

Exemples actuels :
- 1960 → 1970 : *"Mais pointer ne suffisait plus. Il fallait parler à la machine..."*
- 1970 → 1980 : *"Le texte brut allait bientôt céder sa place à quelque chose de plus... personnel."*
- 1980 → 1990 : *"Les chambres étaient conquises. Restait le monde entier à connecter."*
- 1990 → 2000 : *"Le monde était connecté. Mais quelqu'un allait le mettre dans notre poche."*
- 2000 → 2010 : *"La musique était libre. Bientôt, tout le reste suivrait."*
- 2010 → 2020 : *"On avait tout dans la poche. Mais la vraie révolution n'avait pas encore commencé."*
- 2020 : `null` (fin de l'histoire)

### Règles pour les teasers

- Toujours en **italique** visuellement
- Phrase **courte** (1-2 lignes max)
- Structure : [ce qui vient d'être accompli] + [ce qui manque encore]
- Le dernier mot ou la dernière phrase doit **créer la curiosité** pour la suite

---

## 4. Progressive disclosure — neuroscience

Le cerveau retient mieux l'information révélée progressivement. L'ordre d'apparition dans chaque section :

1. **Chiffre décennie** (ancrage temporel — "où suis-je ?")
2. **Titre** (thème — "de quoi ça parle ?")
3. **Sous-titre** (objet — "quel objet emblématique ?")
4. **Personal story** (émotion — "pourquoi ça me touche ?")
5. **Historical text** (contexte — "que s'est-il passé ?")
6. **Teaser** (cliffhanger — "et ensuite ?")

Cet ordre suit le principe **émotion → raison → curiosité**.

---

## 5. Couleurs émotionnelles par décennie

Chaque bgColor est choisie pour évoquer une ambiance :

| Décennie | bgColor | Émotion |
|----------|---------|---------|
| 1960 | `rgba(0, 30, 10, 0.4)` | Vert = nature, labos, début |
| 1970 | `rgba(30, 20, 0, 0.4)` | Ambre = phosphore, chaleur CRT |
| 1980 | `rgba(20, 20, 30, 0.4)` | Bleu-gris = plastique, nostalgie |
| 1990 | `rgba(0, 15, 40, 0.4)` | Bleu profond = océan, immensité web |
| 2000 | `rgba(30, 30, 30, 0.4)` | Gris neutre = minimalisme Apple |
| 2010 | `rgba(10, 10, 15, 0.4)` | Noir = OLED, sophistication |
| 2020 | `rgba(20, 5, 30, 0.4)` | Violet = neural, futuriste |

---

## 6. Ce qui est interdit

- ❌ Jamais de personalStory vide ou placeholder
- ❌ Jamais de teaser qui révèle trop (doit laisser le suspense)
- ❌ Jamais de texte historique sans lien émotionnel (pas de Wikipedia)
- ❌ Jamais de changement d'ordre dans le progressive disclosure
- ❌ Jamais de transitionTeaser pour la dernière décennie (2020 = fin)
