---
Date Created: "2025-06-04 13:32"
Last Updated: "2025-06-04 13:32"
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

Virtual environment manager. Alternative to [[poetry]]

---

## 🛠️ Log Entry: Setting Up `pipenv` for Project Dependency Management

**📅 Date:** `2025-06-04`  
**🔧 Purpose:** Isolated dependency and environment management for Python projects  
**📁 Scope:** Per-project environment setup using `pipenv`

---

### ✅ Step 1: Install `pipenv` (if not already installed)

```bash
pip install --user pipenv
```

- Alternatively, use `brew install pipenv` (macOS) or `sudo apt install pipenv` (Linux)
    
- Confirm installation:
    

```bash
pipenv --version
```

---

### ✅ Step 2: Initialize a Project Environment

Navigate to the root of your project:

```bash
mkdir my-project && cd my-project
pipenv install
```

- This creates a `Pipfile` and sets up a new virtual environment.
    
- You can also immediately install a package:
    

```bash
pipenv install requests
```

- Add dev dependencies like so:
    

```bash
pipenv install --dev black
```

---

### ✅ Step 3: Activating the Virtual Environment

**Method A: Launch a subshell inside the environment**

```bash
pipenv shell
```

- This activates the virtualenv and gives you an isolated shell.
    
- Deactivate with `exit` or `Ctrl+D`.
    

**Method B: Run a command in the environment without entering**

```bash
pipenv run python script.py
```

---

### ✅ Step 4: Verifying the Setup

- Check your environment:
    

```bash
pipenv --venv
```

- View dependencies:
    

```bash
pipenv graph
```

- Lock dependencies:
    

```bash
pipenv lock
```

---

### 🧠 Notes

- Virtual environments are stored outside the project folder.
    
- Reproducibility is ensured via `Pipfile.lock`.
    
- Version control: commit `Pipfile` and `Pipfile.lock`, but **not** the virtual environment folder.
    

---
