import type { Art, Product, SectionId, Shape } from './products'

/**
 * Background stock: made-up packs that fill every shelf around the products you can buy, so the
 * store looks fully stocked. They are not in the catalogue; tapping one opens the product of that bay.
 * Ids start with "fx-" so the art pipeline builds them with lighter geometry.
 */
type Spec = [name: string, brand: string, size: string, shape: Shape, dims: [number, number, number], colors: [string, string], art?: Art]

const SPECS: Partial<Record<SectionId, Spec[]>> = {
  snacks: [
    ['Classic salted', 'Krunchos', '52 g', 'pillow', [0.16, 0.23, 0.06], ['#E8C21F', '#C9282D'], 'chips'],
    ['Cream & onion', 'Krunchos', '52 g', 'pillow', [0.16, 0.23, 0.06], ['#2E9E4A', '#F4F1E6'], 'chips'],
    ['Peri peri', 'Krunchos', '52 g', 'pillow', [0.16, 0.23, 0.06], ['#D9342B', '#F2C230'], 'chilli'],
    ['Tomato tango', 'Zingo', '75 g', 'pillow', [0.17, 0.24, 0.06], ['#C92E3A', '#2B2B2B'], 'chilli'],
    ['Aloo bhujia', 'Masala Mela', '200 g', 'pillow', [0.15, 0.24, 0.06], ['#F28C1E', '#7A1E1E'], 'chilli'],
    ['Navratan mix', 'Masala Mela', '200 g', 'pillow', [0.15, 0.24, 0.06], ['#6B2A8C', '#F2C230'], 'chips'],
    ['Nacho cheese', 'Zingo', '60 g', 'pillow', [0.17, 0.24, 0.06], ['#F2A01E', '#1F3F8C'], 'chips'],
    ['Salted peanuts', 'Haveli', '150 g', 'pillow', [0.13, 0.2, 0.05], ['#1F5FA8', '#F4D35A'], 'dal'],
    ['Glucose biscuits', 'Prabhat', '250 g', 'box', [0.065, 0.2, 0.055], ['#F2D35A', '#C9282D'], 'biscuit'],
    ['Cream sandwich', 'Prabhat', '120 g', 'box', [0.065, 0.19, 0.05], ['#5A2A1E', '#F28C1E'], 'biscuit'],
    ['Digestive', 'Haveli', '250 g', 'box', [0.07, 0.2, 0.06], ['#C7A26A', '#2E5D3A'], 'biscuit'],
    ['Choco chip', 'Haveli', '100 g', 'box', [0.065, 0.18, 0.05], ['#3A2418', '#E8B84A'], 'biscuit'],
  ],
  breakfast: [
    ['Choco crunch', 'Morning Grain', '375 g', 'box', [0.19, 0.27, 0.07], ['#5A2E1E', '#F2C230'], 'flakes'],
    ['Honey loops', 'Morning Grain', '300 g', 'box', [0.18, 0.26, 0.07], ['#F2A01E', '#3E2A1E'], 'honey'],
    ['Wheat flakes', 'Morning Grain', '500 g', 'box', [0.19, 0.27, 0.07], ['#C9372C', '#F4EEDF'], 'flakes'],
    ['Masala oats', 'Swarna', '500 g', 'box', [0.16, 0.24, 0.09], ['#E8762A', '#2E5D3A'], 'oats'],
    ['Granola bites', 'Bhoomi Farms', '400 g', 'box', [0.17, 0.25, 0.08], ['#2E7D4A', '#F2E2B8'], 'muesli'],
    ['Peanut butter', 'Bhoomi Farms', '350 g', 'jar', [0.085, 0.12, 0.085], ['#C98B4A', '#C9282D'], 'honey'],
    ['Mixed fruit jam', 'Swarna', '500 g', 'jar', [0.085, 0.12, 0.085], ['#B8262E', '#F2C230'], 'orange'],
    ['Choco spread', 'Bhoomi Farms', '350 g', 'jar', [0.085, 0.12, 0.085], ['#3A2418', '#F4EEDF'], 'coffee'],
  ],
  beverages: [
    ['Leaf tea', 'Neel Kanth', '500 g', 'box', [0.12, 0.16, 0.07], ['#1F5A3A', '#E8B84A'], 'tea'],
    ['Masala chai', 'Chai Bagh', '250 g', 'box', [0.11, 0.15, 0.07], ['#C9372C', '#F2C230'], 'tea'],
    ['Green tea', 'Chai Bagh', '100 bags', 'box', [0.11, 0.14, 0.07], ['#5E9431', '#F4F1E6'], 'tea'],
    ['Instant coffee', 'Brewhouse', '100 g', 'jar', [0.08, 0.13, 0.08], ['#2A1A12', '#C9372C'], 'coffee'],
    ['Classic coffee', 'Brewhouse', '200 g', 'jar', [0.09, 0.14, 0.09], ['#4A2A1A', '#E8B84A'], 'coffee'],
    ['Mixed fruit', 'Tarang', '1 L', 'tetra', [0.09, 0.2, 0.06], ['#E8402A', '#F2C230'], 'orange'],
    ['Guava', 'Tarang', '1 L', 'tetra', [0.09, 0.2, 0.06], ['#E8708A', '#2E7D32'], 'mango'],
    ['Litchi', 'Tarang', '1 L', 'tetra', [0.09, 0.2, 0.06], ['#F4E1E6', '#B33A68'], 'mango'],
    ['Lemon soda', 'Fizzo', '750 ml', 'bottle', [0.075, 0.27, 0.075], ['#E9F2C8', '#5E9431'], 'orange'],
    ['Cola', 'Fizzo', '750 ml', 'bottle', [0.075, 0.27, 0.075], ['#3A1A12', '#C9282D'], 'drop'],
    ['Orange fizz', 'Fizzo', '750 ml', 'bottle', [0.075, 0.27, 0.075], ['#F28C1E', '#1F4FA0'], 'orange'],
  ],
  staples: [
    ['Sona masoori rice', 'Swarna', '5 kg', 'pillow', [0.3, 0.42, 0.11], ['#F4EEDF', '#1F5FA8'], 'rice'],
    ['Chakki atta', 'Ghar Ka', '5 kg', 'pillow', [0.3, 0.42, 0.11], ['#F2C230', '#C9372C'], 'wheat'],
    ['Multigrain atta', 'Bhoomi Farms', '5 kg', 'pillow', [0.3, 0.42, 0.11], ['#8A5A32', '#F2E2B8'], 'wheat'],
    ['Kolam rice', 'Ghar Ka', '5 kg', 'pillow', [0.3, 0.42, 0.11], ['#E8F0E2', '#2E7D4A'], 'rice'],
    ['Moong dal', 'Ghar Ka', '1 kg', 'pillow', [0.17, 0.25, 0.07], ['#7AA83A', '#F4EEDF'], 'dal'],
    ['Chana dal', 'Swarna', '1 kg', 'pillow', [0.17, 0.25, 0.07], ['#E8A31E', '#7A1E1E'], 'dal'],
    ['Sugar', 'Swarna', '1 kg', 'pillow', [0.17, 0.25, 0.07], ['#F7F7F2', '#1F5FA8'], 'rice'],
    ['Mustard oil', 'Kisan Gold', '1 L', 'bottle', [0.085, 0.27, 0.085], ['#E8C21F', '#C9282D'], 'oil'],
    ['Groundnut oil', 'Kisan Gold', '1 L', 'bottle', [0.085, 0.27, 0.085], ['#F2D35A', '#2E7D4A'], 'oil'],
  ],
  dairy: [
    ['Toned milk', 'Gokul Fresh', '500 ml', 'tetra', [0.075, 0.17, 0.05], ['#F7F7F2', '#1F5FA8'], 'cow'],
    ['Lassi', 'Gokul Fresh', '200 ml', 'tetra', [0.06, 0.13, 0.04], ['#F4E1E6', '#C9282D'], 'cow'],
    ['Buttermilk', 'Gokul Fresh', '500 ml', 'tetra', [0.075, 0.17, 0.05], ['#E8F0E2', '#2E7D4A'], 'cow'],
    ['Dahi', 'Gokul Fresh', '400 g', 'tub', [0.1, 0.08, 0.1], ['#FFFFFF', '#C9372C'], 'curd'],
    ['Greek yoghurt', 'Bhoomi Farms', '100 g', 'tub', [0.08, 0.06, 0.08], ['#F4F1E6', '#5E3A8C'], 'curd'],
    ['Fresh cream', 'Gokul Fresh', '200 ml', 'tetra', [0.07, 0.12, 0.05], ['#F2E2B8', '#1F5FA8'], 'butter'],
  ],
  // Tata CLiQ Palette
  skincare: [
    ['Gentle cleanser', 'Dewdrop', '150 ml', 'tube', [0.05, 0.17, 0.035], ['#E6F0F7', '#3B6FA8'], 'drop'],
    ['Niacinamide serum', 'Lumière Lab', '30 ml', 'dropper', [0.04, 0.12, 0.04], ['#E9DCCB', '#1E1E1E'], 'drop'],
    ['Night cream', 'Dewdrop', '50 g', 'jar', [0.075, 0.06, 0.075], ['#2E2A4A', '#C9A76B'], 'drop'],
    ['Clay mask', 'Vana Botanicals', '100 g', 'tube', [0.055, 0.16, 0.035], ['#8A9A7A', '#F4F1E6'], 'aloe'],
    ['Micellar water', 'Dewdrop', '400 ml', 'bottle', [0.07, 0.2, 0.07], ['#F4E8F0', '#B33A68'], 'rose'],
    ['Body lotion', 'Kesar & Co', '400 ml', 'bottle', [0.07, 0.22, 0.07], ['#F2D9B8', '#C9782A'], 'sun'],
    ['Lip balm', 'Kesar & Co', '10 g', 'tube', [0.025, 0.09, 0.02], ['#E8708A', '#FFFFFF'], 'rose'],
    ['Gel SPF 30', 'Dewdrop', '50 g', 'tube', [0.045, 0.15, 0.03], ['#F7E7A0', '#2E7D4A'], 'sun'],
    ['Retinol serum', 'Lumière Lab', '30 ml', 'dropper', [0.04, 0.12, 0.04], ['#5A3A7A', '#E9DCCB'], 'drop'],
  ],
  haircare: [
    ['Argan shampoo', 'Kesar & Co', '340 ml', 'bottle', [0.07, 0.22, 0.07], ['#C9782A', '#2A1A12'], 'hair'],
    ['Anti-dandruff', 'Tress Lab', '340 ml', 'bottle', [0.07, 0.22, 0.07], ['#1F5FA8', '#F4F1E6'], 'hair'],
    ['Curl cream', 'Tress Lab', '200 ml', 'tube', [0.06, 0.19, 0.04], ['#B33A68', '#F4E1E6'], 'hair'],
    ['Hair mask', 'Kesar & Co', '200 g', 'jar', [0.09, 0.08, 0.09], ['#2E5D3A', '#E8C547'], 'hair'],
    ['Coconut hair oil', 'Vana Botanicals', '300 ml', 'bottle', [0.065, 0.2, 0.065], ['#F4F1E6', '#2E7D4A'], 'hair'],
    ['Hair serum', 'Tress Lab', '100 ml', 'bottle', [0.05, 0.15, 0.05], ['#3A2418', '#C9A76B'], 'drop'],
  ],
  makeup: [
    ['Lipstick, nude', 'Rang Studio', '4.2 g', 'lipstick', [0.025, 0.085, 0.025], ['#C98B7A', '#1B1B1B']],
    ['Lipstick, berry', 'Rang Studio', '4.2 g', 'lipstick', [0.025, 0.085, 0.025], ['#7A1E3A', '#C9A76B']],
    ['Lipstick, coral', 'Glow Theory', '4 g', 'lipstick', [0.025, 0.085, 0.025], ['#E8604C', '#F4F1E6']],
    ['Eyeliner pencil', 'Glow Theory', '1.2 g', 'pencil', [0.012, 0.14, 0.012], ['#3A2A6A', '#E8E1F0']],
    ['Primer', 'Glow Theory', '30 ml', 'bottle', [0.045, 0.12, 0.045], ['#F4E1E6', '#B33A68'], 'drop'],
    ['Concealer', 'Rang Studio', '6 ml', 'tube', [0.025, 0.1, 0.02], ['#D9A982', '#1B1B1B'], 'drop'],
    ['Compact powder', 'Glow Theory', '9 g', 'jar', [0.075, 0.03, 0.075], ['#E3B892', '#1B1B1B']],
  ],
  fragrance: [
    ['Eau de parfum, oud', 'Saanjh', '50 ml', 'perfume', [0.07, 0.1, 0.045], ['#3A2418', '#C9A76B'], 'rose'],
    ['Eau de toilette, citrus', 'Noor', '100 ml', 'perfume', [0.07, 0.11, 0.045], ['#F7E7A0', '#2E5D3A'], 'sun'],
    ['Eau de parfum, rose', 'Noor', '50 ml', 'perfume', [0.065, 0.1, 0.045], ['#F4C7D2', '#B33A68'], 'rose'],
    ['Body mist, mogra', 'Saanjh', '150 ml', 'bottle', [0.055, 0.19, 0.055], ['#F4F1E6', '#7A5B8C'], 'spray'],
    ['Deodorant', 'Noor', '150 ml', 'bottle', [0.05, 0.18, 0.05], ['#1F2B3A', '#3FB6A8'], 'spray'],
  ],
  // Croma: boxed stock around the demo units
  audio: [
    ['Neckband earphones', 'Sonique', 'Bluetooth 5.3', 'box', [0.1, 0.16, 0.05], ['#1E1E22', '#3FB6A8'], 'bolt'],
    ['Over-ear headphones', 'Sonique', 'Wireless', 'box', [0.2, 0.24, 0.09], ['#F4F4F2', '#E5484D'], 'bolt'],
    ['Earbuds, ANC', 'Pulse Audio', '36 h', 'box', [0.09, 0.11, 0.05], ['#3B5BDB', '#FFFFFF'], 'bolt'],
    ['Party speaker', 'Sonique', '40 W', 'box', [0.18, 0.28, 0.16], ['#1E1E22', '#F28C1E'], 'bolt'],
    ['Portable speaker', 'Pulse Audio', '10 W', 'speaker', [0.085, 0.18, 0.085], ['#C9372C', '#1E1E22']],
    ['Portable speaker', 'Pulse Audio', '10 W', 'speaker', [0.085, 0.18, 0.085], ['#2E7D4A', '#1E1E22']],
    ['Wired earphones', 'Croma', '3.5 mm', 'box', [0.08, 0.13, 0.03], ['#E7E7EA', '#163533'], 'bolt'],
  ],
  computing: [
    ['USB-C hub', 'Croma', '7-in-1', 'box', [0.12, 0.16, 0.04], ['#E7E7EA', '#163533'], 'bolt'],
    ['Webcam', 'Nimbus', '1080p', 'box', [0.12, 0.14, 0.08], ['#1E1E22', '#3B5BDB'], 'bolt'],
    ['Pen drive', 'Croma', '128 GB', 'box', [0.07, 0.12, 0.02], ['#E5484D', '#FFFFFF'], 'bolt'],
    ['Portable SSD', 'Nimbus', '1 TB', 'box', [0.1, 0.15, 0.04], ['#1F2B3A', '#3FB6A8'], 'bolt'],
    ['Laptop bag', 'Croma', '15.6 in', 'box', [0.3, 0.24, 0.06], ['#2B2D33', '#7665B5'], 'bolt'],
    ['Wireless mouse', 'Nimbus', 'Silent', 'mouse', [0.065, 0.04, 0.11], ['#E9E9EC', '#3B5BDB']],
    ['Wireless mouse', 'Nimbus', 'Silent', 'mouse', [0.065, 0.04, 0.11], ['#C9372C', '#2B2D33']],
  ],
  phones: [
    ['Nimbus 5G', 'Nimbus', '128 GB', 'box', [0.09, 0.17, 0.05], ['#1E1E22', '#7665B5'], 'bolt'],
    ['Nimbus 5G', 'Nimbus', '256 GB', 'box', [0.09, 0.17, 0.05], ['#F4F4F2', '#3B5BDB'], 'bolt'],
    ['Fast charger', 'Croma', '33 W', 'box', [0.07, 0.11, 0.04], ['#E7E7EA', '#E5484D'], 'bolt'],
    ['USB-C cable', 'Croma', '1.5 m', 'box', [0.08, 0.14, 0.02], ['#E7E7EA', '#163533'], 'bolt'],
    ['Phone case', 'Croma', 'Clear', 'box', [0.09, 0.18, 0.02], ['#3FB6A8', '#FFFFFF'], 'bolt'],
    ['Smart band', 'Nimbus', 'AMOLED', 'watch', [0.045, 0.06, 0.05], ['#C9372C', '#1E1E22']],
    ['Smartwatch', 'Nimbus', '1.4 in', 'watch', [0.045, 0.06, 0.05], ['#E8E1F0', '#7665B5']],
  ],
  tv: [
    ['Soundbar', 'Sonique', '120 W', 'box', [0.62, 0.09, 0.09], ['#1E1E22', '#3B5BDB'], 'bolt'],
    ['Streaming stick', 'Nimbus', '4K', 'box', [0.12, 0.16, 0.05], ['#1E1E22', '#E5484D'], 'bolt'],
    ['Wall mount', 'Croma', '32 to 65 in', 'box', [0.26, 0.2, 0.06], ['#E7E7EA', '#163533'], 'bolt'],
  ],
  // Zudio Kids
  kidswear: [
    ['Rocket tee', 'Zudio', '4–5 years', 'tshirt', [0.36, 0.38, 0.02], ['#F2C84B', '#2F4A7A'], 'star'],
    ['Heart tee', 'Zudio', '5–6 years', 'tshirt', [0.36, 0.38, 0.02], ['#F4A7A0', '#C9372C'], 'heart'],
    ['Dino tee', 'Zudio', '3–4 years', 'tshirt', [0.36, 0.38, 0.02], ['#B7DDB0', '#2E7D4F'], 'dino'],
    ['Stripe tee', 'Zudio', '6–7 years', 'tshirt', [0.36, 0.38, 0.02], ['#F7F2E6', '#C9372C'], 'stripes'],
    ['Plain tee', 'Zudio', '4–5 years', 'tshirt', [0.36, 0.38, 0.02], ['#7FA9D9', '#FFFFFF'], 'plain'],
    ['Fleece hoodie', 'Zudio', '6–7 years', 'hoodie', [0.42, 0.42, 0.03], ['#7A5B8C', '#F2C84B'], 'star'],
    ['Floral dress', 'Zudio', '5–6 years', 'dress', [0.36, 0.52, 0.02], ['#C9E3F2', '#E8604C'], 'heart'],
  ],
  kidsbasics: [
    ['Shorts', 'Zudio', '4–5 years', 'folded', [0.22, 0.05, 0.18], ['#C9372C', '#FFFFFF'], 'plain'],
    ['Joggers', 'Zudio', '5–6 years', 'folded', [0.22, 0.05, 0.18], ['#6B7A3A', '#F2C84B'], 'plain'],
    ['Pyjama set', 'Zudio', '3–4 years', 'folded', [0.24, 0.06, 0.2], ['#C9E3F2', '#2F4A7A'], 'stripes'],
    ['Vests, 3 pack', 'Zudio', '4–5 years', 'folded', [0.2, 0.05, 0.16], ['#FFFFFF', '#7FA9D9'], 'plain'],
    ['Socks, 3 pairs', 'Zudio', '2–3 years', 'box', [0.12, 0.18, 0.04], ['#F2C84B', '#2E7D4F'], 'sock'],
    ['Socks, 5 pairs', 'Zudio', '5–7 years', 'box', [0.12, 0.18, 0.04], ['#7FA9D9', '#C9372C'], 'sock'],
  ],
  kidsshoes: [
    ['Canvas shoes', 'Zudio', 'UK 10', 'shoes', [0.16, 0.08, 0.17], ['#C9372C', '#FFFFFF']],
    ['Light-up sneakers', 'Zudio', 'UK 12', 'shoes', [0.16, 0.08, 0.17], ['#2F4A7A', '#F2C84B']],
    ['Running shoes', 'Zudio', 'UK 13', 'shoes', [0.16, 0.08, 0.17], ['#E8E1F0', '#7A5B8C']],
    ['Clogs', 'Zudio', 'UK 11', 'shoes', [0.16, 0.07, 0.17], ['#3FB6A8', '#FFFFFF']],
    ['School shoes', 'Zudio', 'UK 12', 'shoes', [0.16, 0.08, 0.17], ['#1E1E22', '#5A3A2A']],
    ['Flip-flops', 'Zudio', 'UK 11', 'shoes', [0.16, 0.05, 0.17], ['#F4A7A0', '#2E7D4F']],
  ],
  kidsacc: [
    ['Bucket hat', 'Zudio', 'Adjustable', 'cap', [0.17, 0.09, 0.22], ['#F2C84B', '#2F4A7A']],
    ['Sports cap', 'Zudio', 'Adjustable', 'cap', [0.17, 0.09, 0.22], ['#2F4A7A', '#FFFFFF']],
    ['Cap', 'Zudio', 'Adjustable', 'cap', [0.17, 0.09, 0.22], ['#3FB6A8', '#F4F1E6']],
    ['Backpack', 'Zudio', '12 L', 'backpack', [0.28, 0.36, 0.13], ['#C9372C', '#F2C84B'], 'heart'],
    ['Backpack', 'Zudio', '12 L', 'backpack', [0.28, 0.36, 0.13], ['#7A5B8C', '#7FA9D9'], 'star'],
  ],
  // Westside Home
  kitchen: [
    ['Speckled mug', 'Westside Home', '300 ml', 'mug', [0.085, 0.1, 0.085], ['#C27A4A', '#F4F1EA']],
    ['Mug, indigo', 'Westside Home', '350 ml', 'mug', [0.085, 0.1, 0.085], ['#2F4A7A', '#F4F1EA']],
    ['Mug, mustard', 'Westside Home', '350 ml', 'mug', [0.085, 0.1, 0.085], ['#D9A23A', '#F4F1EA']],
    ['Side plates', 'Westside Home', '20 cm', 'plates', [0.21, 0.07, 0.21], ['#E8DCC6', '#7C9877']],
    ['Casserole', 'Westside Home', '1.5 L', 'pot', [0.18, 0.12, 0.18], ['#C9372C', '#2A2A2C']],
    ['Spice jars', 'Westside Home', '250 ml', 'jar', [0.08, 0.12, 0.08], ['#E8F1F2', '#2A2A2C'], 'plain'],
  ],
  cleaning: [
    ['Glass cleaner', 'Westside Home', '500 ml', 'bottle', [0.07, 0.24, 0.07], ['#DCEBF7', '#1F5FA8'], 'spray'],
    ['Dishwash gel', 'Westside Home', '750 ml', 'bottle', [0.075, 0.22, 0.075], ['#E9F2C8', '#5E9431'], 'drop'],
    ['Floor cleaner', 'Westside Home', '1 L', 'bottle', [0.085, 0.26, 0.085], ['#E8E1F0', '#7A5B8C'], 'spray'],
    ['Laundry liquid', 'Westside Home', '1 L', 'bottle', [0.09, 0.25, 0.09], ['#C9E3F2', '#2F4A7A'], 'drop'],
    ['Scrub pads', 'Westside Home', '3 pcs', 'box', [0.12, 0.16, 0.04], ['#F2C84B', '#2E7D4F'], 'plain'],
    ['Refill pack', 'Westside Home', '1 L', 'pillow', [0.15, 0.24, 0.06], ['#E3F1EA', '#3E8A6E'], 'spray'],
  ],
  bedding: [
    ['Bedsheet, indigo', 'Westside Home', 'Double', 'folded', [0.32, 0.08, 0.26], ['#2F4A7A', '#E9E3D8'], 'floral'],
    ['Bedsheet, ochre', 'Westside Home', 'Queen', 'folded', [0.32, 0.08, 0.26], ['#D9A23A', '#F4F1EA'], 'checks'],
    ['Hand towels', 'Westside Home', '40 × 60 cm', 'folded', [0.26, 0.08, 0.2], ['#F4A7A0', '#FFFFFF'], 'stripes'],
    ['Bath towel', 'Westside Home', '70 × 140 cm', 'folded', [0.3, 0.1, 0.22], ['#7C9877', '#FFFFFF'], 'plain'],
    ['Cushion cover', 'Westside Home', '40 × 40 cm', 'cushion', [0.4, 0.4, 0.13], ['#2F4A7A', '#E9E3D8'], 'floral'],
    ['Cushion cover', 'Westside Home', '40 × 40 cm', 'cushion', [0.4, 0.4, 0.13], ['#7C9877', '#F4F1EA'], 'stripes'],
  ],
  decor: [
    ['Bud vase', 'Westside Home', '18 cm', 'vase', [0.12, 0.2, 0.12], ['#2F4A7A', '#20345A']],
    ['Vase, sage', 'Westside Home', '24 cm', 'vase', [0.14, 0.24, 0.14], ['#7C9877', '#5E7A5A']],
    ['Vase, ivory', 'Westside Home', '30 cm', 'vase', [0.16, 0.3, 0.16], ['#F1ECE3', '#D9C5A5']],
    ['Scented candle', 'Westside Home', '200 g', 'jar', [0.09, 0.1, 0.09], ['#F4E8F0', '#B33A68'], 'rose'],
    ['Scented candle', 'Westside Home', '200 g', 'jar', [0.09, 0.1, 0.09], ['#F2E2B8', '#C9782A'], 'sun'],
    ['Table lamp', 'Westside Home', '35 cm', 'lamp', [0.22, 0.36, 0.22], ['#2F4A7A', '#E9E3D8']],
  ],
}

