import * as THREE from 'three'
import type { Store } from '../data/stores'
import type { Ad } from '../data/advertisements'
import { CATEGORIES, CATEGORY } from '../data/categories'
import { color, font } from '../styles/tokens'

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void

export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cache = new Map<string, THREE.CanvasTexture>()
export function canvasTex(key: string, w: number, h: number, draw: Draw, opts: { repeat?: [number, number]; srgb?: boolean } = {}) {
  const k = key + (opts.repeat ? opts.repeat.join('x') : '')
  const hit = cache.get(k)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(opts.repeat[0], opts.repeat[1])
  }
  cache.set(k, t)
  return t
}

export function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}
const F = (weight: number, px: number) => `${weight} ${px}px ${font.family}`
export function hexA(hex: string, a: number) {
  const c = new THREE.Color(hex)
  return `rgba(${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0},${a})`
}
const isLight = (hex: string) => new THREE.Color(hex).getHSL({ h: 0, s: 0, l: 0 }).l > 0.82

/* ---------- surfaces ---------- */

/** Large polished light-grey tiles, 4 tiles per texture repeat, with soft variation and faint veining. */
export const floorTex = (repeat: [number, number]) =>
  canvasTex('floor', 1024, 1024, (g, w, h) => {
    const R = rng(7)
    const n = 2
    const s = w / n
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const v = 214 + R() * 8
        g.fillStyle = `rgb(${v + 4},${v + 3},${v - 2})`
        g.fillRect(i * s, j * s, s, s)
        for (let k = 0; k < 6; k++) {
          g.strokeStyle = `rgba(160,156,146,${0.05 + R() * 0.06})`
          g.lineWidth = 0.6 + R() * 1.4
          g.beginPath()
          let x = i * s + R() * s, y = j * s + R() * s
          g.moveTo(x, y)
          for (let q = 0; q < 4; q++) { x += (R() - 0.4) * 160; y += (R() - 0.5) * 110; g.quadraticCurveTo(x - 30, y + 20, x, y) }
          g.stroke()
        }
      }
    g.fillStyle = 'rgba(255,255,255,0.18)'
    for (let i = 0; i < 1600; i++) g.fillRect(R() * w, R() * h, 1.4, 1.4)
    g.strokeStyle = 'rgba(150,146,138,0.55)'
    g.lineWidth = 3
    for (let i = 0; i <= n; i++) {
      g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke()
      g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke()
    }
  }, { repeat })

