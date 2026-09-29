# R3D Game Essentials: concept store

A demo of what R3D's own storefront could look like, built from the live Etsy catalogue
(R3DGameEssentials, scraped 26 Sep 2026). The whole site speaks the language of R3D's LED
products: headlines, prices and drops render as lit dots on the same 11-row matrix the
Runner Tags and X-Display use, drawn with the badge's own bitmap font.

Live: https://glorptraag.github.io/r3dge/

## What works

- **Home, Shop, Beyblade X, Marathon, 17 product pages, Drops, The Lab, Support, Cart, 404.**
- **Live LED preview.** Type text on the home page or any Runner Tag / X-Display / L3D
  Challenger Box page and watch it on the product's real resolution (11 × 44 or 11 × 48),
  in the selected runner's or LED colour, with scroll, laser, pile and flash effects.
- **Options and pricing** exactly as on Etsy: charm add-ons, FoundersX panel upcharges per
  edition, Samurai Strike ripcord versions, runner characters.
- **Cart** (saved in the browser) with a drawer and a cart page.

## What is demo-only

- **Checkout** doesn't take payment. It lists each item with its options and links to the
  matching Etsy listing.
- **DROP-02 waitlist** stores the address in the visitor's browser only; nothing is sent.
- **Product photos** are hot-linked from Etsy's CDN.

## Replace before this goes real

- Shipping rates and return policy (Support page describes Etsy handoff only).
- Artisan X-Grip description: the Etsy listing reuses the L3D Challenger Box text.
- DROP-02 name, date and lineup when they exist.
- Studio and process photography for The Lab.
- Original product photos and renders to self-host instead of Etsy's CDN.

## Swapping content (built for hi-fi media later)

Nothing visual is hard-coded to today's photos. Edit data, rebuild, push.

- **Home, drop and ticker copy**: `data/site.json`. The hero sign, drop sign and footer
  ticker are lists of LED messages (`{ "text" }` or `{ "preset" }` plus an effect).
- **Any product or variant media**: add a `media` list in `data/catalog.json`. Each slot is
  an image URL, a video loop or a 3D model; the gallery, product cards, runner tiles and
  home doors all render whichever it is:

  ```json
  "media": [
    { "type": "video", "src": "media/cryo-turntable.mp4", "poster": "media/cryo.webp" },
    { "type": "model", "src": "media/foundersx.glb", "ios": "media/foundersx.usdz", "poster": "media/foundersx.webp" },
    "media/cryo-front.webp"
  ]
  ```

  Videos autoplay muted and looped (paused with controls under reduced motion). 3D models
  load Google's `<model-viewer>` only on pages that have one, with drag-to-rotate and AR
  on phones. Files placed in `src/media/` are published at `media/`.
- **LED presets** (arrow, spinner, equalizer and so on) live in `src/assets/led-data.js`,
  exported from LED Badge Studio's library.

## Develop

No dependencies. Node 20+.

```bash
npm run dev      # builds with BASE=/ and serves dist/ on http://localhost:4173
npm run build    # builds for GitHub Pages (BASE=/r3dge/)
```

| Path | What |
|---|---|
| `data/catalog.json` | The 17 products (26 Etsy listings consolidated into options) |
| `data/etsy-scrape-2026-09-26.json` | Raw Etsy scrape the catalogue came from |
| `scripts/build.mjs` | Page templates and the generator (one real page per product) |
| `src/assets/led-core.js` | LED pixel model: badge font, effects (shared by build and browser) |
| `src/assets/led.js` | Canvas LED panels, one animation loop, pause off-screen, reduced motion |
| `src/assets/store.js` | Cart, product options, shop filters, composer, waitlist |
| `src/assets/site.css` | The whole visual system |
| `PRODUCT.md`, `DESIGN.md` | Product truth and the recorded design system |

Pushing to `main` deploys via `.github/workflows/pages.yml`.

Marathon-inspired products are fan-made and not affiliated with Bungie. Beyblade is a
trademark of Takara Tomy; R3D accessories are unofficial.
