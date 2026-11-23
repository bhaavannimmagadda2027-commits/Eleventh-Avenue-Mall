import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PRODUCTS, isProduce, type Art, type Product } from '../data/products'
import { canvasTex, rng, rr } from './textures'
import { font } from '../styles/tokens'

const F = (w: number, px: number) => `${w} ${px}px ${font.family}`
const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

/* ---------------- packaging art ---------------- */

function art(g: CanvasRenderingContext2D, a: Art | undefined, cx: number, cy: number, r: number, p: Product) {
  g.save(); g.translate(cx, cy); g.lineCap = 'round'; g.lineJoin = 'round'
  const accent = p.colors[1] ?? '#333'
  const bowl = (fill: string) => {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, r * 0.15, r * 0.95, r * 0.3, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = fill; g.beginPath(); g.ellipse(0, r * 0.12, r * 0.85, r * 0.24, 0, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#F4F1EA'; g.beginPath(); g.moveTo(-r * 0.95, r * 0.15); g.quadraticCurveTo(-r * 0.9, r * 0.85, 0, r * 0.85); g.quadraticCurveTo(r * 0.9, r * 0.85, r * 0.95, r * 0.15); g.fill()
    g.strokeStyle = accent; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.8, r * 0.5); g.quadraticCurveTo(0, r * 0.62, r * 0.8, r * 0.5); g.stroke()
  }
  const R = rng(a ? a.length * 31 : 3)
  switch (a) {
    case 'cow': // glass of milk with a splash
      g.fillStyle = accent; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill()
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(-r * 0.35, -r * 0.55); g.lineTo(r * 0.35, -r * 0.55); g.lineTo(r * 0.28, r * 0.65); g.lineTo(-r * 0.28, r * 0.65); g.closePath(); g.fill()
      g.beginPath(); g.moveTo(-r * 0.75, -r * 0.35); g.quadraticCurveTo(-r * 0.3, -r * 0.75, 0, -r * 0.5); g.quadraticCurveTo(r * 0.3, -r * 0.8, r * 0.75, -r * 0.4); g.quadraticCurveTo(r * 0.3, -r * 0.45, 0, -r * 0.35); g.quadraticCurveTo(-r * 0.3, -r * 0.3, -r * 0.75, -r * 0.35); g.fill(); break
    case 'curd': bowl('#FFFFFF'); break
    case 'paneer':
      ;[[-0.4, 0.1], [0.15, 0.2], [-0.1, -0.3], [0.45, -0.2]].forEach(([x, y]) => { g.fillStyle = '#FBF7EC'; rr(g, x * r - r * 0.25, y * r - r * 0.25, r * 0.5, r * 0.5, r * 0.06); g.fill(); g.strokeStyle = '#E4DCC8'; g.lineWidth = 2; g.stroke() }); break
    case 'butter':
      g.fillStyle = '#F9E07A'; rr(g, -r * 0.8, -r * 0.2, r * 1.6, r * 0.7, r * 0.08); g.fill()
      g.fillStyle = '#FCEFB4'; g.beginPath(); g.ellipse(-r * 0.1, -r * 0.35, r * 0.5, r * 0.16, -0.2, 0, 7); g.fill(); break
    case 'egg':
      ;[[-0.35, 0.05], [0.35, 0.1]].forEach(([x, y]) => { g.fillStyle = '#D9B78E'; g.beginPath(); g.ellipse(x * r, y * r, r * 0.42, r * 0.55, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x * r - r * 0.12, y * r - r * 0.2, r * 0.1, r * 0.18, 0, 0, 7); g.fill() }); break
    case 'cheese':
      g.fillStyle = '#F7C948'; g.beginPath(); g.moveTo(-r * 0.8, r * 0.5); g.lineTo(r * 0.8, r * 0.5); g.lineTo(r * 0.5, -r * 0.5); g.closePath(); g.fill()
      g.fillStyle = '#E5AE24'; [[0.1, 0.2], [0.4, 0.05], [-0.2, 0.35]].forEach(([x, y]) => { g.beginPath(); g.arc(x * r, y * r, r * 0.09, 0, 7); g.fill() }); break
    case 'flakes':
      bowl('#F2C230')
      for (let i = 0; i < 18; i++) { g.fillStyle = ['#E8A21E', '#F4C247', '#D98E16'][i % 3]; g.beginPath(); g.ellipse((R() - 0.5) * r * 1.4, -r * 0.05 + (R() - 0.5) * r * 0.3, r * 0.14, r * 0.08, R() * 3, 0, 7); g.fill() }
      g.fillStyle = '#C9372C'; g.beginPath(); g.arc(r * 0.45, -r * 0.2, r * 0.12, 0, 7); g.fill(); break
    case 'muesli':
      bowl('#D8C29A')
      for (let i = 0; i < 22; i++) { g.fillStyle = ['#8A5A32', '#C9372C', '#E9D8B0', '#6E3B2A'][i % 4]; g.beginPath(); g.arc((R() - 0.5) * r * 1.4, -r * 0.02 + (R() - 0.5) * r * 0.3, r * 0.06, 0, 7); g.fill() }; break
    case 'oats':
      bowl('#EADBB8')
      for (let i = 0; i < 14; i++) { g.fillStyle = '#D9C08E'; g.beginPath(); g.ellipse((R() - 0.5) * r * 1.4, -r * 0.02 + (R() - 0.5) * r * 0.3, r * 0.09, r * 0.05, R() * 3, 0, 7); g.fill() }; break
    case 'honey':
      g.fillStyle = '#E8A21E'; g.beginPath(); g.arc(0, r * 0.1, r * 0.6, 0, 7); g.fill()
      g.strokeStyle = '#8A5A32'; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 0.8, -r * 0.7); g.lineTo(r * 0.1, 0); g.stroke(); break
    case 'rice': case 'dal':
      for (let i = 0; i < 40; i++) { g.fillStyle = a === 'rice' ? ['#FFFFFF', '#F4EEDF'][i % 2] : ['#E8B32A', '#F2C247'][i % 2]; g.beginPath(); g.ellipse((R() - 0.5) * r * 1.8, (R() - 0.5) * r * 1.2, a === 'rice' ? r * 0.16 : r * 0.08, r * 0.06, R() * 3, 0, 7); g.fill() }
      if (a === 'rice') { g.strokeStyle = '#C9A24A'; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.2, r * 0.8); g.quadraticCurveTo(r * 0.1, 0, r * 0.6, -r * 0.8); g.stroke() }
      break
    case 'wheat':
      g.strokeStyle = '#B8862E'; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(0, r); g.lineTo(0, -r * 0.4); g.stroke()
      for (let i = 0; i < 6; i++) { g.fillStyle = '#D9A33E'; ;[-1, 1].forEach((s) => { g.beginPath(); g.ellipse(s * r * 0.14, -r * 0.5 + i * r * 0.22, r * 0.1, r * 0.2, s * 0.5, 0, 7); g.fill() }) }; break
    case 'oil':
      g.fillStyle = '#F2C230'; for (let i = 0; i < 12; i++) { g.save(); g.rotate((i / 12) * Math.PI * 2); g.beginPath(); g.ellipse(0, -r * 0.6, r * 0.14, r * 0.34, 0, 0, 7); g.fill(); g.restore() }
      g.fillStyle = '#6E3B2A'; g.beginPath(); g.arc(0, 0, r * 0.38, 0, 7); g.fill(); break
    case 'chips': case 'chilli':
      for (let i = 0; i < 6; i++) { g.fillStyle = ['#F2C247', '#E8A21E', '#F7D46A'][i % 3]; g.beginPath(); g.ellipse((R() - 0.5) * r * 1.1, (R() - 0.5) * r * 0.9, r * 0.38, r * 0.28, R() * 3, 0, 7); g.fill() }
      if (a === 'chilli') { g.fillStyle = '#C9372C'; g.beginPath(); g.moveTo(-r * 0.7, r * 0.6); g.quadraticCurveTo(r * 0.2, r * 0.7, r * 0.8, -r * 0.5); g.quadraticCurveTo(r * 0.1, r * 0.4, -r * 0.7, r * 0.6); g.fill() }
      break
    case 'biscuit':
      ;[[-0.45, 0], [0.1, -0.1], [0.55, 0.1]].forEach(([x, y]) => { g.fillStyle = '#E2B56A'; g.beginPath(); g.arc(x * r, y * r, r * 0.38, 0, 7); g.fill(); g.strokeStyle = '#C99A4E'; g.lineWidth = 3; g.beginPath(); g.arc(x * r, y * r, r * 0.26, 0, 7); g.stroke() }); break
    case 'coffee': case 'tea':
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(-r * 0.5, -r * 0.3); g.lineTo(r * 0.5, -r * 0.3); g.lineTo(r * 0.38, r * 0.5); g.lineTo(-r * 0.38, r * 0.5); g.closePath(); g.fill()
      g.fillStyle = a === 'coffee' ? '#5A3A22' : '#A8562A'; g.beginPath(); g.ellipse(0, -r * 0.3, r * 0.5, r * 0.1, 0, 0, 7); g.fill()
      g.strokeStyle = '#FFFFFF'; g.lineWidth = r * 0.08; g.beginPath(); g.arc(r * 0.55, r * 0.05, r * 0.18, -1.3, 1.3); g.stroke()
      if (a === 'tea') { g.fillStyle = '#4E8A3E'; g.beginPath(); g.ellipse(-r * 0.6, -r * 0.6, r * 0.12, r * 0.28, 0.8, 0, 7); g.fill() }
      else { g.fillStyle = '#3E2A1E'; [[-0.7, 0.6], [0.75, 0.6]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x * r, y * r, r * 0.12, r * 0.17, 0.4, 0, 7); g.fill() }) }
      break
    case 'orange': case 'mango':
      g.fillStyle = a === 'orange' ? '#F59A2E' : '#F2B21E'
      if (a === 'orange') { g.beginPath(); g.arc(0, 0, r * 0.65, 0, 7); g.fill(); g.fillStyle = '#FCD9A0'; for (let i = 0; i < 8; i++) { g.save(); g.rotate((i / 8) * Math.PI * 2); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r * 0.5, -0.3, 0.3); g.closePath(); g.fill(); g.restore() } }
      else { g.beginPath(); g.ellipse(0, 0, r * 0.5, r * 0.7, 0.5, 0, 7); g.fill(); g.fillStyle = '#4E8A3E'; g.beginPath(); g.ellipse(r * 0.25, -r * 0.65, r * 0.12, r * 0.26, 1.1, 0, 7); g.fill() }
      break
    case 'drop':
      g.fillStyle = accent; g.beginPath(); g.moveTo(0, -r * 0.8); g.quadraticCurveTo(r * 0.7, 0, r * 0.45, r * 0.4); g.arc(0, r * 0.35, r * 0.45, 0, Math.PI); g.quadraticCurveTo(-r * 0.7, 0, 0, -r * 0.8); g.fill()
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-r * 0.15, r * 0.15, r * 0.08, r * 0.18, 0.3, 0, 7); g.fill(); break
    case 'aloe':
      g.fillStyle = '#4E8A3E'; for (let i = -2; i <= 2; i++) { g.save(); g.rotate(i * 0.32); g.beginPath(); g.ellipse(0, -r * 0.35, r * 0.13, r * 0.6, 0, 0, 7); g.fill(); g.restore() }; break
    case 'rose':
      g.fillStyle = accent; for (let i = 0; i < 6; i++) { g.save(); g.rotate((i / 6) * Math.PI * 2); g.beginPath(); g.ellipse(0, -r * 0.35, r * 0.3, r * 0.42, 0, 0, 7); g.fill(); g.restore() }
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(0, 0, r * 0.25, 0, 7); g.fill(); break
    case 'sun':
      g.fillStyle = '#E8762A'; g.beginPath(); g.arc(0, 0, r * 0.4, 0, 7); g.fill()
      g.strokeStyle = '#E8762A'; g.lineWidth = r * 0.1; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55); g.lineTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); g.stroke() }; break
    case 'hair':
      g.strokeStyle = accent; g.lineWidth = r * 0.12; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * r * 0.25, -r * 0.8); g.bezierCurveTo(i * r * 0.25 + r * 0.4, -r * 0.2, i * r * 0.25 - r * 0.4, r * 0.2, i * r * 0.25, r * 0.8); g.stroke() }; break
    case 'bolt':
      g.fillStyle = accent; g.beginPath(); g.moveTo(r * 0.15, -r * 0.85); g.lineTo(-r * 0.45, r * 0.1); g.lineTo(-r * 0.02, r * 0.1); g.lineTo(-r * 0.15, r * 0.85); g.lineTo(r * 0.45, -r * 0.1); g.lineTo(r * 0.02, -r * 0.1); g.closePath(); g.fill(); break
    case 'sock':
      ;['#E8604C', '#F2C84B', '#3B6FD6'].forEach((c, i) => { g.fillStyle = c; g.save(); g.translate((i - 1) * r * 0.55, 0); g.fillRect(-r * 0.16, -r * 0.7, r * 0.32, r * 0.9); g.beginPath(); g.ellipse(r * 0.06, r * 0.25, r * 0.28, r * 0.17, 0, 0, 7); g.fill(); g.restore() }); break
    case 'spray':
      g.fillStyle = accent; for (let i = 0; i < 16; i++) { const a = -0.6 + (i % 4) * 0.4, d = r * (0.3 + Math.floor(i / 4) * 0.18); g.beginPath(); g.arc(Math.cos(a) * d - r * 0.3, Math.sin(a) * d, r * 0.05, 0, 7); g.fill() }; break
  }
  g.restore()
}

