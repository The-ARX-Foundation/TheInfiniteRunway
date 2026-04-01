---
Date Created: "2025-06-04 13:32"
Last Updated: "2026-03-21 04:31"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Programming]]"
  - "[[Python]]"
Status: Unweathered
Published: false
---
---

Virtual environment manager. Alternative to [[pipenv]]

---

## 🛠️ Log Entry: Setting Up `poetry` for Project Dependency Management

**📅 Date:** `2025-06-04`  
**🔧 Purpose:** Isolated dependency and environment management with modern packaging support  
**📁 Scope:** Per-project environment setup using `poetry`

---

### ✅ Step 1: Install `poetry` (One-Time Setup)

**Recommended: Use the official installer**

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

- Confirm install:
    

```bash
poetry --version
```

- Add Poetry to PATH if needed:
    

```bash
export PATH="$HOME/.local/bin:$PATH"
```

---

### ✅ Step 2: Initialize a New Project

```bash
mkdir my-project && cd my-project
poetry init
```

- Follow the prompts or auto-accept defaults with:
    

```bash
poetry init --no-interaction
```

- Then install a package:
    

```bash
poetry add requests
```

- Add dev dependencies:
    

```bash
poetry add --group dev black
```

---

### ✅ Step 3: Activating the Virtual Environment

**Option A: Start a shell inside the env**

```bash
poetry shell
```

- Use `exit` or `Ctrl+D` to leave.
    

**Option B: Run commands directly**

```bash
poetry run python script.py
```

---

### ✅ Step 4: Verifying the Setup

- Check environment location:
    

```bash
poetry env info
```

- View installed packages:
    

```bash
poetry show --tree
```

- Lock dependencies for reproducibility:
    

```bash
poetry lock
```

---

### 🧠 Notes

- `pyproject.toml` is the core config file; it's the new standard (PEP 518).
    
- Lockfile = `poetry.lock`, used for deterministic builds.
    
- No need for manual `venv` management—`poetry` handles everything automatically.
    
- Works well for packaging and publishing Python libraries too.
    

---

Let me know if you want a combined table or flowchart comparing [[pipenv]] vs Poetry for your notes.