import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { L, obstaclesOf } from '../../data/layout'
import { HALLS, PLACE, type Hall } from '../../data/storeLayout'
import { PRODUCT_BY_ID, SECTION_LABEL, isProduce } from '../../data/products'
import { STORE_BY_ID } from '../../data/stores'
import { drive, readSteer, reduceMotion } from '../../lib/input'
import { makeProductObject } from '../../lib/productArt'
import { INTERIORS, activeCart, cartCount, currentMall, inr, toPay, useMall, type Location } from '../../state/useMall'
import { buildNeuCart } from './NeuCart'

const CAM_H = 2.2 // eye height behind the cart
const CART_AHEAD = 2.3 // cart distance in front of the camera
const PITCH = -0.26
const LANE = 4.6 // clear walking lanes either side of the atrium axis
const CROSS_Z = [2, -11.6, -21, -40.5, -53, -63] // where the atrium axis is free to cross

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** dev-only: lets automated checks step frames at a fixed rate while the browser tab is in the background */
export const devDt = { fixed: 0 }
/** where NEU CART is, for things that follow it (a friend in a shared session) */
export const cartPose = { x: 0, z: 0, yaw: 0 }
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const yawTo = (dx: number, dz: number) => Math.atan2(-dx, -dz)

type Pt = { x: number; z: number }
type Auto = { pts: Pt[]; i: number; yawEnd: number; v: number; then?: () => void }
type Mv = { x: number; z: number; yaw: number; v: number; turn: number; bob: number; prevV: number }
type Flight = { o: THREE.Object3D; from: THREE.Vector3; slot: THREE.Vector3; t: number }

// basket slots in cart-local space: 3 × 3 per layer, three layers
const SLOTS = (() => {
  const a: THREE.Vector3[] = []
  for (let l = 0; l < 3; l++) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) a.push(new THREE.Vector3(-0.26 + c * 0.26 + (l % 2) * 0.05, 0.44 + l * 0.15, -0.3 + r * 0.27))
  return a
})()

function basketObject(id: string) {
  const p = PRODUCT_BY_ID[id]
  const o = makeProductObject(p, isProduce(p) ? 'pile' : 'one')
  const b = new THREE.Box3().setFromObject(o)
  const s = b.getSize(new THREE.Vector3())
  const k = Math.min(1.6, 0.28 / Math.max(s.x, s.z), 0.34 / s.y)
  o.scale.setScalar(k)
  return o
}

