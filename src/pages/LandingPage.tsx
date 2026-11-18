import { motion } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'
import { MALLS } from '../data/malls'
import { useMall } from '../state/useMall'
import { Button, cx } from '../components/ui/primitives'

const rise = (d: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.6, ease: [0.22, 0.8, 0.24, 1] as const } })

/** The mall lobby is the background; the page only adds a headline, a mall choice and two ways in. */
export function LandingPage() {
  const mallId = useMall((s) => s.mallId)
  const { enterMall, selectMall, open } = useMall.getState()
  return (
    <motion.section
      className="absolute inset-0 z-10 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      aria-label="Virtual Retail OS"
    >
      {/* soft daylight wash so text stays legible over the mall */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-bg via-bg/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-bg/90 via-bg/50 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 pt-[calc(16px+env(safe-area-inset-top))]">
        <motion.div {...rise(0.05)} className="flex items-center justify-between">
          <div className="leading-tight">
            <div className="text-[12px] font-semibold tracking-[0.22em]">VIRTUAL RETAIL OS</div>
            <div className="text-micro text-ink-2">The mall is the interface</div>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[14px] font-semibold shadow-[var(--shadow-soft)]">R</span>
        </motion.div>

        <motion.div {...rise(0.15)} className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5" role="radiogroup" aria-label="Choose a mall">
          {MALLS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={m.id === mallId}
              disabled={!m.available}
              onClick={() => selectMall(m.id)}
              className={cx(
                'flex h-10 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-3.5 text-[13px] font-semibold',
                m.id === mallId ? 'bg-white shadow-[var(--shadow-soft)]' : 'bg-white/55 text-ink-2',
              )}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full text-[12px] text-white" style={{ background: m.tone }}>{m.initial}</span>
              {m.name}
              {!m.available && <span className="font-medium text-ink-3">· soon</span>}
            </button>
          ))}
        </motion.div>

        <motion.h1 {...rise(0.25)} className="mt-6 max-w-[12ch] text-hero font-semibold tracking-[-0.025em]">
          Your world of shopping, in one place.
        </motion.h1>
        <motion.p {...rise(0.32)} className="mt-2 text-[15px] font-medium text-ink-2">Explore. Shop. Earn.</motion.p>

        <motion.div {...rise(0.45)} className="mt-auto flex flex-col gap-2.5 pb-[calc(24px+env(safe-area-inset-bottom))]">
          <Button size="lg" trailingIcon={ArrowRight} onClick={enterMall} className="w-full justify-between pl-7 pr-6">
            Explore the mall
          </Button>
          <Button size="lg" variant="secondary" icon={Search} onClick={() => { enterMall(); setTimeout(() => open({ kind: 'search' }), 900) }} className="w-full">
            Find a store or product
          </Button>
          <p className="mt-1 text-center text-micro text-ink-2">Prototype for an internal demo · brand names are illustrative · sample data</p>
        </motion.div>
      </div>
    </motion.section>
  )
}
