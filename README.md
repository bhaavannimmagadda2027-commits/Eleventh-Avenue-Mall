# Virtual Retail OS

A shopping mall you explore on your phone. The mall is the interface; NEU CART is your vehicle.

Frontend prototype only: no backend, payments, accounts or real inventory. All data is local mock data.

> **Brand names.** This build uses real brand names (Tata Mall, BigBasket, Croma, Westside, Titan and others) as plain-text signage for an internal demo. Keep it local; do not publish it as a public link. Store names live in `src/data/stores.ts` and `src/data/malls.ts`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Drive with the on-screen joystick, or the arrow keys / W A S D. Drag the scene to look around.

## Where things are

| Folder | What it holds |
| --- | --- |
| `src/index.css`, `src/styles/tokens.ts` | Design tokens: Daylight Luxury Retail palette, type scale, glass surface |
| `src/components/ui` | GlassPanel, Button, IconButton, Badge, BrandMark, FloatingCard, Sheet |
| `src/components/mall` | The 3D lobby: architecture, storefronts, directory sign, fountain, escalators, greenery, ads, lighting |
| `src/components/cart` | NEU CART model, movement rig (momentum, collisions, auto-drive), joystick |
| `src/components/navigation` | Top bar, bottom controls, category selector |
| `src/components/panels` | Directory, search, wallet, mall switcher, cart, ad and store sheets |
| `src/components/store` | Store engine: one hall per walk-in store, built from the layouts in `src/data/storeLayout.ts` |
| `src/components/products` | Product preview card, quantity control |
| `src/lib/productArt.ts` | Product packaging: 3D shapes, printed labels, shelf tags, thumbnails |
| `src/components/rewards` | NeuCoins wallet and the coin animation |
| `src/data` | Rewards and redemption offers (`rewards.ts`), malls, stores, categories, products, store layout, advertisements, world layout |
| `src/state/useMall.ts` | App state (Zustand) |

## Build progress

- [x] Sprint 1: design foundation
- [x] Sprint 2: mall lobby (and NEU CART carried over so the lobby is drivable)
- [x] Sprint 3: NEU CART: products fly into the basket and stay there, cart hop on landing, console shows count and total
- [x] Sprint 4: BigBasket grocery store: produce crates, dairy chillers, bakery, shelving, 37 products, preview card with alternatives, product detail with the dark-store tray view, search that drives you to the shelf
- [x] Sprint 5: Tata CLiQ Palette, Croma, Zudio Kids and Westside Home interiors with their own fixtures, 45 more products, and category switching that moves straight between stores with the cart intact
- [x] Sprint 6: universal cart: items grouped by fulfilment with delivery estimates, quantity controls, MRP savings and store offers, per-store delivery fees with a free-delivery nudge, delivery routing, NeuCoins earned and redeemable, one bill (`src/lib/cartMath.ts`)
- [x] Sprint 7: advertising (campaigns tied to products, product renders in creatives, gentle screen rotation, in-store aisle displays, tap counts) and rewards (wallet, tiers, redemption across the group, activity, coin animation)
- [x] Sprint 8: social shopping (friends indicator and panel, presence, wave, simulated shared session where a friend follows you and reacts, private vs family cart, gifting from a friend's list or any product)
- [x] Sprint 9: checkout (one screen: address, per-store deliveries with grocery slots, payment method, NeuCoins, bill; simulated placing and a drawn-check confirmation with coins earned, delivery timeline, gifts; orders in your profile)
- [x] Sprint 10: polish (AA text contrast, keyboard focus and Escape in every sheet and the checkout, global reduced motion, larger touch targets, sheets centred on wide screens, wallet reachable on very narrow phones, dynamic viewport height; product shadows and geometry trimmed so the heaviest store draws about half the triangles, resolution adapts on slow devices, 3D pauses behind checkout; fixed dropped store-to-store moves and empty image sources)

Tray photos in `public/trays/` are cropped from the "Live feed" concept image in the Archives folder.
The earlier single-file prototype is kept in `legacy/` for reference.
