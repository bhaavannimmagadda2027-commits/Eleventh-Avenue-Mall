import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { addCircle } from '../../data/layout'
import { HALLS, PLACE, runEnd, type Hall, type SectionRun } from '../../data/storeLayout'
import { PRODUCT_BY_ID, isProduce, type Product } from '../../data/products'
import { AD_BY_ID, IN_STORE } from '../../data/advertisements'
import { registerScreen } from '../../lib/adRotation'
import { useMall } from '../../state/useMall'
import { adTex, canvasTex, floorTex, inlayTex, rng, skyTex } from '../../lib/textures'
import { productParts, tagTex, unitSize } from '../../lib/productArt'
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
    g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h)
    g.fillStyle = hall.theme.accent; g.fillRect(0, h - 10, w, 10)
    g.fillStyle = hall.theme.signInk; g.textAlign = 'center'; g.textBaseline = 'middle'
    let s = 62; g.font = F(600, s)
    while (g.measureText(text).width > w * 0.9 && s > 30) { s -= 2; g.font = F(600, s) }
    g.fillText(text, w / 2, h / 2 - 2)
  })

const hangTex = (hall: Hall, text: string, sub: string) =>
  canvasTex(`hang-${hall.id}-${text}`, 1024, 220, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h)
    g.fillStyle = hall.theme.accent; g.fillRect(0, 0, 14, h)
    g.fillStyle = '#262626'; g.textBaseline = 'middle'
    let s = 78; g.font = F(600, s)
    while (g.measureText(text).width > w - 90 && s > 40) { s -= 2; g.font = F(600, s) }
    g.fillText(text, 60, h * 0.4)
    g.fillStyle = '#777873'; g.font = F(400, 36); g.fillText(sub, 62, h * 0.76)
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

const mirrorTex = () =>
  canvasTex('mirror', 256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#F4F7F8'); gr.addColorStop(0.45, '#DCE4E6'); gr.addColorStop(0.5, '#F7FAFA'); gr.addColorStop(1, '#D3DBDD')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
  })

/* ---------- fixtures (built in bay-local space: x along the bay, +z toward the aisle) ---------- */

type Inst = { p: Product; mats: THREE.Matrix4[] }
type Ctx = { hall: Hall; insts: Inst[]; R: () => number; frame: THREE.Matrix4 }

function instOf(insts: Inst[], p: Product) {
  let inst = insts.find((i) => i.p === p)
  if (!inst) insts.push((inst = { p, mats: [] }))
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
    }
}

function tag(bay: THREE.Group, p: Product, x: number, y: number, z: number, tilt = 0) {
  const t = plane(0.26, 0.105, tagMat(p), bay)
  t.position.set(x, y, z)
  t.rotation.x = tilt
  return t
}

const fitScale = (p: Product, room: number, max = 1.3) => Math.min(max, room / unitSize(p)[1])

function gondolaBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.2, 0.04, mat('#F4F2EE', { roughness: 0.7 }), 0, 1.1, -D / 2 + 0.02, bay)
  box(W, 0.12, D, mat('#E7E3DB'), 0, 0.06, 0, bay)
  box(0.04, 2.25, D, M.oak(), -W / 2, 1.125, 0, bay)
  box(W, 0.1, D * 0.3, M.oak(), 0, 2.27, -D / 2 + 0.15, bay)
  const levels = run.fixture === 'bulk' ? [0.14, 0.66, 1.18] : [0.36, 0.82, 1.28, 1.74]
  levels.forEach((y, k) => {
    if (y > 0.2) box(W - 0.02, 0.028, D - 0.12, M.white(), 0, y - 0.014, 0.03, bay)
    box(W - 0.06, 0.008, 0.012, LED, 0, y - 0.034, D / 2 - 0.05, bay)
    tag(bay, p, 0, y - 0.075, D / 2 - 0.035)
    const room = (levels[k + 1] ?? 2.2) - y - 0.06
    const big = run.fixture === 'bulk'
    // packs read a touch larger than life so labels are legible from the aisle
    fillShelf(c.insts, p, W, y, big ? [0.12] : [0.18, -0.12], k === 1 || big ? 0.95 : 0.6 + c.R() * 0.3, c.frame, c.R, fitScale(p, room))
  })
}

function chillerBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx, last: boolean) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.2, 0.04, mat('#FFFFFF', { emissive: '#F2F7FA', emissiveIntensity: 0.55, roughness: 0.6 }), 0, 1.2, -D / 2 + 0.02, bay)
  box(W, 0.3, D, mat('#E9ECEE', { roughness: 0.4 }), 0, 0.15, 0, bay)
  box(W, 0.26, D, mat('#F4F5F6', { roughness: 0.4 }), 0, 2.43, 0, bay)
  box(0.05, 2.56, D, M.alu(), -W / 2, 1.28, 0, bay)
  if (last) box(0.05, 2.56, D, M.alu(), W / 2, 1.28, 0, bay)
  ;[0.34, 0.8, 1.26, 1.72].forEach((y) => {
    box(W - 0.06, 0.02, D - 0.16, mat('#F7F9FA', { roughness: 0.2 }), 0, y - 0.01, -0.02, bay)
    tag(bay, p, 0, y - 0.05, D / 2 - 0.1)
    fillShelf(c.insts, p, W - 0.08, y, [0.12, -0.14], 0.7 + c.R() * 0.3, c.frame, c.R, fitScale(p, 0.4))
  })
  const door = plane(W - 0.06, 2.0, M.glass(), bay)
  door.position.set(0, 1.28, D / 2 - 0.01)
  door.userData.noShadow = true
  box(0.03, 2.0, 0.03, M.alu(), W / 2 - 0.1, 1.28, D / 2, bay)
}

function bakeryBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth, oak = M.oak()
  box(W, 2.0, 0.04, mat('#E8DCC6', { roughness: 0.8 }), 0, 1.0, -D / 2 + 0.02, bay)
  box(0.05, 2.0, D, oak, -W / 2, 1.0, 0, bay)
  box(W, 0.4, D, oak, 0, 0.2, 0, bay)
  ;[0.46, 0.98, 1.46].forEach((y, k) => {
    const shelf = new THREE.Group()
    shelf.position.set(0, y, 0.02)
    shelf.rotation.x = 0.14
    bay.add(shelf)
    box(W - 0.04, 0.03, D - 0.14, oak, 0, 0, 0, shelf)
    box(W - 0.04, 0.07, 0.025, oak, 0, 0.035, (D - 0.14) / 2, shelf)
    shelf.updateMatrix()
    fillShelf(c.insts, p, W, 0.015, [0.13, -0.15], k === 1 ? 0.9 : 0.65, c.frame.clone().multiply(shelf.matrix), c.R, 1.15)
    tag(bay, p, 0, y - 0.04, D / 2 - 0.05)
  })
}

function crateBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx, camera: boolean) {
  const W = run.bay, D = c.hall.depth, R = c.R
  const wood = mat('#BFA06E', { roughness: 0.85 }), dark = mat('#A6885A', { roughness: 0.85 })
  box(W - 0.04, 0.5, D * 0.9, mat('#D9C5A5', { roughness: 0.7 }), 0, 0.25, -0.02, bay)
  ;[[0.62, 0.2], [1.06, -0.2]].forEach(([y, z]) => {
    const crate = new THREE.Group()
    crate.position.set(0, y, z)
    crate.rotation.x = 0.3
    bay.add(crate)
    const cw = W - 0.1, cd = 0.48
    box(cw, 0.03, cd, wood, 0, 0, 0, crate)
    box(cw, 0.13, 0.025, dark, 0, 0.06, cd / 2, crate)
    box(cw, 0.13, 0.025, dark, 0, 0.06, -cd / 2, crate)
    box(0.025, 0.13, cd, dark, -cw / 2, 0.06, 0, crate)
    box(0.025, 0.13, cd, dark, cw / 2, 0.06, 0, crate)
    const t = plane(0.3, 0.12, tagMat(p), crate)
    t.position.set(0, 0.07, cd / 2 + 0.016)
    crate.updateMatrix()
    const frame = c.frame.clone().multiply(crate.matrix)
    const [uw, uh, ud] = unitSize(p)
    const nx = Math.max(1, Math.floor((cw - 0.04) / (uw * 1.02))), nz = Math.max(1, Math.floor((cd - 0.04) / (ud * 1.02)))
    const inst = instOf(c.insts, p)
    for (let layer = 0; layer < 2; layer++)
      for (let ix = 0; ix < nx; ix++)
        for (let iz = 0; iz < nz; iz++) {
          if (layer && R() < 0.45) continue
          const x = -cw / 2 + 0.02 + uw * 0.51 + ix * uw * 1.02 + (R() - 0.5) * uw * 0.1 + (layer ? uw * 0.5 : 0)
          const zz = -cd / 2 + 0.02 + ud * 0.51 + iz * ud * 1.02 + (R() - 0.5) * ud * 0.1
          if (Math.abs(x) > cw / 2 - uw * 0.4) continue
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 0.4, R() * 6.28, (R() - 0.5) * 0.4))
          const sc = 0.92 + R() * 0.16
          inst.mats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0.015 + layer * uh * 0.75, zz), q, new THREE.Vector3(sc, sc, sc)).premultiply(frame))
        }
  })
  if (camera) {
    // the dark-store camera concept, made physical: a small overhead camera above each tray
    box(0.04, 0.04, 0.55, M.white(), 0, 2.35, -0.05, bay)
    const cam = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.white())
    cam.rotation.x = Math.PI
    cam.position.set(0, 2.33, 0.24)
    bay.add(cam)
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 10), REC)
    dot.position.set(0.04, 2.36, 0.3)
    bay.add(dot)
  }
}

/** Beauty: light oak shelving, a softly backlit panel, glass shelves and a round mirror. */
function vanityBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.3, 0.04, mat('#FBF5EF', { emissive: '#F7E9DE', emissiveIntensity: 0.5, roughness: 0.7 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(0.05, 2.35, D * 0.75, M.oak(), -W / 2, 1.175, -D * 0.12, bay)
  box(W, 0.45, D * 0.8, mat('#EFE6DA', { roughness: 0.6 }), 0, 0.225, -D * 0.1, bay)
  box(W, 0.04, D * 0.8, M.oak(), 0, 0.47, -D * 0.1, bay)
  const levels = [0.5, 0.92, 1.3]
  levels.forEach((y, k) => {
    if (k) box(W - 0.1, 0.014, D * 0.55, mat('#F2F6F7', { roughness: 0.1, metalness: 0.1 }), 0, y - 0.007, -D * 0.12, bay)
    box(W - 0.14, 0.006, 0.01, LED, 0, y - 0.02, D * 0.15, bay)
    tag(bay, p, 0, y - 0.045, D * 0.17)
    fillShelf(c.insts, p, W - 0.1, y, [0.08, -0.12], k === 0 ? 0.9 : 0.7, c.frame, c.R, fitScale(p, 0.34, 1.6), 0.03)
  })
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.26, 40), new THREE.MeshBasicMaterial({ map: mirrorTex() }))
  mirror.position.set(0, 1.9, -D / 2 + 0.05)
  bay.add(mirror)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.012, 8, 48), mat('#C9A76B', { roughness: 0.3, metalness: 0.6 }))
  ring.position.copy(mirror.position)
  bay.add(ring)
}

