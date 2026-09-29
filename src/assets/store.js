// Storefront behaviour: cart (localStorage), product options, shop filters,
// the LED text composer and the demo waitlist. Everything degrades to plain links.
import { mountPanel } from './led.js'

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const ROOT = document.body.dataset.root || './'
const money = (n) => `$${n.toFixed(2)}`
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}
const MINUS = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>'
const PLUS = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>'
const FX = { scroll: 'left', laser: 'laser', pile: 'piling', flash: 'flash' }

// ---------------------------------------------------------------- toast

let toastTimer
function toast(msg) {
  const t = $('[data-toast]')
  if (!t) return
  t.textContent = msg
  t.classList.add('on')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('on'), 2600)
}

// ---------------------------------------------------------------- menu

const menuBtn = $('[data-menu]')
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true'
  menuBtn.setAttribute('aria-expanded', String(open))
  document.body.classList.toggle('menu-open', open)
})

// ---------------------------------------------------------------- cart

const CART = 'r3d-cart-v1'
let cart = store.get(CART, [])
const subtotal = () => cart.reduce((s, l) => s + l.unit * l.qty, 0)
const count = () => cart.reduce((s, l) => s + l.qty, 0)

function saveCart() {
  store.set(CART, cart)
  renderCart()
}

function lineHtml(l, i) {
  const opts = [...l.opts.map(([k, v]) => `${k}: ${v}`), ...l.text.map((t, j) => t && `${l.textLabels?.[j] ?? `Text ${j + 1}`}: “${t}”`).filter(Boolean)]
  return `<div class="line">
  <a class="line-img" href="${ROOT}products/${l.handle}/"><img src="${esc(l.img)}" alt="" width="340" height="270"></a>
  <div class="line-info">
    <a class="line-name" href="${ROOT}products/${l.handle}/">${esc(l.name)}</a>
    ${opts.length ? `<p class="line-opts">${opts.map(esc).join('<br>')}</p>` : ''}
    <div class="line-ctl">
      <div class="qty qty-sm"><button type="button" class="icon-btn" data-line-qty="${i}" data-d="-1" aria-label="Fewer">${MINUS}</button><span class="qty-n">${l.qty}</span><button type="button" class="icon-btn" data-line-qty="${i}" data-d="1" aria-label="More">${PLUS}</button></div>
      <button type="button" class="link-btn" data-line-remove="${i}">Remove</button>
    </div>
  </div>
  <span class="line-price">${money(l.unit * l.qty)}</span>
</div>`
}

const emptyHtml = () => `<div class="cart-empty"><canvas class="led empty-led" data-led='{"cols":44,"messages":[{"text":"EMPTY","effect":"flash","hold":40},{"preset":"invader","loops":3}]}' aria-hidden="true"></canvas><p>Your cart is empty.</p><a class="btn btn-primary" href="${ROOT}shop/">Shop the gear</a></div>`

function renderCart() {
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = count()
    el.closest('.cart-btn')?.classList.toggle('has', count() > 0)
  })
  $$('[data-cart-lines]').forEach((el) => {
    el.innerHTML = cart.length ? cart.map(lineHtml).join('') : emptyHtml()
    $$('canvas[data-led]', el).forEach((c) => mountPanel(c, JSON.parse(c.dataset.led)))
  })
  const foot = $('[data-cart-foot]')
  if (foot) foot.innerHTML = cart.length ? `<p class="subtotal"><span>Subtotal</span><span class="price-slot">${money(subtotal())}</span></p><p class="hint">CAD. Shipping from Toronto calculated at checkout.</p><a class="btn btn-primary btn-wide" href="${ROOT}cart/">Checkout</a>` : ''
  const co = $('[data-checkout]')
  if (co) {
    co.innerHTML = cart.length
      ? `<p class="subtotal"><span>Subtotal</span><span class="price-slot">${money(subtotal())}</span></p>
<p class="hint">CAD, before shipping from Toronto.</p>
<button class="btn btn-primary btn-wide" type="button" data-checkout-go>Check out</button>
<div class="handoff" data-handoff hidden>
  <h2>Checkout isn't live in this concept store.</h2>
  <p>On R3D's own store this is one step: Shop Pay, Apple Pay or card. For now each piece is sold on Etsy. Your picks, with their options, are below.</p>
  <ol class="handoff-list">${cart.map((l) => `<li><a href="${esc(l.etsy)}" rel="noopener">${esc(l.name)} × ${l.qty}</a>${l.opts.length || l.text.some(Boolean) ? `<span>${esc([...l.opts.map(([k, v]) => `${k}: ${v}`), ...l.text.filter(Boolean).map((t) => `“${t}”`)].join(' · '))}</span>` : ''}</li>`).join('')}</ol>
</div>`
      : ''
    $('[data-checkout-go]', co)?.addEventListener('click', (e) => {
      $('[data-handoff]', co).hidden = false
      e.currentTarget.hidden = true
    })
  }
}