/** Which store a section belongs to (decides the label style) and how its shelf prices scale. */
const STORE: [string, number, SectionId[]][] = [
  ['palette', 4, ['skincare', 'haircare', 'makeup', 'fragrance']],
  ['croma', 15, ['audio', 'computing', 'phones', 'tv']],
  ['zudio', 5, ['kidswear', 'kidsbasics', 'kidsshoes', 'kidsacc']],
  ['westside-home', 7, ['kitchen', 'cleaning', 'bedding', 'decor']],
]
const storeOf = (section: SectionId): [string, number] => {
  const hit = STORE.find(([, , list]) => list.includes(section))
  return hit ? [hit[0], hit[1]] : ['bigbasket', 1]
}

const PRICES = [20, 30, 45, 60, 85, 99, 120, 149, 175, 210]
const cache = new Map<string, Product[]>()

/** Background stock for a section, or none for sections that don't use it (produce, bakery). */
export function fillerFor(section: SectionId): Product[] {
  const hit = cache.get(section)
  if (hit) return hit
  const [storeId, k] = storeOf(section)
  const out = (SPECS[section] ?? []).map(([name, brand, size, shape, dims, colors, art], i): Product => ({
    id: `fx-${section}-${i}`, storeId, section, name, brand, size, desc: '', shape, dims, colors, art,
    // shelf-tag prices only; this stock can't be bought
    price: k === 1
      ? PRICES[(i * 7 + section.length) % PRICES.length] * (dims[1] > 0.4 ? 6 : 1)
      : Math.round((PRICES[(i * 7 + section.length) % PRICES.length] * k) / 10) * 10 - 1,
  }))
  cache.set(section, out)
  return out
}
