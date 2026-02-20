# 🏗️ MASTER SETUP — Nevil's 10X Engineer Station

> **Objectif** : Recréer mon environnement complet en 10 minutes sur n'importe quel nouveau projet.
> **Dernière mise à jour** : 20 février 2026
> **Version** : 1.0

---

## 📋 Pré-requis système

| Outil | Version | Installation |
|-------|---------|-------------|
| Windows 11 | — | Déjà installé |
| Node.js | v20+ LTS | `winget install OpenJS.NodeJS.LTS` |
| Git | Latest | `winget install Git.Git` |
| Python | 3.12+ | `winget install Python.Python.3.12` |
| Cursor | Latest | https://cursor.com → Download |
| Blender | 4.x | https://blender.org → Download |
| Claude Code CLI | Latest | `npm install -g @anthropic-ai/claude-code` |

---

## 🔐 Comptes & Abonnements

| Service | Plan | Pourquoi |
|---------|------|----------|
| **Anthropic (Claude)** | Max (Opus 4.6) | Moteur principal — cerveau de tout |
| **GitHub** | Free + Token | Versionning + plugins Claude Code |
| **Vercel** | Free | Déploiement preview auto |
| **Notion** | Free | Documentation & wikis |

### Créer le GitHub Token (si nouveau PC)
1. GitHub.com → Settings → Developer settings → Personal access tokens → Fine-grained
2. Nom : `claude-code-YYYY`
3. Permissions : `Contents (Read/Write)`, `Pull requests (Read/Write)`
4. Copier le token → le garder en sécurité

---

## 🧠 Claude Code — Plugins & Skills

### Étape 1 : Installer Claude Code
```powershell
npm install -g @anthropic-ai/claude-code
claude  # première connexion → authentification navigateur
```

### Étape 2 : Plugins globaux (scope: user)

**BMAD Method** — Structure projet (Brief → PRD → Archi → Sprint)
```
/plugin marketplace add nicholaskemery/bmad-claude-code
/plugin install bmad-claude-code@bmad-claude-code --scope user
```

**Superpowers** — Structure chaque session de code
```
/plugin marketplace add punkpeye/superpower
/plugin install superpower@superpower --scope user
```

**ui-ux-pro-max** — Design system automatique
```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill --scope user
```

### Étape 3 : Skills manuelles (cloner dans ~/.claude/skills/)

**Three.js Skills** — Knowledge base 3D pour Claude Code
```powershell
git clone https://github.com/CloudAI-X/threejs-skills.git ~/.claude/skills/threejs-skills
```