/** Drives NEU CART, keeps the camera behind it, moves between lobby and stores, and animates purchases into the basket. */
export function CartRig({ sun }: { sun: React.RefObject<THREE.DirectionalLight | null> }) {
  const { camera, gl, scene } = useThree()
  const cart = useMemo(buildNeuCart, [])
  const mv = useRef<Mv>({ x: L.spawn.x, z: L.spawn.z, yaw: L.spawn.yaw, v: 0, turn: 0, bob: 0, prevV: 0 })
  const auto = useRef<Auto | null>(null)
  const enter = useRef({ t: 1, from: new THREE.Vector3(), fromYaw: 0, fromPitch: 0 })
  const lastView = useRef(useMall.getState().view)
  const lastLoc = useRef<Location>(useMall.getState().location)
  const flights = useRef<Flight[]>([])
  const bounce = useRef({ y: 0, v: 0 })
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__rig = { mv: mv.current, auto }

  // basket contents and console follow the cart (rebuilt when nothing is mid-flight)
  const rebuildBasket = useMemo(() => () => {
    const lines = activeCart(useMall.getState())
    cart.drawConsole(cartCount(lines), inr(toPay(useMall.getState())))
    while (cart.items.children.length) cart.items.remove(cart.items.children[0])
    const units: string[] = []
    lines.forEach((l) => { for (let i = 0; i < Math.min(l.qty, 3); i++) units.push(l.productId) })
    units.slice(0, SLOTS.length).forEach((id, i) => {
      const o = basketObject(id)
      o.position.copy(SLOTS[i])
      o.rotation.y = ((i * 37) % 10) / 10 - 0.5
      o.traverse((c) => { c.castShadow = true })
      cart.items.add(o)
    })
  }, [cart])
  useEffect(() => useMall.subscribe((s, p) => { if ((activeCart(s) !== activeCart(p) || s.useCoins !== p.useCoins) && !flights.current.length) rebuildBasket() }), [rebuildBasket])

  // a product was added from a shelf: fly it into the next free basket slot
  useEffect(() => useMall.subscribe((s, p) => {
    if (!s.flight || s.flight === p.flight) return
    const units = activeCart(s).reduce((a, l) => a + Math.min(l.qty, 3), 0)
    const o = basketObject(s.flight.productId)
    const from = new THREE.Vector3(...s.flight.from)
    o.position.copy(from)
    scene.add(o)
    flights.current.push({ o, from, slot: SLOTS[Math.min(units - 1, SLOTS.length - 1)].clone(), t: 0 })
  }), [scene])

  // drag the scene to look around
  useEffect(() => {
    const el = gl.domElement
    let down: { x: number; id: number } | null = null
    const pd = (e: PointerEvent) => { if (useMall.getState().view === 'mall') down = { x: e.clientX, id: e.pointerId } }
    const pm = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return
      drive.lookDelta += e.clientX - down.x
      down.x = e.clientX
    }
    const pu = () => { down = null }
    el.addEventListener('pointerdown', pd)
    window.addEventListener('pointermove', pm)
    window.addEventListener('pointerup', pu)
    return () => { el.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu) }
  }, [gl])

  // moved between the lobby and a store (the screen is faded at this moment): place the cart at the doorway
  useEffect(() => useMall.subscribe((s) => {
    if (s.location === lastLoc.current) return
    const from = lastLoc.current
    const m = mv.current
    auto.current = null
    enter.current.t = 1 // never glide across the world: the fade covers the jump
    if (s.location === 'lobby') {
      const store = STORE_BY_ID[from]
      const side = store?.side ?? -1
      Object.assign(m, { x: side * 6.0, z: store?.z ?? 0, yaw: side * Math.PI / 2, v: 0, turn: 0 })
    } else {
      const hall = HALLS[s.location]
      Object.assign(m, { x: hall.ox, z: hall.spawnZ, yaw: 0, v: 0, turn: 0 })
    }
    lastLoc.current = s.location
  }), [])

  // "take me to this store": route along a side lane, then turn to face the storefront
  useEffect(() => useMall.subscribe((s, prev) => {
    if (!s.travel || s.travel === prev.travel || s.location !== 'lobby') return
    const st = currentMall().stores.find((x) => x.id === s.travel!.storeId)
    if (!st) return
    const m = mv.current
    const side = st.side
    const pts: Pt[] = []
    const laneX = side * LANE
    if (Math.sign(m.x) !== side && Math.abs(m.x) > 2.2) {
      const cz = CROSS_Z.reduce((a, b) => (Math.abs(b - m.z) < Math.abs(a - m.z) ? b : a))
      const ownLane = Math.sign(m.x) * LANE
      pts.push({ x: ownLane, z: m.z }, { x: ownLane, z: cz }, { x: laneX, z: cz })
    } else if (Math.abs(m.x - laneX) > 0.4) {
      pts.push({ x: laneX, z: m.z })
    }
    if (st.level === 0) {
      pts.push({ x: laneX, z: st.z })
      const walkIn = s.travel.enter && INTERIORS.includes(st.id)
      auto.current = { pts, i: 0, yawEnd: -side * Math.PI / 2, v: Math.max(0, m.v), then: walkIn ? () => useMall.getState().enterStore(st.id) : undefined }
    } else {
      pts.push({ x: laneX, z: st.z + 6 })
      auto.current = { pts, i: 0, yawEnd: -side * 0.9, v: Math.max(0, m.v) }
    }
    useMall.getState().clearTravel()
  }), [])

  // "show me this product": drive down the aisle and stop at an angle to its shelf
  useEffect(() => useMall.subscribe((s, prev) => {
    if (!s.seek || s.seek === prev.seek) return
    const pl = PLACE[s.seek.productId]
    if (!pl || s.location !== PRODUCT_BY_ID[pl.productId].storeId) return
    const side = pl.side
    const hall = HALLS[pl.storeId]
    const target = { x: hall.ox - side * 0.4, z: Math.min(hall.entranceZ - 1.2, pl.z + 2.0) }
    const id = pl.productId, then = s.seek.then
    auto.current = {
      pts: [target], i: 0, yawEnd: yawTo(side * 0.82, -0.57), v: Math.max(0, mv.current.v),
      then: then === 'preview' ? () => useMall.getState().showPreview(id, [pl.x, 1.1, pl.z]) : undefined,
    }
  }), [])

  useFrame((state, rawDt) => {
    const dt = import.meta.env.DEV && devDt.fixed ? devDt.fixed : Math.min(0.05, rawDt)
    const cam = camera as THREE.PerspectiveCamera
    const fov = state.size.width / state.size.height < 0.8 ? 74 : 55
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix() }
    const m = mv.current
    cartPose.x = m.x; cartPose.z = m.z; cartPose.yaw = m.yaw
    const st = useMall.getState()
    const view = st.view
    if (view !== lastView.current) {
      if (view === 'mall') enter.current = { t: reduceMotion ? 1 : 0, from: camera.position.clone(), fromYaw: camera.rotation.y, fromPitch: camera.rotation.x }
      else { auto.current = null; Object.assign(m, { x: L.spawn.x, z: L.spawn.z, yaw: L.spawn.yaw, v: 0, turn: 0 }) }
      lastView.current = view
    }

    if (view === 'mall' && !st.fading && st.checkout === 'closed') {
      const { jx, jy } = readSteer()
      if (auto.current && (Math.abs(jx) > 0.15 || Math.abs(jy) > 0.15 || drive.lookDelta)) auto.current = null
      if (drive.lookDelta) { m.yaw -= drive.lookDelta * 0.0042; drive.lookDelta = 0 }
      const a = auto.current
      if (a) {
        const tgt = a.pts[a.i]
        if (tgt) {
          let rem = 0, px = m.x, pz = m.z
          for (let q = a.i; q < a.pts.length; q++) { rem += Math.hypot(a.pts[q].x - px, a.pts[q].z - pz); px = a.pts[q].x; pz = a.pts[q].z }
          const dx = tgt.x - m.x, dz = tgt.z - m.z, d = Math.hypot(dx, dz)
          a.v = Math.min(a.v + dt * 6, 7, Math.sqrt(2 * 5 * rem) + 0.3)
          if (d > 0.05) m.yaw += wrap(yawTo(dx, dz) - m.yaw) * (1 - Math.exp(-dt * 6))
          const step = a.v * dt
          if (step >= d) { m.x = tgt.x; m.z = tgt.z; a.i++ } else { m.x += (dx / d) * step; m.z += (dz / d) * step }
          m.v = a.v
        } else {
          m.v = lerp(m.v, 0, 1 - Math.exp(-dt * 8))
          const dy = wrap(a.yawEnd - m.yaw)
          m.yaw += dy * (1 - Math.exp(-dt * 6))
          if (Math.abs(dy) < 0.02) { m.yaw = a.yawEnd; m.v = 0; auto.current = null; a.then?.() }
        }
      } else {
        // momentum: accelerate gently, coast to a stop, turn less sharply at speed
        const top = st.location === 'lobby' ? 4.2 : 3.2
        const target = jy * (jy > 0 ? top : 1.8)
        m.v = lerp(m.v, target, 1 - Math.exp(-dt * (Math.abs(target) > Math.abs(m.v) ? 2.4 : 3.2)))
        const tt = -jx * (1.6 - Math.min(1, Math.abs(m.v) / 4.2) * 0.6)
        m.turn = lerp(m.turn, tt, 1 - Math.exp(-dt * 6))
        m.yaw += m.turn * dt
        m.x += -Math.sin(m.yaw) * m.v * dt
        m.z += -Math.cos(m.yaw) * m.v * dt
      }
      if (st.location === 'lobby') { collideLobby(m); nearStore(m) }
      else { collideStore(m, HALLS[st.location]); nearProducts(m, st.location) }
    }

    // place the cart: suspension bob, lean into turns, and a little hop when something lands
    const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw)
    cart.root.position.set(m.x + fx * CART_AHEAD, 0, m.z + fz * CART_AHEAD)
    cart.root.rotation.y = m.yaw
    const sp = Math.abs(m.v)
    m.bob += dt * sp * 2.2
    const b = bounce.current
    b.v += (-b.y * 260 - b.v * 14) * dt
    b.y += b.v * dt
    cart.body.position.y = (reduceMotion ? 0 : Math.sin(m.bob * 4) * 0.005 * Math.min(1, sp)) + Math.max(-0.02, b.y)
    cart.body.rotation.z = -m.turn * 0.018
    cart.body.rotation.x = lerp(cart.body.rotation.x, (m.v - m.prevV) * 0.02 + b.y * 0.6, 0.3)
    m.prevV = m.v
    cart.wheels.forEach((w) => { w.rotation.x -= (m.v * dt) / 0.12 })

    // items flying from the shelf into the basket
    cart.root.updateMatrixWorld()
    for (let i = flights.current.length - 1; i >= 0; i--) {
      const f = flights.current[i]
      f.t = Math.min(1, f.t + dt / (reduceMotion ? 0.15 : 0.6))
      const target = cart.body.localToWorld(f.slot.clone())
      const e = 1 - Math.pow(1 - f.t, 3)
      f.o.position.lerpVectors(f.from, target, e)
      f.o.position.y += Math.sin(f.t * Math.PI) * 0.5
      f.o.rotation.y += dt * 5
      if (f.t >= 1) {
        scene.remove(f.o)
        flights.current.splice(i, 1)
        if (!reduceMotion) b.v -= 0.9
        if (!flights.current.length) rebuildBasket()
      }
    }

    const follow = new THREE.Vector3(m.x, CAM_H, m.z)
    let pos = follow, yaw = m.yaw, pitch = PITCH
    if (view === 'landing') {
      const t = state.clock.elapsedTime
      pos = new THREE.Vector3(Math.sin(t * 0.07) * 0.6, 3.9, 6.6)
      yaw = Math.sin(t * 0.05) * 0.05
      pitch = -0.12
    } else if (enter.current.t < 1) {
      const e = enter.current
      e.t = Math.min(1, e.t + dt / 1.9)
      const k = ease(e.t)
      pos = e.from.clone().lerp(follow, k)
      yaw = lerp(e.fromYaw, m.yaw, k)
      pitch = lerp(e.fromPitch, PITCH, k)
    }
    camera.position.copy(pos)
    camera.rotation.order = 'YXZ'
    camera.rotation.set(pitch, yaw, 0)

    // keep the sun's shadow box centred just ahead of the shopper
    const s = sun.current
    if (s) {
      const cx = Math.round((m.x + fx * 6) * 2) / 2, cz = Math.round((m.z + fz * 6) * 2) / 2
      s.position.set(cx + 9, 26, cz + 12)
      s.target.position.set(cx, 0, cz)
      s.target.updateMatrixWorld()
    }
  })

  return <primitive object={cart.root} />
}