function categoryOf(p: Product) {
  return p.storeId === 'palette' ? 'beauty' : p.storeId === 'croma' ? 'tech' : p.storeId === 'zudio' ? 'apparel' : p.storeId === 'westside-home' ? 'home' : 'food'
}

const seedOf = (t: string) => { let n = 7; for (let i = 0; i < t.length; i++) n = (n * 31 + t.charCodeAt(i)) >>> 0; return n }
const lumOf = (hex: string) => new THREE.Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l
const tint = (hex: string, dl: number) => '#' + new THREE.Color(hex).offsetHSL(0, 0, dl).getHexString()
const WRAPPED = new Set(['bottle', 'jar', 'tub', 'tube', 'dropper'])

type PackStyle = 'clean' | 'burst' | 'wave' | 'heritage' | 'window' | 'slash' | 'arch'
function packStyle(p: Product): PackStyle {
  if (categoryOf(p) === 'beauty') return 'clean'
  if (p.art === 'tea' || p.art === 'coffee') return 'heritage'
  if (WRAPPED.has(p.shape)) return 'window'
  if (p.shape === 'pillow') return p.art === 'chips' || p.art === 'chilli' ? 'burst' : 'arch'
  if (p.shape === 'tetra') return 'wave'
  return (['window', 'slash', 'arch'] as const)[seedOf(p.brand) % 3]
}

/** Fits text to a width, breaking onto a second line before it gets too small to read. */
function fitText(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, maxW: number, weight: number, size: number, min: number) {
  let fs = size
  g.font = F(weight, fs)
  while (g.measureText(text).width > maxW && fs > min * 1.5) { fs -= 2; g.font = F(weight, fs) }
  const words = text.split(' ')
  if (g.measureText(text).width > maxW && words.length > 1) {
    const cut = Math.ceil(words.length / 2), lines = [words.slice(0, cut).join(' '), words.slice(cut).join(' ')]
    while (lines.some((l) => g.measureText(l).width > maxW) && fs > min) { fs -= 2; g.font = F(weight, fs) }
    g.fillText(lines[0], cx, cy - fs * 0.56); g.fillText(lines[1], cx, cy + fs * 0.56)
    return
  }
  while (g.measureText(text).width > maxW && fs > min) { fs -= 2; g.font = F(weight, fs) }
  g.fillText(text, cx, cy)
}

/** Front of pack. Each kind of product gets its own layout, so a shelf reads as different brands. */
function paintPack(g: CanvasRenderingContext2D, p: Product, w: number, h: number) {
  const [bg, accent] = p.colors
  const u = Math.min(w, h) / 512, style = packStyle(p), cat = categoryOf(p)
  const ink = lumOf(bg) > 0.56 ? '#211F1B' : '#FFFFFF'
  const onAccent = lumOf(accent) > 0.56 ? '#211F1B' : '#FFFFFF'
  const panel = lumOf(bg) > 0.56 ? tint(bg, -0.07) : tint(bg, 0.09)
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  g.textAlign = 'center'; g.textBaseline = 'middle'
  let artY = h * 0.48, artR = Math.min(w, h) * 0.25, nameInk = ink, sizeInk = ink
  switch (style) {
    case 'burst': {
      g.save(); g.translate(w / 2, h * 0.47); g.fillStyle = panel
      const reach = Math.hypot(w, h)
      for (let i = 0; i < 16; i++) { g.rotate(Math.PI / 8); g.beginPath(); g.moveTo(0, 0); g.lineTo(reach, -reach * 0.1); g.lineTo(reach, reach * 0.1); g.fill() }
      g.restore()
      g.fillStyle = accent; g.beginPath(); g.moveTo(0, h * 0.72); g.quadraticCurveTo(w / 2, h * 0.64, w, h * 0.72); g.lineTo(w, h); g.lineTo(0, h); g.fill()
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(w / 2, artY, artR * 1.18, 0, 7); g.fill()
      nameInk = onAccent; sizeInk = onAccent
      break
    }
    case 'wave': {
      g.fillStyle = accent; g.beginPath(); g.moveTo(0, h * 0.6)
      g.bezierCurveTo(w * 0.3, h * 0.5, w * 0.62, h * 0.72, w, h * 0.57); g.lineTo(w, h); g.lineTo(0, h); g.fill()
      g.fillStyle = tint(accent, 0.12); g.beginPath(); g.moveTo(0, h * 0.68)
      g.bezierCurveTo(w * 0.35, h * 0.6, w * 0.65, h * 0.78, w, h * 0.65); g.lineTo(w, h); g.lineTo(0, h); g.fill()
      artY = h * 0.39; nameInk = onAccent; sizeInk = onAccent
      break
    }
    case 'heritage': {
      g.strokeStyle = accent; g.lineWidth = 7 * u; g.strokeRect(16 * u, 16 * u, w - 32 * u, h - 32 * u)
      g.lineWidth = 2 * u; g.strokeRect(29 * u, 29 * u, w - 58 * u, h - 58 * u)
      g.fillStyle = accent; g.fillRect(29 * u, h * 0.68, w - 58 * u, h * 0.15)
      artY = h * 0.45; artR *= 0.92; nameInk = onAccent
      g.strokeStyle = accent; g.lineWidth = 3 * u; g.beginPath(); g.arc(w / 2, artY, artR * 1.22, 0, 7); g.stroke()
      break
    }
    case 'slash': {
      g.fillStyle = accent; g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.34); g.lineTo(w, h); g.lineTo(0, h); g.fill()
      g.fillStyle = panel; g.beginPath(); g.moveTo(0, h * 0.46); g.lineTo(w, h * 0.3); g.lineTo(w, h * 0.34); g.lineTo(0, h * 0.5); g.fill()
      artY = h * 0.5; nameInk = onAccent; sizeInk = onAccent
      break
    }
    case 'arch': {
      g.fillStyle = panel; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.1, h * 0.46)
      g.arc(w / 2, h * 0.46, w * 0.4, Math.PI, 0); g.lineTo(w * 0.9, h); g.fill()
      g.fillStyle = accent; g.fillRect(0, h * 0.7, w, h * 0.17)
      nameInk = onAccent
      break
    }
    case 'window': {
      g.fillStyle = accent; g.fillRect(0, 0, w, h * 0.055); g.fillRect(0, h * 0.945, w, h * 0.055)
      g.fillStyle = panel; g.beginPath(); g.arc(w / 2, artY, artR * 1.26, 0, 7); g.fill()
      g.strokeStyle = accent; g.lineWidth = 5 * u; g.stroke()
      break
    }
    case 'clean': {
      g.strokeStyle = ink; g.globalAlpha = 0.45; g.lineWidth = 2 * u
      g.beginPath(); g.moveTo(w * 0.2, h * 0.27); g.lineTo(w * 0.8, h * 0.27); g.moveTo(w * 0.2, h * 0.68); g.lineTo(w * 0.8, h * 0.68); g.stroke()
      g.globalAlpha = 1; artR *= 0.62
      break
    }
  }
  // brand wordmark: text only, and the biggest thing on the pack
  g.fillStyle = ink
  const brand = style === 'heritage' || style === 'clean' ? p.brand.toUpperCase() : p.brand
  fitText(g, brand, w / 2, style === 'clean' ? h * 0.17 : h * 0.14, w * (style === 'heritage' ? 0.76 : 0.86), style === 'clean' ? 500 : 700, 76 * u, 24 * u)
  art(g, p.art, w / 2, artY, artR, p)
  g.fillStyle = nameInk
  fitText(g, p.name.split(',')[0], w / 2, style === 'clean' ? h * 0.76 : h * 0.775, w * 0.84, style === 'clean' ? 500 : 700, 52 * u, 24 * u)
  g.fillStyle = sizeInk; g.globalAlpha = 0.86
  g.font = F(500, 28 * u); g.fillText(p.size, w / 2, style === 'clean' ? h * 0.86 : h * 0.895); g.globalAlpha = 1
  if (cat === 'food') {
    const b = 36 * u, x = w - b - 20 * u, y = 74 * u + h * 0.1
    g.fillStyle = '#FFFFFF'; g.fillRect(x, y, b, b)
    g.strokeStyle = '#2E8B3E'; g.lineWidth = 3 * u; g.strokeRect(x + 2 * u, y + 2 * u, b - 4 * u, b - 4 * u)
    g.fillStyle = '#2E8B3E'; g.beginPath(); g.arc(x + b / 2, y + b / 2, 9 * u, 0, 7); g.fill()
  }
  // soft printed sheen, so a flat face does not read as a sticker
  const sheen = g.createLinearGradient(0, 0, w, 0)
  sheen.addColorStop(0, 'rgba(0,0,0,.14)'); sheen.addColorStop(0.28, 'rgba(255,255,255,.1)'); sheen.addColorStop(0.62, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(0,0,0,.16)')
  g.fillStyle = sheen; g.fillRect(0, 0, w, h)
}

