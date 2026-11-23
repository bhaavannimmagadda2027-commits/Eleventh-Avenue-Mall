import { PRODUCT_BY_ID, type SectionId } from './products'

/**
 * Every walk-in store is a "hall": one wide daylit aisle with fixtures along both walls.
 * Halls sit far apart in world space; only the one you're in is drawn.
 */
export type Fixture =
  | 'crates' | 'chiller' | 'bakery' | 'gondola' | 'bulk' // grocery
  | 'vanity' | 'counter' // beauty
  | 'tech' | 'tvwall' // electronics
  | 'rail' | 'folded' | 'shoewall' // kids
  | 'home' // home

export type SectionRun = { section: SectionId; side: -1 | 1; z0: number; fixture: Fixture; bay: number; sign: string; products: string[] }

export type Hall = {
  id: string
  ox: number // world x of the aisle centre line
  half: number // half-width wall to wall
  depth: number // fixture depth from the wall
  entranceZ: number
  backZ: number
  ceilY: number
  spawnZ: number
  /** warm for beauty, cool for electronics; neutral otherwise */
  light: 'warm' | 'neutral' | 'cool'
  theme: { wall: string; wallGlow: string; floor: string; accent: string; signInk: string }
  back: { title: string; sub: string }
  hanging: { z: number; text: string; sub: string }[]
  runs: SectionRun[]
  promo?: { adId: string; products: [string, string] }
  /** open multi storey hall: galleries, glass roof, big signs and produce islands */
  atrium?: boolean
}

const base = { depth: 0.9, entranceZ: 4.4, ceilY: 5.0, spawnZ: 2.8 }

