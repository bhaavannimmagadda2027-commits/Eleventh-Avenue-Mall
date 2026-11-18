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
]

export const STORE_BY_ID = Object.fromEntries(TATA_STORES.map((st) => [st.id, st])) as Record<string, Store>

// the main destination for each category (ground floor first)
export function storeForCategory(cat: CategoryId, stores = TATA_STORES): Store | undefined {
  return stores.find((st) => st.category === cat && st.level === 0) ?? stores.find((st) => st.category === cat)
}
