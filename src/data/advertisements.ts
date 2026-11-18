// Mock campaigns. Every placement is small and architectural: no billboards, no pop-ups.
export type AdPlacement = 'storefront' | 'pillar' | 'overhead' | 'installation'

export type Ad = {
  id: string
  brand: string
  storeId: string
  /** the advertised product: its render is used in the creative and a tap takes you to it */
  productId?: string
  eyebrow: string
  title: string // use \n for line breaks
  offer: string
  motif: 'headphones' | 'leaf' | 'bottle' | 'watch' | 'cup' | 'coin'
  tint: string // brand colour used sparingly on a light background
}

export const ADS: Ad[] = [
  { id: 'croma-anc', brand: 'Croma', storeId: 'croma', productId: 'headphones', eyebrow: 'CROMA', title: 'Noise cancelling,\nfrom ₹4,999', offer: 'Launch price on Pulse Audio ANC headphones', motif: 'headphones', tint: '#12A88A' },
  { id: 'croma-laptop', brand: 'Croma', storeId: 'croma', productId: 'laptop', eyebrow: 'NIMBUS BOOK 14', title: 'All-day battery,\nunder 1.3 kg', offer: 'Try it switched on in the laptop aisle', motif: 'headphones', tint: '#3B5BDB' },
  { id: 'bb-fresh', brand: 'BigBasket', storeId: 'bigbasket', productId: 'spinach', eyebrow: 'BIGBASKET', title: 'Picked this\nmorning', offer: '2× NeuCoins on fruit and vegetables this week', motif: 'leaf', tint: '#689F38' },
  { id: 'bb-breakfast', brand: 'bb Royal', storeId: 'bigbasket', productId: 'cornflakes', eyebrow: 'BREAKFAST WEEK', title: 'Buy 2 cereals,\nsave ₹40', offer: 'On bb Royal corn flakes, muesli and oats', motif: 'leaf', tint: '#B8862E' },
  { id: 'palette-serum', brand: 'Tata CLiQ Palette', storeId: 'palette', productId: 'serum', eyebrow: 'TATA CLIQ PALETTE', title: 'The vitamin C\nedit', offer: 'Free mini cleanser with any skincare order', motif: 'bottle', tint: '#B33A68' },
  { id: 'palette-scent', brand: 'Saanjh', storeId: 'palette', productId: 'perfume', eyebrow: 'SAANJH', title: 'Jasmine,\nafter dark', offer: 'Complimentary gift wrap on fragrance', motif: 'bottle', tint: '#7A5B8C' },
  { id: 'zudio-school', brand: 'Zudio Kids', storeId: 'zudio', productId: 'backpack', eyebrow: 'ZUDIO KIDS', title: 'Back to school,\nfrom ₹199', offer: 'Bags, caps and sneakers for the new term', motif: 'coin', tint: '#E8A33A' },
  { id: 'wh-table', brand: 'Westside Home', storeId: 'westside-home', productId: 'plates', eyebrow: 'WESTSIDE HOME', title: 'Set the table\nfor four', offer: 'Porcelain dinner plates and stoneware mugs', motif: 'cup', tint: '#8A6A3A' },
  { id: 'titan-new', brand: 'Titan', storeId: 'titan', eyebrow: 'TITAN', title: 'New season\nwatches', offer: 'Complimentary strap fitting in store', motif: 'watch', tint: '#8C7A55' },
  { id: 'sbux-cold', brand: 'Tata Starbucks', storeId: 'starbucks', eyebrow: 'TATA STARBUCKS', title: 'Cold brew\nseason', offer: 'Order ahead from your cart, pick up on the way out', motif: 'cup', tint: '#00704A' },
  { id: 'neu-coins', brand: 'NeuCoins', storeId: 'bigbasket', eyebrow: 'ACROSS THE MALL', title: 'Earn NeuCoins\nin every store', offer: '1 NeuCoin for every ₹100, spend them anywhere in the group', motif: 'coin', tint: '#7665B5' },
]

/** Campaigns shown on the small display inside each store, in rotation. */
export const IN_STORE: Record<string, string[]> = {
  bigbasket: ['bb-fresh', 'bb-breakfast', 'neu-coins'],
  palette: ['palette-serum', 'palette-scent', 'neu-coins'],
  croma: ['croma-anc', 'croma-laptop', 'neu-coins'],
  zudio: ['zudio-school', 'neu-coins'],
  'westside-home': ['wh-table', 'neu-coins'],
}

export const AD_BY_ID = Object.fromEntries(ADS.map((a) => [a.id, a])) as Record<string, Ad>
