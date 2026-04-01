---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
Status: Unweathered
Published: false
---
---
```bash
elryan@Pensieve:~/Downloads/dxvk-2.6.2$ sudo dpkg --add-architecture i386
elryan@Pensieve:~/Downloads/dxvk-2.6.2$ cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
NAME="Debian GNU/Linux"
VERSION_ID="12"
VERSION="12 (bookworm)"
VERSION_CODENAME=bookworm
ID=debian
HOME_URL="https://www.debian.org/"
SUPPORT_URL="https://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"
```

Great — you’re on **Debian 12 (bookworm)**, so here’s the **step-by-step guide to install the latest Wine from WineHQ**:

---

## 🧪 Step-by-Step: Install WineHQ on Debian 12 (Bookworm)

### ✅ 1. Enable 32-bit architecture (already done):

```bash
sudo dpkg --add-architecture i386
```

---

### ✅ 2. Add WineHQ repository key:

```bash
sudo mkdir -pm755 /etc/apt/keyrings
wget -O - https://dl.winehq.org/wine-builds/winehq.key | sudo gpg --dearmor -o /etc/apt/keyrings/winehq-archive.key
```

---

### ✅ 3. Add WineHQ source list for Bookworm:

```bash
sudo wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/debian/dists/bookworm/winehq-bookworm.sources
```

---

### ✅ 4. Update your package list:

```bash
sudo apt update
```

---

### ✅ 5. Install Wine (choose **one** branch):

#### Option A: Stable (recommended)

```bash
sudo apt install --install-recommends winehq-stable
```

#### Option B: Development

```bash
sudo apt install --install-recommends winehq-devel
```

#### Option C: Staging (latest features, more bleeding-edge)

```bash
sudo apt install --install-recommends winehq-staging
```

> If unsure, start with `winehq-stable`.

---

### ✅ 6. Verify Wine installation:

```bash
wine --version
```

You should see something like:

```
wine-9.0
```

---

## 🧩 Optional: Setup winetricks (extra tools)

```bash
sudo apt install winetricks
```

---

Let me know once installed — I’ll help you link Heroic’s prefix or set global DXVK overrides through Wine.