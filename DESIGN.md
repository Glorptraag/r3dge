---
name: R3D Game Essentials
description: A storefront that speaks through R3D's own 11-row LED screen, lit dots over a ghost bed on matte near-black.
colors:
  void: "#0b0909"
  pit: "#060505"
  panel: "#141011"
  panel-2: "#1b1516"
  line: "#2c2223"
  line-2: "#413334"
  ink: "#f4eee9"
  muted: "#b3a7a0"
  led-red: "#ff2a1f"
  led-orange: "#ff7a1a"
  ghost: "#2a1715"
typography:
  display:
    fontFamily: "Doto, Courier New, monospace"
    fontSize: "clamp(2.5rem, 4.8vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "0"
  display-page:
    fontFamily: "Doto, Courier New, monospace"
    fontSize: "clamp(3rem, 7vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 1.02
  headline:
    fontFamily: "Doto, Courier New, monospace"
    fontSize: "clamp(2rem, 3.4vw, 3.1rem)"
    fontWeight: 900
    lineHeight: 1.02
  numeral:
    fontFamily: "Doto, Courier New, monospace"
    fontSize: "1.3rem"
    fontWeight: 900
    fontFeature: "tnum"
  price-hero:
    fontFamily: "Doto, Courier New, monospace"
    fontSize: "clamp(2rem, 3vw, 2.6rem)"
    fontWeight: 900
    lineHeight: 1
    fontFeature: "tnum"
  tag-input:
    fontFamily: "Doto, Courier New, monospace"
    fontSize: "1.35rem"
    fontWeight: 700
    letterSpacing: "0.02em"
  title:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  control:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  nav:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "0.08em"
  label:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    letterSpacing: "0.1em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  lede:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.1rem, 1.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  control: "2px"
  led-window: "4px"
  screen: "10px"
  device: "22px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  gutter: "clamp(16px, 3vw, 32px)"
  section: "clamp(56px, 7vw, 104px)"
  wrap: "1320px"
components:
  button-primary:
    backgroundColor: "{colors.led-red}"
    textColor: "{colors.void}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.led-orange}"
    textColor: "{colors.void}"
  button-primary-added:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "50px"
  button-ghost-hover:
    textColor: "{colors.led-red}"
  button-dark:
    backgroundColor: "{colors.void}"
    textColor: "{colors.led-red}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "50px"
  input:
    backgroundColor: "{colors.pit}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "50px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.led-red}"
    textColor: "{colors.void}"
  card-media:
    backgroundColor: "{colors.panel}"
    rounded: "0"
  corner-tag:
    backgroundColor: "{colors.void}"
    textColor: "{colors.led-red}"
    typography: "{typography.numeral}"
    padding: "3px 8px"
  led-screen:
    backgroundColor: "{colors.pit}"
    rounded: "{rounded.screen}"
    padding: "12px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    typography: "{typography.control}"
    padding: "12px 18px"
---

# Design System: R3D Game Essentials

## Overview

**Creative North Star: "The Lit Sign"**

The storefront is R3D's own LED screen, scaled up. Every surface is a matte, near-black enclosure; anything that matters (a headline, a price, a count, a drop) is spoken in lit dots or in the dot-matrix face that imitates them. The ghost bed of unlit dots is always visible behind the lit ones, so the screen reads as hardware, not as a font effect. The same 11-row matrix drives the full-bleed hero sign, the Runner Tag previews and the badge-font lettering in the header, so product and site share one pixel model.

Controls are the instrument panel around the sign: condensed uppercase labels, near-square 2px corners, 1px rules, no decoration. Colour is scarce by design. Red and orange behave like light: they appear where something is lit, live or actionable, and the rest of the page stays in warm charcoal.

Density is shop-grade: four-up grids, tight 12px tile gaps, sticky filter bar, but generous section breathing (56–104px) between the "worlds" of Beyblade X and Marathon.

**Key Characteristics:**
- Near-black warm ground; red LED primary, orange LED secondary; everything else neutral.
- 11-row dot matrix as the signature surface, drawn by one shared pixel model (canvas live, SVG static).
- Doto (dot-matrix) for headlines and every numeral; Barlow Semi Condensed caps for controls and labels; Barlow for reading.
- Flat, rule-divided layout; the only shadows are light cast by LEDs.
- State changes on controls are instant swaps; only physical objects (drawer, toast, photo) move.

