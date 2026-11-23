import { create } from 'zustand'
import { MALLS, type Mall } from '../data/malls'
import { PRODUCT_BY_ID } from '../data/products'
import { HALL_IDS } from '../data/storeLayout'
import { computeBill } from '../lib/cartMath'
import { REDEMPTIONS, SEED_ACTIVITY, type Activity } from '../data/rewards'
import { FRIEND_BY_ID, SEED_FAMILY_CART, SEED_PRESENCE, type Presence, type Reaction } from '../data/social'

export type View = 'landing' | 'mall'
/** Where NEU CART is: the lobby, or inside a store that has a walk-in interior. */
/** 'lobby', or the id of a store with a walk-in hall */
export type Location = string
export const INTERIORS: Location[] = HALL_IDS

export type Panel =
  | null
  | { kind: 'directory' }
  | { kind: 'search' }
  | { kind: 'wallet' }
  | { kind: 'profile' }
  | { kind: 'cart' }
  | { kind: 'store'; id: string }
  | { kind: 'ad'; id: string }
  | { kind: 'product'; id: string }
  | { kind: 'friends' }
  | { kind: 'friend'; id: string }
  | { kind: 'assistant'; listen?: boolean }
  | { kind: 'notifications' }
  | { kind: 'offers' }

/** `by`: who added it ('you' or a friend id); only used in the family cart */
export type CartLine = { productId: string; qty: number; price: number; storeId: string; by?: string }
export type CartMode = 'mine' | 'family'

/** A placed (simulated) order: one payment, one delivery per store. */
export type Order = {
  id: string
  placedAt: number
  family: boolean
  count: number
  total: number
  saved: number
  coinsUsed: number
  coinsEarned: number
  address: string
  pay: string
  deliveries: { storeId: string; label: string; eta: string; productIds: string[]; count: number }[]
  gifts: { productId: string; friendId: string }[]
}
export type CheckoutStage = 'closed' | 'review' | 'placing' | 'done'
export type Vec3 = [number, number, number]

type MallState = {
  view: View
  /** landing page has scrolled past the hero, so the 3D mall need not render */
  sceneFrozen: boolean
  /** how many wallet activity entries the shopper has already seen */
  alertsSeen: number
  mallId: string
  location: Location
  /** short cream fade while moving between the lobby and a store */
  fading: boolean
  panel: Panel
  nearStoreId: string | null
  /** product shown in the floating preview card, and where it was picked from */
  preview: { id: string; from: Vec3 | null } | null
  travel: { storeId: string; nonce: number; enter?: boolean } | null
  /** drive to a product's shelf inside the current store */
  seek: { productId: string; nonce: number; then?: 'preview' } | null
  /** a product just added: CartRig animates it from `from` into the basket */
  flight: { productId: string; from: Vec3; nonce: number } | null
  thumbsReady: boolean
  /** products on the shelves just ahead of the cart (inside a store) */
  nearProducts: string[]
  storeSection: string
  coins: number
  cart: CartLine[]
  adTaps: Record<string, number>
  /** NeuCoins history, newest first */
  activity: Activity[]
  /** coins earned over the last 12 months (drives the membership tier) */
  yearEarned: number
  /** coins flying to the wallet after an add-to-cart raises what this order earns */
  coinBurst: { amount: number; nonce: number } | null
  redeem: (id: string) => boolean
  /** pay part of the order with NeuCoins */
  useCoins: boolean
  setUseCoins: (v: boolean) => void
  removeLine: (productId: string) => void
  /** brief confirmation after adding to the cart */
  toast: { text: string; productId: string; nonce: number } | null
  enterMall: () => void
  toLanding: () => void
  selectMall: (id: string) => void
  open: (p: Panel) => void
  close: () => void
  /** drive to a storefront; with enter, walk straight in when the store has an interior */
  travelTo: (storeId: string, enter?: boolean) => void
  clearTravel: () => void
  setNearStore: (id: string | null) => void
  enterStore: (loc: Location, then?: () => void) => void
  showPreview: (id: string | null, from?: Vec3 | null) => void
  seekProduct: (id: string, then?: 'preview') => void
  add: (productId: string, qty?: number, from?: Vec3 | null) => void
  setQty: (productId: string, qty: number) => void
  /** the last item you added (the social simulation reacts to it) */
  lastAdd: { productId: string; nonce: number } | null

  // ---- social shopping (Sprint 8) ----
  /** which cart new items go into: your private cart or the shared family cart */
  cartMode: CartMode
  setCartMode: (m: CartMode) => void
  familyCart: CartLine[]
  presence: Record<string, Presence>
  /** a simulated shared session with one friend */
  session: { with: string; since: number } | null
  startSession: (friendId: string) => void
  endSession: () => void
  /** reactions on cart items, by product id */
  reactions: Record<string, { by: string; r: Reaction }[]>
  react: (productId: string, by: string, r: Reaction) => void
  /** items in your cart that are gifts: product id -> friend id */
  gifts: Record<string, string>
  giftTo: (productId: string, friendId: string) => void
  wave: (friendId: string) => void
  joinFriend: (friendId: string) => void
  /** quiet note about what friends are doing */
  nudge: { friendId: string; text: string; nonce: number } | null
  say: (friendId: string, text: string) => void
  setPresence: (friendId: string, p: Presence) => void
  /** a friend adds to the family cart */
  friendAdd: (friendId: string, productId: string) => void

  // ---- checkout (Sprint 9) ----
  checkout: CheckoutStage
  openCheckout: () => void
  closeCheckout: () => void
  /** the order being placed or just placed */
  order: Order | null
  orders: Order[]
  placeOrder: (o: { address: string; pay: string; slot?: string }) => void
}

