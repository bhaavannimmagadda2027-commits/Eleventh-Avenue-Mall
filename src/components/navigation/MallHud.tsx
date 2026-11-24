import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { ArrowUp, Bell, CaretDown, Check, Coins, MagnifyingGlass, MapTrifold, ShoppingCart, SquaresFour, Smiley, Tag, UsersThree, type Icon } from '@phosphor-icons/react'
import { cartPose } from '../cart/CartRig'
import { CartJoystick } from '../cart/CartJoystick'
import { L } from '../../data/layout'
import { SECTION_LABEL } from '../../data/products'
import { CATEGORIES, type CategoryId } from '../../data/categories'
import { MALLS } from '../../data/malls'
import { STORE_BY_ID } from '../../data/stores'
import { HALLS } from '../../data/storeLayout'
import { computeWaypoint, way, type Waypoint } from '../../lib/waypoint'
import { INTERIORS, activeCart, cartCount, inr, toPay, useCurrentMall, useMall } from '../../state/useMall'
import { cx } from '../ui/primitives'

const tile = 'glass pointer-events-auto relative flex flex-col items-center justify-center gap-1 rounded-2xl text-ink transition-[transform,background-color] duration-300 hover:bg-white active:scale-[0.97]'

function ActionTile({ icon: I, label, onClick, badge, accent, small }: { icon: Icon; label: string; onClick: () => void; badge?: number; accent?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} aria-label={badge ? `${label}, ${badge} new` : label} className={cx(tile, small ? 'h-12 w-12 md:h-16 md:w-16' : 'h-12 w-12 md:h-20 md:w-24')}>
      {accent
        ? <span className="grid h-8 w-8 place-items-center rounded-full bg-[#5F4FA3] text-white md:h-10 md:w-10"><Smiley size={22} weight="fill" /></span>
        : <I size={small ? 22 : 26} />}
      <span className={cx('hidden text-xs font-medium whitespace-nowrap md:block', small && 'md:text-xs')}>{label}</span>
      {!!badge && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-purple px-1 text-xs leading-none font-semibold text-white tnum">{badge}</span>}
    </button>
  )
}

const iconBtn = 'pointer-events-auto relative grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink transition-[transform,background-color] duration-300 hover:bg-white active:scale-[0.97] md:h-11 md:w-11'

