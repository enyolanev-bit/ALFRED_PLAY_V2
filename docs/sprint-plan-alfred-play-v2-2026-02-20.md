# Sprint Plan: ALFRED_PLAY V2

**Date :** 2026-02-20
**Scrum Master :** Nevil (citry) — assisté par Claude
**Projet Level :** 2 (Medium)
**Total Stories :** 14
**Total Points :** 61
**Planned Sprints :** 6
**Sprint Length :** 2 semaines

---

## Executive Summary

Ce sprint plan décompose les 5 epics du PRD en 14 user stories estimées, réparties sur 6 sprints de 2 semaines (12 semaines au total, aligné avec la timeline du product brief). Le plan suit une progression logique : fondations d'abord, puis pipeline 3D, audio, contenu, et polish final avant lancement.

**Key Metrics:**
- Total Stories: 14
- Total Points: 61
- Sprints: 6 (12 semaines)
- Capacité équipe: 12 points/sprint
- Lancement cible: Mai 2026

---

## Team Capacity

| Paramètre | Valeur |
|-----------|--------|
| Équipe | 1 dev (Claude) + Nevil (validation/direction/test) |
| Sprint length | 2 semaines = 10 jours ouvrés |
| Disponibilité Nevil | 15-20h/semaine → ~35h/sprint |
| Niveau expérience | Intermédiaire (1 point ≈ 3h) |
| Capacité brute | 35h ÷ 3h/pt = ~12 points/sprint |
| Buffer (10-20%) | ~10-11 points confortables |

**Note :** Claude (IA) code significativement plus vite qu'un développeur humain. Le goulot d'étranglement est la validation, les tests mobile, la direction créative et les assets Blender — tous portés par Nevil.

---

## Story Inventory

### STORY-001: Initialiser le projet Astro et créer la structure du site

**Epic:** EPIC-001 — Fondation & Infrastructure
**Priorité:** Must Have
**Points:** 5

**User Story:**
En tant que développeur,
je veux avoir un projet Astro fonctionnel avec la structure des sections et le scroll vertical,
afin d'avoir le squelette sur lequel tout le site repose.

**Acceptance Criteria:**
- [ ] Projet Astro 5.x initialisé avec Three.js, GSAP, ScrollTrigger, Lenis installés
- [ ] BaseLayout créé avec le canvas WebGL global (position: fixed, z-index: 0)
- [ ] 7 sections décennies + intro + contact créées en HTML (structure vide)
- [ ] Lenis smooth scroll connecté au ticker GSAP (pattern officiel sans autoRaf)
- [ ] ScrollTrigger crée un trigger par section décennie
- [ ] Le scroll fonctionne au touch sur mobile et à la molette sur desktop
- [ ] Structure responsive mobile-first (320px+)
- [ ] Déploiement Vercel configuré (auto-deploy sur push)

**Technical Notes:**
- Suivre l'architecture : Lenis sans autoRaf, piloté par GSAP ticker
- `gsap.ticker.lagSmoothing(0)` pour synchronisation parfaite
- Chaque section = composant Astro dans `src/components/sections/`
- Canvas global dans `src/layouts/BaseLayout.astro`

**Dependencies:** Aucune (première story)

---

### STORY-002: Écran d'intro et section contact

**Epic:** EPIC-001 — Fondation & Infrastructure + EPIC-004 — Contenu & Storytelling
**Priorité:** Must Have
**Points:** 3

**User Story:**
En tant que visiteur,
je veux voir un écran d'accueil impactant avec un bouton "Commencer le voyage" et une section contact en fin de parcours,
afin de savoir que le site est interactif et de pouvoir contacter Nevil après le voyage.

**Acceptance Criteria:**
- [ ] Écran d'accueil visuellement impactant (premier contact = "wow")
- [ ] Bouton/CTA "Commencer le voyage" clairement visible
- [ ] L'interaction sur le CTA débloque l'AudioContext (gestion autoplay)
- [ ] Le visiteur comprend immédiatement qu'il faut scroller
- [ ] Section contact visible après la dernière décennie
- [ ] Au moins 2 moyens de contact (LinkedIn + email)
- [ ] CTA contact clair et engageant
- [ ] Conclusion naturelle au voyage

**Technical Notes:**
- Le CTA intro appelle `AudioManager.unlock()` au clic
- La section contact est un composant Astro `ContactSection.astro`
- Liens : `mailto:` + URL LinkedIn (pas de formulaire backend)

