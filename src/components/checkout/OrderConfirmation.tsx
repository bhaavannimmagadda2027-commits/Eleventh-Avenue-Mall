import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { Gift, Home, PackageCheck } from 'lucide-react'
import { FRIEND_BY_ID } from '../../data/social'
import { GIFT_AREA } from '../../data/checkout'
import { PRODUCT_BY_ID } from '../../data/products'
import { STORE_BY_ID } from '../../data/stores'
import { reduceMotion } from '../../lib/input'
import { thumb } from '../../lib/productArt'
import { inr, useMall } from '../../state/useMall'
import { BrandMark, Button, cx } from '../ui/primitives'

/** Drawn check: the ring closes, then the tick. One gentle pulse, no bouncing. */
function Tick() {
  const d = reduceMotion ? 0 : 1
  return (
    <motion.div className="relative grid h-24 w-24 place-items-center" initial={{ scale: d ? 0.85 : 1 }} animate={{ scale: 1 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.3, 1] }}>
      {d > 0 && (
        <motion.span className="absolute inset-0 rounded-full bg-purple-soft" initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 1.35, opacity: 0 }} transition={{ duration: 1.1, delay: 0.55, ease: 'easeOut' }} />
      )}
      <svg viewBox="0 0 96 96" className="relative h-24 w-24" aria-hidden>
        <circle cx="48" cy="48" r="44" fill="var(--color-purple-soft)" />
        <motion.circle cx="48" cy="48" r="44" fill="none" stroke="var(--color-purple)" strokeWidth="4" strokeLinecap="round"
          style={{ rotate: -90, transformOrigin: '50% 50%' }}
          initial={{ pathLength: d ? 0 : 1 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeInOut' }} />
        <motion.path d="M30 49 L43 61 L66 36" fill="none" stroke="var(--color-purple)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: d ? 0 : 1 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: d * 0.5, ease: 'easeOut' }} />
      </svg>
    </motion.div>
  )
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(reduceMotion ? to : 0)
  useEffect(() => {
    if (reduceMotion) return
    const c = animate(0, to, { duration: 0.9, delay: 0.7, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [to])
  return <>{v}</>
}

const rise = (i: number) => ({
  initial: { opacity: 0, y: reduceMotion ? 0 : 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: reduceMotion ? 0 : 0.55 + i * 0.08 },
})

/** Simulated order confirmation: what was paid, what was earned, and what arrives when. */
export function OrderConfirmation() {
  const order = useMall((s) => s.order)
  const coins = useMall((s) => s.coins)
  useMall((s) => s.thumbsReady)
  if (!order) return null
  const { closeCheckout, open } = useMall.getState()
  const cod = order.pay === 'Pay on delivery'
  return (
    <>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-[calc(28px+env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-[560px] flex-col items-center gap-5">
          <Tick />
          <motion.div {...rise(0)} className="text-center" role="status">
            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Order placed</h2>
            <p className="mt-1 text-support text-ink-2">
              <span className="tnum">{order.id}</span> · {cod ? <>{inr(order.total)} to pay on delivery</> : <>{inr(order.total)} paid by {order.pay}</>}
            </p>
            {order.family && <p className="mt-1 text-micro text-ink-2">Family cart order. Everyone in the family can see it.</p>}
          </motion.div>

          <motion.div {...rise(1)} className="grid w-full grid-cols-2 gap-2">
            <div className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">NeuCoins earned</div>
              <div className="mt-1 flex items-center gap-2 text-[26px] font-semibold tnum">
                <span className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold text-[#7A4A00]" style={{ background: 'radial-gradient(circle at 35% 30%, #F8DE8E, #E2A52B)' }}>N</span>
                +<CountUp to={order.coinsEarned} />
              </div>
              <div className="text-micro text-ink-2">Balance {coins.toLocaleString('en-IN')}</div>
            </div>
            <div className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">You saved</div>
              <div className="mt-1 text-[26px] font-semibold text-success tnum">{inr(order.saved)}</div>
              <div className="text-micro text-ink-2">{order.coinsUsed ? `incl. ${inr(order.coinsUsed)} in NeuCoins` : 'Offers and discounts'}</div>
            </div>
          </motion.div>

          <motion.section {...rise(2)} className="w-full rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold">On the way</h3>
              <span className="text-micro text-ink-2">{order.deliveries.length} deliver{order.deliveries.length > 1 ? 'ies' : 'y'}</span>
            </div>
            <ol className="relative">
              {order.deliveries.map((d, i) => {
                const st = STORE_BY_ID[d.storeId]
                return (
                  <li key={d.storeId} className="relative flex gap-3 pb-4">
                    <span className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-soft" aria-hidden />
                    <span className="relative"><BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={32} /></span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-semibold">{d.label} · {st.name}</span>
                        <span className={cx('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', i === 0 ? 'bg-purple-soft text-purple-ink' : 'bg-cream text-ink-2')}>{i === 0 ? 'Packing' : 'Confirmed'}</span>
                      </div>
                      <div className="text-micro text-ink-2">{d.count} item{d.count > 1 ? 's' : ''} · {d.eta}</div>
                      <div className="mt-1.5 flex gap-1">
                        {d.productIds.slice(0, 6).map((id) => <img key={id} src={thumb(id) || undefined} alt="" className="h-8 w-8 rounded-[9px] bg-cream" />)}
                      </div>
                    </div>
                  </li>
                )
              })}
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-purple text-white"><Home size={15} /></span>
                <span className="text-[14px] font-semibold">{order.address}</span>
              </li>
            </ol>
          </motion.section>

          {order.gifts.length > 0 && (
            <motion.section {...rise(3)} className="w-full rounded-[20px] bg-[#FBEBDC] p-4 text-[#8A5220]">
              {order.gifts.map((g) => (
                <div key={g.productId} className="flex items-center gap-2 py-1 text-support">
                  <Gift size={16} className="shrink-0" />
                  <span><b>{PRODUCT_BY_ID[g.productId].name.split(',')[0]}</b> is gift wrapped for {FRIEND_BY_ID[g.friendId].name} ({GIFT_AREA[g.friendId]}).</span>
                </div>
              ))}
            </motion.section>
          )}

          <motion.p {...rise(4)} className="flex items-center gap-1.5 text-center text-micro text-ink-3">
            <PackageCheck size={13} />Simulated order. Nothing was charged and nothing will be delivered.
          </motion.p>
        </div>
      </div>
      <footer className="shrink-0 border-t border-soft bg-white/90 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-[560px] gap-2">
          <Button variant="quiet" size="lg" className="flex-1" onClick={() => { closeCheckout(); open({ kind: 'profile' }) }}>Your orders</Button>
          <Button size="lg" className="flex-[1.4]" onClick={closeCheckout}>Back to the mall</Button>
        </div>
      </footer>
    </>
  )
}
