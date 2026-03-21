# Workflow — één repo, één plek

Dit project werkt het prettigst als je **overal dezelfde map** gebruikt.

## Canonieke clone (gebruik deze)

| | |
|---|---|
| **Pad** | `~/theater-dashboard` → `/Users/werk/theater-dashboard` |
| **Branch** | `main` (dagelijks werk) |
| **Remote** | `origin` = `https://github.com/Deurklink-WT/theater-dashboard.git` |

### Cursor / VS Code

- **File → Open Folder** → kies **`theater-dashboard`** (de map hierboven).
- **Niet** werken in losse Cursor-worktrees onder `.cursor/worktrees/` — die veroorzaakten verwarring (losgekoppelde HEAD, oude commits); die zijn opgeruimd.

### Voor je begint

```bash
cd ~/theater-dashboard
git status
git pull origin main
```

### Na wijzigingen

```bash
git add -A
git commit -m "korte omschrijving"
git push origin main
```

*(Als branch protection vereist: PR-branch maken en PR mergen — zelfde map, andere branch.)*

### Build (macOS)

```bash
npm install
npm test
npm run build:mac
```

Artefacten: `dist/` (lokaal; niet committen).

### Optionele oude worktrees

Onder **`.claude/worktrees/`** kunnen nog experimentele branches staan. Gebruik die alleen als je weet waarom; anders: **`main` in `~/theater-dashboard`**.

---

*Laatst georganiseerd om dubbele/kapotte worktrees te voorkomen.*
