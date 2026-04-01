---
Date Created: "2025-06-04 11:29"
Last Updated: "2025-06-04 11:29"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]]

Having an issue when there are too many tabs open gnome freezes when I open the workspace selection mode (which i use quite frequently to navigate between windows with my mouse). Yes I likely need to switch over to keyboard centric operations, but I dont want to :/

Considering switching off gnome if I cant get a troubleshoot on this, perhaps hyprland on arch; but that requires me to get all of my content off my system disc as described in [[Home Directory Setup]]; likely will at some point but I also have to get work done so idk how soon. 

Will do so on my laptop first tbh. For now I just restarted the desktop, will see how long that holds and what GPT thinks.

---

# Fix:

## ✅ The Problem

When using **Wayland**, NVIDIA **requires `nvidia-drm.modeset=1`** to be set **at boot** to enable proper display initialization.

If `cat /sys/module/nvidia_drm/parameters/modeset` returns `N`, Wayland won’t use your GPU correctly — leading to **blank screens**, **flickering**, or **fallback to software rendering**.

---

## 🛠️ Fixing It: Enable DRM KMS for NVIDIA

### 1. **Set the modeset option**

```bash
echo "options nvidia-drm modeset=1" | sudo tee /etc/modprobe.d/nvidia-options.conf
```

> This enables Direct Rendering Manager (DRM) kernel mode setting (KMS) for NVIDIA.

### 2. _(Optional)_ If you’re on KDE **and NOT using hybrid graphics (Optimus)**:

```bash
echo "options nvidia NVreg_PreserveVideoMemoryAllocations=1" | sudo tee -a /etc/modprobe.d/nvidia-options.conf
```

---

### 3. **Update initramfs**

To apply the module options at boot:

```bash
sudo update-initramfs -u
```

---

### 4. **Reboot**

```bash
sudo reboot
```

---

### 5. **Verify the fix**

After reboot:

```bash
cat /sys/module/nvidia_drm/parameters/modeset
```

✅ It should return `Y`.

---

### 🧠 Why This Matters

Without `modeset=1`, NVIDIA drivers cannot expose the required KMS features for **Wayland compositors** like GNOME's `mutter` or KDE's `kwin`. This is **not needed on X11**, but critical for **Wayland** support.

---

Let me know what it shows after reboot, and if your display issues are resolved. If not, I can help you force X11 as a temporary fallback or double-check GDM config.

---
---

## Still running into issues
was looking into [[GNOME 47 Unstable Installation]] to fix, apparently I'm on GNOME 43.... Gonna try updating all dependencies first though. I.e. mutter... I also re-installed GNOME so :shrug:

---

Thanks — here's what's going on:

- **Mutter is not currently installed** on your system (`Installed: (none)`).
    
- The latest available version in **Debian 12 (bookworm)** is: `43.8-0+deb12u1`.
    

That’s the **official stable version**, and it's the one GNOME 43 is built on.

---

### 🛠️ To install Mutter from stable:

```bash
sudo apt install mutter
```

This will install `mutter` from the stable (bookworm) repo.

> ⚠️ But heads up: If you already have GNOME installed, it may have `mutter` as a dependency or include its own matching version. You might’ve removed it accidentally, or are using a mismatched GNOME install.

If you want to confirm what's depending on it, run:

```bash
apt rdepends mutter
```

Let me know if you want to:

- Stick to the stable `43.8` version, or
    
- Upgrade GNOME (which will require installing a newer `mutter` from `unstable`)
    

Happy to walk you through either.

Nice — `mutter` is now installed (`43.8-0+deb12u1`), and from what your output shows:

### 🔁 Reverse Dependencies of `mutter`:

- `libmutter-test-11` and `mutter-11-tests` (testing tools)
    
- It **breaks** `gsettings-desktop-schemas` if that package is older than version `3.31.4`
    

So this means:

- The core GNOME desktop likely uses Mutter through a more specific package like `gnome-shell` or `gnome-session`, and **you've just installed Mutter standalone**, which may help stability or diagnostics but won’t directly upgrade GNOME behavior unless the shell uses this version.
    

---

### ✅ Next Steps to Try

Since you were freezing inside the Activities Overview (`Super` key), let’s see if reinstalling or resetting `gnome-shell` might help Mutter take full effect:

```bash
sudo apt install --reinstall gnome-shell
```

Then log out and back in (or reboot).

---

### 🔍 Want to go deeper?

If this still doesn't fix your issue, we can:

1. Check your **GNOME Shell version**:
    
    ```bash
    gnome-shell --version
    ```
    
2. Try **`journalctl` logs filtered by gnome-shell or mutter**:
    
    ```bash
    journalctl --user-unit=gnome-shell -b | grep -iE "mutter|error|fail|gpu"
    ```
    

Just let me know what you see, and we can narrow it down further.

---
---

## Havent run yet but if needed:

To stabilize or modernize GNOME's **window management stack** and fix freezes like what you're experiencing, you’ll want to **verify and optionally reinstall/update these core dependencies**, especially around `mutter`, `gnome-shell`, and the GPU stack (NVIDIA, Wayland, etc.).

---

## 🔧 Core GNOME + Mutter Stack

### 🧠 Core GNOME Shell Components

|Package|Purpose|Check|
|---|---|---|
|`gnome-shell`|The GNOME UI shell (relies on Mutter)|✅ `--reinstall` or `-t unstable` to upgrade|
|`mutter`|Window/compositor manager for Wayland/X11|✅ Already installed|
|`gjs`|JavaScript bindings for GNOME shell extensions|`apt install --reinstall gjs`|
|`gnome-session`|Launches and manages the session|`apt install --reinstall gnome-session`|
|`gnome-control-center`|GNOME's settings UI (often broken with bad deps)|`apt install --reinstall gnome-control-center`|
|`gnome-settings-daemon`|Applies themes, input config, etc.|`apt install --reinstall gnome-settings-daemon`|
|`gsettings-desktop-schemas`|Provides system defaults|`apt install --reinstall gsettings-desktop-schemas`|

---

## 🎮 NVIDIA, Wayland, and Graphics Stack

### 🧱 Display Backend & Drivers

|Package|Purpose|Check|
|---|---|---|
|`nvidia-driver` or `nvidia-kernel-dkms`|Proprietary NVIDIA driver|Make sure you're on the latest version compatible with Debian 12|
|`libnvidia-egl-wayland1`|EGL support on Wayland|`apt install libnvidia-egl-wayland1`|
|`libwayland-client0`, `libwayland-server0`|Core Wayland libs|`apt install --reinstall libwayland-client0 libwayland-server0`|
|`xwayland`|X11 compatibility in Wayland|`apt install --reinstall xwayland`|

---

## 📦 Suggested Meta Command

Here’s a bundle command to run safely without pulling in unstable:

```bash
sudo apt install --reinstall \
  gnome-shell \
  gnome-session \
  gjs \
  gnome-control-center \
  gnome-settings-daemon \
  gsettings-desktop-schemas \
  libnvidia-egl-wayland1 \
  libwayland-client0 \
  libwayland-server0 \
  xwayland
```

If any are **missing**, this will install them. If they’re broken, it’ll fix them.

---

## 📈 Optional Diagnostic Tools

If you want to track GPU/Wayland interactions in real time:

```bash
journalctl -f | grep -iE "gnome|mutter|wayland|nvidia"
```

Let me know if you want to selectively upgrade any of these from backports or unstable (e.g. GNOME 47/48 components).