## Colors

A dark, warm-neutral enclosure lit by two LED colours; hue appears only where something is on.

### Primary
- **LED Red** (led-red): the lit-dot colour and the brand. Primary buttons, prices, counts, active nav, selected chips, card hover outlines, links, feature bullets, the full-bleed DROP band. It is also the default value of the `--led` glow variable.

### Secondary
- **LED Orange** (led-orange): the second lit colour. Primary-button hover, every focus ring, warnings and scarcity (low stock, invalid waitlist, "next" drop in the archive, drop state labels), and the lit dots of an incoming drop.

### Neutral
- **Void** (void): page ground, sticky header, corner tags, text on red.
- **Pit** (pit): the recessed LED bed and input wells; one step darker than the page so screens and fields sit *into* it.
- **Panel / Panel 2** (panel, panel-2): tonal lift for media wells, cards, drawer, checkout, process steps.
- **Line / Line 2** (line, line-2): 1px rules and dividers (line); control borders and structural edges (line-2).
- **Ink** (ink): primary text; also the "added" confirmation state and the toast.
- **Muted** (muted): secondary copy, labels, legends, meta.
- **Ghost** (ghost): unlit LED dots in static SVG lettering; the "off" state of the cart counter.

### Runner glows (data, not palette)
Runner Tag variants carry their own glow colour from `data/catalog.json` (green, orange, red, white, ice blue, blue). They enter the UI only through the scoped `--led` custom property on a chip, a runner tile or the product screen, and tint the LED dots, the chip indicator dot and the screen's cast light. They never become text, borders or backgrounds elsewhere.

### Named Rules
**The Lit Signal Rule.** Red and orange mean *lit*: actionable, live, priced, counted or selected. Neutral content never goes red at rest; a screen with no lit elements is correct.

**The Scoped Glow Rule.** Any colour other than red/orange must arrive through `--led` on the element it belongs to; never hard-code a product glow into shared CSS.

## Typography

**Display Font:** Doto (Courier New, monospace fallback), weights 700/900, loaded from Google Fonts.
**Control / Label Font:** Barlow Semi Condensed 600/700, self-hosted woff2.
**Body Font:** Barlow 400/500, self-hosted woff2.

**Character:** A dot-matrix display face that looks like the product's own screen, paired with a condensed industrial grotesque for the instrument labels and a plain, warm grotesque for reading.

### Hierarchy
- **Display** (Doto 900, clamp(2.5rem, 4.8vw, 4.5rem), 1.02): the home h1 and section h2s; set in sentence case with a trailing full stop ("Pick your Runner.").
- **Display Page** (Doto 900, clamp(3rem, 7vw, 5.5rem)): the single h1 of Shop and Lab index pages.
- **Headline** (Doto 900, clamp(2rem, 3.4vw, 3.1rem)): h2 section heads.
- **Numeral** (Doto 900, 0.95–1.5rem, red): every price, count, corner tag, quantity, "+"-style marker. Hero price and tallies step up to clamp(2rem, 3vw, 2.6rem) and clamp(2.2rem, 4vw, 3.4rem), tabular.
- **Tag Input** (Doto 700, 1.35rem): text fields whose content will appear on the LED, so the user types in the screen's voice.
- **Title** (Barlow Semi Condensed 700, 1.15–1.25rem, uppercase, 0.04–0.06em): h3, card and tile names, FAQ questions, cart lines.
- **Control** (Barlow Semi Condensed 700, 1rem, uppercase, 0.1em): buttons, text links, subtotal.
- **Label** (Barlow Semi Condensed 600, 0.82–0.85rem, uppercase, 0.1–0.12em, muted): field labels, legends, spec terms, crumbs, currency.
- **Body** (Barlow 400, 1.0625rem, 1.55): running copy. **Lede** muted at clamp(1.1rem, 1.4vw, 1.25rem), max 54ch; body blocks cap at 46–66ch.

### Named Rules
**The Numbers Are Lit Rule.** Every numeral that carries value (price, count, quantity, stat) is Doto 900; prices and counts are red. Never set a price in Barlow.

**The Caps Are Controls Rule.** Uppercase tracked text is reserved for things you operate or scan (buttons, nav, labels, names). Headlines are never uppercase; reading copy is never uppercase.

