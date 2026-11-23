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
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { onQuality, quality } from '../../lib/quality'
import { M, basic, box, enableShadows, findTag, mat, mergeStatic, plane } from '../mall/build'
import { font } from '../../styles/tokens'

const F = (w: number, px: number) => `${w} ${px}px ${font.family}`
const tagMats = new Map<string, THREE.MeshBasicMaterial>()
const tagMat = (p: Product) => tagMats.get(p.id) ?? tagMats.set(p.id, new THREE.MeshBasicMaterial({ map: tagTex(p) })).get(p.id)!
const REC = new THREE.MeshBasicMaterial({ color: '#E5484D', toneMapped: false })
const LED = new THREE.MeshBasicMaterial({ color: '#FFF6E2', toneMapped: false })

/* ---------- signage ---------- */

const wallSignTex = (hall: Hall, text: string) =>
  canvasTex(`wsign-${hall.id}-${text}`, 1024, 128, (g, w, h) => {
    g.fillStyle = '#1D1E1B'; g.fillRect(0, 0, w, h)
    g.fillStyle = hall.theme.accent; g.fillRect(0, h - 8, w, 8)
    g.fillStyle = '#FBF8F1'; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = 66; g.font = F(700, s)
    while (g.measureText(text).width > w * 0.9 && s > 30) { s -= 2; g.font = F(600, s) }
    g.fillText(text, w / 2, h / 2 - 2)
  })

const hangTex = (hall: Hall, text: string, sub: string) =>
  canvasTex(`hang-${hall.id}-${text}`, 1024, 220, (g, w, h) => {
    g.fillStyle = '#1D1E1B'; g.fillRect(0, 0, w, h)
    g.fillStyle = hall.theme.accent; g.fillRect(0, 0, 14, h)
    g.fillStyle = '#FBF8F1'; g.textBaseline = 'middle'
    let s = 78; g.font = F(600, s)
    while (g.measureText(text).width > w - 90 && s > 40) { s -= 2; g.font = F(600, s) }
    g.fillText(text, 60, h * 0.4)
    g.fillStyle = '#B9B6AE'; g.font = F(400, 36); g.fillText(sub, 62, h * 0.76)
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
type MixOpts = { frame?: THREE.Matrix4; max?: number; gap?: number; rows?: number; tags?: boolean; block?: [number, number] }

function fillMixed(c: Ctx, bay: THREE.Group, pool: Product[], owner: string, W: number, y: number, room: number, front: number, tagY: number, o: MixOpts = {}) {
  const { frame = c.frame, max = 1.08, gap = 0.005, tags = true, block = [2, 5] } = o
  const fits = pool.filter((q) => (room - 0.02) / unitSize(q)[1] >= 0.62)
  if (!fits.length) return
  const end = W / 2 - 0.03
  let x = -W / 2 + 0.03
  let last = -1
  while (x < end - 0.06) {
    let k = Math.floor(c.R() * fits.length)
    if (k === last && fits.length > 1) k = (k + 1) % fits.length
    last = k
    const q = fits[k]
    const [w, h, d] = unitSize(q)
    const s = Math.min(max, (room - 0.02) / h)
    const step = w * s + gap
    const n = Math.min(Math.floor((end - x) / step), block[0] + Math.floor(c.R() * (block[1] - block[0] + 1)))
    if (n < 1) break
    const folded = q.shape === 'folded'
    const stackable = (['box', 'jar', 'tub', 'tetra', 'block'].includes(q.shape) && h * s < 0.17) || folded
    const tiers = stackable ? Math.max(1, Math.min(folded ? 6 : 3, Math.floor((room - 0.02) / (h * s)))) : 1
    const rows = o.rows ?? (d * s < 0.085 ? 3 : 2)
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
      t.position.set(Math.max(-W / 2 + 0.09, Math.min(W / 2 - 0.09, x + (n * step) / 2)), tagY, front + 0.032)
    }
    x += n * step + Math.max(0.008, gap)
  }
}

/** Flat packs (butter, paneer, biscuits) are stacked so a shelf never shows more air than stock. */
const stacks = (p: Product, s: number, room: number) =>
  ['box', 'block', 'eggs', 'tub', 'jar', 'tetra'].includes(p.shape) ? Math.max(1, Math.min(4, Math.floor((room - 0.02) / (unitSize(p)[1] * s)))) : 1

const SHELF_EDGE = () => mat('#F7F6F2', { roughness: 0.4 })
const GONDOLA_BACK = () => mat('#2E2F2B', { roughness: 0.7 })
const GONDOLA_METAL = () => mat('#3A3B37', { roughness: 0.45, metalness: 0.5 })

/** Grocery shelving: a dark back panel, six shelves, the featured product at eye level and packs everywhere else. */
function gondolaBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  const bulk = run.fixture === 'bulk'
  const top = 2.45
  box(W, top, 0.04, GONDOLA_BACK(), 0, top / 2, -D / 2 + 0.02, bay)
  box(W, 0.12, D, GONDOLA_METAL(), 0, 0.06, 0, bay)
  box(0.035, top + 0.04, D - 0.06, GONDOLA_METAL(), -W / 2, (top + 0.04) / 2, -0.03, bay)
  box(W, 0.18, 0.05, GONDOLA_METAL(), 0, top + 0.09, -D / 2 + 0.12, bay)
  box(W - 0.06, 0.008, 0.02, LED, 0, top - 0.01, -D / 2 + 0.16, bay)
  const levels = bulk ? [0.12, 0.64, 1.16, 1.68] : [0.12, 0.5, 0.88, 1.26, 1.64, 2.02]
  const hero = bulk ? [1, 2] : [2, 3]
  const pool = fillerFor(run.section)
  const front = D / 2 - 0.06
  levels.forEach((y, k) => {
    const room = Math.min(bulk ? 0.5 : 0.4, (levels[k + 1] ?? top) - y - 0.04)
    if (y > 0.2) box(W - 0.02, 0.022, D - 0.1, M.white(), 0, y - 0.011, -0.01, bay)
    box(W - 0.02, 0.05, 0.014, SHELF_EDGE(), 0, y - 0.03, front + 0.03, bay)
    if (y > 0.2) box(W - 0.06, 0.006, 0.01, LED, 0, y - 0.026, front - 0.02, bay)
    if (hero.includes(k) || !pool.length) {
      tag(bay, p, 0, y - 0.03, front + 0.04)
      const s = fitScale(p, room - 0.02)
      const [w, , d] = unitSize(p)
      const rows = d * s < 0.09 ? [0, 1, 2] : [0, 1]
      for (let t = 0; t < stacks(p, s, room); t++)
        fillShelf(c.insts, p, W - 0.04, y + t * unitSize(p)[1] * s, rows.map((r) => front - (d * s) / 2 - r * d * s * 1.03), 1, c.frame, c.R, s, Math.max(0.004, 0.02 - w * 0.05))
    } else fillMixed(c, bay, pool, p.id, W, y, room, front, y - 0.03)
  })
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
        fillShelf(c.insts, p, W - 0.1, y + t * unitSize(p)[1] * s, [front - d / 2, front - d * 1.53, front - d * 2.56], 1, c.frame, c.R, s, 0.006)
    } else fillMixed(c, bay, pool, p.id, W - 0.06, y, room, front, y - 0.02)
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

