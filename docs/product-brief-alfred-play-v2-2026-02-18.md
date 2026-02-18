# Product Brief: ALFRED_PLAY V2

**Date:** 2026-02-18
**Author:** Nevil (citry)
**Version:** 1.0
**Project Type:** Web Application
**Project Level:** 2 (Medium, 5-15 stories)

---

## Executive Summary

ALFRED_PLAY V2 est un site web immersif qui fait voyager le visiteur à travers 7 décennies d'histoire de l'informatique (1960-2026) en scrollant. Chaque décennie est une expérience visuelle et sonore unique avec des objets 3D iconiques — de la souris en bois d'Engelbart au Game Boy, en passant par l'iPhone, jusqu'à l'IA de 2026.

C'est pour tout le monde : les curieux, les passionnés de tech, les recruteurs qui visitent le portfolio de Nevil. Pas besoin d'être geek pour comprendre — on ressent l'histoire autant qu'on l'apprend.

Ce qui rend ALFRED_PLAY V2 unique : ce n'est pas un site vitrine classique ni un musée ennuyeux. C'est une expérience émotionnelle qui utilise la neuroscience (dopamine de l'anticipation, sons d'époque, récompenses variables, progressive disclosure) pour que les gens ne puissent pas s'arrêter de scroller. C'est aussi la preuve vivante qu'un technicien terrain qui ne code pas peut créer un site niveau Awwwards avec l'IA comme partenaire.

Inspirations : Neal Agarwal (Internet Artifacts), Bruno Simon, British Museum.

---

## Problem Statement

### The Problem

Trois problèmes convergents :

1. **Les portfolios sont tous les mêmes** — un template Figma avec des cases. Rien ne sort du lot, rien ne crée d'émotion, rien ne reste en mémoire.

2. **L'histoire de l'informatique est racontée de façon ennuyeuse** — des articles Wikipedia ou des docs YouTube, jamais en expérience interactive. Le contenu existe mais le format est passif.

3. **Personne ne prouve qu'un non-codeur peut créer quelque chose de niveau award-winning avec l'IA** — les outils existent mais le monde n'a pas encore vu la preuve concrète.

### Why Now?

Parce qu'en 2026, pour la première fois de l'histoire, les outils existent pour le faire. Claude Code + Blender MCP + BMAD + Three.js — cette combinaison n'existait pas il y a 6 mois. Nevil est peut-être le premier technicien non-dev à tenter un site Awwwards avec un setup 100% IA. Le projet EST sa propre preuve : si le site est beau, c'est que le workflow fonctionne.

### Impact if Unsolved

Si ALFRED_PLAY V2 n'existe pas, rien ne change — et c'est justement le problème. Les portfolios restent des PDF interactifs ennuyeux, l'histoire de l'informatique reste coincée dans des formats passifs, et les non-codeurs continuent de croire qu'ils ne peuvent pas créer. Nevil reste un technicien terrain invisible avec un CV classique qui ne montre pas ce qu'il sait vraiment faire. Le monde ne voit pas que l'IA a démocratisé la création. Quelqu'un doit le prouver — autant que ce soit lui.

---

## Target Audience

### Primary Users

**1. Recruteurs tech / RH**
- Âge : 28-45 ans
- Niveau technique : moyen (comprennent la tech mais ne codent pas)
- Provenance : LinkedIn, lien dans le CV, recommandations
- Besoin : voir si Nevil est différent des 200 autres candidats. Ils veulent un "wow" en 10 secondes.