/** Fragrance: a cream counter with bottles grouped on top and a framed panel behind. */
function counterBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W - 0.1, 0.95, 0.62, mat('#F1E9DF', { roughness: 0.5 }), 0, 0.475, 0.02, bay)
  box(W - 0.06, 0.03, 0.66, M.oak(), 0, 0.965, 0.02, bay)
  box(W - 0.3, 1.2, 0.04, mat('#FBF6F1', { emissive: '#F6E7DF', emissiveIntensity: 0.6 }), 0, 1.75, -D / 2 + 0.03, bay)
  box(W - 0.26, 0.03, 0.05, M.oak(), 0, 2.36, -D / 2 + 0.04, bay)
  box(W - 0.26, 0.03, 0.05, M.oak(), 0, 1.14, -D / 2 + 0.04, bay)
  box(W - 0.5, 0.014, 0.24, mat('#F2F6F7', { roughness: 0.1, metalness: 0.1 }), 0, 1.593, -D / 2 + 0.16, bay)
  box(W - 0.54, 0.006, 0.01, LED, 0, 1.58, -D / 2 + 0.275, bay)
  tag(bay, p, 0, 0.9, 0.34)
  fillShelf(c.insts, p, W - 0.4, 0.98, [0.16, -0.04], 0.8, c.frame, c.R, fitScale(p, 0.28, 1.7), 0.06)
  fillShelf(c.insts, p, 0.6, 1.6, [-D / 2 + 0.2], 1, c.frame, c.R, 1.4, 0.04)
}

/** Electronics: a white demo table with products laid out, a shelf above and a cool backlit panel. */
function techBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W - 0.08, 0.86, 0.66, mat('#FAFAF9', { roughness: 0.35 }), 0, 0.43, 0.05, bay)
  box(W - 0.06, 0.03, 0.7, mat('#C9CBCE', { roughness: 0.3, metalness: 0.6 }), 0, 0.875, 0.05, bay)
  box(W, 2.3, 0.04, mat('#F2F5F7', { emissive: '#E6EEF4', emissiveIntensity: 0.5, roughness: 0.6 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(W - 0.1, 0.02, 0.28, M.white(), 0, 1.45, -D / 2 + 0.16, bay)
  box(W - 0.14, 0.006, 0.01, LED, 0, 1.43, -D / 2 + 0.29, bay)
  tag(bay, p, 0, 0.82, 0.39)
  tag(bay, p, 0, 1.4, -D / 2 + 0.305)
  const [w] = unitSize(p)
  const sc = Math.min(1.4, 0.34 / Math.max(w, 0.1))
  fillShelf(c.insts, p, W - 0.1, 0.89, [0.12], w > 0.25 ? 0.5 : 0.75, c.frame, c.R, Math.max(1, sc), 0.12)
  fillShelf(c.insts, p, W - 0.1, 1.46, [-D / 2 + 0.16], w > 0.25 ? 0.5 : 0.8, c.frame, c.R, Math.min(1.2, fitScale(p, 0.45, 1.2)), 0.08)
}

/** TV wall: a large set mounted on a dark panel above a low media console. */
function tvBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.4, 0.05, mat('#3A3D42', { roughness: 0.6 }), 0, 1.3, -D / 2 + 0.03, bay)
  box(W - 0.3, 0.4, 0.42, mat('#E9E5DE', { roughness: 0.5 }), 0, 0.2, -D / 2 + 0.27, bay)
  box(W - 0.28, 0.025, 0.44, M.oak(), 0, 0.41, -D / 2 + 0.27, bay)
  tag(bay, p, 0, 0.32, -D / 2 + 0.49)
  const inst = instOf(c.insts, p)
  inst.mats.push(new THREE.Matrix4().compose(new THREE.Vector3(0, 0.95, -D / 2 + 0.09), new THREE.Quaternion(), new THREE.Vector3(1.4, 1.4, 1)).premultiply(c.frame))
}

/** Kidswear: face-out arms on a pastel panel, garments hanging one behind another. */
function railBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.3, 0.04, mat('#F6EEE2', { roughness: 0.8 }), 0, 1.15, -D / 2 + 0.02, bay)
  box(0.05, 2.35, 0.08, M.oak(), -W / 2, 1.175, -D / 2 + 0.06, bay)
  const [, h] = unitSize(p)
  const inst = instOf(c.insts, p)
  ;[[-0.3, 2.05], [0.3, 2.05], [0, 1.05]].forEach(([x, armY], k) => {
    if (k === 2 && h > 0.5) return
    box(0.02, 0.02, D * 0.75, M.alu(), x, armY, -D * 0.1, bay)
    for (let i = 0; i < 4; i++) {
      const z = 0.22 - i * 0.12
      const y = armY - h - 0.03
      inst.mats.push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (c.R() - 0.5) * 0.08, 0)), new THREE.Vector3(1, 1, 1)).premultiply(c.frame))
    }
  })
  tag(bay, p, 0, 0.62, -D / 2 + 0.06)
}

