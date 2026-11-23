import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, X } from '../ui/icons'
import { PRODUCT_BY_ID, alternatives, type Product } from '../../data/products'
import { PLACE } from '../../data/storeLayout'
import { thumb } from '../../lib/productArt'
import { activeCart, inr, qtyOf, useMall, type Vec3 } from '../../state/useMall'
import { Badge, cx } from '../ui/primitives'

/** Where an add-to-cart animation should start: the tapped point, or the product's shelf. */
export function shelfPoint(p: Product, tapped: Vec3 | null): Vec3 | null {
  const loc = useMall.getState().location
  if (loc !== p.storeId) return null
  if (tapped) return tapped
  const pl = PLACE[p.id]
  return pl ? [pl.x, 1.1, pl.z] : null
}

export function QtyControl({ p, from = null, size = 'md' }: { p: Product; from?: Vec3 | null; size?: 'md' | 'lg' }) {
  const q = useMall((s) => qtyOf(activeCart(s), p.id))
  const { add, setQty } = useMall.getState()
  const h = size === 'lg' ? 'h-12' : 'h-10'
  if (!q)
    return (
      <button onClick={() => add(p.id, 1, shelfPoint(p, from))} className={cx(h, 'inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-on-ink active:scale-[0.98]')}>
        <Plus size={17} /> Add to cart
      </button>
    )
  return (
    <div className={cx(h, 'inline-flex flex-1 items-center justify-between rounded-full bg-ink px-2 text-on-ink')}>
      <button aria-label="Remove one" onClick={() => setQty(p.id, q - 1)} className="grid h-8 w-8 place-items-center rounded-full active:bg-on-ink/15"><Minus size={16} /></button>
      <span className="text-sm font-semibold tnum">{q} in cart</span>
      <button aria-label="Add one" onClick={() => add(p.id, 1, shelfPoint(p, from))} className="grid h-8 w-8 place-items-center rounded-full active:bg-on-ink/15"><Plus size={16} /></button>
    </div>
  )
}

export function Price({ p, big }: { p: Product; big?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={cx('font-semibold tnum', big ? 'text-xl' : 'text-price')}>{inr(p.price)}</span>
      {p.mrp && <span className="text-support text-ink-3 line-through tnum">{inr(p.mrp)}</span>}
    </span>
  )
}

/** Floating card for the product in front of you. Alternatives scroll sideways; Details opens the full view. */
export function ProductPreview() {
  const preview = useMall((s) => s.preview)
  const panel = useMall((s) => s.panel)
  useMall((s) => s.thumbsReady)
  const p = preview ? PRODUCT_BY_ID[preview.id] : null
  const alts = p ? alternatives(p).slice(0, 8) : []
  const { showPreview, open } = useMall.getState()
  return (
    <div className="pointer-events-none absolute inset-x-3 top-[calc(64px+env(safe-area-inset-top))] mx-auto max-w-[460px]">
      <AnimatePresence mode="wait">
        {p && !panel && (
          <motion.div
            key={p.id}
            role="dialog"
            aria-label={p.name}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="glass pointer-events-auto rounded-3xl p-3"
          >
            <div className="flex gap-3">
              <button onClick={() => open({ kind: 'product', id: p.id })} className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-2xl bg-cream" aria-label={`Details for ${p.name}`}>
                {thumb(p.id) && <img src={thumb(p.id) || undefined} alt="" className="h-[78px] w-[78px]" />}
              </button>
              <div className="min-w-0 flex-1 pr-6 leading-tight">
                <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">{p.brand}</div>
                <div className="mt-0.5 truncate text-product font-semibold">{p.name}</div>
                <div className="mt-0.5 text-support text-ink-2">{p.size}</div>
                <div className="mt-1 flex items-center gap-2"><Price p={p} />{p.offer && <Badge tone="promo">{p.offer}</Badge>}</div>
              </div>
              <button onClick={() => showPreview(null)} aria-label="Close" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-cream text-ink-2"><X size={15} /></button>
            </div>
            <p className="mt-2 line-clamp-1 text-support text-ink-2">{p.desc}</p>
            <div className="mt-2 flex gap-2">
              <QtyControl p={p} from={preview?.from ?? null} />
              <button onClick={() => open({ kind: 'product', id: p.id })} className="h-10 rounded-full bg-cream px-4 text-sm font-semibold">Details</button>
            </div>
            {alts.length > 0 && (
              <div className="mt-3">
                <div className="mb-2 text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">Alternatives</div>
                <div className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3">
                  {alts.map((a) => (
                    <button key={a.id} onClick={() => showPreview(a.id, null)} className="flex w-[118px] shrink-0 snap-start items-center gap-2 rounded-xl bg-surface/80 p-2 text-left">
                      {thumb(a.id) && <img src={thumb(a.id) || undefined} alt="" className="h-9 w-9 shrink-0 rounded-lg bg-cream" />}
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate text-micro font-semibold">{a.name.split(',')[0]}</span>
                        <span className="text-micro text-ink-2 tnum">{inr(a.price)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
