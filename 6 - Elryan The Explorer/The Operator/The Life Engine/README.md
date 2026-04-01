---
Date Created: "2026-03-11 00:15"
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
# The Life Engine

A gentle, gamified emotion check-in app with a chibi tamagotchi creature that feeds on your feelings.

## What It Does

- Select [[Emotions]] that match how you're feeling (37 built-in + custom)
- Get personalized action suggestions that might help
- Send real notifications to your spouse when you need something
- Nurture your creature companion through regular check-ins
- Unlock themes and creature packs as you level up

## How to Use

1. Open `index.html` in a browser (or install as a PWA)
2. Tap [[Emotions]] to select them -- they stay toggled until you tap again
3. Star your favorites with the star icon on each emotion
4. See action suggestions below your selections
5. Hit "Feed Creature & Check In" to log your feelings and feed your egregore
6. Long-press any emotion to see detailed actions and add custom helpers

## The Creature

Your chibi egregore feeds on your [[Emotions]]. It:
- Changes color based on what you're feeling
- Has moods that reflect your emotional state
- Gets "hungry" if you don't check in for a while
- Gains XP and levels up from each check-in
- Unlocks new forms and themes at milestone levels

### Creature Packs
- Slime, Cat, Ghost (unlocked from start)
- Dragon (Lv. 5), Mushroom (Lv. 10), Fox (Lv. 20)

### Themes
- Cozy, Nature (unlocked from start)
- Gothic (Lv. 3), Sunset (Lv. 7), Sakura (Lv. 12), Ocean (Lv. 15), Void (Lv. 30)

## Customization

- Add custom [[Emotions]] with any emoji and color
- Add custom helpers/actions per emotion
- Assign different creatures per persona mode
- Name your creature whatever you want

## Spouse Notifications

Set up the PHP backend on your hosting:
1. Upload `server/notify.php` and `server/check.php`
2. Configure the spouse email in `notify.php`
3. Enter the URL in app Settings
4. Give your spouse the `check.php` URL

## Settings

- Quick Emotions: Most Used (auto-learns) or Favorites (manual pins)
- Notification URL: your PHP backend endpoint
- Theme picker: visual themes that change the entire app
- Creature settings: name, creature pack, persona mode

---

Themes:: [[Programming]], [[Workflow & Tooling]]
