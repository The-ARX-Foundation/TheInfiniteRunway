---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
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
## 🧠 Summary of the Issue

You're trying to use [`uv`](https://astral.sh/blog/uv-the-python-package-manager/) to create a Python 3.12 virtual environment for your project `Second-Me`, but:

1. **`uv` was installed but not immediately usable**, because its path (`~/.local/bin`) isn't in your shell’s `PATH`.
    
2. Then you fell back to `pipenv`, which worked — but it defaulted to Python **3.11.2**, which your project doesn’t support.
    
3. When you ran `make setup`, the script correctly failed with:
    
    > `[ERROR] python version 3.11.2 is not supported, please install python 3.12 or higher`
    

---

## ✅ Fix Steps

### 1. **Add `uv` to your path so you can use it**

Run this:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Then confirm `uv` is available:

```bash
uv --version
```

---

### 2. **Install Python 3.12 (if not already installed)**

You can install Python 3.12 via `pyenv` or system package manager. Here's the quick `pyenv` route:

```bash
curl https://pyenv.run | bash
# Then add to .bashrc or .zshrc:
echo -e '\nexport PATH="$HOME/.pyenv/bin:$PATH"\neval "$(pyenv init --path)"\neval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
source ~/.bashrc

# Install Python 3.12
pyenv install 3.12.3
pyenv global 3.12.3
```

Then verify:

```bash
python --version
```

---

### 3. **Use `uv` to create the correct venv**

Once `python3.12` is available:

```bash
uv venv --python 3.12
source .venv/bin/activate
make setup
```

---

### ✅ Alternate Quick Fix

If you don't want to deal with `uv` yet, you can directly tell `[[pipenv]]` to use Python 3.12:

```bash
pipenv --python 3.12
pipenv shell
make setup
```

---

Let me know if you want help installing Python 3.12 via `apt`, `pyenv`, or from source.

***error lmao***

You're **almost** there — Python 3.12.3 _did build_, but key system libraries were **missing**, so it failed to compile critical modules like `_ssl`, `_ctypes`, and `readline`.

---

## 🧰 Solution: Install Missing Dev Packages (for Debian/Ubuntu)

Before retrying `pyenv install`, run:

```bash
sudo apt update
sudo apt install -y \
  make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
  libffi-dev liblzma-dev
```

Then **clean up** and retry:

```bash
pyenv uninstall 3.12.3
pyenv install 3.12.3
pyenv global 3.12.3
```

---

## ✅ After Install

Check it's working:

```bash
python --version  # should say 3.12.3
```

Then run:

```bash
uv venv --python 3.12
source .venv/bin/activate
make setup
```

---

Let me know if you want to automate the `.bashrc` edits or handle this via Docker for better reproducibility!