# ALFRED PLAY V2 — Audio

> Chargé automatiquement quand tu touches `AudioManager.js`, `audio/`, ou Howler.js.

---

## 1. Stack audio

- **Howler.js** : lecture audio cross-browser
- **AudioManager.js** : singleton qui gère le chargement, la lecture et les transitions
- **sessionStorage** : mémorise le choix audio de l'utilisateur (opt-in/opt-out)

---

## 2. Règle fondamentale : opt-in only

**L'audio ne démarre JAMAIS automatiquement.** L'utilisateur doit explicitement activer le son.

- Un bouton toggle audio visible en permanence (icône speaker)
- Le choix est persisté en `sessionStorage` pour la durée de la session
- Premier chargement = audio OFF par défaut

---

## 3. Sons par décennie

| Décennie | Son d'ambiance | Fichier | Notes |
|----------|---------------|---------|-------|
| 1960 | Bips électroniques subtils | `ambiance-1960.mp3` | Tons purs, oscillateurs simples, atmosphère labo |
| 1970 | Clavier mécanique + hum terminal | `ambiance-1970.mp3` | Touches Cherry MX, ronronnement électrique CRT |
| 1980 | Sons 8-bit Game Boy | `ambiance-1980.mp3` | Chip-tune, bleeps, start-up Game Boy |
| 1990 | Modem 56k | `ambiance-1990.mp3` | Handshake modem, sons de connexion dial-up |
| 2000 | Click-wheel iPod | `ambiance-2000.mp3` | Clics de molette, transitions douces |
| 2010 | Notification iPhone | `ambiance-2010.mp3` | Tri-tone, swoosh, sons iOS |
| 2020 | Voix IA synthétique | `ambiance-2020.mp3` | Voix synthétique, drones ambient, tons neuraux |

---

## 4. AudioManager — architecture

```
AudioManager (singleton)
├── Howler.js instances (1 par décennie, lazy-loaded)
├── Crossfade entre décennies (500ms)
├── Volume global : 0.3 max (ambiance, pas agression)
├── sessionStorage : 'alfred-audio-enabled' (true/false)
└── Méthodes :
    ├── init() — charge Howler, vérifie sessionStorage
    ├── play(decadeId) — lance l'ambiance, crossfade si changement
    ├── stop() — fade-out et arrêt
    ├── toggle() — bascule on/off, persiste le choix
    └── setVolume(v) — contrôle volume global
```

---

## 5. Transitions audio

- **Crossfade** : 500ms entre deux ambiances de décennie
- **Fade-in** au premier play : 300ms (pas de son brutal)
- **Fade-out** quand l'utilisateur désactive : 200ms
- Le son de la décennie active suit le scroll (via ScrollEngine callback)

---

## 6. Contraintes techniques

- Chaque fichier audio : **< 200KB** (loop court, 10-15 secondes)
- Format : **MP3** (compatibilité universelle) + fallback **OGG** optionnel
- Lazy-load : ne charger le fichier audio que quand la décennie est proche (1 section avant)
- Le `AudioContext` doit être créé après une interaction utilisateur (contrainte navigateur)

---

## 7. Ce qui est interdit

- ❌ Jamais d'autoplay (toujours opt-in)
- ❌ Jamais de volume > 0.3 pour l'ambiance
- ❌ Jamais de son qui démarre sans fade-in
- ❌ Jamais de coupure brutale entre deux ambiances (toujours crossfade)
- ❌ Jamais de fichier audio > 500KB