document.addEventListener('click', (e) => {
  const q = e.target.closest('[data-line-qty]')
  if (q) {
    const l = cart[+q.dataset.lineQty]
    l.qty = Math.max(0, Math.min(9, l.qty + +q.dataset.d))
    if (!l.qty) cart.splice(+q.dataset.lineQty, 1)
    saveCart()
  }
  const r = e.target.closest('[data-line-remove]')
  if (r) {
    cart.splice(+r.dataset.lineRemove, 1)
    saveCart()
  }
  if (e.target.closest('[data-cart-open]')) openDrawer()
  if (e.target.closest('[data-cart-close]')) closeDrawer()
})

const drawer = $('[data-drawer]')
let lastFocus
function openDrawer() {
  if (!drawer || location.pathname.endsWith('/cart/')) return
  lastFocus = document.activeElement
  drawer.hidden = false
  requestAnimationFrame(() => drawer.classList.add('open'))
  document.body.classList.add('locked')
  $('.drawer-head .icon-btn', drawer).focus()
}
function closeDrawer() {
  if (!drawer || drawer.hidden) return
  drawer.classList.remove('open')
  document.body.classList.remove('locked')
  setTimeout(() => { drawer.hidden = true }, 220)
  lastFocus?.focus()
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer()
  if (e.key === 'Tab' && drawer?.classList.contains('open')) {
    const f = $$('a[href], button:not([disabled]), input', drawer).filter((el) => el.offsetParent)
    if (!f.length) return
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus() }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus() }
  }
})
addEventListener('storage', (e) => { if (e.key === CART) { cart = store.get(CART, []); renderCart() } })
renderCart()

// ---------------------------------------------------------------- product

