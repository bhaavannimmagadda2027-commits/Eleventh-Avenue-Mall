import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FRIENDS, FRIEND_BY_ID } from '../../data/social'
import { HALLS } from '../../data/storeLayout'
import { STORE_BY_ID } from '../../data/stores'
import { L } from '../../data/layout'
import { reduceMotion } from '../../lib/input'
import { cartPose } from '../cart/CartRig'
import { useMall } from '../../state/useMall'

const texCache: Record<string, THREE.CanvasTexture> = {}
/** A round initial with a name tag under it: the only sign of a friend in the 3D mall. */
function markerTex(id: string) {
  if (texCache[id]) return texCache[id]
  const f = FRIEND_BY_ID[id]
  const c = document.createElement('canvas')
  c.width = 160; c.height = 220
  const g = c.getContext('2d')!
  g.shadowColor = 'rgba(38,38,38,0.25)'; g.shadowBlur = 10; g.shadowOffsetY = 3
  g.fillStyle = '#FFFFFF'
  g.beginPath(); g.arc(80, 74, 62, 0, Math.PI * 2); g.fill()
  g.shadowColor = 'transparent'
  g.fillStyle = f.tint
  g.beginPath(); g.arc(80, 74, 54, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#FFFFFF'
  g.font = '600 60px Inter, system-ui, sans-serif'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(f.name[0], 80, 78)
  // name tag
  g.font = '600 26px Inter, system-ui, sans-serif'
  const w = g.measureText(f.name).width + 28
  g.fillStyle = 'rgba(255,255,255,0.92)'
  g.beginPath(); g.roundRect(80 - w / 2, 160, w, 40, 20); g.fill()
  g.fillStyle = '#262626'
  g.fillText(f.name, 80, 181)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return (texCache[id] = t)
}

/** Where a friend who isn't following you stands in a place. */
function restingSpot(id: string, at: string): [number, number] {
  const k = FRIENDS.findIndex((f) => f.id === id)
  const h = HALLS[at]
  if (h) return [h.ox + (k % 2 ? 1 : -1) * 0.9, h.spawnZ - 8 - k * 2.5]
  const st = STORE_BY_ID[at]
  if (st && !st.level) return [st.side * (L.shopX - 2.4), st.z]
  return [(k % 2 ? 1 : -1) * 3.5, -12 - k * 3]
}

function Marker({ id }: { id: string }) {
  const g = useRef<THREE.Group>(null)
  const sprite = useMemo(() => new THREE.SpriteMaterial({ map: markerTex(id), toneMapped: false, fog: false, transparent: true, opacity: 0, depthWrite: false }), [id])
  const shadow = useMemo(() => new THREE.MeshBasicMaterial({ color: '#262626', transparent: true, opacity: 0, depthWrite: false }), [])
  const st = useRef({ x: 0, z: 0, placed: false, at: '' })
  useFrame((state, rawDt) => {
    const dt = Math.min(0.05, rawDt)
    const s = useMall.getState()
    const p = s.presence[id]
    const here = s.view === 'mall' && p?.status === 'online' && p.at === s.location && !s.fading
    const r = st.current
    if (!here) { sprite.opacity = 0; shadow.opacity = 0; r.placed = false; if (g.current) g.current.visible = false; return }
    const follow = s.session?.with === id
    let tx: number, tz: number
    if (follow) {
      const fx = -Math.sin(cartPose.yaw), fz = -Math.cos(cartPose.yaw)
      tx = cartPose.x + fx * 3.4 - (-fz) * 1.0
      tz = cartPose.z + fz * 3.4 - fx * 1.0
      const h = HALLS[s.location]
      if (h) tx = THREE.MathUtils.clamp(tx, h.ox - h.half + 1.5, h.ox + h.half - 1.5)
    } else [tx, tz] = restingSpot(id, s.location)
    if (!r.placed || r.at !== s.location) { r.x = tx; r.z = tz; r.placed = true; r.at = s.location }
    const k = 1 - Math.exp(-dt * 2.2)
    r.x += (tx - r.x) * k; r.z += (tz - r.z) * k
    sprite.opacity = Math.min(1, sprite.opacity + dt * 2)
    shadow.opacity = sprite.opacity * 0.12
    if (!g.current) return
    g.current.visible = true
    const bob = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.6 + id.length) * 0.04
    g.current.position.set(r.x, 0, r.z)
    g.current.children[0].position.y = 1.66 + bob
  })
  return (
    <group ref={g} visible={false}>
      <sprite material={sprite} scale={[0.38, 0.52, 1]} renderOrder={5} />
      <mesh material={shadow} rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[0.28, 24]} />
      </mesh>
    </group>
  )
}

/** Friends appear only when they are in the same place as you, as one small marker each. */
export function FriendMarkers() {
  return <>{FRIENDS.map((f) => <Marker key={f.id} id={f.id} />)}</>
}
