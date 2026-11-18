// Local mock catalogue for every walk-in store. Prices are illustrative; product brands other than the stores' own labels are made up.
export type Shape =
  | 'round' | 'banana' | 'leafy' | 'spinach' | 'carrot' | 'broccoli' | 'capsicum'
  | 'bottle' | 'tub' | 'block' | 'eggs' | 'loaf' | 'box' | 'pillow' | 'jar' | 'tetra'
  // beauty
  | 'tube' | 'dropper' | 'lipstick' | 'pencil' | 'perfume'
  // electronics
  | 'headphones' | 'earbuds' | 'speaker' | 'smartspeaker' | 'laptop' | 'tablet' | 'phone' | 'watch' | 'mouse' | 'keyboard' | 'tv'
  // apparel
  | 'tshirt' | 'hoodie' | 'dress' | 'folded' | 'shoes' | 'cap' | 'backpack'
  // home
  | 'mug' | 'plates' | 'pot' | 'lamp' | 'vase' | 'cushion'

export type SectionId = 'vegetables' | 'fruits' | 'bakery' | 'dairy' | 'beverages' | 'breakfast' | 'staples' | 'snacks' | 'pantry'
  | 'skincare' | 'haircare' | 'makeup' | 'fragrance'
  | 'audio' | 'computing' | 'phones' | 'tv'
  | 'kidswear' | 'kidsbasics' | 'kidsshoes' | 'kidsacc'
  | 'kitchen' | 'cleaning' | 'bedding' | 'decor'

/** Packaging art drawn on the pack's front face. */
export type Art = 'cow' | 'curd' | 'paneer' | 'butter' | 'egg' | 'cheese' | 'flakes' | 'muesli' | 'oats' | 'honey' | 'rice' | 'wheat' | 'dal' | 'oil' | 'chips' | 'chilli' | 'biscuit' | 'coffee' | 'tea' | 'orange' | 'mango' | 'bread'
  | 'drop' | 'aloe' | 'rose' | 'sun' | 'hair' | 'bolt' | 'sock' | 'spray'
  // garment prints and textile patterns
  | 'dino' | 'stripes' | 'star' | 'heart' | 'plain' | 'checks' | 'floral'

export type Product = {
  id: string
  storeId: string
  section: SectionId
  name: string
  brand: string
  size: string
  price: number
  mrp?: number
  desc: string
  offer?: string
  shape: Shape
  dims: [number, number, number] // w h d in metres for packs; [radius,,] for produce
  colors: string[] // produce tones, or [pack colour, accent]
  art?: Art
  tray?: string // overhead dark-store camera image (produce only)
  alt?: string // alternatives group
}

const bb = 'bigbasket'
const P = (p: Omit<Product, 'storeId'>): Product => ({ storeId: bb, ...p })
const at = (storeId: string) => (p: Omit<Product, 'storeId'>): Product => ({ storeId, ...p })
const B = at('palette'), E = at('croma'), K = at('zudio'), H = at('westside-home')

