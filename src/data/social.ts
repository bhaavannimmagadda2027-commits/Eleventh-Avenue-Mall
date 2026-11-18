// Friends and family for the social-shopping prototype. All people, places and lists are sample data.

export type Relation = 'family' | 'friend'
export type Friend = {
  id: string
  name: string
  relation: Relation
  /** how they show up in lists: "Sister", "Friend" */
  label: string
  tint: string
  /** what they have saved and share with you (their own cart or wishlist) */
  list: string[]
}

export const FRIENDS: Friend[] = [
  { id: 'meera', name: 'Meera', relation: 'family', label: 'Sister', tint: '#B33A68', list: ['perfume', 'lipstick', 'serum', 'sunscreen'] },
  { id: 'amma', name: 'Amma', relation: 'family', label: 'Mother', tint: '#8A5A32', list: ['bedsheet', 'pot', 'storejars'] },
  { id: 'arjun', name: 'Arjun', relation: 'friend', label: 'Friend', tint: '#2F6F8F', list: ['headphones', 'speaker', 'mouse'] },
  { id: 'kavya', name: 'Kavya', relation: 'friend', label: 'Friend', tint: '#5E7A3A', list: ['vase', 'lamp', 'mugs'] },
]
export const FRIEND_BY_ID = Object.fromEntries(FRIENDS.map((f) => [f.id, f])) as Record<string, Friend>

export type Presence = {
  status: 'online' | 'away' | 'offline'
  /** 'lobby' or a store id, while online */
  at?: string
  /** "20 min ago", while away or offline */
  seen?: string
}

export const SEED_PRESENCE: Record<string, Presence> = {
  meera: { status: 'online', at: 'palette' },
  arjun: { status: 'online', at: 'croma' },
  amma: { status: 'away', seen: '20 min ago' },
  kavya: { status: 'offline', seen: 'Yesterday' },
}

/** The family cart starts with what others in the family already added this week. */
export const SEED_FAMILY_CART = [
  { productId: 'milk', qty: 2, by: 'amma' },
  { productId: 'atta', qty: 1, by: 'amma' },
  { productId: 'banana', qty: 1, by: 'meera' },
]

export type Reaction = 'love' | 'yes'
export const REACTION_LABEL: Record<Reaction, string> = { love: 'loves', yes: 'says yes to' }
