import { useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { L } from '../../data/layout'
import { raysTex } from '../../lib/textures'
import { box, mat } from './build'

/** Very faint shafts of sunlight falling through the glass roof. */
export function SunRays() {
  const group = useMemo(() => {
    const g = new THREE.Group()
    const m = new THREE.MeshBasicMaterial({ map: raysTex(), transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide, fog: false })
    ;[[-2.5, -3], [2.2, -15], [-1.5, -29], [3, -43], [-2.8, -57]].forEach(([x, z]) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 13), m)
      p.position.set(x, 6.2, z)
      p.rotation.set(0, 0.25, -0.32)
      p.userData.noShadow = true
      g.add(p)
    })
    return g
  }, [])
  return <primitive object={group} />
}

type Walker = { g: THREE.Group; legs: THREE.Group[]; x: number; z0: number; z1: number; speed: number; t: number }

function person(shirt: string, skin: string, trousers: string) {
  const g = new THREE.Group()
  const legs = [-1, 1].map((s) => {
    const pv = new THREE.Group()
    pv.position.set(s * 0.085, 0.86, 0)
    const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.7, 4, 10), mat(trousers, { roughness: 0.8 }))
    l.position.y = -0.42
    pv.add(l)
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.22), mat('#EDEAE4'))
    shoe.position.set(0, -0.83, -0.04)
    pv.add(shoe)
    g.add(pv)
    return pv
  })
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 6, 14), mat(shirt, { roughness: 0.85 }))
  torso.position.y = 1.2
  g.add(torso)
  ;[-1, 1].forEach((s) => {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.5, 4, 8), mat(shirt, { roughness: 0.85 }))
    a.position.set(s * 0.23, 1.18, 0)
    a.rotation.z = s * 0.08
    g.add(a)
  })
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), mat(skin, { roughness: 0.7 }))
  head.position.y = 1.64
  head.scale.set(1, 1.12, 1)
  g.add(head)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.118, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#2E2621'))
  hair.position.y = 1.67
  g.add(hair)
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true })
  return { g, legs }
}

/** A handful of people strolling: enough to feel alive, never crowding the view. */
export function Shoppers() {
  const walkers = useMemo<Walker[]>(() => {
    const spec: [number, number, number, number, string, string, string][] = [
      [-3.9, 2, -60, 0.55, '#E8E2D6', '#C48A62', '#5B6470'],
      [3.8, -62, 0, 0.5, '#9DB0C3', '#A86F4D', '#3F4652'],
      [8.8, -8, -66, 0.45, '#D8C3A5', '#D9A27C', '#6B5E52'],
      [-8.9, -60, -2, 0.5, '#B9C7B4', '#8D5A3C', '#45484F'],
      [-4.4, -40, -18, 0.42, '#F1ECE3', '#C99372', '#7B6E62'],
      [4.2, -20, -52, 0.5, '#C9A99A', '#B07A55', '#3D4148'],
    ]
    return spec.map(([x, z0, z1, speed, shirt, skin, tr]) => {
      const { g, legs } = person(shirt, skin, tr)
      g.position.set(x, 0, z0)
      return { g, legs, x, z0, z1, speed, t: Math.random() * 30 }
    })
  }, [])
  const group = useMemo(() => {
    const g = new THREE.Group()
    walkers.forEach((w) => g.add(w.g))
    return g
  }, [walkers])

  useFrame((_, dt) => {
    for (const w of walkers) {
      w.t += dt * w.speed
      const span = Math.abs(w.z1 - w.z0)
      const ph = w.t % (2 * span)
      const fwd = ph < span
      const along = fwd ? ph : 2 * span - ph
      w.g.position.set(w.x + Math.sin(w.t * 0.4) * 0.25, Math.abs(Math.sin(w.t * 6.5)) * 0.012, w.z0 + Math.sign(w.z1 - w.z0) * along)
      const towardNegZ = fwd ? w.z1 < w.z0 : w.z1 > w.z0
      w.g.rotation.y = towardNegZ ? 0 : Math.PI
      const sw = Math.sin(w.t * 6.5) * 0.35
      w.legs[0].rotation.x = sw
      w.legs[1].rotation.x = -sw
    }
  })
  return <primitive object={group} />
}

/** Plinth for future kiosks; kept tiny so the lobby floor stays open. */
export function EntranceMat() {
  const group = useMemo(() => {
    const g = new THREE.Group()
    const m = box(5, 0.012, 2.2, mat('#CFC7B8', { roughness: 0.95 }), 0, 0.006, L.entranceZ - 1.6, g)
    m.receiveShadow = true
    return g
  }, [])
  return <primitive object={group} />
}
