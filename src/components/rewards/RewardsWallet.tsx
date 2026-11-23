import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check } from '../ui/icons'
import { REDEEM_CATEGORIES, REDEMPTIONS, TIERS, tierFor, type RedeemCategory, type Redemption } from '../../data/rewards'
import { computeBill } from '../../lib/cartMath'
import { activeCart, useMall } from '../../state/useMall'
import { cx } from '../ui/primitives'

const n = (v: number) => v.toLocaleString('en-IN')

function Coin({ size = 40 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full font-bold text-[#7A4A00] shadow-[inset_0_-2px_0_rgb(122_74_0/0.25)]" style={{ width: size, height: size, fontSize: size * 0.4, background: 'radial-gradient(circle at 35% 30%, #F8DE8E, #E2A52B)' }}>
      N
    </span>
  )
}

function Balance() {
  const coins = useMall((s) => s.coins)
  const cart = useMall(activeCart)
  const year = useMall((s) => s.yearEarned)
  const pending = useMemo(() => computeBill(cart, { useCoins: false, balance: 0, yearEarned: year }).coinsEarned, [cart, year])
  const tier = tierFor(year)
  const next = TIERS.find((t) => t.from > year)
  return (
    <section className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <Coin size={46} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-micro font-semibold uppercase tracking-[0.08em] text-ink-2">NeuCoins balance</div>
          <div className="text-3xl font-semibold tracking-[-0.02em] tnum">{n(coins)}</div>
          <div className="text-micro text-ink-2">≈ ₹{n(coins)} to spend across the group</div>
        </div>
        {pending > 0 && <span className="rounded-full bg-purple-soft px-2 py-1 text-micro font-semibold text-purple-ink tnum">+{pending} pending</span>}
      </div>
      <div className="mt-4 rounded-2xl bg-cream p-3">
        <div className="flex items-center justify-between text-support">
          <span className="font-semibold">{tier.name}</span>
          <span className="text-micro text-ink-2">{tier.perk}</span>
        </div>
        {next && (
          <>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-purple" style={{ width: `${Math.min(100, ((year - tier.from) / (next.from - tier.from)) * 100)}%` }} />
            </div>
            <div className="mt-2 text-micro text-ink-2"><span className="tnum">{n(next.from - year)}</span> coins to {next.name} · {next.perk}</div>
          </>
        )}
      </div>
    </section>
  )
}

function OfferCard({ r }: { r: Redemption }) {
  const coins = useMall((s) => s.coins)
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const short = coins < r.cost
  const onClick = () => {
    if (done || short) return
    if (!confirm) { setConfirm(true); return }
    if (useMall.getState().redeem(r.id)) setDone(true)
    setConfirm(false)
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-[var(--shadow-soft)]">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white" style={{ background: r.tint }}>{r.partner[0]}</span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-2">{r.partner}</div>
        <div className="truncate text-sm font-semibold">{r.title}</div>
        <div className="truncate text-micro text-ink-2">{r.detail}</div>
      </div>
      <button
        onClick={onClick}
        disabled={short && !done}
        className={cx(
          'flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold tnum transition-colors',
          done ? 'bg-tint text-success' : confirm ? 'bg-purple text-white' : short ? 'bg-cream text-ink-3' : 'bg-ink text-on-ink',
        )}
        aria-label={done ? 'Redeemed' : `Redeem ${r.title} for ${r.cost} NeuCoins`}
      >
        {done ? <><Check size={14} />Redeemed</> : confirm ? `Confirm · ${n(r.cost)}` : n(r.cost)}
      </button>
    </div>
  )
}

/** NeuCoins: balance, tier, where to spend them across the group, and recent activity. */
export function RewardsWallet() {
  const [cat, setCat] = useState<RedeemCategory | 'all'>('all')
  const activity = useMall((s) => s.activity)
  const offers = REDEMPTIONS.filter((r) => cat === 'all' || r.category === cat)
  return (
    <div className="flex flex-col gap-4 pb-2">
      <Balance />
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold">Spend them across the group</span>
          <span className="text-micro text-ink-2">Tap twice to redeem</span>
        </div>
        <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
          {[{ id: 'all' as const, label: 'All', icon: null }, ...REDEEM_CATEGORIES].map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className={cx('flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-medium', cat === c.id ? 'bg-ink text-on-ink' : 'bg-surface shadow-[var(--shadow-soft)]')}>
              {c.icon && <c.icon size={15} />}{c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">{offers.map((r) => <OfferCard key={r.id} r={r} />)}</div>
      </section>
      <section>
        <div className="mb-2 text-sm font-semibold">Recent activity</div>
        <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
          {activity.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full', a.amount > 0 ? 'bg-tint text-success' : 'bg-cream text-ink-2')}>
                {a.amount > 0 ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-medium">{a.label}</div>
                <div className="truncate text-micro text-ink-2">{a.detail} · {a.when}</div>
              </div>
              <span className={cx('text-sm font-semibold tnum', a.amount > 0 ? 'text-success' : 'text-ink')}>{a.amount > 0 ? '+' : '−'}{n(Math.abs(a.amount))}</span>
            </div>
          ))}
        </div>
      </section>
      <p className="text-micro text-ink-3">Balances, partners and redemption values are sample data. No real wallet is connected.</p>
    </div>
  )
}
