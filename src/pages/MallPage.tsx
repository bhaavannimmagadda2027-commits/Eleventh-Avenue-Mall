import { motion } from 'framer-motion'
import { MallHud } from '../components/navigation/MallHud'
import { ProductPreview } from '../components/products/ProductPreview'

/** UI layer over the mall. It fades in after the camera has glided into the lobby. */
export function MallPage() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1.1, duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <ProductPreview />
      <MallHud />
    </motion.div>
  )
}
