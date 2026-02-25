# ALFRED PLAY V2 — Pipeline 3D

> Chargé automatiquement quand tu touches `SceneManager.js`, `SceneLoader.js`, `scenes/Scene*.js`, ou fichiers `.glb`.

---

## 1. Architecture 3D

```
SceneManager.js   ← Singleton : renderer WebGL, camera, boucle RAF, dispatch curseur
SceneLoader.js    ← GLTFLoader + DRACOLoader, cache de modèles
scenes/Scene*.js  ← Une classe par décennie (Scene1960 → Scene2020)
InteractionHandler.js ← Drag/touch rotation
```

### SceneManager (singleton)

- Crée le `WebGLRenderer` avec `alpha: true` (fond transparent)
- Gère la boucle `requestAnimationFrame`
- Dispatche `onCursorMove(mx, my)` à chaque frame vers la scène active
- Lisse le curseur avec `lerp` (CURSOR_LERP = 0.12)

### SceneLoader

- Utilise `GLTFLoader` + `DRACOLoader` pour charger les `.glb`
- DRACO décompression via CDN ou fichiers locaux
- Cache les modèles chargés pour éviter les re-téléchargements

---

## 2. Scales des objets 3D

**RÈGLE : NE PAS réduire de plus de 30% d'un coup**

| Scène | Scale | Interaction curseur |
|-------|-------|-------------------|
| 1960 Souris | 2.8 | Parallax 3D (position X/Z suit le curseur) |
| 1970 VT100 | 1.2 | Écran phosphore s'illumine + curseur clignote plus vite |
| 1980 Game Boy | 1.5 | Tilt 3D (inclinaison suit la souris) |
| 1990 Globe | 1.08 | Rotation accélère avec le mouvement curseur |
| 2000 iPod | 1.7 | Click wheel tourne vers la direction du curseur |
| 2010 iPhone | 1.2 | Écran s'allume plus fort au hover |
| 2020 Cerveau IA | 1.8 | Anneaux dévient, particules attirées, nodes pulsent |

---

## 3. Interactions curseur — onCursorMove(mx, my)

Chaque scène implémente `onCursorMove(mx, my)` appelée par SceneManager à chaque frame.

- **Curseur normalisé** : -1 à +1 (X et Y)
- **Lissage** : lerp avec CURSOR_LERP = 0.12 dans la boucle RAF
- **Mobile** : fallback `deviceorientation` (gyroscope)

### Amplitudes d'interaction

Les amplitudes doivent être **exagérées (×3 du premier instinct)** pour être perceptibles sur un canvas fullscreen. Exemple :
- Premier instinct : rotation ±5° → réalité : ±15°
- Premier instinct : déplacement ±0.2 → réalité : ±0.6

---

## 4. Contraintes de performance

- **< 5000 triangles par scène** (idéal : 2000-3000)
- **< 500KB par modèle .glb** (compressé DRACO)
- **Textures** : max 1024×1024, format compressé (KTX2 si possible)
- **1 directional light** (blanc chaud) + **1 ambient light** (faible) + **1 rim light** optionnel
- Le renderer utilise `alpha: true` (fond transparent, le CSS gère le background)

---

## 5. Leçons apprises

- **Paliers de scale** : réduire de 40% d'un coup rend certains objets invisibles. Ajuster par paliers de 20-30% max.
- **Amplitudes ×3** : les amplitudes d'interaction doivent être exagérées (×3 du premier instinct) pour être perceptibles sur un canvas fullscreen.
- **Lerp 0.12** : le lerp à 0.08 était trop lent, 0.12 donne un bon compromis fluidité/réactivité.
- **Rotation idle** : toujours 0.002 rad/frame pour la rotation automatique, jamais plus (sinon ça donne la nausée).

---

## 6. Assets par décennie

| Décennie | Objet | Fichier | Style |
|----------|-------|---------|-------|
| 1960 | Souris Engelbart | `souris-1960.glb` | Bois, réaliste |
| 1970 | Terminal VT100 | `terminal-1970.glb` | Écran phosphore vert, boîtier beige |
| 1980 | Game Boy DMG-01 | `gameboy-1980.glb` | Plastique gris, écran vert-jaune |
| 1990 | Globe web | `globe-1990.glb` | Connexions réseau |
| 2000 | iPod Classic 1G | `ipod-2000.glb` | Blanc, molette circulaire |
| 2010 | iPhone original | `iphone-2010.glb` | Noir, écran tactile |
| 2020 | Cerveau IA | `cerveau-2020.glb` | Abstrait, PBR, particules |

Tant que les modèles réalistes ne sont pas prêts, utiliser des **wireframes stylisés** plutôt que des formes pleines géométriques.

---

## 7. Ce qui est interdit

- ❌ Jamais de forme géométrique primitive comme objet final (cube, sphère)
- ❌ Jamais de modèle > 500KB non compressé
- ❌ Jamais de texture > 1024×1024 sans bonne raison
- ❌ Jamais de réduction de scale > 30% d'un coup
- ❌ Jamais de lerp < 0.1 (trop lent) ou > 0.2 (trop saccadé)
