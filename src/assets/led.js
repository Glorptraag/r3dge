// Canvas LED panels. Every <canvas data-led='{...}'> on the page is driven by one
// animation loop; panels pause off-screen and hold a still frame under reduced motion.
import { ROWS, compile, frameAt, restingFrame } from './led-core.js'

const reduce = matchMedia('(prefers-reduced-motion: reduce)')
const panels = new Set()
let raf = 0

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const css = ([r, g, b], a = 1) => `rgba(${r},${g},${b},${a})`

class Panel {
  constructor(canvas, opts = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.fixedCols = typeof opts.cols === 'number' ? opts.cols : null
    this.glow = opts.glow || getComputedStyle(canvas).getPropertyValue('--led').trim() || '#ff2a1f'
    this.messages = opts.messages || [{ text: canvas.getAttribute('aria-label') || '' }]
    this.visible = true
    this.lastKey = ''
    this.resize()
    new ResizeObserver(() => this.resize()).observe(canvas)
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) wake() }).observe(canvas)
    panels.add(this)
    wake()
  }

  setMessages(messages) {
    this.messages = messages
    this.compile()
    this.lastKey = ''
    wake()
  }

  setGlow(glow) {
    this.glow = glow
    this.paintSprites()
    this.lastKey = ''
    wake()
  }

  resize() {
    const r = this.canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    const dpr = Math.min(devicePixelRatio || 1, 2)
    this.pitch = this.fixedCols ? r.width / this.fixedCols : r.height / ROWS
    this.cols = this.fixedCols ?? Math.max(8, Math.floor(r.width / this.pitch))
    this.dpr = dpr
    this.canvas.width = Math.round(r.width * dpr)
    this.canvas.height = Math.round(r.height * dpr)
    this.offX = (r.width - this.cols * this.pitch) / 2
    this.offY = (r.height - ROWS * this.pitch) / 2
    this.compile()
    this.paintSprites()
    this.lastKey = ''
    wake()
  }

  compile() {
    if (!this.cols) return
    this.compiled = this.messages.map((m) => compile(m, this.cols))
    this.index = 0
    // open mid-scroll so the first message reads immediately instead of sliding in from blank
    const first = this.compiled[0]
    this.tick = first?.effect === 'left' ? Math.max(0, this.cols - 1) : 0
    this.acc = 0
  }

  paintSprites() {
    if (!this.pitch) return
    const p = this.pitch * this.dpr
    const rgb = hexToRgb(this.glow)
    const ghost = mix([13, 10, 10], rgb, 0.13)
    const size = Math.ceil(p * 2)
    const lit = document.createElement('canvas')
    lit.width = lit.height = size
    const g = lit.getContext('2d')
    const c = size / 2
    const halo = g.createRadialGradient(c, c, p * 0.2, c, c, p)
    halo.addColorStop(0, css(rgb, 0.55))
    halo.addColorStop(0.45, css(rgb, 0.16))
    halo.addColorStop(1, css(rgb, 0))
    g.fillStyle = halo
    g.fillRect(0, 0, size, size)
    g.fillStyle = css(mix(rgb, [255, 255, 255], 0.35))
    g.beginPath()
    g.arc(c, c, p * 0.36, 0, Math.PI * 2)
    g.fill()
    this.sprite = lit

    const bed = document.createElement('canvas')
    bed.width = this.canvas.width
    bed.height = this.canvas.height
    const b = bed.getContext('2d')
    b.fillStyle = css(ghost)
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < this.cols; x++) {
        b.beginPath()
        b.arc((this.offX + (x + 0.5) * this.pitch) * this.dpr, (this.offY + (y + 0.5) * this.pitch) * this.dpr, p * 0.36, 0, Math.PI * 2)
        b.fill()
      }
    this.bed = bed
  }

  step(dt) {
    const c = this.compiled?.[this.index]
    if (!c) return
    this.acc += dt
    while (this.acc >= c.ms) {
      this.acc -= c.ms
      this.tick++
      if (this.tick >= c.ticks) {
        this.tick = 0
        this.index = (this.index + 1) % this.compiled.length
        return
      }
    }
  }

  draw(still) {
    const c = this.compiled?.[this.index]
    if (!c || !this.sprite) return
    const frame = still ? restingFrame(this.compiled[0], this.cols) : frameAt(c, this.tick, this.cols)
    const key = frame.data.join('')
    if (key === this.lastKey) return
    this.lastKey = key
    const { ctx, dpr, pitch, sprite } = this
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.drawImage(this.bed, 0, 0)
    const half = sprite.width / 2
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < this.cols; x++)
        if (frame.data[y * this.cols + x])
          ctx.drawImage(sprite, (this.offX + (x + 0.5) * pitch) * dpr - half, (this.offY + (y + 0.5) * pitch) * dpr - half)
  }
}

let last = 0
function loop(now) {
  raf = 0
  const dt = last ? Math.min(now - last, 250) : 0
  last = now
  let active = false
  for (const p of panels) {
    if (!p.visible) continue
    if (reduce.matches) { p.draw(true); continue }
    p.step(dt)
    p.draw(false)
    active = true
  }
  if (active) raf = requestAnimationFrame(loop)
  else last = 0
}

function wake() {
  if (!raf) raf = requestAnimationFrame(loop)
}
reduce.addEventListener('change', wake)

export function mountPanel(canvas, opts) {
  return (canvas._led ??= new Panel(canvas, opts))
}

export function mountAll(root = document) {
  root.querySelectorAll('canvas[data-led]').forEach((el) => {
    let opts = {}
    try { opts = JSON.parse(el.dataset.led || '{}') } catch {}
    mountPanel(el, opts)
  })
}

mountAll()