**Dependencies:** STORY-001

---

### STORY-003: SceneManager et SceneLoader Three.js

**Epic:** EPIC-002 — Expérience 3D & Visuelle
**Priorité:** Must Have
**Points:** 5

**User Story:**
En tant que développeur,
je veux un pipeline de rendu Three.js avec chargement dynamique et gestion mémoire,
afin de rendre les scènes 3D de chaque décennie de façon performante.

**Acceptance Criteria:**
- [ ] WebGLRenderer unique initialisé sur le canvas global
- [ ] Caméra perspective partagée
- [ ] Boucle RAF unique (pas de boucles multiples)
- [ ] detect-gpu classifie le GPU en tier (0-3) avec config qualité adaptative
- [ ] GLTFLoader + DRACOLoader instanciés en singleton
- [ ] Import dynamique des modules scène (`Scene1960.js`, etc.)
- [ ] IntersectionObserver précharge les scènes (rootMargin 200px)
- [ ] Dispose complet (geometry, material, textures) quand hors viewport
- [ ] Max 2-3 scènes en mémoire simultanément
- [ ] Gère le redimensionnement (resize)

**Technical Notes:**
- `src/lib/core/SceneManager.js` et `src/lib/core/SceneLoader.js`
- `src/lib/utils/gpu-detect.js` et `src/lib/utils/dispose.js`
- Config qualité : tier 0 = fallback 2D, tier 1 = 3D low, tier 2 = 3D medium, tier 3 = 3D high
- DPR max 1.5 sur mobile, max 2 sur desktop
- Workers Draco dans `public/draco/`

**Dependencies:** STORY-001

---

### STORY-004: Scène 3D 1960 — Souris d'Engelbart

**Epic:** EPIC-002 — Expérience 3D & Visuelle
**Priorité:** Must Have
**Points:** 5

**User Story:**
En tant que visiteur,
je veux voir une souris d'Engelbart en 3D dans la section 1960,
afin de vivre le tout premier périphérique d'interaction homme-machine.

**Acceptance Criteria:**
- [ ] Modèle 3D créé dans Blender (< 5000 triangles, low-poly stylisé)
- [ ] Exporté en .glb, optimisé avec gltf-transform + Draco (< 500KB)
- [ ] `Scene1960.js` créé avec lighting et palette couleurs d'époque
- [ ] Animation d'entrée au scroll (apparition progressive)
- [ ] Rotation douce selon la progression du scroll
- [ ] Image fallback .webp pour GPU tier 0
- [ ] L'objet s'affiche correctement sur mobile et desktop
- [ ] Config décennie ajoutée dans `decades.js`

**Technical Notes:**
- C'est la story GO/NO-GO : valide le pipeline complet sur mobile
- Tester sur vrai appareil mobile si possible
- Style low-poly : matériaux PBR simples (baseColor + metallic/roughness)
- Palette 1960 : tons sombres, accent chaleureux

**Dependencies:** STORY-003

---

### STORY-005: AudioManager et sons par décennie

**Epic:** EPIC-003 — Audio Immersif
**Priorité:** Must Have
**Points:** 5

**User Story:**
En tant que visiteur,
je veux entendre une ambiance sonore unique pour chaque décennie avec un contrôle mute/unmute,
afin de vivre une expérience multisensorielle immersive.

**Acceptance Criteria:**
- [ ] AudioManager singleton créé avec Howler.js
- [ ] 7 ambiances sonores distinctes chargées en lazy (MP3 128kbps, ~200KB chacune)
- [ ] Crossfade fluide (500ms) entre décennies au scroll
- [ ] `unlock()` résume l'AudioContext après le clic "Commencer" (gestion autoplay)
- [ ] Bouton mute/unmute toujours visible dans l'overlay UI
- [ ] Icône speaker on/off clairement indiquée
- [ ] État audio mémorisé en sessionStorage
- [ ] Bouton accessible sur mobile et desktop
- [ ] L'expérience reste compréhensible SANS le son

**Technical Notes:**
- `src/lib/core/AudioManager.js`
- `src/components/ui/AudioToggle.astro`
- Fichiers audio dans `public/audio/`
- Sources audio : freesound.org (libres de droits)
- Howler.js gère automatiquement le fallback HTML5 Audio

