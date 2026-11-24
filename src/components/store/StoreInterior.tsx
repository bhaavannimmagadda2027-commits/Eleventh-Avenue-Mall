import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { addCircle, addRect } from '../../data/layout'
import { HALLS, PLACE, runEnd, type Hall, type SectionRun } from '../../data/storeLayout'
import { PRODUCT_BY_ID, isProduce, type Product } from '../../data/products'
import { AD_BY_ID, IN_STORE } from '../../data/advertisements'
import { registerScreen } from '../../lib/adRotation'
import { useMall } from '../../state/useMall'
import { adTex, bannerTex, canvasTex, floorTex, inlayTex, rng, skyTex } from '../../lib/textures'
import { leafTex } from '../mall/Greenery'
import { productParts, tagTex, unitSize } from '../../lib/productArt'
import { fillerFor } from '../../data/filler'
import { SECTION_PHOTOS, type RackPhoto } from '../../data/rackPhotos'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { onQuality, quality } from '../../lib/quality'
import { registerStock } from '../../lib/shelfMotion'
import { M, basic, box, enableShadows, findTag, mat, mergeStatic, plane } from '../mall/build'
import { font } from '../../styles/tokens'

const F = (w: number, px: number) => `${w} ${px}px ${font.family}`
const tagMats = new Map<string, THREE.MeshBasicMaterial>()
const tagMat = (p: Product) => tagMats.get(p.id) ?? tagMats.set(p.id, new THREE.MeshBasicMaterial({ map: tagTex(p) })).get(p.id)!
const STOCK_BLOCK = 6 // metres of hall per instanced block
const MIRROR_STOCK_RANGE = 7.5 // metres
const REC = new THREE.MeshBasicMaterial({ color: '#E5484D', toneMapped: false })
const LED = new THREE.MeshBasicMaterial({ color: '#FFF6E2', toneMapped: false })

/* ---------- signage ---------- */

const SIGN = '#2B2433'
const sentence = (t: string) => (t[0] + t.slice(1).toLowerCase()).replace(/\btv\b/i, 'TV')

const wallSignTex = (hall: Hall, raw: string, text = sentence(raw)) =>
  canvasTex(`wsign-${hall.id}-${text}`, 1024, 128, (g, w, h) => {
    g.fillStyle = SIGN; g.fillRect(0, 0, w, h)
    g.fillStyle = '#FBF8F1'; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = 66; g.font = F(700, s)
    while (g.measureText(text).width > w * 0.9 && s > 30) { s -= 2; g.font = F(600, s) }
    g.fillText(text, w / 2, h / 2 - 2)
  })

const hangTex = (hall: Hall, raw: string, sub: string, text = sentence(raw)) =>
  canvasTex(`hang-${hall.id}-${text}`, 1024, 220, (g, w, h) => {
    g.fillStyle = SIGN; g.fillRect(0, 0, w, h)
    g.fillStyle = '#FBF8F1'; g.textBaseline = 'middle'
    let s = 78; g.font = F(600, s)
    while (g.measureText(text).width > w - 90 && s > 40) { s -= 2; g.font = F(600, s) }
    g.fillText(text, 60, h * 0.4)
    g.fillStyle = '#DCD3EE'; g.font = F(400, 36); g.fillText(sub, 62, h * 0.76)
  })

const backWallTex = (hall: Hall) =>
  canvasTex(`back-${hall.id}`, 1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, hall.theme.wall); gr.addColorStop(1, new THREE.Color(hall.theme.wall).offsetHSL(0, 0, -0.04).getStyle())
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
    g.fillStyle = hall.theme.accent; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = 120; g.font = F(700, s)
    while (g.measureText(hall.back.title).width > w * 0.86 && s > 50) { s -= 4; g.font = F(700, s) }
    g.fillText(hall.back.title, w / 2, h * 0.36)
    g.fillStyle = '#5A5A55'; g.font = F(400, 40); g.fillText(hall.back.sub, w / 2, h * 0.56)
  })

const doorwayTex = () =>
  canvasTex('door-lobby', 512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FFFDF8'); gr.addColorStop(0.62, '#F4EFE6'); gr.addColorStop(0.63, '#DEDAD2'); gr.addColorStop(1, '#D2CDC3')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
    g.fillStyle = '#7C9877'; g.beginPath(); g.arc(w * 0.22, h * 0.48, 52, 0, 7); g.fill(); g.beginPath(); g.arc(w * 0.8, h * 0.5, 44, 0, 7); g.fill()
    g.fillStyle = '#E6DED0'; g.beginPath(); g.ellipse(w / 2, h * 0.66, 120, 26, 0, 0, 7); g.fill()
    g.fillStyle = '#262626'; g.textAlign = 'center'; g.font = F(600, 38); g.fillText('Mall lobby', w / 2, h * 0.2)
    g.fillStyle = '#777873'; g.font = F(400, 24); g.fillText('Drive through to go back', w / 2, h * 0.28)
  })

/* ---------- fixtures (built in bay-local space: x along the bay, +z toward the aisle) ---------- */

type Inst = { p: Product; mats: THREE.Matrix4[]; owners: string[] }
type Ctx = { hall: Hall; insts: Inst[]; R: () => number; frame: THREE.Matrix4 }

function instOf(insts: Inst[], p: Product) {
  let inst = insts.find((i) => i.p === p)
  if (!inst) insts.push((inst = { p, mats: [], owners: [] }))
  return inst
}

function fillShelf(insts: Inst[], p: Product, bayW: number, y: number, zs: number[], fill: number, parent: THREE.Matrix4, R: () => number, scale = 1, gap = 0.012) {
  const [w] = unitSize(p)
  const step = w * scale * 1.06 + gap
  const n = Math.max(1, Math.floor((bayW - 0.12) / step))
  const used = Math.max(1, Math.round(n * fill))
  const x0 = -((used - 1) * step) / 2
  const inst = instOf(insts, p)
  for (const z of zs)
    for (let i = 0; i < used; i++) {
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x0 + i * step, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (R() - 0.5) * 0.06, 0)), new THREE.Vector3(scale, scale, scale))
      inst.mats.push(m.premultiply(parent))
      inst.owners.push(p.id)
    }
}

function tag(bay: THREE.Group, p: Product, x: number, y: number, z: number, tilt = 0) {
  const t = plane(0.26, 0.105, tagMat(p), bay)
  t.position.set(x, y, z)
  t.rotation.x = tilt
  return t
}

const fitScale = (p: Product, room: number, max = 1.3) => Math.min(max, room / unitSize(p)[1])

/**
 * Background stock for a shelf: runs of made-up packs, two to five facings each, packed edge to edge
 * and two or three deep, with the odd facing pulled back or sold through. Each run gets its own price tag.
 */
type MixOpts = { frame?: THREE.Matrix4; max?: number; gap?: number; rows?: number; tags?: boolean; block?: [number, number]; span?: [number, number]; plan?: number }

function fillMixed(c: Ctx, bay: THREE.Group, pool: Product[], owner: string, W: number, y: number, room: number, front: number, tagY: number, o: MixOpts = {}) {
  const { frame = c.frame, max = 1.08, gap = 0.005, tags = true, block = [2, 5] } = o
  const fits = pool.filter((q) => (room - 0.02) / unitSize(q)[1] >= 0.62)
  if (!fits.length) return
  const [from, to] = o.span ?? [-W / 2 + 0.03, W / 2 - 0.03]
  const end = to
  let x = from
  let last = -1
  // the same plan on every shelf of a bay lines each brand up into a vertical block
  const pickR = o.plan != null ? rng(o.plan) : c.R
  while (x < end - 0.06) {
    let k = Math.floor(pickR() * fits.length)
    if (k === last && fits.length > 1) k = (k + 1) % fits.length
    last = k
    const q = fits[k]
    const [w, h, d] = unitSize(q)
    const s = Math.min(max, (room - 0.02) / h)
    const step = w * s + gap
    const n = Math.min(Math.floor((end - x) / step), block[0] + Math.floor(pickR() * (block[1] - block[0] + 1)))
    if (n < 1) break
    const folded = q.shape === 'folded'
    const stackable = (['box', 'jar', 'tub', 'tetra', 'block'].includes(q.shape) && h * s < 0.17) || folded
    const tiers = stackable ? Math.max(1, Math.min(folded ? 6 : 3, Math.floor((room - 0.02) / (h * s)))) : 1
    const rows = o.rows ?? 2 // only the front faces and a sliver of the next row can be seen from the aisle
    const inst = instOf(c.insts, q)
    for (let i = 0; i < n; i++)
      for (let r = 0; r < rows; r++) {
        // a few facings are sold through or pushed back, like a shelf mid-afternoon
        if (r === 0 && c.R() < 0.07) continue
        const z = front - (d * s) / 2 - r * d * s * 1.03 - (r === 0 ? c.R() * 0.02 : 0)
        for (let t = 0; t < tiers; t++) {
          const m = new THREE.Matrix4().compose(
            new THREE.Vector3(x + i * step + (w * s) / 2, y + t * h * s, z),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (c.R() - 0.5) * 0.08, 0)),
            new THREE.Vector3(s, s, s),
          )
          inst.mats.push(m.premultiply(frame))
          inst.owners.push(owner)
        }
      }
    if (tags) {
      const t = plane(0.15, 0.06, tagMat(q), bay)
      t.position.set(Math.max(from + 0.07, Math.min(to - 0.07, x + (n * step) / 2)), tagY, front + 0.032)
    }
    x += n * step + Math.max(0.008, gap)
  }
}

/** Flat packs (butter, paneer, biscuits) are stacked so a shelf never shows more air than stock. */
const stacks = (p: Product, s: number, room: number) =>
  ['box', 'block', 'eggs', 'tub', 'jar', 'tetra'].includes(p.shape) ? Math.max(1, Math.min(4, Math.floor((room - 0.02) / (unitSize(p)[1] * s)))) : 1

const SHELF_EDGE = () => mat('#D9C5A5', { roughness: 0.42 })
const planOf = (t: string) => { let n = 11; for (let i = 0; i < t.length; i++) n = (n * 33 + t.charCodeAt(i)) >>> 0; return n }

