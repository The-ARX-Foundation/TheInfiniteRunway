---
Date Created: "2026-03-12 00:00"
Last Updated: "2026-03-21 04:31"
tags:
  - Area
Index:
  - "[[The Website Dealer]]"
Topic:
  - "[[Programming]]"
  - "[[Architecture]]"
  - "[[Connection]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]], [[Architecture]], [[Connection]]

# Nonverbal Coffee Ordering Network

Super accessible websites for local coffee shops that enable nonverbal ordering. The user walks in, loads the shop's site on their phone, builds their order visually, and presents it to the barista. No speech required.

**Next initiative** for [[The Website Dealer]] under the [[Hopefully Abysmal Website|Hopefully Abysmal]] partnership model.

## Why This Matters

- Deaf/HoH customers currently rely on pointing, writing notes, or apps that don't know the local menu
- People with [[Anxiety]], autism, speech disabilities, or ESL barriers face the same friction
- No coffee shop in a typical market has a real mobile ordering interface -- most have PDFs or nothing
- This is a wedge into the HA partnership model: build for free, earn on revenue lift

## Core UX Requirements

### For the Customer

- No app install required -- mobile web, loads in <2 seconds
- Large, tappable drink/food tiles with images
- Size selector (S/M/L or shop-specific naming)
- Milk/modifier selector (oat, almond, whole, etc.)
- Add-ons (extra shot, vanilla, etc.) as toggles
- Running total visible at all times
- Final screen: large, barista-readable order summary
- Optional: name field for pickup (not required)
- WCAG 2.1 AA minimum, targeting AAA
- Works offline once loaded (service worker cache)

### For the Shop

- Dead-simple menu management (JSON file or simple CMS)
- No POS integration required in v1 -- barista reads the screen
- Analytics: how many orders placed, popular items, peak times
- QR code for counter/table display linking to their site
- Custom branding: shop logo, colors, font pulled from config

## Information Architecture

| Screen | Content | Interaction |
|--------|---------|-------------|
| Landing | Shop name, logo, "Order Here" CTA | Single tap to begin |
| Menu | Category tabs (Hot, Cold, Food, etc.) | Tap category then items |
| Item Detail | Drink name, image, size, mods | Select options, add to order |
| Cart | Running order with edit/remove | Tap to modify, swipe to remove |
| Checkout | Large barista-readable summary | Show phone to barista |
| Confirmation | "Order placed" + estimated wait | Optional: name/pickup number |

## Technical Spec (v1)

- Single HTML file per shop (matches existing HA build pattern)
- Menu data as inline JSON object -- no database in v1
- Service worker for offline capability after first load
- CSS custom properties for per-shop branding (colors, fonts)
- No authentication, no payment processing in v1
- QR code auto-generated from shop URL
- Hosted on [[ARX CDN]] or Vercel/Netlify as interim

## Accessibility Checklist

- All interactive elements keyboard-navigable
- aria-labels on all buttons and inputs
- Color contrast ratio >=4.5:1 on all text
- Touch targets >=44x44px minimum
- Screen reader tested (VoiceOver + TalkBack)
- Reduced motion support via prefers-reduced-motion
- High contrast mode support
- Supports system font size scaling

## Starter Shops

Build the first batch for coffee shops Elryan already frequents. Walk in with a working prototype, demonstrate the value, pitch the HA partnership model.

**Action item:** List 3-5 most frequented coffee shops with their current menu availability (printed menu, chalkboard, online PDF, nothing). This determines the data entry effort per shop.

## WiFi Access Feature

Receipt-authenticated WiFi. Every order generates a 6-character receipt code. Customer enters it on the WiFi screen to get today's network password. Keeps WiFi fast for paying customers without requiring barista interaction.

- Receipt codes use unambiguous characters (no I/O/0/1)
- Rate-limited: 5 attempts max, then 15-minute lockout
- Password tap-to-copy on mobile
- In v2, codes validate against POS backend; in v1, preset codes + in-app generated codes

## Template Delivered

`coffee-shop-template.html` — single-file prototype with:
- Full nonverbal ordering flow (menu → customize → cart → barista summary)
- Receipt-authenticated WiFi access
- HA design language (void black, lime, warm white)
- WCAG 2.1 AA accessible (keyboard nav, aria, contrast, 44px targets)
- Inline JSON menu config (swap per shop)
- Service worker for offline
- Mobile-first responsive

## Immediate Next Steps

1. List 3-5 target coffee shops with current menu format
2. Photograph one menu and test Claude Vision extraction pipeline
3. ~~Build the HTML template with full accessibility compliance~~ DONE
4. Swap demo menu data for a real shop's menu
5. Walk in, demonstrate, pitch the HA partnership
6. Iterate based on barista and customer feedback
7. Templatize learnings, repeat for next shop