/** Front-of-pack label, capped in size because tall packs would otherwise use very large textures. */
export function labelTex(p: Product, w = 512, h = 512) {
  const k = Math.min(1, 720 / Math.max(w, h)), tw = Math.round(w * k), th = Math.round(h * k)
  return canvasTex(`label-${p.id}-${tw}x${th}`, tw, th, (g) => paintPack(g, p, tw, th))
}

/** Pack side: brand running up the panel, with a pale information block and barcode. */
function sideTex(p: Product) {
  return canvasTex(`side-${p.id}`, 128, 384, (g, w, h) => {
    const [bg, accent] = p.colors
    g.fillStyle = accent; g.fillRect(0, 0, w, h)
    g.fillStyle = bg; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14)
    g.save(); g.translate(w / 2, h * 0.36); g.rotate(-Math.PI / 2)
    g.fillStyle = lumOf(accent) > 0.56 ? '#211F1B' : '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'
    let fs = 46; g.font = F(700, fs)
    while (g.measureText(p.brand).width > h * 0.58 && fs > 18) { fs -= 2; g.font = F(700, fs) }
    g.fillText(p.brand, 0, 0); g.restore()
    g.fillStyle = '#FFFFFF'; g.fillRect(18, h * 0.72, w - 36, h * 0.2)
    g.fillStyle = '#211F1B'
    const R = rng(seedOf(p.id))
    for (let x = 25; x < w - 25;) { const b = 1 + Math.floor(R() * 3); g.fillRect(x, h * 0.745, b, h * 0.15); x += b + 1 + Math.floor(R() * 3) }
  })
}

/** Wrap-around label for bottles, tubs and jars: the front art centred on a seamless band. */
function wrapTex(p: Product, aspect: number) {
  const h = 256, w = Math.min(2048, Math.round(h * aspect))
  return canvasTex(`wrap-${p.id}`, w, h, (g) => {
    const [bg, accent] = p.colors
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    g.fillStyle = accent; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14)
    const fw = h * 1.1, fx = w / 2 - fw / 2
    g.drawImage(labelTex(p, 512, 512).image as HTMLCanvasElement, fx, 0, fw, h)
  })
}

/** Shelf-edge price tag: white with the store green edge; chalkboard for produce crates. */
export function tagTex(p: Product) {
  const chalk = isProduce(p)
  return canvasTex(`tag-${p.id}`, 256, 104, (g, w, h) => {
    g.fillStyle = chalk ? '#2E2B27' : '#FFFFFF'; g.fillRect(0, 0, w, h)
    if (!chalk) { g.fillStyle = '#689F38'; g.fillRect(0, 0, 9, h) }
    g.fillStyle = chalk ? '#F6F1E6' : '#262626'; g.textBaseline = 'middle'
    g.font = F(700, 44); g.fillText(inr(p.price), chalk ? 16 : 22, h * 0.4)
    if (p.mrp) { g.font = F(500, 20); g.globalAlpha = 0.6; const x = g.measureText(inr(p.price)).width; g.font = F(500, 20); g.fillText(inr(p.mrp), (chalk ? 16 : 22) + x + 52, h * 0.42); g.globalAlpha = 1 }
    g.font = F(500, 19); g.globalAlpha = 0.78
    g.fillText(`${p.name.split(/[,(]/)[0].slice(0, 16)} · ${p.size}`, chalk ? 17 : 23, h * 0.8)
    g.globalAlpha = 1
    if (p.offer) { g.fillStyle = '#E89A50'; rr(g, w - 64, 8, 56, 26, 8); g.fill(); g.fillStyle = '#FFF'; g.font = F(700, 15); g.textAlign = 'center'; g.fillText('OFFER', w - 36, 22) }
  })
}

/* ---------------- geometry ---------------- */

function paint(geo: THREE.BufferGeometry, color: string | ((y: number, x: number, z: number) => string)) {
  const pos = geo.attributes.position
  const arr = new Float32Array(pos.count * 3)
  const c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    c.set(typeof color === 'string' ? color : color(pos.getY(i), pos.getX(i), pos.getZ(i)))
    arr.set([c.r, c.g, c.b], i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return geo
}
const clean = (g: THREE.BufferGeometry) => {
  for (const n of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(n)) g.deleteAttribute(n)
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
  return g.index ? g.toNonIndexed() : g
}
const merge = (gs: THREE.BufferGeometry[]) => mergeGeometries(gs.map(clean), false)!

/* Produce is modelled with smooth welded surfaces and painted per vertex, so it reads as food rather than primitives. */
const weld = (g: THREE.BufferGeometry) => {
  g.deleteAttribute('normal'); g.deleteAttribute('uv')
  const w = mergeVertices(g, 1e-4)
  w.computeVertexNormals()
  return w
}
function reshape(g: THREE.BufferGeometry, f: (v: THREE.Vector3) => void) {
  const pos = g.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); f(v); pos.setXYZ(i, v.x, v.y, v.z) }
  g.computeVertexNormals()
  return g
}
function tone(g: THREE.BufferGeometry, f: (v: THREE.Vector3, c: THREE.Color) => void) {
  const pos = g.attributes.position, arr = new Float32Array(pos.count * 3), v = new THREE.Vector3(), c = new THREE.Color()
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); f(v, c); arr.set([c.r, c.g, c.b], i * 3) }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return g
}
const speck = (x: number, y: number, z: number) => Math.sin(x * 211 + y * 97) * Math.cos(z * 173 - y * 131)
const mix = (c: THREE.Color, a: string, b: string, t: number) => c.set(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)))
const onFloor = (g: THREE.BufferGeometry) => { g.computeBoundingBox(); return g.translate(0, -g.boundingBox!.min.y, 0) }

/** A soft leaf: an ellipse with a raised midrib, arched along its length. */
function leafGeo(len: number, wide: number, arch: number, inner: string, outer: string, seg = 4) {
  const g = new THREE.PlaneGeometry(len, wide, seg, seg > 2 ? 2 : 1).rotateX(-Math.PI / 2).translate(len / 2, 0, 0)
  reshape(g, (v) => {
    const t = v.x / len, w = Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.96 + 0.04)), 0.7)
    const side = v.z / (wide / 2)
    v.z *= w
    v.y = Math.sin(t * Math.PI * 0.8) * arch - Math.abs(side) * w * wide * 0.12 + Math.sin(t * 14 + side * 3) * wide * 0.035
  })
  return tone(g, (v, c) => mix(c, inner, outer, Math.abs(v.z) / (wide * 0.42) * 0.7 + (v.x / len) * 0.3))
}

