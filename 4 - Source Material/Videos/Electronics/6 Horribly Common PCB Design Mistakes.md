---
Date Created: 2024-11-25 19:53
Last Updated: 2025-03-11 19:41
tags:
  - Resource
Index:
  - "[[Artificing]]"
Topic:
  - "[[Signal Processing]]"
Status: Unweathered
Published: false
Link: https://www.youtube.com/watch?v=Z9nycymUd-I
---
---

Themes: [[Signal Processing]]

The transcript outlines six common PCB design mistakes and how to identify and address them:

1. **Incorrect PCB Traces**: Avoid sharp angles in traces, size high-current traces appropriately, and prevent parallel routing of analog and digital traces to reduce noise. Ensure inductors' traces are not overly wide to avoid unwanted RF emissions.
2. **Improper Decoupling Capacitors Placement**: Each microchip power pin needs decoupling capacitors nearby for voltage stability and noise filtering. Use a combination of bulk (10 µF) and high-frequency (0.1 µF) capacitors placed close to the chip's power pins.
3. **No Length Equalization**: High-speed traces must have matched lengths to maintain timing accuracy in multi-signal setups, like clocks or data buses. Use delay lines or ensure equal via counts to minimize timing mismatches.
4. **Incorrectly Designed Antenna Feed Lines**: Ensure impedance matching between antenna feed lines and connected components (e.g., 50-ohm impedance). Use controlled trace dimensions calculated for the PCB material and keep the antenna area clear of interference.
5. **Non-Optimized Component Placement**: Consider magnetic field effects, [[Heat]] generation, and noise interference when placing inductors, thermistors, power resistors, and switching regulator components. Separate AC mains sections physically on the board for safety.
6. **Improper Ground Plane Design**: Use a four-layer PCB with dedicated supply and ground planes. For mixed analog/digital designs, split the ground plane and join it at a single point. In two-layer boards, use isolated sub-circuit ground traces connected only at the power negative terminal to avoid voltage drops.

The video emphasizes proactive design reviews to catch these issues early, ensuring a robust and efficient PCB layout.