/** A small card on the shelf edge, shown only for a real catalogue offer. */
const talkerTex = (p: Product) =>
  canvasTex(`talker-${p.id}`, 320, 112, (g, w, h) => {
    g.fillStyle = '#5F4FA3'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'
    let fs = 44; g.font = F(600, fs)
    while (g.measureText(p.offer ?? '').width > w - 28 && fs > 20) { fs -= 2; g.font = F(600, fs) }
    g.fillText(p.offer ?? '', w / 2, h / 2 + 2)
  })
const GONDOLA_BACK = () => mat('#F4EDE1', { roughness: 0.62 })
const GONDOLA_FRAME = () => mat('#C9A679', { roughness: 0.52 })
const GONDOLA_METAL = () => mat('#D8CDBB', { roughness: 0.34, metalness: 0.28 })

/** Grocery shelving: a dark back panel, six shelves, the featured product at eye level and packs everywhere else. */
function gondolaBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  const bulk = run.fixture === 'bulk'
  const top = 2.45
  box(W, top, 0.04, GONDOLA_BACK(), 0, top / 2, -D / 2 + 0.02, bay)
  box(W, 0.12, D, GONDOLA_FRAME(), 0, 0.06, 0, bay)
  box(0.05, top + 0.04, D - 0.06, GONDOLA_FRAME(), -W / 2, (top + 0.04) / 2, -0.03, bay)
  box(W, 0.18, 0.05, GONDOLA_FRAME(), 0, top + 0.09, -D / 2 + 0.12, bay)
  box(W - 0.06, 0.008, 0.02, LED, 0, top - 0.01, -D / 2 + 0.16, bay)
  const levels = bulk ? [0.12, 0.64, 1.16, 1.68] : [0.12, 0.5, 0.88, 1.26, 1.64, 2.02]
  const hero = bulk ? [1, 2] : [2, 3]
  const pool = fillerFor(run.section)
  const front = D / 2 - 0.06
  // planogram: brand columns either side, with the featured product in the middle at eye level
  const heroW = pool.length ? W * 0.46 : W
  const plan = planOf(p.id)
  levels.forEach((y, k) => {
    const room = Math.min(bulk ? 0.5 : 0.4, (levels[k + 1] ?? top) - y - 0.04)
    if (y > 0.2) box(W - 0.02, 0.022, D - 0.1, mat('#FBF8F2', { roughness: 0.5 }), 0, y - 0.011, -0.01, bay)
    box(W - 0.02, 0.064, 0.016, SHELF_EDGE(), 0, y - 0.03, front + 0.03, bay)
    if (y > 0.2) box(W - 0.06, 0.006, 0.01, LED, 0, y - 0.026, front - 0.02, bay)
    if (pool.length) {
      fillMixed(c, bay, pool, p.id, W, y, room, front, y - 0.03, { span: [-W / 2 + 0.03, -heroW / 2], plan: plan + 1 })
      fillMixed(c, bay, pool, p.id, W, y, room, front, y - 0.03, { span: [heroW / 2, W / 2 - 0.03], plan: plan + 2 })
    }
    if (hero.includes(k) || !pool.length) {
      tag(bay, p, 0, y - 0.03, front + 0.04)
      if (p.offer && k === hero[0]) {
        const t = plane(0.2, 0.07, basic(talkerTex(p)), bay)
        t.position.set(heroW / 2 - 0.12, y - 0.03, front + 0.044)
      }
      const s = fitScale(p, room - 0.02)
      const [w, , d] = unitSize(p)
      const rows = [0, 1]
      for (let t = 0; t < stacks(p, s, room); t++)
        fillShelf(c.insts, p, heroW, y + t * unitSize(p)[1] * s, rows.map((r) => front - (d * s) / 2 - r * d * s * 1.03), 1, c.frame, c.R, s, Math.max(0.004, 0.02 - w * 0.05))
    } else fillMixed(c, bay, pool, p.id, W, y, room, front, y - 0.03, { span: [-heroW / 2 + 0.01, heroW / 2 - 0.01], plan: plan + 3 })
  })
}

/* ---------- racks built from a front-on photo ---------- */

const photoTexs = new Map<string, THREE.Texture>()
const photoMats = new Map<string, THREE.MeshBasicMaterial>()
/** The photo is shown exactly as shot: unlit and outside tone mapping. */
const photoMat = (src: string) => {
  let m = photoMats.get(src)
  if (!m) {
    const t = new THREE.TextureLoader().load(src)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    photoTexs.set(src, t)
    photoMats.set(src, (m = new THREE.MeshBasicMaterial({ map: t, toneMapped: false })))
  }
  return m
}
const flatMats = new Map<string, THREE.MeshBasicMaterial>()
const flat = (color: string) => flatMats.get(color) ?? flatMats.set(color, new THREE.MeshBasicMaterial({ color, toneMapped: false })).get(color)!
const packMats = new Map<string, THREE.MeshBasicMaterial>()
/** Packs: the photo with face shading in the vertex colours. Shaped items are cut on the photo's alpha. */
const packMat = (src: string, cut: boolean) => {
  const k = src + cut
  let m = packMats.get(k)
  if (!m) {
    photoMat(src)
    m = new THREE.MeshBasicMaterial({ map: photoTexs.get(src)!, vertexColors: true, toneMapped: false, ...(cut ? { alphaTest: 0.3, side: THREE.DoubleSide } : {}) })
    packMats.set(k, m)
  }
  return m
}
const restMats = new Map<string, THREE.MeshBasicMaterial>()
/** Whatever the cut-out did not build as a pack (alpha 255 in the photo), drawn flat in line with the pack fronts. */
const restMat = (src: string) => {
  let m = restMats.get(src)
  if (!m) {
    photoMat(src)
    restMats.set(src, (m = new THREE.MeshBasicMaterial({ map: photoTexs.get(src)!, alphaTest: 0.75, toneMapped: false })))
  }
  return m
}
const HIT = new THREE.MeshBasicMaterial({ visible: false })

/** Quads gathered into one mesh: position, photo uv and a grey shade per vertex. */
class Quads {
  p: number[] = []; uv: number[] = []; c: number[] = []; i: number[] = []
  /** corners a b c d counter-clockwise seen from the front, with their uvs */
  add(v: number[][], uv: number[][], shade: number) {
    const n = this.p.length / 3
    v.forEach((q, k) => { this.p.push(q[0], q[1], q[2]); this.uv.push(uv[k][0], uv[k][1]); this.c.push(shade, shade, shade) })
    this.i.push(n, n + 1, n + 2, n, n + 2, n + 3)
  }
  mesh(m: THREE.Material) {
    if (!this.i.length) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2))
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3))
    g.setIndex(this.i)
    g.computeBoundingSphere()
    const o = new THREE.Mesh(g, m)
    o.userData.keep = true // keeps the shade, which merging would drop
    return o
  }
}

/**
 * One rack rebuilt in 3D from its photo: every shelf row of the photo stands recessed on a real shelf board,
 * the board fronts carry the photo's own shelf-edge pixels, and the oak frame wraps the sides and top.
 * Head-on it reads exactly as the photo; from an angle the shelves have depth.
 */
function photoBay(bay: THREE.Group, p: Product, ph: RackPhoto, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth, TOP = 2.45
  // the photo is never stretched: it fits the bay at its own proportions
  const s = Math.min(W / ph.w, (TOP - 0.02) / ph.h)
  const H = ph.h * s, PW = ph.w * s
  const base = Math.max(0.02, Math.min(0.05, TOP - H))
  const front = D / 2 - 0.02
  const solid3d = !!ph.packs?.length
  const back = front - (solid3d ? 0.5 : 0.1) // the back panel of each shelf row
  const Y = (py: number) => base + (ph.h - py) * s
  const X = (px: number) => -PW / 2 + px * s
  const photo = photoMat(ph.src)
  const oak = flat(ph.oak), shelf = flat(ph.shelf)
  const under = flat(new THREE.Color(ph.shelf).multiplyScalar(0.72).getStyle())

  /** a piece of the photo, pixel rect [x0,y0]-[x1,y1], facing the aisle at depth z */
  const piece = (x0: number, y0: number, x1: number, y1: number, z: number, id?: string | null) => {
    const g = new THREE.PlaneGeometry((x1 - x0) * s, (y1 - y0) * s)
    const u0 = x0 / ph.w, u1 = x1 / ph.w, v0 = 1 - y1 / ph.h, v1 = 1 - y0 / ph.h
    g.setAttribute('uv', new THREE.Float32BufferAttribute([u0, v1, u1, v1, u0, v0, u1, v0], 2))
    const m = new THREE.Mesh(g, photo)
    m.position.set((X(x0) + X(x1)) / 2, (Y(y0) + Y(y1)) / 2, z)
    if (id) { m.userData.productId = id; m.userData.keep = true }
    bay.add(m)
    return m
  }
  /** a flat horizontal board face between the packs and the shelf front */
  const board = (y: number, m: THREE.Material, up: boolean) => {
    const b = plane(PW, front - back, m, bay)
    b.rotation.x = up ? -Math.PI / 2 : Math.PI / 2
    b.position.set(0, y, (front + back) / 2)
  }
  const depth = front - back + 0.02, mid = (front + back) / 2

  // back, plinth and any oak the photo does not cover, so the rack is solid from every side
  box(W, TOP, 0.04, GONDOLA_BACK(), 0, TOP / 2, -D / 2 + 0.02, bay)
  box(W, base, D - 0.02, oak, 0, base / 2, -0.01, bay)
  if (W - PW > 0.004) [-1, 1].forEach((e) => box((W - PW) / 2, base + H, depth, oak, e * (W + PW) / 4, (base + H) / 2, mid, bay))
  const [fl, fr, ft] = ph.frame
  ;[[X(0), Math.max(fl, 8)], [X(ph.w - Math.max(fr, 8)), Math.max(fr, 8)]].forEach(([x, wpx]) => box(wpx * s, H, depth, oak, x + (wpx * s) / 2, base + H / 2, mid, bay))
  if (ft > 0) {
    box(PW, ft * s, depth, oak, 0, Y(ft / 2), mid, bay)
    board(Y(ft), under, false)
  }

  // the product blocks of one row, so a tap opens what was tapped
  const L = fl, R = ph.w - fr
  const rowBlocks = (k: number): [number, number, string | null][] => {
    if (ph.blocks) return ph.blocks[k] ?? []
    const order = ph.order ?? run.products
    const step = (R - L) / order.length
    return order.map((id, i) => [L + i * step, L + (i + 1) * step, id])
  }
  const row = (top: number, bottom: number, k: number) => {
    if (bottom - top < 2) return
    if (solid3d) {
      // a plain back panel, and an invisible face per product block at the front that takes the taps
      const bp = plane(PW, (bottom - top) * s, flat(ph.bg ?? ph.shelf), bay)
      bp.position.set(0, (Y(top) + Y(bottom)) / 2, back)
      piece(L, top, R, bottom, front - 0.03).material = restMat(ph.src)
      for (const [x0, x1, id] of rowBlocks(k)) {
        if (id === null) continue
        const t = plane((x1 - x0) * s, (bottom - top) * s, HIT, bay)
        t.position.set((X(x0) + X(x1)) / 2, (Y(top) + Y(bottom)) / 2, front - 0.012)
        t.userData.productId = id ?? p.id
        t.userData.keep = true
      }
      return
    }
    let x = L
    for (const [x0, x1, id] of rowBlocks(k)) {
      if (x0 > x) piece(x, top, x0, bottom, back)
      piece(Math.max(x, x0), top, x1, bottom, back, id === undefined ? p.id : id)
      x = x1
    }
    if (x < R) piece(x, top, R, bottom, back)
  }
  ph.lips.forEach(([a, b], k) => {
    row(k === 0 ? ft : ph.lips[k - 1][1], a, k)
    // the shelf board: photo pixels on its front edge, plain faces on top and below
    piece(L, a, R, b, front)
    board(Y(a), shelf, true)
    if (b < ph.h) board(Y(b), under, false)
  })
  // whatever stands below the last shelf, or the whole picture when the fixture has no shelves
  const last = ph.lips.length ? ph.lips[ph.lips.length - 1][1] : ft
  row(last, ph.h, ph.lips.length)
  if (solid3d) packs3d(bay, ph, { s, X, Y, zf: front - 0.03, zb: back + 0.01 })
}