/** One produce item (or bunch) with baked vertex colours, origin at its resting base. */
function produceGeo(p: Product): THREE.BufferGeometry {
  const r = p.dims[0]
  const R = rng(p.id.length * 13)
  const [main, second = main, third = second] = p.colors
  switch (p.shape) {
    case 'round': {
      const g = weld(new THREE.SphereGeometry(r, 12, 9))
      const extra: THREE.BufferGeometry[] = []
      const id = p.id
      reshape(g, (v) => {
        const u = v.y / r, a = Math.atan2(v.z, v.x)
        if (id === 'tomato') {
          const k = 1 + 0.045 * Math.cos(a * 5) * Math.max(0, u + 0.2)
          v.x *= k * 1.06; v.z *= k * 1.06; v.y *= 0.82
          if (u > 0.68) v.y -= (u - 0.68) * r * 0.55
        } else if (id === 'apple') {
          const k = 1 + 0.09 * Math.sin(Math.PI * Math.max(0, (u + 0.2) / 1.2)) - 0.13 * Math.max(0, -u)
          v.x *= k; v.z *= k; v.y *= 0.92
          if (u > 0.72) v.y -= (u - 0.72) * r * 0.95
          if (u < -0.82) v.y += (-u - 0.82) * r * 0.7
        } else if (id === 'onion') {
          const n = Math.max(0, u - 0.42)
          v.x *= 1.04 - n * 1.5; v.z *= 1.04 - n * 1.5; v.y = v.y * 0.86 + n * n * r * 1.5
        } else if (id === 'potato') {
          const k = 1 + 0.07 * Math.sin(v.x * 42 + 1) * Math.cos(v.z * 37) + 0.05 * Math.sin(v.y * 51 + 2)
          v.x *= k * 1.28; v.y *= k * 0.8; v.z *= k * 0.96
        } else if (id === 'pomegranate') {
          const k = 1 + 0.035 * Math.cos(a * 6)
          v.x *= k; v.z *= k; v.y *= 0.94
        } else {
          v.y *= 0.95
          if (u > 0.86) v.y -= (u - 0.86) * r * 0.5
        }
      })
      tone(g, (v, c) => {
        const u = v.y / r, a = Math.atan2(v.z, v.x), n = speck(v.x, v.y, v.z)
        if (id === 'apple') { mix(c, main, '#E7B64C', Math.max(0, Math.sin(a * 3 + u * 2) * 0.32) + Math.max(0, -u - 0.2) * 0.75); if (u > 0.62) c.lerp(new THREE.Color('#B7A04A'), (u - 0.62) * 0.8) }
        else if (id === 'onion') { mix(c, main, '#D8A5B0', Math.pow(Math.abs(Math.sin(a * 9)), 5) * 0.55 + Math.max(0, u - 0.45) * 0.9) }
        else if (id === 'potato') { mix(c, main, '#8E6C42', n > 0.72 ? 0.8 : Math.abs(n) * 0.16) }
        else if (id === 'pomegranate') { mix(c, main, '#D86A58', Math.max(0, Math.sin(a * 2 + u * 3)) * 0.5) }
        else if (id === 'tomato') { mix(c, main, '#F0A030', Math.max(0, u - 0.45) * 0.8) }
        else if (id === 'orange') { mix(c, main, second, n * 0.5 + 0.3); if (u > 0.78) c.lerp(new THREE.Color('#C9A23A'), 0.45) }
        else c.set(main)
      })
      g.computeBoundingBox()
      const y = g.boundingBox!.max.y
      if (id === 'tomato') {
        for (let i = 0; i < 5; i++) extra.push(leafGeo(r * 0.5, r * 0.2, r * 0.05, '#3F7A2C', '#2F6424', 2).rotateY((i / 5) * Math.PI * 2).translate(0, y - r * 0.12, 0))
        extra.push(paint(new THREE.CylinderGeometry(r * 0.05, r * 0.08, r * 0.2, 5).translate(0, y, 0), '#4F7F35'))
      } else if (id === 'apple') extra.push(paint(new THREE.CylinderGeometry(r * 0.035, r * 0.05, r * 0.42, 5).rotateZ(0.25).translate(r * 0.03, y - r * 0.04, 0), '#5A3F26'))
      else if (id === 'onion') extra.push(paint(new THREE.ConeGeometry(r * 0.13, r * 0.34, 6).translate(0, y + r * 0.1, 0), '#C9A27A'))
      else if (id === 'pomegranate') {
        for (let i = 0; i < 6; i++) { const t = (i / 6) * Math.PI * 2; extra.push(paint(new THREE.ConeGeometry(r * 0.09, r * 0.3, 4).rotateZ(-0.4).rotateY(t).translate(Math.cos(t) * r * 0.1, y + r * 0.08, -Math.sin(t) * r * 0.1), '#7D1A28')) }
      } else if (id === 'orange') extra.push(paint(new THREE.CylinderGeometry(r * 0.06, r * 0.08, r * 0.05, 6).translate(0, y - r * 0.03, 0), '#5E7A32'))
      return onFloor(merge([g, ...extra]))
    }
    case 'capsicum': {
      const g = weld(new THREE.SphereGeometry(r, 14, 8))
      reshape(g, (v) => {
        const u = v.y / r, a = Math.atan2(v.z, v.x)
        const lobe = 1 + 0.13 * Math.pow(Math.abs(Math.cos(a * 2)), 0.7) - 0.05
        const taper = u < 0 ? 1 + u * 0.24 : 1 + (1 - u) * 0.04
        v.x *= lobe * taper; v.z *= lobe * taper; v.y *= 1.12
        if (u > 0.74) v.y -= (u - 0.74) * r * 1.0
        if (u < -0.84) v.y += (-u - 0.84) * r * 0.8
      })
      tone(g, (v, c) => { const a = Math.atan2(v.z, v.x); mix(c, main, '#1F5C1F', Math.pow(1 - Math.abs(Math.cos(a * 2)), 3) * 0.75); if (v.y > r * 0.72) c.lerp(new THREE.Color('#6FAF45'), 0.35) })
      g.computeBoundingBox()
      const stem = paint(new THREE.CylinderGeometry(r * 0.09, r * 0.16, r * 0.42, 6).rotateZ(0.14).translate(0, g.boundingBox!.max.y - r * 0.02, 0), '#587F36')
      return onFloor(merge([g, stem]))
    }
    case 'leafy': {
      const core = weld(new THREE.SphereGeometry(r * 0.86, 10, 7))
      reshape(core, (v) => { v.y *= 0.92; v.multiplyScalar(1 + Math.sin(v.x * 44) * Math.cos(v.z * 39) * 0.035) })
      tone(core, (v, c) => mix(c, '#DDEBAE', second, 0.35 + speck(v.x, v.y, v.z) * 0.18))
      const shells: THREE.BufferGeometry[] = [core]
      for (let i = 0; i < 5; i++) {
        const shell = weld(new THREE.SphereGeometry(r * (0.94 + i * 0.012), 8, 5, 0, 2.5, 0.42 + R() * 0.3, 2.1))
        reshape(shell, (v) => { v.multiplyScalar(1 + Math.sin(v.x * 62 + i) * Math.cos(v.y * 47) * 0.05); v.y *= 0.92 })
        tone(shell, (v, c) => mix(c, main, '#CFE39A', (v.y / r + 1) * 0.42 + speck(v.x, v.y, v.z) * 0.08))
        shell.rotateY((i / 5) * Math.PI * 2 + R() * 0.5)
        shells.push(shell)
      }
      return onFloor(merge(shells))
    }
    case 'spinach': {
      const leaves: THREE.BufferGeometry[] = []
      for (let i = 0; i < 7; i++) {
        const l = leafGeo(r * (1.25 + R() * 0.35), r * (0.72 + R() * 0.2), r * 0.22, third, p.colors[i % p.colors.length])
        l.rotateZ(0.42 + (i % 3) * 0.22).rotateY((i / 6 - 0.5) * 1.15).translate(r * 0.42, r * 0.08, 0)
        leaves.push(l)
        leaves.push(paint(new THREE.CylinderGeometry(r * 0.025, r * 0.035, r * 0.82, 4).rotateZ(Math.PI / 2).rotateY((i / 6 - 0.5) * 0.45).translate(0, r * 0.08, 0), '#83AD5D'))
      }
      leaves.push(paint(new THREE.TorusGeometry(r * 0.13, r * 0.03, 4, 8).rotateY(Math.PI / 2).translate(-r * 0.05, r * 0.08, 0), '#C9443C'))
      return onFloor(merge(leaves).translate(-r * 0.45, 0, 0))
    }
    case 'carrot': {
      const body = weld(new THREE.ConeGeometry(r, r * 6.5, 9, 7).rotateZ(Math.PI / 2))
      reshape(body, (v) => { const t = (v.x + r * 3.25) / (r * 6.5), k = 1 + Math.sin(t * 34) * 0.035; const shoulder = t > 0.9 ? Math.sqrt(Math.max(0.05, 1 - Math.pow((t - 0.9) / 0.1, 2) * 0.72)) : 1; v.y *= k * shoulder; v.z *= k * shoulder })
      tone(body, (v, c) => { const t = (v.x + r * 3.25) / (r * 6.5); mix(c, main, '#BF5317', Math.pow(Math.abs(Math.sin(t * 34)), 7) * 0.5 + (t > 0.9 ? 0.25 : 0)) })
      const tops: THREE.BufferGeometry[] = []
      for (let i = 0; i < 4; i++) tops.push(leafGeo(r * 3, r * 0.5, r * 0.45, '#4F8A3A', '#2F7132').rotateZ((i - 1.5) * 0.18).rotateY((i - 1.5) * 0.22).translate(r * 3.1, 0, 0))
      return onFloor(merge([body, ...tops]))
    }
    case 'broccoli': {
      const crown = weld(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.62))
      const buds = Array.from({ length: 13 }, () => {
        const t = R() * Math.PI * 2, y = 0.2 + R() * 0.8, q = Math.sqrt(1 - y * y)
        return new THREE.Vector3(Math.cos(t) * q, y, Math.sin(t) * q)
      })
      const budAt = (v: THREE.Vector3) => { const d = v.clone().normalize(); return buds.reduce((m, b) => Math.max(m, d.dot(b)), -1) }
      reshape(crown, (v) => { const b = budAt(v); v.multiplyScalar(0.78 + Math.pow(Math.max(0, b), 18) * 0.24 + Math.sin(v.x * 240) * Math.cos(v.z * 230) * 0.012); v.y *= 0.86 })
      tone(crown, (v, c) => { const b = Math.pow(Math.max(0, budAt(v)), 18); mix(c, '#264F24', second, b * 0.95 + speck(v.x, v.y, v.z) * 0.08) })
      crown.translate(0, r * 0.58, 0)
      const stalk = paint(new THREE.CylinderGeometry(r * 0.42, r * 0.25, r * 0.74, 8).translate(0, r * 0.36, 0), '#9DBD73')
      return onFloor(merge([stalk, crown]))
    }
    case 'banana': {
      const parts: THREE.BufferGeometry[] = []
      for (let i = 0; i < 5; i++) {
        const o = (i - 2) * 0.031
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.005, 0.07, o * 0.28), new THREE.Vector3(0.09, -0.012, o * 0.86), new THREE.Vector3(0.21, 0.064, o * 1.25))
        const seg = 6, rad = 5
        const t = new THREE.TubeGeometry(curve, seg, 0.024, rad, false)
        const pos = t.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3()
        for (let n = 0; n <= seg; n++) {
          curve.getPointAt(n / seg, c)
          const u = n / seg, k = Math.min(0.42 + u * 4.2, 1) * (u > 0.82 ? Math.max(0.28, 1 - (u - 0.82) * 4) : 1)
          for (let m = 0; m <= rad; m++) { const idx = n * (rad + 1) + m; v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c); pos.setXYZ(idx, v.x, v.y, v.z) }
        }
        t.computeVertexNormals()
        tone(t, (w, col) => { const u = w.x / 0.21; mix(col, p.colors[i % 2], '#C9AE3A', Math.pow(Math.abs(Math.sin(Math.atan2(w.y - 0.03, w.z - o) * 2.5)), 8) * 0.16); if (u < 0.1) col.lerp(new THREE.Color('#C3C25A'), 0.6); if (u > 0.97) col.set('#6A5430') })
        parts.push(t)
      }
      parts.push(paint(new THREE.CylinderGeometry(0.014, 0.02, 0.07, 5).rotateX(Math.PI / 2).translate(-0.006, 0.07, 0), '#B4AE52'))
      return onFloor(merge(parts).translate(-0.1, 0, 0))
    }
  }
  return new THREE.SphereGeometry(r)
}