const productEl = $('[data-product]')
if (productEl) {
  const data = JSON.parse($('[data-product-json]', productEl).textContent)
  const form = $('[data-buy]', productEl)
  const params = new URLSearchParams(location.search)
  const sel = data.options.map(() => 0)
  const variantIdx = data.options.findIndex((o) => o.kind === 'variant')
  const screen = $('[data-screen]', productEl)
  const panelEl = $('[data-screen-panel]', productEl)
  const panel = panelEl ? mountPanel(panelEl) : null
  const texts = $$('[data-text]', form)
  const fx = FX[params.get('fx')] || 'left'

  // deep links from the composer and runner tiles
  if (variantIdx >= 0 && params.get('runner')) {
    const i = data.options[variantIdx].values.findIndex((v) => v.key === params.get('runner'))
    if (i >= 0) sel[variantIdx] = i
  }
  texts.forEach((t, i) => { const v = params.get(`t${i + 1}`); if (v) t.value = v.slice(0, t.maxLength) })

  const variant = () => (variantIdx >= 0 ? data.options[variantIdx].values[sel[variantIdx]] : null)
  const unit = () => {
    let p = variant()?.price ?? data.price
    data.options.forEach((o, oi) => {
      if (o.kind !== 'add') return
      p += variant()?.panels?.[sel[oi]] ?? o.values[sel[oi]].add ?? 0
    })
    return Math.round(p * 100) / 100
  }
  const glow = () => {
    for (let oi = 0; oi < data.options.length; oi++) {
      const g = data.options[oi].values[sel[oi]].glow
      if (g) return g
    }
    return null
  }

  function setGallery(imgs) {
    const main = $('[data-gallery-main]', productEl)
    const thumbs = $('[data-thumbs]', productEl)
    const big = (u) => u.replaceAll('il_fullxfull', 'il_794xN')
    main.src = big(imgs[0])
    thumbs.innerHTML = imgs.map((u, i) => `<button type="button" class="thumb" aria-label="Photo ${i + 1}" aria-pressed="${i === 0}" data-src="${big(u)}"><img src="${u.replaceAll('il_fullxfull', 'il_340x270')}" alt="" width="340" height="270"></button>`).join('')
  }

  function sync(fromVariant) {
    $$('input[data-opt]', form).forEach((inp) => { inp.checked = +inp.value === sel[+inp.dataset.opt] })
    data.options.forEach((o, oi) => {
      const cur = $(`[data-opt-current="${oi}"]`, form)
      if (cur) cur.textContent = o.values[sel[oi]].label
    })
    // FoundersX: panel upcharges differ by edition
    if (variant()?.panels) {
      data.options.forEach((o, oi) => {
        if (o.kind !== 'add') return
        $$(`input[data-opt="${oi}"]`, form).forEach((inp) => {
          const add = variant().panels[+inp.value]
          const tag = inp.nextElementSibling.querySelector('.opt-add')
          if (tag) tag.textContent = `+${money(add)}`
        })
      })
    }
    $('[data-price]', productEl).textContent = money(unit())
    const etsy = variant()?.etsy ?? data.etsy
    $('[data-etsy]', form).href = etsy
    const stock = $('[data-stock]', form)
    if (variant()) stock.hidden = !variant().low
    if (fromVariant && variant()?.images) setGallery(variant().images)
    const g = glow()
    if (g && screen) {
      screen.style.setProperty('--led', g)
      panel?.setGlow(g)
    }
    $$('[data-when]', form).forEach((el) => {
      const oi = data.options.findIndex((o) => o.name === el.dataset.when)
      el.hidden = !(oi >= 0 && sel[oi] > 0)
    })
    if (variantIdx >= 0 && variant()?.key && params.get('runner') !== null) {
      params.set('runner', variant().key)
      history.replaceState(null, '', `?${params}`)
    }
  }

  function preview() {
    if (!panel) return
    panel.setMessages(texts.map((t) => ({ text: t.value.trim() || t.placeholder, effect: fx })))
  }

  form.addEventListener('change', (e) => {
    const inp = e.target.closest('input[data-opt]')
    if (!inp) return
    sel[+inp.dataset.opt] = +inp.value
    sync(+inp.dataset.opt === variantIdx)
  })
  texts.forEach((t) => t.addEventListener('input', preview))

  const qtyInput = $('[data-qty-input]', form)
  $$('[data-qty]', form).forEach((b) => b.addEventListener('click', () => {
    qtyInput.value = Math.max(1, Math.min(9, (+qtyInput.value || 1) + +b.dataset.qty))
  }))

  $('[data-thumbs]', productEl).addEventListener('click', (e) => {
    const b = e.target.closest('.thumb')
    if (!b) return
    $('[data-gallery-main]', productEl).src = b.dataset.src
    $$('.thumb', productEl).forEach((t) => t.setAttribute('aria-pressed', String(t === b)))
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const opts = data.options.map((o, oi) => [o.name, o.values[sel[oi]].label])
    const visibleTexts = texts.filter((t) => !t.closest('[hidden]'))
    const text = visibleTexts.map((t) => t.value.trim())
    const qty = Math.max(1, Math.min(9, +qtyInput.value || 1))
    const key = JSON.stringify([data.handle, opts, text])
    const existing = cart.find((l) => l.key === key)
    if (existing) existing.qty = Math.min(9, existing.qty + qty)
    else {
      const imgs = variant()?.images ?? data.images
      const textLabels = visibleTexts.map((t) => t.labels[0]?.textContent ?? '')
      cart.push({ key, handle: data.handle, name: data.name, textLabels, img: imgs[0].replaceAll('il_fullxfull', 'il_340x270'), opts, text, qty, unit: unit(), etsy: variant()?.etsy ?? data.etsy })
    }
    saveCart()
    const btn = $('button[type=submit]', form)
    btn.classList.add('added')
    btn.textContent = 'Added'
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'Add to cart' }, 1400)
    openDrawer()
  })

  sync(sel[variantIdx] > 0)
  preview()
}

