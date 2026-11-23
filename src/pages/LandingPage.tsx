import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown, Gift, Sparkles, Truck, Users, type AppIcon } from '../components/ui/icons'
import { CATEGORY } from '../data/categories'
import { MALLS } from '../data/malls'
import { PRODUCTS } from '../data/products'
import { REDEMPTIONS } from '../data/rewards'
import { thumb } from '../lib/productArt'
import { INTERIORS, useMall } from '../state/useMall'
import { BrandMark, cx } from '../components/ui/primitives'

const EASE = [0.22, 1, 0.36, 1] as const
const mall = MALLS[0]
const walkIns = mall.stores.filter((s) => INTERIORS.includes(s.id))
const coinOffers = ['sbux-drink', 'croma-500', 'qmin-dinner', 'ai-blr-del', 'taj-weekend'].map((id) => REDEMPTIONS.find((r) => r.id === id)!)

const NAV = [
  { id: 'stores', label: 'Stores' },
  { id: 'how', label: 'How it works' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'faq', label: 'Questions' },
]

const BENEFITS: { icon: AppIcon; title: string; body: string }[] = [
  { icon: Sparkles, title: 'See it on the shelf', body: `Walk into ${walkIns.length} fully stocked stores and tap any product to check its size, price and offer.` },
  { icon: Truck, title: 'Groceries in 15 to 20 minutes', body: 'BigBasket orders come from a nearby partner store, or pick a slot that suits your day.' },
  { icon: Users, title: 'Shop with the people you shop for', body: 'Share a family cart, browse alongside a friend and send a gift to their door.' },
  { icon: Gift, title: 'Spend your coins beyond the mall', body: 'Turn NeuCoins into coffee at Starbucks, a flight on Air India or a night at Taj.' },
]

const STEPS = [
  { title: 'Drive in', body: 'Steer NEU CART with the joystick or arrow keys, or tap a category and it drives you there.' },
  { title: 'Pick off the shelf', body: 'Tap a product to preview it. Add it and watch it land in your cart.' },
  { title: 'Check out and earn', body: 'Pay by UPI, card or on delivery, and collect 1 NeuCoin for every ₹100.' },
]

const FAQ = [
  ['Do I need an account to look around?', 'No. Open the mall and start exploring straight away.'],
  ['How do I move around the mall?', 'Drag the joystick, use the arrow keys or W A S D, or tap a category and NEU CART drives itself to that store.'],
  ['Which stores can I walk into?', `${walkIns.map((s) => s.name).join(', ')}. The other storefronts open a details card with what they offer.`],
  ['How fast is delivery?', 'BigBasket takes 15 to 20 minutes. Other stores range from the same day to 4 days, and checkout shows the time for each one.'],
  ['How do NeuCoins work?', 'You earn 1 NeuCoin per ₹100. Use them at checkout or redeem them for travel, dining and store vouchers from your wallet.'],
  ['Can my family share one cart?', 'Yes. Switch to the family cart and everyone adds to the same order.'],
  ['Are other malls coming?', 'Reliance Mall and Birla Mall are on the way. Tata Mall is open now.'],
  ['Will I be charged?', 'No. Prices, stock and orders here are sample data, and no payment is ever taken.'],
]

function Reveal({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <motion.section
      id={id}
      className={cx('scroll-mt-24', className)}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.section>
  )
}

function PrimaryCta({ onClick, small, className }: { onClick: () => void; small?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-3 py-2 text-on-ink transition-[transform,background-color] duration-300 hover:bg-ink-hover active:scale-[0.98]',
        small ? 'button-sm min-h-10' : 'button-md min-h-12 px-6',
        className,
      )}
    >
      Start shopping
      <ArrowRight size={small ? 16 : 18} className="transition-transform duration-500 group-hover:translate-x-1" />
    </button>
  )
}

/** Core promise, lit one word at a time as it scrolls past a line in the viewport. */
function TaglineReveal({ root }: { root: React.RefObject<HTMLDivElement | null> }) {
  const lines = ['Every aisle, every brand,', 'one cart that follows you', 'from the door to delivery.']
  const box = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || !box.current) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.replace('opacity-30', 'opacity-100'); io.unobserve(e.target) } }),
      { root: root.current, rootMargin: '0px 0px -38% 0px' },
    )
    box.current.querySelectorAll('[data-word]').forEach((w) => io.observe(w))
    return () => io.disconnect()
  }, [reduced, root])
  return (
    <section className="bg-black px-4 py-24 md:py-32" aria-label="Our promise">
      <h2 ref={box} className="heading-4 md:heading-1 mx-auto max-w-[680px] md:max-w-[860px]">
        {lines.map((l) => (
          <span key={l} className="block">
            {l.split(' ').map((w, i) => (
              <span key={i} data-word className={cx('inline-block transition-opacity duration-500', reduced ? 'opacity-100' : 'opacity-30')}>{w}&nbsp;</span>
            ))}
          </span>
        ))}
      </h2>
    </section>
  )
}