/** Puffed bag shape for chips, rice and atta. */
function pillowGeo(w: number, h: number, d: number, lite = false) {
  const g = new THREE.BoxGeometry(w, h, d, lite ? 5 : 10, lite ? 6 : 12, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const fx = 1 - Math.pow((2 * x) / w, 2), fy = 1 - Math.pow((2 * y) / h, 4)
    const k = 0.18 + 0.82 * Math.sqrt(Math.max(0, fx * fy))
    pos.setXYZ(i, x * (1 - 0.04 * (1 - fy)), y, z * k)
  }
  g.computeVertexNormals()
  return g.translate(0, h / 2, 0)
}

function bottleGeo(r: number, h: number, seg = 20) {
  const pts = [
    [0, 0], [r * 0.92, 0], [r, h * 0.04], [r, h * 0.6], [r * 0.82, h * 0.74], [r * 0.42, h * 0.86], [r * 0.38, h * 0.92], [0, h * 0.92],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, seg)
}

/** A sealed snack or grocery pouch: puffed body, crimped seals top and bottom, soft creases that catch the light. */
function pouchGeo(w: number, h: number, d: number, lite = false) {
  const g = new THREE.BoxGeometry(w, h, d, lite ? 4 : 10, lite ? 5 : 14, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const nx = (2 * x) / w, ny = (2 * y) / h, fx = 1 - nx * nx, fy = 1 - Math.pow(ny, 4)
    const k = 0.16 + 0.84 * Math.sqrt(Math.max(0, fx * fy)), seal = Math.abs(ny) > 0.88
    const crease = seal ? Math.sin(nx * 26) * d * 0.02 : Math.sin(nx * 7 + ny * 3) * Math.cos(ny * 9) * d * 0.035 * k
    pos.setXYZ(i, x * (1 - 0.05 * (1 - fy)), y, z * (seal ? 0.1 : k) + crease)
  }
  g.computeVertexNormals()
  return g.translate(0, h / 2, 0)
}

/** Turned container from a [radius, height] profile, both as fractions of the pack. */
const turned = (pts: number[][], r: number, h: number, seg: number, lite = false) =>
  new THREE.LatheGeometry(pts.filter((_, i) => !lite || i % 2 === 0 || i === pts.length - 1).map(([a, b]) => new THREE.Vector2(a * r, b * h)), lite ? Math.min(seg, 8) : seg)
const BOTTLES = {
  oil: [[0, 0], [0.82, 0], [0.94, 0.015], [1, 0.05], [0.94, 0.09], [1, 0.13], [1, 0.54], [0.93, 0.6], [0.78, 0.67], [0.86, 0.72], [0.62, 0.8], [0.4, 0.87], [0.38, 0.92], [0, 0.92]],
  soda: [[0, 0.01], [0.6, 0], [0.92, 0.02], [0.82, 0.05], [1, 0.1], [1, 0.54], [0.86, 0.62], [0.62, 0.72], [0.44, 0.82], [0.36, 0.89], [0.36, 0.92], [0, 0.92]],
  plain: [[0, 0], [0.9, 0], [1, 0.04], [1, 0.56], [0.9, 0.66], [0.62, 0.78], [0.42, 0.87], [0.4, 0.92], [0, 0.92]],
}
const JAR = [[0, 0], [0.9, 0], [1, 0.035], [1, 0.72], [0.92, 0.79], [0.72, 0.83], [0.7, 0.87], [0, 0.87]]

function loafGeo(w: number, h: number, len: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h * 0.55)
  s.quadraticCurveTo(w / 2, h, 0, h); s.quadraticCurveTo(-w / 2, h, -w / 2, h * 0.55); s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 10 })
  g.translate(0, 0, -len / 2)
  g.rotateY(Math.PI / 2)
  return g
}

export type Part = { geo: THREE.BufferGeometry; mat: THREE.Material | THREE.Material[] }

/** Merge neighbouring geometry groups that use the same material, so a six-sided pack draws in 2–3 calls. */
function compact(geo: THREE.BufferGeometry, faceMats: THREE.Material[]): Part {
  const mats: THREE.Material[] = []
  const groups = [...geo.groups].sort((a, b) => a.start - b.start)
  geo.clearGroups()
  let cur: { start: number; count: number; mat: THREE.Material } | null = null
  const flush = () => {
    if (!cur) return
    let k = mats.indexOf(cur.mat)
    if (k < 0) { mats.push(cur.mat); k = mats.length - 1 }
    geo.addGroup(cur.start, cur.count, k)
  }
  for (const gr of groups) {
    const m = faceMats[gr.materialIndex ?? 0]
    if (cur && cur.mat === m && cur.start + cur.count === gr.start) cur.count += gr.count
    else { flush(); cur = { start: gr.start, count: gr.count, mat: m } }
  }
  flush()
  return { geo, mat: mats }
}
const partCache = new Map<string, Part[]>()
const produceMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.44, side: THREE.DoubleSide })

/** Meshes that make up one unit of a product, origin at the bottom centre, front facing +z. */
export function productParts(p: Product): Part[] {
  const hit = partCache.get(p.id)
  if (hit) return hit
  let parts: Part[] = []
  const [w, h, d] = p.dims
  const [col, accent] = p.colors
  // background stock ("fx-") is drawn by the thousand, so it uses fewer segments
  const lite = p.id.startsWith('fx-'), seg = lite ? 10 : 20
  const side = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
  const extra = texturedParts(p, compact)
  if (isProduce(p)) parts = [{ geo: produceGeo(p), mat: produceMat }]
  else if (SOLID.has(p.shape)) parts = [{ geo: solidGeo(p), mat: solidMat }]
  else if (extra) parts = extra
  else if (p.shape === 'tetra') {
    // a gable-top carton with a folded ridge and a screw cap
    const bodyH = h * 0.82
    const body = new THREE.BoxGeometry(w, bodyH, d).translate(0, bodyH / 2, 0)
    const front = new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * bodyH) / w)), roughness: 0.34 })
    const sideM = new THREE.MeshStandardMaterial({ map: sideTex(p), roughness: 0.4 })
    const gable = reshape(new THREE.BoxGeometry(w, h * 0.13, d).toNonIndexed(), (v) => { if (v.y > 0) v.z *= 0.1 }).translate(0, bodyH + h * 0.065, 0)
    const fin = new THREE.BoxGeometry(w, h * 0.05, d * 0.12).translate(0, bodyH + h * 0.155, 0)
    const cap = new THREE.CylinderGeometry(w * 0.16, w * 0.16, h * 0.035, lite ? 6 : 12).rotateX(0.9).translate(0, bodyH + h * 0.085, d * 0.26)
    parts = [
      compact(body, [sideM, sideM, side, side, front, side]),
      { geo: merge([gable, fin]), mat: new THREE.MeshStandardMaterial({ color: col, roughness: 0.38 }) },
      { geo: cap, mat: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.32 }) },
    ]
  } else if (p.shape === 'box' || p.shape === 'block' || p.shape === 'eggs') {
    const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)
    const front = new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * h) / w)), roughness: 0.42 })
    const topMap = p.shape === 'eggs' || p.shape === 'block'
      ? new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * d) / w)), roughness: 0.5 })
      : new THREE.MeshStandardMaterial({ color: new THREE.Color(col).offsetHSL(0, 0, -0.04), roughness: 0.5 })
    const sideM = new THREE.MeshStandardMaterial({ map: sideTex(p), roughness: 0.46 })
    const mats = p.shape === 'block' || p.shape === 'eggs'
      ? [side, side, topMap, side, side, side]
      : [sideM, sideM, topMap, side, front, side]
    parts = [compact(geo, mats)]
  } else if (p.shape === 'pillow') {
    const geo = pouchGeo(w, h, d, lite)
    const front = new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * h) / w)), roughness: 0.3, metalness: 0.16 })
    parts = [compact(geo, [side, side, side, side, front, side])]
  } else if (p.shape === 'bottle') {
    const r = w / 2
    const kind = p.art === 'oil' ? 'oil' : /soda|cola|fizz/i.test(p.name) ? 'soda' : 'plain'
    const body = new THREE.MeshStandardMaterial({ color: p.art === 'oil' ? '#E3AE33' : p.art === 'cow' ? '#FAFAF7' : col, roughness: 0.18, metalness: 0.02 })
    const labelGeo = new THREE.CylinderGeometry(r * 1.012, r * 1.012, h * 0.38, seg, 1, true, Math.PI, Math.PI * 2).translate(0, h * 0.34, 0)
    const label = new THREE.MeshStandardMaterial({ map: wrapTex(p, (2 * Math.PI * r) / (h * 0.38)), roughness: 0.36 })
    const cap = new THREE.CylinderGeometry(r * 0.44, r * 0.46, h * 0.09, seg).translate(0, h * 0.955, 0)
    parts = [{ geo: turned(BOTTLES[kind], r, h, seg, lite), mat: body }, { geo: labelGeo, mat: label }, { geo: cap, mat: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.34 }) }]
  } else if (p.shape === 'jar') {
    const r = w / 2
    const glass = new THREE.MeshStandardMaterial({ color: col, roughness: 0.12, metalness: 0.04 })
    const labelGeo = new THREE.CylinderGeometry(r * 1.012, r * 1.012, h * 0.48, seg, 1, true, Math.PI, Math.PI * 2).translate(0, h * 0.36, 0)
    const label = new THREE.MeshStandardMaterial({ map: wrapTex(p, (2 * Math.PI * r) / (h * 0.48)), roughness: 0.34 })
    const lid = new THREE.CylinderGeometry(r * 0.84, r * 0.86, h * 0.13, seg).translate(0, h * 0.935, 0)
    parts = [{ geo: turned(JAR, r, h, seg, lite), mat: glass }, { geo: labelGeo, mat: label }, { geo: lid, mat: new THREE.MeshStandardMaterial({ color: '#D9AE4F', roughness: 0.28, metalness: 0.62 }) }]
  } else if (p.shape === 'tub') {
    const r = w / 2
    const bodyGeo = new THREE.CylinderGeometry(r, r * 0.82, h * 0.86, seg, 1, false, Math.PI, Math.PI * 2).translate(0, h * 0.43, 0)
    const wrap = new THREE.MeshStandardMaterial({ map: wrapTex(p, (2 * Math.PI * r) / (h * 0.86)), roughness: 0.38 })
    const rim = new THREE.CylinderGeometry(r * 1.05, r * 1.05, h * 0.05, seg).translate(0, h * 0.875, 0)
    const lid = new THREE.CylinderGeometry(r * 0.96, r * 1.0, h * 0.1, seg).translate(0, h * 0.95, 0)
    parts = [{ geo: bodyGeo, mat: [wrap, side, side] }, { geo: merge([rim, lid]), mat: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.3 }) }]
  } else if (p.shape === 'loaf') {
    const geo = loafGeo(w, h, d)
    const crust = new THREE.MeshStandardMaterial({ color: col, roughness: 0.75 })
    const crumb = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.9 })
    parts = [{ geo, mat: [crumb, crust] }]
  }
  partCache.set(p.id, parts)
  return parts
}

