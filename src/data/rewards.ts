import type { AppIcon } from '../components/ui/icons'
import { Coffee, Hotel, Plane, ShoppingBag, Sparkles } from '../components/ui/icons'

// NeuCoins can be spent across the wider group, not just in the mall. All values are illustrative.
export type RedeemCategory = 'flights' | 'hotels' | 'restaurants' | 'shopping' | 'experiences'

export const REDEEM_CATEGORIES: { id: RedeemCategory; label: string; icon: AppIcon }[] = [
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'restaurants', label: 'Restaurants', icon: Coffee },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'experiences', label: 'Experiences', icon: Sparkles },
]

export type Redemption = {
  id: string
  category: RedeemCategory
  partner: string
  title: string
  detail: string
  cost: number // NeuCoins
  tint: string
}

export const REDEMPTIONS: Redemption[] = [
  { id: 'ai-blr-del', category: 'flights', partner: 'Air India', title: 'Bengaluru → Delhi, one way', detail: 'Economy, any day this quarter. Taxes paid separately.', cost: 4500, tint: '#C8102E' },
  { id: 'ai-upgrade', category: 'flights', partner: 'Air India', title: 'Upgrade to premium economy', detail: 'On any domestic flight booked with the group.', cost: 3000, tint: '#C8102E' },
  { id: 'taj-weekend', category: 'hotels', partner: 'Taj', title: 'A weekend night in Bengaluru', detail: 'One night for two with breakfast.', cost: 12000, tint: '#8A6A1F' },
  { id: 'vivanta-bfast', category: 'hotels', partner: 'Vivanta', title: 'Breakfast for two', detail: 'At any Vivanta hotel in India.', cost: 1500, tint: '#5E3A6E' },
  { id: 'qmin-dinner', category: 'restaurants', partner: 'Qmin', title: 'Dinner for two', detail: 'Two mains, one dessert, two drinks.', cost: 1800, tint: '#7A4A2A' },
  { id: 'sbux-drink', category: 'restaurants', partner: 'Tata Starbucks', title: 'Any handcrafted beverage', detail: 'Any size, at any store in the mall.', cost: 250, tint: '#00704A' },
  { id: 'croma-500', category: 'shopping', partner: 'Croma', title: '₹500 store voucher', detail: 'On orders above ₹2,000.', cost: 500, tint: '#163533' },
  { id: 'westside-300', category: 'shopping', partner: 'Westside', title: '₹300 store voucher', detail: 'Fashion and Westside Home.', cost: 300, tint: '#1A1A1A' },
  { id: 'jiva-spa', category: 'experiences', partner: 'Jiva Spa', title: '60-minute spa session', detail: 'At participating Taj hotels.', cost: 2500, tint: '#4E7A6A' },
  { id: 'play-binge', category: 'experiences', partner: 'Tata Play', title: 'One month of Binge', detail: 'Streaming apps in one subscription.', cost: 299, tint: '#4A2D8C' },
]

/** Membership tiers by NeuCoins earned over the last 12 months. */
export const TIERS = [
  { name: 'Neu', from: 0, perk: '1 NeuCoin per ₹100', freeDelivery: false, coinRate: 1 },
  { name: 'Neu Plus', from: 5000, perk: 'Free delivery on every order', freeDelivery: true, coinRate: 1 },
  { name: 'Neu Gold', from: 10000, perk: '1.5× NeuCoins in every store', freeDelivery: true, coinRate: 1.5 },
]

export const tierFor = (yearEarned: number) => [...TIERS].reverse().find((t) => yearEarned >= t.from) ?? TIERS[0]

export type Activity = { id: string; label: string; detail: string; amount: number; when: string }

export const SEED_ACTIVITY: Activity[] = [
  { id: 'a4', label: 'BigBasket order', detail: 'Groceries, 14 items', amount: 38, when: '3 days ago' },
  { id: 'a3', label: 'Redeemed at Tata Starbucks', detail: 'Cold brew, grande', amount: -250, when: 'Last week' },
  { id: 'a2', label: 'Croma order', detail: 'Wireless earbuds', amount: 120, when: '2 weeks ago' },
  { id: 'a1', label: 'Welcome to Tata Mall', detail: 'Joining bonus', amount: 500, when: 'Last month' },
]
