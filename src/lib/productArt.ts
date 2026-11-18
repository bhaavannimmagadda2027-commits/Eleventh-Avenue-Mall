import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
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

/** Front-of-pack label: pack colour, brand pill, illustration, product name, size and the green veg mark. */
export function labelTex(p: Product, w = 512, h = 512) {
  return canvasTex(`label-${p.id}-${w}x${h}`, w, h, (g) => {
    const [bg, accent] = p.colors
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    const u = Math.min(w, h) / 512
    // brand pill
    g.font = F(700, 26 * u)
    const bw = g.measureText(p.brand.toUpperCase()).width + 34 * u
    g.fillStyle = accent; rr(g, w / 2 - bw / 2, 22 * u, bw, 44 * u, 22 * u); g.fill()
    g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.brand.toUpperCase(), w / 2, 45 * u)
    // illustration
    art(g, p.art, w / 2, h * 0.47, Math.min(w, h) * 0.2, p)
    // name
    const dark = new THREE.Color(bg).getHSL({ h: 0, s: 0, l: 0 }).l > 0.55
    g.fillStyle = dark ? '#262626' : '#FFFFFF'
    let fs = 50 * u
    const name = p.name.split(',')[0]
    g.font = F(700, fs)
    while (g.measureText(name).width > w * 0.88 && fs > 22 * u) { fs -= 2; g.font = F(700, fs) }
    g.fillText(name, w / 2, h * 0.76)
    g.font = F(500, 28 * u); g.globalAlpha = 0.8; g.fillText(p.size, w / 2, h * 0.87); g.globalAlpha = 1
    // veg mark (food only)
    if (!['beauty', 'tech', 'apparel', 'home'].includes(categoryOf(p))) {
    g.strokeStyle = '#2E8B3E'; g.lineWidth = 3 * u; g.strokeRect(w - 54 * u, h - 54 * u, 32 * u, 32 * u)
    g.fillStyle = '#2E8B3E'; g.beginPath(); g.arc(w - 38 * u, h - 38 * u, 9 * u, 0, 7); g.fill()
    }
  })
}