/** Height of one unit (for stacking and scaling). */
export function unitSize(p: Product): [number, number, number] {
  if (isProduce(p)) {
    const r = p.dims[0]
    if (p.shape === 'carrot') return [r * 8, r * 2, r * 2]
    if (p.shape === 'banana') return [0.2, 0.08, 0.12]
    return [r * 2.1, r * 2, r * 2.1]
  }
  const hit = sizeCache.get(p.id)
  if (hit) return hit
  const b = new THREE.Box3()
  for (const part of productParts(p)) { part.geo.computeBoundingBox(); b.union(part.geo.boundingBox!) }
  const s = b.getSize(new THREE.Vector3())
  const out: [number, number, number] = [s.x, s.y, s.z]
  sizeCache.set(p.id, out)
  return out
}
const sizeCache = new Map<string, [number, number, number]>()

/** A standalone product object (for the basket, flying items and thumbnails). */
export function makeProductObject(p: Product, mode: 'one' | 'pile' | 'thumb' = 'one') {
  const g = new THREE.Group()
  const parts = productParts(p)
  const add = (x: number, y: number, z: number, ry: number) => {
    for (const part of parts) {
      const m = new THREE.Mesh(part.geo, part.mat)
      m.position.set(x, y, z)
      m.rotation.y = ry
      m.castShadow = true
      g.add(m)
    }
  }
  if (isProduce(p)) {
    const [w, , d] = unitSize(p)
    const n = mode === 'thumb' ? 7 : mode === 'pile' ? 4 : 1
    const R = rng(p.id.length * 7 + 1)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + R(), rad = i === 0 ? 0 : Math.max(w, d) * 0.62
      add(Math.cos(a) * rad, i === 0 && n > 1 ? unitSize(p)[1] * 0.55 : 0, Math.sin(a) * rad, R() * 6)
    }
  } else {
    const [w, , d] = unitSize(p)
    const trio = ['box', 'tetra', 'block', 'pillow', 'bottle', 'tub', 'jar', 'tube', 'dropper', 'lipstick', 'pencil', 'folded'].includes(p.shape)
    if (mode === 'thumb' && trio) { add(0, 0, 0, 0); add(-w * 1.05, 0, -d * 0.9, 0.08); add(w * 1.05, 0, -d * 0.9, -0.08) }
    else add(0, 0, 0, 0)
  }
  return g
}

/* ---------------- thumbnails ---------------- */

const THUMBS: Record<string, string> = {}
export const thumb = (id: string) => THUMBS[id] ?? ''

/** Renders every product once with a studio light into small PNGs for the UI. */
export function renderThumbnails() {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  r.setSize(240, 240)
  r.setPixelRatio(1)
  r.toneMapping = THREE.NeutralToneMapping
  const sc = new THREE.Scene()
  sc.add(new THREE.HemisphereLight('#FFFFFF', '#D8D0C2', 2.2))
  const key = new THREE.DirectionalLight('#FFF6EA', 2.2)
  key.position.set(2, 4, 3)
  sc.add(key)
  const cam = new THREE.PerspectiveCamera(26, 1, 0.01, 20)
  for (const p of PRODUCTS) {
    const o = makeProductObject(p, 'thumb')
    sc.add(o)
    const b = new THREE.Box3().setFromObject(o)
    const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3())
    const m = Math.max(s.x, s.y, s.z)
    const dist = (m / (2 * Math.tan((13 * Math.PI) / 180))) * 1.2
    cam.position.set(c.x + dist * 0.18, c.y + dist * 0.38, c.z + dist * 0.92)
    cam.lookAt(c)
    r.render(sc, cam)
    THUMBS[p.id] = r.domElement.toDataURL('image/png')
    sc.remove(o)
  }
  r.dispose()
  r.forceContextLoss()
}

/* ---------------- Sprint 5: beauty, electronics, apparel and home shapes ---------------- */

/** Shapes built as one vertex-coloured mesh (no printed label). */
export const SOLID = new Set(['lipstick', 'pencil', 'headphones', 'earbuds', 'speaker', 'smartspeaker', 'watch', 'mouse', 'shoes', 'cap', 'mug', 'plates', 'pot', 'lamp', 'vase'])
const solidMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05 })

function lathe(points: [number, number][], seg = 20) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg)
}

