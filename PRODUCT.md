# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain static HTML, CSS and vanilla JS. A dependency-free Node script (`scripts/build.mjs`) generates one real page per product from `data/catalog.json` into `dist/`. Deployed to GitHub Pages from `Glorptraag/r3dge` by a GitHub Action. No framework, no runtime dependencies.

## Users

- **R3D Scott** (owner, animator and 3D artist, Toronto) is the first audience: this is a pitch demo of what owning a branded shop site would look like next to his Etsy store. It has to make him want it.
- **Shoppers** the demo is built for: competitive Beyblade X players and adult collectors looking for cases, grips and tools; Marathon (Bungie) fans buying LED "Runner Tag" keychains, largely in the US; parents and partners buying gifts. They arrive with one hobby in mind.

## Product Purpose

A demo storefront for R3D Game Essentials that shows three things Etsy cannot: owning the drop (numbered ///DROP releases, waitlist, archive), presenting products the way a 3D artist would, and keeping the customer relationship. Success is Scott saying yes to building the real store (Shopify, per the strategy doc).

## Positioning

A one-person studio designing and printing its own game gear, releasing in numbered drops. The designer is the maker: every product starts as his own 3D model and is printed and finished in Toronto.

## Operating Context

- Real sales today run through Etsy (R3DGameEssentials, 26 listings, CAD). The demo's checkout is simulated and hands off to the matching Etsy listing.
- The planned production store is Shopify (Horizon theme + custom r3d-* blocks); this static demo is its design reference.
- Drops: FoundersX was the launch edition (DROP-01). DROP-02 is undated and has no confirmed lineup; show it as incoming only.

## Capabilities and Constraints

- Catalogue: 26 Etsy listings consolidated into 17 products (keychain characters, FoundersX colours and Samurai ripcord types become options). Source: `data/catalog.json`, scraped 26 Sep 2026.
- Prices are CAD, currently 15% off list on Etsy.
- Cart and waitlist work client-side only (localStorage) and are labelled as demo; nothing is charged or sent.
- Product photos are hot-linked from Etsy's CDN until Scott supplies originals and renders.
- Marathon products are fan-made and must say "Marathon-inspired" / "fan-made"; no Bungie marks implied as official.

## Brand Commitments

- Name: R3D Game Essentials (R3D). Tagline in use: "Elevate the game". Etsy tagline: "3D printed accessories for all your favorite hobbies".
- Identity from X (@r3d_ge): black, red and orange; slashed monospace type; releases labelled ///DROP-01 style; BITLAB///01 naming.
- Voice: short, hype-but-friendly, gamer vernacular ("grab yours", "ELEVATE THE GAME").

## Evidence on Hand

- Etsy shop stats (26 Sep 2026): 1,093 sales, 4.9 stars from 286 reviews, on Etsy ~1.5 years, Toronto.
- Per-listing review counts, ratings, favourites, variations, prices and verbatim descriptions in `data/catalog.json`.
- Owner bio from Etsy.
- No customer testimonials text, no press, no 3D renders, no process photos yet: do not fabricate them. Use placeholders on the replacement list.

## Product Principles

1. Show the maker: the site should feel designed by the person who modelled the parts.
2. Drops are events, not listings.
3. Shop by hobby: Beyblade X and Marathon are separate worlds with a shared studio.
4. Never claim what isn't true: demo mechanics are labelled, stats come from Etsy.

## Accessibility & Inclusion

WCAG 2.2 AA contrast and keyboard access; every motion effect respects prefers-reduced-motion and degrades to its end state.