/** Wrap-around label for bottles, tubs and jars: front art centred, plain band behind. */
function wrapTex(p: Product, aspect: number) {
  const h = 256, w = Math.min(2048, Math.round(h * aspect))
  return canvasTex(`wrap-${p.id}`, w, h, (g) => {
    const [, accent] = p.colors
    g.fillStyle = p.shape === 'bottle' && p.art === 'cow' ? '#FFFFFF' : accent
    g.fillRect(0, 0, w, h)
    g.fillStyle = accent; g.fillRect(0, 0, w, 16); g.fillRect(0, h - 16, w, 16)
    const fw = h * 1.1, fx = w / 2 - fw / 2
    const front = labelTex(p, 512, 512).image as HTMLCanvasElement
    g.drawImage(front, fx, 0, fw, h)
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

/** One produce item (or bunch) with baked vertex colours, origin at its resting base. */
function produceGeo(p: Product): THREE.BufferGeometry {
  const r = p.dims[0]
  const R = rng(p.id.length * 13)
  const main = p.colors[0]
  switch (p.shape) {
    case 'round': {
      const g = new THREE.SphereGeometry(r, 16, 12)
      if (p.id === 'onion') g.scale(1, 1.05, 1)
      if (p.id === 'potato') g.scale(1.25, 0.82, 0.95)
      if (p.id === 'apple' || p.id === 'pomegranate') g.scale(1, 0.92, 1)
      const top = p.id === 'tomato' ? '#3D6B2A' : p.id === 'apple' ? '#5A3A22' : p.id === 'pomegranate' ? '#6E1A22' : p.id === 'onion' ? '#C9A27A' : main
      paint(g, (y) => (y > r * 0.86 ? top : main))
      g.translate(0, r * 0.9, 0)
      return g
    }
    case 'capsicum': {
      const g = new THREE.SphereGeometry(r, 18, 14)
      const pos = g.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i)
        const a = Math.atan2(z, x), k = 1 + 0.08 * Math.cos(a * 4)
        pos.setXYZ(i, x * k, y * 1.05, z * k)
      }
      g.computeVertexNormals()
      paint(g, main)
      const stem = paint(new THREE.CylinderGeometry(0.008, 0.012, 0.03, 6).translate(0, r * 1.05, 0), '#4E7A2E')
      return merge([g, stem]).translate(0, r, 0)
    }
    case 'leafy': {
      const g = new THREE.IcosahedronGeometry(r, 3)
      const pos = g.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i)
        v.multiplyScalar(1 + Math.sin(v.x * 90) * Math.cos(v.z * 80) * 0.06)
        pos.setXYZ(i, v.x, v.y * 0.9, v.z)
      }
      g.computeVertexNormals()
      paint(g, (y) => (y > r * 0.3 ? '#A9CF78' : main))
      return g.translate(0, r * 0.85, 0)
    }
    case 'spinach': {
      const leaves: THREE.BufferGeometry[] = []
      for (let i = 0; i < 7; i++) {
        const l = new THREE.SphereGeometry(r * 0.5, 10, 6).scale(1, 0.12, 0.55)
        l.translate(r * 0.45, 0, 0)
        l.rotateZ(0.25 + R() * 0.3)
        l.rotateY((i / 7) * 0.9 - 0.45)
        paint(l, p.colors[i % p.colors.length])
        leaves.push(l)
      }
      const stem = paint(new THREE.CylinderGeometry(0.012, 0.012, r * 0.6, 6).rotateZ(Math.PI / 2).translate(-r * 0.25, 0, 0), '#6E9A4E')
      return merge([...leaves, stem]).translate(0, r * 0.2, 0)
    }
    case 'carrot': {
      const body = paint(new THREE.ConeGeometry(r, r * 6.5, 12).rotateZ(Math.PI / 2), (_y, x) => (x > r * 2.9 ? '#D9661E' : main))
      const tops: THREE.BufferGeometry[] = []
      for (let i = 0; i < 3; i++) tops.push(paint(new THREE.ConeGeometry(r * 0.25, r * 2.6, 5).rotateZ(-Math.PI / 2 + (i - 1) * 0.3).translate(r * 4.3, (i - 1) * r * 0.3, 0), '#4F8A3A'))
      return merge([body, ...tops]).translate(0, r, 0)
    }
    case 'broccoli': {
      const parts: THREE.BufferGeometry[] = [paint(new THREE.CylinderGeometry(r * 0.22, r * 0.3, r * 0.9, 8).translate(0, r * 0.45, 0), '#7FA35A')]
      for (let i = 0; i < 11; i++) {
        const a = R() * Math.PI * 2, d = R() * r * 0.55
        parts.push(paint(new THREE.IcosahedronGeometry(r * (0.32 + R() * 0.12), 1).translate(Math.cos(a) * d, r * 0.95 + R() * r * 0.25, Math.sin(a) * d), p.colors[i % 2]))
      }
      return merge(parts)
    }
    case 'banana': {
      const parts: THREE.BufferGeometry[] = []
      for (let i = 0; i < 5; i++) {
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.03, 0), new THREE.Vector3(0.1, 0.0, (i - 2) * 0.018), new THREE.Vector3(0.18, 0.06, (i - 2) * 0.03))
        const t = new THREE.TubeGeometry(curve, 10, 0.017, 7, false)
        paint(t, (_y, x) => (x > 0.165 || x < 0.012 ? '#6E5A2A' : p.colors[i % 2]))
        parts.push(t)
      }
      return merge(parts).translate(-0.09, 0.0, 0)
    }
  }
  return new THREE.SphereGeometry(r)
}

/** Puffed bag shape for chips, rice and atta. */
function pillowGeo(w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d, 10, 12, 1)
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

function bottleGeo(r: number, h: number) {
  const pts = [
    [0, 0], [r * 0.92, 0], [r, h * 0.04], [r, h * 0.6], [r * 0.82, h * 0.74], [r * 0.42, h * 0.86], [r * 0.38, h * 0.92], [0, h * 0.92],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(pts, 20)
}

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
const produceMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 })

