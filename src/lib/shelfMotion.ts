import { animate, utils } from 'animejs'
import * as THREE from 'three'
import { quality } from './quality'

/**
 * Aisle motion, driven by anime.js. Only front-facing packs near the cart ever move, and each frame
 * uploads just the changed range of each instance buffer, so the thousands of other packs cost nothing.
 */
type Unit = {
  ims: THREE.InstancedMesh[]
  i: number
  base: THREE.Matrix4
  x: number
  y: number
  z: number
  id: string
  lift: number
  scale: number
  yaw: number
  token: number
}
type Cohort = { ims: THREE.InstancedMesh[]; mats: THREE.Matrix4[]; ids: string[] }
type Stock = { ox: number; cohorts: Cohort[]; units?: Unit[]; bins?: Map<string, Unit[]> }

const BIN = 1 // metres of aisle per wave
const MAX_UNIT = 0.45 // TVs, bedding and other large goods stay still
const COOLDOWN = 7000
const WAKE_BUDGET = 260 // packs in motion at once while driving
const stocks = new Map<string, Stock>()
const active = new Set<Unit>()
const settled = new Set<Unit>()
const played = new Map<string, number>()
const tmp = new THREE.Matrix4(), spin = new THREE.Matrix4()
let seq = 0

const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const cap = (n: number) => (quality.reflections ? n : Math.round(n * 0.55))

export function registerStock(hallId: string, ox: number, ims: THREE.InstancedMesh[], mats: THREE.Matrix4[], ids: string[]) {
  ims.forEach((im) => im.instanceMatrix.setUsage(THREE.DynamicDrawUsage))
  const s = stocks.get(hallId) ?? { ox, cohorts: [] }
  s.cohorts.push({ ims, mats, ids })
  stocks.set(hallId, s)
}

function unitsOf(hallId: string) {
  const s = stocks.get(hallId)
  if (!s) return null
  if (s.units) return s
  const size = new THREE.Vector3(), scale = new THREE.Vector3()
  s.units = []
  for (const c of s.cohorts) {
    size.set(0, 0, 0)
    for (const im of c.ims) {
      if (!im.geometry.boundingBox) im.geometry.computeBoundingBox()
      const b = im.geometry.boundingBox!
      size.max(new THREE.Vector3().subVectors(b.max, b.min))
    }
    c.mats.forEach((base, i) => {
      scale.setFromMatrixColumn(base, 0)
      if (Math.max(size.x, size.y, size.z) * scale.length() > MAX_UNIT) return
      const e = base.elements
      s.units!.push({ ims: c.ims, i, base, x: e[12], y: e[13], z: e[14], id: c.ids[i], lift: 0, scale: 1, yaw: 0, token: 0 })
    })
  }
  // keep only the row nearest the aisle on each shelf, one wave bin per metre of each side
  const raw = new Map<string, Unit[]>()
  for (const u of s.units) {
    const k = `${Math.sign(u.x - s.ox)}|${Math.floor(u.z / BIN)}`
    const b = raw.get(k)
    if (b) b.push(u); else raw.set(k, [u])
  }
  s.bins = new Map()
  for (const [k, list] of raw) {
    const nearest = new Map<string, number>()
    const shelf = (u: Unit) => `${Math.round(u.y / 0.12)}|${Math.floor(Math.abs(u.x - s.ox))}`
    for (const u of list) nearest.set(shelf(u), Math.min(nearest.get(shelf(u)) ?? 99, Math.abs(u.x - s.ox)))
    s.bins.set(k, list.filter((u) => Math.abs(u.x - s.ox) <= nearest.get(shelf(u))! + 0.12))
  }
  return s
}

const thin = (list: Unit[], n: number) => {
  if (list.length <= n) return list
  const step = list.length / n
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * step)])
}

function play(units: Unit[], params: Record<string, unknown>) {
  if (!units.length) return
  utils.remove(units)
  const token = ++seq
  for (const u of units) { u.token = token; active.add(u); settled.delete(u) }
  animate(units, {
    ...params,
    onComplete: () => {
      for (const u of units) if (u.token === token) { u.lift = 0; u.scale = 1; u.yaw = 0; settled.add(u) }
    },
  })
}

