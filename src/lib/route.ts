import type { Store } from '../data/stores'

export type Pt = { x: number; z: number }

export const LANE = 4.6 // clear walking lanes either side of the atrium axis
export const CROSS_Z = [2, -11.6, -21, -40.5, -53, -63, -72, -90, -102, -120] // where the atrium axis is free to cross

/**
 * The path NEU CART drives from where it is to a storefront: across the atrium at a free crossing if
 * the store is on the other side, then along that side's lane. The map draws this same path.
 */
export function planRoute(from: Pt, st: Store): { pts: Pt[]; yawEnd: number } {
  const side = st.side
  const pts: Pt[] = []
  const laneX = side * LANE
  if (Math.sign(from.x) !== side && Math.abs(from.x) > 2.2) {
    const cz = CROSS_Z.reduce((a, b) => (Math.abs(b - from.z) < Math.abs(a - from.z) ? b : a))
    const ownLane = Math.sign(from.x) * LANE
    pts.push({ x: ownLane, z: from.z }, { x: ownLane, z: cz }, { x: laneX, z: cz })
  } else if (Math.abs(from.x - laneX) > 0.4) {
    pts.push({ x: laneX, z: from.z })
  }
  if (st.level === 0) {
    pts.push({ x: laneX, z: st.z })
    return { pts, yawEnd: -side * Math.PI / 2 }
  }
  // first floor: stop below the shop, looking up at it
  pts.push({ x: laneX, z: st.z + 6 })
  return { pts, yawEnd: -side * 0.9 }
}
