---
Date Created: "2026-03-13 00:00"
Last Updated: "2026-03-21 09:18"
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Programming]]"
Status: Unweathered
Published: false
---

---

Themes: [[Programming]], [[Workflow & Tooling]]

# The Life Engine — UI Transfer Doc

Working document for UI tasks to be completed in chat. Each section describes the current state, the goal, and implementation guidance.

---

## 1. Usage-Based Sizing — Make It Dramatic

**Current state:** [[Emotions]] get CSS classes `size-md` (>8 uses) and `size-lg` (>20 uses) which only bump the icon font-size by a few pixels. They don't span grid columns or feel visually different.

**Goal:** Frequently-used [[Emotions]] should feel *big* — spanning multiple grid columns/rows, with a visual weight that makes your go-to [[Emotions]] pop off the screen like a word cloud.

**Implementation ideas:**
- `size-lg` [[Emotions]] span 2 columns (`grid-column: span 2`) and optionally 2 rows
- `size-md` spans 2 columns, 1 row
- Add a `size-xl` tier at 50+ uses that spans 2x2
- Animate the growth transition so it feels alive
- Consider a "[[Heat]]" glow or subtle pulse on the most-used emotions
- The quick emotions grid should respect these sizes too

**Files to touch:** `style.css` (grid spans, new size tiers), `app.js` (add `size-xl` logic in `createEmotionButton`)

---

## 2. Creature Face Displays Emotion Icons

**Current state:** The creature changes color based on the last emotion fed, but the emoji icons from the selected emotions don't appear on or around the creature.

**Goal:** When you check in, the emotion icons (emojis) should appear on or around the creature's face/body — like the creature is literally wearing your feelings. Could be floating around it, stuck to its body like stickers, or displayed as a thought bubble.

**Implementation ideas:**
- After feeding, draw the emotion emojis orbiting the creature using `ctx.fillText()` on the canvas
- Or render them as floating HTML elements absolutely positioned over the canvas
- Could fade out over time (show for 30 seconds after check-in, then dissolve)
- The most recent check-in's emotions persist until the next one
- Bonus: creature's expression changes to match the dominant emotion's emoji

**Files to touch:** `creature.js` (add emoji rendering to each draw function or as a shared overlay), possibly `index.html` (if using HTML overlay approach)

---

## 3. Creature Packs Tied to Themes

**Current state:** Creature packs and themes are independently selectable. No visual relationship between them.

**Goal:** Each creature pack has a "home" theme that pairs with it aesthetically, and selecting a creature could auto-suggest or auto-apply its theme. Themes could also subtly alter the creature's palette.

**Suggested pairings:**
| Creature | Theme | Vibe |
|----------|-------|------|
| Slime | Cozy | Warm, homey, soft |
| Cat | Gothic | Dark, mysterious, elegant |
| Ghost | Void | Deep space, ethereal |
| Dragon | Sunset | Fiery, warm golds |
| Mushroom | Nature | Earthy, forest floor |
| Fox | Sakura | Playful, spring energy |

**Implementation ideas:**
- Add a `defaultTheme` property to each `CREATURE_PACKS` entry
- When switching creature, offer "Apply matching theme?" toast/prompt
- Alternatively, auto-apply and let user override
- Themes could tint the creature's base color slightly

**Files to touch:** `creature.js` (add `defaultTheme` to packs), `app.js` (theme suggestion logic in creature modal)

---

## 4. Manual Icon Movement and Resizing

**Current state:** Emotion buttons sit in a CSS grid. No drag-and-drop or manual positioning.

**Goal:** Users can long-press/drag emotion buttons to rearrange them in the quick emotions section. Optionally pinch-to-resize on mobile. The layout should feel personal — *your* board, *your* arrangement.

**Implementation ideas:**
- Implement drag-and-drop reordering for the quick emotions grid
- Save custom order to localStorage (`tle_quickOrder`)
- Use `touchstart`/`touchmove`/`touchend` for mobile drag
- Visual feedback: lifted card shadow, placeholder gap
- Could also allow dragging from "All Emotions" into "Quick Emotions" as a way to pin
- Pinch-to-resize is ambitious — maybe a simpler "tap to cycle sizes" (small/medium/large) per button

**Files to touch:** `app.js` (drag-and-drop logic, order persistence), `style.css` (drag states, placeholder styling)

---

## 5. Restore Spouse-Side Action Display

**Current state:** `actions.spouse` was dropped during the rewrite. Only `actions.you` exists in `emotions.json`. The spouse viewer (`check.php`) shows raw messages but doesn't display suggested spouse-side actions.

**Goal:** When a check-in notification arrives at the spouse viewer, it should show context-aware "what you can do" suggestions for the *receiving* spouse. Example: if partner checks in "Sad" with "Give me space," the spouse sees: "Respect their space," "Send a heart emoji later," "Prepare [[Comfort]] food."

**Implementation ideas:**
- Re-add `actions.spouse` to `emotions.json` with receiving-partner suggestions
- Include `actions.spouse` data in the POST payload to `notify.php`
- Update `check.php` to render spouse actions as tappable cards
- Could also add a "Done" button on spouse actions so they can mark what they did

**Files to touch:** `emotions.json` (add `actions.spouse`), `app.js` (include in POST body), `server/notify.php` (store spouse actions), `server/check.php` (render them)

---

## 6. PWA Icons — Real Design

**Current state:** `icons/generate-icons.html` draws canvas-based placeholder icons. No actual `icon-192.png` or `icon-512.png` files exist.

**Goal:** Design and save real PWA icons that match The Life Engine's brand — warm, chibi, inviting. The icon should feature the default creature (slime) or a heart+creature hybrid.

**Implementation ideas:**
- Open `generate-icons.html`, improve the canvas drawing to be a proper app icon
- Or design icons externally and drop them into `icons/`
- Need `icon-192.png` and `icon-512.png` at minimum
- Consider a maskable icon variant for Android adaptive icons
- Add `"purpose": "maskable any"` to manifest.json icon entries

**Files to touch:** `icons/` (save PNGs), `manifest.json` (verify icon paths), `icons/generate-icons.html` (improve or replace)

---

## Priority Order (Suggested)

1. **Usage-Based Sizing** — Quick visual win, makes the app feel responsive to use
2. **Creature Emotion Icons** — Core [[Delight]] feature, makes the creature feel alive
3. **Creature-Theme Pairing** — Polish, but adds cohesion
4. **Manual Icon Movement** — Power user feature, most complex
5. **Spouse Actions** — Requires backend coordination
6. **PWA Icons** — Ship blocker but design-dependent

---

## Notes

- All UI work is vanilla JS/CSS — no frameworks, no build step
- Test on mobile viewport (375px) — this is primarily a phone app
- Keep interactions warm and casual, never clinical
- localStorage keys follow the `tle_` prefix convention
- The creature canvas is 280x280, drawn via 2D context