/** Produce: three tiers of wooden crates on a stepped stand, each heaped into a low mound. */
function crateBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx, camera: boolean) {
  const W = run.bay, D = c.hall.depth, R = c.R
  const wood = mat('#B08F5E', { roughness: 0.85 }), dark = mat('#94754A', { roughness: 0.85 })
  const stand = mat('#6E5537', { roughness: 0.8 })
  box(W - 0.04, 0.48, 0.36, stand, 0, 0.24, 0.26, bay)
  box(W - 0.04, 0.78, 0.3, stand, 0, 0.39, -0.04, bay)
  box(W - 0.04, 1.08, 0.3, stand, 0, 0.54, -0.3, bay)
  const wallH = c.hall.atrium ? 2.62 : 1.9
  box(W, wallH, 0.04, GONDOLA_BACK(), 0, wallH / 2, -D / 2 + 0.02, bay)
  if (c.hall.atrium) {
    // two shelves of the same produce above the crates, so the wall reads full to the sign
    ;[1.62, 2.12].forEach((y) => {
      box(W - 0.02, 0.03, 0.34, wood, 0, y - 0.015, -D / 2 + 0.2, bay)
      box(W - 0.02, 0.09, 0.02, dark, 0, y + 0.02, -D / 2 + 0.37, bay)
      // one front row is all the eye gets at this height, and produce meshes are heavy
      const s = fitScale(p, 0.36, 1.05)
      fillShelf(c.insts, p, W - 0.06, y, [-D / 2 + 0.28], 1, c.frame, c.R, s, 0.004)
    })
  }
  ;[[0.52, 0.27], [0.82, -0.02], [1.12, -0.29]].forEach(([y, z]) => {
    const crate = new THREE.Group()
    crate.position.set(0, y, z)
    crate.rotation.x = 0.26
    bay.add(crate)
    const cw = W - 0.08, cd = 0.4
    box(cw, 0.03, cd, wood, 0, 0, 0, crate)
    box(cw, 0.14, 0.025, dark, 0, 0.06, cd / 2, crate)
    box(cw, 0.14, 0.025, dark, 0, 0.06, -cd / 2, crate)
    box(0.025, 0.14, cd, dark, -cw / 2, 0.06, 0, crate)
    box(0.025, 0.14, cd, dark, cw / 2, 0.06, 0, crate)
    const t = plane(0.3, 0.12, tagMat(p), crate)
    t.position.set(0, 0.07, cd / 2 + 0.016)
    crate.updateMatrix()
    const frame = c.frame.clone().multiply(crate.matrix)
    const [uw, uh, ud] = unitSize(p)
    const pitch = 0.94
    const nx = Math.max(1, Math.floor((cw - 0.03) / (uw * pitch))), nz = Math.max(1, Math.floor((cd - 0.03) / (ud * pitch)))
    const inst = instOf(c.insts, p)
    for (let layer = 0; layer < 3; layer++)
      for (let ix = 0; ix < nx + (layer ? 0 : 1); ix++)
        for (let iz = 0; iz < nz; iz++) {
          const x = -cw / 2 + 0.015 + uw * 0.5 + ix * uw * pitch + (R() - 0.5) * uw * 0.14 + (layer % 2 ? uw * 0.47 : 0)
          const zz = -cd / 2 + 0.015 + ud * 0.5 + iz * ud * pitch + (R() - 0.5) * ud * 0.14 + (layer % 2 ? ud * 0.3 : 0)
          if (Math.abs(x) > cw / 2 - uw * 0.42 || Math.abs(zz) > cd / 2 - ud * 0.3) continue
          // heap toward the middle so each crate reads as a mound
          const edge = Math.max(Math.abs(x) / (cw / 2), Math.abs(zz) / (cd / 2))
          if (layer === 1 && (edge > 0.86 || R() < 0.12)) continue
          if (layer === 2 && (edge > 0.6 || R() < 0.3)) continue
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 0.5, R() * 6.28, (R() - 0.5) * 0.5))
          const sc = 0.9 + R() * 0.18
          inst.mats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0.015 + layer * uh * 0.72, zz), q, new THREE.Vector3(sc, sc, sc)).premultiply(frame))
        }
  })
  if (camera) {
    // the dark-store camera concept, made physical: a small overhead camera above each tray
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
  box(W, 2.4, 0.05, mat('#3A3D42', { roughness: 0.6 }), 0, 1.3, -D / 2 + 0.03, bay)
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

const bigSignTex = (text: string, w: number, h: number, size: number, accent: string) =>
  canvasTex(`big-${text}-${w}`, w, h, (g) => {
    g.fillStyle = '#12110E'; g.fillRect(0, 0, w, h)
    g.fillStyle = accent; g.fillRect(0, h - 10, w, 10)
    g.fillStyle = '#FFF9EC'; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = size; g.font = F(700, s)
    while (g.measureText(text).width > w * 0.92 && s > 24) { s -= 2; g.font = F(700, s) }
    g.fillText(text, w / 2, h / 2 - 3)
  })

const posterTex = (title: string, sub: string, bg: string, ink: string) =>
  canvasTex(`poster-${title}`, 512, 736, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.arc(w / 2, h * 0.62, 190, 0, 7); g.fill()
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = 76; g.font = F(700, s)
    while (g.measureText(title).width > w * 0.86) { s -= 2; g.font = F(700, s) }
    g.fillText(title, w / 2, h * 0.16)
    g.font = F(500, 30); g.fillText(sub, w / 2, h * 0.26)
    // a plain bottle, no label artwork
    g.fillStyle = '#F2B632'; g.fillRect(w / 2 - 70, h * 0.48, 140, 270)
    g.fillRect(w / 2 - 28, h * 0.4, 56, 70)
    g.fillStyle = '#B5301F'; g.fillRect(w / 2 - 34, h * 0.37, 68, 28)
    g.fillStyle = '#FFF6DF'; g.fillRect(w / 2 - 70, h * 0.6, 140, 96)
  })

