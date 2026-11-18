import type { LucideIcon } from 'lucide-react'
import { Banknote, Building2, CreditCard, Home, Smartphone } from 'lucide-react'

// Checkout options for the prototype. Addresses are placeholders; no payment is ever taken.

export type Address = { id: string; label: string; icon: LucideIcon; name: string; line: string; area: string }
export const ADDRESSES: Address[] = [
  { id: 'home', label: 'Home', icon: Home, name: 'Rahul', line: 'Flat 4B, 12th Main Road', area: 'Indiranagar, Bengaluru 560038' },
  { id: 'office', label: 'Office', icon: Building2, name: 'Rahul', line: '5th floor, Tower B', area: 'Koramangala, Bengaluru 560034' },
]

/** Where a gift for each person goes (shown, never editable here). */
export const GIFT_AREA: Record<string, string> = {
  meera: 'HSR Layout, Bengaluru',
  amma: 'Jayanagar, Bengaluru',
  arjun: 'Whitefield, Bengaluru',
  kavya: 'Koramangala, Bengaluru',
}

export type PayMethod = { id: string; label: string; detail: string; icon: LucideIcon }
export const PAY_METHODS: PayMethod[] = [
  { id: 'upi', label: 'UPI', detail: 'Pay with any UPI app', icon: Smartphone },
  { id: 'card', label: 'Card', detail: 'Credit or debit card', icon: CreditCard },
  { id: 'cod', label: 'Pay on delivery', detail: 'Cash or UPI at the door', icon: Banknote },
]

/** Delivery choices for stores that deliver from nearby (grocery); others ship on their own timeline. */
export const GROCERY_SLOTS = [
  { id: 'now', label: 'In 15–20 min' },
  { id: 'eve', label: 'Today, 6–8 pm' },
  { id: 'am', label: 'Tomorrow, 7–9 am' },
]
