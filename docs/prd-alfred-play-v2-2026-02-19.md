# Product Requirements Document (PRD)

## ALFRED_PLAY V2

**Date :** 2026-02-19
**Auteur :** Nevil (citry) — assisté par Claude (Product Manager)
**Version :** 1.0
**Projet Level :** 2 (Medium, 5-15 stories)
**Product Brief :** `docs/product-brief-alfred-play-v2-2026-02-18.md`

---

## 1. Executive Summary

ALFRED_PLAY V2 est un site web immersif qui fait voyager le visiteur à travers 7 décennies d'histoire de l'informatique (1960-2026) en scrollant. Chaque décennie est une expérience visuelle et sonore unique avec des objets 3D iconiques — de la souris en bois d'Engelbart au Game Boy, en passant par l'iPhone, jusqu'à l'IA de 2026.

Le site sert de portfolio vivant pour Nevil, prouvant qu'un technicien terrain non-codeur peut créer une expérience web niveau Awwwards avec l'IA comme partenaire.

**Stack technique :** Astro + Three.js + GSAP/ScrollTrigger + Lenis + Howler.js + Blender MCP

---

## 2. Business Objectives

1. **Lancement** : site live en 12 semaines (mai 2026)
2. **Soumission Awwwards** : Honorable Mention minimum
3. **Visiteurs** : 5 000 visiteurs uniques dans le premier mois
4. **Taux de scroll complet** : 40% des visiteurs arrivent jusqu'à 2026
5. **Contacts pro** : 10+ prises de contact en 3 mois
6. **Viralité** : au moins 1 mention média/blog tech

### Success Metrics

| Métrique | Cible | Outil de mesure |
|----------|-------|-----------------|
| Temps moyen sur site | > 2 minutes | Plausible / Vercel Analytics |
| Taux de scroll | > 60% de la page | GSAP ScrollTrigger events |
| Taux de rebond | < 30% | Analytics |
| Partages sociaux | Suivi qualitatif | Tracking liens |
| Clics contact | Suivi quantitatif | Analytics events |

---

## 3. User Personas

### Persona 1 : Le Recruteur Tech
- **Âge :** 28-45 ans
- **Niveau technique :** Moyen
- **Provenance :** LinkedIn, CV, recommandations
- **Besoin :** Un "wow" en 10 secondes. Voir si Nevil est différent.
- **Frustration :** Tous les portfolios se ressemblent.

### Persona 2 : Le Passionné Tech / Dev
- **Âge :** 20-35 ans
- **Niveau technique :** Élevé (va inspecter le code)
- **Provenance :** Twitter/X, Awwwards, Product Hunt, Reddit
- **Besoin :** Être impressionné, apprendre, s'inspirer.
- **Frustration :** Les sites "créatifs" sont souvent vides de substance.

### Persona 3 : Le Curieux Non-Tech
- **Âge :** 16-60 ans
- **Niveau technique :** Zéro à moyen
- **Provenance :** Bouche-à-oreille, réseaux sociaux
- **Besoin :** Se divertir, apprendre sans effort, vivre une expérience cool.
- **Frustration :** L'histoire de l'informatique est racontée de façon ennuyeuse.

---

## 4. Key User Flows

