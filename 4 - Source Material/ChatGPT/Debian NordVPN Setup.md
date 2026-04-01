---
Date Created: 2025-03-11 18:33
Last Updated: 2025-03-11 18:33
tags:
  - Software
Index:
  - "[[ChatGPT]]"
Topic:
  - Programming
  - "[[Workflow & Tooling]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]]


Great! Now that we've found where those repositories are defined, let's clean them up properly.

### **1. Remove the Problematic Repository Files**

Run the following commands to remove the files:

```bash
sudo rm /etc/apt/sources.list.d/shiftkey-packages.list
sudo rm /etc/apt/sources.list.d/obsproject-ubuntu-obs-studio-bookworm.list
sudo rm /etc/apt/sources.list.d/appimagelauncher-team-ubuntu-stable-bookworm.list
```

### **2. Remove the Corresponding GPG Keys**

Since `grep` showed that `obsproject` had a GPG key stored, we should remove it as well:

```bash
sudo rm /etc/apt/trusted.gpg.d/obsproject-ubuntu-obs-studio.gpg
```

### **3. Update the Package Lists**

Now refresh your package manager:

```bash
sudo apt update --fix-missing
```

### **4. Try Installing NordVPN Again**

After the update completes, retry installing NordVPN using either:

```bash
sh <(wget -qO - https://downloads.nordcdn.com/apps/linux/install.sh)
```

or manually installing via:

```bash
wget -O nordvpn.deb https://repo.nordvpn.com/deb/nordvpn/debian/pool/main/nordvpn_3.17.8_amd64.deb
sudo dpkg -i nordvpn.deb
sudo apt --fix-broken install -y
```

If you encounter further issues, let me know the new error messages! 🚀