/** Meshes that make up one unit of a product, origin at the bottom centre, front facing +z. */
export function productParts(p: Product): Part[] {
  const hit = partCache.get(p.id)
  if (hit) return hit
  let parts: Part[] = []
  const [w, h, d] = p.dims
  const [col, accent] = p.colors
  const side = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
  const extra = texturedParts(p, compact)
  if (isProduce(p)) parts = [{ geo: produceGeo(p), mat: produceMat }]
  else if (SOLID.has(p.shape)) parts = [{ geo: solidGeo(p), mat: solidMat }]
  else if (extra) parts = extra
  else if (p.shape === 'box' || p.shape === 'tetra' || p.shape === 'block' || p.shape === 'eggs') {
    const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)
    const front = new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * h) / w)), roughness: p.shape === 'tetra' ? 0.35 : 0.5 })
    const topMap = p.shape === 'eggs' || p.shape === 'block'
      ? new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * d) / w)), roughness: 0.5 })
      : new THREE.MeshStandardMaterial({ color: new THREE.Color(col).offsetHSL(0, 0, -0.04), roughness: 0.5 })
    const sideAcc = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5 })
    const mats = p.shape === 'block' || p.shape === 'eggs'
      ? [side, side, topMap, side, side, side]
      : [sideAcc, sideAcc, topMap, side, front, side]
    parts = [compact(geo, mats)]
  } else if (p.shape === 'pillow') {
    const geo = pillowGeo(w, h, d)
    const front = new THREE.MeshStandardMaterial({ map: labelTex(p, 512, Math.round((512 * h) / w)), roughness: 0.32, metalness: 0.15 })
    parts = [compact(geo, [side, side, side, side, front, side])]
  } else if (p.shape === 'bottle') {
    const r = w / 2
    const body = new THREE.MeshStandardMaterial({ color: p.art === 'oil' ? '#F6E08A' : '#FAFAF7', roughness: 0.25, transparent: p.art === 'oil', opacity: p.art === 'oil' ? 0.85 : 1 })
    const labelGeo = new THREE.CylinderGeometry(r * 1.01, r * 1.01, h * 0.38, 20, 1, true, Math.PI, Math.PI * 2).translate(0, h * 0.34, 0)
    const label = new THREE.MeshStandardMaterial({ map: wrapTex(p, (2 * Math.PI * r) / (h * 0.38)), roughness: 0.4 })
    const cap = new THREE.CylinderGeometry(r * 0.42, r * 0.42, h * 0.09, 20).translate(0, h * 0.955, 0)
    parts = [{ geo: bottleGeo(r, h), mat: body }, { geo: labelGeo, mat: label }, { geo: cap, mat: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4 }) }]
  } else if (p.shape === 'tub' || p.shape === 'jar') {
    const r = w / 2
    const tub = p.shape === 'tub'
    const bodyGeo = new THREE.CylinderGeometry(r, tub ? r * 0.82 : r, h * 0.84, 20, 1, false, Math.PI, Math.PI * 2).translate(0, h * 0.42, 0)
    const wrap = new THREE.MeshStandardMaterial({ map: wrapTex(p, (2 * Math.PI * r) / (h * 0.84)), roughness: tub ? 0.4 : 0.2 })
    const lidGeo = new THREE.CylinderGeometry(r * (tub ? 1.04 : 0.92), r * (tub ? 1.04 : 0.92), h * 0.16, 20).translate(0, h * 0.92, 0)
    parts = [{ geo: bodyGeo, mat: [wrap, side, side] }, { geo: lidGeo, mat: new THREE.MeshStandardMaterial({ color: tub ? accent : '#E8B84A', roughness: 0.35, metalness: tub ? 0 : 0.4 }) }]
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
        paint(new THREE.CylinderGeometry(r, r, h * 0.55, 18).translate(0, h * 0.275, 0), c1),
        paint(new THREE.CylinderGeometry(r * 0.8, r * 0.8, h * 0.12, 18).translate(0, h * 0.61, 0), '#1E1E1E'),
        paint(new THREE.CylinderGeometry(r * 0.62, r * 0.62, h * 0.22, 20).translate(0, h * 0.78, 0), c0),
        paint(new THREE.ConeGeometry(r * 0.62, h * 0.12, 20).rotateZ(0.5).translate(0, h * 0.93, 0), c0),
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
      const g = new THREE.CylinderGeometry(r, r, bodyH, 28, 8, false, Math.PI, Math.PI * 2)
      const pos = g.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const t = Math.min(1, Math.max(0, (pos.getY(i) + bodyH / 2) / bodyH))
        const k = Math.pow(t, 2.2)
        pos.setXYZ(i, pos.getX(i) * (1 + 0.28 * k), pos.getY(i), pos.getZ(i) * (d / w) * (1 - 0.85 * k))
      }
      g.computeVertexNormals()
      g.translate(0, h * 0.16 + bodyH / 2, 0)
      const label = new THREE.MeshStandardMaterial({ map: wrapTex(p, (Math.PI * r * 1.6) / bodyH), roughness: 0.35 })
      const cap = new THREE.CylinderGeometry(r * 0.75, r * 0.82, h * 0.16, 20).translate(0, h * 0.08, 0)
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
