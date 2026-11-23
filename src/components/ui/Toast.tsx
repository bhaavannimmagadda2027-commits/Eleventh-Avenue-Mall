import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from './icons'
import { useMall } from '../../state/useMall'
import { thumb } from '../../lib/productArt'

/** Quiet confirmation after an item lands in NEU CART. */
export function Toast() {
  const toast = useMall((s) => s.toast)
  const [shown, setShown] = useState<typeof toast>(null)
  useEffect(() => {
    if (!toast) return
    setShown(toast)
    const t = setTimeout(() => setShown(null), 1700)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(72px+env(safe-area-inset-top))] md:top-[calc(112px+env(safe-area-inset-top))] z-50 flex justify-center">
      <AnimatePresence>
        {shown && (
          <motion.div
            key={shown.nonce}
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="glass flex h-10 items-center gap-2 rounded-full pl-2 pr-4 text-xs font-semibold"
          >
            {thumb(shown.productId) ? <img src={thumb(shown.productId) || undefined} alt="" className="h-7 w-7 rounded-full bg-cream" /> : <Check size={16} />}
            {shown.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