/** Warm stone inlay for the central walkway band. */
export const inlayTex = (repeat: [number, number]) =>
  canvasTex('inlay', 512, 512, (g, w, h) => {
    g.fillStyle = '#E4DACB'
    g.fillRect(0, 0, w, h)
    const R = rng(3)
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(170,150,120,${0.05 + R() * 0.08})`
      g.lineWidth = 0.8 + R()
      g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y)
      for (let k = 0; k < 3; k++) { x += (R() - 0.5) * 120; y += (R() - 0.3) * 120; g.lineTo(x, y) }
      g.stroke()
    }
    g.strokeStyle = 'rgba(160,140,110,.35)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h)
  }, { repeat })

export const skyTex = () =>
  canvasTex('sky', 64, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#B9D7EF'); gr.addColorStop(0.5, '#DCEBF6'); gr.addColorStop(1, '#F5F2EA')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
  })

/** Daylight seen through the entrance / far glass wall: sky, trees, a paved forecourt. */
export const exteriorTex = () =>
  canvasTex('exterior', 1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#BFDCF2'); gr.addColorStop(0.55, '#EEF5F8'); gr.addColorStop(0.56, '#DCD6CA'); gr.addColorStop(1, '#C9C1B2')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
    const R = rng(11)
    for (let i = 0; i < 14; i++) {
      const x = R() * w, y = h * 0.5
      g.fillStyle = '#7A6A58'; g.fillRect(x - 3, y - 20, 6, 50)
      g.fillStyle = ['#7C9877', '#8FA889', '#6E8B69'][i % 3]
      g.beginPath(); g.arc(x, y - 40, 34 + R() * 26, 0, 7); g.fill()
    }
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, h * 0.56, w, 4)
  })

export const raysTex = () =>
  canvasTex('rays', 64, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, 'rgba(255,248,232,0.85)'); gr.addColorStop(0.7, 'rgba(255,248,232,0.25)'); gr.addColorStop(1, 'rgba(255,248,232,0)')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
    const gx = g.createLinearGradient(0, 0, w, 0)
    gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)')
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h)
  })

/** Soft contact shadow used under furniture, planters and the cart (cheap ambient occlusion). */
export const blobTex = () =>
  canvasTex('blob', 128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    gr.addColorStop(0, 'rgba(40,36,30,0.55)'); gr.addColorStop(0.6, 'rgba(40,36,30,0.18)'); gr.addColorStop(1, 'rgba(40,36,30,0)')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
  })

export const stepsTex = () =>
  canvasTex('steps', 64, 256, (g, w, h) => {
    g.fillStyle = '#8E9194'; g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 16) { g.fillStyle = '#B9BCBF'; g.fillRect(0, y, w, 10) }
    g.fillStyle = '#E8C547'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h)
  }, { repeat: [1, 6] })

export const waterTex = () =>
  canvasTex('water', 256, 256, (g, w, h) => {
    g.fillStyle = '#9FC4CF'; g.fillRect(0, 0, w, h)
    const R = rng(5)
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = `rgba(255,255,255,${0.08 + R() * 0.2})`; g.lineWidth = 1 + R() * 1.6
      g.beginPath(); g.ellipse(R() * w, R() * h, 8 + R() * 26, 3 + R() * 8, R() * 3, 0, 7); g.stroke()
    }
  }, { repeat: [2, 2] })

/* ---------- storefronts ---------- */

function goods(g: CanvasRenderingContext2D, st: Store, x: number, y: number, w: number, h: number) {
  const R = rng(st.id.length * 37 + (x | 0))
  const cat = st.category
  const shelves = [0.42, 0.66, 0.9].map((f) => y + h * f)
  const pal: Record<string, string[]> = {
    grocery: ['#D9472B', '#E98A2A', '#5E8F3E', '#F2C84B', '#A33B3B'],
    beauty: ['#F1D6DE', '#B33A68', '#F6E3B4', '#9DB79A', '#FFFFFF'],
    electronics: ['#2B2D33', '#E9E9EC', '#3A3D45'],
    fashion: ['#C9B9A6', '#7D8A99', '#E8E2D6', '#A36B5A', '#3E4654'],
    kids: ['#F2C84B', '#8EC3E6', '#F4A7A0', '#A8D5BA', '#FFFFFF'],
    home: ['#E8DCC6', '#BFA887', '#9DB0A2', '#FFFFFF', '#C98F6A'],
    jewellery: ['#E9CF95', '#F3F0EA'],
    watches: ['#E6D7B5', '#2B2A28', '#C9CBCC'],
    health: ['#FFFFFF', '#E8604C', '#9DC3B5', '#F2F2F2'],
    dining: ['#F3E6D2', '#00704A', '#7A4A2A', '#FFFFFF'],
  }
  const p = pal[cat] ?? ['#999']
  if (cat === 'fashion' || cat === 'kids') {
    g.strokeStyle = '#B7B2A8'; g.lineWidth = 3
    g.beginPath(); g.moveTo(x + 10, y + h * 0.22); g.lineTo(x + w - 10, y + h * 0.22); g.stroke()
    const step = cat === 'kids' ? 30 : 40
    for (let cx = x + 26; cx < x + w - 16; cx += step) {
      g.fillStyle = p[(R() * p.length) | 0]
      const len = cat === 'kids' ? 0.36 : 0.5 + R() * 0.15
      g.beginPath(); g.moveTo(cx - 11, y + h * 0.24); g.lineTo(cx + 11, y + h * 0.24); g.lineTo(cx + 15, y + h * (0.24 + len)); g.lineTo(cx - 15, y + h * (0.24 + len)); g.closePath(); g.fill()
    }
    g.fillStyle = hexA('#BFA887', 0.9); g.fillRect(x + 8, y + h * 0.86, w - 16, 8)
    for (let cx = x + 20; cx < x + w - 30; cx += 34) { g.fillStyle = p[(R() * p.length) | 0]; g.fillRect(cx, y + h * 0.8, 24, 12) }
    return
  }
  if (cat === 'jewellery' || cat === 'watches') {
    g.fillStyle = cat === 'jewellery' ? '#F1EADC' : '#EFEDE8'
    g.fillRect(x + 6, y + h * 0.55, w - 12, h * 0.45)
    for (let cx = x + 30; cx < x + w - 20; cx += 46) {
      g.fillStyle = '#FFFFFF'; rr(g, cx - 16, y + h * 0.5, 32, 22, 6); g.fill()
      g.strokeStyle = p[0]; g.lineWidth = 2.5
      g.beginPath()
      if (cat === 'jewellery') g.arc(cx, y + h * 0.5, 11, 0, Math.PI)
      else g.arc(cx, y + h * 0.5 + 11, 8, 0, 7)
      g.stroke()
    }
    return
  }
  if (cat === 'dining') {
    g.fillStyle = '#3C3A36'; rr(g, x + 14, y + h * 0.12, w * 0.5, h * 0.28, 6); g.fill()
    g.fillStyle = 'rgba(255,255,255,.75)'
    for (let i = 0; i < 4; i++) g.fillRect(x + 26, y + h * 0.16 + i * 14, w * 0.3, 4)
    g.fillStyle = '#BFA887'; g.fillRect(x + 6, y + h * 0.7, w - 12, h * 0.3)
    for (let cx = x + 20; cx < x + w - 20; cx += 30) { g.fillStyle = p[(R() * p.length) | 0]; rr(g, cx, y + h * 0.6, 18, 22, 4); g.fill() }
    return
  }
  shelves.forEach((sy) => {
    g.fillStyle = '#E7DCC8'; g.fillRect(x + 6, sy, w - 12, 6)
    let cx = x + 14
    while (cx < x + w - 20) {
      const col = p[(R() * p.length) | 0]
      g.fillStyle = col
      if (cat === 'grocery') { const r = 6 + R() * 6; g.beginPath(); g.arc(cx + r, sy - r, r, 0, 7); g.fill(); cx += r * 2 + 2 }
      else if (cat === 'electronics') { const ww = 24 + R() * 18, hh = 16 + R() * 12; g.fillRect(cx, sy - hh, ww, hh); g.fillStyle = 'rgba(170,200,230,.55)'; g.fillRect(cx + 3, sy - hh + 3, ww - 6, hh - 6); cx += ww + 10 }
      else if (cat === 'home') { g.beginPath(); g.ellipse(cx + 10, sy - 12, 10, 12, 0, 0, 7); g.fill(); cx += 28 }
      else { const ww = 8 + R() * 7, hh = 18 + R() * 16; g.fillRect(cx, sy - hh, ww, hh); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(cx + ww * 0.25, sy - hh - 4, ww * 0.5, 4); cx += ww + 6 }
    }
  })
}

/** Ground-floor shopfront: pale oak frame, glass windows with lit displays, open doorway. */
export const facadeTex = (st: Store) =>
  canvasTex('facade-' + st.id, 1024, 480, (g, w, h) => {
    g.fillStyle = '#D9C5A5'; g.fillRect(0, 0, w, h)
    const top = 18, dw = 300, dx = (w - dw) / 2
    const win = (x: number, ww: number) => {
      const gr = g.createLinearGradient(0, top, 0, h)
      gr.addColorStop(0, '#FFFBF2'); gr.addColorStop(1, '#F1E7D6')
      g.fillStyle = gr; g.fillRect(x, top, ww, h - top)
      g.fillStyle = hexA(st.accent, 0.16); g.fillRect(x, top, ww, h - top)
      goods(g, st, x, top, ww, h - top)
      const rf = g.createLinearGradient(x, top, x + ww, h)
      rf.addColorStop(0.0, 'rgba(255,255,255,0)'); rf.addColorStop(0.42, 'rgba(255,255,255,.32)'); rf.addColorStop(0.5, 'rgba(255,255,255,0)')
      g.fillStyle = rf; g.fillRect(x, top, ww, h - top)
      g.strokeStyle = '#C9B28C'; g.lineWidth = 8; g.strokeRect(x, top, ww, h - top)
    }
    win(12, dx - 22); win(dx + dw + 10, w - (dx + dw + 10) - 12)
    // open doorway with a glimpse of the store interior
    const gr = g.createLinearGradient(0, top, 0, h)
    gr.addColorStop(0, '#FFFDF8'); gr.addColorStop(1, '#ECE4D6')
    g.fillStyle = gr; g.fillRect(dx, top, dw, h - top)
    const vx = dx + dw / 2, vy = 200
    g.fillStyle = '#E3DACB'; g.beginPath(); g.moveTo(dx, h); g.lineTo(vx - 40, vy + 40); g.lineTo(vx + 40, vy + 40); g.lineTo(dx + dw, h); g.closePath(); g.fill()
    ;[-1, 1].forEach((s) => {
      const ex = s < 0 ? dx : dx + dw
      g.fillStyle = hexA(st.accent, 0.5)
      g.beginPath(); g.moveTo(ex, top + 30); g.lineTo(vx + s * 40, vy - 34); g.lineTo(vx + s * 40, vy + 40); g.lineTo(ex, h); g.closePath(); g.fill()
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2
      for (let k = 1; k < 5; k++) { const f = k / 5; g.beginPath(); g.moveTo(ex, top + 30 + (h - top - 30) * f); g.lineTo(vx + s * 40, vy - 34 + 74 * f); g.stroke() }
    })
    g.strokeStyle = '#B9BCBF'; g.lineWidth = 6; g.strokeRect(dx, top, dw, h - top)
  })

/** Text-only brand fascia. */
export const signTex = (st: Store) =>
  canvasTex('sign-' + st.id, 1024, 128, (g, w, h) => {
    g.fillStyle = st.sign.bg; g.fillRect(0, 0, w, h)
    if (isLight(st.sign.bg)) { g.strokeStyle = 'rgba(38,38,38,.08)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4) }
    g.fillStyle = st.sign.fg; g.textAlign = 'center'; g.textBaseline = 'middle'
    let size = 64
    g.font = F(600, size)
    while (g.measureText(st.name).width > w * 0.86 && size > 30) { size -= 2; g.font = F(600, size) }
    g.fillText(st.name, w / 2, h / 2 + 2)
  })

/** Projecting blade sign (perpendicular to the shopfront). */
export const bladeTex = (st: Store) =>
  canvasTex('blade-' + st.id, 512, 144, (g, w, h) => {
    g.fillStyle = st.sign.bg; g.fillRect(0, 0, w, h)
    if (isLight(st.sign.bg)) { g.strokeStyle = 'rgba(38,38,38,.1)'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4) }
    g.fillStyle = st.sign.fg; g.textAlign = 'center'; g.textBaseline = 'middle'
    let size = 64
    g.font = F(600, size)
    while (g.measureText(st.name).width > w * 0.84 && size > 26) { size -= 2; g.font = F(600, size) }
    g.fillText(st.name, w / 2, h / 2 + 2)
  })

/** Upper-floor shopfront (simpler: glazing + display). */
export const upperFacadeTex = (st: Store | null, key: string) =>
  canvasTex('upper-' + key, 1024, 360, (g, w, h) => {
    g.fillStyle = '#E9E3D8'; g.fillRect(0, 0, w, h)
    if (!st) {
      g.fillStyle = '#F7F4EE'; g.fillRect(16, 16, w - 32, h - 32)
      g.fillStyle = '#9A9890'; g.textAlign = 'center'; g.textBaseline = 'middle'
      g.font = F(500, 34); g.fillText('Opening soon', w / 2, h / 2 - 14)
      g.font = F(400, 22); g.fillText('A new store is coming to this space', w / 2, h / 2 + 26)
      return
    }
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, '#FFFBF2'); gr.addColorStop(1, '#EFE5D3')
    g.fillStyle = gr; g.fillRect(14, 14, w - 28, h - 28)
    g.fillStyle = hexA(st.accent, 0.2); g.fillRect(14, 14, w - 28, h - 28)
    goods(g, st, 14, 14, w - 28, h - 28)
    g.strokeStyle = '#C9CBCC'; g.lineWidth = 6
    ;[w / 3, (2 * w) / 3].forEach((x) => { g.beginPath(); g.moveTo(x, 14); g.lineTo(x, h - 14); g.stroke() })
    const rf = g.createLinearGradient(0, 0, w, h)
    rf.addColorStop(0.35, 'rgba(255,255,255,0)'); rf.addColorStop(0.45, 'rgba(255,255,255,.3)'); rf.addColorStop(0.52, 'rgba(255,255,255,0)')
    g.fillStyle = rf; g.fillRect(0, 0, w, h)
  })

export const soonTex = () =>
  canvasTex('soon', 1024, 480, (g, w, h) => {
    g.fillStyle = '#EFEAE1'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#F8F5EF'; g.fillRect(18, 18, w - 36, h - 36)
    g.strokeStyle = 'rgba(191,168,135,.5)'; g.lineWidth = 2
    for (let x = 60; x < w; x += 80) { g.beginPath(); g.moveTo(x, 18); g.lineTo(x, h - 18); g.stroke() }
    g.fillStyle = '#8F8D86'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.font = F(500, 40); g.fillText('Opening soon', w / 2, h / 2 - 16)
    g.font = F(400, 24); g.fillText('New stores join the mall every month', w / 2, h / 2 + 30)
  })

/* ---------- directory sign ---------- */

function glyph(g: CanvasRenderingContext2D, kind: string, x: number, y: number, r: number) {
  g.save(); g.translate(x, y); g.lineWidth = r * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'
  g.beginPath()
  switch (kind) {
    case 'leaf': g.moveTo(-r * 0.6, r * 0.6); g.quadraticCurveTo(-r * 0.6, -r * 0.6, r * 0.6, -r * 0.6); g.quadraticCurveTo(r * 0.6, r * 0.6, -r * 0.6, r * 0.6); g.moveTo(-r * 0.6, r * 0.6); g.lineTo(r * 0.2, -r * 0.2); break
    case 'drop': g.moveTo(0, -r * 0.7); g.quadraticCurveTo(r * 0.6, 0, r * 0.45, r * 0.3); g.arc(0, r * 0.3, r * 0.45, 0, Math.PI); g.quadraticCurveTo(-r * 0.6, 0, 0, -r * 0.7); break
    case 'bolt': g.moveTo(r * 0.1, -r * 0.7); g.lineTo(-r * 0.35, r * 0.05); g.lineTo(r * 0.05, r * 0.05); g.lineTo(-r * 0.1, r * 0.7); g.lineTo(r * 0.35, -r * 0.05); g.lineTo(-r * 0.05, -r * 0.05); g.closePath(); break
    case 'hanger': g.moveTo(0, -r * 0.2); g.lineTo(-r * 0.7, r * 0.45); g.lineTo(r * 0.7, r * 0.45); g.closePath(); g.moveTo(0, -r * 0.2); g.arc(0, -r * 0.45, r * 0.22, Math.PI * 0.5, Math.PI * 2.2); break
    case 'star': for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5; const px = Math.cos(a) * r * 0.65, py = Math.sin(a) * r * 0.65; if (i) g.lineTo(px, py); else g.moveTo(px, py) } g.closePath(); break
    case 'house': g.moveTo(-r * 0.6, 0); g.lineTo(0, -r * 0.6); g.lineTo(r * 0.6, 0); g.moveTo(-r * 0.45, -r * 0.1); g.lineTo(-r * 0.45, r * 0.6); g.lineTo(r * 0.45, r * 0.6); g.lineTo(r * 0.45, -r * 0.1); break
    case 'gem': g.moveTo(-r * 0.6, -r * 0.2); g.lineTo(-r * 0.3, -r * 0.55); g.lineTo(r * 0.3, -r * 0.55); g.lineTo(r * 0.6, -r * 0.2); g.lineTo(0, r * 0.65); g.closePath(); g.moveTo(-r * 0.6, -r * 0.2); g.lineTo(r * 0.6, -r * 0.2); break
    case 'clock': g.arc(0, 0, r * 0.6, 0, 7); g.moveTo(0, -r * 0.35); g.lineTo(0, 0); g.lineTo(r * 0.25, r * 0.15); break
    case 'cross': g.moveTo(0, -r * 0.6); g.lineTo(0, r * 0.6); g.moveTo(-r * 0.6, 0); g.lineTo(r * 0.6, 0); break
    case 'cup': g.moveTo(-r * 0.5, -r * 0.3); g.lineTo(r * 0.4, -r * 0.3); g.lineTo(r * 0.3, r * 0.55); g.lineTo(-r * 0.4, r * 0.55); g.closePath(); g.moveTo(r * 0.4, -r * 0.15); g.arc(r * 0.5, r * 0.08, r * 0.2, -Math.PI / 2, Math.PI / 2); break
  }
  g.stroke(); g.restore()
}

/** Physical directory panel: cream stone face, quiet typography, category marks. */
export const directoryTex = (stores: Store[]) =>
  canvasTex('directory', 512, 1024, (g, w, h) => {
    g.fillStyle = '#FBFAF7'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#262626'; g.font = F(600, 18); g.fillText('TATA MALL', 40, 64)
    g.font = F(600, 44); g.fillText('Directory', 40, 118)
    g.fillStyle = '#E2DDD3'; g.fillRect(40, 140, w - 80, 2)
    const cats = CATEGORIES.filter((c) => stores.some((s) => s.category === c.id))
    cats.forEach((c, i) => {
      const y = 186 + i * 74
      const st = stores.find((s) => s.category === c.id && s.level === 0) ?? stores.find((s) => s.category === c.id)!
      g.strokeStyle = '#7665B5'; glyph(g, CATEGORY[c.id].glyph, 62, y, 22)
      g.fillStyle = '#262626'; g.font = F(600, 24); g.fillText(c.label, 100, y - 2)
      g.fillStyle = '#777873'; g.font = F(400, 18)
      g.fillText(`${st.name} · ${st.level ? 'First floor' : 'Ground floor'}`, 100, y + 24)
    })
    g.fillStyle = '#EAE5F6'; rr(g, 40, h - 96, w - 80, 56, 28); g.fill()
    g.fillStyle = '#7665B5'; g.beginPath(); g.arc(72, h - 68, 8, 0, 7); g.fill()
    g.font = F(600, 20); g.fillText('You are here · Main entrance', 92, h - 61)
  })

/* ---------- advertising ---------- */

function motif(g: CanvasRenderingContext2D, m: Ad['motif'], cx: number, cy: number, r: number, tint: string) {
  g.save(); g.translate(cx, cy); g.fillStyle = tint; g.strokeStyle = tint; g.lineCap = 'round'; g.lineJoin = 'round'
  const soft = hexA(tint, 0.14)
  g.fillStyle = soft; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.fillStyle = tint
  switch (m) {
    case 'headphones':
      g.lineWidth = r * 0.14; g.beginPath(); g.arc(0, r * 0.05, r * 0.55, Math.PI * 1.08, Math.PI * 1.92); g.stroke()
      rr(g, -r * 0.7, -r * 0.05, r * 0.32, r * 0.55, r * 0.12); g.fill(); rr(g, r * 0.38, -r * 0.05, r * 0.32, r * 0.55, r * 0.12); g.fill(); break
    case 'leaf':
      ;['#D9472B', '#E98A2A', '#5E8F3E'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc((i - 1) * r * 0.42, r * 0.12 + (i % 2) * r * -0.1, r * 0.3, 0, 7); g.fill() })
      g.fillStyle = '#5E8F3E'; g.beginPath(); g.ellipse(r * 0.05, -r * 0.42, r * 0.12, r * 0.24, 0.6, 0, 7); g.fill(); break
    case 'bottle':
      rr(g, -r * 0.22, -r * 0.3, r * 0.44, r * 0.85, r * 0.08); g.fill(); g.fillStyle = '#F6E3B4'; rr(g, -r * 0.12, -r * 0.56, r * 0.24, r * 0.28, r * 0.05); g.fill()
      g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(-r * 0.16, r * 0.0, r * 0.32, r * 0.18); break
    case 'watch':
      g.fillRect(-r * 0.18, -r * 0.75, r * 0.36, r * 1.5); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, r * 0.36, 0, 7); g.fill()
      g.lineWidth = r * 0.07; g.beginPath(); g.arc(0, 0, r * 0.36, 0, 7); g.stroke(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r * 0.22); g.moveTo(0, 0); g.lineTo(r * 0.15, r * 0.06); g.stroke(); break
    case 'cup':
      g.beginPath(); g.moveTo(-r * 0.32, -r * 0.42); g.lineTo(r * 0.32, -r * 0.42); g.lineTo(r * 0.24, r * 0.55); g.lineTo(-r * 0.24, r * 0.55); g.closePath(); g.fill()
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, r * 0.05, r * 0.14, 0, 7); g.fill(); g.fillStyle = tint; g.fillRect(-r * 0.36, -r * 0.55, r * 0.72, r * 0.12); break
    case 'coin':
      g.fillStyle = '#E8B84A'; g.beginPath(); g.arc(0, 0, r * 0.55, 0, 7); g.fill(); g.fillStyle = '#F6D98A'; g.beginPath(); g.arc(-r * 0.08, -r * 0.08, r * 0.4, 0, 7); g.fill()
      g.fillStyle = '#9A6B12'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = F(700, r * 0.5); g.fillText('N', -r * 0.06, -r * 0.04); break
  }
  g.restore()
}

function drawAd(g: CanvasRenderingContext2D, ad: Ad, w: number, h: number, img?: HTMLImageElement) {
    const port = h > w
    g.clearRect(0, 0, w, h)
    g.textAlign = 'left'
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h)
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, hexA(ad.tint, 0.07)); g.fillStyle = gr; g.fillRect(0, 0, w, h)
    g.fillStyle = ad.tint; g.fillRect(0, 0, port ? w : 8, port ? 8 : h)
    const u = port ? w / 300 : h / 300
    const x0 = (port ? 26 : 34) * u
    const cx = port ? w / 2 : w * 0.76, cy = port ? h * 0.66 : h * 0.52, r = (port ? 92 : 100) * u
    if (img) {
      // the product itself, on a soft tinted disc
      g.fillStyle = hexA(ad.tint, 0.12); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill()
      const s = r * 2.15
      g.drawImage(img, cx - s / 2, cy - s / 2, s, s)
    } else motif(g, ad.motif, cx, cy, r, ad.tint)
    g.fillStyle = hexA(ad.tint, 1); g.font = F(600, 15 * u); g.fillText(ad.eyebrow, x0, (port ? 60 : 64) * u)
    g.fillStyle = color.ink; g.font = F(600, (port ? 30 : 32) * u)
    ad.title.split('\n').forEach((l, i) => g.fillText(l, x0, (port ? 104 : 114) * u + i * 38 * u))
    g.fillStyle = 'rgba(38,38,38,.5)'; rr(g, w - 46 * u, 16 * u, 32 * u, 18 * u, 5 * u); g.fill()
    g.fillStyle = '#FFFFFF'; g.font = F(700, 11 * u); g.textAlign = 'center'; g.fillText('AD', w - 30 * u, 29 * u); g.textAlign = 'left'
}

const AD_TEX: { t: THREE.CanvasTexture; ad: Ad; w: number; h: number }[] = []
const AD_IMG: Record<string, HTMLImageElement> = {}

/** Light ad creative: white card, brand tint used sparingly, the product (or a mark), small "Ad" label. */
export const adTex = (ad: Ad, w: number, h: number) => {
  const key = `ad-${ad.id}-${w}x${h}`
  const fresh = !cache.has(key)
  const t = canvasTex(key, w, h, (g) => drawAd(g, ad, w, h, ad.productId ? AD_IMG[ad.productId] : undefined))
  if (fresh) {
    AD_TEX.push({ t, ad, w, h })
    if (ad.productId) loadAdImage(ad.productId)
  }
  return t
}

let thumbOf: ((id: string) => string) | null = null
const loading = new Set<string>()

/** Fetch a product's render once and redraw every creative that advertises it. */
function loadAdImage(id: string) {
  if (AD_IMG[id] || loading.has(id) || !thumbOf) return
  const src = thumbOf(id)
  if (!src) return
  loading.add(id)
  const im = new Image()
  im.onload = () => {
    AD_IMG[id] = im
    for (const a of AD_TEX) if (a.ad.productId === id) {
      drawAd((a.t.image as HTMLCanvasElement).getContext('2d')!, a.ad, a.w, a.h, im)
      a.t.needsUpdate = true
    }
  }
  im.src = src
}

/** Called once product renders exist: creatives made before or after this get their product image. */
export function refreshAdImages(getThumb: (id: string) => string) {
  thumbOf = getThumb
  new Set(AD_TEX.map((a) => a.ad.productId).filter(Boolean) as string[]).forEach(loadAdImage)
}

/** Data URL of an ad creative for use in DOM cards. */
export function adImage(ad: Ad) {
  const c = document.createElement('canvas')
  c.width = 720; c.height = 360
  drawAd(c.getContext('2d')!, ad, 720, 360, ad.productId ? AD_IMG[ad.productId] : undefined)
  return c.toDataURL('image/jpeg', 0.9)
}

export const tintIsLight = isLight