**Dependencies:** STORY-002 (intro CTA débloque l'audio)

---

### STORY-006: Scènes 3D 1970-1980-1990

**Epic:** EPIC-002 — Expérience 3D & Visuelle
**Priorité:** Must Have
**Points:** 8

**User Story:**
En tant que visiteur,
je veux voir un terminal VT100 (1970), un Game Boy (1980) et un globe web/modem (1990) en 3D,
afin de vivre l'évolution technologique des trois premières décennies après 1960.

**Acceptance Criteria:**
- [ ] 3 modèles 3D créés dans Blender (< 5000 tri chacun)
- [ ] Exportés en .glb optimisés Draco (< 500KB chacun)
- [ ] Scene1970.js — palette tons verts terminal, ambiance Unix
- [ ] Scene1980.js — palette colorée rétro gaming, ambiance arcade
- [ ] Scene1990.js — palette bleutée internet, ambiance modem
- [ ] Animations d'entrée au scroll pour chaque scène
- [ ] Rotation douce au scroll
- [ ] Fallback images 2D
- [ ] Config ajoutée dans `decades.js` pour chaque décennie

**Technical Notes:**
- Suit le pattern établi par STORY-004 (Scene1960)
- 1 jour par scène : modélisation + optimisation + intégration
- Palettes dans `decades.js` : couleurs, lighting, ambiance

**Dependencies:** STORY-003, STORY-004 (pattern établi)

---

### STORY-007: Scènes 3D 2000-2010-2020

**Epic:** EPIC-002 — Expérience 3D & Visuelle
**Priorité:** Must Have
**Points:** 8

**User Story:**
En tant que visiteur,
je veux voir un iPod (2000), un iPhone (2010) et un cerveau IA/robot (2020) en 3D,
afin de vivre l'évolution technologique jusqu'à aujourd'hui.

**Acceptance Criteria:**
- [ ] 3 modèles 3D créés dans Blender (< 5000 tri chacun)
- [ ] Exportés en .glb optimisés Draco (< 500KB chacun)
- [ ] Scene2000.js — palette iPod blanc/chrome, ambiance musique numérique
- [ ] Scene2010.js — palette smartphone élégante, ambiance apps/notifications
- [ ] Scene2020.js — palette futuriste IA, ambiance technologique avancée
- [ ] Animations d'entrée au scroll pour chaque scène
- [ ] Rotation douce au scroll
- [ ] Fallback images 2D
- [ ] Config ajoutée dans `decades.js`

**Technical Notes:**
- Même pattern que STORY-006
- La scène 2020 est la conclusion visuelle du voyage — elle doit marquer

**Dependencies:** STORY-003, STORY-004 (pattern établi)

---

### STORY-008: Interaction 3D utilisateur

**Epic:** EPIC-002 — Expérience 3D & Visuelle
**Priorité:** Should Have
**Points:** 3

**User Story:**
En tant que visiteur,
je veux pouvoir faire pivoter et explorer les objets 3D avec le touch ou la souris,
afin d'interagir activement avec les artefacts historiques.

**Acceptance Criteria:**
- [ ] Rotation au drag (souris) et au touch (mobile) fonctionne
- [ ] L'interaction ne bloque pas le scroll principal
- [ ] Animation de retour à la position par défaut après inactivité
- [ ] Fonctionne sur les 7 scènes existantes

**Technical Notes:**
- Zone d'interaction définie pour ne pas confliter avec le scroll Lenis
- Seuil de détection : horizontal = rotation objet, vertical = scroll
- Amortissement (damping) pour un feel naturel

**Dependencies:** STORY-004 (au moins une scène existante)

---

### STORY-009: Textes historiques par décennie

**Epic:** EPIC-004 — Contenu & Storytelling
**Priorité:** Must Have
**Points:** 5

**User Story:**
En tant que visiteur,
je veux lire des textes courts et engageants sur chaque décennie de l'informatique,
afin d'apprendre l'histoire sans effort tout en scrollant.

**Acceptance Criteria:**
- [ ] 7 textes descriptifs rédigés (concis, engageants, pas Wikipedia)
- [ ] Textes révélés progressivement au scroll (progressive disclosure)
- [ ] Animations GSAP sur le texte (fade in, slide, etc.)
- [ ] Typographie lisible sur tous les appareils (mobile-first)
- [ ] Le contraste texte/fond est suffisant (WCAG AA)

**Technical Notes:**
- Contenu dans les composants Astro de chaque section
- Les textes sont dans le HTML (pas dans le canvas) pour le SEO
- Animation GSAP : `gsap.from(element, { opacity: 0, y: 50 })` lié au ScrollTrigger

**Dependencies:** STORY-001 (sections HTML)

---

### STORY-010: Histoire personnelle de Nevil intégrée

**Epic:** EPIC-004 — Contenu & Storytelling
**Priorité:** Must Have
**Points:** 3

**User Story:**
En tant que visiteur,
je veux découvrir qui est Nevil au fil du voyage dans les décennies,
afin de comprendre son parcours sans lire une page "À propos" séparée.

**Acceptance Criteria:**
- [ ] Les moments clés de la vie de Nevil apparaissent dans les décennies correspondantes
- [ ] L'histoire personnelle est intégrée visuellement (pas plaquée)
- [ ] À la fin du voyage, le visiteur comprend qui est Nevil et ce qu'il fait
- [ ] Le ton est personnel et authentique

**Technical Notes:**
- Champ `personalStory` dans `decades.js` pour chaque décennie
- Visuellement distinct du texte historique (style, couleur, typo)
- Nevil fournit les moments clés — Claude les intègre dans le design

**Dependencies:** STORY-009 (textes historiques en place)

---

### STORY-011: Indicateur de progression

**Epic:** EPIC-005 — Polish, SEO & Analytics
**Priorité:** Should Have
**Points:** 3

**User Story:**
En tant que visiteur,
je veux voir un indicateur de la décennie courante et de ma progression dans le voyage,
afin de savoir où j'en suis dans la timeline.

**Acceptance Criteria:**
- [ ] Indicateur visible sans gêner l'expérience (overlay UI)
- [ ] Affiche la décennie courante (ex: "1980")
- [ ] Montre la progression globale dans la timeline
- [ ] Responsive (mobile et desktop)
- [ ] Se met à jour fluidement au scroll

**Technical Notes:**
- `src/components/ui/ProgressBar.astro`
- Mis à jour via events ScrollEngine
- Design minimal : ne doit pas distraire de l'expérience 3D

**Dependencies:** STORY-001 (ScrollEngine)

---

### STORY-012: Enrichissements desktop

**Epic:** EPIC-002 — Expérience 3D & Visuelle
**Priorité:** Should Have
**Points:** 3

**User Story:**
En tant que visiteur desktop avec un GPU puissant,
je veux voir des effets visuels enrichis (antialias, shadows, particles),
afin de profiter d'une expérience visuelle premium.

**Acceptance Criteria:**
- [ ] Effets supplémentaires activés pour GPU tier 3 uniquement
- [ ] Antialias activé
- [ ] Shadows si pertinentes
- [ ] Post-processing léger ou particles
- [ ] Aucun effet enrichi ne casse l'expérience mobile
- [ ] Détection automatique via detect-gpu

**Technical Notes:**
- Modifier la config qualité dans `gpu-detect.js`
- Ajouter les effets dans les DecadeScene existantes
- Tester que la version mobile n'est pas affectée

**Dependencies:** STORY-003 (SceneManager avec detect-gpu)

---

### STORY-013: SEO, Open Graph & Analytics

**Epic:** EPIC-005 — Polish, SEO & Analytics
**Priorité:** Should Have
**Points:** 3

**User Story:**
En tant que créateur du site,
je veux que le site soit bien référencé et que les partages sociaux aient un aperçu riche,
afin de maximiser la visibilité et mesurer le succès.

**Acceptance Criteria:**
- [ ] Meta tags présents (title, description, keywords)
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Card tags
- [ ] Sitemap.xml généré automatiquement (@astrojs/sitemap)
- [ ] robots.txt correct dans `public/`
- [ ] Vercel Analytics installé (< 1KB script)
- [ ] Événements scroll par décennie trackés
- [ ] Clics contact trackés
- [ ] Respect RGPD (pas de cookies intrusifs)

**Technical Notes:**
- Meta tags dans `BaseLayout.astro` `<head>`
- Image OG : capture d'écran du site (1200×630px) dans `public/images/og-image.webp`
- `@vercel/analytics` package pour le tracking

**Dependencies:** STORY-001 (layout existant)

---

### STORY-014: Easter eggs

**Epic:** EPIC-005 — Polish, SEO & Analytics
**Priorité:** Could Have
**Points:** 2

**User Story:**
En tant que visiteur curieux,
je veux découvrir des clins d'œil cachés dans le site,
afin d'être récompensé pour mon exploration.

**Acceptance Criteria:**
- [ ] 2-3 easter eggs discrets intégrés
- [ ] Ils ne perturbent pas l'expérience principale
- [ ] Ils récompensent la curiosité (clics inattendus, exploration)
- [ ] Au moins 1 easter egg lié à l'histoire de l'informatique

**Technical Notes:**
- Exemples possibles : Konami Code → effet rétro, clic spécial sur un objet 3D → animation bonus, console.log secret
- Simples à implémenter, pas de mini-jeux complexes

**Dependencies:** STORY-006 ou STORY-007 (scènes 3D existantes)

---

## Sprint Allocation

### Sprint 1 (Semaines 1-2) — 8/12 points

**Goal:** Squelette HTML complet du site avec scroll vertical fonctionnel, intro et contact

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-001 | Init Astro + sections + scroll | 5 | Must Have |
| STORY-002 | Écran d'intro + section contact | 3 | Must Have |

**Total:** 8 points / 12 capacité (67% — marge volontaire pour le setup initial)

**Livrables Sprint 1:**
- Projet Astro déployé sur Vercel
- 7 sections vides + intro + contact scrollables
- Lenis + GSAP ScrollTrigger synchronisés
- CTA "Commencer le voyage" fonctionnel
- Section contact avec LinkedIn + email
- Mobile-first responsive validé

**Risques:**
- Setup initial Three.js/GSAP/Lenis peut nécessiter du debugging
- Synchronisation Lenis/GSAP : suivre le pattern officiel exactement

---

### Sprint 2 (Semaines 3-4) — 10/12 points

**Goal:** Pipeline 3D complet + première décennie avec objet 3D — MILESTONE GO/NO-GO mobile

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-003 | SceneManager + SceneLoader | 5 | Must Have |
| STORY-004 | Scène 3D 1960 — Souris d'Engelbart | 5 | Must Have |

**Total:** 10 points / 12 capacité (83%)

**Livrables Sprint 2:**
- SceneManager + SceneLoader fonctionnels
- detect-gpu + qualité adaptative
- Souris d'Engelbart en 3D dans la section 1960
- Lazy loading + dispose validés
- **Test mobile sur vrai appareil = GO/NO-GO**

**Risques:**
- Blender MCP : qualité du modèle low-poly
- Performance mobile : valider 60 FPS dès ce sprint
- Safari iOS : tester les quirks WebGL/ScrollTrigger

**Decision Point:**
Si le prototype ne tourne pas à 60 FPS sur mobile milieu de gamme → réévaluer le scope (fallback 2D plus agressif, réduire le nombre de décennies)

---

### Sprint 3 (Semaines 5-6) — 10/12 points

**Goal:** Audio immersif complet + textes historiques pour toutes les décennies

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-005 | AudioManager + sons par décennie | 5 | Must Have |
| STORY-009 | Textes historiques par décennie | 5 | Must Have |

**Total:** 10 points / 12 capacité (83%)

**Livrables Sprint 3:**
- AudioManager Howler.js fonctionnel
- 7 ambiances sonores intégrées avec crossfade
- Bouton mute/unmute dans l'overlay
- Textes historiques rédigés pour les 7 décennies
- Progressive disclosure animé au scroll
- L'expérience est déjà riche : scroll + 1 scène 3D + son + texte

**Risques:**
- Sourcing audio (freesound.org) : trouver des sons d'époque de qualité
- Rédaction des textes : Nevil valide le ton et le contenu

---

### Sprint 4 (Semaines 7-8) — 11/12 points

**Goal:** 4 décennies 3D complètes (1960-1990) + interaction utilisateur

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-006 | Scènes 3D 1970-1980-1990 | 8 | Must Have |
| STORY-008 | Interaction 3D utilisateur | 3 | Should Have |

**Total:** 11 points / 12 capacité (92%)

**Livrables Sprint 4:**
- Terminal VT100 (1970), Game Boy (1980), Globe web (1990) en 3D
- Palettes visuelles distinctes par époque
- Rotation touch/souris sur tous les objets
- 4 décennies complètes (1960-1990) : 3D + son + texte + interaction
- **Premier bêta-test possible**

**Risques:**
- 3 modèles Blender en un sprint : rythme soutenu
- Mémoire GPU : vérifier que le dispose fonctionne bien avec 4 scènes

---

### Sprint 5 (Semaines 9-10) — 11/12 points

**Goal:** 7 décennies 3D complètes + histoire personnelle de Nevil intégrée

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-007 | Scènes 3D 2000-2010-2020 | 8 | Must Have |
| STORY-010 | Histoire personnelle de Nevil | 3 | Must Have |

**Total:** 11 points / 12 capacité (92%)

**Livrables Sprint 5:**
- iPod (2000), iPhone (2010), Cerveau IA (2020) en 3D
- 7/7 décennies complètes avec 3D + son + texte
- Histoire de Nevil tissée dans chaque décennie
- **Le voyage complet est jouable de bout en bout**
- Bêta-test avec 5-10 personnes

**Risques:**
- L'histoire personnelle nécessite du contenu de Nevil
- La scène 2020 (IA) doit être visuellement marquante — c'est la conclusion

---

### Sprint 6 (Semaines 11-12) — 11/12 points

**Goal:** Polish, SEO, analytics, easter eggs — LANCEMENT

**Stories:**
| ID | Titre | Points | Priorité |
|----|-------|--------|----------|
| STORY-011 | Indicateur de progression | 3 | Should Have |
| STORY-012 | Enrichissements desktop | 3 | Should Have |
| STORY-013 | SEO, OG & Analytics | 3 | Should Have |
| STORY-014 | Easter eggs | 2 | Could Have |

**Total:** 11 points / 12 capacité (92%)

**Livrables Sprint 6:**
- Indicateur de progression visible pendant le voyage
- Effets desktop enrichis (GPU tier 3)
- SEO + Open Graph + Twitter Cards
- Analytics Vercel + tracking scroll/contact
- 2-3 easter eggs
- **Corrections suite aux retours bêta**
- **LANCEMENT sur Vercel production**
- **Soumission Awwwards**

**Risques:**
- Retours bêta-test peuvent nécessiter des corrections imprévues
- Easter eggs sont Could Have — à couper si retard

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprints |
|---------|-----------|---------|--------------|---------|
| EPIC-001 | Fondation & Infrastructure | STORY-001, STORY-002 | 8 pts | Sprint 1 |
| EPIC-002 | Expérience 3D & Visuelle | STORY-003, 004, 006, 007, 008, 012 | 32 pts | Sprint 2-5 |
| EPIC-003 | Audio Immersif | STORY-005 | 5 pts | Sprint 3 |
| EPIC-004 | Contenu & Storytelling | STORY-002 (contact), 009, 010 | 11 pts | Sprint 1, 3, 5 |
| EPIC-005 | Polish, SEO & Analytics | STORY-011, 013, 014 | 8 pts | Sprint 6 |
| **Total** | | **14 stories** | **61 pts** | **6 sprints** |

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | Navigation scroll vertical | STORY-001 | 1 |
| FR-002 | 7 sections décennies | STORY-001 | 1 |
| FR-003 | Écran d'intro / accueil | STORY-002 | 1 |
| FR-004 | Indicateur de progression | STORY-011 | 6 |
| FR-005 | Objet 3D par décennie | STORY-003, 004, 006, 007 | 2-5 |
| FR-006 | Interaction 3D basique | STORY-008 | 4 |
| FR-007 | Ambiance visuelle par décennie | STORY-004, 006, 007 | 2-5 |
| FR-008 | Son immersif par décennie | STORY-005 | 3 |
| FR-009 | Contrôle audio utilisateur | STORY-005 | 3 |
| FR-010 | Textes historiques par décennie | STORY-009 | 3 |
| FR-011 | Histoire personnelle intégrée | STORY-010 | 5 |
| FR-012 | Section contact / CTA finale | STORY-002 | 1 |
| FR-013 | Mobile-first responsive | STORY-001, 003 | 1-2 |
| FR-014 | Version desktop enrichie | STORY-012 | 6 |
| FR-015 | SEO & Open Graph | STORY-013 | 6 |
| FR-016 | Analytics | STORY-013 | 6 |
| FR-017 | Easter eggs simples | STORY-014 | 6 |

**Couverture : 17/17 FRs = 100%**

---

## Risks and Mitigation

### High

| Risque | Sprint impacté | Mitigation |
|--------|----------------|------------|
| Performance mobile insuffisante (3D trop lourde) | Sprint 2 (GO/NO-GO) | Hard constraint < 5000 tri, < 500KB/modèle. Fallback 2D. Test mobile réel dès Sprint 2. |
| Blender MCP ne produit pas des modèles assez détaillés | Sprint 2-5 | Tester dès STORY-004. Plan B : modèles libres de droits (Sketchfab CC0) optimisés. |

### Medium

| Risque | Sprint impacté | Mitigation |
|--------|----------------|------------|
| Perte de motivation sur 12 semaines | Sprint 3-5 | Chaque sprint = livrable visible. Build in public Twitter/X. Sprint 1 = victoire rapide. |
| Safari iOS WebGL/ScrollTrigger quirks | Sprint 2 | Tester dès le prototype. Pattern Lenis+GSAP est éprouvé sur Safari. |
| Sons d'époque difficiles à sourcer | Sprint 3 | Freesound.org + génération IA si besoin. Sons d'ambiance, pas de musiques sous licence. |
| Contenu narratif (histoire Nevil) | Sprint 5 | Nevil prépare ses moments clés en avance, Claude les intègre. |

### Low

| Risque | Sprint impacté | Mitigation |
|--------|----------------|------------|
| Fuite mémoire GPU | Sprint 4-5 | Dispose pattern + monitoring `renderer.info.memory`. Max 2-3 scènes en mémoire. |
| GSAP licence commerciale | N/A | Portfolio personnel = usage gratuit. |
| Scope creep | Tous | "Pas dans le PRD = pas dans le sprint". Ce document est la vérité. |

---

## Dependencies

### External

| Dépendance | Impact | Sprint |
|------------|--------|--------|
| Blender MCP | Création des 7 modèles 3D | 2-5 |
| Freesound.org | Assets audio libres de droits | 3 |
| Vercel | Déploiement + CDN + analytics | 1-6 |
| Awwwards | Soumission (~50$) | 6 |

### Internal (entre stories)

```
STORY-001 ──→ STORY-002, 003, 009, 011, 013
STORY-002 ──→ STORY-005
STORY-003 ──→ STORY-004, 006, 007, 008, 012
STORY-004 ──→ STORY-006, 007, 008
STORY-009 ──→ STORY-010
STORY-006/007 ──→ STORY-014
```

---

## Definition of Done

Pour qu'une story soit considérée comme terminée :
- [ ] Code implémenté et commité
- [ ] Fonctionne sur mobile (320px+) ET desktop
- [ ] 60 FPS maintenu sur mobile milieu de gamme (si 3D)
- [ ] Testé sur Chrome + Safari (minimum)
- [ ] Commentaires en français dans le code
- [ ] Pas de régression sur les stories précédentes
- [ ] Validé par Nevil (direction créative)
- [ ] Déployé sur Vercel preview

---

## Next Steps

**Immédiat :** Commencer Sprint 1

Options :
1. `/bmad:create-story STORY-001` — Créer le document détaillé de la story
2. `/bmad:dev-story STORY-001` — Commencer l'implémentation directement
3. `/bmad:workflow-status` — Vérifier le statut global du projet

**Recommandé :** `/bmad:dev-story STORY-001` pour démarrer l'implémentation de la première story.

**Sprint cadence :**
- Sprint length : 2 semaines
- Sprint planning : Lundi Semaine 1
- Sprint review : Vendredi Semaine 2
- Sprint retrospective : Vendredi Semaine 2

---

## Sprint Timeline

```
Fév 2026          Mars 2026              Avril 2026             Mai 2026
|──Sprint 1──|──Sprint 2──|──Sprint 3──|──Sprint 4──|──Sprint 5──|──Sprint 6──|
  Fondations   Pipeline 3D   Audio +     1970-1990    2000-2020    Polish &
  + Scroll     + Prototype   Contenu     + Interact.  + Nevil      LANCEMENT

  Sem 1-2      Sem 3-4      Sem 5-6     Sem 7-8      Sem 9-10    Sem 11-12
  8 pts        10 pts       10 pts      11 pts       11 pts      11 pts
                 ↑
            GO/NO-GO
            mobile
```

---

**Ce document a été créé avec la méthode BMAD v6 — Phase 4 (Implementation Planning)**

*Pour continuer : Lancer `/bmad:dev-story STORY-001` pour implémenter la première story du Sprint 1.*
