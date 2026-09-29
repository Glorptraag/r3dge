// Generates the static site into dist/ from data/catalog.json. No dependencies.
// BASE is the absolute path the site is served under (GitHub Pages project site).
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { textBitmap, ROWS } from '../src/assets/led-core.js'
import { mediaHtml, posterSrc, thumbSrc, normalize } from '../src/assets/media.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const BASE = process.env.BASE ?? '/r3dge/'
const cat = JSON.parse(await readFile(join(ROOT, 'data/catalog.json'), 'utf8'))
const { shop, products } = cat
const site = JSON.parse(await readFile(join(ROOT, 'data/site.json'), 'utf8'))
const byHandle = Object.fromEntries(products.map((p) => [p.handle, p]))

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const attr = (o) => esc(JSON.stringify(o))
const money = (n) => `$${n.toFixed(2)}`
const variantOpt = (p) => p.options?.find((o) => o.kind === 'variant')
const vmedia = (v) => (v.media ?? v.images ?? []).map(normalize)
const media = (p) => (p.media || p.images ? vmedia(p) : vmedia(variantOpt(p).values[0]))
/** A media reference in site.json: a direct slot, or { product, variant?, index? } pointing into the catalogue. */
function resolveMedia(ref) {
  if (typeof ref === 'string' || ref.type) return normalize(ref)
  const p = byHandle[ref.product]
  const v = ref.variant ? variantOpt(p).values.find((x) => x.key === ref.variant) : null
  return (v ? vmedia(v) : media(p))[ref.index ?? 0]
}
const basePrice = (p) => p.price ?? Math.min(...variantOpt(p).values.map((v) => v.price))
const hasRange = (p) => {
  const v = variantOpt(p)
  return (v && new Set(v.values.map((x) => x.price)).size > 1) || p.options?.some((o) => o.kind === 'add')
}
const reviewLine = (r) => (r ? `${r.rating.toFixed(1)} / 5 · ${r.count} Etsy review${r.count === 1 ? '' : 's'}` : 'New on Etsy')
const link = (u, href) => (/^(#|https?:)/.test(href) ? href : u(href))
const LINES = { 'beyblade-x': 'Beyblade X', marathon: 'Marathon' }
const TYPES = { case: 'Deck cases', grip: 'Grips', tool: 'Tools & bits', display: 'Displays', keychain: 'Runner Tags', charm: 'Charms', digital: 'Print files' }

let svgId = 0
/** Static LED lettering as SVG: ghost bed plus lit dots, from the same font the canvas uses. */
function ledSvg(text, { cls = 'led-svg', pad = 1, label = text, bed = true } = {}) {
  const b = textBitmap(text)
  const w = b.w + pad * 2
  let dots = ''
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < b.w; x++) if (b.data[y * b.w + x]) dots += `<circle cx="${x + pad + 0.5}" cy="${y + 0.5}" r=".38"/>`
  const id = `ghost${++svgId}`
  const ghost = bed
    ? `<defs><pattern id="${id}" width="1" height="1" patternUnits="userSpaceOnUse"><circle cx=".5" cy=".5" r=".38" class="ghost"/></pattern></defs><rect width="${w}" height="${ROWS}" fill="url(#${id})"/>`
    : ''
  return `<svg class="${cls}" viewBox="0 0 ${w} ${ROWS}" role="img" aria-label="${esc(label)}">${ghost}<g class="lit">${dots}</g></svg>`
}

const ICON = {
  cart: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h3l2.4 10.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.7L21 8H7.2"/><circle cx="10" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>',
  menu: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  out: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5"/></svg>',
  minus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>',
  plus: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>',
}

function layout({ path, title, description, body, active = '', root: fixedRoot }) {
  const depth = path.split('/').length - 1
  const root = fixedRoot ?? (depth ? '../'.repeat(depth) : './')
  const u = (p = '') => root + p
  const nav = [
    ['shop/', 'Shop', 'shop'],
    ['drops/', 'Drops', 'drops'],
    ['lab/', 'The Lab', 'lab'],
    ['support/', 'Support', 'support'],
  ]
  const links = nav.map(([href, label, key]) => `<a href="${u(href)}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0b0909">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="icon" href="${u('assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://i.etsystatic.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Doto:wght@700;900&display=swap">
<link rel="stylesheet" href="${u('assets/site.css')}">
<script type="module" src="${u('assets/store.js')}"></script>
</head>
<body data-root="${esc(root)}">
<!--
THESIS: R3D's own LED screen is the storefront. Headlines, prices and drops speak in lit dots over a drawn ghost bed; refuses the stock dark-hero-plus-product-grid shop.
OWN-WORLD: matte near-black ground; LED red #ff2a1f and orange #ff7a1a lit dots with halo over ghost dots; Doto for display numerals, Barlow Semi Condensed caps for controls, Barlow body; square-cornered cells; state changes are instant swaps.
STORY: see the drop sign, find your hobby (Beyblade X or Marathon), type your own words onto a Runner Tag, add to cart, learn the maker.
FIRST VIEWPORT: full-bleed 11-row LED sign scrolling ///DROP-02 INCOMING across the width; beneath, headline + two actions left, Beyblade X and Marathon doors right.
FORM: LED matrix (seven-segment family challenger, fused with the product's 11x44 screen); seed 837e7916.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->
<a class="skip" href="#main">Skip to content</a>
<p class="demo-strip">Concept store for R3D Game Essentials. Checkout hands off to <a href="${shop.etsy}" rel="noopener">the Etsy shop</a> for now.</p>
<header class="site-head">
  <a class="brand" href="${u()}" aria-label="R3D Game Essentials, home">${ledSvg('R3D', { cls: 'brand-led', label: 'R3D' })}<span class="brand-word">Game Essentials</span></a>
  <nav class="site-nav" id="site-nav" aria-label="Main">${links}</nav>
  <div class="head-actions">
    <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" data-menu>${ICON.menu}<span class="sr-only">Menu</span></button>
    <button class="cart-btn" type="button" data-cart-open aria-label="Cart">${ICON.cart}<span class="cart-count" data-cart-count>0</span></button>
  </div>
</header>
<main id="main">
${body(u)}
</main>
<footer class="site-foot">
  <canvas class="led foot-led" data-led="${attr({ messages: site.ticker })}" aria-label="${esc(site.ticker[0].text)}"></canvas>
  <div class="foot-grid">
    <div><h2 class="foot-h">Shop</h2><a href="${u('shop/beyblade-x/')}">Beyblade X</a><a href="${u('shop/marathon/')}">Marathon Runner Tags</a><a href="${u('shop/')}">Everything</a><a href="${u('products/x-grip-print-files/')}">Print files</a></div>
    <div><h2 class="foot-h">Studio</h2><a href="${u('drops/')}">Drops</a><a href="${u('lab/')}">The Lab</a><a href="${u('support/')}">Shipping &amp; FAQ</a></div>
    <div><h2 class="foot-h">Elsewhere</h2><a href="${shop.etsy}" rel="noopener">Etsy shop ${ICON.out}</a><a href="${shop.x}" rel="noopener">@r3d_ge on X ${ICON.out}</a></div>
  </div>
  <p class="foot-note">A concept storefront for R3D Game Essentials, Toronto. Products, prices (CAD) and review counts from the Etsy shop on 26 September 2026. Marathon-inspired products are fan-made and not affiliated with or endorsed by Bungie. Beyblade is a trademark of Takara Tomy; R3D accessories are unofficial.</p>
</footer>
<div class="drawer" data-drawer hidden>
  <div class="drawer-scrim" data-cart-close></div>
  <aside class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
    <div class="drawer-head"><h2 id="drawer-title">Cart</h2><button class="icon-btn" type="button" data-cart-close>${ICON.close}<span class="sr-only">Close cart</span></button></div>
    <div class="drawer-body" data-cart-lines></div>
    <div class="drawer-foot" data-cart-foot></div>
  </aside>
</div>
<div class="toast" data-toast role="status" aria-live="polite"></div>
</body>
</html>
`
}

function priceTag(p) {
  return `<span class="price"><span class="price-from">${hasRange(p) ? 'from ' : ''}</span>${money(basePrice(p))}<span class="price-cur"> CAD</span></span>`
}

function card(p, u, { eager = false } = {}) {
  const [a, b] = media(p)
  const lead = a.type === 'model' ? { type: 'image', src: a.poster } : a
  return `<a class="card" href="${u(`products/${p.handle}/`)}" data-line="${p.line}" data-type="${p.type}" data-price="${basePrice(p)}" data-reviews="${p.reviews?.count ?? 0}">
  <span class="card-media">${mediaHtml(lead, { size: 'il_570xN', eager, w: 570, h: 570 })}${b && lead.type === 'image' && posterSrc(b) ? `<img class="alt" src="${posterSrc(b)}" alt="" loading="lazy" width="570" height="570">` : ''}${p.drop ? `<span class="tag">///${p.drop}</span>` : ''}${p.low ? '<span class="tag tag-low">Low stock</span>' : ''}</span>
  <span class="card-body"><span class="card-name">${esc(p.name)}</span><span class="card-sub">${esc(p.sub)}</span>${priceTag(p)}</span>
</a>`
}

const runnerTag = byHandle['runner-tag']
const runners = variantOpt(runnerTag).values

function runnerTile(v, u) {
  return `<a class="runner" href="${u(`products/runner-tag/?runner=${v.key}`)}" style="--led:${v.glow}">
  <span class="runner-media">${mediaHtml(vmedia(v)[0], { size: 'il_570xN', w: 570, h: 570 })}</span>
  <canvas class="led runner-led" data-led="${attr({ cols: 44, glow: v.glow, messages: [{ text: v.label.replace(' Contraband', ''), effect: 'freeze', hold: 60 }, { text: v.label, effect: 'left' }] })}" aria-hidden="true"></canvas>
  <span class="runner-name">${esc(v.label)}</span>
  <span class="runner-meta">${v.edition} edition · ${money(v.price)}</span>
</a>`
}

function composer(u) {
  return `<section class="composer" aria-labelledby="composer-h" data-composer>
  <div class="composer-copy">
    <h2 id="composer-h">Your words, lit.</h2>
    <p>Every Runner Tag, X-Display and L3D Challenger Box carries two text frames you write yourself. Try yours on the same 11 × 44 screen, rendered in the badge's own font.</p>
    <div class="field"><label for="c-t1">Frame one</label><input id="c-t1" maxlength="24" value="RUNNER" autocomplete="off" spellcheck="false" data-c-text="0"></div>
    <div class="field"><label for="c-t2">Frame two</label><input id="c-t2" maxlength="24" value="ELEVATE THE GAME" autocomplete="off" spellcheck="false" data-c-text="1"></div>
    <fieldset class="chips"><legend>Effect</legend>
      ${['scroll', 'laser', 'pile', 'flash'].map((fx, i) => `<label class="chip"><input type="radio" name="c-fx" value="${fx}"${i === 0 ? ' checked' : ''}><span>${fx}</span></label>`).join('')}
    </fieldset>
    <fieldset class="chips"><legend>Runner</legend>
      ${runners.map((v, i) => `<label class="chip chip-glow" style="--led:${v.glow}"><input type="radio" name="c-runner" value="${v.key}" data-glow="${v.glow}"${i === 2 ? ' checked' : ''}><span>${esc(v.label.replace(' Contraband', ''))}</span></label>`).join('')}
    </fieldset>
    <a class="btn btn-primary" href="${u('products/runner-tag/')}" data-c-go>Put it on a Runner Tag ${ICON.arrow}</a>
  </div>
  <div class="composer-stage">
    <div class="tag-body" style="--led:#ff5a1f" data-c-body>
      <span class="tag-ring" aria-hidden="true"></span>
      <canvas class="led tag-led" data-led="${attr({ cols: 44, glow: '#ff5a1f', messages: [{ text: 'RUNNER', effect: 'left' }, { text: 'ELEVATE THE GAME', effect: 'left' }] })}" aria-label="Preview of your text on the tag" data-c-panel></canvas>
    </div>
    <p class="stage-note">Live preview at the tag's real resolution, 11 × 44 pixels.</p>
  </div>
</section>`
}

function waitlist(id = 'drop') {
  return `<form class="waitlist" data-waitlist novalidate>
  <label for="${id}-email">Email for DROP-02 alerts</label>
  <div class="waitlist-row"><input id="${id}-email" type="email" name="email" autocomplete="email" placeholder="you@example.com" required><button class="btn btn-dark" type="submit">Get the signal</button></div>
  <p class="waitlist-msg" data-waitlist-msg>Demo form: your address stays in this browser and nothing is sent.</p>
</form>`
}

// ---------------------------------------------------------------- pages

const pages = []
const add = (path, opts) => pages.push({ path, ...opts })

const bey = products.filter((p) => p.line === 'beyblade-x')
const mostReviewed = [...products].sort((a, b) => (b.reviews?.count ?? 0) - (a.reviews?.count ?? 0)).slice(0, 4)

add('index.html', {
  title: 'R3D Game Essentials · Beyblade X gear and Marathon Runner Tags',
  description: 'Deck cases, grips and tools for Beyblade X, and LED Runner Tags for Marathon fans. Designed and 3D printed in Toronto by R3D Scott.',
  body: (u) => `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-sign">
    <canvas class="led hero-led" data-led="${attr({ messages: site.hero.sign })}" aria-label="${esc(site.hero.sign.filter((m) => m.text).map((m) => m.text).join('. '))}"></canvas>
  </div>
  <div class="hero-grid">
    <div class="hero-copy">
      <h1 id="hero-h">${esc(site.hero.headline)}</h1>
      <p class="lede">${esc(site.hero.lede)}</p>
      <div class="actions"><a class="btn btn-primary" href="${link(u, site.hero.primary.href)}">${esc(site.hero.primary.label)} ${ICON.arrow}</a><a class="btn btn-ghost" href="${link(u, site.hero.secondary.href)}">${esc(site.hero.secondary.label)}</a></div>
    </div>
    <div class="doors">
      ${site.hero.doors.map((d, i) => {
        const n = d.line === 'marathon' ? `${runners.length} Runner Tags` : `${products.filter((p) => p.line === d.line).length} pieces of kit`
        return `<a class="door" href="${u(`shop/${d.line}/`)}">${mediaHtml(resolveMedia(d.media), { eager: i === 0 })}<span class="door-label"><span class="door-name">${esc(d.label)}</span><span class="door-count">${n}</span></span></a>`
      }).join('')}
    </div>
  </div>
</section>

${composer(u)}

<section class="band band-bey" aria-labelledby="bey-h">
  <div class="band-head">
    <h2 id="bey-h">Beyblade X, kitted out.</h2>
    <p>Cases that hold a full 3on3 deck, grips for every launcher, and the tools that settle stamina matchups.</p>
    <a class="link" href="${u('shop/beyblade-x/')}">All Beyblade X gear ${ICON.arrow}</a>
  </div>
  <ul class="type-rail">
    ${['case', 'grip', 'tool', 'display'].map((t) => {
      const list = bey.filter((p) => p.type === t)
      const p = list[0]
      return `<li><a class="type-tile" href="${u(`shop/beyblade-x/?type=${t}`)}"><img src="${posterSrc(media(p)[0])}" alt="" loading="lazy" width="570" height="570"><span class="type-name">${TYPES[t]}</span><span class="type-count">${list.length}</span></a></li>`
    }).join('')}
  </ul>
</section>

<section class="band band-marathon" aria-labelledby="mar-h">
  <div class="band-head">
    <h2 id="mar-h">Pick your Runner.</h2>
    <p>Eight Marathon-inspired LED tags, each with its own screen colour. Fan-made, printed in PLA, and yours to write on.</p>
    <a class="link" href="${u('shop/marathon/')}">All Runner Tags ${ICON.arrow}</a>
  </div>
  <div class="runner-grid">${runners.map((v) => runnerTile(v, u)).join('')}</div>
</section>

<section class="band" aria-labelledby="top-h">
  <div class="band-head"><h2 id="top-h">Most reviewed.</h2><p>The pieces Etsy buyers write home about.</p></div>
  <div class="grid grid-4">${mostReviewed.map((p) => card(p, u)).join('')}</div>
</section>

<section class="drop-band" id="drop" aria-labelledby="drop-h">
  <h2 id="drop-h" class="drop-title">${ledSvg(`///${site.drop.number}`, { cls: 'drop-led', label: site.drop.number })}</h2>
  <div class="drop-copy">
    <p class="drop-line">${esc(site.drop.line)}</p>
    <p>${esc(site.drop.copy)}</p>
    ${waitlist('home')}
  </div>
</section>

<section class="maker" aria-labelledby="maker-h">
  <div class="maker-copy">
    <h2 id="maker-h">One designer. Every part.</h2>
    <blockquote><p>&ldquo;${esc(shop.bio)}&rdquo;</p><footer>R3D Scott, owner and designer</footer></blockquote>
    <p class="proof">${shop.sales.toLocaleString('en-CA')} orders shipped from Toronto since early 2025, rated ${shop.rating} from ${shop.reviews} reviews on Etsy.</p>
    <a class="link" href="${u('lab/')}">Inside the Lab ${ICON.arrow}</a>
  </div>
  <canvas class="led maker-led" data-led="${attr({ cols: 44, messages: [{ preset: 'equalizer' }, { text: 'R3D', effect: 'laser' }, { preset: 'bounce' }] })}" aria-hidden="true"></canvas>
</section>`,
})

function shopPage(path, { line, title, h1, intro, description }) {
  const list = line ? products.filter((p) => p.line === line) : products
  const types = [...new Set(list.map((p) => p.type))]
  add(path, {
    active: 'shop',
    title,
    description,
    body: (u) => `
<section class="shop-head">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${u()}">Home</a><span aria-hidden="true">/</span>${line ? `<a href="${u('shop/')}">Shop</a><span aria-hidden="true">/</span><span>${LINES[line]}</span>` : '<span>Shop</span>'}</nav>
  <h1>${h1}</h1>
  <p class="lede">${intro}</p>
</section>
${line === 'marathon' ? `<section class="band band-tight" aria-label="Runner Tags"><div class="runner-grid">${runners.map((v) => runnerTile(v, u)).join('')}</div></section>` : ''}
<section class="shop" data-shop>
  <div class="shop-bar">
    <div class="chips" role="group" aria-label="Filter">
      <button class="chip-btn" type="button" data-filter="all" aria-pressed="true">All</button>
      ${line ? '' : Object.entries(LINES).map(([k, v]) => `<button class="chip-btn" type="button" data-filter="line:${k}" aria-pressed="false">${v}</button>`).join('')}
      ${types.map((t) => `<button class="chip-btn" type="button" data-filter="type:${t}" aria-pressed="false">${TYPES[t]}</button>`).join('')}
    </div>
    <div class="shop-meta"><span class="count" data-count>${list.length}</span><span class="count-label">items</span>
      <label class="sort"><span class="sr-only">Sort</span><select data-sort><option value="featured">Featured</option><option value="reviews">Most reviewed</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option></select></label>
    </div>
  </div>
  <div class="grid" data-grid>${list.map((p, i) => card(p, u, { eager: i < 4 })).join('')}</div>
  <p class="empty" data-empty hidden>Nothing in this filter yet. <button class="link-btn" type="button" data-filter="all">Show everything</button></p>
</section>`,
  })
}

shopPage('shop/index.html', {
  title: 'Shop · R3D Game Essentials',
  h1: 'Shop',
  intro: `${products.length} pieces, from $${Math.min(...products.map(basePrice)).toFixed(2)} bits to launch-edition deck cases. Prices in CAD.`,
  description: 'Every R3D product: Beyblade X deck cases, grips, tools and displays, plus Marathon-inspired LED Runner Tags.',
})
shopPage('shop/beyblade-x/index.html', {
  line: 'beyblade-x',
  title: 'Beyblade X accessories · R3D Game Essentials',
  h1: 'Beyblade X',
  intro: 'Deck cases, launcher grips, tuning tools and displays, designed and printed in Toronto. Unofficial accessories built to fit official parts.',
  description: 'Beyblade X deck cases, launcher grips, ratchet tools and displays, 3D printed in Toronto.',
})
shopPage('shop/marathon/index.html', {
  line: 'marathon',
  title: 'Marathon Runner Tags · R3D Game Essentials',
  h1: 'Marathon',
  intro: 'LED Runner Tags with pre-loaded animations and two text frames you write yourself. Marathon-inspired and fan-made.',
  description: 'Marathon-inspired LED Runner Tag keychains with custom text, plus charms. Fan-made in Toronto.',
})

function specRows(p) {
  const rows = []
  if (p.led) rows.push(['Screen', `${p.led.rows} × ${p.led.cols} LED, ${p.led.frames} text frames`])
  if (p.compat?.length) rows.push(['Fits', p.compat.join(', ')])
  if (p.materials?.length) rows.push(['Material', p.materials.join(', ')])
  rows.push(['Made in', p.digital ? 'Toronto (digital delivery)' : 'Toronto, Canada'])
  if (p.fandom) rows.push(['Licence', 'Fan-made, unofficial'])
  return rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')
}

function optionControl(p, o, oi) {
  const name = `opt-${oi}`
  const vals = o.values
    .map((v, i) => {
      const glow = v.glow ? ` style="--led:${v.glow}"` : ''
      const extra = o.kind === 'add' && v.add ? ` <span class="opt-add">+${money(v.add)}</span>` : ''
      return `<label class="opt${v.glow ? ' opt-glow' : ''}"${glow}><input type="radio" name="${name}" value="${i}"${i === 0 ? ' checked' : ''} data-opt="${oi}"><span>${esc(v.label)}${extra}</span></label>`
    })
    .join('')
  return `<fieldset class="opts${o.values.length > 4 ? ' opts-many' : ''}"><legend>${esc(o.name)} <span class="opt-current" data-opt-current="${oi}">${esc(o.values[0].label)}</span></legend><div class="opt-row">${vals}</div></fieldset>`
}

function personaliseControl(p) {
  const s = p.personalise
  if (!s) return ''
  if (s.kind === 'led') {
    return `<fieldset class="personalise" data-personalise="led"><legend>${esc(s.label)}</legend>
  <div class="screen" style="--led:${p.options?.find((o) => o.values[0].glow)?.values[0].glow ?? '#ff2a1f'}" data-screen>
    <canvas class="led screen-led" data-led="${attr({ cols: p.led.cols, messages: [{ text: 'YOUR NAME' }, { text: 'FRAME TWO' }] })}" aria-label="Preview of your screen text" data-screen-panel></canvas>
  </div>
  <div class="field-pair">
    <div class="field"><label for="t1">Frame one</label><input id="t1" maxlength="${s.max}" data-text="0" placeholder="YOUR NAME" autocomplete="off" spellcheck="false"></div>
    <div class="field"><label for="t2">Frame two</label><input id="t2" maxlength="${s.max}" data-text="1" placeholder="FRAME TWO" autocomplete="off" spellcheck="false"></div>
  </div>
</fieldset>`
  }
  return `<div class="field personalise"${s.when ? ` data-when="${esc(s.when)}" hidden` : ''} data-personalise="text"><label for="t1">${esc(s.label)}</label><input id="t1" maxlength="${s.max}" data-text="0" autocomplete="off"><p class="hint">Up to ${s.max} characters.</p></div>`
}

for (const p of products) {
  const ms = media(p)
  const related = products.filter((q) => q !== p && (q.type === p.type || q.line === p.line)).sort((a, b) => (a.type === p.type ? -1 : 1) - (b.type === p.type ? -1 : 1)).slice(0, 4)
  const data = { handle: p.handle, name: p.name, price: p.price ?? null, etsy: p.etsy ?? null, media: p.media || p.images ? vmedia(p) : null, options: p.options ?? [], personalise: p.personalise ?? null, led: p.led ?? null }
  add(`products/${p.handle}/index.html`, {
    active: 'shop',
    title: `${p.name}${p.fandom ? ' · Marathon-inspired' : p.line === 'beyblade-x' ? ' for Beyblade X' : ''} · R3D Game Essentials`,
    description: p.summary,
    body: (u) => `
<article class="product" data-product>
  <script type="application/json" data-product-json>${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${u()}">Home</a><span aria-hidden="true">/</span><a href="${u(`shop/${p.line}/`)}">${LINES[p.line]}</a><span aria-hidden="true">/</span><span>${esc(p.name)}</span></nav>
  <div class="product-grid">
    <div class="gallery" data-gallery>
      <div class="gallery-main"><div class="gallery-slot" data-gallery-main>${mediaHtml(ms[0], { alt: p.name, eager: true })}</div>${p.drop ? `<span class="tag">///${p.drop}</span>` : ''}</div>
      <div class="thumbs" data-thumbs>${ms.map((m, i) => `<button type="button" class="thumb" aria-label="${m.type === 'image' ? 'Photo' : m.type === 'video' ? 'Video' : '3D view'} ${i + 1}" aria-pressed="${i === 0}" data-i="${i}"><img src="${thumbSrc(m)}" alt="" loading="lazy" width="340" height="270"></button>`).join('')}</div>
    </div>
    <div class="buy">
      <h1>${esc(p.name)}</h1>
      <p class="buy-sub">${esc(p.sub)}${p.fandom ? ' · Marathon-inspired, fan-made' : ''}</p>
      <p class="buy-price"><span class="price-slot" data-price>${money(basePrice(p))}</span><span class="price-cur">CAD</span></p>
      <p class="buy-reviews">${reviewLine(p.reviews)}${p.favourites ? ` · ${p.favourites.toLocaleString('en-CA')} favourites` : ''}</p>
      <p class="buy-summary">${esc(p.summary)}</p>
      <form class="buy-form" data-buy>
        ${(p.options ?? []).map((o, i) => optionControl(p, o, i)).join('')}
        ${personaliseControl(p)}
        <div class="buy-row">
          <div class="qty"><button type="button" class="icon-btn" data-qty="-1">${ICON.minus}<span class="sr-only">Fewer</span></button><input type="number" min="1" max="9" value="1" aria-label="Quantity" data-qty-input><button type="button" class="icon-btn" data-qty="1">${ICON.plus}<span class="sr-only">More</span></button></div>
          <button class="btn btn-primary btn-wide" type="submit">Add to cart</button>
        </div>
        <p class="stock" data-stock${p.low ? '' : ' hidden'}>Low stock on Etsy: only a few left.</p>
        <a class="link link-quiet" href="${p.etsy ?? variantOpt(p).values[0].etsy}" rel="noopener" data-etsy>Order this on Etsy today ${ICON.out}</a>
      </form>
      <dl class="specs">${specRows(p)}</dl>
    </div>
  </div>
  <section class="details" aria-labelledby="feat-h">
    <h2 id="feat-h">What you get</h2>
    <ul class="features">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  </section>
  <section class="band band-tight" aria-labelledby="rel-h">
    <div class="band-head"><h2 id="rel-h">Pairs well with</h2></div>
    <div class="grid grid-4">${related.map((q) => card(q, u)).join('')}</div>
  </section>
</article>`,
  })
}

add('drops/index.html', {
  active: 'drops',
  title: 'Drops · R3D Game Essentials',
  description: 'R3D releases in numbered drops. DROP-02 is incoming; DROP-01 was the FoundersX launch edition.',
  body: (u) => `
<section class="drop-hero" aria-labelledby="drops-h">
  <h1 id="drops-h" class="sr-only">Drops</h1>
  <canvas class="led drop-hero-led" data-led="${attr({ messages: site.drop.sign })}" aria-label="${esc(`${site.drop.number}. ${site.drop.line}`)}"></canvas>
  <div class="drop-hero-copy">
    <h2>${esc(site.drop.number)} is incoming.</h2>
    <p class="lede">R3D releases new gear as numbered drops: a small run, a launch moment, then the edition retires. DROP-02 has no date and no lineup yet. The list hears first.</p>
    ${waitlist('drops')}
  </div>
</section>
<section class="band" aria-labelledby="arch-h">
  <div class="band-head"><h2 id="arch-h">The archive</h2><p>Every drop, what was in it, and how many were made.</p></div>
  <ol class="archive">
    <li class="archive-row archive-next"><span class="archive-no">${ledSvg(site.drop.number.replace(/\D/g, ''), { cls: 'archive-led', label: site.drop.number })}</span><div><h3>${esc(site.drop.number)}</h3><p>${esc(site.drop.line)}</p></div><span class="archive-state">${esc(site.drop.status)}</span></li>
    ${site.archive.map((d) => {
      const p = byHandle[d.product]
      return `<li class="archive-row"><span class="archive-no">${ledSvg(d.number.replace(/\D/g, ''), { cls: 'archive-led', label: d.number })}</span><div><h3>${esc(d.number)} · ${esc(d.name)}</h3><p>${esc(d.copy)}</p><a class="link" href="${u(`products/${p.handle}/`)}">See ${esc(p.name)} ${ICON.arrow}</a></div><img src="${posterSrc(media(p)[0])}" alt="${esc(p.name)}" loading="lazy" width="570" height="570"></li>`
    }).join('')}
  </ol>
</section>`,
})

add('lab/index.html', {
  active: 'lab',
  title: 'The Lab · R3D Game Essentials',
  description: 'R3D Scott is an animator and 3D artist in Toronto. Every R3D part starts as his own 3D model.',
  body: (u) => `
<section class="lab-hero" aria-labelledby="lab-h">
  <h1 id="lab-h">The Lab.</h1>
  <p class="lede">R3D is one person in Toronto: R3D Scott, animator and 3D artist. Every product starts as his own 3D model, gets printed in-house, and ships from the same studio.</p>
  <blockquote class="lab-quote"><p>&ldquo;${esc(shop.bio)}&rdquo;</p></blockquote>
</section>
<section class="process" aria-label="From model to your hands">
  ${[
    ['MODEL', 'Modelled first', 'Each case, grip and tag is designed around the official parts it has to hold or fit, then iterated until the tolerances feel right in the hand.'],
    ['PRINT', 'Printed in Toronto', 'Parts are 3D printed in PLA, with PETG where it needs to flex, like the BITLAB///01 stems. Dual-printed tips stay softer than the arena.'],
    ['SHIP', 'Packed by the designer', `${shop.sales.toLocaleString('en-CA')} orders so far, each one packed and shipped by the person who drew it.`],
  ].map(([word, h, t]) => `<div class="step"><canvas class="led step-led" data-led="${attr({ cols: 44, messages: [{ text: word, effect: 'freeze' }] })}" aria-hidden="true"></canvas><h2>${h}</h2><p>${t}</p></div>`).join('')}
</section>
<section class="band" aria-labelledby="labnums-h">
  <div class="band-head"><h2 id="labnums-h">By the numbers, from Etsy</h2></div>
  <dl class="tally">
    <div><dt>Orders shipped</dt><dd>${shop.sales.toLocaleString('en-CA')}</dd></div>
    <div><dt>Average rating</dt><dd>${shop.rating}</dd></div>
    <div><dt>Reviews</dt><dd>${shop.reviews}</dd></div>
    <div><dt>Products live</dt><dd>${products.length}</dd></div>
  </dl>
</section>`,
})

const faq = [
  ['Which grip fits my launcher?', 'Samurai Strike comes in Hold Launcher and Winder Launcher versions. Excalibur Strike fits the Hold Launcher. X-Grip is for the winder launcher. Slim-Grip fits both winder and string launchers. X-SYNC links two string launchers.'],
  ['How does personalisation work?', 'Runner Tags, the X-Display and the L3D Challenger Box have two text frames you write at checkout. ArmoryX and FoundersX cases take custom text on one or both side panels. Type exactly what you want shown.'],
  ['Are BITLAB///01 bits tournament legal?', 'No. They are non-competitive custom bits for casual play, dual-printed with PETG stems and PLA tips that are softer than the arena so they will not damage it.'],
  ['What do I get with the print files?', 'A ZIP of Bambu Lab-optimised files for the X-Grip (A1, P1S, X1C, H2D), standard and left-handed, with text printing instructions. Personal, non-commercial use only; please do not redistribute.'],
  ['Are the Marathon products official?', 'No. Runner Tags and the Protector charm are Marathon-inspired fan-made pieces, not affiliated with or endorsed by Bungie.'],
  ['Where does my order ship from?', 'Toronto, Canada. In this concept store, checkout hands off to the matching Etsy listing, where shipping to your address is calculated.'],
]
add('support/index.html', {
  active: 'support',
  title: 'Support · R3D Game Essentials',
  description: 'Launcher compatibility, personalisation, print files and shipping for R3D Game Essentials.',
  body: () => `
<section class="shop-head"><h1>Support</h1><p class="lede">Compatibility, personalisation and shipping. Anything else, message R3D Scott through the Etsy shop.</p></section>
<section class="band band-tight" aria-labelledby="compat-h">
  <div class="band-head"><h2 id="compat-h">Launcher fit</h2></div>
  <div class="table-wrap"><table class="compat">
    <thead><tr><th scope="col">Product</th>${['Hold Launcher', 'Winder Launcher', 'String Launcher'].map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead>
    <tbody>${products.filter((p) => p.compat?.some((c) => c.includes('Launcher'))).map((p) => `<tr><th scope="row">${esc(p.name)}</th>${['Hold Launcher', 'Winder Launcher', 'String Launcher'].map((c) => `<td>${p.compat.includes(c) ? '<span class="fit">Fits</span>' : '<span class="nofit">No</span>'}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
</section>
<section class="band band-tight" aria-labelledby="faq-h">
  <div class="band-head"><h2 id="faq-h">Questions</h2></div>
  <div class="faq">${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
</section>`,
})

add('cart/index.html', {
  title: 'Cart · R3D Game Essentials',
  description: 'Your R3D cart.',
  body: () => `
<section class="shop-head"><h1>Cart</h1></section>
<section class="cart-page" data-cart-page>
  <div class="cart-lines" data-cart-lines></div>
  <aside class="checkout" data-checkout></aside>
</section>`,
})

add('404.html', {
  root: BASE,
  title: 'Spun out · R3D Game Essentials',
  description: 'Page not found.',
  body: (u) => `
<section class="drop-hero lost">
  <h1 class="sr-only">Page not found</h1>
  <canvas class="led drop-hero-led" data-led="${attr({ messages: [{ text: '404' , effect: 'flash', hold: 32 }, { preset: 'spinner', loops: 2 }, { text: 'SPUN OUT', effect: 'piling' }] })}" aria-label="404, spun out"></canvas>
  <div class="drop-hero-copy"><h2>This page spun out.</h2><p class="lede">The link is old or mistyped. The gear is still here.</p><div class="actions"><a class="btn btn-primary" href="${u('shop/')}">Back to the shop ${ICON.arrow}</a><a class="btn btn-ghost" href="${u()}">Home</a></div></div>
</section>`,
})

// ---------------------------------------------------------------- write

await rm(DIST, { recursive: true, force: true })
await mkdir(DIST, { recursive: true })
await cp(join(ROOT, 'src/assets'), join(DIST, 'assets'), { recursive: true })
await cp(join(ROOT, 'src/fonts'), join(DIST, 'assets/fonts'), { recursive: true })
await cp(join(ROOT, 'src/media'), join(DIST, 'media'), { recursive: true }).catch(() => {})
for (const pg of pages) {
  const file = join(DIST, pg.path)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, layout(pg))
}
await writeFile(join(DIST, '.nojekyll'), '')
console.log(`built ${pages.length} pages into dist/ (base ${BASE})`)