function pushOut(m: Mv, loc: string) {
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw)
  const ob = obstaclesOf(loc)
  const pts = [{ ox: fx * CART_AHEAD, oz: fz * CART_AHEAD, r: 0.6 }, { ox: 0, oz: 0, r: 0.45 }]
  for (const p of pts) {
    let px = m.x + p.ox, pz = m.z + p.oz
    for (const c of ob.circles) {
      const dx = px - c.x, dz = pz - c.z, d = Math.hypot(dx, dz), min = c.r + p.r
      if (d < min && d > 1e-4) { m.x += (dx / d) * (min - d); m.z += (dz / d) * (min - d); m.v *= 0.75; px = m.x + p.ox; pz = m.z + p.oz }
    }
    for (const r of ob.rects) {
      const x0 = r.x0 - p.r, x1 = r.x1 + p.r, z0 = r.z0 - p.r, z1 = r.z1 + p.r
      if (px > x0 && px < x1 && pz > z0 && pz < z1) {
        const pen = [px - x0, x1 - px, pz - z0, z1 - pz]
        const k = pen.indexOf(Math.min(...pen))
        if (k === 0) m.x -= pen[0]; else if (k === 1) m.x += pen[1]; else if (k === 2) m.z -= pen[2]; else m.z += pen[3]
        m.v *= 0.7
        px = m.x + p.ox; pz = m.z + p.oz
      }
    }
  }
}