// ---------------------------------------------------------------- shop filters

const shopEl = $('[data-shop]')
if (shopEl) {
  const grid = $('[data-grid]', shopEl)
  const cards = $$('.card', grid)
  const order = new Map(cards.map((c, i) => [c, i]))
  const params = new URLSearchParams(location.search)
  let filter = params.get('type') ? `type:${params.get('type')}` : params.get('line') ? `line:${params.get('line')}` : 'all'
  let sort = 'featured'

  function apply() {
    const [k, v] = filter.split(':')
    let shown = 0
    cards.forEach((c) => {
      const on = filter === 'all' || c.dataset[k] === v
      c.hidden = !on
      if (on) shown++
    })
    const sorted = [...cards].sort((a, b) => {
      if (sort === 'price-asc') return a.dataset.price - b.dataset.price
      if (sort === 'price-desc') return b.dataset.price - a.dataset.price
      if (sort === 'reviews') return b.dataset.reviews - a.dataset.reviews
      return order.get(a) - order.get(b)
    })
    sorted.forEach((c) => grid.append(c))
    $('[data-count]', shopEl).textContent = shown
    $('[data-empty]', shopEl).hidden = shown > 0
    $$('[data-filter]', shopEl).forEach((b) => b.hasAttribute('aria-pressed') && b.setAttribute('aria-pressed', String(b.dataset.filter === filter)))
    const url = new URL(location.href)
    url.searchParams.delete('type')
    url.searchParams.delete('line')
    if (filter !== 'all') url.searchParams.set(k, v)
    history.replaceState(null, '', url)
  }

  shopEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]')
    if (!b) return
    filter = b.dataset.filter
    apply()
  })
  $('[data-sort]', shopEl).addEventListener('change', (e) => { sort = e.target.value; apply() })
  apply()
}

// ---------------------------------------------------------------- composer

const comp = $('[data-composer]')
if (comp) {
  const panel = mountPanel($('[data-c-panel]', comp))
  const body = $('[data-c-body]', comp)
  const go = $('[data-c-go]', comp)
  const base = go.getAttribute('href')
  const update = () => {
    const fx = $('input[name=c-fx]:checked', comp).value
    const runner = $('input[name=c-runner]:checked', comp)
    const t = $$('[data-c-text]', comp).map((i) => i.value.trim())
    const msgs = t.filter(Boolean).map((text) => ({ text, effect: FX[fx] }))
    panel.setMessages(msgs.length ? msgs : [{ text: 'TYPE SOMETHING', effect: 'left' }])
    body.style.setProperty('--led', runner.dataset.glow)
    panel.setGlow(runner.dataset.glow)
    const q = new URLSearchParams({ runner: runner.value, fx })
    t.forEach((v, i) => v && q.set(`t${i + 1}`, v))
    go.href = `${base}?${q}`
  }
  comp.addEventListener('input', update)
  comp.addEventListener('change', update)
  update()
}

// ---------------------------------------------------------------- waitlist

const WAIT = 'r3d-waitlist-v1'
$$('[data-waitlist]').forEach((form) => {
  const msg = $('[data-waitlist-msg]', form)
  const input = $('input[type=email]', form)
  if (store.get(WAIT, null)) {
    msg.textContent = `You're on the list as ${store.get(WAIT)}. (Demo: saved in this browser only.)`
    form.classList.add('joined')
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!input.checkValidity() || !input.value.trim()) {
      form.classList.add('invalid')
      msg.textContent = 'That address looks incomplete. Check it and try again.'
      input.focus()
      return
    }
    form.classList.remove('invalid')
    form.classList.add('joined')
    store.set(WAIT, input.value.trim())
    msg.textContent = `You're on the list. (Demo: saved in this browser only, nothing was sent.)`
    toast('Signal locked in for DROP-02')
  })
})
