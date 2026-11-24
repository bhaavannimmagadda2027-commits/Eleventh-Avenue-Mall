import { useMemo, useState } from 'react'
import { ArrowRight, Check, Info, MapPin, Search } from '../ui/icons'
import { PRODUCTS, PRODUCT_BY_ID, alternatives } from '../../data/products'
import { STORE_BY_ID } from '../../data/stores'
import { HALLS, PLACE } from '../../data/storeLayout'
import { MallMap } from '../navigation/MallMap'
import { thumb } from '../../lib/productArt'
import { Price, QtyControl } from '../products/ProductPreview'
import { RewardsWallet } from '../rewards/RewardsWallet'
import { AssistantPanel, NotificationsPanel, OffersPanel } from './HudPanels'
import { FriendPanel, FriendsPanel, GiftPicker } from '../social/FriendsPanel'
import { FRIEND_BY_ID } from '../../data/social'
import { ADS } from '../../data/advertisements'
import { CATEGORIES, CATEGORY } from '../../data/categories'
import { AD_BY_ID } from '../../data/advertisements'
import { MALLS } from '../../data/malls'
import type { Store } from '../../data/stores'
import { adImage } from '../../lib/textures'
import { INTERIORS, inr, useCurrentMall, useMall } from '../../state/useMall'
import { Sheet } from '../ui/FloatingCard'
import { Badge, BrandMark, Button, cx } from '../ui/primitives'

const floorLabel = (s: Store) => (s.level ? 'First floor' : 'Ground floor')

function StoreRow({ st, onGo }: { st: Store; onGo: () => void }) {
  const Cat = CATEGORY[st.category]
  return (
    <button onClick={onGo} className="flex w-full items-center gap-3 py-3 text-left">
      <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-product font-semibold">{st.name}</span>
        <span className="mt-0.5 flex items-center gap-1 text-support text-ink-2"><Cat.icon size={13} />{Cat.label} · {floorLabel(st)}</span>
      </span>
      <ArrowRight size={18} className="text-ink-3" />
    </button>
  )
}

function go(st: Store) {
  useMall.getState().travelTo(st.id)
}