function buildAtrium(g: THREE.Group, hall: Hall) {
  const { ox, half, entranceZ, backZ, theme } = hall
  const L = entranceZ - backZ, zc = (entranceZ + backZ) / 2
  const up = new THREE.Group()
  g.add(up)
  const outer = half + 2.2, eave = 10.4, rise = 3.2
  const stone = mat('#7A6650', { roughness: 0.6 }), dark = mat('#2B231B', { roughness: 0.6 })
  const steel = mat('#3A3A38', { roughness: 0.45, metalness: 0.5 })
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
  const endWall = mat('#55432F', { roughness: 0.75 })
  ;[backZ, entranceZ].forEach((z) => {
    const w = plane(outer * 2, eave + rise - 4.4, endWall, up)
    w.rotation.y = z === backZ ? 0 : Math.PI
    w.position.set(ox, (eave + rise + 4.4) / 2, z)
  })
  const far = plane(6.4, 1.2, basic(bigSignTex('ELECTRONICS', 1024, 192, 120, '#12A88A'), { fog: false }), up)
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
    box(len, 0.92, 0.06, mat('#12110E', { roughness: 0.5 }), 0, 0, -0.04, tilt)
    const mainPanel = plane(mainW, 0.88, basic(bigSignTex(zn.main, 1536, 192, 150, theme.accent), { fog: false, toneMapped: false }), tilt)
    // long boards start a few metres in, so the whole name is in frame from the doorway
    const inset = zn.z0 > -1 ? 2.8 : 0.05
    mainPanel.position.set(zn.s * (len / 2 - mainW / 2 - inset), 0, 0)
    const rest = len - mainW - inset - 0.15
    zn.subs.forEach((text, i) => {
      const w = rest / zn.subs.length
      const sub = plane(w - 0.2, 0.56, basic(bigSignTex(text, 768, 128, 76, '#D9A441'), { fog: false, toneMapped: false }), tilt)
      sub.position.set(zn.s * (len / 2 - mainW - inset - 0.1 - w * (i + 0.5)), 0, 0)
    })
  }

  // oil and staples posters on the open stretch of the right wall
  ;[
    { z: -26.8, tex: posterTex('Gold Winner', 'Refined sunflower oil', '#C8201C', '#FFF3D6') },
    { z: -30.4, tex: posterTex('Tata Sampann', 'Dals, spices and more', '#1F4E8C', '#FFFFFF') },
  ].forEach(({ z, tex }) => {
    const p = plane(2.5, 3.6, basic(tex, { fog: false }), up)
    p.rotation.y = -Math.PI / 2
    p.position.set(ox + half - 0.08, 1.9, z)
    box(0.05, 3.7, 2.6, dark, ox + half - 0.04, 1.9, z, up)
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
function produceIsland(g: THREE.Group, c: Ctx, z: number, ids: string[]) {
  const { ox } = c.hall
  const wood = mat('#B08F5E', { roughness: 0.85 }), darkWood = mat('#7A5F3C', { roughness: 0.85 })
  const isl = new THREE.Group()
  isl.position.set(ox, 0, z)
  g.add(isl)
  box(0.86, 0.5, 3.0, darkWood, 0, 0.25, 0, isl)
  box(0.34, 0.86, 2.9, darkWood, 0, 0.43, 0, isl)
  const crateL = 0.72, crateD = 0.42
  ;[-1, 1].forEach((side) => {
    for (let k = 0; k < 4; k++) {
      const p = PRODUCT_BY_ID[ids[(k + (side > 0 ? 2 : 0)) % ids.length]]
      const crate = new THREE.Group()
      crate.position.set(side * 0.37, 0.56, -1.11 + k * 0.74)
      crate.rotation.set(0, 0, -side * 0.24)
      isl.add(crate)
      box(crateD, 0.03, crateL, wood, 0, 0, 0, crate)
      ;[-1, 1].forEach((e) => {
        box(crateD, 0.13, 0.022, wood, 0, 0.06, (e * crateL) / 2, crate)
        box(0.022, 0.13, crateL, wood, (e * crateD) / 2, 0.06, 0, crate)
      })
      isl.updateMatrix(); crate.updateMatrix()
      const frame = new THREE.Matrix4().makeTranslation(ox, 0, z).multiply(crate.matrix)
      const [uw, uh, ud] = unitSize(p)
      for (let layer = 0; layer < 2; layer++) {
        const nx = Math.max(1, Math.floor((crateD - 0.04) / (uw * 0.94))), nz = Math.max(1, Math.floor((crateL - 0.04) / (ud * 0.94)))
        for (let ix = 0; ix < nx; ix++)
          for (let iz = 0; iz < nz; iz++) {
            if (layer && c.R() < 0.18 + layer * 0.16) continue
            const px = ((ix + 0.5) / nx - 0.5) * (crateD - 0.05) + (c.R() - 0.5) * 0.015
            const pz = ((iz + 0.5) / nz - 0.5) * (crateL - 0.05) + (c.R() - 0.5) * 0.015
            put(c, p, p.id, px, 0.016 + layer * uh * 0.72, pz, 0.9 + c.R() * 0.18, c.R() * 6.28, frame)
          }
      }
    }
  })
  addRect({ x0: ox - 0.62, x1: ox + 0.62, z0: z - 1.56, z1: z + 1.56 }, c.hall.id)
}

/* ---------- the hall ---------- */

function buildHall(hall: Hall) {
  const g = new THREE.Group()
  const { ox, half, entranceZ, backZ, ceilY, theme } = hall
  const L = entranceZ - backZ, zc = (entranceZ + backZ) / 2

  // polished stone: a mirror under a mostly opaque floor gives soft reflections of the shelves and lights
  const floorMat = new THREE.MeshStandardMaterial({ map: floorTex([(half * 2) / 2.4, L / 2.4]), color: '#B5A18A', roughness: 0.36 })
  const runnerMat = new THREE.MeshStandardMaterial({ map: inlayTex([1, L / 1.6]), color: '#A08A70', roughness: 0.38 })
  const floor = plane(half * 2, L, floorMat, g)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(ox, 0, zc)
  floor.userData.noCast = true
  const rw = Math.min(1024, Math.round(window.innerWidth * 0.6)), rh = Math.min(1024, Math.round(window.innerHeight * 0.6))
  const mirror = new Reflector(new THREE.PlaneGeometry(half * 2, L), { textureWidth: rw, textureHeight: rh, clipBias: 0.003, color: 0x8c8c8c })
  mirror.rotation.x = -Math.PI / 2
  mirror.position.set(ox, -0.003, zc)
  mirror.userData.noShadow = true
  g.add(mirror)
  const applyQuality = () => {
    const on = quality.reflections
    mirror.visible = on
    for (const [m, o] of [[floorMat, 0.76], [runnerMat, 0.86]] as const) { m.transparent = on; m.opacity = on ? o : 1; m.needsUpdate = true }
  }
  applyQuality()
  onQuality(applyQuality)
  const runner = plane(1.6, L, runnerMat, g)
  runner.rotation.x = -Math.PI / 2
  runner.position.set(ox, 0.004, zc)
  runner.userData.noCast = true

  // walls catch soft bounced daylight so the store never reads as gloomy
  const plaster = mat('#' + new THREE.Color(theme.wall).multiplyScalar(0.2).getHexString(), { roughness: 0.75 })
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
    const cl = plane(half - 1.5, L, mat('#2F261E', { roughness: 0.8, side: THREE.DoubleSide }), g)
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

  ;[-1, 1].forEach((s) => box(0.05, 0.56, L - 0.4, mat('#1D1E1B', { roughness: 0.6 }), ox + s * (half - 0.025), 2.93, zc, g).userData.noCast = true)

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

  if (hall.atrium) {
    const c: Ctx = { hall, insts, R, frame: new THREE.Matrix4() }
    produceIsland(g, c, -6, ['apple', 'orange', 'tomato', 'capsicum'])
    produceIsland(g, c, -13, ['banana', 'pomegranate', 'carrot', 'onion'])
    produceIsland(g, c, -22, ['potato', 'broccoli', 'apple', 'tomato'])
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
  for (const inst of insts) {
    for (const part of productParts(inst.p)) {
      const im = new THREE.InstancedMesh(part.geo, part.mat, inst.mats.length)
      inst.mats.forEach((m, i) => im.setMatrixAt(i, m))
      if (isProduce(inst.p)) {
        const col = new THREE.Color()
        inst.mats.forEach((_, i) => { col.setHSL(0, 0, 0.9 + R() * 0.1); im.setColorAt(i, col) })
      }
      // background packs open the product of the bay they sit in
      im.userData.productId = inst.owners[0] ?? inst.p.id
      if (inst.owners.length === inst.mats.length) im.userData.owners = inst.owners
      im.frustumCulled = false
      g.add(im)
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
