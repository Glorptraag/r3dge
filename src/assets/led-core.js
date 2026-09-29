// Pure LED matrix model: text rasterising and effect frames. No DOM, so the
// build script can render the same pixels to SVG that the browser draws to canvas.
import { ASC11, PRESETS } from './led-data.js'

export const ROWS = 11
const PAUSE = 6

let font
function glyphBytes() {
  if (!font) {
    const bin = typeof atob === 'function' ? atob(ASC11) : Buffer.from(ASC11, 'base64').toString('binary')
    font = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  }
  return font
}

const blank = (w, h = ROWS) => ({ w, h, data: new Uint8Array(w * h) })

/** Rasterise text in the badge font, each glyph trimmed to its lit columns with a 1 px gap. */
export function textBitmap(text, { gap = 1, space = 3 } = {}) {
  const f = glyphBytes()
  const cols = []
  const chars = [...String(text)]
  chars.forEach((ch, i) => {
    let code = ch.codePointAt(0)
    if (code > 255) code = 63
    if (ch === ' ') {
      for (let s = 0; s < space; s++) cols.push(0)
      return
    }
    const rows = Array.from({ length: ROWS }, (_, y) => f[code * ROWS + y] || 0)
    let lo = 8, hi = -1
    for (let x = 0; x < 8; x++) if (rows.some((r) => (r >> (7 - x)) & 1)) { lo = Math.min(lo, x); hi = Math.max(hi, x) }
    if (hi < 0) { lo = 0; hi = 2 }
    for (let x = lo; x <= hi; x++) {
      let col = 0
      rows.forEach((r, y) => { if ((r >> (7 - x)) & 1) col |= 1 << y })
      cols.push(col)
    }
    if (i < chars.length - 1 && chars[i + 1] !== ' ') for (let g = 0; g < gap; g++) cols.push(0)
  })
  const b = blank(cols.length)
  cols.forEach((col, x) => { for (let y = 0; y < ROWS; y++) if ((col >> y) & 1) b.data[y * b.w + x] = 1 })
  return b
}

export function presetFrames(name) {
  const p = PRESETS[name]
  if (!p) return null
  return p.frames.map((rows) => {
    const b = blank(rows[0].length)
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') b.data[y * b.w + x] = 1 }))
    return b
  })
}

/** A message is { text } or { preset }, with an effect and a tick length in ms. */
export function compile(msg, cols) {
  const frames = msg.preset ? presetFrames(msg.preset) : [textBitmap(msg.text ?? '')]
  const preset = msg.preset ? PRESETS[msg.preset] : null
  let effect = msg.effect ?? preset?.effect ?? 'left'
  if (effect === 'animation' && frames.length === 1) effect = 'freeze'
  const bmp = frames[0]
  const fits = bmp.w <= cols
  if (!fits && effect !== 'left' && effect !== 'animation') effect = 'left'
  const ms = msg.ms ?? (effect === 'left' ? 55 : effect === 'animation' ? 1100 / (preset?.speed ?? 4) : 45)
  const ticks = {
    left: bmp.w + cols,
    freeze: msg.hold ?? 40,
    flash: msg.hold ?? 40,
    animation: frames.length * (msg.loops ?? 4),
    laser: cols + PAUSE * 4 + cols,
    piling: (ROWS * (ROWS + 1)) / 2 + PAUSE * 5,
  }[effect] ?? 40
  return { frames, effect, ms, ticks, ox: Math.floor((cols - bmp.w) / 2) }
}

/** Visible pixels of a compiled message at tick t on a panel `cols` wide. */
export function frameAt(c, t, cols) {
  const out = blank(cols)
  const put = (src, dx, dy = 0, keep = () => true) => {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        if (!src.data[y * src.w + x]) continue
        const tx = x + dx, ty = y + dy
        if (tx >= 0 && tx < cols && ty >= 0 && ty < ROWS && keep(tx, ty, x, y)) out.data[ty * cols + tx] = 1
      }
  }
  const bmp = c.frames[0]
  switch (c.effect) {
    case 'left':
      put(bmp, cols - t)
      break
    case 'animation': {
      const f = c.frames[t % c.frames.length]
      put(f, Math.floor((cols - f.w) / 2))
      break
    }
    case 'flash':
      if (Math.floor(t / 8) % 2 === 0) put(bmp, c.ox)
      break
    case 'laser': {
      const hold = PAUSE * 4
      const beam = (col, from, to) => {
        const sx = col - c.ox
        if (sx < 0 || sx >= bmp.w) return
        for (let y = 0; y < ROWS; y++) if (bmp.data[y * bmp.w + sx]) for (let x = from; x <= to; x++) out.data[y * cols + x] = 1
      }
      if (t < cols) {
        put(bmp, c.ox, 0, (tx) => tx <= t)
        beam(t, t, cols - 1)
      } else if (t < cols + hold) put(bmp, c.ox)
      else {
        const f = t - cols - hold
        put(bmp, c.ox, 0, (tx) => tx >= f)
        beam(f, 0, f)
      }
      break
    }
    case 'piling': {
      let rem = t, landed = ROWS, falling = -1, fy = 0
      for (let r = ROWS - 1; r >= 0; r--) {
        if (rem >= r + 1) { rem -= r + 1; landed = r } else { falling = r; fy = rem; break }
      }
      if (falling < 0) put(bmp, c.ox)
      else {
        put(bmp, c.ox, 0, (tx, ty) => ty >= landed)
        for (let x = 0; x < bmp.w; x++) if (bmp.data[falling * bmp.w + x] && x + c.ox < cols && x + c.ox >= 0) out.data[fy * cols + x + c.ox] = 1
      }
      break
    }
    default:
      put(bmp, c.ox)
  }
  return out
}

/** The frame a still (reduced-motion or no-JS) panel should show. */
export function restingFrame(c, cols) {
  if (c.effect === 'animation') return frameAt(c, 0, cols)
  const out = blank(cols)
  const bmp = c.frames[0]
  const dx = bmp.w <= cols ? c.ox : 1
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < bmp.w; x++) if (bmp.data[y * bmp.w + x] && x + dx < cols) out.data[y * cols + x + dx] = 1
  return out
}
