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
### `🧠 SYSTEM - Swapfile Expansion on Linux`

#### 📝 **Context**

While attempting to launch a game via Heroic/Proton/DXVK, an error was thrown:

> `A D3D11-compatible GPU (Feature Level 11.0, Shader Model 5.0) is required to run the engine.`

Some Windows users fix this by increasing **virtual memory** (swap), especially when running games with limited physical RAM or GPU driver instability. Linux can hit similar memory walls. This vault logs how I added 8 GiB of swap on Debian 12.

---

#### ⚙️ **Objective**

Increase virtual memory by adding a secondary swapfile to support DXVK and mitigate memory-related crashes.

---

#### 🧩 **System Info**

- OS: Debian 12
    
- RAM: 32 GiB
    
- Default swap: 2.9 GiB on `/dev/nvme1n1p7`
    

---

#### 🛠️ **Steps**

1. **Create an 8 GiB swapfile**
    
    ```bash
    sudo fallocate -l 8G /swapfile2
    ```
    
2. **Secure file permissions**
    
    ```bash
    sudo chmod 600 /swapfile2
    ```
    
3. **Format the file as swap**
    
    ```bash
    sudo mkswap /swapfile2
    ```
    
4. **Activate the swapfile**
    
    ```bash
    sudo swapon /swapfile2
    ```
    
5. **Verify activation**
    
    ```bash
    swapon --show
    ```
    
    ✅ Expected output:
    
    ```
    NAME           TYPE      SIZE USED PRIO
    /dev/nvme1n1p7 partition 2.9G   0B   -2
    /swapfile2     file        8G   0B   -3
    ```
    
6. **(Optional) Add to `/etc/fstab` for persistence**
    
    ```
    /swapfile2 none swap sw 0 0
    ```
    

---

#### ❓ **Why This Matters**

- Games via Proton often crash without enough memory or swap (especially DXVK).
    
- Vulkan's pipeline caching + shader compilation can spike RAM usage.
    
- Linux OOM behavior is aggressive without sufficient swap.
    
- Increasing swap improves stability and reduces crashes on borderline setups.
    

---

#### 🔮 **Future Notes**

- Consider tuning `vm.swappiness`:
    
    ```bash
    sudo sysctl vm.swappiness=10
    ```
    
- Monitor usage with:
    
    ```bash
    watch -n 1 free -h
    ```
    

---

Let me know if you'd like to link this to your system optimization notes or create a matching `.desktop` launcher note for Heroic titles.