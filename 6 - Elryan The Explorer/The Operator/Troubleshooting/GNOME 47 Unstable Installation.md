---
Date Created: 2025-06-20 10:44
Last Updated: 2025-06-20 10:44
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
Author: 
Link: https://www.atulhost.com/how-to-install-the-latest-gnome-on-debian
Status: Unweathered
Published: false
---
---

https://www.atulhost.com/how-to-install-the-latest-gnome-on-debian

---

# 🐧 How to Install the Latest GNOME on Debian (With Auto-Upgrade)

**Published:** October 20, 2024  
**Author:** _Atul Kumar Pandey_  
**Tags:** `Debian`, `GNOME`, `Linux`, `Unstable`, `Neofetch`, `Screenfetch`

---

## ⚙️ Why Upgrade GNOME on Debian?

Debian prioritizes **stability**, not the latest features. Desktop users may want newer GNOME versions for improved UX. Here’s how to **only upgrade GNOME** to the unstable version **without switching your entire system to unstable**.

---

## 📋 Prerequisite: Update System

```bash
sudo apt update && sudo apt upgrade
```

If you don’t have GNOME installed yet (e.g., on a minimal install), run:

```bash
sudo tasksel
```

Select and install **GNOME Desktop Environment**.

---

## 📥 Add the Unstable Repository

Edit your APT sources:

```bash
sudo nano /etc/apt/sources.list
```

Add the following lines **at the bottom**:

```
deb http://deb.debian.org/debian/ unstable main contrib
deb-src http://deb.debian.org/debian/ unstable main contrib
```

Save with `Ctrl+O`, then `Enter`, and exit with `Ctrl+X`.

---

## ⚠️ Adjust APT Pinning

Prevent your system from fully switching to unstable by configuring APT priorities.

```bash
sudo nano /etc/apt/preferences
```

Paste the following:

```ini
# STABLE - BOOKWORM
Package: *
Pin: release a=bookworm
Pin-Priority: 500

# UNSTABLE - SID
Package: *
Pin: release a=unstable
Pin-Priority: 100

# GNOME AUTO-UPGRADE FROM UNSTABLE - SID
Package: gnome-session
Pin: release a=unstable
Pin-Priority: 1000

Package: gnome-backgrounds
Pin: release a=unstable
Pin-Priority: 1000

Package: gnome-applets
Pin: release a=unstable
Pin-Priority: 1000

Package: gnome-control-center
Pin: release a=unstable
Pin-Priority: 1000

Package: mutter
Pin: release a=unstable
Pin-Priority: 1000

Package: gjs
Pin: release a=unstable
Pin-Priority: 1000
```

Save and close the file.

---

## 🔄 Sync Repositories

```bash
sudo apt update
```

---

## 🚀 Install Latest GNOME Components

```bash
sudo apt -t unstable install gnome-session gnome-shell gnome-backgrounds gnome-applets gnome-control-center mutter gjs
```

When prompted during install:

- Press `q` to skip update notes
    
- Choose `Yes` when asked to restart services
    

Once complete, **reboot** your system.

---

## ✅ Confirm GNOME Upgrade

Use a tool like:

```bash
neofetch
```

Or:

```bash
screenfetch
```

---

## 🎁 Bonus Tip

You can now install or upgrade **any package** from unstable using:

```bash
sudo apt -t unstable install <package-name>
```

For example:

```bash
sudo apt -t unstable install gnome-tweaks
```

---

## 🗨 Common Issues

### ❗ Packages Held Back

```text
The following packages have been kept back:
gir1.2-pango-1.0 libpango-1.0-0 ...
```

This usually happens when dependencies (e.g., `libfontconfig1`) aren’t available in a compatible version. Wait until they appear in the unstable repo or install all related packages from unstable too.

---

### 😴 Sleep/Wake Broken?

Try upgrading power management packages:

```bash
sudo apt -t unstable install power-profiles-daemon
```

Also check your BIOS, GNOME settings, or power management configuration.

---

## 👤 About the Author

**Atul Kumar Pandey**  
Management graduate, tech blogger, and founder of [AtulHost](https://www.atulhost.com/). Passionate about Linux and technology exploration.
