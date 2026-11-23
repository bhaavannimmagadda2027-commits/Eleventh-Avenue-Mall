import { useMemo } from 'react'
import * as THREE from 'three'
import { L, addCircle, addRect } from '../../data/layout'
import { blobTex, canvasTex, rng } from '../../lib/textures'
import { M, box, enableShadows, mat, plane, mergeStatic } from './build'

/** Leaf cluster card: many small leaves on a transparent canvas. Reads as foliage at a distance. */
export const leafTex = () =>
  canvasTex('leaves', 256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    const R = rng(17)
    const greens = ['#6E8B69', '#7C9877', '#8FA889', '#5D7A58', '#9AB08F']
    for (let i = 0; i < 150; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * w * 0.42
      const x = w / 2 + Math.cos(a) * d, y = h / 2 + Math.sin(a) * d
      g.fillStyle = greens[(R() * greens.length) | 0]
      g.beginPath(); g.ellipse(x, y, 6 + R() * 7, 3 + R() * 3, R() * Math.PI, 0, 7); g.fill()
    }
  })

type Leaf = [number, number, number, number] // x y z scale

function tree(g: THREE.Group, leaves: Leaf[], x: number, z: number, h: number, potR: number, R: () => number) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(potR, potR * 0.86, 0.75, 40), M.ceramic())
  pot.position.set(x, 0.375, z)
  g.add(pot)
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.94, potR * 0.94, 0.02, 32), mat('#6B5A48'))
  soil.position.set(x, 0.74, z)
  g.add(soil)
  const trunkM = mat('#8B7B66', { roughness: 0.85 })
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, h, 10), trunkM)
  trunk.position.set(x, 0.75 + h / 2, z)
  g.add(trunk)
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.045, h * 0.4, 6), trunkM)
    b.position.set(x, 0.75 + h * (0.55 + i * 0.1), z)
    b.rotation.set((R() - 0.5) * 1.4, R() * 6, (R() - 0.5) * 1.4)
    g.add(b)
  }
  const top = 0.75 + h
  const n = Math.round(h * 26)
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * h * 0.38
    leaves.push([x + Math.cos(a) * d, top - h * 0.42 + R() * h * 0.62 - d * 0.3, z + Math.sin(a) * d, 0.7 + R() * 0.6])
  }
  const sh = plane(potR * 4.2, potR * 4.2, new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.6 }), g)
  sh.rotation.x = -Math.PI / 2
  sh.position.set(x, 0.006, z)
  sh.userData.noShadow = true
  addCircle({ x, z, r: potR + 0.12 })
}

function sofa(g: THREE.Group, x: number, z: number, rot: number) {
  const s = new THREE.Group()
  s.position.set(x, 0, z)
  s.rotation.y = rot
  g.add(s)
  const linen = M.linen(), cushion = mat('#F1ECE3', { roughness: 0.95 })
  box(2.1, 0.32, 0.86, linen, 0, 0.3, 0, s)
  box(2.1, 0.5, 0.2, linen, 0, 0.62, -0.33, s)
  ;[-1, 1].forEach((k) => box(0.18, 0.5, 0.86, linen, k * 0.96, 0.4, 0, s))
  ;[-0.46, 0.46].forEach((k) => box(0.88, 0.12, 0.66, cushion, k, 0.52, 0.06, s))
  ;[[-0.95, -0.35], [0.95, -0.35], [-0.95, 0.35], [0.95, 0.35]].forEach(([a, b]) => box(0.05, 0.14, 0.05, M.wood(), a, 0.07, b, s))
  const sh = plane(2.8, 1.5, new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.5 }), s)
  sh.rotation.x = -Math.PI / 2
  sh.position.y = 0.006
  sh.userData.noShadow = true
}

function bench(g: THREE.Group, x: number, z: number) {
  const b = new THREE.Group()
  b.position.set(x, 0, z)
  g.add(b)
  for (let i = 0; i < 4; i++) box(0.11, 0.05, 1.9, M.oak(), -0.18 + i * 0.12, 0.46, 0, b)
  ;[-0.75, 0.75].forEach((k) => box(0.48, 0.44, 0.06, M.alu(), 0, 0.22, k, b))
  addRect({ x0: x - 0.35, x1: x + 0.35, z0: z - 1.05, z1: z + 1.05 })
}

/** Indoor trees, lounge seating and greenery spilling over the first-floor balcony. */
export function Greenery() {
  const group = useMemo(() => {
    const g = new THREE.Group()
    const R = rng(23)
    const leaves: Leaf[] = []
    // lounges on the atrium axis: a tree with linen sofas and an oak side table
    L.lounges.forEach((z) => {
      tree(g, leaves, 0, z, 4.6, 0.95, R)
      sofa(g, -2.15, z, Math.PI / 2)
      sofa(g, 2.15, z, -Math.PI / 2)
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.42, 28), M.oak())
      t.position.set(0, 0.21, z + 1.7)
      g.add(t)
      addRect({ x0: -2.75, x1: 2.75, z0: z - 1.3, z1: z + 2.1 })
    })
    // trees along the atrium edge, benches in the gaps
    ;[-20, -40, -58].forEach((z, i) => tree(g, leaves, (i % 2 ? 1 : -1) * 6.2, z, 3.6, 0.6, R))
    ;[-40, -20, -58].forEach((z, i) => tree(g, leaves, (i % 2 ? -1 : 1) * 6.2, z + 1, 3.2, 0.55, R))
    ;[-27, -52].forEach((z) => [-1, 1].forEach((s) => bench(g, s * 6.15, z)))
    // greenery trailing over the balcony edge
    for (let z = L.entranceZ - 1; z > L.endZ + 1; z -= 0.55) {
      ;[-1, 1].forEach((s) => {
        if (Math.abs(z - L.bridgeZ) < 2.6) return
        leaves.push([s * (L.voidHalf + 0.2 + R() * 0.15), L.upperY - 0.15 - R() * 0.35, z + R() * 0.3, 0.35 + R() * 0.25])
      })
    }
    const leafM = new THREE.MeshStandardMaterial({ map: leafTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8 })
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 1.2), leafM, leaves.length)
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler()
    leaves.forEach(([x, y, z, s], i) => {
      e.set(R() * Math.PI, R() * Math.PI, R() * Math.PI)
      q.setFromEuler(e)
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s))
      im.setMatrixAt(i, m)
    })
    im.frustumCulled = false
    g.add(im)
    enableShadows(g)
    mergeStatic(g)
    return g
  }, [])
  return <primitive object={group} />
}
