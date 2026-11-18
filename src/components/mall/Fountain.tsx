import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { L, addCircle } from '../../data/layout'
import { canvasTex, inlayTex, rng, waterTex } from '../../lib/textures'
import { enableShadows, mat } from './build'

const stoneMat = () => mat('#E6DED0', { roughness: 0.5 })

/** A small natural-stone fountain: a landmark, not a monument. */
export function Fountain() {
  const { group, water, sheet } = useMemo(() => {
    const g = new THREE.Group()
    const { x, z, r } = L.fountain
    g.position.set(x, 0, z)
    const stone = stoneMat()
    const add = (geo: THREE.BufferGeometry, m: THREE.Material, y: number) => {
      const o = new THREE.Mesh(geo, m)
      o.position.y = y
      g.add(o)
      return o
    }
    // stone surround on the floor
    const ring = add(new THREE.RingGeometry(r + 0.05, r + 0.75, 64), new THREE.MeshStandardMaterial({ map: inlayTex([4, 1]), roughness: 0.35 }), 0.003)
    ring.rotation.x = -Math.PI / 2
    ring.userData.noCast = true
    add(new THREE.CylinderGeometry(r, r + 0.06, 0.48, 64), stone, 0.24)
    const lip = add(new THREE.TorusGeometry(r - 0.04, 0.08, 10, 80), stone, 0.48)
    lip.rotation.x = Math.PI / 2
    const water = waterTex()
    const wm = new THREE.MeshStandardMaterial({ map: water, color: '#D7EBF0', roughness: 0.04, metalness: 0.15, transparent: true, opacity: 0.92 })
    const w1 = add(new THREE.CircleGeometry(r - 0.1, 64), wm, 0.43)
    w1.rotation.x = -Math.PI / 2
    w1.userData.noShadow = true
    add(new THREE.CylinderGeometry(0.26, 0.34, 0.95, 32), stone, 0.9)
    add(new THREE.CylinderGeometry(0.78, 0.28, 0.2, 48), stone, 1.42)
    const w2 = add(new THREE.CircleGeometry(0.72, 48), wm, 1.52)
    w2.rotation.x = -Math.PI / 2
    w2.userData.noShadow = true
    // thin veil of water spilling from the bowl, and a low centre jet
    const sheet = canvasTex('veil', 128, 256, (c, w, h) => {
      const R = rng(4)
      c.clearRect(0, 0, w, h)
      for (let i = 0; i < 70; i++) {
        const xx = R() * w, yy = R() * h, l = 30 + R() * 80
        const lg = c.createLinearGradient(0, yy, 0, yy + l)
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, `rgba(240,250,255,${0.35 + R() * 0.4})`); lg.addColorStop(1, 'rgba(255,255,255,0)')
        c.fillStyle = lg; c.fillRect(xx, yy, 1.5, l); c.fillRect(xx, yy - h, 1.5, l)
      }
    }, { repeat: [6, 1] })
    const sm = new THREE.MeshBasicMaterial({ map: sheet, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide })
    const veil = add(new THREE.CylinderGeometry(0.78, 0.9, 1.08, 48, 1, true), sm, 0.98)
    veil.userData.noShadow = true
    const jet = add(new THREE.CylinderGeometry(0.02, 0.05, 0.5, 10, 1, true), sm, 1.78)
    jet.userData.noShadow = true
    enableShadows(g)
    addCircle({ x, z, r: r + 0.1 })
    return { group: g, water, sheet }
  }, [])

  useFrame((_, dt) => {
    water.offset.x += dt * 0.012
    water.offset.y += dt * 0.008
    sheet.offset.y += dt * 0.9
  })
  return <primitive object={group} />
}
