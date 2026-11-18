import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Small helpers for building static architecture imperatively (fast to build, one draw per mesh).
const matCache = new Map<string, THREE.MeshStandardMaterial>()
export function mat(color: string, o: THREE.MeshStandardMaterialParameters = {}) {
  const k = color + JSON.stringify(o)
  let m = matCache.get(k)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o })
    matCache.set(k, m)
  }
  return m
}

export const M = {
  stone: () => mat('#F2EEE6', { roughness: 0.55 }),
  plaster: () => mat('#F7F4EE', { roughness: 0.9 }),
  oak: () => mat('#D9C5A5', { roughness: 0.55 }),
  wood: () => mat('#BFA887', { roughness: 0.6 }),
  alu: () => mat('#C9CBCC', { roughness: 0.32, metalness: 0.75 }),
  white: () => mat('#FBFBF9', { roughness: 0.45 }),
  ceramic: () => mat('#F4F2EE', { roughness: 0.25 }),
  glass: () => mat('#E3EFF2', { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
  linen: () => mat('#E9E3D8', { roughness: 0.95 }),
  charcoal: () => mat('#2A2A2C', { roughness: 0.4 }),
}

export function box(w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.position.set(x, y, z)
  parent.add(mesh)
  return mesh
}

export function plane(w: number, h: number, m: THREE.Material, parent: THREE.Object3D) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m)
  parent.add(mesh)
  return mesh
}

export const basic = (map: THREE.Texture, o: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ map, ...o })

/** Mark solid meshes so they cast/receive the daylight shadows. Glass and sky are skipped. */
export function enableShadows(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || o.userData.noShadow) return
    const material = m.material as THREE.Material
    if (material.transparent) return
    m.receiveShadow = !o.userData.noReceive
    // flat signs and screens (unlit) never need to cast
    m.castShadow = !o.userData.noCast && !(material as THREE.MeshBasicMaterial).isMeshBasicMaterial
  })
}

/** Walk up from a hit mesh to find interaction data (store / ad / directory). */
export function findTag(o: THREE.Object3D | null): Record<string, unknown> | null {
  while (o) {
    if (o.userData.storeId || o.userData.adId || o.userData.directory || o.userData.productId) return o.userData
    o = o.parent
  }
  return null
}

/**
 * Merge static meshes that share a material into one draw call each.
 * Meshes that carry interaction data, are transparent, or have a unique material are left alone.
 */
export function mergeStatic(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert()
  const uses = new Map<THREE.Material, number>()
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && !(m as THREE.InstancedMesh).isInstancedMesh) uses.set(m.material as THREE.Material, (uses.get(m.material as THREE.Material) ?? 0) + 1)
  })
  const buckets = new Map<string, { mat: THREE.Material; cast: boolean; recv: boolean; meshes: THREE.Mesh[] }>()
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || (m as THREE.InstancedMesh).isInstancedMesh) return
    const mat = m.material as THREE.Material
    if (Array.isArray(m.material) || mat.transparent || (uses.get(mat) ?? 0) < 2) return
    if (m.userData.storeId || m.userData.adId || m.userData.keep) return
    const k = `${mat.uuid}|${m.castShadow}|${m.receiveShadow}`
    let b = buckets.get(k)
    if (!b) buckets.set(k, (b = { mat, cast: m.castShadow, recv: m.receiveShadow, meshes: [] }))
    b.meshes.push(m)
  })
  for (const b of buckets.values()) {
    if (b.meshes.length < 2) continue
    const geos = b.meshes.map((m) => {
      const g = m.geometry.clone()
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld))
      for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name)
      return g.index ? g.toNonIndexed() : g
    })
    const merged = mergeGeometries(geos, false)
    if (!merged) continue
    b.meshes.forEach((m) => m.parent?.remove(m))
    const mesh = new THREE.Mesh(merged, b.mat)
    mesh.castShadow = b.cast
    mesh.receiveShadow = b.recv
    root.add(mesh)
  }
}
