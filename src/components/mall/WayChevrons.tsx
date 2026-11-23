import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { cartPose } from '../cart/CartRig'
import { way } from '../../lib/waypoint'
import { reduceMotion } from '../../lib/input'

const COUNT = 7
const STEP = 0.82
const START = 3.35 // metres ahead of the camera: just past the cart's nose

/** Glowing arrows on the floor, running from the cart toward the next destination. */
export function WayChevrons() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.46, -0.1); s.lineTo(0, 0.12); s.lineTo(0.46, -0.1); s.lineTo(0.46, -0.19); s.lineTo(0, 0.03); s.lineTo(-0.46, -0.19); s.closePath()
    const g = new THREE.ShapeGeometry(s)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [])
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color() }), [])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    m.visible = way.on
    if (!way.on) return
    const fx = -Math.sin(cartPose.yaw), fz = -Math.cos(cartPose.yaw)
    const sx = cartPose.x + fx * START, sz = cartPose.z + fz * START
    const dx = way.x - sx, dz = way.z - sz, d = Math.hypot(dx, dz) || 1
    // leave the cart straight ahead, then bend toward the destination
    const reach = Math.min(d, COUNT * STEP)
    const ex = sx + (dx / d) * reach, ez = sz + (dz / d) * reach
    const cx = sx + fx * reach * 0.6, cz = sz + fz * reach * 0.6
    const t = reduceMotion ? 0 : clock.elapsedTime * 1.6
    for (let i = 0; i < COUNT; i++) {
      const at = i * STEP
      const shown = at < d
      const k = at / reach, q = 1 - k
      const px = q * q * sx + 2 * q * k * cx + k * k * ex, pz = q * q * sz + 2 * q * k * cz + k * k * ez
      const tx = 2 * q * (cx - sx) + 2 * k * (ex - cx), tz = 2 * q * (cz - sz) + 2 * k * (ez - cz)
      tmp.o.position.set(px, 0.022, pz)
      tmp.o.rotation.set(0, Math.atan2(-tx, -tz), 0)
      tmp.o.scale.setScalar(shown ? 1 - i * 0.07 : 0)
      tmp.o.updateMatrix()
      m.setMatrixAt(i, tmp.o.matrix)
      const wave = reduceMotion ? 0.7 : 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * 2 - i * 0.9), 2)
      tmp.c.set('#8FC0FF').multiplyScalar((0.35 + wave) * (1 - i / (COUNT + 3)))
      m.setColorAt(i, tmp.c)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geo, mat, COUNT]} frustumCulled={false} renderOrder={2} />
}
