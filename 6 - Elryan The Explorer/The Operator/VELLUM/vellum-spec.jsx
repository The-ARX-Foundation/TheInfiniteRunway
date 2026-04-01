import { useState } from "react";

const AMBER = "#D4A04A";
const AMBER_DIM = "#8B6914";
const AMBER_GLOW = "rgba(212, 160, 74, 0.15)";
const BG = "#0E0E0E";
const BG_RAISED = "#161616";
const BG_CARD = "#1A1A1A";
const BORDER = "#2A2A2A";
const TEXT = "#C8C8C8";
const TEXT_DIM = "#6A6A6A";
const TEXT_BRIGHT = "#E8E8E8";

const sections = [
  {
    id: "concept",
    num: "00",
    title: "CONCEPT",
    content: () => (
      <div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT, marginBottom: 20 }}>
          VELLUM is a skintight membrane glove that turns any surface — or no surface — into a full input device.
          Keyboard, trackpad, gesture controller, instrument. One form factor, infinite contexts.
        </p>
        <div style={{ borderLeft: `2px solid ${AMBER}`, paddingLeft: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT_DIM, fontStyle: "italic" }}>
            Every previous attempt failed for the same reason: they asked humans to adapt to the device.
            Tap Strap forces chord input. VR controllers force button positions. Even high-end mocap gloves
            are capture-only — no input mapping, no haptic confirmation, no keyboard layer.
          </p>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT }}>
          VELLUM inverts this. The glove observes how you naturally type, gesture, and move — then builds
          a personalized input model around YOUR biomechanics. The adaptation cost is zero. You already know
          how to type. VELLUM just learns what that looks like on your specific hands.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 28 }}>
          {[
            { label: "SURFACE AGNOSTIC", desc: "Desk, lap, thigh, mid-air. Input works everywhere." },
            { label: "HAPTIC KEYSTROKE", desc: "Micro-click confirmation replaces physical key travel." },
            { label: "ADAPTIVE MODEL", desc: "ML trains on YOUR hand geometry in < 1 hour." },
          ].map((item, i) => (
            <div key={i} style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 8, fontFamily: "monospace" }}>{item.label}</div>
              <div style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "layers",
    num: "01",
    title: "LAYER ARCHITECTURE",
    content: () => (
      <div>
        <p style={{ fontSize: 14, color: TEXT_DIM, marginBottom: 24, lineHeight: 1.7 }}>
          Five functional layers in a sub-2mm total membrane thickness. Each layer is independently
          manufacturable and bonded during final assembly.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { layer: "L0", name: "CONTACT SKIN", thick: "0.15mm", material: "Medical-grade silicone elastomer", color: "#4A90D9", desc: "Outer surface. Biocompatible, washable, provides grip texture at fingertips. Anti-microbial coating." },
            { layer: "L1", name: "SENSE MESH", thick: "0.30mm", material: "CNF piezoresistive array + flex sensor traces", color: AMBER, desc: "Primary sensing layer. Carbon nanofiber mesh provides distributed pressure mapping across all finger pads. Flex sensors along each phalanx track curl/extension. Shared IP with SCRIM surface array architecture." },
            { layer: "L2", name: "HAPTIC GRID", thick: "0.40mm", material: "Piezoelectric actuator array (PZT thin-film)", color: "#D94A6B", desc: "Haptic feedback layer. Individual actuators at each fingertip pad + palm contact zones. Delivers 2-5ms click confirmation pulses. Programmable intensity per-key." },
            { layer: "L3", name: "SIGNAL BUS", thick: "0.20mm", material: "Flexible PCB (polyimide substrate)", color: "#6BD94A", desc: "Routing layer. Carries sensor data from L1, drives actuators in L2, connects to MCU module at dorsal wrist mount. Serpentine traces for stretch tolerance." },
            { layer: "L4", name: "COMFORT LINER", thick: "0.25mm", material: "Moisture-wicking elastane knit", color: "#9B59B6", desc: "Inner contact layer against skin. Manages sweat, reduces friction during extended wear. Replaceable/washable insert." },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ width: 60, padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: l.color, letterSpacing: 2 }}>{l.layer}</div>
                <div style={{ width: 3, height: 20, background: l.color, marginTop: 4, opacity: 0.5 }} />
              </div>
              <div style={{ flex: 1, padding: "16px 0 16px 16px", borderLeft: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontFamily: "monospace", color: TEXT_BRIGHT, letterSpacing: 1 }}>{l.name}</span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: TEXT_DIM }}>{l.thick}</span>
                </div>
                <div style={{ fontSize: 11, color: l.color, marginBottom: 6, fontFamily: "monospace" }}>{l.material}</div>
                <div style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.6 }}>{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, padding: "12px 16px", background: BG_RAISED, border: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT_DIM }}>TOTAL STACK THICKNESS</span>
          <span style={{ fontSize: 14, fontFamily: "monospace", color: AMBER, fontWeight: 700 }}>~1.30mm</span>
        </div>
      </div>
    ),
  },
  {
    id: "sensing",
    num: "02",
    title: "SENSING STACK",
    content: () => (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            {
              title: "FINGERTIP PRESSURE",
              type: "Piezoresistive",
              specs: ["10x10 taxel grid per fingertip", "0.5mm spatial resolution", "0.01N - 10N range", "200Hz sample rate"],
              note: "CNF mesh from SCRIM. Each fingertip pad is a 100-point pressure image. Enough resolution to distinguish a light tap from a firm press, and to locate the exact contact centroid within the pad."
            },
            {
              title: "FINGER ARTICULATION",
              type: "Resistive flex sensors",
              specs: ["3 per finger (MCP, PIP, DIP joints)", "2 for thumb (CMC, IP)", "0.5° angular resolution", "Calibrated per-user at first wear"],
              note: "Tracks full finger curl/extension and abduction. Combined with pressure data, reconstructs complete hand pose at 200Hz. This is what lets you 'type' in mid-air — the system knows where your fingertips ARE in space."
            },
            {
              title: "HAND ORIENTATION",
              type: "9-axis IMU (accel + gyro + mag)",
              specs: ["Dorsal wrist mount", "1000Hz inertial rate", "Sensor fusion → quaternion pose", "Gravity-referenced"],
              note: "Anchors the finger-relative pose data to world space. Knows if your hands are on a desk, hovering, or raised. Enables gesture recognition and spatial input modes beyond keyboard."
            },
            {
              title: "INTER-FINGER CONTACT",
              type: "Capacitive proximity",
              specs: ["Thumb-to-finger detection", "< 5mm proximity sensing", "Enables pinch/scroll gestures", "Mouse mode activation"],
              note: "Detects when thumb touches or approaches other fingers. This is the mode-switch layer — thumb-to-index pinch activates pointer/scroll mode. Thumb-to-middle could toggle layers. Fully programmable."
            },
          ].map((s, i) => (
            <div key={i} style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 4, fontFamily: "monospace" }}>{s.title}</div>
              <div style={{ fontSize: 11, color: TEXT_DIM, marginBottom: 12, fontFamily: "monospace" }}>{s.type}</div>
              <div style={{ marginBottom: 12 }}>
                {s.specs.map((spec, j) => (
                  <div key={j} style={{ fontSize: 12, color: TEXT, lineHeight: 1.8, fontFamily: "monospace" }}>
                    <span style={{ color: AMBER_DIM, marginRight: 8 }}>→</span>{spec}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: TEXT_DIM, lineHeight: 1.6, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>{s.note}</div>
            </div>
          ))}
        </div>
        <div style={{ background: AMBER_GLOW, border: `1px solid ${AMBER_DIM}`, padding: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: AMBER, marginBottom: 8 }}>SENSOR FUSION NOTE</div>
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>
            All four sensor modalities feed into a single sensor fusion pipeline running on the wrist-mounted MCU.
            Raw data is fused into a unified hand state vector at 200Hz: 20 joint angles + 10 pressure images +
            hand quaternion + contact events. This vector is the input to the adaptive keystroke model.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "haptic",
    num: "03",
    title: "HAPTIC FEEDBACK",
    content: () => (
      <div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT, marginBottom: 20 }}>
          The fundamental problem with gloveless typing: no confirmation that a keystroke registered.
          Physical keys solve this with spring resistance and a tactile bump. VELLUM solves it with
          targeted piezoelectric pulses.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { label: "PULSE DURATION", value: "2-5ms", desc: "Fast enough to feel instantaneous. No perceptible lag between finger movement and haptic response." },
            { label: "ACTUATOR COUNT", value: "14", desc: "One per fingertip (10), two in palm heel, two in thumb pad. Covers all primary contact zones." },
            { label: "LATENCY", value: "< 1ms", desc: "MCU-to-actuator latency. Haptic fires on the PREDICTION of contact, not after detection — feels like resistance." },
          ].map((h, i) => (
            <div key={i} style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: TEXT_DIM, marginBottom: 8, fontFamily: "monospace" }}>{h.label}</div>
              <div style={{ fontSize: 28, fontFamily: "monospace", color: AMBER, marginBottom: 8 }}>{h.value}</div>
              <div style={{ fontSize: 12, color: TEXT_DIM, lineHeight: 1.6 }}>{h.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ borderLeft: `2px solid #D94A6B`, paddingLeft: 20 }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: TEXT }}>
            <strong style={{ color: "#D94A6B" }}>Critical insight:</strong> The haptic fires on PREDICTED contact, not detected contact.
            The input model sees the finger trajectory and activates the piezo ~1ms before the fingertip
            reaches the predicted keystroke threshold. This creates the illusion of physical resistance —
            your finger feels like it "hit" something. The timing window is trainable per-user during calibration.
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: TEXT_DIM, marginBottom: 12, fontFamily: "monospace" }}>HAPTIC PROFILES</div>
          {[
            { profile: "KEYBOARD", desc: "Sharp click pulse. Mimics mechanical key activation. Intensity scales with typing force." },
            { profile: "TRACKPAD", desc: "Soft drag texture. Continuous low-amplitude vibration proportional to scroll velocity." },
            { profile: "GESTURE", desc: "Confirmation bump. Single pulse on gesture recognition. Different patterns for different gestures." },
            { profile: "INSTRUMENT", desc: "Expression mapping. Haptic intensity maps to note velocity or parameter value. Continuous feedback." },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ width: 120, fontSize: 11, fontFamily: "monospace", color: AMBER }}>{p.profile}</div>
              <div style={{ flex: 1, fontSize: 13, color: TEXT_DIM, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "input",
    num: "04",
    title: "ADAPTIVE INPUT MODEL",
    content: () => (
      <div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT, marginBottom: 24 }}>
          This is the core differentiator. Not the sensors, not the haptics — the input inference layer.
          Every previous glove input device shipped with a fixed mapping. VELLUM ships with a learning system.
        </p>
        <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 16, fontFamily: "monospace" }}>CALIBRATION PIPELINE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28 }}>
          {[
            { phase: "01", name: "GEOMETRIC SCAN", time: "30 sec", desc: "User spreads, curls, and relaxes fingers through full range of motion. System maps joint limits, finger lengths, and natural resting positions. Builds a biomechanical model of THIS hand." },
            { phase: "02", name: "SURFACE TYPING CAPTURE", time: "15 min", desc: "User types on a real keyboard while wearing VELLUM. System records the full hand state vector for every verified keystroke. This is supervised training data — ground truth from the physical keyboard, features from the glove sensors." },
            { phase: "03", name: "FREE TYPING CAPTURE", time: "15 min", desc: "User types on a desk surface (no keyboard). System uses the Phase 02 model to predict keystrokes, shows real-time text output. User corrects errors, providing reinforcement signal. Model refines rapidly." },
            { phase: "04", name: "AIR TYPING CALIBRATION", time: "15 min", desc: "User types in mid-air. Different biomechanics — no surface contact, fingers rely on positional memory only. Separate model branch trained for surface-free input." },
            { phase: "05", name: "CONTINUOUS LEARNING", time: "Ongoing", desc: "Every correction the user makes during normal use feeds back into the model. Accuracy improves over days/weeks. The system also detects drift (fatigue, cold hands, different posture) and compensates." },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, padding: "14px 0" }}>
              <div style={{ width: 40, fontSize: 12, fontFamily: "monospace", color: AMBER_DIM }}>{p.phase}</div>
              <div style={{ width: 200, paddingRight: 16 }}>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: TEXT_BRIGHT }}>{p.name}</div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: TEXT_DIM, marginTop: 4 }}>{p.time}</div>
              </div>
              <div style={{ flex: 1, fontSize: 13, color: TEXT_DIM, lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 12, fontFamily: "monospace" }}>MODEL ARCHITECTURE</div>
            <div style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.7 }}>
              Lightweight temporal CNN running on-device (wrist MCU). Input: sliding window of hand state
              vectors (~50ms window at 200Hz = 10 frames). Output: probability distribution over key classes + "no key" class.
              Keystroke triggers when any key probability exceeds threshold AND haptic-predicted contact
              event occurs. Model size target: &lt; 500KB for edge inference at &lt; 5ms per frame.
            </div>
          </div>
          <div style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 12, fontFamily: "monospace" }}>LANGUAGE MODEL ASSIST</div>
            <div style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.7 }}>
              Optional host-side language model layer. When the keystroke model outputs ambiguous
              predictions (e.g., 55% 'e' vs 40% 'r'), the language model resolves based on
              context — "the" is more likely than "thr". This is identical to how phone keyboards work,
              but applied to glove input. Runs on the connected device, not the glove MCU.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "power",
    num: "05",
    title: "POWER & COMMS",
    content: () => (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 12, fontFamily: "monospace" }}>POWER</div>
            {[
              { k: "Battery", v: "Thin-film LiPo, dorsal hand mount" },
              { k: "Capacity", v: "200mAh (target)" },
              { k: "Runtime", v: "8-12 hrs active typing" },
              { k: "Charging", v: "Qi wireless pad (set gloves on pad overnight)" },
              { k: "MCU", v: "Nordic nRF5340 (dual-core ARM Cortex-M33)" },
              { k: "Power budget", v: "~25mW active, ~2mW idle" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT_DIM }}>{row.k}</span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT }}>{row.v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 12, fontFamily: "monospace" }}>COMMUNICATIONS</div>
            {[
              { k: "Primary", v: "BLE 5.3 (HID keyboard profile)" },
              { k: "Latency", v: "< 7.5ms BLE connection interval" },
              { k: "Protocol", v: "Standard HID — works as keyboard/mouse on any OS" },
              { k: "Extended", v: "Custom BLE service for raw sensor data" },
              { k: "Pairing", v: "NFC tap-to-pair (tag in wrist module)" },
              { k: "Multi-device", v: "3 paired devices, hardware button to switch" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT_DIM }}>{row.k}</span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: TEXT }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: AMBER_GLOW, border: `1px solid ${AMBER_DIM}`, padding: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: AMBER, marginBottom: 8 }}>HID COMPATIBILITY</div>
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.7 }}>
            VELLUM presents as a standard BLE HID keyboard + mouse composite device. No drivers needed.
            Plug and play on Linux, macOS, Windows, Android, iOS. The glove handles all inference on-device
            and emits clean keystrokes over HID. The host sees a keyboard — it doesn't know or care that
            it's a glove. This is critical for adoption: zero software installation required.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "scrim",
    num: "06",
    title: "SCRIM CONVERGENCE",
    content: () => (
      <div>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: TEXT, marginBottom: 20 }}>
          VELLUM is not a standalone project. It shares fundamental IP with the SCRIM haptic device
          and lives under the same ARX Foundation hardware umbrella. The convergence points:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              shared: "CNF MESH SENSING",
              vellum: "Fingertip pressure arrays. 10x10 taxel grid per pad. Piezoresistive mode.",
              scrim: "Surface-level contact arrays. Variable resolution grids. Same CNF material, different geometry.",
              note: "Identical material science. Different form factor. Shared supplier relationships, shared characterization data, shared manufacturing process for the mesh substrate."
            },
            {
              shared: "HAPTIC ARCHITECTURE",
              vellum: "PZT thin-film actuators at fingertips. Click confirmation pulses.",
              scrim: "LRA/ERM arrays in suit segments. Spatial haptic patterns.",
              note: "Different actuator types for different scales, but shared driver electronics architecture and haptic rendering pipeline. SCRIM's spatial haptic model can inform VELLUM's per-finger feedback."
            },
            {
              shared: "SENSOR FUSION PIPELINE",
              vellum: "IMU + flex + pressure → hand state vector @ 200Hz.",
              scrim: "IMU array + pressure + mag → body state vector.",
              note: "Same mathematical framework: multi-modal sensor fusion into a unified pose/contact state. Shared firmware libraries for Kalman filtering, quaternion math, contact event detection."
            },
            {
              shared: "MCU PLATFORM",
              vellum: "nRF5340, BLE HID, on-device ML inference.",
              scrim: "Same MCU family at each node. Mesh networking between segments.",
              note: "Shared toolchain (Zephyr RTOS, nRF Connect SDK), shared firmware architecture, shared OTA update pipeline. A developer working on SCRIM firmware is immediately productive on VELLUM."
            },
          ].map((c, i) => (
            <div key={i} style={{ background: BG_RAISED, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: AMBER, marginBottom: 16, fontFamily: "monospace" }}>{c.shared}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4A90D9", marginBottom: 6 }}>VELLUM</div>
                  <div style={{ fontSize: 12, color: TEXT_DIM, lineHeight: 1.6 }}>{c.vellum}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#D94A6B", marginBottom: 6 }}>SCRIM</div>
                  <div style={{ fontSize: 12, color: TEXT_DIM, lineHeight: 1.6 }}>{c.scrim}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "roadmap",
    num: "07",
    title: "DEVELOPMENT ROADMAP",
    content: () => (
      <div>
        {[
          {
            phase: "PHASE 0 — PROOF OF CONCEPT",
            time: "Months 1-3",
            color: "#4A90D9",
            items: [
              "Off-the-shelf flex sensor glove (StretchSense or Manus devkit) + custom fingertip pressure overlays",
              "BLE HID firmware on nRF5340-DK — glove presents as keyboard to host",
              "Basic keystroke classifier: train on 30min of supervised typing data, test accuracy on surface typing",
              "Target: >85% keystroke accuracy on surface, >70% in air. If hit, proceed.",
              "Deliverable: Working prototype that lets you type on a desk without a keyboard at usable accuracy"
            ]
          },
          {
            phase: "PHASE 1 — CUSTOM SENSING",
            time: "Months 4-8",
            color: AMBER,
            items: [
              "First custom CNF fingertip arrays — 10x10 taxel prototype pads bonded to a basic glove form",
              "Custom flex sensor traces printed on flexible substrate (replace off-the-shelf)",
              "Haptic integration — PZT thin-film actuator prototypes at fingertips, test predictive haptic timing",
              "Improved ML model: temporal CNN, language model assist layer, continuous learning pipeline",
              "Target: >93% accuracy surface, >85% air. Haptic confirmation feels like 'typing'.",
            ]
          },
          {
            phase: "PHASE 2 — MEMBRANE INTEGRATION",
            time: "Months 9-14",
            color: "#D94A6B",
            items: [
              "Full 5-layer membrane stack integration — all sensing + haptic + routing in sub-2mm",
              "Custom silicone overmold tooling for glove form factor (hand sizes S/M/L initially)",
              "Wrist module industrial design — MCU, battery, charge coil, NFC in minimal dorsal housing",
              "Extended wear testing — comfort, thermal, sweat, durability over 8hr sessions",
              "FCC/CE pre-compliance testing for BLE emissions",
            ]
          },
          {
            phase: "PHASE 3 — OPEN RELEASE",
            time: "Months 15-18",
            color: "#6BD94A",
            items: [
              "Open-source firmware, hardware design files, and training pipeline under ARX Foundation",
              "Devkit program — hand-assembled units for early developers/testers",
              "Configuration app — calibration wizard, haptic profile editor, input mode management",
              "Documentation, BOM, assembly guides for community manufacturing",
              "Begin exploring modes beyond keyboard: instrument input, sign language capture, rehabilitation tracking",
            ]
          },
        ].map((p, i) => (
          <div key={i} style={{ marginBottom: 28, paddingLeft: 20, borderLeft: `2px solid ${p.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontFamily: "monospace", letterSpacing: 2, color: p.color }}>{p.phase}</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: TEXT_DIM }}>{p.time}</div>
            </div>
            {p.items.map((item, j) => (
              <div key={j} style={{ fontSize: 13, color: TEXT_DIM, lineHeight: 1.8, paddingLeft: 12, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: p.color }}>·</span>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
];

export default function VellumSpec() {
  const [activeSection, setActiveSection] = useState("concept");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "40px 48px 0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 6, color: TEXT_DIM, fontFamily: "monospace", marginBottom: 8 }}>ARX FOUNDATION — HARDWARE DIVISION</div>
            <h1 style={{ fontSize: 48, fontWeight: 300, letterSpacing: 6, color: TEXT_BRIGHT, margin: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              VELLUM
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: TEXT_DIM, fontFamily: "monospace", marginBottom: 4 }}>STATUS</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", color: AMBER }}>DESIGN PHASE</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: TEXT_DIM, margin: "8px 0 24px", maxWidth: 600, lineHeight: 1.6 }}>
          Adaptive membrane input glove. Skintight. Surface-agnostic. Learns your hands.
        </p>

        {/* Nav */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                background: activeSection === s.id ? BG_CARD : "transparent",
                border: "none",
                borderTop: activeSection === s.id ? `2px solid ${AMBER}` : "2px solid transparent",
                color: activeSection === s.id ? TEXT_BRIGHT : TEXT_DIM,
                padding: "12px 20px",
                fontSize: 11,
                fontFamily: "monospace",
                letterSpacing: 1.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              <span style={{ color: AMBER_DIM, marginRight: 6 }}>{s.num}</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 48px 64px", maxWidth: 960 }}>
        {sections.find((s) => s.id === activeSection)?.content()}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 48px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, fontFamily: "monospace", color: TEXT_DIM, letterSpacing: 2 }}>VELLUM TECHNICAL SPECIFICATION v0.1</span>
        <span style={{ fontSize: 10, fontFamily: "monospace", color: TEXT_DIM, letterSpacing: 2 }}>ARX FOUNDATION 2026</span>
      </div>
    </div>
  );
}
