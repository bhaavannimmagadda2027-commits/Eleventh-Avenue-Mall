import { useState } from 'react'
import { ChevronRight, Copy, Gift, Hand, Link2, MapPin, Plus, ShieldCheck, Users } from 'lucide-react'
import { FRIENDS, FRIEND_BY_ID, type Friend } from '../../data/social'
import { PRODUCT_BY_ID } from '../../data/products'
import { thumb } from '../../lib/productArt'
import { inr, useMall } from '../../state/useMall'
import { Button, cx } from '../ui/primitives'
import { FriendAvatar, placeName } from './FriendAvatar'

function since(t: number) {
  const m = Math.floor((Date.now() - t) / 60000)
  return m < 1 ? 'just now' : `${m} min`
}

function presenceLine(id: string) {
  const p = useMall.getState().presence[id]
  if (!p) return ''
  if (p.status === 'online') return `In ${placeName(p.at)}`
  return `${p.status === 'away' ? 'Away' : 'Offline'} · ${p.seen}`
}

const small = 'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold'

function FriendRow({ f }: { f: Friend }) {
  useMall((s) => s.presence[f.id])
  const session = useMall((s) => s.session)
  const online = useMall((s) => s.presence[f.id]?.status === 'online')
  const withThem = session?.with === f.id
  const { wave, joinFriend, open } = useMall.getState()
  return (
    <div className="flex items-center gap-3 py-3">
      <button onClick={() => open({ kind: 'friend', id: f.id })} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`${f.name}, ${presenceLine(f.id)}`}>
        <FriendAvatar id={f.id} size={42} dot ring={withThem} />
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-product font-semibold">{f.name} <span className="font-normal text-ink-2">· {f.label}</span></span>
          <span className={cx('block truncate text-support', withThem ? 'font-medium text-purple-ink' : 'text-ink-2')}>{withThem ? `Shopping with you · ${placeName(useMall.getState().presence[f.id]?.at)}` : presenceLine(f.id)}</span>
        </span>
      </button>
      <button onClick={() => wave(f.id)} aria-label={`Wave at ${f.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream"><Hand size={16} strokeWidth={1.8} /></button>
      {online && !withThem && <button onClick={() => joinFriend(f.id)} aria-label={`Go to ${f.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream"><MapPin size={16} strokeWidth={1.8} /></button>}
    </div>
  )
}

function SessionCard() {
  const session = useMall((s) => s.session)
  const presence = useMall((s) => s.presence)
  const online = FRIENDS.filter((f) => presence[f.id]?.status === 'online')
  const { startSession, endSession, open, setCartMode } = useMall.getState()
  if (session) {
    const f = FRIEND_BY_ID[session.with]
    return (
      <section className="rounded-[20px] bg-purple-soft p-4">
        <div className="flex items-center gap-3">
          <FriendAvatar id={f.id} size={40} ring />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[15px] font-semibold">Shopping with {f.name}</div>
            <div className="text-micro text-ink-2">Live for {since(session.since)} · you share the family cart</div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={() => { setCartMode('family'); open({ kind: 'cart' }) }}>Open family cart</Button>
          <Button variant="quiet" className="bg-white" onClick={endSession}>Leave</Button>
        </div>
      </section>
    )
  }
  return (
    <section className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-[15px] font-semibold"><Users size={17} strokeWidth={1.8} className="text-purple-ink" />Shop together</div>
      <p className="mt-1 text-support text-ink-2">Start a session and walk the mall together. You see where each other are and build the family cart side by side.</p>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {online.map((f) => (
          <button key={f.id} onClick={() => startSession(f.id)} className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink pl-1 pr-3.5 text-[13px] font-semibold text-white">
            <FriendAvatar id={f.id} size={32} />Shop with {f.name}
          </button>
        ))}
      </div>
    </section>
  )
}

function Invite() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = 'neu.mall/join/R8K2-TATA'
  const copy = async () => {
    try { await navigator.clipboard.writeText(link) } catch { /* clipboard blocked; the link is still visible */ }
    setCopied(true)
  }
  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-[20px] bg-white p-4 text-left shadow-[var(--shadow-soft)]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-cream"><Plus size={18} strokeWidth={1.8} /></span>
      <span className="flex-1 leading-tight"><span className="block text-product font-semibold">Invite someone</span><span className="text-support text-ink-2">Family or friends, with a link</span></span>
      <ChevronRight size={18} className="text-ink-3" />
    </button>
  )
  return (
    <section className="rounded-[20px] bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="text-product font-semibold">Invite someone</div>
      <div className="mt-2 flex items-center gap-2 rounded-[14px] bg-cream px-3 py-2.5">
        <Link2 size={16} strokeWidth={1.8} className="shrink-0 text-ink-2" />
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{link}</span>
        <button onClick={copy} className={cx(small, 'h-8 bg-ink text-white')}><Copy size={13} />{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <p className="mt-2 text-micro text-ink-3">Sample link for the prototype. Nothing is sent and nobody is added.</p>
    </section>
  )
}

