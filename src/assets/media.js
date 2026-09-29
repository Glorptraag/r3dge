// One media slot renderer shared by the build (Node) and the browser, so product
// photos can be swapped for video loops or 3D models by editing data only.
//   "path/or/url.jpg"                                   -> image
//   { "type": "image", "src": "..." }
//   { "type": "video", "src": "loop.mp4", "poster": "poster.webp" }
//   { "type": "model", "src": "case.glb", "ios": "case.usdz", "poster": "poster.webp" }

const escAttr = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const normalize = (m) => (typeof m === 'string' ? { type: 'image', src: m } : { type: 'image', ...m })

/** Etsy CDN images come in fixed sizes; anything else is used as given. */
export const sized = (src, size) => (src && src.includes('etsystatic.com') ? src.replaceAll('il_fullxfull', size) : src)

export function thumbSrc(m) {
  m = normalize(m)
  return sized(m.type === 'image' ? m.src : m.poster, 'il_340x270')
}

export function posterSrc(m, size = 'il_570xN') {
  m = normalize(m)
  return sized(m.type === 'image' ? m.src : m.poster, size)
}

export function mediaHtml(m, { alt = '', size = 'il_794xN', eager = false, w = 794, h = 794, cls = '' } = {}) {
  m = normalize(m)
  const c = cls ? ` class="${cls}"` : ''
  if (m.type === 'video')
    return `<video${c} src="${escAttr(m.src)}"${m.poster ? ` poster="${escAttr(sized(m.poster, size))}"` : ''} muted loop playsinline autoplay preload="metadata" width="${w}" height="${h}"${alt ? ` aria-label="${escAttr(alt)}"` : ' aria-hidden="true"'}></video>`
  if (m.type === 'model')
    return `<model-viewer${c} src="${escAttr(m.src)}"${m.ios ? ` ios-src="${escAttr(m.ios)}"` : ''}${m.poster ? ` poster="${escAttr(sized(m.poster, size))}"` : ''} alt="${escAttr(alt || 'Rotatable 3D model')}" camera-controls auto-rotate ar touch-action="pan-y" shadow-intensity="1"></model-viewer>`
  return `<img${c} src="${escAttr(sized(m.src, size))}" alt="${escAttr(alt)}" loading="${eager ? 'eager' : 'lazy'}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ''}>`
}