/** Packs settle onto the shelves in a wave running away from the door. */
export function playEntrance(hallId: string, spawnZ: number) {
  const s = unitsOf(hallId)
  if (!s || still()) return
  const near = [...s.bins!.values()].flat().filter((u) => u.z < spawnZ + 1 && u.z > spawnZ - 10)
  const units = thin(near, cap(460))
  for (const u of units) { u.scale = 0.62; u.lift = 0.05 }
  play(units, {
    scale: 1,
    lift: 0,
    duration: 760,
    ease: 'outBack(1.7)',
    delay: (u: Unit) => 380 + (spawnZ - u.z) * 90 + (u.y * 70),
  })
}

/** A soft ripple along the shelf the cart is rolling towards. */
export function playWake(hallId: string, z: number) {
  const s = unitsOf(hallId)
  if (!s || still()) return
  const now = performance.now()
  for (const side of [-1, 1]) {
    if (active.size >= cap(WAKE_BUDGET)) return // driving fast never stacks up more motion
    const k = `${side}|${Math.floor(z / BIN)}`
    if (now - (played.get(`${hallId}|${k}`) ?? -COOLDOWN) < COOLDOWN) continue
    played.set(`${hallId}|${k}`, now)
    const list = (s.bins!.get(k) ?? []).filter((u) => !active.has(u))
    const units = thin(list, cap(64))
    const z0 = Math.floor(z / BIN) * BIN
    play(units, {
      lift: [{ to: 0.024, duration: 230, ease: 'outQuad' }, { to: 0, duration: 520, ease: 'outBounce' }],
      scale: [{ to: 1.05, duration: 230, ease: 'outQuad' }, { to: 1, duration: 520, ease: 'outBack(2)' }],
      delay: (u: Unit) => Math.abs(u.z - z0) * 260 + u.y * 90,
    })
  }
}

/** The tapped or added product hops, and its neighbours follow. */
export function playPick(hallId: string, productId: string, x: number, y: number, z: number) {
  const s = unitsOf(hallId)
  if (!s || still()) return
  const dist = (u: Unit) => Math.hypot(u.x - x, u.y - y, u.z - z)
  const near = s.units!.filter((u) => u.id === productId && dist(u) < 2.4).sort((a, b) => dist(a) - dist(b))
  play(near.slice(0, cap(36)), {
    lift: [{ to: 0.06, duration: 210, ease: 'outCubic' }, { to: 0, duration: 620, ease: 'outBounce' }],
    scale: [{ to: 1.1, duration: 210, ease: 'outCubic' }, { to: 1, duration: 620, ease: 'outElastic(1, .55)' }],
    yaw: [{ to: 0.16, duration: 210, ease: 'outCubic' }, { to: 0, duration: 620, ease: 'outElastic(1, .45)' }],
    delay: (u: Unit) => dist(u) * 150,
  })
}

/** Writes this frame's poses, uploading only the range of each buffer that changed. */
export function flushMotion() {
  if (!active.size) return
  const ranges = new Map<THREE.InstancedMesh, [number, number]>()
  for (const u of active) {
    tmp.copy(u.base)
    if (u.yaw) tmp.multiply(spin.makeRotationY(u.yaw))
    const e = tmp.elements
    for (let c = 0; c < 11; c++) if (c % 4 !== 3) e[c] *= u.scale
    e[13] += u.lift
    for (const im of u.ims) {
      im.setMatrixAt(u.i, tmp)
      const r = ranges.get(im)
      if (r) { r[0] = Math.min(r[0], u.i); r[1] = Math.max(r[1], u.i) } else ranges.set(im, [u.i, u.i])
    }
  }
  for (const [im, [a, b]] of ranges) {
    im.instanceMatrix.clearUpdateRanges()
    im.instanceMatrix.addUpdateRange(a * 16, (b - a + 1) * 16)
    im.instanceMatrix.needsUpdate = true
  }
  for (const u of settled) active.delete(u)
  settled.clear()
}

/** Leaving a store puts every moving pack straight back on its shelf. */
export function resetMotion() {
  if (!active.size) return
  const list = [...active]
  utils.remove(list)
  for (const u of list) { u.token = 0; u.lift = 0; u.scale = 1; u.yaw = 0; settled.add(u) }
  flushMotion()
}

export const motionStats = () => ({ moving: active.size, halls: stocks.size })
