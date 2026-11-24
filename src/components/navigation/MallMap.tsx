import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, MagnifyingGlass, Minus, NavigationArrow, Plus } from '@phosphor-icons/react'
import { cartPose } from '../cart/CartRig'
import { CATEGORIES, CATEGORY, type CategoryId } from '../../data/categories'
import { L } from '../../data/layout'
import { STORE_BY_ID, type Store } from '../../data/stores'
import { planRoute, type Pt } from '../../lib/route'
import { INTERIORS, useCurrentMall, useMall } from '../../state/useMall'
import { Button, cx } from '../ui/primitives'

// The plan uses the mall's own metres: x across the hall, z along it (entrance at the bottom),
// so the map, the 3D mall and NEU CART's routes all share one coordinate system.
const BAY = 4.4 // half a shop bay along the hall
const DEPTH = 6 // how far a shop runs back from the shopfront
const HALL_W = L.shopX + DEPTH + 1

const TINT: Partial<Record<CategoryId, string>> = {
  grocery: '#E6EEDC', staples: '#F2E6CC', beauty: '#F5E2E7', electronics: '#E1E8F1', fashion: '#EEE6DA',
  accessories: '#EFE3D6', kids: '#F4ECD3', home: '#E8E3DA', jewellery: '#F1E7CF', watches: '#E6E4DF',
  health: '#DDEEEA', dining: '#ECE2D5', supplies: '#F1EBCF', services: '#E3E6EC',
}

/** Where NEU CART is on the plan: its live spot in the lobby, or the door of the store it is in. */
function cartSpot(loc: string): Pt & { yaw: number } {
  if (loc === 'lobby') return { x: cartPose.x, z: cartPose.z, yaw: cartPose.yaw }
  const st = STORE_BY_ID[loc]
  return st ? { x: st.side * 6, z: st.z, yaw: st.side * Math.PI / 2 } : { x: 0, z: L.spawn.z, yaw: 0 }
}

const routeLength = (from: Pt, pts: Pt[]) => pts.reduce((d, p, i) => { const a = i ? pts[i - 1] : from; return d + Math.hypot(p.x - a.x, p.z - a.z) }, 0)

function nameLines(name: string) {
  const words = name.split(' ')
  const lines: string[] = []
  for (const w of words) {
    const last = lines[lines.length - 1]
    if (last && (last + ' ' + w).length <= 9) lines[lines.length - 1] = last + ' ' + w
    else lines.push(w)
  }
  return lines.slice(0, 3)
}

function StoreBlock({ st, selected, dim, onPick }: { st: Store; selected: boolean; dim: boolean; onPick: () => void }) {
  const x0 = st.side < 0 ? -L.shopX - DEPTH : L.shopX
  const lines = nameLines(st.name)
  const cx0 = x0 + DEPTH / 2
  return (
    <g onClick={onPick} className="cursor-pointer" opacity={dim ? 0.3 : 1} role="button" aria-label={st.name}>
      <rect x={x0 + 0.2} y={st.z - BAY + 0.2} width={DEPTH - 0.4} height={BAY * 2 - 0.4} rx={0.6}
        fill={selected ? '#5F4FA3' : TINT[st.category] ?? '#EEE8DE'} stroke={selected ? '#5F4FA3' : '#D6CDBE'} strokeWidth={0.12} />
      {lines.map((t, i) => (
        <text key={i} x={cx0} y={st.z + (i - (lines.length - 1) / 2) * 1.25 + 0.4} textAnchor="middle" fontSize={1.05} fontWeight={600}
          fill={selected ? '#FFFFFF' : '#262626'} style={{ pointerEvents: 'none' }}>{t}</text>
      ))}
    </g>
  )
}

