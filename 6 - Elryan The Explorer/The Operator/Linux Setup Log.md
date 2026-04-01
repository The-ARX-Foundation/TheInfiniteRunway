---
Date Created: "2025-05-20 11:49"
Last Updated: "2026-03-21 04:31"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
  - "[[Workflow & Tooling]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Workflow & Tooling]], [[Programming]]

# Index
[[Obsidian Installation]]


# Daily Logs
## 2025-05-20
- Set up Debian with GRUB dual bootloader
- running obsidian directly from appimage
- concurrently switching over to aegis authenticator
	- Goal: switch my smartphone to lineageOS to be able to [[get off google entirely]]...
- [[1. Grant yourself sudo permissions|Granted myself sudo permissions]]

## 2025-05-21
- [[Slack Installation|installed slack]]
- Installed min browser (.deb double click)
- [[Flatpak Installation]]
	- Used to install zen browser and GIMP
- [[PhotoGimp Installation]]
- Downloaded Darktable (appimage)
- Pulled script for [[Appimage-launcher|appimage-launcher/creator]] from JARVIS repo
	- Changed Obsidian Icon https://obsidian.md/blog/new-obsidian-icon/
	- Ran for Darktable as well
- Downloaded DaVinci Resolve
	- requires [[installation of graphics card driver]] https://www.nvidia.com/en-us/drivers/details/245669/
		- DUDE THAT MADE THINGS SO MUCH SMOOTHER
	- Forgot to install
- OBS installed via flatpak
	- Black screen on share, think due to [[Pipewire Installation|Pipewire]] not being installed
		- Idk what was up, switched over to V4L2 for video capture and XSHM for display capture and it works amazing...
		- Fixed my whitebalencing issue too!!
	- Mic picking up only on mono; installed easy effects, requires
## 2025-05-22
- Needed better clipboard manager - https://github.com/oae/gnome-shell-pano

## 2025-05-24
- [[GitHub Desktop Installation]]
- [[DaVinci Resolve Installation]]
	- Ran into issue with CUDA and partitions, shifted s.t. more storage was allocated to aux partitions (overnight)

## 2025-05-25
- https://github.com/th-ch/youtube-music
- discord - https://flathub.org/apps/com.discordapp.Discord
- notion - https://flathub.org/apps/io.github.brunofin.Cohesion
- setting up webmail stuff onto the evolution mail server

## 2025-05-27
- [[Signal Installation]]

---

Installed slack, updated discord, idfk what else its been a minute and I forgot to update this log...

---

## 2025-06-04
- Installed VScode with .deb; autoinstalled JDK 21 with it once opened java codebase
- [[Cannot paste files in this directory]]
- [[Home Directory Setup]]
- Not linux setup specifically but relevant; planning to achieve the [[Vault Setup|vault setup]] I want by [[Symlinking Operational directories in nested vaults]]
- [[pipenv]] at 60DRW
	- `sudo apt install pipenv`
- To get `prompt_splitter_V2.py` up and running:
	- `sudo apt install python3-tk`
	- `sudo apt install xclip`

## 2025-06-14
Figured out the [[Gnome Freezing on Workspace Selection Mode]] error (I think), didnt have some flare enabled lmao...

## 2025-06-18
Trying to install [Second-Me](https://www.secondme.io/)

[[Upgraded Python to 3.12.3]]
Installed nodejs
- `sudo apt update && sudo apt install nodejs`
Installed npm
- `sudo apt update && sudo apt install npm`
Installed cmake
- `sudo apt update && sudo apt install cmake`
re-installed [[poetry]]
- `sudo apt install pipx && pipx install poetry`
installed sqlite
- `sudo apt update && sudo apt install sqlite3`

## 2025-06-20
Debating switching over to unstable versions of gnome, still hitting the freezing error
- [[GNOME 47 Unstable Installation]]

Installed [[Intellij|intellij]] to work with Dan today

[[Disabled bracketed paste mode globally]] the `^[[200~` bullshit was pissing me off

[[WNCSS Dev Setup]]

[[docker installation|Installed docker]]

## 2025-06-21
Installed heroic game launcher to play satisfactory
`A D3D11-compatible GPU (Feature Level 11.0, Shader Model 5.0) is required to run the engine.`

Vulcan drivers this time :(

aaaaaaaaa

[[Satisfactory Troubleshooting - DXVK Install]]

## 2025-07-12

Installed graphics card fix for suspend; currently rendering meh after install but suspend works! 
```
sudo systemctl enable nvidia-suspend.service nvidia-hibernate.service nvidia-resume.service
sudo systemctl start nvidia-suspend.service nvidia-resume.service
```
Gonna reboot again...

## 2025-07-18

Think I figured out some of the lag for obsidian;; p sure its the zen browser....
Its not even resource intensive though I'm confused
Likely the visual issues? fuck nvidia proprietary drivers.

[[Troubleshooting Bluetooth]]