/**
 * Every item cut from the photo becomes a solid: boxes and pouches as boxes, bottles, jars and heaps as round tubs.
 * The front face is the photo itself, so head-on the rack reads exactly as shot; the sides and top stretch the
 * item's own edge pixels back, and each facing repeats two or three deep like stock on a real shelf.
 */
function packs3d(bay: THREE.Group, ph: RackPhoto, o: { s: number; X: (px: number) => number; Y: (py: number) => number; zf: number; zb: number }) {
  const { s, X, Y, zf, zb } = o
  const U = (px: number) => px / ph.w, V = (py: number) => 1 - py / ph.h
  const solid = new Quads(), cut = new Quads()
  const room = zf - zb
  for (const [, x0, x1, y0, y1, round] of ph.packs!) {
    const w = (x1 - x0) * s, h = (y1 - y0) * s
    const xa = X(x0), xb = X(x1), yt = Y(y0), yb = Y(y1)
    const u0 = U(x0), u1 = U(x1), vt = V(y0), vb = V(y1)
    if (!round) {
      const d = Math.min(0.16, Math.max(0.03, Math.min(w * 0.7, h * 0.6)))
      const n = Math.max(1, Math.min(3, Math.floor(room / (d + 0.006))))
      const ul = U(x0 + 2), ur = U(x1 - 3), vtop = V(y0 + 2)
      for (let r = 0; r < n; r++) {
        const zF = zf - r * (d + 0.006), zB = zF - d
        solid.add([[xa, yb, zF], [xb, yb, zF], [xb, yt, zF], [xa, yt, zF]], [[u0, vb], [u1, vb], [u1, vt], [u0, vt]], 1)
        solid.add([[xa, yb, zB], [xa, yb, zF], [xa, yt, zF], [xa, yt, zB]], [[ul, vb], [ul, vb], [ul, vt], [ul, vt]], 0.8)
        solid.add([[xb, yb, zF], [xb, yb, zB], [xb, yt, zB], [xb, yt, zF]], [[ur, vb], [ur, vb], [ur, vt], [ur, vt]], 0.8)
        solid.add([[xa, yt, zF], [xb, yt, zF], [xb, yt, zB], [xa, yt, zB]], [[u0, vtop], [u1, vtop], [u1, vtop], [u0, vtop]], 0.93)
      }
    } else {
      // a round item: the photo wraps the front half and mirrors round the back, cut to its outline
      const rx = w / 2, rz = Math.min(rx, 0.1), cx = (xa + xb) / 2
      const n = Math.max(1, Math.min(3, Math.floor(room / (2 * rz + 0.006))))
      const SEG = 12
      const capV = V(y0 + (y1 - y0) * 0.12)
      for (let r = 0; r < n; r++) {
        const cz = zf - rz - r * (2 * rz + 0.006)
        const pt = (a: number) => [cx + rx * Math.sin(a), cz + rz * Math.cos(a)]
        const uu = (a: number) => u0 + ((Math.sin(a) + 1) / 2) * (u1 - u0)
        for (let k = 0; k < SEG; k++) {
          const a = -Math.PI + (k / SEG) * 2 * Math.PI, b = a + (2 * Math.PI) / SEG
          const [ax, az] = pt(a), [bx, bz] = pt(b)
          const shade = 0.72 + 0.28 * Math.max(0, Math.cos((a + b) / 2))
          cut.add([[ax, yb, az], [bx, yb, bz], [bx, yt, bz], [ax, yt, az]], [[uu(a), vb], [uu(b), vb], [uu(b), vt], [uu(a), vt]], shade)
        }
        // heaps and wide tubs get a lid; bottles keep their own outline at the top
        if (w > h * 0.6)
          for (let k = 0; k < SEG; k += 2) {
            const a = -Math.PI + (k / SEG) * 2 * Math.PI, m = a + Math.PI / SEG, b = a + (2 * Math.PI) / SEG
            const [ax, az] = pt(a), [mx, mz] = pt(m), [bx, bz] = pt(b)
            const uc = (u0 + u1) / 2
            cut.add([[cx, yt, cz], [ax, yt, az], [mx, yt, mz], [bx, yt, bz]].reverse(), [[uc, capV], [uc, capV], [uc, capV], [uc, capV]], 0.95)
          }
      }
    }
  }
  const a = solid.mesh(packMat(ph.src, false)), b = cut.mesh(packMat(ph.src, true))
  if (a) bay.add(a)
  if (b) bay.add(b)
}

/** Glass-door chiller: five glass shelves, back-lit, stocked to the doors. */
function chillerBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx, last: boolean) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.2, 0.04, mat('#FFFFFF', { emissive: '#F2F7FA', emissiveIntensity: 0.7, roughness: 0.6 }), 0, 1.2, -D / 2 + 0.02, bay)
  box(W, 0.3, D, GONDOLA_METAL(), 0, 0.15, 0, bay)
  box(W, 0.3, D, GONDOLA_METAL(), 0, 2.45, 0, bay)
  box(W - 0.06, 0.01, 0.02, LED, 0, 2.29, D / 2 - 0.08, bay)
  box(0.05, 2.6, D, GONDOLA_METAL(), -W / 2, 1.3, 0, bay)
  if (last) box(0.05, 2.6, D, GONDOLA_METAL(), W / 2, 1.3, 0, bay)
  const levels = [0.32, 0.7, 1.08, 1.46, 1.84]
  const pool = fillerFor(run.section)
  const front = D / 2 - 0.12
  levels.forEach((y, k) => {
    box(W - 0.06, 0.016, D - 0.18, mat('#F7F9FA', { roughness: 0.2 }), 0, y - 0.008, -0.03, bay)
    box(W - 0.06, 0.04, 0.012, SHELF_EDGE(), 0, y - 0.02, front + 0.02, bay)
    const room = (levels[k + 1] ?? 2.28) - y - 0.03
    if (k === 2 || k === 3 || !pool.length) {
      tag(bay, p, 0, y - 0.02, front + 0.03)
      const s = fitScale(p, room - 0.02)
      const d = unitSize(p)[2] * s
      for (let t = 0; t < stacks(p, s, room); t++)
        fillShelf(c.insts, p, W - 0.1, y + t * unitSize(p)[1] * s, [front - d / 2, front - d * 1.53], 1, c.frame, c.R, s, 0.006)
    } else fillMixed(c, bay, pool, p.id, W - 0.06, y, room, front, y - 0.02, { plan: planOf(p.id) })
  })
  const door = plane(W - 0.06, 2.0, M.glass(), bay)
  door.position.set(0, 1.28, D / 2 - 0.01)
  door.userData.noShadow = true
  box(0.03, 2.0, 0.03, M.alu(), W / 2 - 0.1, 1.28, D / 2, bay)
}

function bakeryBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth, oak = M.oak()
  box(W, 2.2, 0.04, mat('#E8DCC6', { roughness: 0.8 }), 0, 1.1, -D / 2 + 0.02, bay)
  box(0.05, 2.2, D, oak, -W / 2, 1.1, 0, bay)
  box(W, 0.4, D, oak, 0, 0.2, 0, bay)
  ;[0.46, 0.88, 1.3, 1.72].forEach((y) => {
    const shelf = new THREE.Group()
    shelf.position.set(0, y, 0.02)
    shelf.rotation.x = 0.14
    bay.add(shelf)
    box(W - 0.04, 0.03, D - 0.14, oak, 0, 0, 0, shelf)
    box(W - 0.04, 0.07, 0.025, oak, 0, 0.035, (D - 0.14) / 2, shelf)
    shelf.updateMatrix()
    fillShelf(c.insts, p, W, 0.015, [0.24, 0.08, -0.08, -0.24], 0.95, c.frame.clone().multiply(shelf.matrix), c.R, 1.08)
    tag(bay, p, 0, y - 0.04, D / 2 - 0.05)
  })
}

