import { useEffect } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { renderThumbnails, thumb } from './lib/productArt'
import { refreshAdImages } from './lib/textures'
import { Toast } from './components/ui/Toast'
import { CartSheet } from './components/cart/CartSheet'
import { CoinBurst } from './components/rewards/CoinBurst'
import { SocialNudge } from './components/social/SocialNudge'
import { CheckoutScreen } from './components/checkout/CheckoutScreen'
import { startSocialSim } from './lib/socialSim'
import { MallEnvironment } from './components/mall/MallEnvironment'
import { Panels } from './components/panels/Panels'
import { LandingPage } from './pages/LandingPage'
import { MallPage } from './pages/MallPage'
import { useMall } from './state/useMall'

/**
 * One continuous experience: the 3D mall is always mounted underneath; the landing page and the
 * shopping UI are layers on top of it, so entering the mall is a camera move, not a page change.
 */
export default function App() {
  const view = useMall((s) => s.view)
  const fading = useMall((s) => s.fading)
  useEffect(() => {
    renderThumbnails()
    useMall.setState({ thumbsReady: true })
    refreshAdImages(thumb) // campaigns show the real product once its render exists
    startSocialSim()
  }, [])
  return (
    // reducedMotion="user": every Framer animation becomes a simple fade when the OS asks for less motion
    <MotionConfig reducedMotion="user">
    <div className={"relative h-full w-full overflow-hidden bg-bg"}>
      <MallEnvironment />
      <AnimatePresence>
        {view === 'landing' && <LandingPage key="landing" />}
        {view === 'mall' && <MallPage key="mall" />}
      </AnimatePresence>
      <AnimatePresence>
        {fading && (
          <motion.div
            key="fade"
            className="absolute inset-0 z-20 bg-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          />
        )}
      </AnimatePresence>
      <Toast />
      <SocialNudge />
      <Panels />
      <CartSheet />
      <CheckoutScreen />
      <CoinBurst />
    </div>
    </MotionConfig>
  )
}
