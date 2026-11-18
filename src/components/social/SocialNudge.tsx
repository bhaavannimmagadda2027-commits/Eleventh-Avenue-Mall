import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FRIENDS } from '../../data/social'
import { useMall } from '../../state/useMall'
import { FriendAvatar } from './FriendAvatar'

/** Small, quiet line about what friends are doing. Sits under the cart toast and fades on its own. */
export function SocialNudge() {
  const nudge = useMall((s) => s.nudge)
  const view = useMall((s) => s.view)
  const [shown, setShown] = useState<typeof nudge>(null)
  useEffect(() => {
    if (!nudge) return
    setShown(nudge)
    const t = setTimeout(() => setShown(null), 2600)
    return () => clearTimeout(t)
  }, [nudge])
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(112px+env(safe-area-inset-top))] z-50 flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {shown && view === 'mall' && (
          <motion.div key={shown.nonce} role="status" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
            className="glass flex h-9 max-w-full items-center gap-2 rounded-full pl-1 pr-3.5 text-[13px] font-medium">
            <FriendAvatar id={shown.friendId} size={28} />
            <span className="truncate">{shown.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Top-bar indicator: who is in the mall, or who you're shopping with. Opens the friends panel. */
export function FriendsButton() {
  const presence = useMall((s) => s.presence)
  const session = useMall((s) => s.session)
  const here = FRIENDS.filter((f) => presence[f.id]?.status === 'online')
  const label = session ? `Shopping with ${FRIENDS.find((f) => f.id === session.with)?.name}` : `Friends, ${here.length} in the mall`
  const first = session ? session.with : here[0]?.id ?? 'you'
  return (
    <button onClick={() => useMall.getState().open({ kind: 'friends' })} aria-label={label}
      className="glass relative grid h-11 w-11 shrink-0 place-items-center rounded-full active:scale-95">
      <FriendAvatar id={first} size={32} ring={!!session} />
      {!session && here.length > 1 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-success px-1 text-[10px] font-semibold text-white tnum">{here.length}</span>
      )}
      {!session && here.length === 1 && <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-success" />}
    </button>
  )
}
