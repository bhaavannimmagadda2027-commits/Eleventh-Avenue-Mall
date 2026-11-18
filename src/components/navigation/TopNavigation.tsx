import { ChevronLeft, Search, Wallet } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconButton } from '../ui/primitives'
import { FriendsButton } from '../social/SocialNudge'
import { useCurrentMall, useMall } from '../../state/useMall'

/** Compact floating header: back, where you are, search, wallet, profile. */
export function TopNavigation() {
  const mall = useCurrentMall()
  const near = useMall((s) => s.nearStoreId)
  const loc = useMall((s) => s.location)
  const section = useMall((s) => s.storeSection)
  const coins = useMall((s) => s.coins)
  const { toLanding, open, enterStore } = useMall.getState()
  const inside = loc !== 'lobby' ? mall.stores.find((s) => s.id === loc) : undefined
  const store = inside ?? mall.stores.find((s) => s.id === near)
  const place = store ? store.name : 'Main lobby'
  const sub = inside ? section : `${mall.name} · ${store ? (store.level ? 'First floor' : 'Ground floor') : mall.city}`

  return (
    <div className="pointer-events-auto absolute inset-x-3 top-[calc(10px+env(safe-area-inset-top))] mx-auto flex max-w-[640px] items-center gap-2">
      <IconButton icon={ChevronLeft} label={inside ? 'Back to the lobby' : 'Back to the entrance'} onClick={() => (inside ? enterStore('lobby') : toLanding())} />
      <div className="glass flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full pl-3.5 pr-4">
        <span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_0_3px_rgb(87_134_93/0.15)]" />
        <div className="min-w-0 leading-tight">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={place} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="truncate text-[14px] font-semibold">
              {place}
            </motion.div>
          </AnimatePresence>
          <div className="truncate text-micro text-ink-2">{sub}</div>
        </div>
      </div>
      <IconButton icon={Search} label="Search the mall" onClick={() => open({ kind: 'search' })} />
      <IconButton icon={Wallet} label={`NeuCoins wallet, ${coins} coins`} onClick={() => open({ kind: 'wallet' })} className="max-[360px]:hidden" />
      <FriendsButton />
    </div>
  )
}
