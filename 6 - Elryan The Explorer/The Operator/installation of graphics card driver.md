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
https://linuxconfig.org/how-to-install-nvidia-driver-on-debian-12-bookworm-linux

Far safer and more maintainable than using the `.run` file directly, do the following. Debian’s `nvidia-driver` package wraps the proprietary driver in a way that integrates better with the system (updates, DKMS, kernel modules, etc.).

Here’s a clean, **step-by-step version for Debian 12 ("bookworm")**:

---

## ✅ RECOMMENDED: Install NVIDIA Driver via Debian Repositories

### 1. **Enable non-free and contrib repositories**

Open the sources list:

```bash
sudo nano /etc/apt/sources.list
```

Look for lines like this:

```
deb http://deb.debian.org/debian bookworm main
```

Change them to include `contrib non-free non-free-firmware`, like:

```
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware

deb http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb-src http://security.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware

deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

---

### 2. **Update package lists**

```bash
sudo apt update
```

---

### 3. **Install `nvidia-detect` (to identify driver compatibility)**

```bash
sudo apt install nvidia-detect
nvidia-detect
```

You’ll likely see:

```
It is recommended to install the nvidia-driver package.
```

---

### 4. **Install NVIDIA driver**

```bash
sudo apt install nvidia-driver
```

This will also install dependencies like `dkms`, `nvidia-kernel-dkms`, `libnvidia-gl`, and `nvidia-smi`.

---

### 5. **Reboot**

```bash
sudo reboot
```

---

### 6. **Verify**

After reboot, run:

```bash
nvidia-smi
```

You should see a table showing GPU details, driver version, etc.

---

## 🔁 Future Proofing

This method uses `dkms`, which **automatically rebuilds the NVIDIA kernel module on kernel updates** — much easier to maintain than `.run` installations.

---

Let me know if you want to install CUDA or use the driver with Flatpak/Steam/OBS, and I’ll guide you further.

[[Cuda Toolkit Installation]]