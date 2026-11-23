import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Bell, CaretDown, MagnifyingGlass, Microphone, ShoppingCart, Smiley, Tag, UsersThree, Wallet, type Icon } from '@phosphor-icons/react'
import { cartPose } from '../cart/CartRig'
import { CartJoystick } from '../cart/CartJoystick'
import { L } from '../../data/layout'
import { SECTION_LABEL } from '../../data/products'
import { HALLS } from '../../data/storeLayout'
import { computeWaypoint, way, type Waypoint } from '../../lib/waypoint'
import { activeCart, cartCount, inr, toPay, useCurrentMall, useMall } from '../../state/useMall'
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

function ProfileChip() {
  const coins = useMall((s) => s.coins)
  return (
    <button onClick={() => useMall.getState().open({ kind: 'profile' })} aria-label={`Rahul, ${coins} NeuCoins`} className={cx(tile, '!flex-row !justify-start gap-2 p-2 md:gap-3 md:p-3')}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white md:h-12 md:w-12 md:text-lg">R</span>
      <span className="pr-2 text-left">
        <span className="hidden text-sm font-medium md:block">Hi, Rahul</span>
        <span className="flex items-center gap-1 text-xs font-medium md:text-sm">
          <span className="hidden text-ink-2 md:inline">NeuCoins</span>
          <span className="h-3 w-3 rounded-full bg-[#E2A52B]" />
          <span className="font-semibold tnum">{coins.toLocaleString('en-IN')}</span>
        </span>
      </span>
    </button>
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
      <button onClick={() => useMall.getState().open({ kind: 'directory' })} aria-label="Open the mall directory" className="block w-full rounded-xl text-left">
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
      className={cx(tile, '!flex-row h-12 gap-2 pl-3 pr-2 md:h-16 md:gap-3 md:pl-6 md:pr-3')}
    >
      <ShoppingCart size={24} weight="fill" />
      <span className="text-sm font-medium whitespace-nowrap md:text-lg">View Cart</span>
      <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#5F4FA3] px-2 text-sm font-semibold text-white tnum md:h-10 md:min-w-10 md:text-lg">{n}</span>
    </motion.button>
  )
}

/** Heads-up display over the mall: profile, quick actions, map, wayfinding, joystick and cart. */
export function MallHud() {
  const unread = useMall((s) => Math.max(0, s.activity.length - s.alertsSeen))
  const open = useMall.getState().open
  return (
    <>
      <div className="absolute left-2 top-[calc(8px+env(safe-area-inset-top))] md:left-6 md:top-6"><ProfileChip /></div>
      <nav aria-label="Mall actions" className="absolute right-2 top-[calc(8px+env(safe-area-inset-top))] flex gap-1 md:right-6 md:top-6 md:gap-4">
        <ActionTile icon={MagnifyingGlass} label="Search" onClick={() => open({ kind: 'search' })} />
        <ActionTile icon={Smiley} accent label="AI Assistant" onClick={() => open({ kind: 'assistant' })} />
        <ActionTile icon={Wallet} label="Wallet" onClick={() => open({ kind: 'wallet' })} />
        <ActionTile icon={Bell} label="Notifications" badge={unread} onClick={() => open({ kind: 'notifications' })} />
      </nav>

      <WaypointPill />

      <div className="absolute bottom-[calc(8px+env(safe-area-inset-bottom))] left-2 flex flex-col gap-2 md:bottom-6 md:left-6 md:gap-6">
        {/* on phones the map sits up top, so the cart's display stays in view */}
        <div className="max-md:fixed max-md:left-2 max-md:top-[calc(64px+env(safe-area-inset-top))]"><Minimap /></div>
        <div className="pointer-events-auto md:pl-6"><CartJoystick /></div>
      </div>

      <div className="absolute bottom-[calc(8px+env(safe-area-inset-bottom))] right-2 flex flex-col items-end gap-2 md:bottom-6 md:right-6 md:gap-6">
        <div className="flex flex-col gap-2 md:gap-6">
          <ActionTile small icon={Microphone} label="Voice Chat" onClick={() => open({ kind: 'assistant', listen: true })} />
          <ActionTile small icon={UsersThree} label="Invite" onClick={() => open({ kind: 'friends' })} />
          <ActionTile small icon={Tag} label="Offers" onClick={() => open({ kind: 'offers' })} />
        </div>
        <ViewCart />
      </div>
    </>
  )
}