export const useMall = create<MallState>((set, get) => ({
  view: 'landing',
  sceneFrozen: false,
  alertsSeen: SEED_ACTIVITY.length,
  mallId: 'tata',
  location: 'lobby',
  fading: false,
  panel: null,
  nearStoreId: null,
  preview: null,
  travel: null,
  seek: null,
  flight: null,
  thumbsReady: false,
  nearProducts: [],
  storeSection: 'Entrance',
  coins: 3240,
  cart: [],
  adTaps: {},
  activity: SEED_ACTIVITY,
  yearEarned: 6840,
  coinBurst: null,
  lastAdd: null,
  cartMode: 'mine',
  setCartMode: (cartMode) => set({ cartMode }),
  familyCart: SEED_FAMILY_CART.map((l) => ({ ...l, price: PRODUCT_BY_ID[l.productId].price, storeId: PRODUCT_BY_ID[l.productId].storeId })),
  presence: SEED_PRESENCE,
  session: null,
  startSession: (id) => {
    set({ session: { with: id, since: Date.now() }, cartMode: 'family', panel: null })
    get().say(id, `Invite sent to ${FRIEND_BY_ID[id].name}`)
  },
  endSession: () => {
    const s = get()
    if (!s.session) return
    const name = FRIEND_BY_ID[s.session.with].name
    set({ session: null })
    s.say(s.session.with, `You left the session with ${name}`)
  },
  reactions: { banana: [{ by: 'amma', r: 'yes' }] },
  react: (productId, by, r) =>
    set((s) => {
      const list = s.reactions[productId] ?? []
      const mine = list.find((x) => x.by === by)
      const next = mine && mine.r === r ? list.filter((x) => x.by !== by) : [...list.filter((x) => x.by !== by), { by, r }]
      return { reactions: { ...s.reactions, [productId]: next } }
    }),
  gifts: {},
  giftTo: (productId, friendId) => {
    const p = PRODUCT_BY_ID[productId]
    set((s) => {
      const i = s.cart.findIndex((l) => l.productId === productId)
      const cart = i >= 0 ? s.cart : [...s.cart, { productId, qty: 1, price: p.price, storeId: p.storeId }]
      return {
        cart,
        gifts: { ...s.gifts, [productId]: friendId },
        toast: { text: `Gift for ${FRIEND_BY_ID[friendId].name} in your cart`, productId, nonce: (s.toast?.nonce ?? 0) + 1 },
      }
    })
  },
  wave: (id) => {
    const f = FRIEND_BY_ID[id]
    const pr = get().presence[id]
    get().say(id, pr?.status === 'online' ? `You waved at ${f.name}` : `${f.name} will see your wave next time`)
  },
  joinFriend: (id) => {
    const at = get().presence[id]?.at
    if (!at) return
    set({ panel: null })
    if (at === 'lobby') get().enterStore('lobby')
    else get().travelTo(at, true)
  },
  nudge: null,
  say: (friendId, text) => set((s) => ({ nudge: { friendId, text, nonce: (s.nudge?.nonce ?? 0) + 1 } })),
  setPresence: (id, p) => set((s) => ({ presence: { ...s.presence, [id]: p } })),
  friendAdd: (id, productId) => {
    const p = PRODUCT_BY_ID[productId]
    set((s) => {
      const i = s.familyCart.findIndex((l) => l.productId === productId)
      const familyCart = i >= 0 ? s.familyCart.map((l, k) => (k === i ? { ...l, qty: l.qty + 1 } : l)) : [...s.familyCart, { productId, qty: 1, price: p.price, storeId: p.storeId, by: id }]
      return { familyCart }
    })
    get().say(id, `${FRIEND_BY_ID[id].name} added ${p.name.split(',')[0].toLowerCase()} to the family cart`)
  },
  checkout: 'closed',
  openCheckout: () => { if (activeCart(get()).length) set({ checkout: 'review', panel: null, preview: null }) },
  closeCheckout: () => set({ checkout: 'closed' }),
  order: null,
  orders: [],
  placeOrder: ({ address, pay, slot }) => {
    const s = get()
    const lines = activeCart(s)
    if (!lines.length || s.checkout !== 'review') return
    const bill = computeBill(lines, { useCoins: s.useCoins, balance: s.coins, yearEarned: s.yearEarned })
    const family = s.cartMode === 'family'
    const order: Order = {
      id: 'TM' + String(Math.floor(100000 + Math.random() * 900000)),
      placedAt: Date.now(),
      family,
      count: bill.count,
      total: bill.total,
      saved: bill.totalSaved,
      coinsUsed: bill.coinsUsed,
      coinsEarned: bill.coinsEarned,
      address,
      pay,
      deliveries: bill.groups.map((g) => ({
        storeId: g.store.id,
        label: g.label,
        eta: g.store.id === 'bigbasket' && slot ? slot : g.eta,
        productIds: g.lines.map((l) => l.p.id),
        count: g.count,
      })),
      gifts: family ? [] : lines.filter((l) => s.gifts[l.productId]).map((l) => ({ productId: l.productId, friendId: s.gifts[l.productId] })),
    }
    set({ checkout: 'placing', order })
    setTimeout(() => {
      const st = get()
      const ts = Date.now()
      const activity: Activity[] = [
        { id: `e${ts}`, label: 'Tata Mall order', detail: `${order.id} · ${order.count} items`, amount: order.coinsEarned, when: 'Just now' },
        ...(order.coinsUsed ? [{ id: `u${ts}`, label: 'Used at checkout', detail: order.id, amount: -order.coinsUsed, when: 'Just now' }] : []),
        ...st.activity,
      ]
      set({
        checkout: 'done',
        orders: [order, ...st.orders],
        ...(family ? { familyCart: [] } : { cart: [], gifts: {} }),
        coins: st.coins - order.coinsUsed + order.coinsEarned,
        yearEarned: st.yearEarned + order.coinsEarned,
        useCoins: false,
        activity,
      })
      if (family && st.session) {
        const f = FRIEND_BY_ID[st.session.with]
        setTimeout(() => get().say(f.id, `${f.name} saw the family order go through`), 2200)
      }
    }, reduceMotionPref() ? 500 : 1700)
  },
  redeem: (id) => {
    const r = REDEMPTIONS.find((x) => x.id === id)
    const s = get()
    if (!r || s.coins < r.cost) return false
    set({
      coins: s.coins - r.cost,
      activity: [{ id: `r${Date.now()}`, label: `Redeemed with ${r.partner}`, detail: r.title, amount: -r.cost, when: 'Just now' }, ...s.activity],
      toast: { text: `${r.title} · ${r.cost.toLocaleString('en-IN')} NeuCoins`, productId: '', nonce: (s.toast?.nonce ?? 0) + 1 },
    })
    return true
  },
  useCoins: false,
  setUseCoins: (useCoins) => set({ useCoins }),
  removeLine: (productId) =>
    set((s) => (s.cartMode === 'family'
      ? { familyCart: s.familyCart.filter((l) => l.productId !== productId) }
      : { cart: s.cart.filter((l) => l.productId !== productId), gifts: dropKey(s.gifts, productId) })),
  toast: null,
  enterMall: () => set({ view: 'mall', panel: null }),
  toLanding: () => {
    if (get().location !== 'lobby') set({ location: 'lobby' })
    set({ view: 'landing', panel: null, travel: null, nearStoreId: null, preview: null })
  },
  selectMall: (id) => set({ mallId: id }),
  open: (panel) =>
    set((s) => ({
      panel,
      // count taps per campaign (prototype analytics for the advertising model)
      adTaps: panel?.kind === 'ad' ? { ...s.adTaps, [panel.id]: (s.adTaps[panel.id] ?? 0) + 1 } : s.adTaps,
    })),
  close: () => set({ panel: null }),
  travelTo: (storeId, enter = false) => {
    const s = get()
    if (s.location !== 'lobby') {
      set({ panel: null, preview: null })
      // store to store: another section of the same mall, so go straight there
      if (INTERIORS.includes(storeId)) { s.enterStore(storeId); return }
      // otherwise leave the store first, then drive in the lobby
      s.enterStore('lobby', () => set((st) => ({ travel: { storeId, nonce: (st.travel?.nonce ?? 0) + 1 } })))
      return
    }
    set((st) => ({ travel: { storeId, enter, nonce: (st.travel?.nonce ?? 0) + 1 }, panel: null, preview: null }))
  },
  clearTravel: () => set({ travel: null }),
  setNearStore: (id) => set((s) => (s.nearStoreId === id ? s : { nearStoreId: id })),
  enterStore: (loc, then) => {
    // mid-fade: finish the current move first, then make this one (a quick second tap used to be dropped)
    if (get().fading) { setTimeout(() => get().enterStore(loc, then), 300); return }
    if (get().location === loc) { then?.(); return }
    set({ fading: true, panel: null, preview: null, nearStoreId: null })
    setTimeout(() => {
      set({ location: loc })
      setTimeout(() => { set({ fading: false }); then?.() }, 260)
    }, 320)
  },
  showPreview: (id, from = null) => set({ preview: id ? { id, from } : null }),
  seekProduct: (id, then) => {
    const p = PRODUCT_BY_ID[id]
    const go = () => set((st) => ({ seek: { productId: id, nonce: (st.seek?.nonce ?? 0) + 1, then } }))
    set({ panel: null, preview: null })
    if (get().view !== 'mall') set({ view: 'mall' })
    if (get().location === p.storeId) go()
    else get().enterStore(p.storeId, go)
  },
  add: (productId, qty = 1, from = null) => {
    const p = PRODUCT_BY_ID[productId]
    const before = computeBill(activeCart(get()), { useCoins: false, balance: 0, yearEarned: get().yearEarned }).coinsEarned
    set((s) => {
      const fam = s.cartMode === 'family'
      const list = fam ? s.familyCart : s.cart
      const i = list.findIndex((l) => l.productId === productId)
      const next = i >= 0 ? list.map((l, k) => (k === i ? { ...l, qty: l.qty + qty } : l)) : [...list, { productId, qty, price: p.price, storeId: p.storeId, ...(fam ? { by: 'you' } : {}) }]
      return {
        ...(fam ? { familyCart: next } : { cart: next }),
        flight: from ? { productId, from, nonce: (s.flight?.nonce ?? 0) + 1 } : s.flight,
        toast: { text: fam ? `Added ${p.name.split(',')[0]} to the family cart` : `Added ${p.name.split(',')[0]}`, productId, nonce: (s.toast?.nonce ?? 0) + 1 },
        lastAdd: { productId, nonce: (s.lastAdd?.nonce ?? 0) + 1 },
      }
    })
    const gained = computeBill(activeCart(get()), { useCoins: false, balance: 0, yearEarned: get().yearEarned }).coinsEarned - before
    if (gained > 0) set((s) => ({ coinBurst: { amount: gained, nonce: (s.coinBurst?.nonce ?? 0) + 1 } }))
  },
  setQty: (productId, qty) => {
    if (qty <= 0) { get().removeLine(productId); return }
    set((s) => {
      const upd = (c: CartLine[]) => c.map((l) => (l.productId === productId ? { ...l, qty } : l))
      return s.cartMode === 'family' ? { familyCart: upd(s.familyCart) } : { cart: upd(s.cart) }
    })
  },
}))

