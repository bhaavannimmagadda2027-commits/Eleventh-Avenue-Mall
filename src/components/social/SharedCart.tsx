import { Gift, Heart, Lock, ThumbsUp, Users } from 'lucide-react'
import { FRIEND_BY_ID, type Reaction } from '../../data/social'
import { cartCount, useMall } from '../../state/useMall'
import { cx } from '../ui/primitives'
import { AvatarStack, FriendAvatar, nameOf } from './FriendAvatar'

/** Private cart or the shared family cart. The tab you pick is where new items go. */
export function CartTabs() {
  const mode = useMall((s) => s.cartMode)
  const mine = useMall((s) => cartCount(s.cart))
  const fam = useMall((s) => s.familyCart)
  const session = useMall((s) => s.session)
  const people = [...new Set(fam.map((l) => l.by ?? 'you'))]
  const set = useMall.getState().setCartMode
  const tab = (id: 'mine' | 'family', label: string, n: number, Icon: typeof Lock) => (
    <button role="tab" aria-selected={mode === id} onClick={() => set(id)}
      className={cx('flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors', mode === id ? 'bg-white shadow-[var(--shadow-soft)]' : 'text-ink-2')}>
      <Icon size={14} strokeWidth={2} />{label}<span className="tnum text-ink-3">{n}</span>
    </button>
  )
  return (
    <div className="mb-3">
      <div role="tablist" aria-label="Which cart" className="flex gap-1 rounded-full bg-cream p-1">
        {tab('mine', 'My cart', mine, Lock)}
        {tab('family', 'Family cart', cartCount(fam), Users)}
      </div>
      <p className="mt-2 flex items-center gap-2 text-micro text-ink-2">
        {mode === 'family' ? (
          <>
            <AvatarStack ids={people.length ? people : ['you']} size={18} />
            <span>{session ? `Shopping live with ${FRIEND_BY_ID[session.with].name}. ` : ''}Shared with the family. Anything you add now goes here.</span>
          </>
        ) : (
          <><Lock size={12} strokeWidth={2} className="shrink-0" /><span>Only you can see this cart. Anything you add now goes here.</span></>
        )}
      </p>
    </div>
  )
}

const ICON: Record<Reaction, typeof Heart> = { love: Heart, yes: ThumbsUp }

/** Under a cart line: who added it, whether it's a gift, and reactions from the family. */
export function LineSocial({ productId }: { productId: string }) {
  const mode = useMall((s) => s.cartMode)
  const by = useMall((s) => (s.cartMode === 'family' ? s.familyCart.find((l) => l.productId === productId)?.by : undefined))
  const gift = useMall((s) => (s.cartMode === 'mine' ? s.gifts[productId] : undefined))
  const reactions = useMall((s) => s.reactions[productId])
  const mineR = reactions?.find((r) => r.by === 'you')?.r
  const others = (reactions ?? []).filter((r) => r.by !== 'you')
  const showReact = mode === 'family' && by && by !== 'you'
  if (!by && !gift && !others.length) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-micro">
      {gift && <span className="inline-flex items-center gap-1 rounded-full bg-[#FBEBDC] px-2 py-0.5 font-semibold text-[#8F531B]"><Gift size={11} strokeWidth={2.2} />Gift for {FRIEND_BY_ID[gift].name}</span>}
      {by && mode === 'family' && <span className="inline-flex items-center gap-1 text-ink-2"><FriendAvatar id={by} size={16} />{by === 'you' ? 'You' : nameOf(by)}</span>}
      {others.map((r) => {
        const I = ICON[r.r]
        return <span key={r.by} title={`${nameOf(r.by)} ${r.r === 'love' ? 'loves this' : 'says yes'}`} className="inline-flex h-6 items-center gap-1 rounded-full bg-cream pl-0.5 pr-1.5 text-ink-2"><FriendAvatar id={r.by} size={18} /><I size={11} strokeWidth={2.2} className={r.r === 'love' ? 'fill-[#B33A68] text-[#B33A68]' : 'text-purple-ink'} /></span>
      })}
      {showReact && (
        <button onClick={() => useMall.getState().react(productId, 'you', 'love')} aria-pressed={mineR === 'love'} aria-label="Love it"
          className={cx('grid h-6 w-6 place-items-center rounded-full', mineR === 'love' ? 'bg-[#F7E1E6] text-[#B33A68]' : 'bg-cream text-ink-3')}>
          <Heart size={12} strokeWidth={2.2} className={mineR === 'love' ? 'fill-current' : ''} />
        </button>
      )}
    </div>
  )
}