const OAK = () => mat('#D2B98F', { roughness: 0.56 })
const OAK_DEEP = () => mat('#A98A5F', { roughness: 0.62 })
const WALNUT = () => mat('#6F5439', { roughness: 0.5 })
const SAGE = () => mat('#DDE3CF', { roughness: 0.68 })
const heapBeds = new Map<string, THREE.MeshStandardMaterial>()
const heapBed = (p: Product) => {
  let m = heapBeds.get(p.id)
  if (!m) heapBeds.set(p.id, (m = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.colors[0]).multiplyScalar(0.58), roughness: 0.9 })))
  return m
}

type CrateOpts = { y: number; z: number; tilt: number; w: number; d: number; peak: number; owner: string; tagged?: boolean }

/** A slatted oak crate with a produce heap: a shaped bed under a single packed surface, so it looks full without hidden stock. */
function produceCrate(parent: THREE.Object3D, p: Product, c: Ctx, parentFrame: THREE.Matrix4, o: CrateOpts) {
  const { w, d, peak, owner } = o, R = c.R
  const crate = new THREE.Group()
  crate.position.set(0, o.y, o.z)
  crate.rotation.x = o.tilt
  parent.add(crate)
  crate.updateMatrix()
  const frame = parentFrame.clone().multiply(crate.matrix)
  box(w, 0.016, d, OAK_DEEP(), 0, 0.008, 0, crate)
  ;[-1, 1].forEach((e) => {
    for (let k = 0; k < 2; k++) {
      box(w, 0.04, 0.014, OAK(), 0, 0.036 + k * 0.05, (e * d) / 2, crate)
      box(0.014, 0.04, d, OAK(), (e * w) / 2, 0.036 + k * 0.05, 0, crate)
    }
    ;[-1, 1].forEach((f) => box(0.03, 0.12, 0.03, OAK_DEEP(), (e * w) / 2, 0.06, (f * d) / 2, crate))
  })
  const shape = (x: number, z: number) => {
    const ex = Math.min(1, Math.abs(x) / (w / 2)), ez = Math.min(1, Math.abs(z) / (d / 2))
    return peak * Math.pow(1 - Math.pow(ex, 4), 0.8) * Math.pow(1 - ez * ez, 0.72)
  }
  const bed = new THREE.PlaneGeometry(w - 0.025, d - 0.025, 12, 5).rotateX(-Math.PI / 2)
  const bp = bed.attributes.position
  for (let i = 0; i < bp.count; i++) bp.setY(i, 0.075 + shape(bp.getX(i), bp.getZ(i)) * 0.9)
  bed.computeVertexNormals()
  const bedMesh = new THREE.Mesh(bed, heapBed(p))
  bedMesh.userData.productId = owner
  bedMesh.userData.keep = true
  crate.add(bedMesh)
  const plate = box(0.34, 0.1, 0.008, WALNUT(), 0, 0.06, d / 2 + 0.012, crate)
  plate.userData.noCast = true
  if (o.tagged !== false) { const t = plane(0.3, 0.09, tagMat(p), crate); t.position.set(0, 0.06, d / 2 + 0.018) }

  const [uw, uh, ud] = unitSize(p)
  const long = p.shape === 'carrot' || p.shape === 'banana' || p.shape === 'spinach'
  const px = uw * (long ? 0.6 : 0.8), pz = ud * (long ? 0.68 : 0.72)
  const inst = instOf(c.insts, p)
  const place = (x: number, z: number, lift: number) => {
    const q = new THREE.Quaternion().setFromEuler(long
      ? new THREE.Euler((R() - 0.5) * 0.28, (R() < 0.5 ? 0 : Math.PI) + (R() - 0.5) * 0.46, (R() - 0.5) * 0.2)
      : new THREE.Euler((R() - 0.5) * 0.62, R() * 6.28, (R() - 0.5) * 0.62))
    const sc = 0.92 + R() * 0.16
    inst.mats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0.07 + shape(x, z) + lift - uh * 0.16, z), q, new THREE.Vector3(sc, sc, sc)).premultiply(frame))
    inst.owners.push(owner)
  }
  const mx = w / 2 - uw * (long ? 0.34 : 0.42), mz = d / 2 - ud * 0.36
  let row = 0
  for (let z = -mz; z <= mz + 1e-3; z += pz, row++)
    for (let x = -mx + (row % 2 ? px / 2 : 0); x <= mx + 1e-3; x += px) {
      place(x + (R() - 0.5) * px * 0.16, z + (R() - 0.5) * pz * 0.16, 0)
      // a loose second layer on the crown keeps the heap from looking machine laid
      if (shape(x, z) > peak * 0.62 && R() < 0.2) place(x + px * 0.42, z + pz * 0.3, uh * 0.46)
    }
}

/** Produce wall: a walnut plinth, oak slatted risers and five heaped crates stepping up a sage panel. */
function crateBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx, camera: boolean) {
  const W = run.bay, D = c.hall.depth, atrium = !!c.hall.atrium
  const wallH = atrium ? 2.62 : 1.9
  box(W, wallH, 0.04, SAGE(), 0, wallH / 2, -D / 2 + 0.02, bay)
  for (let x = -W / 2 + 0.125; x < W / 2; x += 0.25) box(0.006, wallH, 0.006, mat('#C8D0B8', { roughness: 0.7 }), x, wallH / 2, -D / 2 + 0.043, bay)
  box(W - 0.02, 0.09, D - 0.02, WALNUT(), 0, 0.045, 0, bay)
  box(W - 0.04, 0.42, 0.34, OAK_DEEP(), 0, 0.3, 0.26, bay)
  box(W - 0.04, 0.72, 0.3, OAK_DEEP(), 0, 0.45, -0.04, bay)
  box(W - 0.04, 1.02, 0.3, OAK_DEEP(), 0, 0.6, -0.3, bay)
  for (let x = -W / 2 + 0.07; x < W / 2 - 0.03; x += 0.105) box(0.078, 0.37, 0.012, OAK(), x, 0.285, 0.436, bay)
  box(0.035, wallH, 0.05, OAK(), -W / 2, wallH / 2, -D / 2 + 0.05, bay)
  const tiers = [
    { y: 0.5, z: 0.25, d: 0.36, peak: 0.17 },
    { y: 0.8, z: -0.03, d: 0.33, peak: 0.16 },
    { y: 1.1, z: -0.29, d: 0.28, peak: 0.14 },
    ...(atrium ? [{ y: 1.62, z: -0.31, d: 0.22, peak: 0.09 }, { y: 2.08, z: -0.33, d: 0.19, peak: 0.07 }] : []),
  ]
  tiers.forEach((t, i) => {
    if (i > 2) {
      box(W - 0.03, 0.03, 0.3, OAK(), 0, t.y - 0.05, -D / 2 + 0.17, bay)
      box(W - 0.08, 0.007, 0.012, LED, 0, t.y + 0.34, -D / 2 + 0.13, bay)
    }
    produceCrate(bay, p, c, c.frame, { y: t.y, z: t.z, tilt: i > 2 ? 0.34 : 0.28, w: W - 0.07, d: t.d, peak: t.peak, owner: p.id })
  })
  // the overhead tray camera stays in the standard halls; the tall produce wall keeps a clean top line
  if (camera && !atrium) {
    box(0.04, 0.04, 0.55, GONDOLA_METAL(), 0, 2.35, -0.05, bay)
    const cam = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), GONDOLA_METAL())
    cam.rotation.x = Math.PI
    cam.position.set(0, 2.33, 0.24)
    bay.add(cam)
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 10), REC)
    dot.position.set(0.04, 2.36, 0.3)
    bay.add(dot)
  }
}

/** Place one unit of q in the bay, remembering which catalogue product a tap on it opens. */
function put(c: Ctx, q: Product, owner: string, x: number, y: number, z: number, s = 1, yaw = (c.R() - 0.5) * 0.08, frame = c.frame) {
  const inst = instOf(c.insts, q)
  inst.mats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), new THREE.Vector3(s, s, s)).premultiply(frame))
  inst.owners.push(owner)
}

const pick = <T,>(c: Ctx, list: T[]) => list[Math.floor(c.R() * list.length)]

/** Beauty: oak uprights, a softly backlit panel and five glass shelves, testers at eye level. */
function vanityBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.3, 0.04, mat('#FBF5EF', { emissive: '#F7E9DE', emissiveIntensity: 0.5, roughness: 0.7 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(0.05, 2.35, D * 0.75, M.oak(), -W / 2, 1.175, -D * 0.12, bay)
  box(W, 0.45, D * 0.8, mat('#EFE6DA', { roughness: 0.6 }), 0, 0.225, -D * 0.1, bay)
  box(W, 0.04, D * 0.8, M.oak(), 0, 0.47, -D * 0.1, bay)
  box(W, 0.1, D * 0.6, M.oak(), 0, 2.25, -D * 0.2, bay)
  box(W - 0.1, 0.008, 0.012, LED, 0, 2.195, D * 0.08, bay)
  const levels = [0.5, 0.84, 1.18, 1.52, 1.86]
  const pool = fillerFor(run.section)
  const front = D * 0.15
  levels.forEach((y, k) => {
    if (k) box(W - 0.1, 0.014, D * 0.55, mat('#F2F6F7', { roughness: 0.1, metalness: 0.1 }), 0, y - 0.007, -D * 0.12, bay)
    box(W - 0.14, 0.006, 0.01, LED, 0, y - 0.02, front, bay)
    const room = (levels[k + 1] ?? 2.19) - y - 0.03
    if (k === 1 || k === 2 || !pool.length) {
      tag(bay, p, 0, y - 0.045, D * 0.17)
      const s = fitScale(p, room - 0.04, 1.5)
      const d = unitSize(p)[2] * s
      fillShelf(c.insts, p, W - 0.12, y, [front - d / 2 - 0.01, front - d * 1.7, front - d * 2.9], 1, c.frame, c.R, s, 0.012)
    } else fillMixed(c, bay, pool, p.id, W - 0.1, y, room, front, y - 0.04, { max: 1.4, gap: 0.01, rows: 2 })
  })
}

/** Fragrance: a cream counter lined with bottles, and three glass shelves on a framed panel behind. */
function counterBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W - 0.1, 0.95, 0.62, mat('#F1E9DF', { roughness: 0.5 }), 0, 0.475, 0.02, bay)
  box(W - 0.06, 0.03, 0.66, M.oak(), 0, 0.965, 0.02, bay)
  box(W - 0.3, 1.3, 0.04, mat('#FBF6F1', { emissive: '#F6E7DF', emissiveIntensity: 0.6 }), 0, 1.75, -D / 2 + 0.03, bay)
  box(W - 0.26, 0.03, 0.05, M.oak(), 0, 2.41, -D / 2 + 0.04, bay)
  box(W - 0.26, 0.03, 0.05, M.oak(), 0, 1.09, -D / 2 + 0.04, bay)
  const pool = fillerFor(run.section)
  tag(bay, p, 0, 0.9, 0.34)
  fillShelf(c.insts, p, W - 0.5, 0.98, [0.2], 1, c.frame, c.R, fitScale(p, 0.28, 1.7), 0.05)
  fillMixed(c, bay, pool, p.id, W - 0.24, 0.98, 0.3, 0.06, 0.94, { max: 1.6, gap: 0.03, rows: 2, tags: false, block: [1, 3] })
  const front = -D / 2 + 0.28
  ;[1.25, 1.65, 2.05].forEach((y, k) => {
    box(W - 0.5, 0.014, 0.24, mat('#F2F6F7', { roughness: 0.1, metalness: 0.1 }), 0, y - 0.007, -D / 2 + 0.16, bay)
    box(W - 0.54, 0.006, 0.01, LED, 0, y - 0.02, front - 0.005, bay)
    if (k === 1) fillShelf(c.insts, p, W - 0.56, y, [front - 0.05, front - 0.15], 1, c.frame, c.R, 1.4, 0.04)
    else fillMixed(c, bay, pool, p.id, W - 0.52, y, 0.34, front, y - 0.04, { max: 1.5, gap: 0.03, rows: 2, tags: false, block: [1, 3] })
  })
}