// Products for the beauty, electronics, kids and home stores.
const NEW: Product[] = [
  // Tata CLiQ Palette: skincare, hair, makeup, fragrance
  B({ id: 'facewash', section: 'skincare', name: 'Hydrating gel face wash', brand: 'Vana Botanicals', size: '100 ml', price: 299, desc: 'Gentle aloe and cucumber gel cleanser for daily use.', shape: 'tube', dims: [0.05, 0.17, 0.035], colors: ['#DDEFD8', '#3E7D4A'], art: 'aloe', alt: 'cleanse' }),
  B({ id: 'toner', section: 'skincare', name: 'Rose water toner', brand: 'Vana Botanicals', size: '200 ml', price: 349, desc: 'Steam-distilled rose water to refresh and tone.', shape: 'bottle', dims: [0.06, 0.17, 0.06], colors: ['#F7E1E6', '#B33A68'], art: 'rose', alt: 'cleanse' }),
  B({ id: 'serum', section: 'skincare', name: 'Vitamin C serum 10%', brand: 'Lumière Lab', size: '30 ml', price: 799, mrp: 899, desc: 'Brightening serum with stable vitamin C and ferulic acid.', offer: 'Free sample', shape: 'dropper', dims: [0.04, 0.12, 0.04], colors: ['#C9782A', '#1E1E1E'], art: 'drop', alt: 'treat' }),
  B({ id: 'moisturiser', section: 'skincare', name: 'Ceramide moisturiser', brand: 'Lumière Lab', size: '50 g', price: 549, desc: 'Barrier-repair cream for dry and sensitive skin.', shape: 'jar', dims: [0.075, 0.06, 0.075], colors: ['#F7F4EF', '#C9A76B'], art: 'drop', alt: 'treat' }),
  B({ id: 'sunscreen', section: 'skincare', name: 'Sunscreen SPF 50', brand: 'Vana Botanicals', size: '50 g', price: 499, desc: 'Light, no white cast, PA++++.', shape: 'tube', dims: [0.045, 0.15, 0.03], colors: ['#F7D35A', '#E8762A'], art: 'sun', alt: 'treat' }),
  B({ id: 'shampoo', section: 'haircare', name: 'Bhringraj shampoo', brand: 'Vana Botanicals', size: '340 ml', price: 399, desc: 'Sulphate-free shampoo for hair fall control.', shape: 'bottle', dims: [0.07, 0.22, 0.07], colors: ['#2E5D3A', '#E8C547'], art: 'hair', alt: 'hair' }),
  B({ id: 'conditioner', section: 'haircare', name: 'Bhringraj conditioner', brand: 'Vana Botanicals', size: '200 ml', price: 399, desc: 'Lightweight conditioner that detangles without weighing hair down.', shape: 'tube', dims: [0.06, 0.2, 0.04], colors: ['#E8F0E2', '#2E5D3A'], art: 'hair', alt: 'hair' }),
  B({ id: 'hairoil', section: 'haircare', name: 'Onion & bhringraj hair oil', brand: 'Vana Botanicals', size: '200 ml', price: 395, desc: 'Cold-pressed oil blend for scalp massage.', shape: 'bottle', dims: [0.065, 0.18, 0.065], colors: ['#6B3F1F', '#E8DCC5'], art: 'hair', alt: 'hair' }),
  B({ id: 'lipstick', section: 'makeup', name: 'Matte lipstick, brick red', brand: 'Rang Studio', size: '4.2 g', price: 399, desc: 'Long-wear matte lipstick that does not dry the lips.', shape: 'lipstick', dims: [0.025, 0.085, 0.025], colors: ['#A2302F', '#C9A76B'], alt: 'makeup' }),
  B({ id: 'kajal', section: 'makeup', name: 'Smudge-proof kajal', brand: 'Rang Studio', size: '0.35 g', price: 199, desc: 'Intense black kajal that lasts all day.', shape: 'pencil', dims: [0.012, 0.14, 0.012], colors: ['#1B1B1B', '#C9A76B'], alt: 'makeup' }),
  B({ id: 'foundation', section: 'makeup', name: 'Skin tint foundation', brand: 'Rang Studio', size: '30 ml', price: 699, desc: 'Light coverage, dewy finish, 12 shades.', shape: 'bottle', dims: [0.045, 0.12, 0.045], colors: ['#E3B892', '#1B1B1B'], art: 'drop', alt: 'makeup' }),
  B({ id: 'perfume', section: 'fragrance', name: 'Eau de parfum, jasmine', brand: 'Saanjh', size: '50 ml', price: 1850, desc: 'Night-blooming jasmine with sandalwood.', offer: 'Gift wrap free', shape: 'perfume', dims: [0.07, 0.1, 0.045], colors: ['#F1D9E3', '#7A5B8C'], art: 'rose', alt: 'scent' }),
  B({ id: 'bodymist', section: 'fragrance', name: 'Body mist, vetiver', brand: 'Saanjh', size: '150 ml', price: 499, desc: 'Fresh, earthy everyday mist.', shape: 'bottle', dims: [0.055, 0.19, 0.055], colors: ['#DDE6E1', '#3E5A4E'], art: 'spray', alt: 'scent' }),
  // Croma: audio, computing, phones, TV
  E({ id: 'headphones', section: 'audio', name: 'Wireless ANC headphones', brand: 'Pulse Audio', size: '40 h battery', price: 4999, mrp: 6999, desc: 'Active noise cancelling over-ear headphones with fast charge.', offer: 'Launch price', shape: 'headphones', dims: [0.19, 0.21, 0.09], colors: ['#2B2D33', '#7665B5'], alt: 'audio' }),
  E({ id: 'earbuds', section: 'audio', name: 'True wireless earbuds', brand: 'Pulse Audio', size: 'IPX4', price: 1999, desc: '30 hours with the case, low-latency game mode.', shape: 'earbuds', dims: [0.065, 0.05, 0.035], colors: ['#F4F4F2', '#2B2D33'], alt: 'audio' }),
  E({ id: 'speaker', section: 'audio', name: 'Portable speaker', brand: 'Pulse Audio', size: '20 W', price: 2999, desc: 'Waterproof speaker with deep bass and 12 h play.', shape: 'speaker', dims: [0.085, 0.18, 0.085], colors: ['#3B5BDB', '#1E1E22'], alt: 'audio' }),
  E({ id: 'smartspeaker', section: 'audio', name: 'Smart speaker', brand: 'Nimbus Home', size: 'Wi-Fi + Bluetooth', price: 3499, desc: 'Voice assistant speaker that controls your smart home.', shape: 'smartspeaker', dims: [0.11, 0.1, 0.11], colors: ['#9A9CA3', '#7665B5'], alt: 'audio' }),
  E({ id: 'laptop', section: 'computing', name: 'Nimbus Book 14', brand: 'Nimbus', size: '14″ · 16 GB · 512 GB', price: 54990, desc: 'Thin and light aluminium laptop with an all-day battery.', shape: 'laptop', dims: [0.32, 0.22, 0.22], colors: ['#C9CBCE', '#1E1E22'], alt: 'compute' }),
  E({ id: 'tablet', section: 'computing', name: 'Nimbus Tab 11', brand: 'Nimbus', size: '11″ · 128 GB', price: 24999, desc: '11-inch tablet with a 90 Hz display and stylus support.', shape: 'tablet', dims: [0.25, 0.17, 0.008], colors: ['#2B2D33', '#3B5BDB'], alt: 'compute' }),
  E({ id: 'keyboard', section: 'computing', name: 'Wireless keyboard', brand: 'Croma', size: 'Full size', price: 1499, desc: 'Quiet keys, three-device switching.', shape: 'keyboard', dims: [0.42, 0.025, 0.13], colors: ['#E9E9EC', '#2B2D33'], alt: 'compute' }),
  E({ id: 'mouse', section: 'computing', name: 'Wireless mouse', brand: 'Croma', size: '2.4 GHz', price: 799, desc: 'Ergonomic silent-click mouse.', shape: 'mouse', dims: [0.065, 0.04, 0.11], colors: ['#2B2D33', '#7665B5'], alt: 'compute' }),
  E({ id: 'phone', section: 'phones', name: 'Nimbus 5G', brand: 'Nimbus', size: '8 GB · 256 GB', price: 19999, desc: '6.6-inch AMOLED phone with a 50 MP camera.', shape: 'phone', dims: [0.075, 0.16, 0.008], colors: ['#1E1E22', '#7665B5'], alt: 'mobile' }),
  E({ id: 'watch', section: 'phones', name: 'Fitness smartwatch', brand: 'Nimbus', size: '1.4″ AMOLED', price: 3999, desc: 'Heart rate, SpO2, sleep tracking and GPS.', shape: 'watch', dims: [0.045, 0.06, 0.05], colors: ['#1F2B3A', '#3FB6A8'], alt: 'mobile' }),
  E({ id: 'powerbank', section: 'phones', name: 'Power bank 20,000 mAh', brand: 'Croma', size: '22.5 W', price: 1299, desc: 'Charges a phone four times; USB-C in and out.', shape: 'box', dims: [0.075, 0.15, 0.03], colors: ['#E7E7EA', '#163533'], art: 'bolt', alt: 'mobile' }),
  E({ id: 'tv', section: 'tv', name: '55″ 4K smart TV', brand: 'Croma', size: '55″ · 4K HDR', price: 39990, mrp: 49990, desc: '4K HDR panel, Dolby Audio and built-in streaming apps.', offer: 'Free wall mount', shape: 'tv', dims: [1.23, 0.72, 0.06], colors: ['#141416', '#3B5BDB'] }),
  // Zudio Kids: tops, basics, shoes, accessories
  K({ id: 'tee-dino', section: 'kidswear', name: 'Dino print T-shirt', brand: 'Zudio', size: '4–5 years', price: 299, desc: 'Soft cotton tee with a playful dinosaur print.', shape: 'tshirt', dims: [0.36, 0.38, 0.02], colors: ['#9DC3E6', '#2E7D4F'], art: 'dino', alt: 'tops' }),
  K({ id: 'tee-stripe', section: 'kidswear', name: 'Striped T-shirt', brand: 'Zudio', size: '4–5 years', price: 249, desc: 'Breton stripes in breathable cotton.', shape: 'tshirt', dims: [0.36, 0.38, 0.02], colors: ['#FFFFFF', '#2F4A7A'], art: 'stripes', alt: 'tops' }),
  K({ id: 'hoodie', section: 'kidswear', name: 'Zip hoodie', brand: 'Zudio', size: '6–7 years', price: 699, desc: 'Brushed fleece hoodie with a front zip.', shape: 'hoodie', dims: [0.42, 0.42, 0.03], colors: ['#F2C84B', '#C9372C'], art: 'star', alt: 'tops' }),
  K({ id: 'dress', section: 'kidswear', name: 'Tiered cotton dress', brand: 'Zudio', size: '5–6 years', price: 599, desc: 'Twirly tiered dress with a hidden pocket.', shape: 'dress', dims: [0.36, 0.52, 0.02], colors: ['#F4A7A0', '#FFFFFF'], art: 'heart', alt: 'tops' }),
  K({ id: 'shorts', section: 'kidsbasics', name: 'Cotton shorts, 2 pack', brand: 'Zudio', size: '4–5 years', price: 349, desc: 'Elasticated waist shorts in navy and olive.', shape: 'folded', dims: [0.22, 0.05, 0.18], colors: ['#2F4A7A', '#6B7A3A'], art: 'plain', alt: 'basics' }),
  K({ id: 'socks', section: 'kidsbasics', name: 'Ankle socks, 5 pairs', brand: 'Zudio', size: '3–5 years', price: 249, desc: 'Cushioned cotton socks in bright colours.', shape: 'box', dims: [0.12, 0.18, 0.04], colors: ['#FFFFFF', '#E8604C'], art: 'sock', alt: 'basics' }),
  K({ id: 'sneakers', section: 'kidsshoes', name: 'Velcro sneakers', brand: 'Zudio', size: 'UK 11', price: 899, desc: 'Lightweight sneakers with easy velcro straps.', shape: 'shoes', dims: [0.16, 0.08, 0.17], colors: ['#FFFFFF', '#3B6FD6'], alt: 'shoes' }),
  K({ id: 'sandals', section: 'kidsshoes', name: 'Sport sandals', brand: 'Zudio', size: 'UK 11', price: 499, desc: 'Grippy sole sandals for the park and the beach.', shape: 'shoes', dims: [0.16, 0.06, 0.17], colors: ['#F2C84B', '#2E7D4F'], alt: 'shoes' }),
  K({ id: 'cap', section: 'kidsacc', name: 'Baseball cap', brand: 'Zudio', size: 'Adjustable', price: 199, desc: 'Cotton twill cap with a curved brim.', shape: 'cap', dims: [0.17, 0.09, 0.22], colors: ['#C9372C', '#FFFFFF'], alt: 'acc' }),
  K({ id: 'backpack', section: 'kidsacc', name: 'School backpack', brand: 'Zudio', size: '15 L', price: 799, desc: 'Padded straps and a bottle pocket.', shape: 'backpack', dims: [0.28, 0.36, 0.13], colors: ['#3B6FD6', '#F2C84B'], art: 'star', alt: 'acc' }),
  // Westside Home: kitchen, cleaning, bedding, décor
  H({ id: 'mugs', section: 'kitchen', name: 'Stoneware mugs, set of 2', brand: 'Westside Home', size: '350 ml each', price: 599, desc: 'Reactive-glaze stoneware, microwave safe.', shape: 'mug', dims: [0.085, 0.1, 0.085], colors: ['#7C9877', '#F4F1EA'], alt: 'dining' }),
  H({ id: 'plates', section: 'kitchen', name: 'Dinner plates, set of 4', brand: 'Westside Home', size: '27 cm', price: 1299, desc: 'Matte white porcelain with a speckled rim.', shape: 'plates', dims: [0.27, 0.09, 0.27], colors: ['#F7F5F0', '#BFA887'], alt: 'dining' }),
  H({ id: 'pot', section: 'kitchen', name: 'Stainless steel saucepan', brand: 'Westside Home', size: '2 L', price: 1499, desc: 'Tri-ply base, induction friendly, glass lid.', shape: 'pot', dims: [0.2, 0.13, 0.2], colors: ['#C9CBCE', '#2A2A2C'], alt: 'dining' }),
  H({ id: 'storejars', section: 'kitchen', name: 'Glass storage jars, set of 3', brand: 'Westside Home', size: '1 L each', price: 699, desc: 'Airtight bamboo lids for dals and spices.', shape: 'jar', dims: [0.1, 0.16, 0.1], colors: ['#E8F1F2', '#BFA887'], art: 'plain', alt: 'dining' }),
  H({ id: 'cleaner', section: 'cleaning', name: 'Multi-surface cleaner', brand: 'Westside Home', size: '500 ml', price: 199, desc: 'Plant-based spray for kitchen and bath.', shape: 'bottle', dims: [0.07, 0.24, 0.07], colors: ['#E3F1EA', '#3E8A6E'], art: 'spray' }),
  H({ id: 'bedsheet', section: 'bedding', name: 'Cotton bedsheet set', brand: 'Westside Home', size: 'Queen · 3 pc', price: 1499, desc: '200-thread-count percale with two pillow covers.', shape: 'folded', dims: [0.32, 0.08, 0.26], colors: ['#E9E3D8', '#7C9877'], art: 'floral', alt: 'bed' }),
  H({ id: 'towels', section: 'bedding', name: 'Bath towels, set of 2', brand: 'Westside Home', size: '70 × 140 cm', price: 799, desc: 'Plush 500 GSM cotton towels.', shape: 'folded', dims: [0.3, 0.1, 0.22], colors: ['#BFD3DA', '#FFFFFF'], art: 'stripes', alt: 'bed' }),
  H({ id: 'cushion', section: 'bedding', name: 'Block print cushion cover', brand: 'Westside Home', size: '40 × 40 cm', price: 449, desc: 'Hand block-printed cotton cushion cover.', shape: 'cushion', dims: [0.4, 0.4, 0.13], colors: ['#E8DCC6', '#B85A1E'], art: 'checks', alt: 'bed' }),
  H({ id: 'lamp', section: 'decor', name: 'Ceramic table lamp', brand: 'Westside Home', size: '45 cm', price: 1999, desc: 'Ribbed ceramic base with a linen shade.', shape: 'lamp', dims: [0.26, 0.45, 0.26], colors: ['#F1ECE3', '#D9C5A5'], alt: 'decor' }),
  H({ id: 'vase', section: 'decor', name: 'Terracotta vase', brand: 'Westside Home', size: '28 cm', price: 899, desc: 'Hand-thrown terracotta with a matte finish.', shape: 'vase', dims: [0.16, 0.28, 0.16], colors: ['#C27A4A', '#A85F35'], alt: 'decor' }),
]