function Directory() {
  const mall = useCurrentMall()
  const cats = CATEGORIES.filter((c) => mall.stores.some((s) => s.category === c.id))
  return (
    <div className="flex flex-col gap-3 pb-2">
      <p className="text-support text-ink-2">{mall.stores.length} stores on two floors. Tap a store and NEU CART will take you there.</p>
      {cats.map((c) => (
        <section key={c.id} className="rounded-2xl bg-surface px-4 py-1 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 pb-0.5 pt-3 text-micro font-semibold uppercase tracking-[0.08em] text-ink-2">
            <c.icon size={14} className="text-purple-ink" />{c.label}
          </div>
          <div className="divide-y divide-soft">
            {mall.stores.filter((s) => s.category === c.id).map((st) => <StoreRow key={st.id} st={st} onGo={() => go(st)} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function SearchPanel() {
  const mall = useCurrentMall()
  const [q, setQ] = useState('')
  const t = q.trim().toLowerCase()
  const stores = useMemo(
    () => mall.stores.filter((s) => !t || `${s.name} ${s.tagline} ${CATEGORY[s.category].label}`.toLowerCase().includes(t)),
    [mall, t],
  )
  const products = useMemo(() => (t ? PRODUCTS.filter((p) => PLACE[p.id] && `${p.name} ${p.brand} ${p.section} ${p.desc}`.toLowerCase().includes(t)).slice(0, 8) : []), [t])
  const brands = useMemo(() => {
    if (!t) return []
    const seen = new Map<string, number>()
    for (const p of PRODUCTS) if (PLACE[p.id] && p.brand.toLowerCase().includes(t)) seen.set(p.brand, (seen.get(p.brand) ?? 0) + 1)
    return [...seen].filter(([b]) => b.toLowerCase() !== t).slice(0, 8)
  }, [t])
  // aisles: every signed run of shelves inside the walk-in stores
  const aisles = useMemo(() => (t ? Object.values(HALLS).flatMap((h) => h.runs.map((r) => ({ hall: h.id, sign: r.sign, first: r.products[0] })))
    .filter((a) => `${a.sign} ${STORE_BY_ID[a.hall]?.name ?? ''}`.toLowerCase().includes(t)).slice(0, 6) : []), [t])
  const head = 'mb-2 text-micro font-semibold uppercase tracking-[0.08em] text-ink-2'
  return (
    <div className="flex flex-col gap-3 pb-2">
      <label className="flex h-12 items-center gap-2 rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
        <Search size={18} className="text-ink-2" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stores, categories or products" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3" />
      </label>
      {!t && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {CATEGORIES.filter((c) => mall.stores.some((s) => s.category === c.id)).map((c) => (
            <button key={c.id} onClick={() => setQ(c.label)} className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-surface px-3 text-xs font-medium shadow-[var(--shadow-soft)]">
              <c.icon size={15} />{c.label}
            </button>
          ))}
        </div>
      )}
      {products.length > 0 && (
        <section>
          <div className={head}>Products · tap to go to the shelf</div>
          <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
            {products.map((p) => (
              <button key={p.id} onClick={() => useMall.getState().seekProduct(p.id, 'preview')} className="flex w-full items-center gap-3 py-2 text-left">
                <img src={thumb(p.id) || undefined} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-cream" />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-product font-semibold">{p.name}</span>
                  <span className="text-support text-ink-2">{STORE_BY_ID[p.storeId].name} · {p.size}</span>
                </span>
                <span className="text-sm font-semibold tnum">{inr(p.price)}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {brands.length > 0 && (
        <section>
          <div className={head}>Brands</div>
          <div className="flex flex-wrap gap-2">
            {brands.map(([b, n]) => (
              <button key={b} onClick={() => setQ(b)} className="flex h-9 items-center gap-2 rounded-full bg-surface px-3 text-xs font-medium shadow-[var(--shadow-soft)]">
                {b}<span className="text-ink-3 tnum">{n}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {(stores.length > 0 || (!products.length && !brands.length && !aisles.length)) && (
        <section>
          {t && <div className={head}>Stores · tap and NEU CART takes you there</div>}
          <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
            {stores.length ? stores.map((st) => <StoreRow key={st.id} st={st} onGo={() => go(st)} />) : (
              <p className="py-4 text-support text-ink-2">Nothing matches “{q}”. Try milk, bread, Croma or beauty.</p>
            )}
          </div>
        </section>
      )}
      {aisles.length > 0 && (
        <section>
          <div className={head}>Aisles</div>
          <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
            {aisles.map((a) => (
              <button key={a.hall + a.sign} onClick={() => useMall.getState().seekProduct(a.first)} className="flex w-full items-center gap-3 py-3 text-left">
                <MapPin size={18} className="shrink-0 text-purple-ink" />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-product font-semibold">{a.sign.charAt(0) + a.sign.slice(1).toLowerCase()}</span>
                  <span className="text-support text-ink-2">{STORE_BY_ID[a.hall]?.name}</span>
                </span>
                <ArrowRight size={18} className="text-ink-3" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Prototype view of the advertising model: live campaigns and taps this session. */
function CampaignStats() {
  const taps = useMall((s) => s.adTaps)
  const total = Object.values(taps).reduce((a, b) => a + b, 0)
  const top = [...ADS].sort((a, b) => (taps[b.id] ?? 0) - (taps[a.id] ?? 0)).slice(0, 3)
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">Brand campaigns</span>
        <span className="text-micro text-ink-2">This session</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-cream p-3"><div className="text-xl font-semibold tnum">{ADS.length}</div><div className="text-micro text-ink-2">Live in this mall</div></div>
        <div className="rounded-xl bg-cream p-3"><div className="text-xl font-semibold tnum">{total}</div><div className="text-micro text-ink-2">Ad taps</div></div>
      </div>
      {total > 0 && (
        <div className="mt-2 divide-y divide-soft">
          {top.filter((a) => taps[a.id]).map((a) => (
            <div key={a.id} className="flex justify-between py-2 text-support"><span className="truncate">{a.brand} · {a.title.replace('\n', ' ')}</span><span className="tnum text-ink-2">{taps[a.id]}</span></div>
          ))}
        </div>
      )}
      <p className="mt-2 text-micro text-ink-3">Illustrative. Shows how placements in the mall can be measured for advertisers.</p>
    </div>
  )
}

function Orders() {
  const orders = useMall((s) => s.orders)
  if (!orders.length) return null
  return (
    <section className="rounded-2xl bg-surface px-4 py-1 shadow-[var(--shadow-soft)]">
      <div className="flex items-baseline justify-between pb-1 pt-3"><span className="text-sm font-semibold">Your orders</span><span className="text-micro text-ink-2">Simulated</span></div>
      <div className="divide-y divide-soft">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center gap-3 py-3">
            <span className="flex shrink-0">{o.deliveries.map((d) => { const st = STORE_BY_ID[d.storeId]; return <span key={d.storeId} className="-ml-2 first:ml-0"><BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={26} /></span> })}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-semibold"><span className="tnum">{o.id}</span>{o.family ? ' · Family' : ''}</div>
              <div className="truncate text-micro text-ink-2">{o.count} items · {o.deliveries.length} deliver{o.deliveries.length > 1 ? 'ies' : 'y'} · {o.address}</div>
            </div>
            <div className="text-right leading-tight"><div className="text-sm font-semibold tnum">{inr(o.total)}</div><div className="text-micro text-success">On the way</div></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProfilePanel() {
  const mallId = useMall((s) => s.mallId)
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[var(--shadow-soft)]">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-purple-soft text-lg font-semibold text-purple-ink">R</span>
        <div className="leading-tight"><div className="text-product font-semibold">Rahul</div><div className="text-support text-ink-2">Indiranagar, Bengaluru</div></div>
      </div>
      <Orders />
      <CampaignStats />
      <div className="text-sm font-semibold">Malls</div>
      <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
        {MALLS.map((m) => (
          <button key={m.id} disabled={!m.available} onClick={() => useMall.getState().selectMall(m.id)} className="flex w-full items-center gap-3 py-3 text-left disabled:cursor-default">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold text-white" style={{ background: m.tone }}>{m.initial}</span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-product font-semibold">{m.name}</span>
              <span className="text-support text-ink-2">{m.group} · {m.city}</span>
            </span>
            {m.id === mallId ? <Check size={18} className="text-success" /> : <Badge>Coming soon</Badge>}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductPanel({ id }: { id: string }) {
  const p = PRODUCT_BY_ID[id]
  useMall((s) => s.thumbsReady)
  const preview = useMall((s) => s.preview)
  const alts = alternatives(p).slice(0, 6)
  const st = STORE_BY_ID[p.storeId]
  const mins = 2 + (p.id.length % 5)
  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="grid h-[210px] place-items-center rounded-3xl bg-cream">
        {thumb(p.id) && <img src={thumb(p.id) || undefined} alt={p.name} className="h-[200px] w-[200px]" />}
      </div>
      <div className="leading-tight">
        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">{p.brand}</div>
        <div className="mt-1 text-store font-semibold tracking-[-0.01em]">{p.name}</div>
        <div className="mt-1 text-support text-ink-2">{p.size}</div>
        <div className="mt-2 flex items-center gap-2"><Price p={p} big />{p.offer && <Badge tone="promo">{p.offer}</Badge>}</div>
        <p className="mt-2 text-support text-ink-2">{p.desc}</p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-soft)]">
        <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={34} />
        <div className="min-w-0 flex-1 leading-tight"><div className="text-sm font-semibold">{st.name}</div><div className="text-micro text-ink-2">{st.fulfilment}</div></div>
      </div>
      <GiftPicker productId={p.id} />
      {p.tray && (
        <section className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
          <div className="relative">
            <img src={p.tray} alt={`Overhead camera view of the ${p.name} tray`} className="block aspect-[382/162] w-full object-cover" />
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-2 rounded-full bg-[rgb(38_38_38/0.6)] px-2 py-1 text-micro font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E5484D]" />LIVE · Tray {p.id.slice(0, 2).toUpperCase()}-{(p.id.length % 9) + 1}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="leading-tight"><div className="text-sm font-semibold">Dark-store produce view</div><div className="text-micro text-ink-2">Updated {mins} min ago · In stock</div></div>
            <Badge tone="success">Picked from this tray</Badge>
          </div>
          <p className="px-4 pb-3 text-micro text-ink-3">Visual inventory preview. In this prototype the photo is a sample image, not a live camera.</p>
        </section>
      )}
      {alts.length > 0 && (
        <section>
          <div className="mb-2 text-sm font-semibold">Alternatives</div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4">
            {alts.map((a) => (
              <button key={a.id} onClick={() => useMall.getState().open({ kind: 'product', id: a.id })} className="w-[120px] shrink-0 snap-start rounded-2xl bg-surface p-2 text-left shadow-[var(--shadow-soft)]">
                <img src={thumb(a.id) || undefined} alt="" className="mx-auto h-[84px] w-[84px]" />
                <div className="mt-1 truncate text-xs font-semibold">{a.name.split(',')[0]}</div>
                <div className="text-micro text-ink-2 tnum">{inr(a.price)} · {a.size}</div>
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="sticky bottom-0 -mx-4 flex gap-2 bg-bg px-4 pt-2">
        <QtyControl p={p} size="lg" from={preview?.id === p.id ? preview.from : null} />
      </div>
    </div>
  )
}

function AdPanel({ id }: { id: string }) {
  const mall = useCurrentMall()
  const ad = AD_BY_ID[id]
  const st = mall.stores.find((s) => s.id === ad.storeId)
  const img = useMemo(() => adImage(ad), [ad])
  const product = ad.productId && PLACE[ad.productId] ? PRODUCT_BY_ID[ad.productId] : null
  useMall((s) => s.thumbsReady)
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]">
        <img src={img} alt={`${ad.brand} campaign`} className="block w-full" />
      </div>
      <div>
        <Badge tone="purple">Sponsored</Badge>
        <div className="mt-2 text-store font-semibold tracking-[-0.01em]">{ad.offer}</div>
        {st && <div className="mt-0.5 flex items-center gap-1 text-support text-ink-2"><MapPin size={13} />{st.name} · {floorLabel(st)}</div>}
      </div>
      <div className="flex gap-2 rounded-2xl bg-surface p-3 text-support text-ink-2 shadow-[var(--shadow-soft)]">
        <Info size={16} className="mt-0.5 shrink-0 text-ink-3" />
        <span>Brands pay to appear on panels around the mall. Ads stay on walls and screens and never cover products or interrupt checkout. Illustrative campaign.</span>
      </div>
      {product && (
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-soft)]">
          <img src={thumb(product.id) || undefined} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-cream" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold">{product.name}</div>
            <div className="text-micro text-ink-2">{product.brand} · {product.size}</div>
            <div className="mt-0.5"><Price p={product} /></div>
          </div>
        </div>
      )}
      {product
        ? <Button size="lg" trailingIcon={ArrowRight} onClick={() => useMall.getState().seekProduct(product.id, 'preview')}>Show me on the shelf</Button>
        : st && <Button size="lg" trailingIcon={ArrowRight} onClick={() => go(st)}>Take me to {st.name}</Button>}
      {product && st && <Button size="md" variant="quiet" onClick={() => useMall.getState().add(product.id, 1)}>Add to cart without going</Button>}
    </div>
  )
}

function StorePanel({ id }: { id: string }) {
  const mall = useCurrentMall()
  const st = mall.stores.find((s) => s.id === id)
  if (!st) return null
  const Cat = CATEGORY[st.category]
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex items-center gap-3">
        <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={48} />
        <div className="leading-tight">
          <div className="text-store font-semibold">{st.name}</div>
          <div className="flex items-center gap-1 text-support text-ink-2"><Cat.icon size={13} />{Cat.label} · {floorLabel(st)}</div>
        </div>
      </div>
      <p className="text-support text-ink-2">{st.tagline}. {st.level ? 'Take the escalators at the centre of the mall to the first floor.' : ''}</p>
      <Badge tone="success" className="self-start">{st.fulfilment}</Badge>
      {INTERIORS.includes(st.id)
        ? <Button size="lg" trailingIcon={ArrowRight} onClick={() => useMall.getState().travelTo(st.id, true)}>Walk into {st.name}</Button>
        : <Button size="lg" variant="secondary" trailingIcon={ArrowRight} onClick={() => go(st)}>{st.level ? 'Show me the escalators' : 'Take me there'}</Button>}
      {st.level === 0 && !INTERIORS.includes(st.id) && <p className="text-micro text-ink-3">This store's interior comes in the next build. Grocery is open now.</p>}
    </div>
  )
}

/** All secondary panels rise as sheets; the mall stays visible above them. */
export function Panels() {
  const panel = useMall((s) => s.panel)
  const close = useMall.getState().close
  const title =
    panel?.kind === 'directory' ? 'Mall directory'
    : panel?.kind === 'map' ? 'Mall map'
    : panel?.kind === 'search' ? 'Search'
    : panel?.kind === 'wallet' ? 'NeuCoins'
    : panel?.kind === 'profile' ? 'You'
    : panel?.kind === 'cart' ? 'NEU CART'
    : panel?.kind === 'ad' ? 'Promotion'
    : panel?.kind === 'store' ? 'Store'
    : panel?.kind === 'product' ? ''
    : panel?.kind === 'friends' ? 'People'
    : panel?.kind === 'assistant' ? 'AI Assistant'
    : panel?.kind === 'notifications' ? 'Notifications'
    : panel?.kind === 'offers' ? 'Offers'
    : panel?.kind === 'friend' ? FRIEND_BY_ID[panel.id]?.label ?? ''
    : ''
  return (
    <Sheet open={!!panel && panel.kind !== 'cart'} onClose={close} title={title}>
      <div className={cx(panel?.kind === 'ad' && 'pt-1')}>
        {panel?.kind === 'directory' && <Directory />}
        {panel?.kind === 'map' && <MallMap initial={panel.storeId} />}
        {panel?.kind === 'search' && <SearchPanel />}
        {panel?.kind === 'wallet' && <RewardsWallet />}
        {panel?.kind === 'profile' && <ProfilePanel />}
        {panel?.kind === 'ad' && <AdPanel id={panel.id} />}
        {panel?.kind === 'store' && <StorePanel id={panel.id} />}
        {panel?.kind === 'product' && <ProductPanel id={panel.id} />}
        {panel?.kind === 'friends' && <FriendsPanel />}
        {panel?.kind === 'friend' && <FriendPanel id={panel.id} />}
        {panel?.kind === 'assistant' && <AssistantPanel listen={panel.listen} />}
        {panel?.kind === 'notifications' && <NotificationsPanel />}
        {panel?.kind === 'offers' && <OffersPanel />}
      </div>
    </Sheet>
  )
}