/** Folded goods and accessories on a pale oak table with a shelf behind. */
function foldedBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W - 0.1, 0.72, 0.62, M.oak(), 0, 0.36, 0.06, bay)
  box(W, 1.9, 0.04, mat('#F4EEE4', { roughness: 0.8 }), 0, 0.95, -D / 2 + 0.02, bay)
  box(W - 0.1, 0.03, 0.26, M.oak(), 0, 1.35, -D / 2 + 0.15, bay)
  tag(bay, p, 0, 0.66, 0.38)
  const [, h] = unitSize(p)
  const stack = p.shape === 'folded' ? 4 : 1
  for (let k = 0; k < stack; k++) fillShelf(c.insts, p, W - 0.2, 0.72 + k * h * 1.02, [0.16], 0.75, c.frame, c.R, 1, 0.06)
  fillShelf(c.insts, p, W - 0.1, 1.365, [-D / 2 + 0.15], 0.8, c.frame, c.R, fitScale(p, 0.5, 1), 0.05)
}

/** Shoes: angled shelves on a wall, pairs facing the aisle. */
function shoeBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.2, 0.04, mat('#F6EEE2', { roughness: 0.8 }), 0, 1.1, -D / 2 + 0.02, bay)
  box(0.05, 2.25, D * 0.6, M.oak(), -W / 2, 1.125, -D * 0.2, bay)
  ;[0.4, 0.8, 1.2, 1.6].forEach((y) => {
    const shelf = new THREE.Group()
    shelf.position.set(0, y, -D * 0.18)
    shelf.rotation.x = 0.22
    bay.add(shelf)
    box(W - 0.06, 0.02, D * 0.5, M.white(), 0, 0, 0, shelf)
    shelf.updateMatrix()
    fillShelf(c.insts, p, W - 0.06, 0.01, [0], 0.8, c.frame.clone().multiply(shelf.matrix), c.R, 1.25, 0.08)
    tag(bay, p, 0, y - 0.03, -D * 0.18 + D * 0.26, 0)
  })
}

/** Home: an oak open shelf unit, linen back panel, products grouped with breathing room. */
function homeBay(bay: THREE.Group, p: Product, run: SectionRun, c: Ctx) {
  const W = run.bay, D = c.hall.depth
  box(W, 2.2, 0.04, mat('#EEE6D8', { roughness: 0.95 }), 0, 1.1, -D / 2 + 0.02, bay)
  box(0.05, 2.25, D * 0.8, M.wood(), -W / 2, 1.125, -D * 0.1, bay)
  const levels = [0.08, 0.66, 1.24, 1.82]
  levels.forEach((y, k) => {
    box(W - 0.04, 0.04, D * 0.75, M.oak(), 0, y - 0.02, -D * 0.1, bay)
    if (k === 3) return
    tag(bay, p, 0, y - 0.05, D * 0.28)
    const room = levels[k + 1] - y - 0.06
    fillShelf(c.insts, p, W - 0.14, y, [0.04], k === 1 ? 0.8 : 0.55, c.frame, c.R, fitScale(p, room, 1.1), 0.08)
  })
}

/* ---------- the hall ---------- */

