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
- https://github.com/mikeroyal/PipeWire-Guide#getting-started-with-pipewire
	- Crazy stuff, cool audio effects too, need to learn the in-depth to see if can do cool shit whilst recording.

https://github.com/mikeroyal/PipeWire-Guide#installing-pipewire-for-debian

Since you're on **Debian 12**, **PipeWire should already be installed and used by default** — but sometimes the PulseAudio compatibility layer (`pipewire-pulse`) isn't active, or something got misconfigured after NVIDIA install. Here's a streamlined way to **set up and verify PipeWire with pulseaudio emulation** (which affects sound, not your screen — but we'll get to that).

---

## 🔧 Check if PipeWire is already running

```bash
systemctl --user status pipewire
```

If it’s running, you're halfway there. Check pulseaudio compatibility:

```bash
pactl info | grep '^Server Name'
```

If you **don’t see `PulseAudio (on PipeWire)`**, continue below.

---

## ✅ Full PipeWire + Pulse Compatibility Setup (Debian 12)

### 1. **Install PipeWire components**

```bash
sudo apt install pipewire pipewire-audio-client-libraries libspa-0.2-bluetooth
```

### 2. **Enable the PulseAudio replacement layer**

```bash
sudo apt install pipewire-pulse
```

This package links `pulseaudio` to `pipewire` internally.

---

### 3. **Enable services for your user**

```bash
systemctl --user daemon-reexec
systemctl --user --now disable pulseaudio.service pulseaudio.socket
systemctl --user --now enable pipewire pipewire-pulse
```

Optional but good:

```bash
systemctl --user mask pulseaudio
```

---

### 4. **Reboot**

```bash
reboot
```

After reboot, confirm:

```bash
pactl info | grep '^Server Name'
# Should show: PulseAudio (on PipeWire ...)
```

---

## 🖥️ No Screen Issue? That’s Likely X/Wayland or NVIDIA Conflict

If you're booting into a **black screen or stuck on blank display**, the issue is probably **not PipeWire**, but one of these:

### 🔍 Check:

1. **Does Ctrl+Alt+F3 work?** Can you log in via TTY?
    
    - If yes: graphical environment may be misconfigured.
        
    - Try:
        
        ```bash
        sudo systemctl restart gdm
        # or sddm or lightdm depending on your setup
        ```
        
2. **Check NVIDIA driver status:**
    
    ```bash
    nvidia-smi
    ```
    
3. **See if X is trying to use the wrong driver:**  
    Create or check `/etc/X11/xorg.conf.d/20-nvidia.conf` with this content:
    
    ```bash
    Section "Device"
        Identifier "Nvidia Card"
        Driver "nvidia"
    EndSection
    ```
    
4. **Fallback: Try to reinstall display manager or GNOME**
    
    ```bash
    sudo apt install --reinstall gdm3
    sudo dpkg-reconfigure gdm3
    ```
    

---

## 🧠 TL;DR

- ✅ Use `pipewire-pulse` for sound.
    
- ❌ PipeWire has **nothing to do with black screens** — focus on NVIDIA + display manager.
    
- Try booting into TTY, verifying NVIDIA is loaded, and restarting your desktop environment.
    

Let me know if you're using GNOME, KDE, or something else — I’ll tailor it.

```
elryan@Pensieve:~$ systemctl --user status pipewire ● pipewire.service - PipeWire Multimedia Service Loaded: loaded (/usr/lib/systemd/user/pipewire.service; enabled; preset: e> Active: active (running) since Wed 2025-05-21 20:31:48 CDT; 19min ago TriggeredBy: ● pipewire.socket Main PID: 1571 (pipewire) Tasks: 2 (limit: 38377) Memory: 10.2M CPU: 1.613s CGroup: /user.slice/user-1000.slice/user@1000.service/session.slice/pipewi> └─1571 /usr/bin/pipewire May 21 20:31:48 Pensieve systemd[1549]: Started pipewire.service - PipeWire Mul> May 21 20:31:48 Pensieve pipewire[1571]: mod.rt: Can't find org.freedesktop.por> May 21 20:31:48 Pensieve pipewire[1571]: mod.rt: found session bus but no portal May 21 20:45:03 Pensieve pipewire[1571]: pw.core: 0x55601b3fc0e0: error -2 for > May 21 20:45:03 Pensieve pipewire[1571]: mod.client-node: 0x55601bb71400: error> elryan@Pensieve:~$
```

Thanks — based on that output:

- ✅ **PipeWire is running correctly**.
    
- ❌ But you're still **missing full audio functionality**, most likely because `pipewire-pulse` is not active yet.
    

Let’s **activate PipeWire’s PulseAudio compatibility layer**, which is what most apps use to talk to sound systems.

---

## 🛠 Enable PipeWire PulseAudio Service

### 1. **Check if `pipewire-pulse` is installed**

```bash
dpkg -l | grep pipewire-pulse
```

If you don’t see it, install it:

```bash
sudo apt install pipewire-pulse
```

---

### 2. **Enable and start the PulseAudio replacement**

```bash
systemctl --user --now disable pulseaudio.service pulseaudio.socket
systemctl --user --now enable pipewire-pulse
systemctl --user daemon-reexec
```

To prevent PulseAudio from interfering in the future:

```bash
systemctl --user mask pulseaudio
```

---

### 3. **Check that it worked**

```bash
pactl info | grep '^Server Name'
```

Expected output:

```
Server Name: PulseAudio (on PipeWire 0.3.x)
```

---

### 4. **Reboot (optional but recommended)**

```bash
reboot
```

---

If you're still experiencing **black screen on boot**, let me know if you can reach TTY (Ctrl+Alt+F3), and whether `nvidia-smi` returns valid output. That would help pinpoint if it's X/Wayland, the NVIDIA driver, or desktop manager misbehaving.