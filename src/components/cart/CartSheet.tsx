import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Home, Minus, Plus, ShoppingBag, Sparkles, Trash2, Truck } from 'lucide-react'
import { CATEGORY } from '../../data/categories'
import { PRODUCT_BY_ID, alternatives, type Product } from '../../data/products'
import { PLACE } from '../../data/storeLayout'
import { computeBill, type Bill, type Group } from '../../lib/cartMath'
import { thumb } from '../../lib/productArt'
import { activeCart, inr, useMall } from '../../state/useMall'
import { CartTabs, LineSocial } from '../social/SharedCart'
import { Sheet } from '../ui/FloatingCard'
import { Badge, BrandMark, Button, cx } from '../ui/primitives'

function Stepper({ p, qty }: { p: Product; qty: number }) {
  const { add, setQty } = useMall.getState()
  return (
    <div className="flex h-10 shrink-0 items-center rounded-full bg-cream">
      <button aria-label={qty === 1 ? `Remove ${p.name}` : 'Remove one'} onClick={() => setQty(p.id, qty - 1)} className="grid h-10 w-10 place-items-center">
        {qty === 1 ? <Trash2 size={15} strokeWidth={1.8} /> : <Minus size={15} strokeWidth={2} />}
      </button>
      <span className="w-5 text-center text-[14px] font-semibold tnum">{qty}</span>
      <button aria-label="Add one" onClick={() => add(p.id, 1)} className="grid h-10 w-10 place-items-center"><Plus size={15} strokeWidth={2} /></button>
    </div>
  )
}

