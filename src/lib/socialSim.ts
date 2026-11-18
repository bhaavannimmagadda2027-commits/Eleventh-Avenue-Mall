import { PRODUCTS } from '../data/products'
import { FRIEND_BY_ID, REACTION_LABEL, type Reaction } from '../data/social'
import { PLACE } from '../data/storeLayout'
import { STORE_BY_ID } from '../data/stores'
import { useMall } from '../state/useMall'

// Simulated shared shopping session. No network: the friend's side is scripted so the
// prototype can show presence, following, reactions and a shared cart filling up.

let timers: number[] = []
const after = (ms: number, fn: () => void) => { timers.push(window.setTimeout(fn, ms)) }
const clear = () => { timers.forEach(clearTimeout); timers = [] }
const where = (at: string) => (at === 'lobby' ? 'the lobby' : STORE_BY_ID[at]?.name ?? 'the mall')

function pick(at: string, avoid: Set<string>) {
  const pool = PRODUCTS.filter((p) => PLACE[p.id] && p.storeId === at && !avoid.has(p.id))
  const fallback = ['orange', 'cornflakes', 'mugs'].filter((id) => !avoid.has(id))
  return pool.length ? pool[Math.floor(Math.random() * pool.length)].id : fallback[0]
}

let started = false
export function startSocialSim() {
  if (started) return
  started = true
  let reactCount = 0

  useMall.subscribe((s, p) => {
    const st = useMall.getState()
    // a session starts: they accept, come to you, then add something nearby
    if (s.session && s.session !== p.session) {
      clear()
      const id = s.session.with
      const name = FRIEND_BY_ID[id].name
      after(1600, () => st.say(id, `${name} joined. You're shopping together`))
      after(4200, () => {
        const at = useMall.getState().location
        st.setPresence(id, { status: 'online', at })
        st.say(id, `${name} is with you in ${where(at)}`)
      })
      after(10000, () => {
        const s2 = useMall.getState()
        if (s2.session?.with !== id) return
        st.friendAdd(id, pick(s2.location, new Set(s2.familyCart.map((l) => l.productId))))
      })
    }
    if (!s.session && p.session) clear()

    // they follow you between the lobby and stores
    if (s.session && s.location !== p.location) {
      const id = s.session.with
      after(2600, () => {
        const now = useMall.getState()
        if (now.session?.with !== id) return
        now.setPresence(id, { status: 'online', at: now.location })
        if (now.location !== 'lobby') now.say(id, `${FRIEND_BY_ID[id].name} followed you to ${where(now.location)}`)
      })
    }

    // every other thing you add, they react to it
    if (s.session && s.lastAdd && s.lastAdd !== p.lastAdd && reactCount++ % 2 === 0) {
      const id = s.session.with
      const pid = s.lastAdd.productId
      const r: Reaction = Math.random() < 0.6 ? 'love' : 'yes'
      after(1500, () => {
        const now = useMall.getState()
        if (now.session?.with !== id) return
        now.react(pid, id, r)
        now.say(id, `${FRIEND_BY_ID[id].name} ${REACTION_LABEL[r]} the ${PRODUCTS.find((x) => x.id === pid)?.name.split(',')[0].toLowerCase()}`)
      })
    }

    // waving at someone online gets a wave back
    if (s.nudge && s.nudge !== p.nudge && s.nudge.text.startsWith('You waved at')) {
      const id = s.nudge.friendId
      after(1700, () => useMall.getState().say(id, `${FRIEND_BY_ID[id].name} waved back`))
    }
  })
}