function collideLobby(m: Mv) {
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw)
  // driving into a store that has an interior takes you inside
  const cx = m.x + fx * CART_AHEAD, cz = m.z + fz * CART_AHEAD
  if (m.v > 0.2) {
    const st = currentMall().stores.find((s) => s.level === 0 && INTERIORS.includes(s.id) && Math.sign(cx) === s.side && Math.abs(cx) > L.shopX - 1.5 && Math.abs(cz - s.z) < 1.3)
    if (st) { useMall.getState().enterStore(st.id); m.v = 0; return }
  }
  for (let it = 0; it < 2; it++) {
    for (const off of [CART_AHEAD, 0]) {
      const px = m.x + fx * off, lim = L.shopX - 1.1
      if (px > lim) { m.x -= px - lim; m.v *= 0.6 }
      if (px < -lim) { m.x += -lim - px; m.v *= 0.6 }
    }
    pushOut(m, 'lobby')
  }
}

function collideStore(m: Mv, H: Hall) {
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw)
  const cx = m.x + fx * CART_AHEAD, cz = m.z + fz * CART_AHEAD
  // the doorway back to the lobby
  if (m.v > 0.2 && cz > H.entranceZ - 0.9 && Math.abs(cx - H.ox) < 1.5) { useMall.getState().enterStore('lobby'); m.v = 0; return }
  const lim = H.half - H.depth - 0.55
  for (let it = 0; it < 2; it++) {
    for (const off of [CART_AHEAD, 0]) {
      const px = m.x + fx * off, pz = m.z + fz * off
      if (px > H.ox + lim) { m.x -= px - (H.ox + lim); m.v *= 0.6 }
      if (px < H.ox - lim) { m.x += H.ox - lim - px; m.v *= 0.6 }
      if (pz < H.backZ + 0.7) { m.z += H.backZ + 0.7 - pz; m.v *= 0.5 }
      if (pz > H.entranceZ - 0.45) { m.z -= pz - (H.entranceZ - 0.45) }
    }
    pushOut(m, H.id)
  }
}