/** Electronics: a demo table, two shelves of boxed stock and the demo units above, on a cool backlit panel. */
function techBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W - 0.08, 0.86, 0.66, mat('#FAFAF9', { roughness: 0.35 }), 0, 0.43, 0.05, bay)
  box(W - 0.06, 0.03, 0.7, mat('#C9CBCE', { roughness: 0.3, metalness: 0.6 }), 0, 0.875, 0.05, bay)
  box(W, 2.4, 0.04, mat('#F2F5F7', { emissive: '#E6EEF4', emissiveIntensity: 0.5, roughness: 0.6 }), 0, 1.2, -D / 2 + 0.02, bay)
  const pool = fillerFor(run.section)
  const front = -D / 2 + 0.3
  tag(bay, p, 0, 0.82, 0.39)
  const [w] = unitSize(p)
  const sc = Math.min(1.4, 0.34 / Math.max(w, 0.1))
  fillShelf(c.insts, p, W - 0.1, 0.89, [0.14], w > 0.25 ? 0.5 : 0.75, c.frame, c.R, Math.max(1, sc), 0.12)
  // boxed stock behind the demo units, so the table reads as a counter in front of a full wall
  if (pool.length) fillMixed(c, bay, pool, p.id, W - 0.12, 0.89, 0.3, -0.12, 0.85, { max: 1.1, gap: 0.006, rows: 1, tags: false })
  ;[1.14, 1.52, 1.9].forEach((y, k) => {
    box(W - 0.1, 0.02, 0.3, M.white(), 0, y - 0.01, -D / 2 + 0.16, bay)
    box(W - 0.14, 0.006, 0.01, LED, 0, y - 0.025, front - 0.005, bay)
    if (k === 1 || !pool.length) {
      tag(bay, p, 0, y - 0.04, front + 0.01)
      fillShelf(c.insts, p, W - 0.1, y, [front - unitSize(p)[2] * 0.6], w > 0.25 ? 0.6 : 0.9, c.frame, c.R, Math.min(1.2, fitScale(p, 0.34, 1.2)), 0.05)
    } else fillMixed(c, bay, pool, p.id, W - 0.1, y, 0.36, front, y - 0.04, { max: 1.1, gap: 0.008 })
  })
}

/** TV wall: a large set mounted on a dark panel above a console of soundbars and accessories. */
function tvBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.4, 0.05, mat('#E6E3DC', { roughness: 0.4 }), 0, 1.3, -D / 2 + 0.03, bay)
  box(W - 0.3, 0.4, 0.42, mat('#E9E5DE', { roughness: 0.5 }), 0, 0.2, -D / 2 + 0.27, bay)
  box(W - 0.28, 0.025, 0.44, M.oak(), 0, 0.41, -D / 2 + 0.27, bay)
  tag(bay, p, 0, 0.32, -D / 2 + 0.49)
  put(c, p, p.id, 0, 0.95, -D / 2 + 0.09, 1.4, 0)
  const pool = fillerFor(run.section)
  if (pool.length) fillMixed(c, bay, pool, p.id, W - 0.36, 0.4225, 0.42, -D / 2 + 0.46, 0.3, { max: 1, gap: 0.04, rows: 1, tags: false, block: [1, 2] })
}

/** Kidswear: face-out arms on a pastel panel, one style per arm, sizes hanging one behind another. */
function railBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.3, 0.04, mat('#F6EEE2', { roughness: 0.8 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(0.05, 2.35, 0.08, M.oak(), -W / 2, 1.175, -D / 2 + 0.06, bay)
  const pool = fillerFor(run.section)
  const short = pool.filter((q) => unitSize(q)[1] <= 0.45)
  const tall = unitSize(p)[1] > 0.5
  ;[[-0.33, 2.05], [0.33, 2.05], [-0.33, 1.08], [0.33, 1.08]].forEach(([x, armY], k) => {
    const q = k < 2 ? (k === 1 && pool.length && c.R() < 0.5 ? pick(c, pool) : p) : tall || !short.length ? null : k === 2 && !tall && unitSize(p)[1] <= 0.45 ? p : pick(c, short)
    if (!q) return
    box(0.02, 0.02, D * 0.75, M.alu(), x, armY, -D * 0.1, bay)
    const h = unitSize(q)[1]
    for (let i = 0; i < 7; i++) put(c, q, p.id, x, armY - h - 0.03, 0.22 - i * 0.075)
  })
  tag(bay, p, 0, 0.62, -D / 2 + 0.06)
}

/** Folded goods and accessories: stacks on a pale oak table, three shelves behind. */
function foldedBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W - 0.1, 0.72, 0.62, M.oak(), 0, 0.36, 0.06, bay)
  box(W, 2.2, 0.04, mat('#F4EEE4', { roughness: 0.8 }), 0, 1.1, -D / 2 + 0.02, bay)
  box(0.05, 2.25, 0.3, M.oak(), -W / 2, 1.125, -D / 2 + 0.15, bay)
  tag(bay, p, 0, 0.66, 0.38)
  const pool = fillerFor(run.section)
  const [, h, d] = unitSize(p)
  const stack = p.shape === 'folded' ? 5 : 1
  for (let k = 0; k < stack; k++) fillShelf(c.insts, p, W - 0.2, 0.72 + k * h * 1.02, [0.37 - d / 2 - 0.02], 0.8, c.frame, c.R, 1, 0.05)
  if (pool.length) fillMixed(c, bay, pool, p.id, W - 0.16, 0.72, 0.36, 0.37 - d - 0.06, 0.66, { max: 1, gap: 0.04, rows: 1, tags: false, block: [1, 2] })
  const front = -D / 2 + 0.3
  ;[1.0, 1.4, 1.8].forEach((y, k) => {
    box(W - 0.1, 0.03, 0.28, M.oak(), 0, y - 0.015, -D / 2 + 0.16, bay)
    if (k === 1 || !pool.length) fillShelf(c.insts, p, W - 0.1, y, [front - unitSize(p)[2] * 0.55], 0.85, c.frame, c.R, fitScale(p, 0.36, 1), 0.04)
    else fillMixed(c, bay, pool, p.id, W - 0.1, y, 0.38, front, y - 0.04, { max: 1, gap: 0.03, rows: 1, block: [1, 3] })
  })
}