## Layout

Content sits in a centred 1320px wrap with a fluid gutter (clamp(16px, 3vw, 32px)). LED signs and the DROP band are the only full-bleed elements; the DROP band keeps its content aligned to the wrap with `max(gutter, (100vw − wrap)/2 + gutter)` side padding.

Sections are separated by generous vertical padding (clamp(56px, 7vw, 104px)) and often a 1px top rule; consecutive bands drop their top padding. Inside, spacing steps are 8 / 12 / 16 / 24 / 32px: 12px between tiles, 16px grid row gaps, 24–32px between a band head and its grid.

Recurring grids: two-column splits at roughly 1.1 : 0.9 (hero, composer, product, maker); four-up rails for types, runners and featured products; auto-fill product grid at min 250px. The header is a 64px sticky bar; the shop filter bar sticks beneath it at 64px; the product gallery and checkout stick at 88px.

**Responsive:**
- **≤1080px:** four-up rails become two-up; band heads stack; archive rows collapse to two columns.
- **≤860px:** nav collapses behind a menu button into a full-width stacked list with 1px rules; all two-column splits become one column; the LED composer stage moves above its copy; sticky gallery, checkout and filter bar become static; footer goes two-up.
- **≤520px:** product grids stay two-up with 10px gaps and smaller names/prices; paired fields, waitlist row and door labels stack; footer goes one column.

## Elevation & Depth

Flat by default. Depth comes from tone and rules: pit (recessed) → void (ground) → panel → panel-2 (raised), separated by 1px line/line-2 borders. Hover on media is a 2px red inset outline, not a lift.

The only shadows are light emitted by LEDs, and they take the colour of `--led`.

### Shadow Vocabulary
- **Device glow** (`box-shadow: 0 40px 90px -30px color-mix(in srgb, var(--led) 45%, transparent), inset 0 1px 0 #3a2f30`): the Runner Tag replica in the composer; light spilling under the device.
- **Screen glow** (`box-shadow: 0 30px 60px -34px color-mix(in srgb, var(--led) 55%, transparent)`): the product-page LED screen.
- **Dot halo** (`box-shadow: 0 0 6px 1px color-mix(in srgb, var(--led) 70%, transparent)` on a 9px dot; 8px/1px for feature bullets): single indicator LEDs.

### Named Rules
**The Only Light Casts Shadow Rule.** A shadow must be light from a lit LED, tinted `--led`. No neutral drop shadows, no elevation on cards, buttons or panels.

## Shapes

Near-square everywhere the user operates: controls, inputs, chips and qty steppers at 2px; media wells, cards, tiles, panels and the drawer at 0. Rounded forms are reserved for hardware replicas: the Runner Tag body (22px) with its circular key ring, the product screen housing (10px), and the LED window inside (4–6px). Circles appear only as LED dots and indicator dots. Icons are 2px-stroke line icons with square caps and mitred joins.

**The Hardware Radius Rule.** Radius above 2px means "this is a physical object"; never round a UI control to look like one.

## Components

### LED Matrix (signature)
The dot grammar every panel follows, from `led-core.js` / `led.js` and the SVG builder:
- **Grid:** always 11 rows. Product screens are fixed at 11 × 44; signs derive pitch from height (pitch = height / 11) and fill the width with as many columns as fit, centred.
- **Dot:** a circle of radius 0.36 pitch (canvas) / 0.38 (SVG) centred in each cell.
- **Ghost bed:** every cell is drawn unlit first. Canvas mixes near-black (13, 10, 10) 13% toward the glow; static SVG uses the ghost token. Background is pit.
- **Lit dot:** a core of the glow colour mixed 35% toward white, over a radial halo (55% alpha at 0.2 pitch, 16% at 45%, 0 at one pitch). Static SVG lit dots are flat red with no halo.
- **Font:** the badge's own 11-px font (ASC11), each glyph trimmed to its lit columns, 1-column gap, 3-column space.
- **Effects:** scroll-left (55ms/tick, opens mid-scroll so the first word reads at once), freeze and flash (45ms, 40-tick hold, flash period 8 ticks), laser, piling, and frame presets (arrow, spinner, equalizer, bounce). Messages cycle in sequence.
- **Inverted (on red):** lit dots become void and ghost dots rgba(0,0,0,0.12), over a 12px halftone of 2px dark dots.
- **Stillness:** panels pause off-screen; under reduced motion they draw the resting frame of the first message.

