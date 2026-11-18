import * as THREE from 'three'
import { blobTex, rr } from '../../lib/textures'
import { font } from '../../styles/tokens'

function roundRect(w: number, h: number, r: number, hole?: [number, number, number]) {
  const s = new THREE.Shape()
  const x = -w / 2, y = -h / 2
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  if (hole) {
    const [hw, hh, hr] = hole
    const p = new THREE.Path(), a = -hw / 2, b = -hh / 2
    p.moveTo(a + hr, b); p.lineTo(a + hw - hr, b); p.quadraticCurveTo(a + hw, b, a + hw, b + hr)
    p.lineTo(a + hw, b + hh - hr); p.quadraticCurveTo(a + hw, b + hh, a + hw - hr, b + hh)
    p.lineTo(a + hr, b + hh); p.quadraticCurveTo(a, b + hh, a, b + hh - hr)
    p.lineTo(a, b + hr); p.quadraticCurveTo(a, b, a + hr, b)
    s.holes.push(p)
  }
  return s
}
function slab(shape: THREE.Shape, depth: number, bevel: number, m: THREE.Material) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12 })
  g.rotateX(-Math.PI / 2)
  return new THREE.Mesh(g, m)
}

export type NeuCartModel = {
  root: THREE.Group // moves with the shopper
  body: THREE.Group // suspension / celebration movement
  wheels: THREE.Mesh[]
  items: THREE.Group // products placed in the basket
  drawConsole: (count: number, total: string) => void
}

/** NEU CART: white/silver body, brushed aluminium frame, black console, four wheels, a hint of purple light. */
export function buildNeuCart(): NeuCartModel {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  const shell = new THREE.MeshStandardMaterial({ color: '#F4F4F2', roughness: 0.22, metalness: 0.08 })
  const alu = new THREE.MeshStandardMaterial({ color: '#C6C8CB', roughness: 0.28, metalness: 0.85 })
  const black = new THREE.MeshStandardMaterial({ color: '#1C1C1E', roughness: 0.35, metalness: 0.2 })
  const tyre = new THREE.MeshStandardMaterial({ color: '#2A2A2C', roughness: 0.7 })
  const glow = new THREE.MeshBasicMaterial({ color: '#A79BE0', toneMapped: false })

  const chassis = slab(roundRect(0.96, 1.12, 0.24), 0.22, 0.04, shell)
  chassis.position.y = 0.17
  body.add(chassis)
  const skirt = slab(roundRect(0.9, 1.06, 0.22), 0.05, 0, black)
  skirt.position.y = 0.13
  body.add(skirt)
  ;[-1, 1].forEach((s) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.016, 0.7), glow)
    strip.position.set(s * 0.505, 0.29, 0)
    body.add(strip)
  })

  const wheels: THREE.Mesh[] = []
  ;[[-0.42, -0.4], [0.42, -0.4], [-0.42, 0.4], [0.42, 0.4]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 28), tyre)
    w.rotation.z = Math.PI / 2
    w.position.set(x, 0.12, z)
    root.add(w)
    wheels.push(w)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.085, 18), alu)
    hub.rotation.z = Math.PI / 2
    hub.position.set(x, 0.12, z)
    root.add(hub)
  })

  // basket: brushed aluminium wire on all four sides
  const grid = (() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 256
    const g = c.getContext('2d')!
    g.strokeStyle = '#ffffff'; g.lineWidth = 5
    for (let x = 2; x <= 512; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke() }
    for (let y = 2; y <= 256; y += 62) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke() }
    g.lineWidth = 12; g.strokeRect(0, 0, 512, 256)
    const t = new THREE.CanvasTexture(c)
    t.anisotropy = 8
    return t
  })()
  const wire = new THREE.MeshStandardMaterial({ color: '#B9BCC0', alphaMap: grid, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.3, metalness: 0.8 })
  const H = 0.5, y0 = 0.42
  const sideL = new THREE.Mesh(new THREE.PlaneGeometry(1.02, H), wire)
  sideL.rotation.y = Math.PI / 2
  sideL.position.set(-0.43, y0 + H / 2, 0)
  const sideR = sideL.clone()
  sideR.position.x = 0.43
  const front = new THREE.Mesh(new THREE.PlaneGeometry(0.86, H), wire)
  front.position.set(0, y0 + H / 2, -0.51)
  const back = front.clone()
  back.position.z = 0.51
  ;[sideL, sideR, front, back].forEach((m) => { m.userData.noShadow = true; body.add(m) })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.02), new THREE.MeshStandardMaterial({ color: '#E9E9E7', roughness: 0.5 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = y0 + 0.01
  body.add(floor)
  const rim = slab(roundRect(1.0, 1.14, 0.2, [0.84, 0.98, 0.14]), 0.05, 0.014, shell)
  rim.position.y = y0 + H
  body.add(rim)
  // aluminium posts at the corners
  ;[[-0.44, -0.52], [0.44, -0.52], [-0.44, 0.52], [0.44, 0.52]].forEach(([x, z]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, H, 10), alu)
    p.position.set(x, y0 + H / 2, z)
    body.add(p)
  })

  // handle and black console on the shopper's side
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.86, 18), alu)
  handle.rotation.z = Math.PI / 2
  handle.position.set(0, y0 + H + 0.07, 0.68)
  body.add(handle)
  ;[-1, 1].forEach((s) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.17), alu)
    arm.position.set(s * 0.42, y0 + H + 0.05, 0.6)
    body.add(arm)
  })
  const con = slab(roundRect(0.6, 0.18, 0.06), 0.03, 0.01, black)
  con.rotation.x = 1.2
  con.position.set(0, y0 + H - 0.16, 0.6)
  body.add(con)
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 112
  const ctx = canvas.getContext('2d')!
  const ct = new THREE.CanvasTexture(canvas)
  ct.colorSpace = THREE.SRGBColorSpace
  ct.anisotropy = 8
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.118), new THREE.MeshBasicMaterial({ map: ct, toneMapped: false }))
  screen.rotation.x = -0.37
  screen.position.set(0, y0 + H - 0.14, 0.636)
  body.add(screen)

  const items = new THREE.Group()
  body.add(items)

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.8), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.75 }))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.008
  shadow.userData.noShadow = true
  root.add(shadow)

  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || o.userData.noShadow) return
    m.castShadow = true
    m.receiveShadow = true
  })

  const drawConsole = (count: number, total: string) => {
    const w = 512, h = 112
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#141416'; rr(ctx, 0, 0, w, h, 26); ctx.fill()
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#B9AFEA'; ctx.font = `600 28px ${font.family}`; ctx.fillText('NEU CART', 26, h / 2)
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'right'; ctx.font = `600 32px ${font.family}`
    ctx.fillText(count ? `${count} item${count > 1 ? 's' : ''}  ·  ${total}` : 'Ready', w - 26, h / 2 + 1)
    ctx.textAlign = 'left'
    ct.needsUpdate = true
  }
  drawConsole(0, '₹0')
  return { root, body, wheels, items, drawConsole }
}