### Flow 1 : Le Voyage Complet
1. Visiteur arrive sur l'écran d'accueil
2. Clique "Commencer le voyage" (débloque l'audio)
3. Scrolle à travers les 7 décennies
4. Explore les objets 3D, lit les textes, écoute les sons
5. Découvre l'histoire de Nevil au fil du voyage
6. Arrive à la section contact / CTA
7. Prend contact ou partage le site

### Flow 2 : Le Passage Rapide (Recruteur)
1. Visiteur arrive via LinkedIn
2. Est impressionné en < 10 secondes par le visuel
3. Scrolle rapidement à travers les sections
4. Arrive au contact et envoie un message

### Flow 3 : L'Exploration Curieuse (Dev)
1. Visiteur arrive via Twitter/Reddit
2. Scrolle et explore les objets 3D en détail
3. Ouvre l'inspecteur pour regarder le code
4. Partage sur les réseaux

---

## 5. Functional Requirements

### FR-001 : Navigation Scroll Vertical

**Priorité :** Must Have

**Description :**
Le scroll vertical fait avancer le visiteur de 1960 à 2026. Les transitions entre décennies sont fluides et progressives grâce à GSAP ScrollTrigger et Lenis smooth scroll.

**Critères d'acceptation :**
- [ ] Le scroll fait avancer dans la timeline de manière fluide
- [ ] Les transitions entre décennies sont animées progressivement
- [ ] Le smooth scroll Lenis est actif et performant
- [ ] Le scroll fonctionne au touch sur mobile et à la molette sur desktop

---

### FR-002 : 7 Sections Décennies

**Priorité :** Must Have

**Description :**
Le site contient 7 sections plein écran correspondant aux décennies : 1960, 1970, 1980, 1990, 2000, 2010, 2020-2026.

**Critères d'acceptation :**
- [ ] 7 sections existent et sont accessibles par scroll
- [ ] Chaque section occupe au minimum la hauteur du viewport
- [ ] L'ordre chronologique est respecté
- [ ] Chaque section a une identité visuelle distincte

---

### FR-003 : Écran d'Intro / Accueil

**Priorité :** Must Have

**Description :**
Une page d'accueil / écran d'intro avec un appel à l'action "Commencer le voyage" qui sert de premier contact visuel et de déclencheur pour l'audio (interaction utilisateur requise par les navigateurs).

**Critères d'acceptation :**
- [ ] L'écran d'accueil est visuellement impactant
- [ ] Un bouton/CTA invite à commencer le voyage
- [ ] L'interaction débloque l'audio (gestion autoplay)
- [ ] Le visiteur comprend immédiatement qu'il faut scroller

---

### FR-004 : Indicateur de Progression

**Priorité :** Should Have

**Description :**
Un indicateur visuel permanent montre la décennie courante et la progression dans le voyage temporel.

**Critères d'acceptation :**
- [ ] L'indicateur est visible sans gêner l'expérience
- [ ] Il affiche la décennie courante (ex: "1980")
- [ ] Il montre la progression globale (position dans la timeline)
- [ ] Il est responsive (adapté mobile et desktop)

---

### FR-005 : Objet 3D Iconique par Décennie

**Priorité :** Must Have

**Description :**
Chaque décennie présente 1 artefact 3D iconique modélisé dans Blender : souris d'Engelbart (1960), terminal (1970), Macintosh/Game Boy (1980), navigateur web (1990), iPod (2000), iPhone (2010), IA/robot (2020-2026).

**Critères d'acceptation :**
- [ ] 7 objets 3D sont présents (1 par décennie)
- [ ] Chaque objet < 5000 triangles (low-poly)
- [ ] Les objets s'affichent correctement sur mobile et desktop
- [ ] Les objets apparaissent avec une animation d'entrée au scroll

**Dépendances :** FR-002

---

### FR-006 : Interaction 3D Basique

**Priorité :** Should Have

**Description :**
Le visiteur peut faire pivoter et explorer l'objet 3D de chaque décennie via le touch (mobile) ou la souris (desktop).

**Critères d'acceptation :**
- [ ] Rotation au drag/touch fonctionne
- [ ] L'interaction ne bloque pas le scroll principal
- [ ] Animation de retour à la position par défaut si pas d'interaction

**Dépendances :** FR-005

---

### FR-007 : Ambiance Visuelle par Décennie

**Priorité :** Must Have

**Description :**
Chaque décennie possède sa propre palette de couleurs, typographie et atmosphère visuelle unique qui évoque l'époque.

**Critères d'acceptation :**
- [ ] 7 palettes de couleurs distinctes
- [ ] Transition visuelle fluide entre décennies au scroll
- [ ] L'ambiance est cohérente avec l'époque (ex: tons verts terminal pour les 70s)
- [ ] Le contraste texte/fond est suffisant pour la lisibilité

**Dépendances :** FR-002

---

### FR-008 : Son Immersif par Décennie

**Priorité :** Must Have

**Description :**
Chaque décennie a sa signature audio : bips terminal (1960-70), sons rétro (1980), modem dial-up (1990), sons Windows/Mac (2000), notifications smartphone (2010), sons IA/futuristes (2020).

**Critères d'acceptation :**
- [ ] 7 ambiances sonores distinctes
- [ ] Transition audio fluide entre décennies
- [ ] Le son se lance après l'interaction initiale (respect autoplay)
- [ ] Fonctionne via Howler.js
- [ ] L'expérience reste compréhensible SANS le son

**Dépendances :** FR-003 (déblocage audio)

---

### FR-009 : Contrôle Audio Utilisateur

**Priorité :** Must Have

**Description :**
Un bouton mute/unmute est accessible en permanence. L'indicateur montre clairement l'état audio.

**Critères d'acceptation :**
- [ ] Bouton mute/unmute toujours visible
- [ ] État audio clairement indiqué (icône speaker on/off)
- [ ] Le choix de l'utilisateur est mémorisé pendant la session
- [ ] Le bouton est accessible sur mobile et desktop

---

### FR-010 : Textes Historiques par Décennie

**Priorité :** Must Have

**Description :**
Chaque décennie affiche un contenu textuel concis décrivant les moments clés de l'époque en informatique. Le texte est révélé progressivement (progressive disclosure).

**Critères d'acceptation :**
- [ ] Chaque décennie a un texte descriptif
- [ ] Les textes sont concis et engageants (pas un article Wikipedia)
- [ ] Le texte apparaît de manière animée au scroll
- [ ] La typographie est lisible sur tous les appareils

**Dépendances :** FR-002

---

### FR-011 : Histoire Personnelle de Nevil Intégrée

**Priorité :** Must Have

**Description :**
Le parcours de Nevil est tissé dans la timeline historique — le visiteur découvre qui il est EN voyageant, pas sur une page "À propos" séparée. C'est un CV qu'on vit.

**Critères d'acceptation :**
- [ ] Les moments clés de la vie de Nevil apparaissent dans les décennies correspondantes
- [ ] L'histoire personnelle est intégrée visuellement (pas plaquée)
- [ ] À la fin du voyage, le visiteur comprend qui est Nevil et ce qu'il fait
- [ ] Le ton est personnel et authentique

**Dépendances :** FR-010

---

### FR-012 : Section Contact / CTA Finale

**Priorité :** Must Have

**Description :**
En fin de voyage (après 2020-2026), une section contact avec CTA clair pour contacter Nevil (LinkedIn, email, etc.).

**Critères d'acceptation :**
- [ ] Section visible après la dernière décennie
- [ ] Au moins 2 moyens de contact (LinkedIn + email minimum)
- [ ] CTA clair et engageant
- [ ] Le visiteur sent une conclusion naturelle au voyage

---

### FR-013 : Mobile-First Responsive

**Priorité :** Must Have

**Description :**
Le site est conçu mobile-first. L'expérience tactile est la priorité. 70% du trafic attendu vient du mobile.

**Critères d'acceptation :**
- [ ] Le site fonctionne parfaitement sur smartphone (320px+)
- [ ] Navigation au pouce fluide
- [ ] Les objets 3D sont visibles et exploitables sur mobile
- [ ] Pas de scroll horizontal non désiré
- [ ] Les textes sont lisibles sans zoom

---

### FR-014 : Version Desktop Enrichie

**Priorité :** Should Have

**Description :**
Sur desktop, le site affiche des effets 3D et visuels enrichis (shaders, particles, détails supplémentaires) absents sur mobile pour des raisons de performance.

**Critères d'acceptation :**
- [ ] Effets visuels supplémentaires visibles sur desktop
- [ ] Détection automatique des capacités GPU
- [ ] Aucun effet enrichi ne casse l'expérience mobile
- [ ] Le site reste fonctionnel même sans les enrichissements desktop

**Dépendances :** FR-005, FR-013

---

### FR-015 : SEO & Open Graph

**Priorité :** Should Have

**Description :**
Le site a les meta tags essentiels pour le référencement et des Open Graph tags pour un aperçu riche lors des partages sur les réseaux sociaux.

**Critères d'acceptation :**
- [ ] Meta title, description, keywords présents
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Card tags
- [ ] Sitemap.xml généré automatiquement
- [ ] robots.txt correct

---

### FR-016 : Analytics

**Priorité :** Should Have

**Description :**
Tracking des métriques clés : temps sur site, taux de scroll par section, taux de rebond, clics sur le CTA contact.

**Critères d'acceptation :**
- [ ] Outil analytics installé (Plausible ou Vercel Analytics)
- [ ] Événements de scroll par décennie trackés
- [ ] Clics sur le bouton contact trackés
- [ ] Respect RGPD (pas de cookies intrusifs)

---

### FR-017 : Easter Eggs Simples

**Priorité :** Could Have

**Description :**
2-3 easter eggs discrets pour les visiteurs curieux. Pas de mini-jeux complexes — juste des clins d'œil.

**Critères d'acceptation :**
- [ ] 2-3 easter eggs intégrés
- [ ] Ils ne perturbent pas l'expérience principale
- [ ] Ils récompensent la curiosité (exploration, clics inattendus)

---

## 6. Non-Functional Requirements

### NFR-001 : Performance — Temps de Chargement

**Priorité :** Must Have

**Description :**
Le premier chargement du site doit être < 5 Mo. Le First Contentful Paint (FCP) doit être < 2s sur connexion 4G. Le site doit rester utilisable sur 3G grâce au lazy loading agressif.

**Critères d'acceptation :**
- [ ] Poids initial < 5 Mo
- [ ] FCP < 2s sur 4G
- [ ] Lazy loading sur tous les assets 3D et audio
- [ ] Lighthouse Performance > 90

**Justification :** 70% du trafic vient du mobile. Un site lent = un visiteur perdu.

---

### NFR-002 : Performance — Framerate Mobile

**Priorité :** Must Have

**Description :**
Le site doit maintenir 60 FPS minimum sur un smartphone milieu de gamme (Samsung Galaxy A série). Les objets 3D sont contraints à < 5000 triangles.

**Critères d'acceptation :**
- [ ] 60 FPS constant sur Galaxy A milieu de gamme
- [ ] Chaque objet 3D < 5000 triangles
- [ ] Fallback WebGL2 (pas de WebGPU obligatoire)
- [ ] Fallback images 2D statiques si GPU insuffisant

**Justification :** La fluidité est ce qui fait la différence entre "wow" et "bof".

---

### NFR-003 : Compatibilité — Navigateurs & Appareils

**Priorité :** Must Have

**Description :**
Le site fonctionne sur les navigateurs majeurs desktop et mobile.

**Critères d'acceptation :**
- [ ] Chrome 90+, Safari 15+, Firefox 90+, Edge 90+
- [ ] iOS Safari 15+ (iPhone/iPad)
- [ ] Chrome Android 90+
- [ ] Résolutions : 320px à 2560px

**Justification :** Les recruteurs utilisent des navigateurs variés. Pas de place pour le "ça marche que sur Chrome".

---

### NFR-004 : Usabilité — Accessibilité de Base

**Priorité :** Should Have

**Description :**
Le site respecte les bases d'accessibilité : contrastes, navigation clavier, textes alternatifs.

**Critères d'acceptation :**
- [ ] Ratio de contraste WCAG AA sur les textes
- [ ] L'expérience reste compréhensible sans son
- [ ] Alt-text sur les éléments visuels importants

**Justification :** Un site Awwwards qui exclut des utilisateurs, c'est un mauvais signal.

---

### NFR-005 : Scalabilité — Trafic

**Priorité :** Should Have

**Description :**
Le site supporte 5 000+ visiteurs/mois sur le plan gratuit Vercel (déploiement statique).

**Critères d'acceptation :**
- [ ] Déploiement 100% statique sur Vercel
- [ ] CDN Vercel pour les assets
- [ ] Aucune dépendance serveur ou base de données

**Justification :** Budget < 100$. Le site DOIT être gratuit à héberger.

---

### NFR-006 : Maintenabilité — Qualité du Code

**Priorité :** Should Have

**Description :**
Le code est structuré, modulaire, et commenté en français.

**Critères d'acceptation :**
- [ ] Commentaires en français (cf. CLAUDE.md)
- [ ] Structure modulaire : 1 composant par décennie
- [ ] Pas de dépendances inutiles

**Justification :** Nevil doit pouvoir comprendre et maintenir le site avec l'aide de l'IA.

---

### NFR-007 : SEO — Indexabilité

**Priorité :** Should Have

**Description :**
Le site est correctement indexable par les moteurs de recherche.

**Critères d'acceptation :**
- [ ] Meta tags présents (title, description)
- [ ] Open Graph tags pour partage social
- [ ] Sitemap.xml généré
- [ ] robots.txt correct

**Justification :** Visibilité organique pour atteindre les 5000 visiteurs/mois.

---

## 7. Epics

### EPIC-001 : Fondation & Infrastructure

**Description :**
Mettre en place le projet Astro, Three.js, GSAP, Lenis, la structure des 7 sections et le déploiement Vercel.

**Functional Requirements :**
- FR-001 (Navigation scroll vertical)
- FR-002 (7 sections décennies)
- FR-003 (Écran d'intro)
- FR-013 (Mobile-first responsive)

**Story Count Estimate :** 3-4 stories

**Priorité :** Must Have

**Business Value :**
Sans cette base, rien ne fonctionne. C'est le squelette du site — la structure sur laquelle tout repose.

---

### EPIC-002 : Expérience 3D & Visuelle

**Description :**
Créer les 7 objets 3D dans Blender, les intégrer dans Three.js avec interactions et ambiances visuelles par décennie.

**Functional Requirements :**
- FR-005 (Objet 3D par décennie)
- FR-006 (Interaction 3D basique)
- FR-007 (Ambiance visuelle par décennie)
- FR-014 (Desktop enrichi)

**Story Count Estimate :** 4-7 stories

**Priorité :** Must Have

**Business Value :**
Le "wow factor" — c'est ce qui crée l'émotion, le bouche-à-oreille, et ce qui différencie ALFRED_PLAY de tout autre portfolio.

---

### EPIC-003 : Audio Immersif

**Description :**
Intégrer Howler.js, les sons d'époque par décennie, le contrôle utilisateur et la gestion de l'autoplay mobile.

**Functional Requirements :**
- FR-008 (Son immersif par décennie)
- FR-009 (Contrôle audio utilisateur)

**Story Count Estimate :** 2-3 stories

**Priorité :** Must Have

**Business Value :**
Le son transforme un site visuel en expérience multisensorielle. C'est ce qui ancre le souvenir et crée l'émotion.

---

### EPIC-004 : Contenu & Storytelling

**Description :**
Rédiger et intégrer les textes historiques, l'histoire personnelle de Nevil dans la timeline, et la section contact finale.

**Functional Requirements :**
- FR-010 (Textes historiques par décennie)
- FR-011 (Histoire personnelle intégrée)
- FR-012 (Section contact / CTA finale)

**Story Count Estimate :** 3-4 stories

**Priorité :** Must Have

**Business Value :**
Le contenu donne un sens au voyage. Sans storytelling, c'est une démo technique sans âme. Avec, c'est un CV qu'on vit.

---

### EPIC-005 : Polish, SEO & Analytics

**Description :**
SEO, Open Graph, analytics, easter eggs, et optimisations finales avant lancement et soumission Awwwards.

**Functional Requirements :**
- FR-004 (Indicateur de progression)
- FR-015 (SEO & Open Graph)
- FR-016 (Analytics)
- FR-017 (Easter eggs simples)

**Story Count Estimate :** 2-3 stories

**Priorité :** Should Have / Could Have

**Business Value :**
Maximise la visibilité (SEO), mesure le succès (analytics), et récompense les curieux (easter eggs). C'est la couche de polish qui fait passer de "bien" à "Awwwards".

---

## 8. User Stories

Détaillées lors du sprint planning (Phase 4). Voir `/bmad:sprint-planning`.

---

## 9. Traceability Matrix

| Epic ID | Epic Name | FRs | Story Estimate |
|---------|-----------|-----|----------------|
| EPIC-001 | Fondation & Infrastructure | FR-001, FR-002, FR-003, FR-013 | 3-4 stories |
| EPIC-002 | Expérience 3D & Visuelle | FR-005, FR-006, FR-007, FR-014 | 4-7 stories |
| EPIC-003 | Audio Immersif | FR-008, FR-009 | 2-3 stories |
| EPIC-004 | Contenu & Storytelling | FR-010, FR-011, FR-012 | 3-4 stories |
| EPIC-005 | Polish, SEO & Analytics | FR-004, FR-015, FR-016, FR-017 | 2-3 stories |
| **Total** | | **17 FRs** | **14-21 stories** |

---

## 10. Prioritization Summary

### Functional Requirements
| Priorité | Count | FRs |
|----------|-------|-----|
| Must Have | 10 | FR-001 à FR-003, FR-005, FR-007 à FR-013 |
| Should Have | 6 | FR-004, FR-006, FR-014 à FR-016 |
| Could Have | 1 | FR-017 |

### Non-Functional Requirements
| Priorité | Count | NFRs |
|----------|-------|------|
| Must Have | 3 | NFR-001 à NFR-003 |
| Should Have | 4 | NFR-004 à NFR-007 |

---

## 11. Dependencies

### Internal
- Les 7 sections (FR-002) doivent être en place avant les objets 3D (FR-005), les sons (FR-008) et les textes (FR-010)
- L'écran d'intro (FR-003) doit exister pour débloquer l'audio (FR-008)
- Le mobile-first (FR-013) conditionne toutes les décisions de design

### External
- **Blender MCP** — pour la création des objets 3D
- **Freesound.org** — pour les assets audio libres de droits
- **Vercel** — pour le déploiement (plan gratuit)
- **Awwwards** — pour la soumission (~50$)

---

## 12. Assumptions

- Blender MCP peut générer des objets 3D low-poly suffisamment détaillés pour être visuellement impressionnants
- Three.js + GSAP tourne correctement sur mobile milieu de gamme en 2026
- Le scroll comme navigation principale fonctionne intuitivement pour tous les âges
- Le son améliore l'expérience sans être bloquant (gestion autoplay mobile)
- BMAD structure assez bien le projet pour avancer story by story
- 200 heures suffisent pour 7 décennies avec l'aide de l'IA
- Vercel gratuit tient la charge pour 5000 visiteurs/mois

---

## 13. Out of Scope

- Blog ou système de contenu dynamique
- Multilingue (V2 = français uniquement)
- Système de login ou compte utilisateur
- Base de données ou backend
- CMS pour éditer le contenu
- Mode VR / réalité virtuelle
- Plus de 1 objet 3D par décennie
- Animations ultra-complexes qui casseraient le mobile
- E-commerce ou monétisation directe
- Easter eggs complexes (max 2-3 simples)

---

## 14. Open Questions

1. **Objets 3D exacts** — la liste définitive des artefacts par décennie sera finalisée pendant l'architecture/design (quels objets sont les plus iconiques ET modélisables en low-poly ?)
2. **Contenu narratif** — le texte exact et le placement de l'histoire de Nevil seront affinés pendant le sprint storytelling
3. **Fallback mobile** — à quel seuil GPU on bascule en images 2D ? Test nécessaire avec de vrais appareils
4. **Domaine** — quel nom de domaine ? (alfredplay.com, nevil.dev, autre ?)

---

## 15. Stakeholders

| Stakeholder | Rôle | Influence |
|-------------|------|-----------|
| Nevil | Product Owner / Directeur créatif / Testeur | High |
| Claude / IA Anthropic | Développeur principal / Architecte | High |
| Bêta-testeurs (amis/famille) | Tests UX mobile | Medium |
| Communauté Twitter/X & Reddit | Early adopters | Medium |
| Communauté BMAD Discord | Support méthodologique | Low |

---

## 16. Risks

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Performance mobile insuffisante | High | High | Hard constraint < 5000 tri, < 5 Mo. Fallback 2D. Test mobile dès semaine 2. |
| Setup technique mal connecté | High | Medium | BMAD structure chaque story. Phase 0 = validation technique. |
| Perte de motivation | Medium | High | 1 décennie = 1 victoire. Build in public sur Twitter/X. |
| Son bloqué sur mobile | Medium | Medium | Howler.js + bouton "Commencer". Expérience valide sans son. |
| Awwwards refuse | Medium | Low | Objectif = HM. Soumettre aussi CSS Design Awards, FWA, One Page Love. |
| Scope creep | Low | Medium | Ce PRD = vérité. "Pas dans le PRD = pas dans le sprint". |

---

**Ce document a été créé avec la méthode BMAD v6 — Phase 2 (Planning)**

*Pour continuer : Lancer `/bmad:architecture` pour concevoir l'architecture système.*