/** Shoes: six angled shelves on a wall, pairs facing the aisle. */
function shoeBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.3, 0.04, mat('#F6EEE2', { roughness: 0.8 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(0.05, 2.35, D * 0.6, M.oak(), -W / 2, 1.175, -D * 0.2, bay)
  const pool = fillerFor(run.section)
  ;[0.3, 0.62, 0.94, 1.26, 1.58, 1.9].forEach((y, k) => {
    const shelf = new THREE.Group()
    shelf.position.set(0, y, -D * 0.18)
    shelf.rotation.x = 0.22
    bay.add(shelf)
    box(W - 0.06, 0.02, D * 0.5, M.white(), 0, 0, 0, shelf)
    shelf.updateMatrix()
    const frame = c.frame.clone().multiply(shelf.matrix)
    if (k === 2 || k === 3 || !pool.length) {
      fillShelf(c.insts, p, W - 0.06, 0.01, [0.06], 0.9, frame, c.R, 1.2, 0.05)
      tag(bay, p, 0, y - 0.03, -D * 0.18 + D * 0.26, 0)
    } else fillMixed(c, bay, pool, p.id, W - 0.06, 0.01, 0.3, D * 0.25 - 0.02, 0, { frame, max: 1.2, gap: 0.05, rows: 1, tags: false, block: [1, 3] })
  })
}

/** Home: an oak open shelf unit on a linen panel, generously but neatly stocked. */
function homeBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.3, 0.04, mat('#EEE6D8', { roughness: 0.95 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(0.05, 2.35, D * 0.8, M.wood(), -W / 2, 1.175, -D * 0.1, bay)
  const levels = [0.08, 0.52, 0.96, 1.4, 1.84]
  const pool = fillerFor(run.section)
  const front = D * 0.27
  levels.forEach((y, k) => {
    box(W - 0.04, 0.04, D * 0.75, M.oak(), 0, y - 0.02, -D * 0.1, bay)
    const room = (levels[k + 1] ?? 2.28) - y - 0.04
    if (k === 2 || !pool.length) {
      tag(bay, p, 0, y - 0.05, D * 0.28)
      const s = fitScale(p, room, 1.1)
      const d = unitSize(p)[2] * s
      for (let t = 0; t < stacks(p, s, room); t++)
        fillShelf(c.insts, p, W - 0.14, y + t * unitSize(p)[1] * s, d < 0.2 ? [front - d / 2, front - d * 1.6] : [front - d / 2], 0.9, c.frame, c.R, s, 0.04)
    } else fillMixed(c, bay, pool, p.id, W - 0.1, y, room, front, y - 0.05, { max: 1.1, gap: 0.035, rows: 2, block: [1, 3] })
  })
}

/* ---------- the grocery atrium ---------- */

const shopRowTex = (names: string[]) =>
  canvasTex(`shops-${names.join('-')}`, 2048, 440, (g, w, h) => {
    const R = rng(names[0].length * 31 + names[1].length)
    const cell = w / names.length
    names.forEach((name, i) => {
      const x = i * cell
      g.fillStyle = '#E8BE85'; g.fillRect(x, 92, cell, h - 92)
      g.fillStyle = '#F7DDB0'; g.fillRect(x, 92, cell, 30)
      for (let r = 0; r < 3; r++) {
        const y = 170 + r * 84
        g.fillStyle = '#6B4B30'; g.fillRect(x + 28, y + 52, cell - 56, 5)
        for (let k = x + 36; k < x + cell - 44; k += 16 + R() * 18) {
          g.fillStyle = ['#8C3B3B', '#2F4C6E', '#D9CDB8', '#3F5B45', '#B9824A', '#2B2B2B'][(R() * 6) | 0]
          g.fillRect(k, y + 6 + R() * 10, 11 + R() * 9, 44)
        }
      }
      g.fillStyle = 'rgba(255,255,255,0.12)'
      for (let m = 1; m < 4; m++) g.fillRect(x + (cell * m) / 4, 92, 3, h - 92)
      g.fillStyle = '#17130F'; g.fillRect(x, 0, cell, 92)
      g.fillStyle = '#FFF4DF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = F(700, 54)
      g.fillText(name, x + cell / 2, 48)
      g.fillStyle = '#4A3A2B'; g.fillRect(x, 0, 12, h); g.fillRect(x + cell - 12, 0, 12, h)
    })
  })

/** Lighter category sign: white board inside an oak frame. */
const subSignTex = (raw: string, w: number, h: number, size: number, text = sentence(raw)) =>
  canvasTex(`subsign-${text}-${w}`, w, h, (g) => {
    g.fillStyle = '#C9A679'; g.fillRect(0, 0, w, h)
    g.fillStyle = '#FFFFFF'; g.fillRect(7, 7, w - 14, h - 14)
    g.fillStyle = SIGN; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = size; g.font = F(700, s)
    while (g.measureText(text).width > w * 0.88 && s > 24) { s -= 2; g.font = F(700, s) }
    g.fillText(text, w / 2, h / 2 - 2)
  })

const bigSignTex = (raw: string, w: number, h: number, size: number, text = sentence(raw)) =>
  canvasTex(`big-${text}-${w}`, w, h, (g) => {
    g.fillStyle = SIGN; g.fillRect(0, 0, w, h)
    g.fillStyle = '#FFF9EC'; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = size; g.font = F(700, s)
    while (g.measureText(text).width > w * 0.92 && s > 24) { s -= 2; g.font = F(700, s) }
    g.fillText(text, w / 2, h / 2 - 3)
  })

function buildAtrium(g: THREE.Group, hall: Hall) {
  const { ox, half, entranceZ, backZ } = hall
  const L = entranceZ - backZ, zc = (entranceZ + backZ) / 2
  const up = new THREE.Group()
  g.add(up)
  const outer = half + 2.2, eave = 10.4, rise = 3.2
  const stone = mat('#F2EBDF', { roughness: 0.48 }), dark = mat('#C8AE88', { roughness: 0.5 })
  const steel = mat('#C9CBCC', { roughness: 0.3, metalness: 0.7 })
  const levels = [
    { y: 4.4, edge: half, names: { [-1]: ['WESTSIDE', 'TITAN', 'ZUDIO', 'FASHION'], [1]: ['FASHION', 'TANISHQ', 'CROMA', 'WESTSIDE'] } as Record<number, string[]> },
    { y: 7.5, edge: half + 0.6, names: { [-1]: ['HOME', 'BEAUTY', 'KIDS', 'FOOTWEAR'], [1]: ['BEAUTY', 'WATCHES', 'HOME', 'KIDS'] } as Record<number, string[]> },
  ]
  ;[-1, 1].forEach((s) => {
    levels.forEach((l) => {
      const w = outer - l.edge + 0.1
      box(w, 0.34, L, stone, ox + s * (l.edge + w / 2), l.y - 0.17, zc, up)
      box(0.06, 0.38, L, dark, ox + s * l.edge, l.y - 0.17, zc, up)
      box(0.05, 0.02, L - 0.4, LED, ox + s * (l.edge + 0.12), l.y - 0.35, zc, up)
      const glass = plane(L, 1.05, M.glass(), up)
      glass.rotation.y = -s * Math.PI / 2
      glass.position.set(ox + s * (l.edge + 0.04), l.y + 0.53, zc)
      box(0.06, 0.05, L, M.alu(), ox + s * (l.edge + 0.04), l.y + 1.07, zc, up)
      for (let z = entranceZ; z >= backZ; z -= 2.4) box(0.03, 1.05, 0.03, steel, ox + s * (l.edge + 0.04), l.y + 0.53, z, up)
      const pw = L / 3
      for (let i = 0; i < 3; i++) {
        const shop = plane(pw, 2.9, basic(shopRowTex(l.names[s]), { fog: false }), up)
        shop.rotation.y = -s * Math.PI / 2
        shop.position.set(ox + s * outer, l.y + 1.45, entranceZ - pw * (i + 0.5))
      }
    })
    for (let z = entranceZ - 2; z > backZ; z -= 8) box(0.42, eave - 4.4, 0.42, stone, ox + s * (half + 1.9), (eave + 4.4) / 2, z, up)
    box(0.3, 0.3, L, dark, ox + s * outer, eave + 0.1, zc, up)

    // glass gable
    const len = Math.hypot(outer, rise), a = Math.atan2(rise, outer)
    const slope = new THREE.Group()
    slope.position.set(ox + (s * outer) / 2, eave + rise / 2, zc)
    slope.rotation.z = -s * a
    up.add(slope)
    const sky = plane(len, L, new THREE.MeshBasicMaterial({ map: skyTex(), fog: false }), slope)
    sky.rotation.x = Math.PI / 2
    sky.position.y = 0.02
    for (let z = -L / 2; z <= L / 2; z += 2.4) box(len, 0.13, 0.08, dark, 0, -0.06, z, slope)
    for (let k = 0; k <= 5; k++) box(0.06, 0.06, L, dark, -len / 2 + (k * len) / 5, -0.05, 0, slope)
  })
  box(0.2, 0.22, L, dark, ox, eave + rise, zc, up)

  // upper end walls, with the next department signed on the far one
  const endWall = mat('#F4EDE2', { roughness: 0.7 })
  ;[backZ, entranceZ].forEach((z) => {
    const w = plane(outer * 2, eave + rise - 4.4, endWall, up)
    w.rotation.y = z === backZ ? 0 : Math.PI
    w.position.set(ox, (eave + rise + 4.4) / 2, z)
  })
  const far = plane(6.4, 1.2, basic(bigSignTex('ELECTRONICS', 1024, 192, 120), { fog: false }), up)
  far.position.set(ox, 5.9, backZ + 0.04)

  // the tall campaign banner over the aisle
  const banner = plane(3.0, 4.8, basic(bannerTex(), { side: THREE.DoubleSide, fog: false }), up)
  banner.position.set(ox, 7.6, -17)
  ;[-1.3, 1.3].forEach((x) => box(0.012, eave + rise - 10, 0.012, M.alu(), ox + x, (eave + rise + 10) / 2 - 0.4, -17, up))

  // department signs: one large board at the near end, sub signs running on down the wall
  const zones = [
    { s: -1, z0: -0.6, z1: -16, main: 'FRESH PRODUCE', subs: ['Farm Fresh', 'Naturally Yours'] },
    { s: -1, z0: -16.4, z1: -30.7, main: 'DAIRY & BAKERY', subs: ['Chilled Daily', 'Baked Fresh'] },
    { s: 1, z0: -0.6, z1: -18.7, main: 'GROCERY ESSENTIALS', subs: ['Cooking Essentials', 'Snacks & Drinks', 'Staples'] },
    { s: 1, z0: -19, z1: -25, main: 'TEA & JUICES', subs: [] as string[] },
  ]
  for (const zn of zones) {
    const len = zn.z0 - zn.z1, mainW = Math.min(len - 0.1, 7)
    const holder = new THREE.Group()
    holder.position.set(ox + zn.s * (half - 0.16), 3.62, (zn.z0 + zn.z1) / 2)
    holder.rotation.y = -zn.s * Math.PI / 2
    up.add(holder)
    const tilt = new THREE.Group()
    tilt.rotation.x = 0.1
    holder.add(tilt)
    box(len, 0.92, 0.06, mat(SIGN, { roughness: 0.5 }), 0, 0, -0.04, tilt)
    const mainPanel = plane(mainW, 0.88, basic(bigSignTex(zn.main, 1536, 192, 150), { fog: false, toneMapped: false }), tilt)
    // long boards start a few metres in, so the whole name is in frame from the doorway
    const inset = zn.z0 > -1 ? 2.8 : 0.05
    mainPanel.position.set(zn.s * (len / 2 - mainW / 2 - inset), 0, 0)
    const rest = len - mainW - inset - 0.15
    zn.subs.forEach((text, i) => {
      const w = rest / zn.subs.length
      const sub = plane(w - 0.2, 0.56, basic(subSignTex(text, 768, 128, 66), { fog: false, toneMapped: false }), tilt)
      sub.position.set(zn.s * (len / 2 - mainW - inset - 0.1 - w * (i + 0.5)), 0, 0)
    })
  }

  // brand campaign posters on the open stretch of the right wall: photographs, lit like a backlit lightbox
  ;[
    { z: -26.8, src: '/ads/gold-winner.jpg' },
    { z: -30.4, src: '/ads/tata-sampann.jpg' },
  ].forEach(({ z, src }) => {
    const p = plane(2.4, 3.6, photoMat(src), up)
    p.rotation.y = -Math.PI / 2
    p.position.set(ox + half - 0.08, 1.9, z)
    box(0.05, 3.72, 2.52, dark, ox + half - 0.04, 1.9, z, up)
  })

  // trees on the first floor gallery, clear of the driving aisle
  const R = rng(137)
  const leaves: [number, number, number, number][] = []
  ;[-1, 1].forEach((s) => {
    for (let z = -3 - (s > 0 ? 3 : 0); z > backZ + 2; z -= 7.5) {
      const x = ox + s * (half + 1.05), y = 4.4
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.62, 18), M.ceramic())
      pot.position.set(x, y + 0.31, z)
      up.add(pot)
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 2.5, 8), mat('#6F5D49', { roughness: 0.85 }))
      trunk.position.set(x, y + 1.8, z)
      up.add(trunk)
      for (let i = 0; i < 70; i++) {
        const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 1.15
        leaves.push([x + Math.cos(a) * d, y + 2.5 + R() * 1.5 - d * 0.35, z + Math.sin(a) * d, 0.5 + R() * 0.45])
      }
    }
  })
  const leafM = new THREE.MeshStandardMaterial({ map: leafTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8 })
  const foliage = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 1.2), leafM, leaves.length)
  const tm = new THREE.Matrix4(), tq = new THREE.Quaternion(), te = new THREE.Euler()
  leaves.forEach(([x, y, z, sc], i) => {
    te.set(R() * Math.PI, R() * Math.PI, R() * Math.PI)
    tq.setFromEuler(te)
    tm.compose(new THREE.Vector3(x, y, z), tq, new THREE.Vector3(sc, sc, sc))
    foliage.setMatrixAt(i, tm)
  })
  foliage.frustumCulled = false
  up.add(foliage)

  // the upper storeys stay out of the shadow pass
  up.traverse((o) => { o.userData.noShadow = true })
}