### Étape 4 : Fix Git SSH → HTTPS (si erreurs SSH)
```powershell
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

### Vérification
```
claude
/plugin list    # Doit montrer: bmad, superpower, ui-ux-pro-max
```

---

## 🔌 Cursor — Extensions & MCP Servers

### Extensions Cursor à installer
1. `Ctrl+Shift+X` dans Cursor
2. Chercher et installer :
   - **Claude Code** (Anthropic) — terminal intégré
   - **Blender MCP** — pipeline 3D
   - **Context7** — documentation à jour

### MCP Servers (fichier .cursor/mcp.json dans chaque projet)
```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "TON_TOKEN_ICI"
      }
    }
  }
}
```

### Claude Desktop — MCP Servers (claude_desktop_config.json)
Chemin Windows : `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer TON_TOKEN_NOTION\",\"Notion-Version\":\"2022-06-28\"}"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "TON_TOKEN_ICI"
      }
    }
  }
}
```

---

## 📁 Structure de projet standard (BMAD)

```
mon-projet/
├── .claude/
│   └── skills/          # Skills locales au projet (si besoin)
├── .cursor/
│   └── mcp.json         # Config MCP pour ce projet
├── docs/
│   ├── product-brief-*.md
│   ├── prd-*.md
│   ├── architecture-*.md
│   ├── sprint-plan-*.md
│   └── 10x-engineer-playbook.md
├── .bmad/
│   └── sprint-status.yaml
├── CLAUDE.md            # Instructions pour Claude Code (self-improving)
├── package.json
└── README.md
```

---

## 🚀 Workflow — Nouveau Projet de A à Z

### Phase 0 : Init (5 min)
```powershell
mkdir mon-projet && cd mon-projet
git init
claude
```

### Phase 1 : BMAD Discovery
```
/bmad:product-brief     # Répondre aux 11 sections
git add -A && git commit -m "docs: product brief complete"
```

### Phase 2 : BMAD PRD
```
/bmad:prd               # Générer FRs, NFRs, Epics
git add -A && git commit -m "docs: PRD complete"
```

### Phase 3 : BMAD Architecture
```
/bmad:architecture      # Document technique complet
git add -A && git commit -m "docs: architecture complete"
```

### Phase 4 : BMAD Sprint Planning
```
/bmad:sprint-planning   # Stories, points, sprints
git add -A && git commit -m "docs: sprint plan complete"
```

### Phase 5 : Implémentation
```
/bmad:dev-story STORY-001   # Sprint 1, Story 1
# Coder → tester → commit → repeat
```

---

## 🎯 Routine Quotidienne (10X Playbook)

### Ouverture de session (2 min)
1. PowerShell → `cd mon-projet` → `claude`
2. `/bmad:workflow-status`
3. **Shift+Tab x2** (Plan Mode — planifier AVANT de coder)
4. Définir objectif de la session en 1 phrase
5. Lancer la commande BMAD ou tâche du sprint

### Fermeture de session (1 min)
1. `git add -A && git commit -m "description claire"`
2. "Mets à jour CLAUDE.md avec les leçons apprises"
3. `exit`

---

## ⚔️ Règles d'Or

| Règle | Source |
|-------|--------|
| Plan Mode TOUJOURS en premier. Itérer le plan, PUIS implémenter | Boris Cherny |
| "Mets à jour ton CLAUDE.md pour ne plus refaire cette erreur" | Boris Cherny |
| Model vs Model — Claude construit, un autre modèle critique | CJ Hess |
| 2x par semaine, trouve un truc qu'un LLM peut faire et applique-le | Parth Patil |
| 1 seul chef en cuisine. Claude Code = constructeur principal | Règle Nevil |

---

## 🛡️ Anti-patterns (JAMAIS faire ça)

- ❌ Coder sans plan
- ❌ Oublier le git commit après chaque étape
- ❌ Jongler entre 5 outils IA — maîtriser UN setup
- ❌ Commencer un projet sans Product Brief BMAD
- ❌ Ignorer les tests mobile pour un projet web
- ❌ Modifier CLAUDE.md à la main sans leçon apprise
- ❌ Installer un outil sans le documenter ici

---

## 🎮 Setup spécifique par type de projet

### Projet Web 3D (comme ALFRED_PLAY V2)
- Stack : Astro + Three.js + GSAP + Lenis
- Skills : threejs-skills, ui-ux-pro-max
- MCP : Blender, Context7
- Contrainte : Mobile 60 FPS, < 5000 triangles/scène

### Projet Game Boy (GB Studio)
- Outil : GB Studio
- Contrainte : 160x144px, 4 couleurs, 8 sprites/ligne
- Claude Code aide pour : scripts, level design logic, assets

### Projet RAG/LangChain (Dental Business)
- Stack : Python + LangChain + ChromaDB
- Sources : Manuels Euronda, Melag, Sirona (PDF)
- MCP : Context7 (pour docs LangChain)
- Déploiement : API locale ou cloud

### Projet Blender 3D
- MCP : Blender MCP (22 tools)
- Pipeline : Blender → export glTF → Three.js
- Contrainte : Low-poly, < 500KB par modèle

---

## 📊 Mon Arsenal Complet

| Outil | Rôle | Scope | Statut |
|-------|------|-------|--------|
| Claude Code + Opus 4.6 | Moteur principal | Tout | ✅ |
| BMAD | Structure projet | Global plugin | ✅ |
| Superpowers | Structure sessions | Global plugin | ✅ |
| ui-ux-pro-max | Design system | Global plugin | ✅ |
| threejs-skills | Knowledge 3D | ~/.claude/skills | ✅ |
| Blender MCP | Pipeline 3D | Cursor MCP | ✅ |
| Context7 | Docs à jour | Cursor + Desktop MCP | ✅ |
| GitHub MCP | Versionning IA | Cursor + Desktop MCP | ✅ |
| Notion MCP | Documentation | Desktop MCP | ✅ |
| Git | Sauvegarde | Tout | ✅ |
| Cursor | IDE principal | Local | ✅ |
| Vercel | Déploiement | Cloud | ✅ |

---

## 🔄 Maintenance de ce document

- **Quand mettre à jour** : À chaque nouvel outil installé, leçon apprise, ou changement de setup
- **Où le stocker** : Dans chaque projet (`docs/master-setup.md`) + copie dans Notion
- **Commande** : "Mets à jour le master-setup avec [nouvel outil/leçon]"

---

*"Le meilleur ingénieur n'est pas celui qui code le plus vite, c'est celui qui ne refait jamais deux fois la même erreur."* — Nevil, 2026