let nearT = 0
function nearStore(m: Mv) {
  if (++nearT % 6) return
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw)
  const cx = m.x + fx * CART_AHEAD, cz = m.z + fz * CART_AHEAD
  // standing in front of a ground-floor store and facing it
  const st = currentMall().stores.find((s) => s.level === 0 && Math.sign(cx) === s.side && Math.abs(cx) > 5 && fx * s.side > 0.75 && Math.abs(cz - s.z) < 3.6)
  useMall.getState().setNearStore(st ? st.id : null)
}

let nearPT = 0
/** Products on the shelves just ahead of the cart, for the bottom strip and the location label. */
function nearProducts(m: Mv, loc: string) {
  if (++nearPT % 8) return
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw)
  const cx = m.x + fx * CART_AHEAD, cz = m.z + fz * CART_AHEAD
  const list = Object.values(PLACE)
    .filter((pl) => pl.storeId === loc)
    .map((pl) => {
      const dx = pl.x - cx, dz = pl.z - cz, d = Math.hypot(dx, dz)
      return { pl, d, dot: (dx * fx + dz * fz) / (d || 1) }
    })
    .filter((o) => o.d < 5.5 && o.dot > -0.2)
    .sort((a, b) => a.d - a.dot - (b.d - b.dot))
    .slice(0, 6)
  const ids = list.map((o) => o.pl.productId)
  const sec = list[0] ? SECTION_LABEL[list[0].pl.section] : 'Entrance'
  const s = useMall.getState()
  if (ids.join() !== s.nearProducts.join() || sec !== s.storeSection) useMall.setState({ nearProducts: ids, storeSection: sec })
}