function StoreCard({ id, onGo }: { id: string; onGo: (id: string) => void }) {
  const ready = useMall((s) => s.thumbsReady)
  const st = mall.stores.find((s) => s.id === id)!
  const items = PRODUCTS.filter((p) => p.storeId === id).slice(0, 3)
  return (
    <button
      onClick={() => onGo(id)}
      className="group flex flex-col gap-4 rounded-3xl bg-surface p-2 text-left transition-[transform,background-color] duration-500 hover:-translate-y-1 hover:bg-cream active:scale-[0.98]"
    >
      <span className="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl">
        {items.map((p) => (ready && thumb(p.id)
          ? <img key={p.id} src={thumb(p.id) || undefined} alt={p.name} className="aspect-square w-full bg-[#F5F5F5] object-contain" />
          : <span key={p.id} className="aspect-square w-full animate-pulse bg-soft" />))}
      </span>
      <span className="flex items-center gap-3 px-2 pb-2">
        <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={40} />
        <span className="min-w-0 flex-1">
          <span className="title-3 block truncate">{st.name}</span>
          <span className="caption-5 block truncate text-ink-2">{CATEGORY[st.category].label} · {st.tagline}</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-ink-2 transition-transform duration-500 group-hover:translate-x-1" />
      </span>
    </button>
  )
}