**2. Passionnés tech / devs curieux**
- Âge : 20-35 ans
- Niveau technique : élevé (vont inspecter le code, regarder comment c'est fait)
- Provenance : Twitter/X, Awwwards, Product Hunt, Reddit (r/webdev, r/threejs)
- Besoin : être impressionnés, apprendre, s'inspirer pour leurs propres projets.

**3. Curieux non-tech**
- Âge : 16-60 ans (large)
- Niveau technique : zéro à moyen
- Provenance : bouche-à-oreille, partage sur réseaux sociaux
- Besoin : se divertir, apprendre quelque chose sans effort, vivre une expérience cool.

### Secondary Users

- **Étudiants en informatique** — pour découvrir l'histoire de leur domaine
- **Communauté IA / no-code** — pour voir ce qu'on peut faire avec Claude + Cursor
- **Journalistes tech / blogueurs** — potentiel article "un non-codeur crée un site Awwwards avec l'IA"
- **Communauté Awwwards / design** — effet boule de neige si le site est repéré

### User Needs

1. **Besoin d'être impressionné en moins de 10 secondes** — le visiteur doit sentir immédiatement que ce site est différent de tout ce qu'il a vu. Pas un template, pas une page classique. Un "wow" viscéral.

2. **Besoin d'apprendre sans effort** — l'histoire de l'informatique doit rentrer naturellement, par l'expérience et l'émotion, pas par la lecture. Le visiteur ressort plus cultivé sans avoir eu l'impression d'étudier.

3. **Besoin de comprendre qui est Nevil** — à la fin du voyage, le visiteur doit savoir que Nevil est quelqu'un qui voit les choses différemment, qui maîtrise les outils IA, et qui transforme des idées ambitieuses en réalité.

---

## Solution Overview

### Proposed Solution

Un site web en scroll vertical qui fait voyager de 1960 à 2026, où chaque décennie est une section plein écran avec sa propre ambiance visuelle, sonore et colorimétrique. L'histoire personnelle de Nevil est tissée dans le récit historique. Stack : Astro + Three.js + GSAP/ScrollTrigger + Lenis + Howler.js + Blender MCP.

### Key Features

1. **Scroll vertical = voyage dans le temps** — scroller fait avancer de 1960 à 2026. Chaque décennie est une section plein écran avec sa propre ambiance visuelle, sonore et colorimétrique. C'est le cœur du site.

2. **Un objet 3D iconique par décennie** — un artefact 3D interactif (souris d'Engelbart, Macintosh, Game Boy, premier iPhone...) que le visiteur peut explorer. C'est le "wow" tactile.

3. **Son immersif par époque** — chaque décennie a sa signature audio (bips terminal, modem dial-up, son de démarrage Windows, notification iPhone). Le son crée l'émotion et le souvenir.

4. **Mobile-first responsive** — le site DOIT fonctionner parfaitement au pouce sur smartphone. 70% du trafic viendra du mobile.

5. **Histoire personnelle intégrée au voyage** — le visiteur découvre qui est Nevil EN voyageant dans l'histoire, pas sur une page séparée. On ne lit pas son CV, on voyage dedans.

### Value Proposition

LinkedIn c'est du texte plat qu'on oublie en 2 secondes. ALFRED_PLAY V2 c'est une expérience qu'on vit — on ne lit pas un CV, on voyage dedans. Et personne ne ferme un site quand il a envie de savoir ce qui se passe à la décennie suivante.

---

## Business Objectives

### Goals

1. **Lancement** : site live en 12 semaines (mai 2026)
2. **Soumission Awwwards** : dans la semaine suivant le lancement, objectif Honorable Mention minimum
3. **Visiteurs** : 5 000 visiteurs uniques dans le premier mois post-lancement (via Twitter/X, LinkedIn, Product Hunt, Reddit)
4. **Taux de scroll complet** : 40% des visiteurs arrivent jusqu'à 2026 (la moyenne web c'est 20%)
5. **Contacts pro** : au moins 10 prises de contact recruteurs/clients dans les 3 premiers mois
6. **Viralité** : au moins 1 article ou mention dans un média/blog tech

### Success Metrics

- Temps moyen sur le site > 2 minutes (Plausible ou Vercel Analytics)
- Taux de scroll > 60% de la page (GSAP ScrollTrigger events)
- Taux de rebond < 30%
- Nombre de partages sociaux trackés
- Nombre de clics sur le bouton contact
- **Métrique reine** : un recruteur dit "j'ai jamais vu un portfolio comme ça"

### Business Value

ALFRED_PLAY V2 est le pivot de carrière de Nevil :

1. **Employabilité** — le site devient une carte de visite vivante, remplace le CV PDF, place dans une catégorie à part dans tout processus de recrutement.

2. **Freelance** — possibilité de proposer des services de création de sites immersifs avec l'IA. Une offre que presque personne ne propose aujourd'hui.

3. **Crédibilité écosystème IA** — être le mec qui a fait un site Awwwards sans coder. Histoire que les médias tech adorent. Ouvre des portes : conférences, communautés, collaborations.

4. **Revenus indirects** — le workflow BMAD + Claude + Blender MCP maîtrisé pourra être packageé en formation ou en service. Le projet finance la montée en compétence.

---

## Scope

### In Scope

- 7 sections décennies (1960, 1970, 1980, 1990, 2000, 2010, 2020-2026)
- 1 objet 3D iconique par décennie (modélisé dans Blender via MCP)
- Scroll vertical fluide avec GSAP + ScrollTrigger + Lenis
- Son immersif par décennie (Howler.js)
- Version mobile-first fonctionnelle
- Version desktop enrichie (3D complète, effets, shaders)
- Page d'accueil / écran d'intro avec appel à scroller
- Histoire personnelle de Nevil intégrée dans la timeline
- Section contact / CTA en fin de voyage
- Déploiement sur Vercel
- Analytics basiques (temps sur site, taux de scroll, rebond)
- SEO minimum (meta tags, Open Graph pour les partages sociaux)
- Soumission Awwwards

### Out of Scope

- Blog ou système de contenu dynamique
- Multilingue (V2 = français uniquement)
- Système de login ou compte utilisateur
- Base de données ou backend
- CMS pour éditer le contenu
- Mode VR / réalité virtuelle
- Plus de 1 objet 3D par décennie
- Animations ultra-complexes qui casseraient le mobile
- E-commerce ou monétisation directe
- Easter eggs complexes (max 2-3 simples, pas un jeu dans le jeu)

### Future Considerations

- Version anglaise
- Easter eggs avancés (Game Boy jouable dans la section 1980)
- Mode "making-of" montrant comment le site a été créé avec l'IA
- RAG pour alimenter du contenu historique approfondi
- Section communauté / contributions
- Version offline / PWA
- Chatbot IA qui raconte l'histoire en conversationnel

---

## Key Stakeholders

- **Nevil (Product Owner / Directeur créatif / Testeur)** — Influence High. C'est son projet, sa carrière, sa vision. Décision finale sur tout.

- **Claude / IA Anthropic (Développeur principal / Architecte)** — Influence High. Exécute le code, l'architecture, la documentation. Écrit 100% du code.

- **Communauté BMAD Discord (Support technique)** — Influence Low. Conseils ponctuels sur la méthodologie, cas d'usage créatif de BMAD.

- **Bêta-testeurs / amis / famille (Tests UX)** — Influence Medium. Retours mobile critiques, avis honnête sur l'expérience.

- **Communauté Twitter/X et Reddit (Early adopters)** — Influence Medium. Peuvent faire décoller ou ignorer le projet au lancement.

---

## Constraints and Assumptions

### Constraints

**Budget (< 100$ total) :**
- Hébergement Vercel : gratuit (plan hobby)
- Claude Max : déjà payé
- Cursor : déjà payé
- Soumission Awwwards : ~50$
- Assets sonores : gratuit (freesound.org)
- Domaine : ~15$/an

**Temps :**
- 12 semaines, ~15-20h/semaine (soirs et weekends)
- ~200 heures de production totale
- Goulot d'étranglement = Nevil (validateur, testeur, directeur créatif), pas Claude

**Technologie :**
- Mobile : minimum 60 FPS sur Samsung Galaxy A milieu de gamme
- Poids total < 5 Mo au premier chargement
- Chaque objet 3D < 5000 triangles (low-poly obligatoire)
- Pas de WebGPU obligatoire — fallback WebGL2 pour compatibilité max
- Connexion 3G doit rester utilisable (lazy loading partout)

**Ressources :**
- 1 humain (Nevil) + IA (Claude Code, Claude Max, Blender MCP)
- Pas de designer, sound designer, ou dev externe

### Assumptions

- Blender MCP peut générer des objets 3D low-poly suffisamment détaillés pour être visuellement impressionnants
- Three.js + GSAP tourne correctement sur mobile milieu de gamme en 2026
- Le scroll comme navigation principale fonctionne intuitivement pour tous les âges
- Le son améliore l'expérience sans être bloquant (gestion de l'autoplay mobile)
- BMAD structure assez bien le projet pour qu'un non-codeur puisse avancer story par story
- 200 heures suffisent pour 7 décennies avec l'aide de l'IA
- Vercel gratuit tient la charge pour 5000 visiteurs/mois

