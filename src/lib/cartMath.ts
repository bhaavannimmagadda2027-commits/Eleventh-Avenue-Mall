import { CATEGORY, type CategoryId } from '../data/categories'
import { PRODUCT_BY_ID, type Product } from '../data/products'
import { tierFor } from '../data/rewards'
import { STORE_BY_ID, type Store } from '../data/stores'
import type { CartLine } from '../state/useMall'

/**
 * All cart arithmetic in one place so every screen shows the same numbers.
 * Offers, fees and NeuCoins rules are illustrative prototype values.
 */

export const COIN_VALUE = 1 // ₹ per NeuCoin
export const COIN_REDEEM_CAP = 0.1 // up to 10% of items can be paid with NeuCoins

type Fulfilment = { source: string; fee: (subtotal: number) => number; freeAbove?: number }

/** How each store's part of the order reaches the shopper. */
const FULFIL: Record<string, Fulfilment> = {
  bigbasket: { source: 'Fulfilled by a nearby partner store', fee: (s) => (s < 299 ? 25 : 0), freeAbove: 299 },
  palette: { source: 'Fulfilled by a participating retailer', fee: (s) => (s < 499 ? 40 : 0), freeAbove: 499 },
  croma: { source: 'Fulfilled by a participating retailer', fee: () => 0 },
  zudio: { source: 'Fulfilled by a participating retailer', fee: (s) => (s < 399 ? 39 : 0), freeAbove: 399 },
  'westside-home': { source: 'Fulfilled by a participating retailer', fee: (s) => (s < 999 ? 79 : 0), freeAbove: 999 },
}
const DEFAULT_FULFIL: Fulfilment = { source: 'Fulfilled by a participating retailer', fee: () => 0 }

export type Offer = { id: string; label: string; amount: number; kind: 'discount' | 'coins' }

/** Store-level offers. Each returns what it is worth for the lines in that store. */
function storeOffers(storeId: string, lines: Line[]): Offer[] {
  const out: Offer[] = []
  if (storeId === 'bigbasket') {
    const cereals = lines.filter((l) => ['cornflakes', 'muesli', 'oats'].includes(l.p.id)).reduce((a, l) => a + l.qty, 0)
    const pairs = Math.floor(cereals / 2)
    if (pairs) out.push({ id: 'bb-breakfast', label: `Breakfast week: buy 2 cereals, save ₹40${pairs > 1 ? ` (×${pairs})` : ''}`, amount: 40 * pairs, kind: 'discount' })
    const produce = lines.filter((l) => l.p.section === 'vegetables' || l.p.section === 'fruits').reduce((a, l) => a + l.total, 0)
    const bonus = Math.floor(produce / 100)
    if (bonus) out.push({ id: 'bb-fresh', label: '2× NeuCoins on fresh produce', amount: bonus, kind: 'coins' })
  }
  if (storeId === 'palette' && lines.some((l) => l.p.id === 'serum')) out.push({ id: 'palette-serum', label: 'Free mini cleanser with your skincare', amount: 0, kind: 'discount' })
  return out
}

export type Line = { p: Product; qty: number; unit: number; total: number; mrpTotal: number }

export type Group = {
  store: Store
  category: CategoryId
  label: string // e.g. "Grocery"
  source: string // e.g. "Fulfilled by a nearby partner store"
  eta: string
  lines: Line[]
  count: number
  subtotal: number
  mrpSavings: number
  offers: Offer[]
  discount: number
  fee: number
  freeAbove?: number
  /** membership tier that waived this store's delivery fee */
  feeWaivedBy?: string
}

export type Bill = {
  groups: Group[]
  count: number
  mrpTotal: number
  itemsTotal: number // at selling price
  mrpSavings: number
  offerDiscount: number
  fees: number
  coinsUsed: number
  total: number
  coinsEarned: number
  bonusCoins: number
  maxRedeem: number
  totalSaved: number
}

const etaOf = (st: Store) => {
  const e = st.fulfilment.split('·').pop()?.trim() ?? st.fulfilment
  return e.charAt(0).toUpperCase() + e.slice(1)
}

export function computeBill(cart: CartLine[], opts: { useCoins: boolean; balance: number; yearEarned?: number }): Bill {
  const tier = tierFor(opts.yearEarned ?? 0)
  const byStore = new Map<string, Line[]>()
  for (const l of cart) {
    const p = PRODUCT_BY_ID[l.productId]
    if (!p) continue
    const line: Line = { p, qty: l.qty, unit: p.price, total: p.price * l.qty, mrpTotal: (p.mrp ?? p.price) * l.qty }
    byStore.set(p.storeId, [...(byStore.get(p.storeId) ?? []), line])
  }
  const groups: Group[] = [...byStore.entries()].map(([storeId, lines]) => {
    const store = STORE_BY_ID[storeId]
    const f = FULFIL[storeId] ?? DEFAULT_FULFIL
    const subtotal = lines.reduce((a, l) => a + l.total, 0)
    const offers = storeOffers(storeId, lines)
    const discount = offers.filter((o) => o.kind === 'discount').reduce((a, o) => a + o.amount, 0)
    const standardFee = f.fee(subtotal - discount)
    return {
      store,
      category: store.category,
      label: CATEGORY[store.category].label,
      source: f.source,
      eta: etaOf(store),
      lines,
      count: lines.reduce((a, l) => a + l.qty, 0),
      subtotal,
      mrpSavings: lines.reduce((a, l) => a + l.mrpTotal - l.total, 0),
      offers,
      discount,
      fee: tier.freeDelivery ? 0 : standardFee,
      feeWaivedBy: tier.freeDelivery && standardFee > 0 ? tier.name : undefined,
      freeAbove: f.freeAbove,
    }
  })
  // fastest deliveries first: grocery, then same-day, then the rest
  const rank = (g: Group) => (g.store.id === 'bigbasket' ? 0 : /today|same/i.test(g.eta) ? 1 : 2)
  groups.sort((a, b) => rank(a) - rank(b))

  const itemsTotal = groups.reduce((a, g) => a + g.subtotal, 0)
  const mrpTotal = groups.reduce((a, g) => a + g.lines.reduce((x, l) => x + l.mrpTotal, 0), 0)
  const offerDiscount = groups.reduce((a, g) => a + g.discount, 0)
  const fees = groups.reduce((a, g) => a + g.fee, 0)
  const afterOffers = itemsTotal - offerDiscount
  const maxRedeem = Math.max(0, Math.min(opts.balance, Math.floor(afterOffers * COIN_REDEEM_CAP)))
  const coinsUsed = opts.useCoins ? maxRedeem : 0
  const total = Math.max(0, afterOffers + fees - coinsUsed * COIN_VALUE)
  const offerCoins = groups.reduce((a, g) => a + g.offers.filter((o) => o.kind === 'coins').reduce((x, o) => x + o.amount, 0), 0)
  const baseCoins = Math.floor((afterOffers - coinsUsed) / 100)
  // the tier rate multiplies everything earned on the order, including offer coins
  const coinsEarned = Math.floor((baseCoins + offerCoins) * tier.coinRate)
  const bonusCoins = coinsEarned - baseCoins
  return {
    groups,
    count: groups.reduce((a, g) => a + g.count, 0),
    mrpTotal,
    itemsTotal,
    mrpSavings: mrpTotal - itemsTotal,
    offerDiscount,
    fees,
    coinsUsed,
    total,
    coinsEarned,
    bonusCoins,
    maxRedeem,
    totalSaved: mrpTotal - itemsTotal + offerDiscount + coinsUsed,
  }
}