export const HALLS: Record<string, Hall> = {
  bigbasket: {
    ...base, id: 'bigbasket', ox: 200, half: 5.6, ceilY: 10.4, backZ: -36, light: 'neutral', atrium: true,
    theme: { wall: '#F7F3EC', wallGlow: '#EDE6D8', floor: '#FBF6EE', accent: '#5E9431', signInk: '#2B3A22' },
    back: { title: 'bigbasket', sub: 'Fresh from your neighbourhood, every day' },
    hanging: [
      { z: -5.5, text: 'FRESH PRODUCE', sub: 'Picked this morning' },
      { z: -15.5, text: 'DAIRY & BAKERY', sub: 'Chilled and fresh daily' },
      { z: -25.5, text: 'PANTRY', sub: 'Breakfast, staples and snacks' },
    ],
    runs: [
      { section: 'vegetables', side: -1, z0: -0.6, fixture: 'crates', bay: 1.25, sign: 'VEGETABLES', products: ['tomato', 'onion', 'potato', 'carrot', 'capsicum', 'broccoli', 'lettuce', 'spinach'] },
      { section: 'dairy', side: -1, z0: -16.4, fixture: 'chiller', bay: 1.35, sign: 'DAIRY & EGGS', products: ['milk', 'milk-full', 'curd', 'paneer', 'butter', 'cheese', 'eggs'] },
      { section: 'snacks', side: 1, z0: -0.6, fixture: 'gondola', bay: 1.5, sign: 'SNACKS', products: ['chips-salted', 'chips-masala', 'biscuits'] },
      { section: 'breakfast', side: 1, z0: -5.4, fixture: 'gondola', bay: 1.55, sign: 'BREAKFAST', products: ['cornflakes', 'muesli', 'oats', 'honey'] },
      { section: 'fruits', side: -1, z0: -11, fixture: 'crates', bay: 1.25, sign: 'FRUIT', products: ['apple', 'banana', 'orange', 'pomegranate'] },
      { section: 'bakery', side: -1, z0: -26.2, fixture: 'bakery', bay: 1.5, sign: 'BAKERY', products: ['bread-white', 'bread-brown', 'pav'] },
      { section: 'beverages', side: 1, z0: -19, fixture: 'gondola', bay: 1.5, sign: 'TEA, COFFEE & JUICES', products: ['tea', 'coffee', 'oj', 'mango-drink'] },
      { section: 'staples', side: 1, z0: -11.9, fixture: 'bulk', bay: 1.7, sign: 'RICE, ATTA & DAL', products: ['rice', 'atta', 'dal', 'oil'] },
    ],
    promo: { adId: 'bb-breakfast', products: ['cornflakes', 'muesli'] },
  },
  palette: {
    ...base, id: 'palette', ox: 260, half: 3.6, backZ: -15, light: 'warm',
    theme: { wall: '#F8F1EC', wallGlow: '#F1E2D8', floor: '#FBF4EF', accent: '#B33A68', signInk: '#4A2333' },
    back: { title: 'Tata CLiQ Palette', sub: 'Skincare, makeup and fragrance' },
    hanging: [{ z: -4.2, text: 'SKINCARE & MAKEUP', sub: 'Testers at every shelf' }, { z: -9.6, text: 'HAIR & FRAGRANCE', sub: 'Ask us for a sample' }],
    runs: [
      { section: 'skincare', side: -1, z0: -0.6, fixture: 'vanity', bay: 1.3, sign: 'SKINCARE', products: ['facewash', 'toner', 'serum', 'moisturiser', 'sunscreen'] },
      { section: 'haircare', side: -1, z0: -7.4, fixture: 'vanity', bay: 1.3, sign: 'HAIR CARE', products: ['shampoo', 'conditioner', 'hairoil'] },
      { section: 'makeup', side: 1, z0: -0.6, fixture: 'vanity', bay: 1.3, sign: 'MAKEUP', products: ['lipstick', 'kajal', 'foundation'] },
      { section: 'fragrance', side: 1, z0: -5.0, fixture: 'counter', bay: 1.7, sign: 'FRAGRANCE', products: ['perfume', 'bodymist'] },
    ],
    promo: { adId: 'palette-serum', products: ['serum', 'moisturiser'] },
  },
  croma: {
    ...base, id: 'croma', ox: 320, half: 4.0, backZ: -16, light: 'cool',
    theme: { wall: '#F4F5F6', wallGlow: '#E7ECEF', floor: '#F6F6F4', accent: '#12A88A', signInk: '#163533' },
    back: { title: 'Croma', sub: 'Audio, computing, phones and TV' },
    hanging: [{ z: -4.4, text: 'AUDIO & PHONES', sub: 'Try before you buy' }, { z: -10.4, text: 'LAPTOPS & TV', sub: 'Demo units switched on' }],
    runs: [
      { section: 'audio', side: -1, z0: -0.6, fixture: 'tech', bay: 1.6, sign: 'AUDIO', products: ['headphones', 'earbuds', 'speaker', 'smartspeaker'] },
      { section: 'computing', side: -1, z0: -7.4, fixture: 'tech', bay: 1.6, sign: 'LAPTOPS & ACCESSORIES', products: ['laptop', 'tablet', 'keyboard', 'mouse'] },
      { section: 'tv', side: 1, z0: -0.6, fixture: 'tvwall', bay: 2.4, sign: 'TV & HOME CINEMA', products: ['tv'] },
      { section: 'phones', side: 1, z0: -3.6, fixture: 'tech', bay: 1.6, sign: 'PHONES & WEARABLES', products: ['phone', 'watch', 'powerbank'] },
    ],
    promo: { adId: 'croma-anc', products: ['headphones', 'earbuds'] },
  },
  zudio: {
    ...base, id: 'zudio', ox: 380, half: 3.8, backZ: -12.5, light: 'neutral',
    theme: { wall: '#FBF7EF', wallGlow: '#F4ECDD', floor: '#FAF6EF', accent: '#E8A33A', signInk: '#3A3226' },
    back: { title: 'Zudio Kids', sub: 'Clothes and shoes for little ones' },
    hanging: [{ z: -4.2, text: 'KIDSWEAR', sub: 'Ages 2 to 10' }],
    runs: [
      { section: 'kidswear', side: -1, z0: -0.6, fixture: 'rail', bay: 1.4, sign: 'TOPS & DRESSES', products: ['tee-dino', 'tee-stripe', 'hoodie', 'dress'] },
      { section: 'kidsbasics', side: -1, z0: -6.4, fixture: 'folded', bay: 1.5, sign: 'BASICS', products: ['shorts', 'socks'] },
      { section: 'kidsshoes', side: 1, z0: -0.6, fixture: 'shoewall', bay: 1.5, sign: 'SHOES', products: ['sneakers', 'sandals'] },
      { section: 'kidsacc', side: 1, z0: -3.8, fixture: 'folded', bay: 1.5, sign: 'BAGS & CAPS', products: ['cap', 'backpack'] },
    ],
  },
  'westside-home': {
    ...base, id: 'westside-home', ox: 440, half: 3.9, backZ: -13, light: 'warm',
    theme: { wall: '#F6F1E8', wallGlow: '#EEE5D4', floor: '#F8F2E8', accent: '#8A6A3A', signInk: '#3A2E20' },
    back: { title: 'Westside Home', sub: 'Kitchen, bedding and décor' },
    hanging: [{ z: -4.4, text: 'KITCHEN & BEDROOM', sub: 'Made for everyday living' }],
    runs: [
      { section: 'kitchen', side: -1, z0: -0.6, fixture: 'home', bay: 1.5, sign: 'KITCHEN & DINING', products: ['mugs', 'plates', 'pot', 'storejars'] },
      { section: 'cleaning', side: -1, z0: -6.8, fixture: 'home', bay: 1.5, sign: 'CLEANING', products: ['cleaner'] },
      { section: 'bedding', side: 1, z0: -0.6, fixture: 'home', bay: 1.5, sign: 'BED & BATH', products: ['bedsheet', 'towels', 'cushion'] },
      { section: 'decor', side: 1, z0: -5.4, fixture: 'home', bay: 1.5, sign: 'DÉCOR', products: ['lamp', 'vase'] },
    ],
  },
}

export const HALL_IDS = Object.keys(HALLS)
export const hallOf = (loc: string): Hall | undefined => HALLS[loc]

export type Placement = { productId: string; storeId: string; section: SectionId; side: -1 | 1; z: number; bay: number; fixture: Fixture; x: number }

/** Where every product sits: its hall, bay centre z, and the x of the fixture front. */
export const PLACE: Record<string, Placement> = (() => {
  const out: Record<string, Placement> = {}
  for (const hall of Object.values(HALLS))
    for (const run of hall.runs)
      run.products.forEach((id, i) => {
        if (!PRODUCT_BY_ID[id]) return
        out[id] = { productId: id, storeId: hall.id, section: run.section, side: run.side, z: run.z0 - run.bay / 2 - i * run.bay, bay: run.bay, fixture: run.fixture, x: hall.ox + run.side * (hall.half - hall.depth) }
      })
  return out
})()

export function runEnd(run: SectionRun) { return run.z0 - run.bay * run.products.length }
