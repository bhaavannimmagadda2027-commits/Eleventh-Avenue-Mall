import type { CategoryId } from './categories'
import { L } from './layout'

// Illustrative storefronts for a local prototype demo. Text-only signage, no logos.
// These names are real brands: keep this build local and do not publish it as a public link.
export type Store = {
  id: string
  name: string
  category: CategoryId
  tagline: string
  side: -1 | 1 // -1 = left wall, 1 = right wall (facing into the mall)
  level: 0 | 1 // ground or first floor
  z: number
  sign: { bg: string; fg: string } // brand signage colours
  accent: string // window display tint
  fulfilment: string
}

const s = L.slots

export const TATA_STORES: Store[] = [
  // ground floor, left
  { id: 'bigbasket', name: 'BigBasket', category: 'grocery', tagline: 'Fresh produce, dairy and staples', side: -1, level: 0, z: s[0], sign: { bg: '#689F38', fg: '#FFFFFF' }, accent: '#8BC34A', fulfilment: 'Nearby partner store · 15–20 min' },
  { id: 'palette', name: 'Tata CLiQ Palette', category: 'beauty', tagline: 'Skincare, makeup and fragrance', side: -1, level: 0, z: s[1], sign: { bg: '#FFFFFF', fg: '#B33A68' }, accent: '#E9B7C8', fulfilment: 'Participating retailer · today' },
  { id: 'westside', name: 'Westside', category: 'fashion', tagline: 'Everyday fashion for everyone', side: -1, level: 0, z: s[2], sign: { bg: '#FFFFFF', fg: '#1A1A1A' }, accent: '#D8CFC2', fulfilment: 'Participating retailer · 1–2 days' },
  { id: 'zudio', name: 'Zudio Kids', category: 'kids', tagline: 'Clothing and shoes for little ones', side: -1, level: 0, z: s[3], sign: { bg: '#FFFFFF', fg: '#2A2A2A' }, accent: '#F3D9A4', fulfilment: 'Participating retailer · 1–2 days' },
  { id: 'tanishq', name: 'Tanishq', category: 'jewellery', tagline: 'Gold, diamond and silver jewellery', side: -1, level: 0, z: s[4], sign: { bg: '#5E1A28', fg: '#E9CF95' }, accent: '#E9CF95', fulfilment: 'Insured delivery · 2–3 days' },
  // ground floor, right
  { id: 'croma', name: 'Croma', category: 'electronics', tagline: 'Audio, laptops and smart home', side: 1, level: 0, z: s[0], sign: { bg: '#163533', fg: '#12DAA8' }, accent: '#9FD9CC', fulfilment: 'Participating retailer · 2–3 days' },
  { id: '1mg', name: 'Tata 1mg', category: 'health', tagline: 'Medicines and wellness', side: 1, level: 0, z: s[1], sign: { bg: '#FFFFFF', fg: '#E8604C' }, accent: '#F6C7BE', fulfilment: 'Licensed pharmacy · today' },
  { id: 'titan', name: 'Titan', category: 'watches', tagline: 'Watches for every moment', side: 1, level: 0, z: s[2], sign: { bg: '#2B2A28', fg: '#E6D7B5' }, accent: '#E6D7B5', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'westside-home', name: 'Westside Home', category: 'home', tagline: 'Kitchen, bedding and décor', side: 1, level: 0, z: s[3], sign: { bg: '#FFFFFF', fg: '#1A1A1A' }, accent: '#D9C5A5', fulfilment: 'Participating retailer · 2–4 days' },
  { id: 'starbucks', name: 'Tata Starbucks', category: 'dining', tagline: 'Coffee, tea and bakes', side: 1, level: 0, z: s[4], sign: { bg: '#00704A', fg: '#FFFFFF' }, accent: '#B9D8C8', fulfilment: 'Order ahead · pick up in store' },
  // first floor
  { id: 'fastrack', name: 'Fastrack', category: 'watches', tagline: 'Watches, bags and eyewear', side: -1, level: 1, z: s[0], sign: { bg: '#FFFFFF', fg: '#C62828' }, accent: '#F2C4C4', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'starbazaar', name: 'Star Bazaar', category: 'grocery', tagline: 'Hypermarket', side: 1, level: 1, z: s[0], sign: { bg: '#FFFFFF', fg: '#2E7D32' }, accent: '#C8E6C9', fulfilment: 'Participating retailer · same day' },
  { id: 'cliq', name: 'Tata CLiQ Luxury', category: 'fashion', tagline: 'Designer labels', side: -1, level: 1, z: s[1], sign: { bg: '#111111', fg: '#FFFFFF' }, accent: '#D8D2C8', fulfilment: 'Participating retailer · 2–4 days' },
  { id: 'croma-care', name: 'Croma Care', category: 'electronics', tagline: 'Repairs and installation', side: 1, level: 1, z: s[1], sign: { bg: '#163533', fg: '#12DAA8' }, accent: '#9FD9CC', fulfilment: 'Service desk' },
  { id: 'qmin', name: 'Qmin', category: 'dining', tagline: 'All-day dining', side: -1, level: 1, z: s[2], sign: { bg: '#FFFFFF', fg: '#7A4A2A' }, accent: '#E8D3BC', fulfilment: 'Table booking' },
  { id: 'tataplay', name: 'Tata Play', category: 'electronics', tagline: 'TV and broadband', side: 1, level: 1, z: s[2], sign: { bg: '#FFFFFF', fg: '#4A2D8C' }, accent: '#DCD3F0', fulfilment: 'Service desk' },
  // the extended galleria
  { id: 'irth', name: 'IRTH', category: 'accessories', tagline: 'Handbags, wallets and sunglasses', side: -1, level: 0, z: s[5], sign: { bg: '#2B2433', fg: '#F4E7D3' }, accent: '#D9C3A5', fulfilment: 'Participating retailer · 1–2 days' },
  { id: 'taneira', name: 'Taneira', category: 'fashion', tagline: 'Handwoven sarees', side: -1, level: 0, z: s[6], sign: { bg: '#7A1F3D', fg: '#F4E2C4' }, accent: '#E6C3B4', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'zudio-fashion', name: 'Zudio', category: 'fashion', tagline: 'Everyday styles for all', side: -1, level: 0, z: s[7], sign: { bg: '#FFFFFF', fg: '#111111' }, accent: '#DAD6CE', fulfilment: 'Participating retailer · 1–2 days' },
  { id: 'caratlane', name: 'CaratLane', category: 'jewellery', tagline: 'Modern everyday jewellery', side: -1, level: 0, z: s[8], sign: { bg: '#4B2E83', fg: '#FFFFFF' }, accent: '#D8CCEB', fulfilment: 'Insured delivery · 2–3 days' },
  { id: 'mia', name: 'Mia by Tanishq', category: 'jewellery', tagline: 'Workwear jewellery', side: -1, level: 0, z: s[9], sign: { bg: '#FFFFFF', fg: '#8A1F4B' }, accent: '#EFD3DE', fulfilment: 'Insured delivery · 2–3 days' },
  { id: 'titan-eye', name: 'Titan Eye+', category: 'accessories', tagline: 'Frames, lenses and sunglasses', side: -1, level: 0, z: s[10], sign: { bg: '#123A63', fg: '#FFFFFF' }, accent: '#BCD3E8', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'skinn', name: 'Skinn', category: 'beauty', tagline: 'Fine fragrances', side: -1, level: 0, z: s[11], sign: { bg: '#1F1B18', fg: '#E9D6B5' }, accent: '#E6D7C2', fulfilment: 'Participating retailer · today' },
  { id: 'misbu', name: 'Misbu', category: 'beauty', tagline: 'Makeup and beauty essentials', side: -1, level: 0, z: s[12], sign: { bg: '#F7DDE6', fg: '#8A1F4B' }, accent: '#F2C7D6', fulfilment: 'Participating retailer · today' },
  { id: 'samoh', name: 'Samoh', category: 'fashion', tagline: 'Occasion ethnic wear', side: -1, level: 0, z: s[13], sign: { bg: '#3C2A1E', fg: '#E9CF95' }, accent: '#E3D1B5', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'sampann', name: 'Tata Sampann', category: 'staples', tagline: 'Dals, spices, atta and rice', side: 1, level: 0, z: s[5], sign: { bg: '#B5381F', fg: '#FFFFFF' }, accent: '#EFC48B', fulfilment: 'Nearby partner store · today' },
  { id: 'tata-tea', name: 'Tata Tea', category: 'staples', tagline: 'Everyday teas', side: 1, level: 0, z: s[6], sign: { bg: '#1E5B38', fg: '#F5E7C6' }, accent: '#BFD8B4', fulfilment: 'Nearby partner store · today' },
  { id: 'soulfull', name: 'Soulfull', category: 'staples', tagline: 'Millet cereals and snacks', side: 1, level: 0, z: s[7], sign: { bg: '#F3B21B', fg: '#3A2415' }, accent: '#F6DE9B', fulfilment: 'Nearby partner store · today' },
  { id: 'tata-salt', name: 'Tata Salt', category: 'staples', tagline: 'Salt and kitchen basics', side: 1, level: 0, z: s[8], sign: { bg: '#FFFFFF', fg: '#1C4FA1' }, accent: '#C8D9F2', fulfilment: 'Nearby partner store · today' },
  { id: 'voltas', name: 'Voltas', category: 'electronics', tagline: 'Air conditioners and cooling', side: 1, level: 0, z: s[9], sign: { bg: '#0B4EA2', fg: '#FFFFFF' }, accent: '#BDD4EF', fulfilment: 'Installation · 2–4 days' },
  { id: 'swach', name: 'Tata Swach', category: 'home', tagline: 'Water purifiers', side: 1, level: 0, z: s[10], sign: { bg: '#E7F4FA', fg: '#0C6E9E' }, accent: '#BFE1F0', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'agrico', name: 'Tata Agrico', category: 'supplies', tagline: 'Hand tools and garden supplies', side: 1, level: 0, z: s[11], sign: { bg: '#F2B705', fg: '#1F1F1F' }, accent: '#F4DD8C', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'zudio-beauty', name: 'Zudio Beauty', category: 'beauty', tagline: 'Affordable beauty', side: 1, level: 0, z: s[12], sign: { bg: '#111111', fg: '#FFFFFF' }, accent: '#E6D4DC', fulfilment: 'Participating retailer · today' },
  { id: 'cliq-fashion', name: 'Tata CLiQ Fashion', category: 'fashion', tagline: 'Brands across fashion', side: 1, level: 0, z: s[13], sign: { bg: '#FFFFFF', fg: '#D81F4A' }, accent: '#F2CAD4', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'utsa', name: 'Utsa', category: 'fashion', tagline: 'Contemporary Indian wear', side: -1, level: 1, z: s[3], sign: { bg: '#FFFFFF', fg: '#9C3D22' }, accent: '#EFD6C8', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'zoya', name: 'Zoya', category: 'jewellery', tagline: 'Luxury jewellery', side: -1, level: 1, z: s[4], sign: { bg: '#16130F', fg: '#E2C98F' }, accent: '#E7D8B8', fulfilment: 'Insured delivery · 2–3 days' },
  { id: 'sonata', name: 'Sonata', category: 'watches', tagline: 'Everyday watches', side: -1, level: 1, z: s[5], sign: { bg: '#FFFFFF', fg: '#0E4C8A' }, accent: '#C9DBEE', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'helios', name: 'Helios', category: 'watches', tagline: 'Multi-brand watch store', side: -1, level: 1, z: s[6], sign: { bg: '#1D2733', fg: '#E6D7B5' }, accent: '#D5D3C8', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'nebula', name: 'Nebula', category: 'watches', tagline: 'Solid gold watches', side: -1, level: 1, z: s[7], sign: { bg: '#3A2A12', fg: '#EBD08F' }, accent: '#EBDDB8', fulfilment: 'Participating retailer · 2–3 days' },
  { id: 'tetley', name: 'Tetley', category: 'staples', tagline: 'Green and herbal teas', side: -1, level: 1, z: s[8], sign: { bg: '#FFFFFF', fg: '#006A4E' }, accent: '#C2E0D3', fulfilment: 'Nearby partner store · today' },
  { id: 'tata-coffee', name: 'Tata Coffee Grand', category: 'staples', tagline: 'Instant and filter coffee', side: -1, level: 1, z: s[9], sign: { bg: '#3B2216', fg: '#F0D9AE' }, accent: '#D9BFA3', fulfilment: 'Nearby partner store · today' },
  { id: 'tata-motors', name: 'Tata Motors', category: 'services', tagline: 'Cars, EVs and test drives', side: 1, level: 1, z: s[3], sign: { bg: '#123C7A', fg: '#FFFFFF' }, accent: '#C5D5EC', fulfilment: 'Service desk' },
  { id: 'tata-power', name: 'Tata Power EZ Charge', category: 'services', tagline: 'EV charging and solar', side: 1, level: 1, z: s[4], sign: { bg: '#FFFFFF', fg: '#0B5CAB' }, accent: '#C8DDF2', fulfilment: 'Service desk' },
  { id: 'tata-capital', name: 'Tata Capital', category: 'services', tagline: 'Loans and financial services', side: 1, level: 1, z: s[5], sign: { bg: '#FFFFFF', fg: '#14387F' }, accent: '#CAD6EA', fulfilment: 'Service desk' },
  { id: 'tata-aig', name: 'Tata AIG', category: 'services', tagline: 'General insurance', side: 1, level: 1, z: s[6], sign: { bg: '#0A3D8F', fg: '#FFFFFF' }, accent: '#C3D4EE', fulfilment: 'Service desk' },
  { id: 'tata-aia', name: 'Tata AIA', category: 'services', tagline: 'Life insurance', side: 1, level: 1, z: s[7], sign: { bg: '#FFFFFF', fg: '#C8102E' }, accent: '#F3CBD2', fulfilment: 'Service desk' },
  { id: 'air-india', name: 'Air India', category: 'services', tagline: 'Flights and holidays', side: 1, level: 1, z: s[8], sign: { bg: '#C8102E', fg: '#FFFFFF' }, accent: '#F3C6CE', fulfilment: 'Service desk' },
  { id: 'taj', name: 'Taj', category: 'services', tagline: 'Stays and experiences', side: 1, level: 1, z: s[9], sign: { bg: '#1E1A15', fg: '#D9BC7A' }, accent: '#E6D8BB', fulfilment: 'Service desk' },
]

export const STORE_BY_ID = Object.fromEntries(TATA_STORES.map((st) => [st.id, st])) as Record<string, Store>

// the main destination for each category (ground floor first)
export function storeForCategory(cat: CategoryId, stores = TATA_STORES): Store | undefined {
  return stores.find((st) => st.category === cat && st.level === 0) ?? stores.find((st) => st.category === cat)
}