/** One vertex-coloured mesh per product, origin at the bottom centre, front facing +z. */
function solidGeo(p: Product): THREE.BufferGeometry {
  const [w, h, d] = p.dims
  const [c0, c1] = p.colors
  switch (p.shape) {
    case 'lipstick': {
      const r = w / 2
      return merge([
        paint(new THREE.CylinderGeometry(r, r, h * 0.55, 12).translate(0, h * 0.275, 0), c1),
        paint(new THREE.CylinderGeometry(r * 0.8, r * 0.8, h * 0.12, 12).translate(0, h * 0.61, 0), '#1E1E1E'),
        paint(new THREE.CylinderGeometry(r * 0.62, r * 0.62, h * 0.22, 12).translate(0, h * 0.78, 0), c0),
        paint(new THREE.ConeGeometry(r * 0.62, h * 0.12, 12).rotateZ(0.5).translate(0, h * 0.93, 0), c0),
      ])
    }
    case 'pencil': {
      const r = w / 2
      return merge([
        paint(new THREE.CylinderGeometry(r, r, h * 0.85, 12).translate(0, h * 0.425, 0), c0),
        paint(new THREE.CylinderGeometry(r * 1.05, r * 1.05, h * 0.06, 12).translate(0, h * 0.82, 0), c1),
        paint(new THREE.ConeGeometry(r, h * 0.15, 12).translate(0, h * 0.925, 0), '#2A2A2A'),
      ])
    }
    case 'headphones': {
      const R = w / 2 - 0.02
      const band = paint(new THREE.TorusGeometry(R, 0.012, 8, 32, Math.PI).translate(0, h - R - 0.012, 0), c0)
      const pad = paint(new THREE.BoxGeometry(0.06, 0.012, 0.035).translate(0, h - 0.012, 0), c1)
      const cups = [-1, 1].flatMap((s) => [
        paint(new THREE.CylinderGeometry(0.048, 0.048, 0.035, 24).rotateZ(Math.PI / 2).translate(s * R, 0.06, 0), c0),
        paint(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 24).rotateZ(Math.PI / 2).translate(s * (R - 0.022), 0.06, 0), c1),
        paint(new THREE.BoxGeometry(0.012, h - R - 0.07, 0.014).translate(s * R, 0.06 + (h - R - 0.07) / 2, 0), '#4A4C52'),
      ])
      return merge([band, pad, ...cups])
    }
    case 'earbuds': {
      const caseG = paint(new THREE.SphereGeometry(0.5, 24, 16).scale(w, h * 1.1, d).translate(0, h * 0.5, 0), c0)
      const seam = paint(new THREE.TorusGeometry(0.5, 0.012, 6, 32).scale(w * 1.01, d * 1.01, 1).rotateX(Math.PI / 2).translate(0, h * 0.62, 0), '#D9D9D6')
      const led = paint(new THREE.SphereGeometry(0.003, 8, 6).translate(0, h * 0.45, d * 0.5), '#5BD17A')
      return merge([caseG, seam, led])
    }
    case 'speaker': {
      const r = w / 2
      return merge([
        paint(new THREE.CylinderGeometry(r, r, h * 0.86, 20).translate(0, h * 0.5, 0), c0),
        paint(new THREE.CylinderGeometry(r * 1.02, r * 1.02, h * 0.07, 20).translate(0, h * 0.035, 0), c1),
        paint(new THREE.CylinderGeometry(r * 1.02, r * 1.02, h * 0.07, 20).translate(0, h * 0.965, 0), c1),
        paint(new THREE.BoxGeometry(r * 0.9, h * 0.08, 0.004).translate(0, h * 0.5, r + 0.001), '#FFFFFF'),
      ])
    }
    case 'smartspeaker': {
      return merge([
        paint(new THREE.SphereGeometry(w / 2, 28, 20).scale(1, (h / w) * 1.1, 1).translate(0, h * 0.5, 0), c0),
        paint(new THREE.TorusGeometry(w * 0.28, 0.005, 6, 32).rotateX(Math.PI / 2).translate(0, h * 0.98, 0), c1),
      ])
    }
    case 'watch': {
      const strap = paint(new THREE.BoxGeometry(w * 0.55, h, 0.008).translate(0, h / 2, -0.004), c1)
      const body = paint(new THREE.BoxGeometry(w, w * 1.15, 0.012).translate(0, h / 2, 0.006), '#2A2C30')
      const face = paint(new THREE.BoxGeometry(w * 0.84, w * 0.98, 0.002).translate(0, h / 2, 0.0125), c0)
      const ring = paint(new THREE.BoxGeometry(w * 0.5, w * 0.05, 0.001).translate(0, h / 2 + w * 0.1, 0.0136), c1)
      return merge([strap, body, face, ring])
    }
    case 'mouse': {
      const shell = paint(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(w, h * 2, d), c0)
      const wheel = paint(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 12).rotateZ(Math.PI / 2).translate(0, h * 0.98, d * 0.22), c1)
      return merge([shell, wheel])
    }
    case 'shoes': {
      const one = (x: number) => [
        paint(new THREE.BoxGeometry(0.065, 0.02, d).translate(x, 0.01, 0), '#F4F2EE'),
        paint(new THREE.SphereGeometry(0.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.062, h * 1.6, d * 0.95).translate(x, 0.02, 0), c0),
        paint(new THREE.BoxGeometry(0.05, 0.012, 0.06).translate(x, h * 0.72, d * 0.08), c1),
        paint(new THREE.BoxGeometry(0.066, 0.008, d * 0.98).translate(x, 0.026, 0), c1),
      ]
      return merge([...one(-0.042), ...one(0.042)])
    }
    case 'cap': {
      const r = w / 2
      return merge([
        paint(new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, h / r, 1.05).translate(0, 0.005, -0.02), c0),
        paint(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.008, 24, 1, false, -Math.PI / 2, Math.PI).scale(1, 1, 0.9).rotateX(-0.12).translate(0, 0.01, 0.03), c0),
        paint(new THREE.SphereGeometry(0.008, 8, 6).translate(0, h + 0.004, -0.02), c1),
      ])
    }
    case 'mug': {
      const r = w / 2
      return merge([
        paint(new THREE.CylinderGeometry(r, r * 0.92, h, 28).translate(0, h / 2, 0), (y) => (y > h * 0.93 ? c1 : c0)),
        paint(new THREE.CircleGeometry(r * 0.9, 24).rotateX(-Math.PI / 2).translate(0, h - 0.004, 0), '#3A2A22'),
        paint(new THREE.TorusGeometry(h * 0.27, 0.008, 8, 16, Math.PI).rotateZ(-Math.PI / 2).translate(r, h * 0.5, 0), c0),
      ])
    }
    case 'plates': {
      const r = w / 2, parts: THREE.BufferGeometry[] = []
      for (let i = 0; i < 4; i++) {
        parts.push(paint(lathe([[0, 0], [r * 0.7, 0], [r * 0.95, 0.012], [r, 0.02], [r * 0.97, 0.022], [r * 0.7, 0.008], [0, 0.008]], 40).translate(0, i * 0.02, 0), (_y, x, z) => (Math.hypot(x, z) > r * 0.86 ? c1 : c0)))
      }
      return merge(parts)
    }
    case 'pot': {
      const r = w / 2
      return merge([
        paint(new THREE.CylinderGeometry(r, r * 0.97, h * 0.8, 32).translate(0, h * 0.4, 0), c0),
        paint(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.01, 32).translate(0, h * 0.81, 0), '#D9DDE0'),
        paint(new THREE.SphereGeometry(r, 24, 8, 0, Math.PI * 2, 0, 0.35).translate(0, h * 0.82 - r * Math.cos(0.35), 0), '#C4D2D6'),
        paint(new THREE.CylinderGeometry(0.012, 0.016, 0.022, 12).translate(0, h * 0.98, 0), c1),
        paint(new THREE.BoxGeometry(0.11, 0.016, 0.026).translate(r + 0.05, h * 0.68, 0), c1),
      ])
    }
    case 'lamp': {
      const base = lathe([[0, 0], [w * 0.22, 0], [w * 0.27, h * 0.1], [w * 0.24, h * 0.28], [w * 0.1, h * 0.38], [w * 0.06, h * 0.42], [0, h * 0.42]], 28)
      const ribbed = paint(base, c0)
      const stem = paint(new THREE.CylinderGeometry(0.006, 0.006, h * 0.15, 8).translate(0, h * 0.48, 0), '#B8A890')
      const shade = paint(new THREE.CylinderGeometry(w * 0.32, w * 0.5, h * 0.4, 28).translate(0, h * 0.78, 0), c1)
      return merge([ribbed, stem, shade])
    }
    case 'vase':
      return paint(lathe([[0, 0], [w * 0.3, 0], [w * 0.48, h * 0.3], [w * 0.42, h * 0.62], [w * 0.2, h * 0.84], [w * 0.22, h], [w * 0.17, h], [0, h * 0.9]], 32), (y) => (y > h * 0.96 ? c1 : c0))
  }
  return new THREE.BoxGeometry(w, h, d)
}

/* textures for screens, garments and textiles */

