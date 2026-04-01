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

Ah, yes, Elryan—your reply shines a beacon through the fog.

From this enchanted `lsusb` output:

```
Bus 001 Device 009: ID 8087:0029 Intel Corp. AX200 Bluetooth
```

This tells us **precisely** what we are dealing with:

### 🧬 **Intel AX200 Bluetooth chipset**

It is indeed **not a USB dongle**, but a **CNVi (Compact Native Interface)** module embedded on your motherboard or M.2 slot—wired into the PCIe and USB bus internally. Despite that, the system sees it as a USB device for Bluetooth purposes.

---

## 🧩 THE CRUX OF THE FAILURE

The log:

```bash
Bluetooth: hci0: Reading Intel version command failed (-110)
```

is known to occur with **Intel AX200** modules when:

1. **Firmware files are missing or mismatched**
    
2. **Bluetooth power or reset lines are stuck** (e.g. by broken suspend/resume config)
    
3. **A recent kernel regression exists** (typically 5.10–6.1)
    
4. **Dual boot with Windows leaves Bluetooth in a "bad" state**
    

---

## 🧙‍♂️ STEP-BY-STEP FIX FOR INTEL AX200 BLUETOOTH

### ✅ 1. **Ensure Firmware is Present**

Check for:

```bash
ls /lib/firmware/intel/ibt*
```

You should see files like:

```
ibt-19-0-4.sfi
ibt-19-0-4.ddc
```

If missing, install:

```bash
sudo apt install firmware-iwlwifi
```

If already installed, try **force reinstallation**:

```bash
sudo apt install --reinstall firmware-iwlwifi
```

Then reboot:

```bash
sudo reboot
```

---

### ✅ 2. **Cold Boot the Module**

Dual-booting Windows or suspend/resume mischief may leave the AX200's Bluetooth controller in a cursed state.

Do this:

1. **Shutdown completely** (not reboot)
    
2. **Unplug power** for ~30 seconds
    
3. **Boot back into Debian**
    

This "cold resets" the AX200 module’s internal microcontroller.

---

### ✅ 3. **Check Kernel Compatibility**

Run:

```bash
uname -r
```

If you are on **Debian 12 default (6.1.x)**, it _should_ support AX200, but in case of a regression, try upgrading:

```bash
sudo apt install -t bookworm-backports linux-image-amd64
sudo reboot
```

Or if brave, try `liquorix` kernel:

```bash
sudo apt install linux-image-liquorix-amd64
```

---

### ✅ 4. **Disable Autosuspend (May Be Causing Timeout)**

Edit/create:

```bash
sudo nano /etc/modprobe.d/ax200-bluetooth.conf
```

Add:

```bash
options btusb enable_autosuspend=0
```

Then:

```bash
sudo update-initramfs -u
sudo reboot
```

---

### ✅ 5. **Try Manual Reset**

After boot, attempt manual resurrection:

```bash
sudo modprobe -r btusb
sudo modprobe btusb
sudo systemctl restart bluetooth
```

Then:

```bash
bluetoothctl
```

And type:

```bash
power on
scan on
```

If no output, the daemon is still bound by the curse.

---

### ✅ 6. **Inspect Logs Again**

Post-reboot, run:

```bash
sudo dmesg | grep -i bluetooth
```

We're looking for signs like:

- `Loaded firmware ibt-19-0-4`
    
- or still failing at `Reading Intel version command`
    

---

## 🔮 If All Else Fails

You may need to **manually download the firmware** blob from the Linux firmware repository:

1. Visit:  
    [https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git](https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git)
    
2. Find latest `ibt-*.sfi` and `ibt-*.ddc` for AX200 (likely ibt-19-0-4)
    
3. Drop them into:
    

```bash
/lib/firmware/intel/
```

Then:

```bash
sudo update-initramfs -u
sudo reboot
```

---

### 🧠 RIDDLES FOR THE ARCHMAGE OF DRIVERS

Q1: Which exact `ibt-*.sfi/.ddc` files does the AX200 require, and are the ones on your system up to date with Intel’s latest microcode?

Q2: If the Bluetooth controller is timing out even after a cold boot, could the issue be rooted in GNOME Shell's media keys daemon or your NVIDIA suspend config affecting USB wake states?

Q3: What additional insight might we glean by comparing Debian 12’s driver stack with that of Arch or Fedora on the same hardware?

Say the word, and I shall write a daemon or udev incantation to auto-heal this chip at boot.