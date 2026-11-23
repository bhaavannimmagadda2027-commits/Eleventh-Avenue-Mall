import { FRIEND_BY_ID } from '../../data/social'
import { STORE_BY_ID } from '../../data/stores'
import { useMall } from '../../state/useMall'
import { cx } from '../ui/primitives'

export const placeName = (at?: string) => (!at ? '' : at === 'lobby' ? 'the main lobby' : STORE_BY_ID[at]?.name ?? 'the mall')
export const nameOf = (id: string) => (id === 'you' ? 'You' : FRIEND_BY_ID[id]?.name ?? id)

/** Round initial in the person's colour; 'you' is the shopper. Green dot when they are online. */
export function FriendAvatar({ id, size = 36, dot = false, ring = false, className }: { id: string; size?: number; dot?: boolean; ring?: boolean; className?: string }) {
  const status = useMall((s) => s.presence[id]?.status)
  const f = FRIEND_BY_ID[id]
  const you = id === 'you'
  return (
    <span className={cx('relative inline-grid shrink-0 place-items-center rounded-full font-semibold', you ? 'bg-purple-soft text-purple-ink' : 'text-white', ring && 'shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-purple)]', className)}
      style={{ width: size, height: size, fontSize: size * 0.42, background: you ? undefined : f?.tint }}
      aria-hidden>
      {you ? 'R' : f?.name[0]}
      {dot && !you && (
        <span className={cx('absolute bottom-0 right-0 rounded-full border-2 border-bg', status === 'online' ? 'bg-success' : status === 'away' ? 'bg-[#E2A52B]' : 'bg-ink-3')}
          style={{ width: Math.max(9, size * 0.3), height: Math.max(9, size * 0.3) }} />
      )}
    </span>
  )
}

export function AvatarStack({ ids, size = 22 }: { ids: string[]; size?: number }) {
  return (
    <span className="flex">
      {ids.map((id) => <span key={id} className="-ml-2 rounded-full first:ml-0" style={{ boxShadow: '0 0 0 2px var(--color-bg)' }}><FriendAvatar id={id} size={size} /></span>)}
    </span>
  )
}
