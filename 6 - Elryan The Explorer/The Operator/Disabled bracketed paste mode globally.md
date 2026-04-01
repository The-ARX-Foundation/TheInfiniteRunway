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
You're seeing `^[[200~` and `^[[201~` because of **bracketed paste mode**, a terminal feature that helps terminal applications (like `vim`, `nano`, `readline`, etc.) detect pasted text blocks. It's supposed to help prevent accidental command execution by wrapping pasted text in those markers, but if your shell or editor doesn't interpret them, they show up as garbage.

Since it’s bothering you and you're not relying on bracketed paste features in advanced terminal editors, you can **disable it globally**.

---

## ✅ Disable Bracketed Paste in Bash (System-Wide)

`~/.inputrc` doesn’t exist yet. Let's create it and then apply the setting.


1. **Create the file with the necessary setting**:
    

```bash
echo 'set enable-bracketed-paste off' >> ~/.inputrc
```

2. **Apply it immediately**:
    

```bash
bind -f ~/.inputrc
```

3. (Optional but recommended) Add this to `~/.bashrc` to ensure it always loads:
    

```bash
echo 'bind -f ~/.inputrc' >> ~/.bashrc
```

4. **Restart your terminal**, or run:
    

```bash
source ~/.bashrc
```


---

## ✅ Disable in Zsh (if using Zsh)

If you’re using `zsh`, you may have bracketed paste enabled via `zsh-users/zsh-syntax-highlighting` or `zsh-users/zsh-autosuggestions`.

Add this to your `~/.zshrc`:

```bash
unset zle_bracketed_paste
```

Or disable in prompt config:

```bash
DISABLE_BRACKETED_PASTE=true
```

---

## ✅ Disable Bracketed Paste in VSCode Terminal

VSCode terminal **inherits your shell**, so once you've disabled it in `.inputrc` or `.zshrc`, it should no longer send those codes.

But if it's still showing, try this:

1. Open **Command Palette** → `Preferences: Open Settings (JSON)`
2. Add:

```json
"terminal.integrated.bracketedPasteMode": false
```

---

## ✅ IntelliJ Terminal (JetBrains IDEs)

It also uses your system shell. However, if it doesn’t respect `inputrc`, set the terminal shell path explicitly and ensure it runs a login shell:

1. Go to **Settings > Tools > Terminal**
2. Set:

   * Shell path: `/bin/bash --noprofile --norc` *(to disable loading rc files)*
   * Or `/bin/bash -l` *(if you want it to load your updated `.inputrc`)*

---

## ⚠️ Note on `Ctrl + Shift + V`

If `Ctrl + Shift + V` doesn’t work:

* **Basic Terminal (like GNOME Terminal)**: Should work unless remapped
* **VSCode**: Ensure `"terminal.integrated.copyOnSelection": false` (sometimes interferes)
* Try right-click paste to confirm it’s a bracketed paste issue

---

## 🧪 Test if it’s fixed

Run:

```bash
cat
```

Then paste something. If you **still see `^[[200~`**, it’s still active. Once properly disabled, it won’t appear.

---

Let me know which shell you're using (`bash`, `zsh`, `fish`, etc.) and I’ll tailor the fix to your setup.