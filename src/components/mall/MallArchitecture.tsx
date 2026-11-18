import { useMemo } from 'react'
import * as THREE from 'three'
import { L, addRect } from '../../data/layout'
import { exteriorTex, floorTex, inlayTex, skyTex } from '../../lib/textures'
import { M, basic, box, enableShadows, mat, plane, mergeStatic } from './build'

const LEN = L.entranceZ - L.endZ
const ZC = (L.entranceZ + L.endZ) / 2

/** The galleria: polished floor, two storeys, white stone columns, a glass gable roof with white beams. */
function buildArchitecture() {
  const g = new THREE.Group()
  const W = L.shopX + 0.6 // outer half-width

  // floor: large polished tiles + warm stone bands along the atrium edge
  const floor = plane(W * 2, LEN, new THREE.MeshStandardMaterial({ map: floorTex([(W * 2) / 2.4, LEN / 2.4]), roughness: 0.22, metalness: 0.02 }), g)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, ZC)
  floor.userData.noCast = true
  ;[-1, 1].forEach((s) => {
    const band = plane(0.7, LEN, new THREE.MeshStandardMaterial({ map: inlayTex([1, LEN / 0.7]), roughness: 0.3 }), g)
    band.rotation.x = -Math.PI / 2
    band.position.set(s * (L.voidHalf + 0.15), 0.004, ZC)
    band.userData.noCast = true
  })

  const stone = M.stone(), plaster = M.plaster(), alu = M.alu(), white = M.white(), oak = M.oak()

  ;[-1, 1].forEach((s) => {
    // first-floor walkway slab, stone fascia with a pale oak reveal, downlights underneath
    const slabW = W - L.voidHalf
    const slab = box(slabW, L.slabT, LEN, stone, s * (L.voidHalf + slabW / 2), L.upperY - L.slabT / 2, ZC, g)
    slab.userData.noReceive = false
    box(0.06, 0.12, LEN, oak, s * (L.voidHalf + 0.03), L.upperY - L.slabT + 0.12, ZC, g)
    const dl = new THREE.MeshBasicMaterial({ color: '#FFF6E6' })
    for (let z = L.entranceZ - 2; z > L.endZ; z -= 3) {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), dl)
      d.rotation.x = Math.PI / 2
      d.position.set(s * (L.voidHalf + slabW * 0.55), L.upperY - L.slabT - 0.005, z)
      g.add(d)
    }
    // glass balustrade + brushed aluminium handrail
    const rail = plane(LEN, 1.02, M.glass(), g)
    rail.rotation.y = Math.PI / 2
    rail.position.set(s * (L.voidHalf + 0.05), L.upperY + 0.53, ZC)
    rail.userData.noShadow = true
    box(0.07, 0.05, LEN, alu, s * (L.voidHalf + 0.05), L.upperY + 1.07, ZC, g)
    // shop line wall above the upper storefronts, ceiling over the walkways
    const wall = plane(LEN, L.eaveY - 8.4, plaster, g)
    wall.rotation.y = -s * Math.PI / 2
    wall.position.set(s * L.shopX, 8.4 + (L.eaveY - 8.4) / 2, ZC)
    const ceil = plane(W - L.voidHalf, LEN, mat('#FAF8F3', { roughness: 1, side: THREE.DoubleSide }), g)
    ceil.rotation.x = Math.PI / 2
    ceil.position.set(s * (L.voidHalf + (W - L.voidHalf) / 2), L.eaveY, ZC)
    ceil.userData.noCast = true
    // stone cornice at the eave
    box(0.5, 0.35, LEN, white, s * (L.voidHalf + 0.1), L.eaveY - 0.1, ZC, g)
    // structural columns at the atrium edge and pilasters on the shop line
    for (let z = 0; z >= -63; z -= L.columnStep) {
      box(0.6, L.eaveY, 0.6, stone, s * (L.voidHalf + 0.35), L.eaveY / 2, z, g)
      box(0.08, L.eaveY - 0.4, 0.62, oak, s * (L.voidHalf + 0.02), (L.eaveY - 0.4) / 2, z, g).userData.noCast = true
      box(0.9, L.upperY, 0.9, stone, s * (L.shopX - 0.2), L.upperY / 2, z, g)
      box(0.9, 8.4 - L.upperY, 0.9, stone, s * (L.shopX - 0.2), (8.4 + L.upperY) / 2, z, g)
      addRect({ x0: s * (L.voidHalf + 0.35) - 0.35, x1: s * (L.voidHalf + 0.35) + 0.35, z0: z - 0.35, z1: z + 0.35 })
    }
  })

  // glass gable roof over the atrium: white rafters every 3 m, ridge and purlins
  const rise = L.ridgeY - L.eaveY
  const slope = Math.hypot(L.voidHalf, rise)
  const ang = Math.atan2(rise, L.voidHalf)
  ;[-1, 1].forEach((s) => {
    const gl = plane(slope, LEN, M.glass(), g)
    gl.rotation.set(-Math.PI / 2, 0, 0)
    gl.position.set((s * L.voidHalf) / 2, L.eaveY + rise / 2, ZC)
    gl.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -s * ang)
    gl.userData.noShadow = true
    for (const f of [0.33, 0.66]) {
      const p = box(0.08, 0.1, LEN, white, s * L.voidHalf * (1 - f), L.eaveY + rise * f + 0.02, ZC, g)
      p.userData.noReceive = true
    }
  })
  for (let z = L.entranceZ; z >= L.endZ; z -= 3) {
    ;[-1, 1].forEach((s) => {
      const r = box(slope, 0.2, 0.12, white, (s * L.voidHalf) / 2, L.eaveY + rise / 2 - 0.08, z, g)
      r.rotation.z = -s * ang
      r.userData.noReceive = true
    })
  }
  box(0.18, 0.22, LEN, white, 0, L.ridgeY - 0.06, ZC, g)

  // sky dome seen through the glass
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 24, 12), new THREE.MeshBasicMaterial({ map: skyTex(), side: THREE.BackSide, fog: false, depthWrite: false }))
  sky.position.set(0, -40, ZC)
  sky.userData.noShadow = true
  g.add(sky)

  // glass end walls: entrance behind the shopper, sunlit garden at the far end
  ;[
    { z: L.entranceZ, face: Math.PI },
    { z: L.endZ, face: 0 },
  ].forEach(({ z, face }) => {
    const outside = plane(W * 2.2, L.eaveY + 2, basic(exteriorTex(), { fog: false }), g)
    outside.position.set(0, (L.eaveY + 2) / 2 - 0.4, z + (face ? 1.2 : -1.2))
    outside.rotation.y = face
    outside.userData.noShadow = true
    const gls = plane(W * 2, L.ridgeY, M.glass(), g)
    gls.position.set(0, L.ridgeY / 2, z)
    gls.userData.noShadow = true
    for (let x = -W; x <= W + 0.01; x += (W * 2) / 8) box(0.1, L.ridgeY, 0.14, alu, x, L.ridgeY / 2, z, g)
    for (const y of [3.2, 7.6, L.eaveY]) box(W * 2, 0.1, 0.14, alu, 0, y, z, g)
  })

  enableShadows(g)
  mergeStatic(g)
  // bounds of the walkable ground floor
  addRect({ x0: -99, x1: 99, z0: L.entranceZ - 1.4, z1: 99 })
  addRect({ x0: -99, x1: 99, z0: -99, z1: L.endZ + 1.4 })
  return g
}

export function MallArchitecture() {
  const group = useMemo(buildArchitecture, [])
  return <primitive object={group} />
}
