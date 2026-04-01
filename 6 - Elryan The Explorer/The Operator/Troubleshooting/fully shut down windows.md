---
Date Created: "2025-06-04 11:54"
Last Updated: "2025-06-04 11:54"
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



### ⚠️ What's happening?

Your NTFS disk still has **"fast startup" or hibernation metadata** from Windows. Linux sees this and **refuses to write**, to avoid corrupting the filesystem.

---

## ✅ To Fix: Fully Shut Down Windows

If you **dual boot** or ever accessed the disk from Windows, do this:

### 🔧 Step-by-step:

1. **Boot into Windows** (if installed on another drive).
    
2. Run in Command Prompt **as Administrator**:
    
    ```bash
    powercfg /h off
    ```
    
    This disables **hibernation** and removes the hidden `hiberfil.sys` file.
    
3. Then do a **full shutdown**, not just a restart:
    
    - Either:
        
        ```bash
        shutdown /s /f /t 0
        ```
        
    - Or: Hold `Shift` while clicking **Shutdown** from the Start menu.
        

---

## ✅ Alternative (if you can't access Windows):

If you no longer have Windows:

You can **force-clear the hibernation flag** (⚠️ dangerous — risk of data loss if Windows was hibernated):

```bash
sudo ntfsfix /dev/nvme0n1p2
```

Then try:

```bash
sudo mount -t ntfs-3g -o rw,uid=1000,gid=1000,umask=022 /dev/nvme0n1p2 /mnt/secondary
```

> ⚠️ **Only do this if you're sure** Windows isn't going to boot again with this disk. Otherwise, it may cause filesystem corruption.

---

## 🧠 TL;DR

|✅ You want to...|🛠 Solution|
|---|---|
|Mount NTFS read-write safely|Fully shut down Windows after disabling Fast Startup and Hibernation|
|Can't access Windows anymore|Use `ntfsfix` (with caution) to clear dirty bit|

---

Let me know which route you’re taking and I’ll walk you through the next step — e.g. fstab line or safe backups before `ntfsfix`.