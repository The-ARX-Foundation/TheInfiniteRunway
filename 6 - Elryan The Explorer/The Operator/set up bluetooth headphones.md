---
Date Created: "2025-05-20 17:39"
Last Updated: "2025-05-20 17:39"
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

See [[Troubleshooting Bluetooth]] for Intel AX200 chipset issues on Debian 12.

## Setup Steps

- Ensure [[Pipewire Installation|PipeWire]] is installed with Bluetooth support:
  ```bash
  sudo apt install libspa-0.2-bluetooth pipewire-audio-client-libraries
  ```
- Restart PipeWire:
  ```bash
  systemctl --user restart pipewire pipewire-pulse
  ```
- Pair via `bluetoothctl`:
  ```bash
  bluetoothctl
  power on
  agent on
  scan on
  # wait for headphones to appear
  pair <MAC_ADDRESS>
  connect <MAC_ADDRESS>
  trust <MAC_ADDRESS>
  ```

## Switching Audio Profiles

- Use `pavucontrol` or GNOME Sound Settings to switch between A2DP (high quality audio) and HSP/HFP (headset with mic)
- If A2DP is missing, check that the `libspa-0.2-bluetooth` package is installed

## Known Issues

- If headphones connect but produce no audio, restart PipeWire
- Dual boot with Windows can leave Bluetooth in a bad state; see [[fully shut down windows]]
- Intel AX200 may require firmware reinstall; see [[Troubleshooting Bluetooth]]
