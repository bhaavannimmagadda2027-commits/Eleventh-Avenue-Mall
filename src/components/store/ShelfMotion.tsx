import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { cartPose } from '../cart/CartRig'
import { HALLS } from '../../data/storeLayout'
import { flushMotion, playEntrance, playPick, playWake, resetMotion } from '../../lib/shelfMotion'
import { useMall } from '../../state/useMall'

const WAKE_AHEAD = 3.4 // metres in front of the cart

/** Connects the shopper's actions to the anime.js shelf motion. */
export function ShelfMotion() {
  const last = useRef({ x: 0, z: 0 })

  useEffect(() => useMall.subscribe((s, p) => {
    if (s.location !== p.location) {
      resetMotion()
      if (s.location !== 'lobby') playEntrance(s.location, HALLS[s.location].spawnZ)
      return
    }
    if (s.location === 'lobby') return
    if (s.preview && s.preview !== p.preview && s.preview.from) {
      const [x, y, z] = s.preview.from
      playPick(s.location, s.preview.id, x, y, z)
    }
    if (s.lastAdd && s.lastAdd.nonce !== p.lastAdd?.nonce) {
      const [x, y, z] = s.preview?.from ?? [cartPose.x, 1.1, cartPose.z]
      playPick(s.location, s.lastAdd.productId, x, y, z)
    }
  }), [])

  useFrame(() => {
    const s = useMall.getState()
    if (s.location !== 'lobby' && !s.fading && s.checkout === 'closed') {
      const l = last.current
      if (Math.hypot(cartPose.x - l.x, cartPose.z - l.z) > 0.25) {
        l.x = cartPose.x; l.z = cartPose.z
        playWake(s.location, cartPose.z - Math.cos(cartPose.yaw) * WAKE_AHEAD)
      }
    }
    flushMotion()
  })
  return null
}
