export type MallCategory = {
  id: string;
  name: string;
  aisle: string;
  merchant: string;
  image: string;
  environment: string;
  description: string;
};

export type MallProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  description: string;
  image: string;
  accent: string;
};

export const categories: MallCategory[] = [
  {
    id: "grocery",
    name: "Grocery",
    aisle: "FRESH MARKET",
    merchant: "Market & Vine",
    image: "/mall-products/fresh-produce.jpg",
    environment: "fresh-market",
    description: "Good things, gathered fresh.",
  },
  {
    id: "beauty",
    name: "Beauty",
    aisle: "SKINCARE & SCENTS",
    merchant: "Maison Beaute",
    image: "/mall-products/beauty.jpg",
    environment: "beauty-house",
    description: "A little time for yourself.",
  },
  {
    id: "electronics",
    name: "Electronics",
    aisle: "PERSONAL TECHNOLOGY",
    merchant: "Form & Function",
    image: "/mall-products/electronics.jpg",
    environment: "device-studio",
    description: "Considered design. Everyday brilliance.",
  },
  {
    id: "fashion",
    name: "Fashion",
    aisle: "THE NEW SEASON",
    merchant: "Atelier Eleven",
    image: "/mall-products/fashion.jpg",
    environment: "fashion-house",
    description: "Find a new favorite.",
  },
  {
    id: "kids",
    name: "Kids",
    aisle: "LITTLE DISCOVERIES",
    merchant: "Little Assembly",
    image: "/mall-products/kids.jpg",
    environment: "little-assembly",
    description: "Thoughtful things for growing minds.",
  },
  {
    id: "home",
    name: "Home",
    aisle: "LIVING & OBJECTS",
    merchant: "Sunday House",
    image: "/mall-products/home.jpg",
    environment: "sunday-house",
    description: "Make space for the good things.",
  },
];

export const products: MallProduct[] = [
  {
    id: "market-basket",
    name: "The Market Basket",
    brand: "Market & Vine",
    category: "grocery",
    price: 18,
    rating: 4.9,
    description: "A colorful selection of today's freshest seasonal produce.",
    image: "/mall-products/fresh-produce.jpg",
    accent: "produce",
  },
  {
    id: "daily-ritual",
    name: "Daily Ritual Cleanser",
    brand: "Maison Beaute",
    category: "beauty",
    price: 32,
    rating: 4.8,
    description: "A gentle, everyday facial cleanser with a soft botanical finish.",
    image: "/mall-products/beauty.jpg",
    accent: "beauty",
  },
  {
    id: "studio-headphones",
    name: "Studio Wireless",
    brand: "Form & Function",
    category: "electronics",
    price: 149,
    rating: 4.9,
    description: "Immersive sound, thoughtful design, and all-day comfort.",
    image: "/mall-products/electronics.jpg",
    accent: "electronics",
  },
  {
    id: "weekend-shirt",
    name: "The Weekend Shirt",
    brand: "Atelier Eleven",
    category: "fashion",
    price: 68,
    rating: 4.7,
    description: "An easy, beautifully made layer for days out and about.",
    image: "/mall-products/fashion.jpg",
    accent: "fashion",
  },
  {
    id: "little-explorer",
    name: "Little Explorer Set",
    brand: "Little Assembly",
    category: "kids",
    price: 26,
    rating: 4.9,
    description: "A sweet, hands-on activity kit for little adventures.",
    image: "/mall-products/kids.jpg",
    accent: "kids",
  },
  {
    id: "linen-throw",
    name: "Washed Linen Throw",
    brand: "Sunday House",
    category: "home",
    price: 84,
    rating: 4.8,
    description: "Relaxed, breathable linen in a lovely soft natural weave.",
    image: "/mall-products/home.jpg",
    accent: "home",
  },
  {
    id: "market-loaf",
    name: "Slow Morning Sourdough",
    brand: "Market & Vine",
    category: "grocery",
    price: 8,
    rating: 4.8,
    description: "A golden, slow-fermented country loaf from the neighborhood oven.",
    image: "/mall-products/dining.jpg",
    accent: "bakery",
  },
];

export function getProductsForCategory(categoryId: string) {
  return products.filter((product) => product.category === categoryId);
}

export function getCategory(categoryId: string) {
  return categories.find((category) => category.id === categoryId) ?? categories[0];
}

export type CartLine = { productId: string; quantity: number };

export function calculateCartTotal(lines: CartLine[]) {
  return lines.reduce((total, line) => {
    const product = products.find((item) => item.id === line.productId);
    return total + (product ? product.price * line.quantity : 0);
  }, 0);
}

export function calculateCartCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}