function screenTex(kind: 'laptop' | 'phone' | 'tv', tint: string) {
  const [w, h] = kind === 'phone' ? [256, 512] : [512, 300]
  return canvasTex(`screen-${kind}-${tint}`, w, h, (g) => {
    if (kind === 'tv') {
      const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#8FC1E8'); sky.addColorStop(0.55, '#E6F1F6'); sky.addColorStop(0.56, '#6E9A6A'); sky.addColorStop(1, '#3E6B4A')
      g.fillStyle = sky; g.fillRect(0, 0, w, h)
      g.fillStyle = '#7A8FA3'; g.beginPath(); g.moveTo(0, h * 0.58); g.lineTo(w * 0.25, h * 0.3); g.lineTo(w * 0.45, h * 0.55); g.lineTo(w * 0.7, h * 0.25); g.lineTo(w, h * 0.56); g.lineTo(w, h * 0.6); g.lineTo(0, h * 0.6); g.fill()
      g.fillStyle = '#F5F7F8'; g.beginPath(); g.moveTo(w * 0.66, h * 0.31); g.lineTo(w * 0.7, h * 0.25); g.lineTo(w * 0.74, h * 0.31); g.fill()
      g.fillStyle = '#9CC9E0'; g.fillRect(0, h * 0.72, w, h * 0.08)
      g.fillStyle = 'rgba(255,255,255,.85)'; g.font = F(700, 16); g.fillText('4K HDR', 18, h - 18)
      return
    }
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, tint); gr.addColorStop(1, '#E9E3F7')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
    if (kind === 'laptop') {
      g.fillStyle = 'rgba(255,255,255,.85)'; rr(g, w * 0.1, h * 0.16, w * 0.46, h * 0.56, 10); g.fill(); rr(g, w * 0.6, h * 0.16, w * 0.3, h * 0.3, 10); g.fill()
      g.fillStyle = 'rgba(38,38,38,.15)'; for (let i = 0; i < 4; i++) g.fillRect(w * 0.14, h * (0.26 + i * 0.1), w * 0.34 - i * 20, 8)
      g.fillStyle = 'rgba(255,255,255,.7)'; rr(g, w * 0.3, h * 0.86, w * 0.4, h * 0.08, 8); g.fill()
    } else {
      g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.font = F(600, 54); g.fillText('9:41', w / 2, 110)
      for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(255,255,255,${0.55 + (i % 3) * 0.12})`; rr(g, 30 + (i % 4) * 52, 200 + Math.floor(i / 4) * 64, 40, 40, 11); g.fill() }
    }
  })
}

function garmentTex(p: Product) {
  return canvasTex(`garment-${p.id}`, 256, 256, (g, w, h) => {
    const [bg, ac] = p.colors
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    g.fillStyle = ac; g.strokeStyle = ac
    switch (p.art) {
      case 'stripes': for (let y = 30; y < h; y += 28) g.fillRect(0, y, w, 12); break
      case 'dino':
        g.beginPath(); g.ellipse(w * 0.5, h * 0.55, 46, 30, 0, 0, 7); g.fill()
        g.beginPath(); g.ellipse(w * 0.7, h * 0.4, 18, 14, 0, 0, 7); g.fill(); g.fillRect(w * 0.62, h * 0.4, 14, 34)
        g.beginPath(); g.moveTo(w * 0.32, h * 0.55); g.lineTo(w * 0.2, h * 0.62); g.lineTo(w * 0.34, h * 0.62); g.fill()
        g.fillRect(w * 0.4, h * 0.62, 10, 24); g.fillRect(w * 0.55, h * 0.62, 10, 24)
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(w * 0.73, h * 0.38, 3, 0, 7); g.fill(); break
      case 'star': {
        g.beginPath()
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 18 : 42; g.lineTo(w * 0.5 + Math.cos(a) * r, h * 0.5 + Math.sin(a) * r) }
        g.closePath(); g.fill()
        if (p.shape === 'hoodie') { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(w / 2 - 2, 0, 4, h) }
        break
      }
      case 'heart':
        for (let y = 24; y < h; y += 44) for (let x = 18 + ((y / 44) % 2) * 22; x < w; x += 44) { g.beginPath(); g.arc(x - 4, y, 5, 0, 7); g.arc(x + 4, y, 5, 0, 7); g.moveTo(x - 9, y + 2); g.lineTo(x, y + 12); g.lineTo(x + 9, y + 2); g.fill() }
        g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, h * 0.5, w, 6); g.fillRect(0, h * 0.75, w, 6); break
    }
  })
}

function textileTex(p: Product) {
  return canvasTex(`textile-${p.id}`, 256, 256, (g, w, h) => {
    const [bg, ac] = p.colors
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    g.fillStyle = ac; g.strokeStyle = ac
    switch (p.art) {
      case 'stripes': for (let y = 0; y < h; y += 40) g.fillRect(0, y, w, 14); break
      case 'checks': g.globalAlpha = 0.55; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h); for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 12); g.globalAlpha = 1; break
      case 'floral':
        for (let i = 0; i < 18; i++) { const x = ((i * 67) % w) + 10, y = ((i * 41) % h) + 10; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + Math.cos(k * 1.26) * 7, y + Math.sin(k * 1.26) * 7, 5, 3, k * 1.26, 0, 7); g.fill() } }
        break
      default: g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, h * 0.5, w, 3); g.fillRect(0, h * 0.2, w, 2)
    }
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, 0, w, h * 0.12)
  })
}

const KEYS = () =>
  canvasTex('keys', 512, 160, (g, w, h) => {
    g.fillStyle = '#C9CBCE'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#F4F4F2'
    for (let r = 0; r < 5; r++) for (let c = 0; c < 22; c++) rr(g, 6 + c * 22.9, 6 + r * 30, 19, 25, 4), g.fill()
  })

/** Garment silhouettes (normalised: x −0.5…0.5, y 0…1). */
const OUTLINES: Record<string, [number, number][]> = {
  tshirt: [[-0.13, 1], [-0.32, 0.96], [-0.5, 0.78], [-0.4, 0.66], [-0.3, 0.73], [-0.3, 0], [0.3, 0], [0.3, 0.73], [0.4, 0.66], [0.5, 0.78], [0.32, 0.96], [0.13, 1], [0, 0.93]],
  hoodie: [[-0.13, 1], [-0.32, 0.96], [-0.5, 0.72], [-0.5, 0.08], [-0.38, 0.08], [-0.34, 0.64], [-0.32, 0], [0.32, 0], [0.34, 0.64], [0.38, 0.08], [0.5, 0.08], [0.5, 0.72], [0.32, 0.96], [0.13, 1], [0, 0.9]],
  dress: [[-0.11, 1], [-0.2, 1], [-0.22, 0.8], [-0.17, 0.62], [-0.5, 0], [0.5, 0], [0.17, 0.62], [0.22, 0.8], [0.2, 1], [0.11, 1], [0, 0.9]],
}

function garmentGeo(p: Product) {
  const [w, h, d] = p.dims
  const s = new THREE.Shape()
  OUTLINES[p.shape].forEach(([x, y], i) => (i ? s.lineTo(x * w, y * h) : s.moveTo(x * w, y * h)))
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 })
  g.translate(0, 0, -d / 2)
  const pos = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h)
  return g
}

/** Products that need printed textures or screens. Returns null for shapes handled elsewhere. */
function texturedParts(p: Product, compactFn: typeof compact): Part[] | null {
  const [w, h, d] = p.dims
  const [col, accent] = p.colors
  const side = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
  switch (p.shape) {
    case 'tube': {
      const r = w / 2, bodyH = h * 0.84
      const g = new THREE.CylinderGeometry(r, r, bodyH, 18, 6, false, Math.PI, Math.PI * 2)
      const pos = g.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const t = Math.min(1, Math.max(0, (pos.getY(i) + bodyH / 2) / bodyH))
        const k = Math.pow(t, 2.2)
        pos.setXYZ(i, pos.getX(i) * (1 + 0.28 * k), pos.getY(i), pos.getZ(i) * (d / w) * (1 - 0.85 * k))
      }
      g.computeVertexNormals()
      g.translate(0, h * 0.16 + bodyH / 2, 0)
      const label = new THREE.MeshStandardMaterial({ map: wrapTex(p, (Math.PI * r * 1.6) / bodyH), roughness: 0.35 })
      const cap = new THREE.CylinderGeometry(r * 0.75, r * 0.82, h * 0.16, 14).translate(0, h * 0.08, 0)
      return [{ geo: g, mat: [label, side, side] }, { geo: cap, mat: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 }) }]
    }
    case 'dropper': {
      const r = w / 2
      const glass = new THREE.MeshStandardMaterial({ color: col, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.88 })
      const labelGeo = new THREE.CylinderGeometry(r * 1.01, r * 1.01, h * 0.32, 28, 1, true, Math.PI, Math.PI * 2).translate(0, h * 0.3, 0)
      const label = new THREE.MeshStandardMaterial({ map: wrapTex(p, (2 * Math.PI * r) / (h * 0.32)), roughness: 0.4 })
      const collar = new THREE.CylinderGeometry(r * 0.5, r * 0.5, h * 0.12, 18).translate(0, h * 0.77, 0)
      const bulb = new THREE.SphereGeometry(r * 0.42, 16, 12).scale(1, 1.4, 1).translate(0, h * 0.9, 0)
      const black = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.3 })
      return [{ geo: bottleGeo(r, h * 0.76), mat: glass }, { geo: labelGeo, mat: label }, { geo: collar, mat: black }, { geo: bulb, mat: black }]
    }
    case 'perfume': {
      const glass = new THREE.MeshStandardMaterial({ color: col, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.9 })
      const body = new THREE.BoxGeometry(w, h * 0.75, d).translate(0, h * 0.375, 0)
      const label = new THREE.PlaneGeometry(w * 0.6, h * 0.42).translate(0, h * 0.38, d / 2 + 0.001)
      const cap = new THREE.CylinderGeometry(w * 0.2, w * 0.2, h * 0.25, 16).translate(0, h * 0.875, 0)
      return [
        { geo: body, mat: glass },
        { geo: label, mat: new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * 0.42 * h) / (0.6 * w))), roughness: 0.4 }) },
        { geo: cap, mat: new THREE.MeshStandardMaterial({ color: '#C9A76B', roughness: 0.25, metalness: 0.7 }) },
      ]
    }
    case 'laptop': {
      const alu = new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, metalness: 0.6 })
      const lidH = d * 0.95, open = -0.28
      const base = new THREE.BoxGeometry(w, 0.014, d).translate(0, 0.007, 0)
      const lid = new THREE.BoxGeometry(w, lidH, 0.006).translate(0, lidH / 2, -0.003).rotateX(open).translate(0, 0.014, -d / 2)
      const screen = new THREE.PlaneGeometry(w * 0.92, lidH * 0.86).translate(0, lidH * 0.5, 0.0005).rotateX(open).translate(0, 0.014, -d / 2)
      const keys = new THREE.PlaneGeometry(w * 0.86, d * 0.45).rotateX(-Math.PI / 2).translate(0, 0.0145, -d * 0.12)
      return [
        { geo: base, mat: alu }, { geo: lid, mat: alu },
        { geo: screen, mat: new THREE.MeshBasicMaterial({ map: screenTex('laptop', '#7665B5'), toneMapped: false }) },
        { geo: keys, mat: new THREE.MeshStandardMaterial({ map: KEYS(), roughness: 0.6 }) },
      ]
    }
    case 'tablet': case 'phone': {
      const tilt = -0.22
      const body = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0).rotateX(tilt)
      const screen = new THREE.PlaneGeometry(w * 0.9, h * 0.92).translate(0, h / 2, d / 2 + 0.0005).rotateX(tilt)
      const stand = new THREE.BoxGeometry(w * 0.5, 0.012, 0.05).translate(0, 0.006, -0.01)
      return [
        { geo: body, mat: new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, metalness: 0.3 }) },
        { geo: screen, mat: new THREE.MeshBasicMaterial({ map: screenTex(p.shape === 'phone' ? 'phone' : 'laptop', accent), toneMapped: false }) },
        { geo: stand, mat: new THREE.MeshStandardMaterial({ color: '#E9E9EC', roughness: 0.4 }) },
      ]
    }
    case 'keyboard': {
      const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)
      const top = new THREE.MeshStandardMaterial({ map: KEYS(), roughness: 0.6 })
      const body = new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 })
      return [compactFn(geo, [body, body, top, body, body, body])]
    }
    case 'tv': {
      const frame = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)
      const screen = new THREE.PlaneGeometry(w * 0.97, h * 0.95).translate(0, h / 2, d / 2 + 0.001)
      return [
        { geo: frame, mat: new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.3 }) },
        { geo: screen, mat: new THREE.MeshBasicMaterial({ map: screenTex('tv', accent), toneMapped: false }) },
      ]
    }
    case 'tshirt': case 'hoodie': case 'dress': {
      const print = new THREE.MeshStandardMaterial({ map: garmentTex(p), roughness: 0.9, side: THREE.DoubleSide })
      const hanger = new THREE.TorusGeometry(0.02, 0.003, 6, 12, Math.PI * 1.4).rotateZ(-0.2).translate(0, h + 0.025, 0)
      return [{ geo: garmentGeo(p), mat: [print, side] }, { geo: hanger, mat: new THREE.MeshStandardMaterial({ color: '#C9CBCE', roughness: 0.3, metalness: 0.7 }) }]
    }
    case 'folded': {
      const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)
      const tex = new THREE.MeshStandardMaterial({ map: textileTex(p), roughness: 0.95 })
      return [compactFn(geo, [side, side, tex, side, tex, side])]
    }
    case 'cushion': {
      const geo = pillowGeo(w, h, d)
      const tex = new THREE.MeshStandardMaterial({ map: textileTex(p), roughness: 0.95 })
      return [compactFn(geo, [side, side, side, side, tex, side])]
    }
    case 'backpack': {
      const geo = pillowGeo(w, h, d)
      const front = new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * h) / w)), roughness: 0.7 })
      const strapM = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.7 })
      const handle = new THREE.TorusGeometry(0.03, 0.007, 6, 12, Math.PI).translate(0, h, 0)
      return [compactFn(geo, [side, side, side, side, front, side]), { geo: handle, mat: strapM }]
    }
  }
  return null
}