/** A produce island on the aisle centre line: tilted crates down both long sides. */
function produceIsland(g: THREE.Group, c: Ctx, z: number, ids: string[], ad?: string) {
  const { ox } = c.hall
  const isl = new THREE.Group()
  isl.position.set(ox, 0, z)
  g.add(isl)
  box(1.0, 0.08, 3.08, WALNUT(), 0, 0.04, 0, isl)
  box(0.88, 0.44, 3.0, OAK_DEEP(), 0, 0.3, 0, isl)
  box(0.34, 0.84, 2.92, OAK_DEEP(), 0, 0.46, 0, isl)
  box(0.38, 0.03, 2.96, OAK(), 0, 0.885, 0, isl)
  if (ad) {
    // a double-sided header board on the riser, the campaign photo cropped to a wide band on both faces
    const BW = 2.5, BH = 1.4, y = 1.0 + BH / 2
    box(0.06, BH + 0.08, BW + 0.08, OAK(), 0, y, 0, isl)
    ;[-0.9, 0.9].forEach((t) => box(0.04, 0.12, 0.04, M.alu(), 0, 0.96, t, isl))
    const cut = (1 - (1536 / 1024) / (BW / BH)) / 2 // crop a 3:2 photo to the board's shape
    ;[-1, 1].forEach((s) => {
      const geo = new THREE.PlaneGeometry(BW, BH)
      geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1 - cut, 1, 1 - cut, 0, cut, 1, cut], 2))
      const face = new THREE.Mesh(geo, photoMat(ad))
      face.rotation.y = s * Math.PI / 2
      face.position.set(s * 0.032, y, 0)
      isl.add(face)
    })
  }
  ;[-1, 1].forEach((side) => {
    for (let t = -1.44; t < 1.46; t += 0.105) box(0.012, 0.4, 0.078, OAK(), side * 0.446, 0.29, t, isl)
    for (let k = 0; k < 4; k++) {
      const p = PRODUCT_BY_ID[ids[(k + (side > 0 ? 2 : 0)) % ids.length]]
      const holder = new THREE.Group()
      holder.position.set(side * 0.34, 0, -1.11 + k * 0.74)
      holder.rotation.y = side * Math.PI / 2
      isl.add(holder)
      holder.updateMatrix()
      const frame = new THREE.Matrix4().makeTranslation(ox, 0, z).multiply(holder.matrix)
      produceCrate(holder, p, c, frame, { y: 0.54, z: 0.02, tilt: 0.26, w: 0.7, d: 0.42, peak: 0.16, owner: p.id })
    }
  })
  addRect({ x0: ox - 0.62, x1: ox + 0.62, z0: z - 1.56, z1: z + 1.56 }, c.hall.id)
}

/* ---------- the hall ---------- */

/** ChatGPT campaign photos for the far end of each wall (public/ads), by hall and side. */
const WALL_ADS: Record<string, Partial<Record<-1 | 1, string>>> = {
  bigbasket: { [-1]: '/ads/bb-royal.jpg' },
  palette: { [-1]: '/ads/vana-botanicals.jpg', [1]: '/ads/saanjh.jpg' },
  croma: { [-1]: '/ads/pulse-audio.jpg', [1]: '/ads/nimbus.jpg' },
  zudio: { [-1]: '/ads/zudio-school.jpg', [1]: '/ads/zudio-summer.jpg' },
  'westside-home': { [-1]: '/ads/westside-table.jpg', [1]: '/ads/westside-bedroom.jpg' },
  irth: { [-1]: '/ads/irth-bags.jpg', [1]: '/ads/irth-eyewear.jpg' },
  sampann: { [-1]: '/ads/sampann-spices.jpg', [1]: '/ads/tata-salt.jpg' },
}