export const currentMall = (): Mall => MALLS.find((m) => m.id === useMall.getState().mallId) ?? MALLS[0]
export const useCurrentMall = (): Mall => {
  const id = useMall((s) => s.mallId)
  return MALLS.find((m) => m.id === id) ?? MALLS[0]
}

const reduceMotionPref = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const dropKey = <T,>(o: Record<string, T>, k: string) => { const { [k]: _, ...rest } = o; return rest }
/** the cart new items go into, and the one NEU CART shows */
export const activeCart = (s: { cartMode: CartMode; cart: CartLine[]; familyCart: CartLine[] }) => (s.cartMode === 'family' ? s.familyCart : s.cart)

export const cartCount = (c: CartLine[]) => c.reduce((a, l) => a + l.qty, 0)
export const cartTotal = (c: CartLine[]) => c.reduce((a, l) => a + l.qty * l.price, 0)
/** What the shopper will actually pay (offers, fees and NeuCoins applied), same as the cart sheet. */
export const toPay = (s: { cartMode: CartMode; cart: CartLine[]; familyCart: CartLine[]; useCoins: boolean; coins: number; yearEarned: number }) => computeBill(activeCart(s), { useCoins: s.useCoins, balance: s.coins, yearEarned: s.yearEarned }).total
export const qtyOf = (c: CartLine[], id: string) => c.find((l) => l.productId === id)?.qty ?? 0
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
