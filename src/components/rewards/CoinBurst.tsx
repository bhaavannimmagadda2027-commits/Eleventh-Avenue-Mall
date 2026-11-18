import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMall } from '../../state/useMall'
import { reduceMotion } from '../../lib/input'

type Burst = { amount: number; nonce: number; from: { x: number; y: number }; to: { x: number; y: number } }

const center = (sel: string, fallback: { x: number; y: number }) => {
  const el = document.querySelector(sel)
  if (!el) return fallback
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** A few NeuCoins arc from the cart bar to the wallet button when an item adds to what you'll earn. */
export function CoinBurst() {
  const burst = useMall((s) => s.coinBurst)
  const view = useMall((s) => s.view)
  const [b, setB] = useState<Burst | null>(null)
  useEffect(() => {
    if (!burst || view !== 'mall') return
    const from = center('button[aria-label^="NEU CART"]', { x: window.innerWidth * 0.6, y: window.innerHeight - 60 })
    const to = center('button[aria-label^="NeuCoins wallet"]', { x: window.innerWidth - 80, y: 32 })
    setB({ ...burst, from, to })
    const t = setTimeout(() => setB(null), reduceMotion ? 900 : 1300)
    return () => clearTimeout(t)
  }, [burst, view])
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-live="polite">
      <AnimatePresence>
        {b && (
          <motion.div key={b.nonce} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!reduceMotion && [0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="absolute h-4 w-4 rounded-full shadow-[0_2px_6px_rgb(122_74_0/0.35)]"
                style={{ left: 0, top: 0, background: 'radial-gradient(circle at 35% 30%, #F8DE8E, #E2A52B)' }}
                initial={{ x: b.from.x - 8 + (i - 1.5) * 10, y: b.from.y - 8, scale: 0.6, opacity: 0 }}
                animate={{
                  x: [b.from.x - 8 + (i - 1.5) * 10, (b.from.x + b.to.x) / 2 - 8 + (i - 1.5) * 18, b.to.x - 8],
                  y: [b.from.y - 8, Math.min(b.from.y, b.to.y) + 120 - i * 14, b.to.y - 8],
                  scale: [0.6, 1, 0.7],
                  opacity: [0, 1, 0.9],
                }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: [0.3, 0.7, 0.4, 1] }}
              />
            ))}
            <motion.span
              className="absolute rounded-full bg-[#F7E7B4] px-2 py-0.5 text-[12px] font-semibold text-[#7A4A00] tnum"
              style={{ left: b.to.x - 70, top: b.to.y + 22 }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.75, duration: 0.2 }}
            >
              +{b.amount} NeuCoins
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
