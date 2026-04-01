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
requires [[installation of graphics card driver]] https://www.nvidia.com/en-us/drivers/details/245669/

Need to install a few system packages Resolve depends on. Run this command to install all of them:

```bash
sudo apt install libxcb-composite0 libxcb-cursor0 libxcb-xinerama0 libxcb-xinput0
```

Then re-run the installer:

```bash
sudo ./DaVinci_Resolve_19.1.4_Linux.run -i
```

---

Use requires [[Cuda Toolkit Installation]]
