import type { AppIcon } from '../components/ui/icons'
import { Apple, Sparkles, Headphones, Shirt, Baby, Sofa, Gem, Coffee, Pill, Watch, Handbag, Grains, Wrench, Handshake } from '../components/ui/icons'

export type CategoryId =
  | 'grocery' | 'beauty' | 'electronics' | 'fashion' | 'kids'
  | 'home' | 'jewellery' | 'dining' | 'health' | 'watches'
  | 'accessories' | 'staples' | 'supplies' | 'services'

export type Category = { id: CategoryId; label: string; icon: AppIcon; glyph: string }

// glyph = simple mark drawn on the physical directory sign (canvas)
export const CATEGORIES: Category[] = [
  { id: 'grocery', label: 'Grocery', icon: Apple, glyph: 'leaf' },
  { id: 'staples', label: 'Staples', icon: Grains, glyph: 'grain' },
  { id: 'beauty', label: 'Beauty', icon: Sparkles, glyph: 'drop' },
  { id: 'electronics', label: 'Electronics', icon: Headphones, glyph: 'bolt' },
  { id: 'fashion', label: 'Fashion', icon: Shirt, glyph: 'hanger' },
  { id: 'accessories', label: 'Accessories', icon: Handbag, glyph: 'bag' },
  { id: 'kids', label: 'Kids', icon: Baby, glyph: 'star' },
  { id: 'home', label: 'Home', icon: Sofa, glyph: 'house' },
  { id: 'jewellery', label: 'Jewellery', icon: Gem, glyph: 'gem' },
  { id: 'watches', label: 'Watches', icon: Watch, glyph: 'clock' },
  { id: 'health', label: 'Health', icon: Pill, glyph: 'cross' },
  { id: 'dining', label: 'Dining', icon: Coffee, glyph: 'cup' },
  { id: 'supplies', label: 'Tools & supplies', icon: Wrench, glyph: 'tool' },
  { id: 'services', label: 'Services', icon: Handshake, glyph: 'desk' },
]

export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>

// order shown in the bottom category strip
export const STRIP: CategoryId[] = ['grocery', 'staples', 'beauty', 'electronics', 'fashion', 'accessories', 'kids', 'home', 'jewellery', 'dining']
