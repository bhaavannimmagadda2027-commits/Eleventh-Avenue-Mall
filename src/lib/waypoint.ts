import { L } from '../data/layout'
import { SECTION_LABEL } from '../data/products'
import { HALLS } from '../data/storeLayout'
import { TATA_STORES } from '../data/stores'
import { INTERIORS, useMall } from '../state/useMall'

export type Waypoint = { key: string; label: string; x: number; z: number; rel: number; dist: number; go: () => void }
type Pose = { x: number; z: number; yaw: number }

/** Where the floor arrows point. Written by the HUD, read by the 3D scene. */
export const way = { x: 0, z: 0, on: false }

const CART_AHEAD = 2.3
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

type Target = { key: string; label: string; x: number; z: number; go: () => void }

function targets(location: string): Target[] {
  const m = useMall.getState()
  if (location === 'lobby') {
    return TATA_STORES.filter((s) => s.level === 0 && INTERIORS.includes(s.id)).map((s) => ({
      key: s.id, label: s.name, x: s.side * (L.shopX - 1.4), z: s.z, go: () => m.travelTo(s.id, true),
    }))
  }
  const hall = HALLS[location]
  if (!hall) return []
  return hall.runs.map((r) => {
    const last = r.z0 - r.bay * r.products.length
    return {
      key: r.section, label: SECTION_LABEL[r.section], x: hall.ox + r.side * (hall.half - hall.depth - 0.7), z: (r.z0 + last) / 2,
      go: () => m.seekProduct(r.products[0], 'preview'),
    }
  })
}

/** The next place worth going: the store you face, or the closest store or aisle section ahead. */
export function computeWaypoint(location: string, nearStoreId: string | null, p: Pose): Waypoint | null {
  const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw)
  const cx = p.x + fx * CART_AHEAD, cz = p.z + fz * CART_AHEAD
  const list = targets(location).map((t) => {
    const dx = t.x - cx, dz = t.z - cz, dist = Math.hypot(dx, dz)
    return { t, dx, dz, dist, dot: (dx * fx + dz * fz) / (dist || 1) }
  })
  if (!list.length) return null
  const near = nearStoreId ? list.find((o) => o.t.key === nearStoreId) : undefined
  const open = list.filter((o) => o.dist > 5)
  const ahead = (open.filter((o) => o.dot > 0.8).sort((a, b) => a.dist - b.dist)[0]) ?? open.filter((o) => o.dot > 0.25).sort((a, b) => b.dot - a.dot)[0]
  const best = near ?? ahead ?? [...list].sort((a, b) => b.dist - a.dist)[0]
  return { ...best.t, dist: best.dist, rel: wrap(Math.atan2(-best.dx, -best.dz) - p.yaw) }
}