function GroupCard({ g }: { g: Group }) {
  const [open, setOpen] = useState(true)
  const Cat = CATEGORY[g.category]
  const toFree = g.freeAbove && g.fee ? g.freeAbove - (g.subtotal - g.discount) : 0
  return (
    <section className="overflow-hidden rounded-[20px] bg-white shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 pb-2 pt-3 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px]" style={{ background: g.store.sign.bg === '#FFFFFF' ? '#F6F3ED' : g.store.sign.bg, color: g.store.sign.fg }}>
          <Cat.icon size={17} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[15px] font-semibold">{g.label} <span className="font-normal text-ink-2">· {g.count} item{g.count > 1 ? 's' : ''}</span></span>
          <span className="block truncate text-micro text-ink-2">{g.store.name} · {g.source}</span>
        </span>
        <Badge tone="success">{g.eta}</Badge>
        <ChevronDown size={18} strokeWidth={1.8} className={cx('shrink-0 text-ink-3 transition-transform', !open && '-rotate-90')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="divide-y divide-soft px-4">
              {g.lines.map((l) => (
                <div key={l.p.id} className="flex items-center gap-3 py-2.5">
                  <button onClick={() => useMall.getState().open({ kind: 'product', id: l.p.id })} className="shrink-0" aria-label={`Details for ${l.p.name}`}>
                    <img src={thumb(l.p.id) || undefined} alt="" className="h-12 w-12 rounded-[12px] bg-cream" />
                  </button>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-[14px] font-semibold">{l.p.name}</div>
                    <div className="truncate text-micro text-ink-2">{l.p.brand} · {l.p.size}</div>
                    <LineSocial productId={l.p.id} />
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-[14px] font-semibold tnum">{inr(l.total)}</span>
                      {l.mrpTotal > l.total && <span className="text-micro text-ink-3 line-through tnum">{inr(l.mrpTotal)}</span>}
                    </div>
                  </div>
                  <Stepper p={l.p} qty={l.qty} />
                </div>
              ))}
            </div>
            {g.offers.length > 0 && (
              <div className="flex flex-col gap-1.5 px-4 pb-1 pt-1">
                {g.offers.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 rounded-[12px] bg-[#E4EEE5] px-3 py-2 text-micro font-semibold text-success">
                    <Check size={14} strokeWidth={2.4} />
                    <span className="flex-1">{o.label}</span>
                    {o.kind === 'discount' && o.amount > 0 && <span className="tnum">−{inr(o.amount)}</span>}
                    {o.kind === 'coins' && <span className="tnum">+{o.amount} coins</span>}
                  </div>
                ))}
              </div>
            )}
            {toFree > 0 && (
              <div className="px-4 pt-2">
                <div className="flex justify-between text-micro text-ink-2"><span>Add {inr(toFree)} more for free delivery</span><span className="tnum">{inr(g.fee)} fee</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-promo" style={{ width: `${Math.min(100, ((g.subtotal - g.discount) / (g.freeAbove ?? 1)) * 100)}%` }} /></div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-2 flex items-center gap-2 border-t border-dashed border-soft px-4 py-2 text-micro text-ink-3">
        <Truck size={13} strokeWidth={1.8} />
        <span className="flex-1">{g.fee ? `Delivery ${inr(g.fee)}` : 'Free delivery'}</span>
        <span className="tnum">Subtotal {inr(g.subtotal - g.discount)}</span>
      </div>
    </section>
  )
}

/** Which store sends what, converging on one address. */
export function Routing({ bill }: { bill: Bill }) {
  const half = Math.ceil(bill.groups.length / 2)
  const node = (g: Group, side: 'l' | 'r') => (
    <div key={g.store.id} className={cx('relative flex items-center gap-2 rounded-[14px] bg-cream px-2.5 py-2 text-micro leading-tight', side === 'r' && 'flex-row-reverse text-right')}>
      <BrandMark name={g.store.name} bg={g.store.sign.bg} fg={g.store.sign.fg} size={26} />
      <span className="min-w-0"><b className="block truncate text-[12px] text-ink">{g.label} ({g.count})</b><span className="text-ink-2">{g.eta}</span></span>
      <span className={cx('absolute top-1/2 w-3 border-t-2 border-dashed border-[#C9C1EF]', side === 'l' ? '-right-3' : '-left-3')} />
    </div>
  )
  return (
    <section className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="text-[15px] font-semibold">Delivery routing</div>
      <p className="mb-3 text-micro text-ink-2">{bill.groups.length > 1 ? `One payment, ${bill.groups.length} deliveries. Each store packs and sends its part.` : 'One delivery, straight to your door.'}</p>
      <div className="grid grid-cols-[1fr_44px_1fr] items-center gap-0">
        <div className="flex flex-col gap-2 pr-3">{bill.groups.slice(0, half).map((g) => node(g, 'l'))}</div>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-purple text-white shadow-[0_0_0_5px_var(--color-purple-soft)]"><Home size={18} strokeWidth={1.8} /></span>
        <div className="flex flex-col gap-2 pl-3">{bill.groups.slice(half).map((g) => node(g, 'r'))}</div>
      </div>
      <p className="mt-3 text-micro text-ink-3">Home · Indiranagar, Bengaluru</p>
    </section>
  )
}

function Suggestions({ bill }: { bill: Bill }) {
  useMall((s) => s.thumbsReady)
  const inCart = new Set(bill.groups.flatMap((g) => g.lines.map((l) => l.p.id)))
  const picks = useMemo(() => {
    const seen = new Set<string>()
    const out: Product[] = []
    for (const g of bill.groups) for (const l of g.lines) for (const a of alternatives(l.p)) {
      if (inCart.has(a.id) || seen.has(a.id) || !PLACE[a.id]) continue
      seen.add(a.id); out.push(a)
    }
    return out.slice(0, 8)
  }, [bill, inCart])
  if (!picks.length) return null
  return (
    <section>
      <div className="mb-2 text-[15px] font-semibold">You might also need</div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {picks.map((p) => (
          <div key={p.id} className="relative w-[112px] shrink-0 rounded-[16px] bg-white p-2 shadow-[var(--shadow-soft)]">
            <img src={thumb(p.id) || undefined} alt="" className="mx-auto h-[72px] w-[72px]" />
            <div className="mt-1 truncate text-[12px] font-semibold">{p.name.split(',')[0]}</div>
            <div className="text-micro text-ink-2 tnum">{inr(p.price)}</div>
            <button onClick={() => useMall.getState().add(p.id, 1)} aria-label={`Add ${p.name}`} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-white"><Plus size={14} strokeWidth={2.2} /></button>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Rewards({ bill }: { bill: Bill }) {
  const useCoins = useMall((s) => s.useCoins)
  const coins = useMall((s) => s.coins)
  return (
    <section className="grid grid-cols-2 gap-2">
      <div className="rounded-[18px] bg-white p-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.06em] text-ink-2"><Sparkles size={13} />You'll earn</div>
        <div className="mt-1 text-[20px] font-semibold tnum">{bill.coinsEarned}</div>
        <div className="text-micro text-ink-2">NeuCoins{bill.bonusCoins ? `, incl. ${bill.bonusCoins} bonus` : ''}</div>
      </div>
      <button
        role="switch"
        aria-checked={useCoins}
        onClick={() => useMall.getState().setUseCoins(!useCoins)}
        disabled={!bill.maxRedeem}
        className={cx('rounded-[18px] p-3 text-left shadow-[var(--shadow-soft)] transition-colors', useCoins ? 'bg-purple-soft' : 'bg-white')}
      >
        <div className="flex items-center justify-between text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">
          Use NeuCoins
          <span className={cx('relative h-5 w-9 rounded-full transition-colors', useCoins ? 'bg-purple' : 'bg-soft')}>
            <span className={cx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', useCoins ? 'translate-x-[18px]' : 'translate-x-0.5')} />
          </span>
        </div>
        <div className={cx('mt-1 text-[20px] font-semibold tnum', useCoins && 'text-purple-ink')}>{useCoins ? `−${inr(bill.maxRedeem)}` : inr(bill.maxRedeem)}</div>
        <div className="text-micro text-ink-2">{useCoins ? 'Applied' : 'Available'} · balance {coins.toLocaleString('en-IN')}</div>
      </button>
    </section>
  )
}

export function BillCard({ bill }: { bill: Bill }) {
  const row = (label: string, value: string, tone?: 'save') => (
    <div className="flex justify-between py-1 text-support">
      <span className="text-ink-2">{label}</span>
      <span className={cx('font-semibold tnum', tone === 'save' ? 'text-success' : 'text-ink')}>{value}</span>
    </div>
  )
  return (
    <section className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-1 text-[15px] font-semibold">Bill</div>
      {row(`Items (${bill.count})`, inr(bill.mrpTotal))}
      {bill.mrpSavings > 0 && row('Product discounts', `−${inr(bill.mrpSavings)}`, 'save')}
      {bill.offerDiscount > 0 && row('Offers', `−${inr(bill.offerDiscount)}`, 'save')}
      {row('Delivery', bill.fees ? inr(bill.fees) : 'Free')}
      {bill.coinsUsed > 0 && row('NeuCoins', `−${inr(bill.coinsUsed)}`, 'save')}
      <div className="mt-1 flex justify-between border-t border-soft pt-2 text-[17px] font-semibold"><span>To pay</span><span className="tnum">{inr(bill.total)}</span></div>
      {bill.totalSaved > 0 && <div className="mt-2 rounded-[12px] bg-[#E4EEE5] px-3 py-2 text-center text-micro font-semibold text-success">You save {inr(bill.totalSaved)} on this order</div>}
      <p className="mt-2 text-micro text-ink-3">Prices, offers and fees are sample values for this prototype.</p>
    </section>
  )
}

function Empty({ family }: { family: boolean }) {
  useMall((s) => s.thumbsReady)
  const picks = ['tomato', 'milk', 'serum', 'earbuds', 'tee-dino', 'mugs'].map((id) => PRODUCT_BY_ID[id]).filter(Boolean)
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-cream"><ShoppingBag size={24} strokeWidth={1.6} /></span>
      <div className="text-[17px] font-semibold">{family ? 'The family cart is empty' : 'Your NEU CART is empty'}</div>
      <p className="max-w-[290px] text-support text-ink-2">{family ? 'Anyone in the family can add to it. One person pays when it is ready.' : 'One cart for every store in the mall. Add from any shelf; everything ends up here.'}</p>
      <div className="mt-3 grid w-full grid-cols-3 gap-2">
        {picks.map((p) => (
          <button key={p.id} onClick={() => useMall.getState().seekProduct(p.id, 'preview')} className="rounded-[16px] bg-white p-2 shadow-[var(--shadow-soft)]">
            <img src={thumb(p.id) || undefined} alt="" className="mx-auto h-16 w-16" />
            <div className="truncate text-[12px] font-semibold">{p.name.split(',')[0]}</div>
            <div className="text-micro text-ink-2">Go to shelf</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/** The universal cart: every store in one place, one bill. */
export function CartSheet() {
  const panel = useMall((s) => s.panel)
  const cart = useMall(activeCart)
  const family = useMall((s) => s.cartMode === 'family')
  const useCoins = useMall((s) => s.useCoins)
  const coins = useMall((s) => s.coins)
  useMall((s) => s.thumbsReady)
  const open = panel?.kind === 'cart'
  const bill = useMemo(() => computeBill(cart, { useCoins, balance: coins }), [cart, useCoins, coins])
  const stores = bill.groups.length
  const footer = cart.length ? (
    <div className="flex items-center gap-3">
      <div className="leading-tight">
        <div className="text-micro text-ink-2">To pay{bill.totalSaved ? ` · saved ${inr(bill.totalSaved)}` : ''}</div>
        <div className="text-[22px] font-semibold tracking-[-0.01em] tnum">{inr(bill.total)}</div>
      </div>
      <Button size="lg" className="flex-1" onClick={() => useMall.getState().openCheckout()} trailingIcon={ArrowRight}>Checkout</Button>
    </div>
  ) : undefined
  return (
    <Sheet open={open} onClose={() => useMall.getState().close()} title="NEU CART" tall={cart.length > 0} footer={footer}>
      <CartTabs />
      {!cart.length ? <Empty family={family} /> : (
        <div className="flex flex-col gap-3 pb-2">
          <div className="flex items-center gap-2 pt-0.5 text-support text-ink-2">
            <span className="flex">{bill.groups.map((g) => <span key={g.store.id} className="-ml-1.5 first:ml-0"><BrandMark name={g.store.name} bg={g.store.sign.bg} fg={g.store.sign.fg} size={22} /></span>)}</span>
            {bill.count} item{bill.count > 1 ? 's' : ''} from {stores} store{stores > 1 ? 's' : ''} · one payment
          </div>
          <div className="flex items-center gap-3 rounded-[18px] bg-purple-soft px-4 py-3 text-support">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E8B84A] text-[14px] font-bold text-[#7A4A00]">N</span>
            <span>You'll earn <b className="text-purple-ink tnum">{bill.coinsEarned} NeuCoins</b> on this order</span>
          </div>
          {bill.groups.map((g) => <GroupCard key={g.store.id} g={g} />)}
          <Suggestions bill={bill} />
          <Routing bill={bill} />
          <Rewards bill={bill} />
          <BillCard bill={bill} />
        </div>
      )}
    </Sheet>
  )
}