export const PRODUCTS: Product[] = [
  // vegetables (left wall crates), each with a tray camera image
  P({ id: 'tomato', section: 'vegetables', name: 'Tomato, hybrid', brand: 'Fresho', size: '500 g', price: 32, mrp: 40, desc: 'Firm, deep red tomatoes for curries and salads.', offer: '20% off today', shape: 'round', dims: [0.062, 0, 0], colors: ['#D93A2B', '#C92F22', '#E24A2F'], tray: 'trays/tomato.jpg', alt: 'veg' }),
  P({ id: 'onion', section: 'vegetables', name: 'Onion', brand: 'Fresho', size: '1 kg', price: 38, desc: 'Red onions from Nashik, sorted by size.', shape: 'round', dims: [0.066, 0, 0], colors: ['#94465A', '#A3576B', '#86404F'], tray: 'trays/onion.jpg', alt: 'veg' }),
  P({ id: 'potato', section: 'vegetables', name: 'Potato', brand: 'Fresho', size: '1 kg', price: 34, desc: 'Everyday potatoes, good for frying and sabzi.', shape: 'round', dims: [0.07, 0, 0], colors: ['#C9A26A', '#BD965E', '#D4B07A'], tray: 'trays/potato.jpg', alt: 'veg' }),
  P({ id: 'carrot', section: 'vegetables', name: 'Carrot, Ooty', brand: 'Fresho', size: '500 g', price: 42, desc: 'Sweet, crunchy carrots from the Nilgiris.', shape: 'carrot', dims: [0.032, 0, 0], colors: ['#E9772A', '#F08A33'], tray: 'trays/carrot.jpg', alt: 'veg' }),
  P({ id: 'capsicum', section: 'vegetables', name: 'Capsicum, green', brand: 'Fresho', size: '250 g', price: 28, desc: 'Glossy green capsicum with thick walls.', shape: 'capsicum', dims: [0.07, 0, 0], colors: ['#3E8A2E', '#4C9A36'], tray: 'trays/capsicum.jpg', alt: 'veg' }),
  P({ id: 'broccoli', section: 'vegetables', name: 'Broccoli', brand: 'Fresho', size: '1 pc, ~300 g', price: 89, desc: 'Tight green florets, washed and trimmed.', shape: 'broccoli', dims: [0.1, 0, 0], colors: ['#3F6E34', '#4E7F3C'], tray: 'trays/broccoli.jpg', alt: 'veg' }),
  P({ id: 'lettuce', section: 'vegetables', name: 'Iceberg lettuce', brand: 'Fresho', size: '1 pc', price: 65, desc: 'Crisp hydroponic lettuce for salads and wraps.', shape: 'leafy', dims: [0.11, 0, 0], colors: ['#8DBA5C', '#9CC86A'], tray: 'trays/lettuce.jpg', alt: 'veg' }),
  P({ id: 'spinach', section: 'vegetables', name: 'Spinach (palak)', brand: 'Fresho', size: '250 g bunch', price: 25, desc: 'Tender palak leaves, cleaned of roots.', offer: '2× NeuCoins', shape: 'spinach', dims: [0.09, 0, 0], colors: ['#2F6E33', '#3B7F3C', '#2A6230'], tray: 'trays/spinach.jpg', alt: 'veg' }),
  // fruits (right wall crates)
  P({ id: 'apple', section: 'fruits', name: 'Apple, Shimla', brand: 'Fresho', size: '4 pcs, ~600 g', price: 160, desc: 'Crisp, sweet apples from Himachal orchards.', shape: 'round', dims: [0.075, 0, 0], colors: ['#B8262E', '#C93A36', '#A82029'], alt: 'fruit' }),
  P({ id: 'banana', section: 'fruits', name: 'Banana, Robusta', brand: 'Fresho', size: '6 pcs', price: 48, desc: 'Ripe robusta bananas, ready to eat.', shape: 'banana', dims: [0.1, 0, 0], colors: ['#F2CF3A', '#E9C22E'], alt: 'fruit' }),
  P({ id: 'orange', section: 'fruits', name: 'Orange, Nagpur', brand: 'Fresho', size: '1 kg', price: 110, desc: 'Juicy Nagpur oranges, easy to peel.', offer: 'New season', shape: 'round', dims: [0.07, 0, 0], colors: ['#F08A1E', '#E97C14', '#F59A2E'], alt: 'fruit' }),
  P({ id: 'pomegranate', section: 'fruits', name: 'Pomegranate', brand: 'Fresho', size: '2 pcs', price: 140, desc: 'Bhagwa pomegranates with ruby-red arils.', shape: 'round', dims: [0.074, 0, 0], colors: ['#9E2233', '#B32D3C', '#8C1C2B'], alt: 'fruit' }),
  // bakery
  P({ id: 'bread-white', section: 'bakery', name: 'Sandwich bread', brand: 'Fresho Bakery', size: '400 g', price: 45, desc: 'Soft white sandwich loaf, baked this morning.', shape: 'loaf', dims: [0.12, 0.11, 0.24], colors: ['#C98B4A', '#F3E4C6'], alt: 'bread' }),
  P({ id: 'bread-brown', section: 'bakery', name: 'Brown bread', brand: 'Fresho Bakery', size: '400 g', price: 55, desc: 'Whole wheat loaf with a soft crumb.', shape: 'loaf', dims: [0.12, 0.11, 0.24], colors: ['#8A5A32', '#C9A27A'], alt: 'bread' }),
  P({ id: 'pav', section: 'bakery', name: 'Ladi pav', brand: 'Fresho Bakery', size: '6 pcs', price: 35, desc: 'Fluffy pav buns for pav bhaji and vada pav.', shape: 'loaf', dims: [0.16, 0.08, 0.16], colors: ['#D7954F', '#F5E6C8'], alt: 'bread' }),
  // dairy (left wall chillers)
  P({ id: 'milk', section: 'dairy', name: 'Toned milk', brand: 'Fresho', size: '1 L', price: 60, desc: 'Pasteurised toned milk, 3% fat.', shape: 'bottle', dims: [0.09, 0.24, 0.09], colors: ['#FBFBF8', '#2F6FD6'], art: 'cow', alt: 'milk' }),
  P({ id: 'milk-full', section: 'dairy', name: 'Full cream milk', brand: 'Fresho', size: '1 L', price: 72, desc: 'Creamy full cream milk, 6% fat.', shape: 'bottle', dims: [0.09, 0.24, 0.09], colors: ['#FBFBF8', '#C9372C'], art: 'cow', alt: 'milk' }),
  P({ id: 'curd', section: 'dairy', name: 'Fresh curd', brand: 'Fresho', size: '400 g', price: 45, desc: 'Thick set curd made from toned milk.', shape: 'tub', dims: [0.1, 0.08, 0.1], colors: ['#FFFFFF', '#2F6FD6'], art: 'curd', alt: 'milk' }),
  P({ id: 'paneer', section: 'dairy', name: 'Malai paneer', brand: 'Fresho', size: '200 g', price: 95, desc: 'Soft, fresh paneer block.', shape: 'block', dims: [0.12, 0.04, 0.1], colors: ['#FFFFFF', '#3E8A4E'], art: 'paneer' }),
  P({ id: 'butter', section: 'dairy', name: 'Salted butter', brand: 'bb Royal', size: '100 g', price: 58, desc: 'Creamy salted table butter.', shape: 'block', dims: [0.1, 0.035, 0.06], colors: ['#F7D35A', '#C9372C'], art: 'butter' }),
  P({ id: 'eggs', section: 'dairy', name: 'Brown eggs', brand: 'Fresho', size: '6 pcs', price: 72, desc: 'Farm fresh brown eggs.', shape: 'eggs', dims: [0.2, 0.075, 0.11], colors: ['#CDB18A', '#7A5A38'], art: 'egg' }),
  P({ id: 'cheese', section: 'dairy', name: 'Cheese slices', brand: 'bb Royal', size: '200 g, 10 slices', price: 135, desc: 'Processed cheese slices for sandwiches.', shape: 'block', dims: [0.1, 0.03, 0.1], colors: ['#F2B830', '#1F4FA0'], art: 'cheese' }),
  // beverages (right wall)
  P({ id: 'oj', section: 'beverages', name: 'Orange juice', brand: 'bb Royal', size: '1 L', price: 120, desc: 'No added sugar orange juice.', shape: 'tetra', dims: [0.095, 0.2, 0.06], colors: ['#F28C1E', '#2E7D32'], art: 'orange', alt: 'drink' }),
  P({ id: 'mango-drink', section: 'beverages', name: 'Alphonso mango drink', brand: 'bb Royal', size: '1 L', price: 99, desc: 'Thick Alphonso mango drink.', shape: 'tetra', dims: [0.095, 0.2, 0.06], colors: ['#F2B21E', '#C9372C'], art: 'mango', alt: 'drink' }),
  P({ id: 'tea', section: 'beverages', name: 'Assam tea', brand: 'bb Royal', size: '250 g', price: 145, desc: 'Strong CTC tea from Assam estates.', shape: 'box', dims: [0.11, 0.15, 0.07], colors: ['#7A2E22', '#E8B84A'], art: 'tea', alt: 'drink' }),
  P({ id: 'coffee', section: 'beverages', name: 'Filter coffee', brand: 'bb Royal', size: '200 g', price: 210, desc: 'South Indian filter coffee with chicory.', shape: 'jar', dims: [0.09, 0.13, 0.09], colors: ['#3E2A1E', '#E8B84A'], art: 'coffee', alt: 'drink' }),
  // breakfast
  P({ id: 'cornflakes', section: 'breakfast', name: 'Corn flakes', brand: 'bb Royal', size: '475 g', price: 185, desc: 'Crisp, golden corn flakes.', offer: 'Buy 2, save ₹40', shape: 'box', dims: [0.19, 0.28, 0.07], colors: ['#F2C230', '#C9372C'], art: 'flakes', alt: 'cereal' }),
  P({ id: 'muesli', section: 'breakfast', name: 'Fruit & nut muesli', brand: 'bb Royal', size: '500 g', price: 299, desc: 'Oats, almonds, raisins and cranberries.', shape: 'box', dims: [0.19, 0.28, 0.07], colors: ['#E9E1D2', '#6E3B2A'], art: 'muesli', alt: 'cereal' }),
  P({ id: 'oats', section: 'breakfast', name: 'Rolled oats', brand: 'bb Royal', size: '1 kg', price: 199, desc: '100% whole grain rolled oats.', shape: 'box', dims: [0.16, 0.24, 0.1], colors: ['#F4EEDF', '#3E7D3A'], art: 'oats', alt: 'cereal' }),
  P({ id: 'honey', section: 'breakfast', name: 'Wild forest honey', brand: 'bb Royal', size: '500 g', price: 245, desc: 'Raw honey from forest hives.', shape: 'jar', dims: [0.09, 0.12, 0.09], colors: ['#D99A1E', '#3E2A1E'], art: 'honey', alt: 'cereal' }),
  // staples (right wall, big packs low)
  P({ id: 'rice', section: 'staples', name: 'Basmati rice', brand: 'bb Royal', size: '5 kg', price: 649, mrp: 799, desc: 'Long grain aged basmati.', offer: '₹150 off', shape: 'pillow', dims: [0.3, 0.42, 0.11], colors: ['#F4EEDF', '#8B2E2E'], art: 'rice', alt: 'staple' }),
  P({ id: 'atta', section: 'staples', name: 'Whole wheat atta', brand: 'bb Royal', size: '5 kg', price: 265, desc: 'Stone-ground chakki atta.', shape: 'pillow', dims: [0.3, 0.42, 0.11], colors: ['#F2E2B8', '#B85A1E'], art: 'wheat', alt: 'staple' }),
  P({ id: 'dal', section: 'staples', name: 'Toor dal', brand: 'bb Royal', size: '1 kg', price: 165, desc: 'Unpolished toor dal.', shape: 'pillow', dims: [0.17, 0.25, 0.07], colors: ['#E8B32A', '#2F6B3A'], art: 'dal', alt: 'staple' }),
  P({ id: 'oil', section: 'staples', name: 'Sunflower oil', brand: 'bb Royal', size: '1 L', price: 155, desc: 'Refined sunflower oil.', shape: 'bottle', dims: [0.085, 0.27, 0.085], colors: ['#F2D35A', '#D98A1E'], art: 'oil', alt: 'staple' }),
  // snacks (left wall)
  P({ id: 'chips-salted', section: 'snacks', name: 'Potato chips, salted', brand: 'bb Popular', size: '90 g', price: 30, desc: 'Thin-cut classic salted chips.', shape: 'pillow', dims: [0.17, 0.24, 0.07], colors: ['#F2C230', '#1F4FA0'], art: 'chips', alt: 'chips' }),
  P({ id: 'chips-masala', section: 'snacks', name: 'Potato chips, masala', brand: 'bb Popular', size: '90 g', price: 30, desc: 'Tangy Indian masala chips.', shape: 'pillow', dims: [0.17, 0.24, 0.07], colors: ['#2F6FD6', '#C9372C'], art: 'chilli', alt: 'chips' }),
  ...NEW,
  P({ id: 'biscuits', section: 'snacks', name: 'Butter cookies', brand: 'bb Royal', size: '400 g', price: 140, desc: 'Danish-style butter cookies.', shape: 'box', dims: [0.2, 0.06, 0.14], colors: ['#1F4FA0', '#F2C230'], art: 'biscuit', alt: 'chips' }),
]

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>