/** Shopper landing page. The live mall is the hero; everything below it sits on solid surfaces. */
export function LandingPage() {
  const scroller = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)
  const [menu, setMenu] = useState(false)
  const [current, setCurrent] = useState('')
  const { enterMall, enterStore } = useMall.getState()

  const start = () => { useMall.setState({ sceneFrozen: false }); enterMall() }
  const goTo = (id: string) => { start(); setTimeout(() => enterStore(id), 1100) }
  const jump = (id: string) => {
    setMenu(false)
    scroller.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  // stop rendering the 3D mall while the hero is scrolled away, and track the current section
  useEffect(() => {
    const root = scroller.current
    if (!root || !hero.current) return
    const heroIo = new IntersectionObserver(([e]) => useMall.setState({ sceneFrozen: !e.isIntersecting }), { root })
    heroIo.observe(hero.current)
    const navIo = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id) }),
      { root, rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach((n) => { const el = root.querySelector(`#${n.id}`); if (el) navIo.observe(el) })
    return () => { heroIo.disconnect(); navIo.disconnect(); useMall.setState({ sceneFrozen: false }) }
  }, [])

  useEffect(() => {
    if (!menu) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [menu])

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE } }}
    >
      <a href="#main" className="button-sm absolute left-4 top-4 z-50 -translate-y-24 rounded-full bg-ink px-3 py-2 text-on-ink focus:translate-y-0">Skip to content</a>

      <nav aria-label="Main" className="glass absolute left-1/2 top-[calc(16px+env(safe-area-inset-top))] z-40 flex w-[calc(100%-32px)] max-w-fit -translate-x-1/2 items-center justify-between gap-4 rounded-full py-2 pl-4 pr-2 max-md:max-w-none">
        <span className="title-4 whitespace-nowrap">Tata Mall</span>
        <span className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => jump(n.id)} aria-current={current === n.id ? 'true' : undefined} className={cx('title-4 rounded-full px-3 py-2 transition-colors duration-300 hover:bg-soft', current === n.id ? 'bg-soft text-ink' : 'text-ink-2')}>
              {n.label}
            </button>
          ))}
        </span>
        <span className="flex items-center gap-2">
          <PrimaryCta small onClick={start} />
          <button onClick={() => setMenu((m) => !m)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} className="relative h-10 w-10 rounded-full bg-soft md:hidden">
            <span className={cx('absolute left-3 top-1/2 h-0.5 w-4 rounded-full bg-ink transition-transform duration-500', menu ? 'rotate-45' : '-translate-y-1')} />
            <span className={cx('absolute left-3 top-1/2 h-0.5 w-4 rounded-full bg-ink transition-transform duration-500', menu ? '-rotate-45' : 'translate-y-1')} />
          </button>
        </span>
      </nav>

      <AnimatePresence>
        {menu && (
          <motion.div className="absolute inset-0 z-30 flex flex-col gap-2 bg-bg/95 px-4 pt-32 backdrop-blur-xl md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
            {NAV.map((n, i) => (
              <motion.button key={n.id} onClick={() => jump(n.id)} className="heading-4 py-2 text-left" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.5, ease: EASE }}>
                {n.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scroller} className="no-scrollbar absolute inset-0 overflow-y-auto overflow-x-hidden">
        <header ref={hero} className="relative flex min-h-full flex-col justify-end bg-black/50 px-4 pb-6 pt-32 md:justify-center md:bg-black/60 md:pb-24">
          <div className="mx-auto w-full max-w-5xl max-md:rounded-3xl max-md:bg-black/60 max-md:p-4 max-md:backdrop-blur-md">
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease: EASE }} className="heading-4 md:heading-1 hero-text w-fit max-w-[680px] pb-1">
              Walk the whole mall<br />without leaving home
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: EASE }} className="body-3 mt-4 max-w-[520px] text-ink-2">
              Drive your NEU CART past {mall.stores.length} stores, from BigBasket to Tanishq. Pick products off the shelf and earn NeuCoins on every order.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: EASE }} className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
              <PrimaryCta onClick={start} className="w-full md:w-auto" />
              <p className="caption-5 flex items-center justify-center gap-2 text-ink-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Open now in {mall.city} · No account needed
              </p>
            </motion.div>
          </div>
        </header>

        <main id="main" className="bg-bg">
          <section aria-label="Stores in the mall" className="overflow-hidden bg-black py-4">
            <p className="caption-5 no-scrollbar flex gap-6 overflow-x-auto whitespace-nowrap px-4 text-ink-2 md:justify-center">
              {mall.stores.slice(0, 10).map((s) => <span key={s.id} className="title-4">{s.name}</span>)}
            </p>
          </section>

          <Reveal className="mx-auto max-w-5xl px-4 py-16 md:py-24">
            <h2 className="heading-4 md:heading-2 max-w-[680px] [text-wrap:balance]">Shopping online lost the fun of walking in. We put it back.</h2>
            <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-2">
              {BENEFITS.map((b) => (
                <article key={b.title} className="rounded-3xl bg-surface p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft"><b.icon size={20} /></span>
                  <h3 className="heading-6 mt-4">{b.title}</h3>
                  <p className="body-6 mt-2 text-ink-2">{b.body}</p>
                </article>
              ))}
            </div>
          </Reveal>

          <TaglineReveal root={scroller} />

          <Reveal id="stores" className="mx-auto max-w-5xl px-4 py-16 md:py-24">
            <h2 className="heading-4 md:heading-2 max-w-[680px] [text-wrap:balance]">Walk straight into a store</h2>
            <p className="body-3 mt-2 max-w-[520px] text-ink-2">Choose one and NEU CART takes you inside.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {walkIns.map((s) => <StoreCard key={s.id} id={s.id} onGo={goTo} />)}
            </div>
          </Reveal>

          <Reveal id="how" className="bg-surface px-4 py-16 md:py-24">
            <div className="mx-auto max-w-5xl">
              <h2 className="heading-4 md:heading-2">Three steps to your order</h2>
              <ol className="mt-8 grid gap-8 md:mt-12 md:grid-cols-3">
                {STEPS.map((s, i) => (
                  <li key={s.title}>
                    <span className="caption-3 grid h-8 w-8 place-items-center rounded-full bg-ink text-on-ink tnum">{i + 1}</span>
                    <h3 className="heading-6 mt-4">{s.title}</h3>
                    <p className="body-6 mt-2 text-ink-2">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <Reveal id="rewards" className="mx-auto max-w-5xl px-4 py-16 md:py-24">
            <h2 className="heading-4 md:heading-2 max-w-[680px] [text-wrap:balance]">Your groceries can pay for a flight</h2>
            <p className="body-3 mt-2 max-w-[520px] text-ink-2">Earn 1 NeuCoin per ₹100, then spend them across the group.</p>
            <ul className="mt-8 divide-y divide-soft rounded-3xl bg-surface px-6">
              {coinOffers.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 py-4">
                  <span className="min-w-0">
                    <span className="title-3 block">{r.title}</span>
                    <span className="caption-5 block text-ink-2">{r.partner}</span>
                  </span>
                  <span className="body-6 shrink-0 text-ink-2 tnum">{r.cost.toLocaleString('en-IN')} coins</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal id="faq" className="bg-surface px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl">
              <h2 className="heading-4 md:heading-2">Questions before you walk in</h2>
              <div className="mt-8 divide-y divide-soft">
                {FAQ.map(([q, a]) => (
                  <details key={q} className="group py-4">
                    <summary className="title-3 flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg [&::-webkit-details-marker]:hidden">
                      {q}
                      <ChevronDown size={18} className="shrink-0 text-ink-2 transition-transform duration-500 group-open:rotate-180" />
                    </summary>
                    <p className="body-6 mt-2 max-w-[640px] text-ink-2">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="bg-black px-4 py-24 text-center">
            <h2 className="heading-4 md:heading-2 mx-auto max-w-[680px] [text-wrap:balance]">The doors are open</h2>
            <p className="body-3 mx-auto mt-2 max-w-[480px] text-ink-2">No account, no download. Your cart is waiting in the lobby.</p>
            <PrimaryCta onClick={start} className="mt-6 w-full sm:w-auto" />
          </Reveal>
        </main>

        <footer className="caption-5 bg-black px-4 pb-8 text-center text-ink-3">Prices, stock and orders are sample data. No payment is taken.</footer>
      </div>
    </motion.div>
  )
}