---

## Success Criteria

1. Quelqu'un d'inconnu partage le lien sur Twitter en disant "regardez ce truc c'est dingue"
2. Un recruteur appelle et dit "j'ai jamais vu un portfolio comme le vôtre"
3. La mère de Nevil arrive à scroller jusqu'au bout et comprend ce qu'il fait dans la vie
4. Un dev ouvre l'inspecteur, regarde le code, et ne croit pas qu'un non-codeur a fait ça
5. Le site apparaît sur Awwwards, même juste en Honorable Mention
6. Nevil se dit en regardant le site : "j'ai vraiment fait ça"

**Le vrai succès** : le moment où ce projet change la façon dont les gens voient Nevil — et la façon dont il se voit.

---

## Timeline and Milestones

### Target Launch

**Mai 2026** (12 semaines depuis février 2026)

### Key Milestones

**Phase 0 — Fondations (semaines 1-2, → début mars 2026)**
- BMAD terminé (product brief, PRD, architecture)
- CLAUDE.md complet
- Moodboard visuel + sonore finalisé
- Premier prototype : 1 décennie (1960 - souris d'Engelbart) fonctionnelle avec 3D + son
- Validation stack sur mobile
- **GO/NO-GO** : si le prototype ne tourne pas sur mobile → réévaluation du scope

**Phase 1 — Construction du cœur (semaines 3-6, mars 2026)**
- 3 décennies complètes (1960, 1970, 1980)
- Navigation scroll fonctionnelle entre les sections
- Son intégré sur ces 3 décennies
- Tests mobile continus sur vrais appareils
- Première version desktop avec effets 3D enrichis

**Phase 2 — Complétion (semaines 7-10, avril 2026)**
- 4 décennies restantes (1990, 2000, 2010, 2020-2026)
- Histoire personnelle intégrée dans la timeline
- Section contact / CTA finale
- Optimisation performance mobile (Lighthouse > 90)
- Bêta-test avec 5-10 personnes

**Phase 3 — Polish & Lancement (semaines 11-12, mai 2026)**
- Corrections suite aux retours bêta
- SEO + Open Graph
- Analytics installées
- Déploiement production sur Vercel
- Soumission Awwwards
- Posts LinkedIn + Twitter/X + Product Hunt + Reddit

---

## Risks and Mitigation

- **Risk:** Setup technique mal connecté / mauvais agent
  - **Likelihood:** High
  - **Mitigation:** BMAD structure chaque story clairement. CLAUDE.md = cerveau persistant. Phase 0 = validation technique AVANT de construire. Tester Blender MCP sur la souris d'Engelbart dès le jour 1. Garder les prompts qui marchent dans un dossier "recettes".

- **Risk:** Performance mobile insuffisante (3D trop lourde)
  - **Likelihood:** High
  - **Mitigation:** Contrainte hard : objets 3D < 5000 triangles, poids total < 5 Mo. Lazy loading agressif. Fallback : images 2D si mobile trop faible. Test mobile réel dès semaine 2.

- **Risk:** Perte de motivation / projet trop long
  - **Likelihood:** Medium
  - **Mitigation:** Commencer par 1960 = victoire rapide. Chaque décennie = livrable visible. Accountability publique sur Twitter/X. Fallback : couper à 5 décennies si retard.

- **Risk:** Perte de contexte entre sessions Claude
  - **Likelihood:** Medium
  - **Mitigation:** CLAUDE.md mis à jour à chaque session. BMAD docs = source de vérité. Memory MCP pour contexte persistant. Notion comme backup central.

- **Risk:** Son bloqué sur mobile (autoplay)
  - **Likelihood:** Medium
  - **Mitigation:** Howler.js gère les politiques autoplay. Bouton "Commencer le voyage" = interaction qui débloque l'audio. L'expérience reste forte SANS le son. Indicateur visuel pour activer le son.

- **Risk:** Awwwards refuse / note basse
  - **Likelihood:** Medium
  - **Mitigation:** Objectif réaliste : Honorable Mention = victoire. Étudier les critères de notation. Le site a de la valeur SANS prix. Soumettre aussi à CSS Design Awards, The FWA, One Page Love.

- **Risk:** Scope creep
  - **Likelihood:** Low (grâce à BMAD)
  - **Mitigation:** Scope V2 verrouillé dans ce document. Tout le reste = V3. Sprint planning force le focus. Règle : "si c'est pas dans le PRD, c'est pas dans le sprint".

---

## Next Steps

1. Create Product Requirements Document (PRD) - `/bmad:prd`
2. Create Architecture Document - `/bmad:architecture`
3. Sprint Planning - `/bmad:sprint-planning`

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

*To continue: Run `/bmad:workflow-status` to see your progress and next recommended workflow.*