function BarButton({ icon: I, label, onClick, badge, children }: { icon: Icon; label: string; onClick: () => void; badge?: number; children?: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={badge ? `${label}, ${badge} new` : label} title={label} className={cx(iconBtn, !!children && 'md:!w-auto md:gap-2 md:px-3')}>
      <span className={cx(!!children && 'md:flex md:items-center md:gap-2')}><I size={21} />{children}</span>
      {!!badge && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-purple px-1 text-xs leading-none font-semibold text-white tnum">{badge}</span>}
    </button>
  )
}

/** Mall identity with a switcher; malls that are not built yet are listed but cannot be entered. */
function MallSwitcher() {
  const mall = useCurrentMall()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', off); window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('pointerdown', off); window.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={ref} className="relative pointer-events-auto">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label={`${mall.name}, change mall`}
        className="flex h-9 items-center gap-2 rounded-xl pl-1 pr-2 transition-colors duration-300 hover:bg-white md:h-11 md:pr-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white md:h-9 md:w-9" style={{ background: mall.tone }}>{mall.initial}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold">{mall.name}</span>
          <span className="hidden text-xs text-ink-2 md:block">{mall.city} · Virtual Retail OS</span>
        </span>
        <CaretDown size={14} className={cx('text-ink-2 transition-transform duration-500', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute left-0 top-[calc(100%+8px)] z-20 w-64 rounded-2xl p-2">
            {MALLS.map((m) => (
              <button key={m.id} role="menuitem" disabled={!m.available} onClick={() => { useMall.getState().selectMall(m.id); setOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors duration-300 hover:bg-white disabled:hover:bg-transparent">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white" style={{ background: m.tone, opacity: m.available ? 1 : 0.45 }}>{m.initial}</span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className={cx('block text-sm font-semibold', !m.available && 'text-ink-3')}>{m.name}</span>
                  <span className="text-xs text-ink-2">{m.available ? `${m.stores.length} stores · ${m.city}` : 'Coming soon'}</span>
                </span>
                {m.id === mall.id && <Check size={16} className="text-purple-ink" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Explore drives NEU CART through the mall; Quick jumps straight to the store or shelf. */
function ModeToggle() {
  const mode = useMall((s) => s.mode)
  const set = useMall.getState().setMode
  return (
    <div role="radiogroup" aria-label="Shopping mode" className="glass pointer-events-auto flex rounded-full p-1">
      {(['explore', 'quick'] as const).map((m) => (
        <button key={m} role="radio" aria-checked={mode === m} onClick={() => set(m)}
          className={cx('h-7 rounded-full px-3 text-xs font-semibold transition-colors duration-300', mode === m ? 'bg-[#5F4FA3] text-white' : 'text-ink-2 hover:text-ink')}>
          {m === 'explore' ? 'Explore' : 'Quick'}
        </button>
      ))}
    </div>
  )
}

/** One floating bar: mall identity on the left, search in the middle, people and account on the right. */
function TopBar() {
  const coins = useMall((s) => s.coins)
  const unread = useMall((s) => Math.max(0, s.activity.length - s.alertsSeen))
  const open = useMall.getState().open
  return (
    <header className="glass pointer-events-auto mx-auto flex max-w-[1180px] items-center gap-1 rounded-2xl p-1 md:gap-3 md:p-2">
      <MallSwitcher />
      <button onClick={() => open({ kind: 'search' })} aria-label="Search products, stores, brands and categories"
        className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-xl px-2 text-ink-2 transition-colors duration-300 hover:bg-white md:mx-auto md:h-11 md:w-full md:max-w-[420px] md:bg-white/70 md:px-4">
        <MagnifyingGlass size={20} className="text-ink" />
        <span className="hidden truncate text-sm md:block">Search products, stores, brands</span>
      </button>
      <nav aria-label="Mall actions" className="flex items-center md:gap-1">
        <BarButton icon={MapTrifold} label="Mall map" onClick={() => open({ kind: 'map' })} />
        <BarButton icon={UsersThree} label="Friends" onClick={() => open({ kind: 'friends' })} />
        <BarButton icon={Coins} label={`Rewards, ${coins} NeuCoins`} onClick={() => open({ kind: 'wallet' })}>
          <span className="hidden text-sm font-semibold tnum md:inline">{coins.toLocaleString('en-IN')}</span>
        </BarButton>
        <BarButton icon={Bell} label="Notifications" badge={unread} onClick={() => open({ kind: 'notifications' })} />
        <button onClick={() => open({ kind: 'profile' })} aria-label="Your profile" title="Your profile" className={iconBtn}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-semibold text-white md:h-8 md:w-8 md:text-sm">R</span>
        </button>
      </nav>
    </header>
  )
}

// the strip leads with the categories shoppers reach for most, then the rest of the mall
const STRIP_FIRST: CategoryId[] = ['grocery', 'beauty', 'electronics', 'fashion', 'kids', 'home']

/** Category pills next to the joystick. A pill takes you to that category's store, walking in where there is one. */
function CategoryStrip() {
  const mall = useCurrentMall()
  const loc = useMall((s) => s.location)
  const [picked, setPicked] = useState<CategoryId | 'all'>('all')
  const here = loc !== 'lobby' ? STORE_BY_ID[loc]?.category : null
  const active = here ?? picked
  useEffect(() => { if (loc === 'lobby') setPicked('all') }, [loc])
  const have = CATEGORIES.filter((c) => mall.stores.some((s) => s.category === c.id))
  const order = [...STRIP_FIRST.map((id) => have.find((c) => c.id === id)).filter(Boolean), ...have.filter((c) => !STRIP_FIRST.includes(c.id))] as typeof have
  const go = (id: CategoryId | 'all') => {
    const s = useMall.getState()
    setPicked(id)
    if (id === 'all') { if (s.location !== 'lobby') s.enterStore('lobby'); return }
    const list = mall.stores.filter((st) => st.category === id)
    const target = list.find((st) => INTERIORS.includes(st.id)) ?? list.find((st) => st.level === 0) ?? list[0]
    if (target) s.travelTo(target.id, true)
  }
  const pill = (on: boolean) => cx('flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-[background-color,color,transform] duration-300 active:scale-[0.97] md:h-10 md:text-sm',
    on ? 'bg-[#5F4FA3] text-white' : 'text-ink hover:bg-white')
  return (
    <nav aria-label="Categories" className="glass no-scrollbar pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-full p-1">
      <button onClick={() => go('all')} aria-pressed={active === 'all'} className={pill(active === 'all')}><SquaresFour size={16} />All</button>
      {order.map((c) => (
        <button key={c.id} onClick={() => go(c.id)} aria-pressed={active === c.id} className={pill(active === c.id)}>
          <c.icon size={16} />{c.label}
        </button>
      ))}
    </nav>
  )
}

function useWaypoint() {
  const location = useMall((s) => s.location)
  const [wp, setWp] = useState<Waypoint | null>(null)
  const arrow = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let raf = 0, last = 0, lastKey = '', lastDist = -1
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      const s = useMall.getState()
      const blocked = s.fading || s.checkout !== 'closed' || s.view !== 'mall'
      const w = blocked ? null : computeWaypoint(s.location, s.nearStoreId, cartPose)
      way.on = !!w && w.dist > 1.6 && !s.nearStoreId
      if (w) { way.x = w.x; way.z = w.z; if (arrow.current) arrow.current.style.transform = `rotate(${-w.rel}rad)` }
      if (t - last < 180) return
      last = t
      const d = w ? Math.round(w.dist) : -1
      if ((w?.key ?? '') !== lastKey || d !== lastDist) { lastKey = w?.key ?? ''; lastDist = d; setWp(w) }
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); way.on = false }
  }, [location])
  return { wp, arrow }
}

function WaypointPill() {
  const { wp, arrow } = useWaypoint()
  const near = useMall((s) => s.nearStoreId)
  if (!wp) return null
  const walkIn = near === wp.key
  return (
    <button
      onClick={() => (walkIn ? useMall.getState().enterStore(wp.key) : wp.go())}
      aria-label={walkIn ? `Walk into ${wp.label}` : `Go to ${wp.label}, ${Math.round(wp.dist)} metres away`}
      className={cx(tile, 'absolute left-1/2 top-[38%] !flex-row -translate-x-1/2 gap-3 py-2 pl-3 pr-4 md:top-[42%]')}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-white">
        <span ref={arrow} className="grid place-items-center"><ArrowUp size={18} weight="bold" /></span>
      </span>
      <span className="text-left">
        <span className="block max-w-32 truncate text-xs font-medium">{walkIn ? 'Walk in' : wp.label}</span>
        <span className="block max-w-32 truncate text-base font-medium tnum">{walkIn ? wp.label : `${Math.round(wp.dist)} m`}</span>
      </span>
    </button>
  )
}

const MAP_W = 160, MAP_H = 100

function Minimap() {
  const mall = useCurrentMall()
  const loc = useMall((s) => s.location)
  const section = useMall((s) => s.storeSection)
  const nearStore = useMall((s) => s.nearStoreId)
  const [floor, setFloor] = useState<0 | 1>(0)
  const dot = useRef<SVGGElement>(null)
  const hall = loc !== 'lobby' ? HALLS[loc] : null
  const lobbyX = (z: number) => ((L.entranceZ - z) / (L.entranceZ - L.endZ)) * MAP_W
  const lobbyY = (x: number) => ((x + L.shopX) / (L.shopX * 2)) * MAP_H

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!dot.current) return
      const { x, z, yaw } = cartPose
      const px = hall ? ((hall.entranceZ - z) / (hall.entranceZ - hall.backZ)) * MAP_W : ((L.entranceZ - z) / (L.entranceZ - L.endZ)) * MAP_W
      const py = hall ? ((x - hall.ox + hall.half) / (hall.half * 2)) * MAP_H : ((x + L.shopX) / (L.shopX * 2)) * MAP_H
      // the plan is drawn with the mall running left to right
      dot.current.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(90 - (yaw * 180) / Math.PI).toFixed(1)})`)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hall])

  const stores = mall.stores.filter((s) => s.level === floor)
  const showDot = hall ? true : floor === 0
  return (
    <div className="glass pointer-events-auto w-28 rounded-2xl p-2 md:w-44 md:p-3">
      <button onClick={() => useMall.getState().open({ kind: 'map' })} aria-label="Open the mall map" className="block w-full rounded-xl text-left">
        <span className="mb-1 block text-xs font-medium">You are here</span>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block w-full rounded-lg bg-[#E9DECE]" aria-hidden>
          {hall
            ? hall.runs.map((r) => {
                const last = r.z0 - r.bay * r.products.length
                const x0 = ((hall.entranceZ - r.z0) / (hall.entranceZ - hall.backZ)) * MAP_W
                const x1 = ((hall.entranceZ - last) / (hall.entranceZ - hall.backZ)) * MAP_W
                return <rect key={r.section} x={x0} y={r.side < 0 ? 6 : MAP_H - 28} width={Math.max(4, x1 - x0 - 2)} height={22} rx={2} fill={SECTION_LABEL[r.section] === section ? '#5F4FA3' : '#FFFFFF'} />
              })
            : <>
                {stores.map((s) => <rect key={s.id} x={lobbyX(s.z) - 4} y={s.side < 0 ? 4 : MAP_H - 22} width={8} height={18} rx={2} fill={s.id === nearStore ? '#5F4FA3' : '#FFFFFF'} />)}
                <circle cx={lobbyX(L.fountain.z)} cy={lobbyY(0)} r={5} fill="#FFFFFF" />
                <rect x={lobbyX(L.escalators.z0)} y={lobbyY(-2)} width={lobbyX(L.escalators.z1) - lobbyX(L.escalators.z0)} height={lobbyY(2) - lobbyY(-2)} rx={2} fill="#FFFFFF" opacity={0.75} />
              </>}
          {showDot && (
            <g ref={dot}>
              <circle r={9} fill="#5F4FA3" opacity={0.2} />
              <path d="M0 -7 L4 3 L0 1 L-4 3 Z" fill="#5F4FA3" />
            </g>
          )}
        </svg>
      </button>
      <button
        onClick={() => setFloor((f) => (f ? 0 : 1))}
        disabled={!!hall}
        aria-label={`Showing ${floor ? 'first' : 'ground'} floor. Switch floor`}
        className="mt-1 flex w-full items-center justify-between rounded-lg py-1 text-xs font-medium md:text-sm"
      >
        <span className="truncate">{hall ? mall.stores.find((s) => s.id === hall.id)?.name : floor ? 'First floor' : 'Ground floor'}</span>
        {!hall && <CaretDown size={14} className={cx('transition-transform duration-500', floor === 1 && 'rotate-180')} />}
      </button>
    </div>
  )
}

function ViewCart() {
  const cart = useMall(activeCart)
  const total = useMall(toPay)
  const n = cartCount(cart)
  return (
    <motion.button
      key={n}
      initial={{ scale: n ? 0.96 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 20 }}
      onClick={() => useMall.getState().open({ kind: 'cart' })}
      aria-label={`View cart, ${n} items, ${inr(total)}`}
      className={cx(tile, '!flex-row h-12 gap-2 pl-2 pr-3 md:h-14 md:gap-3 md:pl-2 md:pr-5')}
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#5F4FA3] text-white md:h-10 md:w-10">
        <ShoppingCart size={20} weight="fill" />
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-xs font-semibold text-white tnum">{n}</span>
      </span>
      <span className="text-left leading-tight">
        <span className="block text-sm font-semibold tnum md:text-base">{inr(total)}</span>
        <span className="block text-xs text-ink-2">View cart</span>
      </span>
    </motion.button>
  )
}

/** Heads-up display over the mall: one top bar, wayfinding, map, joystick, categories and cart. */
export function MallHud() {
  const open = useMall.getState().open
  return (
    <>
      <div className="absolute inset-x-2 top-[calc(8px+env(safe-area-inset-top))] md:inset-x-6 md:top-5"><TopBar /></div>

      <WaypointPill />

      {/* under the bar: where you are on the left, shopping mode on the right */}
      <div className="absolute left-2 top-[calc(60px+env(safe-area-inset-top))] md:left-6 md:top-[92px]"><Minimap /></div>
      <div className="absolute right-2 top-[calc(60px+env(safe-area-inset-top))] md:right-6 md:top-[92px]"><ModeToggle /></div>

      {/* desktop: categories sit just above the joystick, clear of the cart in the middle */}
      <div className="absolute bottom-[calc(56px+env(safe-area-inset-bottom))] left-2 flex flex-col-reverse items-start gap-3 md:bottom-6 md:left-6">
        <div className="pointer-events-auto md:pl-2"><CartJoystick /></div>
        <div className="hidden max-w-[calc(50vw-250px)] md:block"><CategoryStrip /></div>
      </div>
      <div className="absolute inset-x-2 bottom-[calc(6px+env(safe-area-inset-bottom))] md:hidden"><CategoryStrip /></div>

      <div className="absolute bottom-[calc(56px+env(safe-area-inset-bottom))] right-2 flex flex-col items-end gap-2 md:bottom-6 md:right-6 md:gap-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <ActionTile small icon={Smiley} accent label="Assistant" onClick={() => open({ kind: 'assistant' })} />
          <ActionTile small icon={Tag} label="Offers" onClick={() => open({ kind: 'offers' })} />
        </div>
        <ViewCart />
      </div>
    </>
  )
}
