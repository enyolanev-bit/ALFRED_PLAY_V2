# 10X Engineer Playbook — Nevil

## Routine d'ouverture de session (5 étapes)
1. Ouvrir PowerShell → cd vers le projet → `claude`
2. Vérifier le statut : `/bmad:workflow-status`
3. Activer Plan Mode : Shift+Tab x2 (planifier AVANT de coder)
4. Définir l'objectif de la session en 1 phrase
5. Lancer la commande BMAD ou la tâche du sprint en cours

## Routine de fermeture (3 étapes)
1. `git add -A && git commit -m "description claire"`
2. "Mets à jour CLAUDE.md avec les leçons apprises de cette session"
3. `exit` pour fermer proprement

## Règles d'or
- **Boris Cherny** : Plan Mode TOUJOURS en premier. Itérer le plan, PUIS implémenter.
- **Boris Cherny** : "Mets à jour ton CLAUDE.md pour ne plus refaire cette erreur"
- **CJ Hess** : Model vs Model — Claude construit, un autre modèle critique
- **Parth Patil** : 2x par semaine, trouve un truc qu'un LLM peut faire et applique-le
- **Règle Nevil** : 1 seul chef en cuisine. Claude Code = constructeur principal.

## Mon Arsenal
| Outil | Rôle | Scope |
|-------|------|-------|
| Claude Code + Opus 4.6 | Moteur principal | Tout |
| BMAD | Structure projet (Brief→PRD→Archi→Sprint) | Par projet |
| Superpowers | Structure chaque session de code | Global |
| ui-ux-pro-max | Design system automatique | Global |
| Blender MCP | Pipeline 3D | Par projet |
| Git | Sauvegarde après CHAQUE étape | Tout |

## Anti-patterns (à éviter)
- Ne JAMAIS coder sans plan
- Ne JAMAIS oublier le git commit
- Ne JAMAIS jongler entre 5 outils IA — maîtriser UN setup
- Ne JAMAIS commencer un projet sans Product Brief BMAD
- Ne JAMAIS ignorer les tests mobile pour un projet web