export function alternatives(p: Product) {
  return PRODUCTS.filter((x) => x.id !== p.id && (p.alt ? x.alt === p.alt : x.section === p.section))
}

export const SECTION_LABEL: Record<SectionId, string> = {
  skincare: 'Skincare',
  haircare: 'Hair care',
  makeup: 'Makeup',
  fragrance: 'Fragrance',
  audio: 'Audio',
  computing: 'Laptops & accessories',
  phones: 'Phones & wearables',
  tv: 'TV & home cinema',
  kidswear: 'Tops & dresses',
  kidsbasics: 'Shorts & basics',
  kidsshoes: 'Shoes',
  kidsacc: 'Bags & caps',
  kitchen: 'Kitchen & dining',
  cleaning: 'Cleaning',
  bedding: 'Bed & bath',
  decor: 'Décor',
  vegetables: 'Fresh vegetables',
  fruits: 'Fresh fruit',
  bakery: 'Bakery',
  dairy: 'Dairy & eggs',
  beverages: 'Tea, coffee & juices',
  breakfast: 'Breakfast',
  staples: 'Rice, atta & dal',
  snacks: 'Snacks',
  pantry: 'Pantry',
}

export const isProduce = (p: Product) => ['round', 'banana', 'leafy', 'spinach', 'carrot', 'broccoli', 'capsicum'].includes(p.shape)
