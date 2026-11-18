import { ArrowRight, ChevronRight, ShoppingCart, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { CartJoystick } from '../cart/CartJoystick'
import { CATEGORY, STRIP, type CategoryId } from '../../data/categories'
import { storeForCategory } from '../../data/stores'
import { PRODUCT_BY_ID } from '../../data/products'
import { PLACE } from '../../data/storeLayout'
import { thumb } from '../../lib/productArt'
import { INTERIORS, activeCart, cartCount, inr, toPay, useCurrentMall, useMall } from '../../state/useMall'
import { BrandMark, cx } from '../ui/primitives'

/** Same compact pill for every category. Selecting one drives NEU CART to that store. */
export function CategorySelector() {
  const mall = useCurrentMall()
  const near = useMall((s) => s.nearStoreId)
  const loc = useMall((s) => s.location)
  const active = loc !== 'lobby' ? mall.stores.find((s) => s.id === loc)?.category : mall.stores.find((s) => s.id === near)?.category
  const go = (c: CategoryId) => {
    const st = storeForCategory(c, mall.stores)
    if (st && st.id !== loc) useMall.getState().travelTo(st.id, true)
  }
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5" role="toolbar" aria-label="Go to a category">
      {STRIP.filter((c) => storeForCategory(c, mall.stores)).map((id) => {
        const c = CATEGORY[id]
        const on = active === id
        return (
          <button
            key={id}
            onClick={() => go(id)}
            aria-pressed={on}
            className={cx('flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors', on ? 'bg-ink text-white' : 'glass text-ink')}
          >
            <c.icon size={15} strokeWidth={1.8} />
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

/** Inside a store: the products on the shelves just ahead, one tap to preview. */
function ProductStrip() {
  const ids = useMall((s) => s.nearProducts)
  useMall((s) => s.thumbsReady)
  if (!ids.length)
    return <div className="glass flex h-[46px] items-center rounded-full px-4 text-support text-ink-2">Drive toward the shelves, or tap a product</div>
  return (
    <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5" role="toolbar" aria-label="Products near you">
      {ids.map((id) => {
        const p = PRODUCT_BY_ID[id]
        const pl = PLACE[id]
        return (
          <button key={id} onClick={() => useMall.getState().showPreview(id, [pl.x, 1.1, pl.z])} className="glass flex h-[46px] shrink-0 items-center gap-2 rounded-full pl-1 pr-3.5">
            {thumb(id) && <img src={thumb(id) || undefined} alt="" className="h-9 w-9 rounded-full bg-white" />}
            <span className="text-left leading-tight">
              <span className="block text-[13px] font-semibold">{p.name.split(',')[0]}</span>
              <span className="block text-micro text-ink-2 tnum">{inr(p.price)} · {p.size}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function CartSummary() {
  const cart = useMall(activeCart)
  const family = useMall((s) => s.cartMode === 'family')
  const total = useMall(toPay)
  const n = cartCount(cart)
  return (
    <motion.button
      key={n}
      initial={{ scale: n ? 0.96 : 1 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 20 }}
      onClick={() => useMall.getState().open({ kind: 'cart' })}
      className="glass flex h-[54px] w-full items-center gap-3 rounded-[18px] pl-2 pr-3 text-left"
      aria-label={`NEU CART${family ? ', family cart' : ''}, ${n} items, ${inr(total)} to pay`}
    >
      <span className="relative grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[13px] bg-ink text-white">
        <ShoppingCart size={18} strokeWidth={1.8} />
        {n > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-purple px-1 text-[10px] font-semibold tnum">{n}</span>}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="flex items-center gap-1 text-micro font-semibold tracking-[0.08em] text-ink-2">NEU CART{family && <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-soft px-1.5 text-[10px] tracking-normal text-purple-ink"><Users size={11} strokeWidth={2} />Family</span>}</span>
        <span className="block truncate text-[14px] font-semibold tnum">{n ? `${n} item${n > 1 ? 's' : ''} · ${inr(total)}` : 'Empty'}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.8} className="text-ink-2" />
    </motion.button>
  )
}

/** When NEU CART faces a store, its details replace the category strip, inside the bottom controls. */
function StoreBar({ id }: { id: string }) {
  const mall = useCurrentMall()
  const st = mall.stores.find((s) => s.id === id)
  if (!st) return null
  const c = CATEGORY[st.category]
  const walkIn = INTERIORS.includes(st.id)
  return (
    <div className="glass flex h-[54px] w-full items-center gap-2.5 rounded-[18px] pl-2 pr-1.5" aria-live="polite">
      <button className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => useMall.getState().open({ kind: 'store', id: st.id })}>
        <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={38} />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[15px] font-semibold">{st.name}</span>
          <span className="block truncate text-micro text-ink-2">{c.label} · {st.fulfilment}</span>
        </span>
      </button>
      {walkIn ? (
        <button onClick={() => useMall.getState().enterStore(st.id)} className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white active:scale-[0.97]">
          Walk in <ArrowRight size={15} strokeWidth={2} />
        </button>
      ) : (
        <ChevronRight size={18} strokeWidth={1.8} className="mr-1.5 shrink-0 text-ink-2" />
      )}
    </div>
  )
}

/** Joystick on the left; categories (or nearby products, in a store) and the cart summary beside it. */
export function BottomNavigation() {
  const near = useMall((s) => s.nearStoreId)
  const loc = useMall((s) => s.location)
  const key = loc !== 'lobby' ? 'products' : near ?? 'cats'
  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] flex max-w-[640px] items-end gap-2.5 sm:left-1/2 sm:right-auto sm:w-[620px] sm:-translate-x-1/2">
      <CartJoystick />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            {loc !== 'lobby' ? <ProductStrip /> : near ? <StoreBar id={near} /> : <CategorySelector />}
          </motion.div>
        </AnimatePresence>
        <CartSummary />
      </div>
    </div>
  )
}