/** Full mall map: zoom, pan, pick a store, see the route NEU CART will take, then start navigation. */
export function MallMap({ initial }: { initial?: string }) {
  const mall = useCurrentMall()
  const loc = useMall((s) => s.location)
  const [floor, setFloor] = useState<0 | 1>(() => (initial && STORE_BY_ID[initial]?.level === 1 ? 1 : 0))
  const [sel, setSel] = useState<string | null>(initial ?? null)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CategoryId | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const cartG = useRef<SVGGElement>(null)
  const [size, setSize] = useState({ w: 360, h: 420 })
  const start = cartSpot(loc)
  const [view, setView] = useState(() => ({ cx: 0, cy: initial ? STORE_BY_ID[initial]?.z ?? start.z : start.z - 10, w: HALL_W * 2 + 4 }))

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // NEU CART's marker follows the cart live
  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = cartSpot(useMall.getState().location)
      cartG.current?.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.z.toFixed(2)}) rotate(${(-p.yaw * 180 / Math.PI).toFixed(1)})`)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const h = view.w * (size.h / Math.max(1, size.w))
  const zoom = (k: number) => setView((v) => ({ ...v, w: Math.min(HALL_W * 2 + 40, Math.max(10, v.w * k)) }))

  // drag to pan, pinch or wheel to zoom
  const ptrs = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef(0)
  const dragged = useRef(0)
  const onDown = (e: React.PointerEvent) => { if (!ptrs.current.size) dragged.current = 0; ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY }) }
  const onMove = (e: React.PointerEvent) => {
    const prev = ptrs.current.get(e.pointerId)
    if (!prev) return
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    dragged.current += Math.hypot(e.clientX - prev.x, e.clientY - prev.y)
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch.current) zoom(pinch.current / d)
      pinch.current = d
      return
    }
    const k = view.w / size.w
    setView((v) => ({ ...v, cx: v.cx - (e.clientX - prev.x) * k, cy: v.cy - (e.clientY - prev.y) * k }))
  }
  const onUp = (e: React.PointerEvent) => { ptrs.current.delete(e.pointerId); pinch.current = 0 }

  const t = q.trim().toLowerCase()
  const match = (s: Store) => (!t || `${s.name} ${s.tagline} ${CATEGORY[s.category].label}`.toLowerCase().includes(t)) && (!cat || s.category === cat)
  const stores = mall.stores.filter((s) => s.level === floor)
  const hits = mall.stores.filter((s) => (t || cat) && match(s))
  const selStore = sel ? STORE_BY_ID[sel] : null
  const route = useMemo(() => (selStore ? planRoute(start, selStore) : null), [selStore, start.x, start.z]) // eslint-disable-line react-hooks/exhaustive-deps
  const dist = route ? Math.round(routeLength(start, route.pts)) : 0
  const cats = CATEGORIES.filter((c) => mall.stores.some((s) => s.category === c.id))

  const pick = (id: string) => {
    const st = STORE_BY_ID[id]
    setSel(id)
    if (st.level !== floor) setFloor(st.level as 0 | 1)
    // frame the whole route: from NEU CART to the store
    const span = Math.abs(st.z - start.z) + 18
    setView(() => ({ cx: 0, cy: (st.z + start.z) / 2, w: Math.min(HALL_W * 2 + 40, Math.max(HALL_W * 2 + 4, span * (size.w / Math.max(1, size.h)))) }))
  }
  const here = loc === 'lobby' ? 'Main hall' : STORE_BY_ID[loc]?.name ?? 'Main hall'

  return (
    <div className="flex flex-col gap-3 pb-2">
      <label className="flex h-11 items-center gap-2 rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
        <MagnifyingGlass size={18} className="text-ink-2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a store or category" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3" />
      </label>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setCat((x) => (x === c.id ? null : c.id))} aria-pressed={cat === c.id}
            className={cx('flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors duration-300', cat === c.id ? 'bg-[#5F4FA3] text-white' : 'bg-surface text-ink shadow-[var(--shadow-soft)]')}>
            <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: TINT[c.id] }} />{c.label}
          </button>
        ))}
      </div>
      {hits.length > 0 && !sel && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {hits.slice(0, 12).map((s) => (
            <button key={s.id} onClick={() => pick(s.id)} className="h-8 shrink-0 rounded-full bg-ink px-3 text-xs font-semibold text-on-ink">{s.name}</button>
          ))}
        </div>
      )}

      <div ref={box} className="relative h-[46vh] min-h-[280px] touch-none overflow-hidden rounded-2xl bg-[#F6F1E8] shadow-[var(--shadow-soft)]"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}
        onClickCapture={(e) => { if (dragged.current > 6) e.stopPropagation() }}
        onWheel={(e) => zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12)}>
        <svg viewBox={`${view.cx - view.w / 2} ${view.cy - h / 2} ${view.w} ${h}`} className="block h-full w-full select-none" role="img" aria-label="Mall floor plan">
          {/* hall shell, central walkway and landmarks */}
          <rect x={-HALL_W} y={L.endZ} width={HALL_W * 2} height={L.entranceZ - L.endZ} rx={1.5} fill="#FBF8F2" stroke="#D8D0C2" strokeWidth={0.2} />
          <rect x={-L.shopX + 0.3} y={L.endZ + 0.5} width={L.shopX * 2 - 0.6} height={L.entranceZ - L.endZ - 1} rx={1} fill="#F1EBE0" />
          <circle cx={L.fountain.x} cy={L.fountain.z} r={L.fountain.r} fill="#DCE8EE" stroke="#C9D7DE" strokeWidth={0.15} />
          {floor === 0 && <rect x={-L.escalators.x - 0.9} y={L.escalators.z1} width={(L.escalators.x + 0.9) * 2} height={L.escalators.z0 - L.escalators.z1} rx={0.4} fill="#E4DDD1" />}
          <text x={0} y={L.entranceZ - 1} textAnchor="middle" fontSize={1.1} fontWeight={600} fill="#777873">ENTRANCE</text>
          {floor === 1 && <text x={0} y={L.entranceZ - 3} textAnchor="middle" fontSize={0.95} fill="#777873">First floor gallery</text>}

          {stores.map((s) => <StoreBlock key={s.id} st={s} selected={s.id === sel} dim={!match(s)} onPick={() => pick(s.id)} />)}

          {route && selStore?.level === floor && (
            <polyline points={[start, ...route.pts].map((p) => `${p.x},${p.z}`).join(' ')} fill="none" stroke="#5F4FA3" strokeWidth={0.55} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.2 0.8" />
          )}
          {floor === 0 && (
            <g ref={cartG}>
              <circle r={1.6} fill="#5F4FA3" opacity={0.18} />
              <path d="M0 -1.3 L0.85 0.8 L0 0.35 L-0.85 0.8 Z" fill="#5F4FA3" />
            </g>
          )}
        </svg>

        <div className="pointer-events-none absolute left-2 top-2 flex gap-1 rounded-full bg-white/90 p-1 shadow-[var(--shadow-soft)]">
          {(['Ground', 'First'] as const).map((f, i) => (
            <button key={f} onPointerDown={(e) => e.stopPropagation()} onClick={() => setFloor(i as 0 | 1)} aria-pressed={floor === i}
              className={cx('pointer-events-auto h-7 rounded-full px-3 text-xs font-semibold transition-colors duration-300', floor === i ? 'bg-ink text-on-ink' : 'text-ink-2')}>{f} floor</button>
          ))}
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => zoom(1 / 1.4)} aria-label="Zoom in" className="grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-[var(--shadow-soft)] active:scale-[0.97]"><Plus size={16} /></button>
          <button onClick={() => zoom(1.4)} aria-label="Zoom out" className="grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-[var(--shadow-soft)] active:scale-[0.97]"><Minus size={16} /></button>
          <button onClick={() => { const p = cartSpot(useMall.getState().location); setFloor(0); setView((v) => ({ ...v, cx: p.x, cy: p.z })) }} aria-label="Show where I am" className="grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-[var(--shadow-soft)] active:scale-[0.97]"><Crosshair size={16} /></button>
        </div>
      </div>

      {selStore ? (
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-soft)]">
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-product font-semibold">{selStore.name}</span>
            <span className="text-support text-ink-2">
              {CATEGORY[selStore.category].label} · {selStore.level ? 'First floor' : 'Ground floor'} · {dist} m from {here}
            </span>
            {!INTERIORS.includes(selStore.id) && <span className="block text-support text-ink-3">Storefront only in this prototype</span>}
          </span>
          <Button size="md" trailingIcon={NavigationArrow} onClick={() => useMall.getState().travelTo(selStore.id, true)}>Start navigation</Button>
        </div>
      ) : (
        <p className="text-support text-ink-2">You are in the {here.toLowerCase() === 'main hall' ? 'main hall' : here}. Tap a store to see the route.</p>
      )}
    </div>
  )
}
