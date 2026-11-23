import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Gift, Lock, MapPin, Truck, Users } from '../ui/icons'
import { ADDRESSES, GIFT_AREA, GROCERY_SLOTS, PAY_METHODS } from '../../data/checkout'
import { FRIEND_BY_ID } from '../../data/social'
import { PRODUCT_BY_ID } from '../../data/products'
import { computeBill, type Group } from '../../lib/cartMath'
import { thumb } from '../../lib/productArt'
import { activeCart, inr, useMall } from '../../state/useMall'
import { BillCard, Rewards } from '../cart/CartSheet'
import { Badge, BrandMark, Button, cx } from '../ui/primitives'
import { OrderConfirmation } from './OrderConfirmation'
import { useDialog } from '../../lib/useDialog'

const H = ({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) => (
  <div className="mb-2 flex items-baseline justify-between"><h3 className="text-sm font-semibold">{children}</h3>{aside && <span className="text-micro text-ink-2">{aside}</span>}</div>
)

function Thumbs({ ids }: { ids: string[] }) {
  const shown = ids.slice(0, 5)
  return (
    <div className="flex items-center gap-2">
      {shown.map((id) => <img key={id} src={thumb(id) || undefined} alt={PRODUCT_BY_ID[id]?.name ?? ''} className="h-11 w-11 rounded-xl bg-cream" />)}
      {ids.length > shown.length && <span className="grid h-11 w-11 place-items-center rounded-xl bg-cream text-micro font-semibold text-ink-2">+{ids.length - shown.length}</span>}
    </div>
  )
}

function Delivery({ g, slot, setSlot }: { g: Group; slot: string; setSlot: (s: string) => void }) {
  const grocery = g.store.id === 'bigbasket'
  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        <BrandMark name={g.store.name} bg={g.store.sign.bg} fg={g.store.sign.fg} size={32} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-semibold">{g.label} <span className="font-normal text-ink-2">· {g.count} item{g.count > 1 ? 's' : ''}</span></div>
          <div className="truncate text-micro text-ink-2">{g.store.name} · {g.source}</div>
        </div>
        {!grocery && <Badge tone="success">{g.eta}</Badge>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 pl-[44px]">
        <Thumbs ids={g.lines.map((l) => l.p.id)} />
        <span className="shrink-0 text-micro text-ink-2 tnum">{g.fee ? `${inr(g.fee)} delivery` : g.feeWaivedBy ? `Free with ${g.feeWaivedBy}` : 'Free delivery'}</span>
      </div>
      {grocery && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pl-[44px]" role="radiogroup" aria-label="Grocery delivery time">
          {GROCERY_SLOTS.map((s) => (
            <button key={s.id} role="radio" aria-checked={slot === s.id} onClick={() => setSlot(s.id)}
              className={cx('h-8 shrink-0 rounded-full px-3 text-xs font-semibold', slot === s.id ? 'bg-ink text-on-ink' : 'bg-cream text-ink')}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Review() {
  // keep showing the order while it is placed (the cart empties as the confirmation fades in)
  const live = useMall(activeCart)
  const keep = useRef(live)
  if (live.length) keep.current = live
  const lines = keep.current
  const family = useMall((s) => s.cartMode === 'family')
  const useCoins = useMall((s) => s.useCoins)
  const coins = useMall((s) => s.coins)
  const gifts = useMall((s) => s.gifts)
  const stage = useMall((s) => s.checkout)
  useMall((s) => s.thumbsReady)
  const yearEarned = useMall((s) => s.yearEarned)
  const bill = useMemo(() => computeBill(lines, { useCoins, balance: coins, yearEarned }), [lines, useCoins, coins, yearEarned])
  const [addr, setAddr] = useState('home')
  const [pay, setPay] = useState('upi')
  const [slot, setSlot] = useState('now')
  const giftLines = family ? [] : lines.filter((l) => gifts[l.productId])
  const placing = stage === 'placing'
  const { closeCheckout, open, placeOrder } = useMall.getState()
  const a = ADDRESSES.find((x) => x.id === addr)!
  const m = PAY_METHODS.find((x) => x.id === pay)!

  return (
    <>
      <header className="flex shrink-0 items-center gap-2 px-3 pb-2 pt-[calc(10px+env(safe-area-inset-top))]">
        <button onClick={() => { closeCheckout(); open({ kind: 'cart' }) }} disabled={placing} aria-label="Back to NEU CART" className="grid h-11 w-11 place-items-center rounded-full bg-surface shadow-[var(--shadow-soft)] disabled:opacity-40"><ChevronLeft size={20} /></button>
        <div className="min-w-0 flex-1 leading-tight">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Checkout</h2>
          <div className="flex items-center gap-1 truncate text-micro text-ink-2">
            {family && <><Users size={12} />Family cart · </>}{bill.count} items from {bill.groups.length} store{bill.groups.length > 1 ? 's' : ''} · one payment
          </div>
        </div>
      </header>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="mx-auto flex max-w-[560px] flex-col gap-4 pt-2">
          <section>
            <H>Deliver to</H>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Delivery address">
              {ADDRESSES.map((x) => (
                <button key={x.id} role="radio" aria-checked={addr === x.id} onClick={() => setAddr(x.id)}
                  className={cx('rounded-2xl bg-surface p-3 text-left shadow-[var(--shadow-soft)] transition-shadow', addr === x.id ? 'ring-2 ring-purple' : 'ring-0')}>
                  <div className="flex items-center gap-2 text-sm font-semibold"><x.icon size={15} className={addr === x.id ? 'text-purple-ink' : 'text-ink-2'} />{x.label}</div>
                  <div className="mt-1 text-micro leading-snug text-ink-2">{x.line}<br />{x.area}</div>
                </button>
              ))}
            </div>
            {giftLines.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {giftLines.map((l) => {
                  const f = FRIEND_BY_ID[gifts[l.productId]]
                  return (
                    <div key={l.productId} className="flex items-center gap-2 rounded-xl bg-tint px-3 py-2 text-micro text-promo-ink">
                      <Gift size={14} className="shrink-0" />
                      <span className="min-w-0 flex-1 leading-snug"><b>{PRODUCT_BY_ID[l.productId].name.split(',')[0]}</b> goes to {f.name}, {GIFT_AREA[f.id]}. Gift wrapped.</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section>
            <H aside={bill.groups.length > 1 ? `${bill.groups.length} deliveries` : undefined}>Deliveries</H>
            <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
              {bill.groups.map((g) => <Delivery key={g.store.id} g={g} slot={slot} setSlot={setSlot} />)}
            </div>
            <p className="mt-2 flex items-center gap-2 text-micro text-ink-2"><Truck size={13} />Each store packs and sends its part to {a.label.toLowerCase()}. You pay once.</p>
          </section>

          <section>
            <H>Pay with</H>
            <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]" role="radiogroup" aria-label="Payment method">
              {PAY_METHODS.map((x) => (
                <button key={x.id} role="radio" aria-checked={pay === x.id} onClick={() => setPay(x.id)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream"><x.icon size={17} /></span>
                  <span className="min-w-0 flex-1 leading-tight"><span className="block text-sm font-semibold">{x.label}</span><span className="text-micro text-ink-2">{x.detail}</span></span>
                  <span className={cx('grid h-5 w-5 place-items-center rounded-full border-2', pay === x.id ? 'border-purple' : 'border-soft')}>{pay === x.id && <span className="h-2.5 w-2.5 rounded-full bg-purple" />}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-2 text-micro text-ink-3"><Lock size={12} />Prototype: no payment details are asked for and nothing is charged.</p>
          </section>

          <Rewards bill={bill} />
          <BillCard bill={bill} />
        </div>
      </div>

      <footer className="shrink-0 border-t border-soft bg-surface/90 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-[560px] items-center gap-3">
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1 truncate text-micro text-ink-2"><MapPin size={11} />{a.label} · {m.label}</div>
            <div className="text-xl font-semibold tracking-[-0.01em] tnum">{inr(bill.total)}</div>
          </div>
          <Button size="lg" className="flex-1" disabled={placing}
            onClick={() => placeOrder({ address: `${a.label} · ${a.area.split(',')[0]}`, pay: m.label, slot: GROCERY_SLOTS.find((s) => s.id === slot)?.label })}>
            {placing ? <><span className="animate-pulse">Placing order</span></> : pay === 'cod' ? 'Place order' : `Pay ${inr(bill.total)}`}
          </Button>
        </div>
        <AnimatePresence>
          {placing && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mx-auto mt-2 max-w-[560px] truncate text-center text-micro text-ink-2" role="status">
              Confirming with {bill.groups.map((g) => g.store.name).join(', ')}
            </motion.p>
          )}
        </AnimatePresence>
      </footer>
    </>
  )
}

/** One clean checkout screen over the mall, then the confirmation in the same place. */
export function CheckoutScreen() {
  const stage = useMall((s) => s.checkout)
  const open = stage !== 'closed'
  const ref = useRef<HTMLDivElement>(null)
  useDialog(open, ref, () => {
    const s = useMall.getState()
    if (s.checkout === 'review') { s.closeCheckout(); s.open({ kind: 'cart' }) }
    else if (s.checkout === 'done') s.closeCheckout()
  })
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="checkout" ref={ref} role="dialog" aria-modal="true" tabIndex={-1} aria-label={stage === 'done' ? 'Order placed' : 'Checkout'}
          className="absolute inset-0 z-40 flex flex-col bg-bg outline-none"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 36 }}>
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'done'
              ? <motion.div key="done" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}><OrderConfirmation /></motion.div>
              : <motion.div key="review" className="flex min-h-0 flex-1 flex-col" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><Review /></motion.div>}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