function buildHall(hall: Hall) {
  const g = new THREE.Group()
  const { ox, half, entranceZ, backZ, ceilY, theme } = hall
  const L = entranceZ - backZ, zc = (entranceZ + backZ) / 2

  const floor = plane(half * 2, L, new THREE.MeshStandardMaterial({ map: floorTex([(half * 2) / 2.4, L / 2.4]), color: theme.floor, roughness: 0.24 }), g)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(ox, 0, zc)
  floor.userData.noCast = true
  const runner = plane(1.6, L, new THREE.MeshStandardMaterial({ map: inlayTex([1, L / 1.6]), roughness: 0.3 }), g)
  runner.rotation.x = -Math.PI / 2
  runner.position.set(ox, 0.004, zc)
  runner.userData.noCast = true

  // walls catch soft bounced daylight so the store never reads as gloomy
  const plaster = mat(theme.wall, { roughness: 0.9, emissive: theme.wallGlow, emissiveIntensity: 0.45 })
  ;[-1, 1].forEach((s) => {
    const w = plane(L, ceilY, plaster, g)
    w.rotation.y = -s * Math.PI / 2
    w.position.set(ox + s * half, ceilY / 2, zc)
    w.userData.noCast = true
    box(0.02, 0.06, L, mat(theme.accent), ox + s * (half - 0.01), 3.2, zc, g).userData.noCast = true
  })
  const back = plane(half * 2, ceilY, basic(backWallTex(hall)), g)
  back.position.set(ox, ceilY / 2, backZ)
  ;[-1, 1].forEach((s) => {
    const w = plane(half - 1.6, ceilY, plaster, g)
    w.rotation.y = Math.PI
    w.position.set(ox + s * (1.6 + (half - 1.6) / 2), ceilY / 2, entranceZ)
    w.userData.noCast = true
  })
  const lintel = plane(3.2, ceilY - 3.1, plaster, g)
  lintel.rotation.y = Math.PI
  lintel.position.set(ox, 3.1 + (ceilY - 3.1) / 2, entranceZ)
  lintel.userData.noCast = true
  const door = plane(3.2, 3.1, basic(doorwayTex()), g)
  door.rotation.y = Math.PI
  door.position.set(ox, 1.55, entranceZ + 0.3)
  ;[-1.6, 1.6].forEach((x) => box(0.08, 3.1, 0.12, M.alu(), ox + x, 1.55, entranceZ - 0.02, g))
  box(3.28, 0.08, 0.12, M.alu(), ox, 3.1, entranceZ - 0.02, g)

  // ceiling: plaster with a long skylight over the aisle, white beams, linear lights
  ;[-1, 1].forEach((s) => {
    const cl = plane(half - 1.5, L, mat('#FAF8F3', { roughness: 1, side: THREE.DoubleSide }), g)
    cl.rotation.x = Math.PI / 2
    cl.position.set(ox + s * (1.5 + (half - 1.5) / 2), ceilY, zc)
    cl.userData.noCast = true
    const strip = plane(0.12, L - 2, new THREE.MeshBasicMaterial({ color: '#FFFBF2' }), g)
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

  // fixtures and products
  const insts: Inst[] = []
  const R = rng(91 + hall.ox)
  hall.runs.forEach((run) => {
    const zEnd = runEnd(run)
    const len = run.z0 - zEnd
    const sw = Math.min(len - 0.3, 3.6)
    const ws = plane(sw, sw / 8, basic(wallSignTex(hall, run.sign)), g)
    ws.rotation.y = run.side < 0 ? Math.PI / 2 : -Math.PI / 2
    ws.position.set(ox + run.side * (half - 0.02), 2.78, (run.z0 + zEnd) / 2)
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
      im.userData.productId = inst.p.id
      im.frustumCulled = false
      g.add(im)
    }
  }

  enableShadows(g)
  // Products receive shadows from the fixtures, but only large ones (TVs, bedding, bags) cast their own:
  // hundreds of small packs in the shadow pass roughly doubled the triangle count for no visible gain.
  g.traverse((o) => {
    const im = o as THREE.InstancedMesh
    if (!im.isInstancedMesh) return
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
    else if (t.productId) useMall.getState().showPreview(t.productId as string, [e.point.x, e.point.y, e.point.z])
  }
  return <primitive object={group} onClick={onClick} />
}