function buildHall(hall: Hall) {
  const g = new THREE.Group()
  const { ox, half, entranceZ, backZ, ceilY, theme } = hall
  const L = entranceZ - backZ, zc = (entranceZ + backZ) / 2

  // polished stone: a mirror under a mostly opaque floor gives soft reflections of the shelves and lights
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex([(half * 2) / 2.4, L / 2.4]), color: '#EFE5D6', roughness: 0.28 })
  const runnerMat = new THREE.MeshStandardMaterial({ map: inlayTex([1, L / 1.6]), color: '#E2D4BF', roughness: 0.3 })
  const floor = plane(half * 2, L, floorMat, g)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(ox, 0, zc)
  floor.userData.noCast = true
  const rw = Math.min(1024, Math.round(window.innerWidth * 0.6)), rh = Math.min(1024, Math.round(window.innerHeight * 0.6))
  const mirror = new Reflector(new THREE.PlaneGeometry(half * 2, L), { textureWidth: rw, textureHeight: rh, clipBias: 0.003, color: 0xa8a49d })
  mirror.rotation.x = -Math.PI / 2
  mirror.position.set(ox, -0.003, zc)
  mirror.userData.noShadow = true
  g.add(mirror)
  const applyQuality = () => {
    const on = quality.reflections
    mirror.visible = on
    for (const [m, o] of [[floorMat, 0.95], [runnerMat, 0.97]] as const) { m.transparent = on; m.opacity = on ? o : 1; m.needsUpdate = true }
  }
  applyQuality()
  onQuality(applyQuality)
  // The mirror redraws the scene, so it only redraws products close enough for their reflection to read.
  const stock: THREE.InstancedMesh[] = []
  const drawMirror = mirror.onBeforeRender
  mirror.onBeforeRender = (renderer, scene, camera, ...rest) => {
    const hidden = stock.filter((im) => im.visible && im.boundingSphere!.center.distanceTo(camera.position) > MIRROR_STOCK_RANGE)
    hidden.forEach((im) => { im.visible = false })
    drawMirror.call(mirror, renderer, scene, camera, ...rest)
    hidden.forEach((im) => { im.visible = true })
  }
  const runner = plane(1.6, L, runnerMat, g)
  runner.rotation.x = -Math.PI / 2
  runner.position.set(ox, 0.004, zc)
  runner.userData.noCast = true

  // walls catch soft bounced daylight so the store never reads as gloomy
  const plaster = mat(theme.wall, { roughness: 0.72 })
  const wallH = hall.atrium ? 4.4 : ceilY
  ;[-1, 1].forEach((s) => {
    const w = plane(L, wallH, plaster, g)
    w.rotation.y = -s * Math.PI / 2
    w.position.set(ox + s * half, wallH / 2, zc)
    w.userData.noCast = true
    box(0.02, 0.06, L, mat(theme.accent), ox + s * (half - 0.01), 3.2, zc, g).userData.noCast = true
  })
  const back = plane(half * 2, wallH, basic(backWallTex(hall)), g)
  back.position.set(ox, wallH / 2, backZ)
  ;[-1, 1].forEach((s) => {
    const w = plane(half - 1.6, wallH, plaster, g)
    w.rotation.y = Math.PI
    w.position.set(ox + s * (1.6 + (half - 1.6) / 2), wallH / 2, entranceZ)
    w.userData.noCast = true
  })
  const lintel = plane(3.2, wallH - 3.1, plaster, g)
  lintel.rotation.y = Math.PI
  lintel.position.set(ox, 3.1 + (wallH - 3.1) / 2, entranceZ)
  lintel.userData.noCast = true
  const door = plane(3.2, 3.1, basic(doorwayTex()), g)
  door.rotation.y = Math.PI
  door.position.set(ox, 1.55, entranceZ + 0.3)
  ;[-1.6, 1.6].forEach((x) => box(0.08, 3.1, 0.12, M.alu(), ox + x, 1.55, entranceZ - 0.02, g))
  box(3.28, 0.08, 0.12, M.alu(), ox, 3.1, entranceZ - 0.02, g)

  // ceiling: plaster with a long skylight over the aisle, white beams, linear lights
  if (hall.atrium) buildAtrium(g, hall)
  else {
  ;[-1, 1].forEach((s) => {
    const cl = plane(half - 1.5, L, mat('#F6F1E8', { roughness: 0.8, side: THREE.DoubleSide }), g)
    cl.rotation.x = Math.PI / 2
    cl.position.set(ox + s * (1.5 + (half - 1.5) / 2), ceilY, zc)
    cl.userData.noCast = true
    const strip = plane(0.12, L - 2, new THREE.MeshBasicMaterial({ color: '#FFE0AE', toneMapped: false }), g)
    strip.rotation.x = Math.PI / 2
    strip.position.set(ox + s * (half - 1.2), ceilY - 0.01, zc)
  })
  const sky = plane(3, L, new THREE.MeshBasicMaterial({ map: skyTex(), fog: false }), g)
  sky.rotation.x = Math.PI / 2
  sky.position.set(ox, ceilY + 0.6, zc)
  sky.userData.noShadow = true
  for (let z = entranceZ; z >= backZ; z -= 2.4) box(3.1, 0.14, 0.1, M.white(), ox, ceilY + 0.05, z, g)
  ;[-1.5, 1.5].forEach((x) => box(0.12, 0.6, L, M.white(), ox + x, ceilY + 0.3, zc, g).userData.noCast = true)

  hall.hanging.forEach(({ z, text, sub }) => {
    const s = plane(3.2, 0.69, basic(hangTex(hall, text, sub)), g)
    s.position.set(ox, 3.75, z)
    ;[-1.4, 1.4].forEach((x) => box(0.01, ceilY - 4.1, 0.01, M.alu(), ox + x, (ceilY + 4.1) / 2, z, g))
  })
  }

  ;[-1, 1].forEach((s) => box(0.05, 0.56, L - 0.4, mat('#C8AE88', { roughness: 0.5 }), ox + s * (half - 0.025), 2.93, zc, g).userData.noCast = true)

  // fixtures and products
  const insts: Inst[] = []
  const R = rng(91 + hall.ox)
  hall.runs.forEach((run) => {
    const zEnd = runEnd(run)
    const len = run.z0 - zEnd
    const sw = Math.min(len - 0.3, 3.6)
    const ws = plane(sw, sw / 8, basic(wallSignTex(hall, run.sign)), g)
    ws.rotation.y = run.side < 0 ? Math.PI / 2 : -Math.PI / 2
    ws.position.set(ox + run.side * (half - 0.05), 2.93, (run.z0 + zEnd) / 2)
    run.products.forEach((id, i) => {
      const p = PRODUCT_BY_ID[id]
      const pl = PLACE[id]
      const bay = new THREE.Group()
      bay.position.set(ox + run.side * (half - hall.depth / 2), 0, pl.z)
      bay.rotation.y = run.side < 0 ? Math.PI / 2 : -Math.PI / 2
      g.add(bay)
      bay.updateMatrix()
      const c: Ctx = { hall, insts, R, frame: bay.matrix.clone() }
      const ph = SECTION_PHOTOS[`${hall.id}/${run.section}`]
      if (ph) { photoBay(bay, p, ph, run, c); return }
      switch (run.fixture) {
        case 'crates': crateBay(bay, p, run, c, run.section === 'vegetables'); break
        case 'chiller': chillerBay(bay, p, run, c, i === run.products.length - 1); break
        case 'bakery': bakeryBay(bay, p, run, c); break
        case 'vanity': vanityBay(bay, p, run, c); break
        case 'counter': counterBay(bay, p, run, c); break
        case 'tech': techBay(bay, p, run, c); break
        case 'tvwall': tvBay(bay, p, run, c); break
        case 'rail': railBay(bay, p, run, c); break
        case 'folded': foldedBay(bay, p, run, c); break
        case 'shoewall': shoeBay(bay, p, run, c); break
        case 'home': homeBay(bay, p, run, c); break
        default: gondolaBay(bay, p, run, c)
      }
    })
  })

  // campaign posters on the bare wall between the last fixture and the back wall
  ;([-1, 1] as const).forEach((s) => {
    const src = WALL_ADS[hall.id]?.[s]
    const runs = hall.runs.filter((r) => r.side === s)
    if (!src || !runs.length) return
    const end = Math.min(...runs.map(runEnd)), gap = end - backZ
    const w = Math.min(2.0, gap - 0.7), h = w * 1.5
    if (w < 1.2) return
    const z = (end + backZ) / 2, y = 0.3 + h / 2
    box(0.04, h + 0.1, w + 0.1, mat('#C8AE88', { roughness: 0.5 }), ox + s * (half - 0.07), y, z, g)
    const p = plane(w, h, photoMat(src), g)
    p.rotation.y = -s * Math.PI / 2
    p.position.set(ox + s * (half - 0.095), y, z)
  })

  if (hall.atrium) {
    const c: Ctx = { hall, insts, R, frame: new THREE.Matrix4() }
    produceIsland(g, c, -6, ['apple', 'orange', 'tomato', 'capsicum'], '/ads/fresho-fruit.jpg')
    produceIsland(g, c, -13, ['banana', 'pomegranate', 'carrot', 'onion'], '/ads/fresho-veg.jpg')
    produceIsland(g, c, -22, ['potato', 'broccoli', 'apple', 'tomato'], '/ads/tata-tea.jpg')
  }

  // a small double-sided digital display hanging where the first section meets the next
  const ids = IN_STORE[hall.id]
  if (ids?.length) {
    const z = (hall.hanging[1]?.z ?? hall.hanging[0].z - 4.5) + (hall.hanging[1] ? 2.6 : 0)
    const d = new THREE.Group()
    d.position.set(ox + 1.6, 3.05, z)
    g.add(d)
    box(1.24, 0.68, 0.06, M.white(), 0, 0, 0, d)
    ;[-0.45, 0.45].forEach((x) => box(0.012, ceilY - 3.39, 0.012, M.alu(), x, (ceilY - 3.05) / 2 + 0.17, 0, d))
    const faces = [0, Math.PI].map((ry) => {
      const s = plane(1.16, 0.6, basic(adTex(AD_BY_ID[ids[0]], 580, 300)), d)
      s.rotation.y = ry
      s.position.z = ry ? -0.032 : 0.032
      return s
    })
    registerScreen(faces, ids, [580, 300], 2)
  }

  // a small promotional display at the end of the aisle: products plus one ad board
  if (hall.promo) {
    const promo = new THREE.Group()
    const pz = hall.backZ + 2.2
    promo.position.set(ox, 0, pz)
    g.add(promo)
    box(1.6, 0.7, 0.8, M.oak(), 0, 0.35, 0, promo)
    box(1.2, 0.35, 0.6, M.oak(), 0, 0.875, -0.05, promo)
    const frame = new THREE.Matrix4().makeTranslation(ox, 0, pz)
    const [a, b] = hall.promo.products.map((id) => PRODUCT_BY_ID[id])
    fillShelf(insts, a, 1.5, 0.7, [0.22], 1, frame, R, fitScale(a, 0.32, 1.5), 0.05)
    fillShelf(insts, b, 1.1, 1.05, [0.12], 1, frame, R, fitScale(b, 0.32, 1.5), 0.05)
    const ad = AD_BY_ID[hall.promo.adId]
    const board = new THREE.Group()
    board.position.set(0, 1.85, -0.3)
    promo.add(board)
    box(1.0, 1.0, 0.04, M.white(), 0, 0, 0, board)
    box(0.04, 0.8, 0.04, M.alu(), 0, -0.85, -0.02, board)
    const adp = plane(0.94, 0.94, basic(adTex(ad, 300, 300)), board)
    adp.position.z = 0.025
    adp.userData.adId = ad.id
    addCircle({ x: ox, z: pz, r: 1.0 }, hall.id)
  }

  // instanced product displays: one draw per product part
  // Stock is grouped into blocks along the hall, so blocks outside the view are skipped.
  const col = new THREE.Color()
  for (const inst of insts) {
    const blocks = new Map<string, number[]>()
    inst.mats.forEach((m, i) => {
      const e = m.elements, k = `${Math.sign(Math.round(e[12] - ox))}|${Math.floor(e[14] / STOCK_BLOCK)}`
      const b = blocks.get(k)
      if (b) b.push(i); else blocks.set(k, [i])
    })
    const perUnit = inst.owners.length === inst.mats.length
    for (const idx of blocks.values()) {
      const tints = isProduce(inst.p) ? idx.map(() => 0.84 + R() * 0.2) : null
      const cohort: THREE.InstancedMesh[] = []
      for (const part of productParts(inst.p)) {
        const im = new THREE.InstancedMesh(part.geo, part.mat, idx.length)
        idx.forEach((source, i) => im.setMatrixAt(i, inst.mats[source]))
        tints?.forEach((l, i) => im.setColorAt(i, col.setRGB(l * (0.97 + (i % 5) * 0.012), l, l * (0.94 + (i % 7) * 0.012))))
        // background packs open the product of the bay they sit in
        im.userData.productId = (perUnit ? inst.owners[idx[0]] : inst.owners[0]) ?? inst.p.id
        if (perUnit) im.userData.owners = idx.map((source) => inst.owners[source])
        im.computeBoundingSphere()
        stock.push(im)
        cohort.push(im)
        g.add(im)
      }
      registerStock(hall.id, ox, cohort, idx.map((source) => inst.mats[source]), idx.map((source) => (perUnit ? inst.owners[source] : inst.owners[0]) ?? inst.p.id))
    }
  }

  enableShadows(g)
  // Products receive shadows from the fixtures, but only large ones (TVs, bedding, bags) cast their own:
  // hundreds of small packs in the shadow pass roughly doubled the triangle count for no visible gain.
  g.traverse((o) => {
    const im = o as THREE.InstancedMesh
    if (!im.isInstancedMesh || im.userData.noShadow) return
    im.receiveShadow = true
    im.geometry.computeBoundingBox()
    const size = im.geometry.boundingBox!.getSize(new THREE.Vector3())
    im.castShadow = Math.max(size.x, size.y, size.z) >= 0.3
  })
  mergeStatic(g)
  return g
}

/** One walk-in store. Tapping a product opens its preview; tapping the promo board opens the ad. */
export function StoreInterior({ id }: { id: string }) {
  const group = useMemo(() => buildHall(HALLS[id]), [id])
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return
    const t = findTag(e.object)
    if (!t) return
    e.stopPropagation()
    if (t.adId) useMall.getState().open({ kind: 'ad', id: t.adId as string })
    else if (t.productId) {
      const owners = t.owners as string[] | undefined
      const id = (e.instanceId != null && owners?.[e.instanceId]) || (t.productId as string)
      useMall.getState().showPreview(id, [e.point.x, e.point.y, e.point.z])
    }
  }
  return <primitive object={group} onClick={onClick} />
}