/** Friends and family: who's in the mall, shared sessions, invites. */
export function FriendsPanel() {
  const coins = useMall((s) => s.coins)
  const fam = FRIENDS.filter((f) => f.relation === 'family')
  const friends = FRIENDS.filter((f) => f.relation === 'friend')
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="divide-y divide-soft rounded-[20px] bg-white px-3 shadow-[var(--shadow-soft)]">
        <button onClick={() => useMall.getState().open({ kind: 'profile' })} className="flex w-full items-center gap-3 py-3 text-left">
          <FriendAvatar id="you" size={40} />
          <span className="flex-1 leading-tight"><span className="block text-product font-semibold">Rahul</span><span className="text-support text-ink-2">Your profile, orders and malls</span></span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>
        <button onClick={() => useMall.getState().open({ kind: 'wallet' })} className="flex w-full items-center gap-3 py-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-[#7A4A00]" style={{ background: 'radial-gradient(circle at 35% 30%, #F8DE8E, #E2A52B)' }}>N</span>
          <span className="flex-1 leading-tight"><span className="block text-product font-semibold">NeuCoins</span><span className="text-support text-ink-2 tnum">{coins.toLocaleString('en-IN')} to spend across the group</span></span>
          <ChevronRight size={18} className="text-ink-3" />
        </button>
      </div>
      <SessionCard />
      <div className="text-[15px] font-semibold">Family</div>
      <div className="divide-y divide-soft rounded-[20px] bg-white px-4 shadow-[var(--shadow-soft)]">{fam.map((f) => <FriendRow key={f.id} f={f} />)}</div>
      <div className="text-[15px] font-semibold">Friends</div>
      <div className="divide-y divide-soft rounded-[20px] bg-white px-4 shadow-[var(--shadow-soft)]">{friends.map((f) => <FriendRow key={f.id} f={f} />)}</div>
      <Invite />
      <p className="flex gap-2 text-micro text-ink-3"><ShieldCheck size={14} className="shrink-0" />Your own cart stays private. Friends see where you are only while you share a session. People and activity here are sample data.</p>
    </div>
  )
}

/** One person: presence, quick actions and the list they share with you (gift from it). */
export function FriendPanel({ id }: { id: string }) {
  const f = FRIEND_BY_ID[id]
  useMall((s) => s.thumbsReady)
  useMall((s) => s.presence[id])
  const session = useMall((s) => s.session)
  const gifts = useMall((s) => s.gifts)
  const online = useMall((s) => s.presence[id]?.status === 'online')
  const { wave, joinFriend, startSession, endSession, giftTo, add } = useMall.getState()
  const withThem = session?.with === id
  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex items-center gap-3">
        <FriendAvatar id={id} size={56} dot ring={withThem} />
        <div className="leading-tight">
          <div className="text-store font-semibold">{f.name}</div>
          <div className="text-support text-ink-2">{f.label} · {presenceLine(id)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => wave(id)} className={cx(small, 'bg-cream')}><Hand size={15} />Wave</button>
        {online && !withThem && <button onClick={() => joinFriend(id)} className={cx(small, 'bg-cream')}><MapPin size={15} />Go to {f.name}</button>}
        {online && (withThem
          ? <button onClick={endSession} className={cx(small, 'bg-cream')}>Leave session</button>
          : <button onClick={() => startSession(id)} className={cx(small, 'bg-ink text-white')}><Users size={15} />Shop together</button>)}
      </div>
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[15px] font-semibold">{f.name}'s list</span>
          <span className="text-micro text-ink-2">Shared with you</span>
        </div>
        <div className="flex flex-col gap-2">
          {f.list.map((pid) => {
            const p = PRODUCT_BY_ID[pid]
            if (!p) return null
            const gifted = gifts[pid] === id
            return (
              <div key={pid} className="flex items-center gap-3 rounded-[18px] bg-white p-2.5 shadow-[var(--shadow-soft)]">
                <button onClick={() => useMall.getState().open({ kind: 'product', id: pid })} aria-label={`Details for ${p.name}`}><img src={thumb(pid) || undefined} alt="" className="h-12 w-12 rounded-[12px] bg-cream" /></button>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-[14px] font-semibold">{p.name}</div>
                  <div className="text-micro text-ink-2 tnum">{p.brand} · {inr(p.price)}</div>
                </div>
                <button onClick={() => add(pid, 1)} aria-label={`Add ${p.name} to your cart`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream"><Plus size={16} /></button>
                <button onClick={() => giftTo(pid, id)} disabled={gifted} className={cx(small, gifted ? 'bg-[#FBEBDC] text-[#8F531B]' : 'bg-ink text-white')}>
                  <Gift size={14} />{gifted ? 'In cart' : 'Gift'}
                </button>
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-micro text-ink-3">Gifts go in your private cart, are wrapped, and are delivered to {f.name}. They won't see it until it arrives.</p>
      </section>
    </div>
  )
}

/** Inside the product sheet: send this product to someone as a gift. */
export function GiftPicker({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)
  const gift = useMall((s) => s.gifts[productId])
  if (gift) return (
    <div className="flex items-center gap-2 rounded-[18px] bg-[#FBEBDC] px-4 py-3 text-support font-semibold text-[#8F531B]"><Gift size={16} />In your cart as a gift for {FRIEND_BY_ID[gift].name}</div>
  )
  return (
    <section className="rounded-[18px] bg-white p-3 shadow-[var(--shadow-soft)]">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2 text-left text-[14px] font-semibold">
        <Gift size={16} strokeWidth={1.8} className="text-purple-ink" /><span className="flex-1">Send as a gift</span><ChevronRight size={16} className={cx('text-ink-3 transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <div className="mt-3 flex gap-3">
          {FRIENDS.map((f) => (
            <button key={f.id} onClick={() => useMall.getState().giftTo(productId, f.id)} className="flex flex-col items-center gap-1 text-micro font-medium">
              <FriendAvatar id={f.id} size={44} />{f.name}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
