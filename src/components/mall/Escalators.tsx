import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { L, addRect } from '../../data/layout'
import { stepsTex } from '../../lib/textures'
import { M, box, enableShadows, plane, mergeStatic } from './build'

/** Paired escalators rising to a glass-railed bridge across the atrium. */
export function Escalators() {
  const { group, steps } = useMemo(() => {
    const g = new THREE.Group()
    const { z0, z1, x } = L.escalators
    const run = z0 - z1, rise = L.upperY
    const len = Math.hypot(run, rise), ang = Math.atan2(rise, run)
    const steps = stepsTex().clone()
    steps.needsUpdate = true
    steps.repeat.set(1, len / 0.4)
    ;[-1, 1].forEach((s) => {
      const e = new THREE.Group()
      e.position.set(s * x, rise / 2, (z0 + z1) / 2)
      e.rotation.x = ang
      g.add(e)
      box(1.2, 0.55, len + 0.6, M.alu(), 0, -0.3, 0, e)
      const tread = plane(0.92, len + 0.6, new THREE.MeshStandardMaterial({ map: steps, roughness: 0.5, metalness: 0.4 }), e)
      tread.rotation.x = -Math.PI / 2
      tread.position.y = -0.02
      ;[-1, 1].forEach((k) => {
        const gl = plane(len + 0.6, 0.92, M.glass(), e)
        gl.rotation.y = Math.PI / 2
        gl.position.set(k * 0.53, 0.46, 0)
        gl.userData.noShadow = true
        box(0.07, 0.06, len + 0.9, M.charcoal(), k * 0.53, 0.94, 0, e)
        box(0.05, 0.12, len + 0.6, M.alu(), k * 0.53, 0.03, 0, e)
      })
    })
    // landing plates
    ;[-1, 1].forEach((s) => box(1.2, 0.04, 1.4, M.alu(), s * x, 0.02, z0 + 0.7, g).userData.noCast = true)
    // the bridge
    const bz = L.bridgeZ, bw = 4.4
    box(L.voidHalf * 2, L.slabT, bw, M.stone(), 0, L.upperY - L.slabT / 2, bz, g)
    box(L.voidHalf * 2, 0.1, 0.06, M.oak(), 0, L.upperY - L.slabT + 0.12, bz + bw / 2 + 0.03, g)
    box(L.voidHalf * 2, 0.1, 0.06, M.oak(), 0, L.upperY - L.slabT + 0.12, bz - bw / 2 - 0.03, g)
    const railFar = plane(L.voidHalf * 2, 1.02, M.glass(), g)
    railFar.position.set(0, L.upperY + 0.53, bz - bw / 2)
    railFar.userData.noShadow = true
    box(L.voidHalf * 2, 0.05, 0.07, M.alu(), 0, L.upperY + 1.07, bz - bw / 2, g)
    ;[-1, 1].forEach((s) => {
      const segW = L.voidHalf - x - 0.75
      const r = plane(segW, 1.02, M.glass(), g)
      r.position.set(s * (L.voidHalf - segW / 2), L.upperY + 0.53, bz + bw / 2)
      r.userData.noShadow = true
      box(segW, 0.05, 0.07, M.alu(), s * (L.voidHalf - segW / 2), L.upperY + 1.07, bz + bw / 2, g)
    })
    enableShadows(g)
    mergeStatic(g)
    addRect({ x0: -x - 0.75, x1: x + 0.75, z0: z1 - 0.2, z1: z0 + 1.6 })
    return { group: g, steps }
  }, [])

  useFrame((_, dt) => { steps.offset.y -= dt * 0.5 })
  return <primitive object={group} />
}
