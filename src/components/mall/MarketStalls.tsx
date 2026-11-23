import { useMemo } from 'react'
import * as THREE from 'three'
import { L, addRect } from '../../data/layout'
import { rng } from '../../lib/textures'
import { box, enableShadows, mat, mergeStatic, plane } from './build'

const TRAYS = ['tomato', 'spinach', 'capsicum', 'carrot', 'lettuce', 'onion', 'broccoli', 'potato']
const FRUIT = [
  ['#F08A24', '#E97C1C', '#F49A36'], // oranges
  ['#C8352E', '#B92C2A', '#D2473A'], // apples
  ['#F2CF3A', '#EBC42E', '#F6DA55'], // lemons
  ['#F5B335', '#EFA52C', '#F7C24F'], // mangoes
]
const JARS = ['#C9863A', '#E9D9B8', '#7C9877', '#B5533C', '#F0E6D2', '#D9A441']
const CX = L.voidHalf + 0.35 // the stalls wrap the structural column line
const HALF_W = 1, HALF_L = 2.3
const TILT = 0.28

type Dot = { x: number; y: number; z: number; r: number; c: string }

/** Oak market stalls on the column line, leaving every shop door and driving lane clear. */
function buildStalls() {
  const g = new THREE.Group()
  const R = rng(41)
  const loader = new THREE.TextureLoader()
  const photo = Object.fromEntries(TRAYS.map((t) => {
    const map = loader.load(`${import.meta.env.BASE_URL}trays/${t}.jpg`)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 4
    return [t, new THREE.MeshStandardMaterial({ map, roughness: 0.78 })]
  }))
  const oak = mat('#D8BE96', { roughness: 0.52 }), slat = mat('#C9A679', { roughness: 0.56 }), pale = mat('#E6D3B5', { roughness: 0.5 }), crateM = mat('#B98F5F', { roughness: 0.62 })
  const fruit: Dot[] = [], jars: Dot[] = []
  let n = 0

  ;[-1, 1].forEach((s) => L.stalls.forEach((z) => {
    const u = new THREE.Group()
    u.position.set(s * CX, 0, z)
    u.rotation.y = s > 0 ? Math.PI : 0 // local +x always faces the atrium
    g.add(u)
    const toWorld = (x: number, y: number, lz: number, r: number, c: string, out: Dot[]) =>
      out.push({ x: s * CX - s * x, y, z: z - s * lz, r, c })

    box(HALF_W * 2, 0.08, HALF_L * 2, slat, 0, 0.04, 0, u)
    box(HALF_W * 2 - 0.1, 0.62, HALF_L * 2 - 0.1, oak, 0, 0.39, 0, u)
    for (let q = -HALF_L + 0.12; q < HALF_L; q += 0.24) [-1, 1].forEach((f) => box(0.018, 0.56, 0.15, slat, f * (HALF_W - 0.04), 0.39, q, u))
    box(HALF_W * 2 + 0.04, 0.05, HALF_L * 2 + 0.04, pale, 0, 0.72, 0, u)

    ;[-1, 1].forEach((f) => [0, 1].forEach((tier) => {
      const cx = f * (0.72 - tier * 0.42), cy = 0.86 + tier * 0.25, t = -f * TILT
      for (let i = 0; i < 4; i++) {
        const cz = -1.65 + i * 1.1
        const crate = new THREE.Group()
        crate.position.set(cx, cy, cz)
        crate.rotation.z = t
        u.add(crate)
        box(0.42, 0.1, 1.04, crateM, 0, 0, 0, crate)
        n++
        if (n % 2) {
          ;[-0.25, 0.25].forEach((o) => {
            const p = plane(0.38, 0.49, photo[TRAYS[(n >> 1) % TRAYS.length]], crate)
            p.rotation.x = -Math.PI / 2
            p.position.set(0, 0.052, o)
            p.userData.noCast = true
          })
        } else {
          const pal = FRUIT[(n >> 1) % FRUIT.length]
          for (let k = 0; k < 12; k++) {
            const a = (R() - 0.5) * 0.3, b = (R() - 0.5) * 0.9
            toWorld(cx + a * Math.cos(t), cy + a * Math.sin(t) + 0.1 + R() * 0.05, cz + b, 0.06 + R() * 0.018, pal[(R() * 3) | 0], fruit)
          }
        }
      }
    }))

    // a slim top shelf of jars around the column
    ;[-1, 1].forEach((k) => box(0.06, 1.9, 0.06, slat, 0, 1.0, k * 1.95, u))
    box(0.46, 0.05, 4.1, pale, 0, 1.78, 0, u)
    for (let q = -1.8; q <= 1.8; q += 0.26) {
      if (Math.abs(q) < 0.42) continue // the column passes through here
      ;[-0.12, 0.12].forEach((x) => toWorld(x, 1.91, q, 1, JARS[(R() * JARS.length) | 0], jars))
    }
    addRect({ x0: s * CX - HALF_W, x1: s * CX + HALF_W, z0: z - HALF_L, z1: z + HALF_L })
  }))

  enableShadows(g)
  mergeStatic(g)

  const scatter = (geo: THREE.BufferGeometry, m: THREE.Material, dots: Dot[], scale: (d: Dot) => [number, number, number]) => {
    const im = new THREE.InstancedMesh(geo, m, dots.length)
    const t = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color()
    dots.forEach((d, i) => {
      const [a, b, e] = scale(d)
      t.compose(new THREE.Vector3(d.x, d.y, d.z), q, new THREE.Vector3(a, b, e))
      im.setMatrixAt(i, t)
      im.setColorAt(i, c.set(d.c))
    })
    im.frustumCulled = false
    im.receiveShadow = true
    g.add(im)
  }
  scatter(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.42 }), fruit, (d) => [d.r, d.r * 0.94, d.r])
  scatter(new THREE.CylinderGeometry(0.052, 0.058, 0.2, 8), new THREE.MeshStandardMaterial({ roughness: 0.34 }), jars, () => [1, 1, 1])
  return g
}

export function MarketStalls() {
  const group = useMemo(buildStalls, [])
  return <primitive object={group} />
}
