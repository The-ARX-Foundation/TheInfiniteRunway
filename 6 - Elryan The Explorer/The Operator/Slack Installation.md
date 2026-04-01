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
You're running into a known compatibility issue: the `snap` you're trying to install (`slack`) requires `snapd` **version 2.61 or higher**, but Debian Bookworm currently ships with **2.57.6**, which is too old for `core20`-based snaps like Slack.

Here's how to resolve it:

---

### ✅ **Option 1: Use Flatpak Instead (Recommended for Slack)**

Instead of fighting with Snap versions, install Slack via Flatpak, which is better supported on Debian:

```bash
sudo apt install flatpak gnome-software-plugin-flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub com.slack.Slack
```

Then run it with:

```bash
flatpak run com.slack.Slack
```

---

### ⚠️ **Option 2: Upgrade Snapd via Backports (Not Ideal on Debian)**

If you're committed to using Snap:

1. Edit your sources:
    
    ```bash
    sudo nano /etc/apt/sources.list
    ```
    
2. Add the following backports line:
    
    ```
    deb http://deb.debian.org/debian bookworm-backports main
    ```
    
3. Then run:
    
    ```bash
    sudo apt update
    sudo apt -t bookworm-backports install snapd
    ```
    

**However**: At time of writing, even backports might not have 2.61+. If they don’t, you’ll need to manually build or install Snapd from upstream GitHub—which is fragile and not recommended unless absolutely necessary.

---

### 🚫 Why `snapd` is not a command

You should be using the `snap` CLI, **not** `snapd` directly. To verify installation:

```bash
which snap
snap version
```

If `snap` is not found, try restarting your machine or systemd services:

```bash
sudo systemctl restart snapd
```

---

Let me know which route you'd like to take, and I can help set it up.

If you installed Slack using **Flatpak**, and it’s not showing up in your start menu, here’s how to launch it and make sure it appears properly:

---

### 🧪 Step 1: Try launching it manually

Run this in the terminal:

```bash
flatpak run com.slack.Slack
```

If that works, then Slack is installed and functioning.

---

### 🔁 Step 2: Refresh desktop entries

Sometimes Flatpak apps don’t immediately register with the menu. Try refreshing the desktop integration:

```bash
flatpak update
flatpak make-current com.slack.Slack stable
```

Then restart your desktop environment or run:

```bash
update-desktop-database ~/.local/share/applications
```

You can also try:

```bash
sudo update-desktop-database
```

---

### 📌 Step 3: Manually create a launcher (if needed)

If it still doesn’t appear, create a `.desktop` file:

```bash
nano ~/.local/share/applications/slack-flatpak.desktop
```

Paste the following:

```ini
[Desktop Entry]
Name=Slack (Flatpak)
Comment=Slack Desktop Client
Exec=flatpak run com.slack.Slack
Icon=com.slack.Slack
Terminal=false
Type=Application
Categories=Network;InstantMessaging;
```

Then save and close (`Ctrl+O`, `Enter`, `Ctrl+X`), and run:

```bash
update-desktop-database ~/.local/share/applications
```

You should now see **Slack** in your app menu.

---

Let me know if you'd prefer to bind it to a keyboard shortcut or system tray!

```
elryan@Pensieve:~$ flatpak update flatpak make-current com.slack.Slack stable Note that the directories '/var/lib/flatpak/exports/share' '/home/elryan/.local/share/flatpak/exports/share' are not in the search path set by the XDG_DATA_DIRS environment variable, so applications installed by Flatpak may not appear on your desktop until the session is restarted. Looking for updates… Nothing to do. ^Cerror: Permission denied elryan@Pensieve:~$
```

You're nearly there — the message you’re seeing explains why Slack isn't appearing in your start menu:

---

### 🧠 TL;DR:

Flatpak apps **won’t appear in your desktop environment until `XDG_DATA_DIRS` includes Flatpak paths** — and that usually gets fixed **after restarting your session**.

---

### ✅ Solution: Log Out & Back In

Just **log out** of your graphical session (your desktop) and then **log back in**.

> This updates your environment variables like `XDG_DATA_DIRS` so that your system knows where to find Flatpak app launchers.

After logging back in, Slack should appear in your menu — search for **Slack** in your app launcher.

---

### 🧪 Bonus: Verify XDG_DATA_DIRS (Optional)

You can run this to check if the Flatpak paths are in place:

```bash
echo $XDG_DATA_DIRS
```

You should see something like:

```
/home/elryan/.local/share/flatpak/exports/share:/var/lib/flatpak/exports/share:...
```

If not — logging out/in or rebooting will fix it.

---

Let me know if you want to **manually patch** this for scripting or container purposes instead of rebooting.