### Dot Motif in UI
The dot carries into chrome: active/hover nav gets a dotted underline (1.4px dots on a 6px repeat) instead of a line; feature bullets and glow-chip indicators are 9px lit dots with halo; the DROP band is a red halftone.

### Buttons
- **Shape:** near-square (2px), 50px tall, 0 24px padding, control type.
- **Primary:** red fill, void text. Hover swaps to orange instantly. After add-to-cart it flips to ink with "Added" for 1.4s.
- **Ghost:** transparent with line-2 border; hover turns border and text red.
- **Dark:** void fill, red text, for use on the red DROP band; hover to orange.
- **Text link:** control type in red with an arrow icon; hover orange. Quiet variant muted.
- **Focus:** 2px orange outline, 3px offset (void on the red band).

### Chips / Options
- **Style:** 40px tall, 2px radius, line-2 border, control-style uppercase at 0.95rem, transparent.
- **State:** hover border to muted; selected fills red with void text. Glow chips lead with a 9px lit dot in their `--led` colour and fill with that colour when selected.

### Cards / Tiles
- **Media:** square, panel background, no radius, no border; on hover a 2px red inset outline and (product cards) an instant swap to the alternate photo.
- **Body:** title-style name, muted sub, red Doto price with muted "FROM"/"CAD" labels.
- **Corner tag:** void chip with red Doto numeral top-left; scarcity tag top-right in orange caps.
- **Runner tile:** panel with 1px line border, photo over an 11 × 44 LED strip in that runner's glow; hover border takes `--led`.

### Inputs / Fields
- **Style:** pit well, line-2 border, 2px radius, 50px tall; label above in label type.
- **Hover / Focus:** border to muted; focus border red plus 1px red ring, no outline.
- **Error:** orange border and ring. On the red band, inputs are void on void border with a 2px void focus ring.

### Navigation
Sticky 64px void bar with a 1px bottom rule: badge-font "R3D" SVG mark, muted tracked wordmark, nav in nav type with ink text; hover/current red with dotted underline. Cart button is line-2 bordered with an LED counter (pit well, Doto numeral, ghost when empty, red when filled).

### Device Replica
The Runner Tag composer and product screen draw the physical product: dark gradient body, 22px/10px radius, inset LED window, glow cast in the selected runner colour. Typing into tag fields updates the panel live.

### Cart Drawer and Toast
Right-hand drawer, min(440px, 100%), panel background, line-2 left edge, slides in over a 70% pit scrim. Toast is an ink slab with void text in control type, bottom-centre, rising 16px into place and holding 2.6s.

### Motion
One easing, `cubic-bezier(0.22, 1, 0.36, 1)`. Only objects move: drawer 260ms, scrim 220ms, toast 200/300ms, door photo zoom 1.04 over 600ms. Colour, border and selection changes on controls have no transition. Reduced motion zeroes every transition and freezes LED panels on their resting frame.

## Do's and Don'ts

### Do:
- **Do** put every headline, price, count and stat in Doto 900, with value numerals in LED Red.
- **Do** draw LED lettering with the shared pixel model (11 rows, ghost bed always visible, badge font); use SVG for static marks and canvas for anything that moves.
- **Do** tint glows, indicator dots and screen light through the scoped `--led` variable.
- **Do** keep controls near-square (2px), uppercase condensed and tracked, with 1px borders.
- **Do** keep hover and selection as instant swaps; reserve easing for things that physically travel.
- **Do** use a 2px orange outline for focus everywhere (void on red surfaces).
- **Do** give every animated panel a meaningful resting frame for reduced motion and no-JS.

### Don't:
- **Don't** set type in red or orange unless it is lit (actionable, priced, counted, selected, live).
- **Don't** add neutral drop shadows or lift cards on hover; depth is tone and 1px rules, and only LED light casts shadow.
- **Don't** round controls, cards or media beyond 2px; larger radii belong to hardware replicas only.
- **Don't** hide the ghost bed or render lit dots without their unlit neighbours; bare glowing text is not this world.
- **Don't** uppercase headlines or body copy.
- **Don't** hard-code runner glow colours into shared styles.
