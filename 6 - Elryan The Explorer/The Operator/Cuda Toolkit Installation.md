---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
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

```bash
sudo apt install nvidia-cuda-toolkit
```

---

Didnt have enough space...

### ⚙️ Long-Term Fixes

- If your `/` partition is under ~20 GB, consider resizing or reinstalling with more space allocated to `/`
    
- Mount heavy folders like `/var/cache`, `/var/lib/docker`, or `/opt` on a separate partition
    
- Keep Flatpak and Snap apps on separate partitions if you're using a lot of them

---

### 📊 Summary of Relevant Partitions:

|Mount Point|Partition|Use Case|Size Left|Notes|
|---|---|---|---|---|
|`/`|`nvme1n1p5`|System root|**8.6 GB**|Reasonable, don’t stuff big apps here|
|`/var`|`nvme1n1p6`|Package cache, logs, apt|**1.9 GB**|🚨 Only **~500 MB** free — this is your issue|
|`/tmp`|`nvme1n1p8`|Temp files|1.7 GB|Could be used for temp extraction if needed|
|`/home`|`nvme1n1p9`|User data|**81 GB**|✅ The best place to offload large installs|

---

### 🔧 Fix Strategy (Keep It On-System)

We’ll trick APT into **caching and installing from `/home`**, but still install everything _to system paths_.

---

### 🧠 Step-by-Step: Redirect APT Cache Temporarily

1. **Make a temp cache folder in your home dir**:
    

```bash
mkdir -p ~/apt-alt-cache
```

2. **Run APT using that cache**:
    

```bash
sudo apt -o dir::cache::archives="$HOME/apt-alt-cache" install nvidia-cuda-toolkit
```

This keeps `/var` from filling up and still installs everything normally.

---

### 🧹 Optional: Clear Journals and Clean Logs

To free even more space in `/var`:

```bash
sudo journalctl --vacuum-time=2d
sudo apt clean
sudo apt autoremove --purge
```

If you’re super tight:

```bash
sudo du -sh /var/cache/*
```

Then manually `rm -rf` anything you don’t need.

---

### 🚀 After Install

Once it's installed, you can safely delete the custom APT cache:

```bash
rm -rf ~/apt-alt-cache
```

Let me know if you want to move `/var` to a bigger partition in the future — but for now, this will get Resolve CUDA-ready without breaking your setup.