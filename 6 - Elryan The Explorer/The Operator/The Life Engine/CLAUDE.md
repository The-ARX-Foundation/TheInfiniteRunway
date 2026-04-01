# CLAUDE.md — The Life Engine

## What This Is

A gentle, gamified emotion check-in PWA with a chibi tamagotchi egregore that feeds on your feelings. Select [[Emotions]], get personalized action suggestions, send real notifications to your spouse, and nurture your creature companion through regular check-ins.

Previously "Emotion Communication Board" — now The Life Engine.

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework, no build step)
- **Data:** `emotions.json` — configurable emotion/action definitions
- **Persistence:** localStorage (favorites, selections, settings, creature state, history, streaks, [[Combos]])
- **Backend:** PHP notification endpoint (deploy on SiteGround)
- **PWA:** Service worker + manifest for installable offline-capable app

## File Structure

```
The Life Engine/
  index.html         — Main app entry point (4 tabs: Emotions, Search, History, Insights)
  app.js             — Application logic (emotions, actions, custom helpers, history, insights, combos)
  creature.js        — Tamagotchi egregore system (drawing, XP, themes, packs, streaks, evolution, night mode)
  style.css          — Styling with theme support
  emotions.json      — Emotion definitions, categories, actions (37 emotions)
  manifest.json      — PWA manifest
  sw.js              — Service worker (caching, push notifications)
  server/
    notify.php       — Spouse notification endpoint (POST)
    check.php        — Spouse notification viewer (GET)
  icons/
    generate-icons.html — Open in browser to generate PWA icons
  README.md          — User-facing documentation
  CLAUDE.md          — This file
  UI Transfer Doc.md — Open UI tasks for chat-based work
```

## Key Features

- **37 emotions** across 4 categories (core, physical, sensory, needs)
- **Favorites toggle** — star icon on each emotion to pin favorites
- **Custom emotions** — add your own emotions with custom icons and colors
- **Custom helpers** — add personalized action/helper suggestions per emotion
- **Usage-based sizing** — frequently-used emotions grow larger
- **Emotion combos** — auto-detects frequently-used emotion combos, surfaces as quick-select shortcuts, renameable via long-press
- **Tamagotchi egregore** — chibi creature that feeds on emotion check-ins
  - 6 creature packs (Slime, Cat, Ghost + unlockable Dragon, Mushroom, Fox)
  - Per-persona creature assignments (matches The Operator, The Wizard, etc.)
  - XP system with leveling
  - Mood that reflects your emotions
  - **Dynamic color** — pulls color from emotion's JSON definition (no more hardcoded color maps)
  - **Idle behaviors** — each creature has unique idle animations:
    - Slime: wobbles and blinks
    - Cat: ear twitches, tail flicks, slow blinks
    - Ghost: horizontal drift, tilt, opacity phasing
    - Dragon: wing flaps, periodic smoke puffs
    - Mushroom: floating spore particles
    - Fox: head tilts, sniffing nose bobs
  - **Evolution visuals** — level-based visual upgrades:
    - Lv.5+: Orbiting sparkle aura (more sparkles at higher levels)
    - Lv.10+: Floating golden halo
    - Lv.20+: Jeweled crown
- **Streak system** — tracks consecutive check-in days with flame display, milestone bonus XP at 3/7/14/30/60/100 days
- **Night mode** — auto-switches to Gothic/Void theme after 9pm, reverts at 6am
- **7 themes** — Cozy, Nature, Gothic, Sunset, Ocean, Void, Sakura (unlockable via leveling)
- **History tab** — timeline view of all check-ins grouped by date with color-coded emotion chips
- **Insights tab** — analytics dashboard:
  - Total check-ins, daily average, longest streak, emotions used
  - Top 5 emotions with visual bar chart
  - Pattern detection: most active day, peak hour, most common combo, recent mood trend
- **Real spouse notifications** — POST to PHP backend, email + log
- **Spouse viewer** — check.php shows pending messages with auto-refresh
- **PWA** — installable, works offline
- **Emotion history** — logged in localStorage (last 500 check-ins)

## Design Philosophy

- **Warm, not clinical** — homey colors, chibi creatures, friendly interface
- **Low overwhelm** — information reveals gradually, collapsible sections
- **Gamified positively** — creature rewards for checking in, theme unlocks, streaks
- **Accessible** — large buttons, clear icons, simple language
- **Safe to return to** — designed to feel inviting, not judgmental

## Creature System

The egregore creature:
- Changes color based on your most recent emotions (uses emotion's `color` field from `[[Emotions]].json`)
- Has mood states (happy, concerned, attentive, processing, neutral, hungry)
- Gets "hungry" after 6 hours without a check-in
- Gains XP from each check-in (10 base + up to 15 for emotion variety)
- Levels up every `level * 50` XP
- Unlocks new creature packs and themes at milestone levels
- Can be named and assigned per persona
- Gains visual evolution effects at level milestones (sparkles, halo, crown)
- Has unique idle micro-animations per creature pack

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `tle_creature` | Creature state (name, pack, persona, xp, level, mood, theme, unlocks) |
| `tle_customEmotions` | User-created emotions array |
| `tle_customActions` | User-created actions keyed by emotionId |
| `tle_notifyUrl` | PHP backend URL |
| `tle_history` | Check-in history (last 500 entries) |
| `tle_usage_{id}` | Usage count per emotion (for sizing) |
| `tle_streak` | Streak data (currentStreak, longestStreak, lastCheckinDate) |
| `tle_combos` | Combo frequency counts (emotion combinations) |
| `tle_comboNames` | User-given or auto-generated names for combos |
| `quickEmotions` | Most-used emotion IDs for quick grid |
| `favoriteEmotions` | Favorited emotion IDs |
| `quickEmotionMode` | "frequent" or "favorites" |

## Deployment (SiteGround)

1. Upload the entire `The Life Engine/` folder to your web root
2. Upload `server/notify.php` and `server/check.php` to an `/api/` directory
3. Edit `$CONFIG` in `notify.php` with spouse email
4. In the app Settings, set the Notification URL to `https://yoursite.com/api/notify.php`
5. Give your spouse a bookmark to `https://yoursite.com/api/check.php`
6. Open `icons/generate-icons.html` in a browser, save the canvases as `icon-192.png` and `icon-512.png`

## Future Directions

- Fitbit / Samsung Health / Apple Health integration for physiological emotion detection
- Smart watch pings/reminders to check in based on heart rate, HRV, activity
- Retroactive emotion tagging based on physiological data patterns
- LLM integration for conversational support and pattern analysis
- Support network expansion beyond spouse (friends, therapist, etc.)
- Creature face displaying selected emotion icons (emoji on/around creature)
- Creature packs tied to themes (auto-suggest matching theme on creature switch)
- Manual drag-and-drop icon rearrangement in quick emotions
- Usage-based sizing with grid column spanning for dramatic visual weight
- Restore `actions.spouse` for two-sided action display on spouse viewer

## Parent Context

- **Organization:** Personal (Elryan + Kenya)
- **Persona:** [[The Operator]]
- **Vault frontmatter:** Resource, Index: [[The Operator]], Topic: [[Programming]]

## Things to Avoid

- Do NOT add clinical/medical language — this is intentionally warm and casual
- Do NOT require account creation or login for the frontend
- Do NOT add external CDN dependencies — keep it zero-dependency vanilla JS
- Do NOT store sensitive data server-side beyond the notification log
