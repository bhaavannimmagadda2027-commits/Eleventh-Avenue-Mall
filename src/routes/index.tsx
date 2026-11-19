import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgePercent,
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  calculateCartCount,
  calculateCartTotal,
  categories,
  getCategory,
  getProductsForCategory,
  products,
  type MallProduct,
} from "@/lib/mall-data";

type Panel = "cart" | "directory" | "friends" | "rewards" | "checkout" | null;

export const Route = createFileRoute("/")({
  component: MallExperience,
  head: () => ({
    meta: [
      { title: "Eleventh Avenue Mall — A brighter way to browse" },
      {
        name: "description",
        content:
          "Step inside Eleventh Avenue, a sunlit virtual shopping mall with independent stores, thoughtful finds, and one shared cart.",
      },
      { property: "og:title", content: "Eleventh Avenue Mall — A brighter way to browse" },
      {
        property: "og:description",
        content:
          "Explore a beautiful virtual mall, discover independent stores, and bring all your finds together in one cart.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function MallExperience() {
  const [activeCategory, setActiveCategory] = useState("grocery");
  const [selectedProduct, setSelectedProduct] = useState<MallProduct | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [panel, setPanel] = useState<Panel>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");

  const category = getCategory(activeCategory);
  const categoryProducts = getProductsForCategory(activeCategory);
  const cartLines = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
  const total = calculateCartTotal(cartLines);
  const itemCount = calculateCartCount(cartLines);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return products.filter((product) =>
      [product.name, product.brand, product.category].some((value) => value.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  function addToCart(product: MallProduct) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    setNotice(`${product.name} added to NEU CART`);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function changeQuantity(productId: string, difference: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] ?? 0) + difference;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: nextQuantity };
    });
  }

  function visitProduct(product: MallProduct) {
    setActiveCategory(product.category);
    setSelectedProduct(product);
    setSearchOpen(false);
    setPanel(null);
  }

  return (
    <main className={`mall-shell ${category.environment}`}>
      <div className="mall-backdrop" aria-hidden="true" />
      <div className="mall-sunwash" aria-hidden="true" />

      <header className="topbar">
        <a className="brand-lockup" href="#welcome" onClick={() => setSelectedProduct(null)} aria-label="Eleventh Avenue Mall home">
          <span className="brand-mark" aria-hidden="true">11</span>
          <span className="brand-copy">
            <span className="brand-name">ELEVENTH AVENUE</span>
            <span className="brand-kicker">A MALL FOR THE CURIOUS</span>
          </span>
        </a>

        <div className="topbar-links">
          <Button className="nav-link" variant="ghost" onClick={() => setPanel("directory")}>
            <MapPin aria-hidden="true" /> <span>Explore</span>
          </Button>
          <Button className="nav-link" variant="ghost" onClick={() => setPanel("friends")}>
            <Users aria-hidden="true" /> <span>Shop together</span>
          </Button>
          <Button className="nav-link" variant="ghost" onClick={() => setPanel("rewards")}>
            <Sparkles aria-hidden="true" /> <span>Rewards</span>
          </Button>
        </div>

        <div className="topbar-actions">
          <Button
            className={`icon-button search-trigger${searchOpen ? " is-active" : ""}`}
            variant="ghost"
            size="icon"
            aria-label={searchOpen ? "Close search" : "Search stores and products"}
            onClick={() => setSearchOpen((open) => !open)}
          >
            {searchOpen ? <X /> : <Search />}
          </Button>
          <Button className="profile-button" variant="ghost" aria-label="Your profile" onClick={() => setPanel("rewards")}>
            <span className="profile-avatar">A</span>
          </Button>
        </div>
      </header>

      {searchOpen && (
        <section className="search-popover" aria-label="Mall search">
          <label className="search-field">
            <Search aria-hidden="true" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Find a store, brand or something lovely…"
              aria-label="Search stores, brands, and products"
            />
            <span className="search-shortcut">ESC</span>
          </label>
          {searchQuery.trim() ? (
            <div className="search-results">
              {searchResults.length ? searchResults.map((product) => (
                <button className="search-result" key={product.id} onClick={() => visitProduct(product)}>
                  <img src={product.image} alt="" />
                  <span><strong>{product.name}</strong><small>{product.brand} · {money.format(product.price)}</small></span>
                  <ChevronRight aria-hidden="true" />
                </button>
              )) : <p className="empty-search">No finds just yet. Try a category or store name.</p>}
            </div>
          ) : (
            <div className="search-suggestions"><span>POPULAR IN THE MALL</span>{categories.slice(0, 4).map((item) => <button key={item.id} onClick={() => { setActiveCategory(item.id); setSearchOpen(false); }}>{item.name}</button>)}</div>
          )}
        </section>
      )}

      <section className="welcome-line" id="welcome">
        <div className="welcome-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR DAY, WELL SPENT</p>
          <h1>A little more <em>wonder.</em></h1>
          <p className="welcome-subtitle">A brighter kind of shopping, under one beautiful roof.</p>
        </div>
        <div className="weather-note"><span className="weather-sun" aria-hidden="true">☼</span><span><strong>Lovely out there.</strong><small>Even better in here.</small></span></div>
      </section>

      <section className="scene-caption" aria-live="polite">
        <div className="scene-caption-copy">
          <span className="scene-overline"><span className="status-dot" /> OPEN TODAY · 9 AM — 9 PM</span>
          <h2>{category.merchant}</h2>
          <p>{category.description}</p>
        </div>
        <button className="aisle-sign" onClick={() => setPanel("directory")}>
          <span>YOU'RE NEAR</span><strong>{category.aisle}</strong><ChevronDown aria-hidden="true" />
        </button>
      </section>

      <aside className="architectural-panel" aria-label="Mall offer">
        <div className="panel-brandmark">EA<span>.</span></div>
        <span>THE LITTLE THINGS</span>
        <strong>A good day<br />starts somewhere.</strong>
        <button onClick={() => { setActiveCategory("home"); setSelectedProduct(products.find((item) => item.id === "linen-throw") ?? null); }}>
          Find your Sunday <ArrowRight aria-hidden="true" />
        </button>
      </aside>

      <div className="landmark-marker" aria-hidden="true"><span /> ATRIUM · LEVEL 01</div>

      {selectedProduct && (
        <section className="product-preview" aria-label={`${selectedProduct.name} product details`}>
          <button className="product-close icon-button" aria-label="Close product details" onClick={() => setSelectedProduct(null)}><X /></button>
          <img className="preview-image" src={selectedProduct.image} alt={selectedProduct.name} />
          <div className="preview-content">
            <p className="preview-brand">{selectedProduct.brand}</p>
            <h3>{selectedProduct.name}</h3>
            <span className="rating-line"><Star fill="currentColor" aria-hidden="true" /> {selectedProduct.rating} <span>·</span> A mall favorite</span>
            <p className="preview-description">{selectedProduct.description}</p>
            <div className="preview-buy-row"><strong>{money.format(selectedProduct.price)}</strong><Button className="add-button" onClick={() => addToCart(selectedProduct)}><Plus aria-hidden="true" /> Add to NEU CART</Button></div>
          </div>
        </section>
      )}

      <section className="discovery-shelf" aria-label={`${category.name} featured finds`}>
        <div className="shelf-heading">
          <div><span className="shelf-kicker">A FEW THINGS WE LOVE</span><h2>Finds from {category.merchant}</h2></div>
          <button className="text-link" onClick={() => setPanel("directory")}>All stores <ArrowRight aria-hidden="true" /></button>
        </div>
        <div className="product-strip">
          {categoryProducts.map((product) => (
            <button
              className={`find-card find-${product.accent}`}
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              aria-label={`View ${product.name}, ${money.format(product.price)}`}
            >
              <span className="find-image-wrap"><img src={product.image} alt="" /><span className="find-heart"><Heart aria-hidden="true" /></span></span>
              <span className="find-details"><span><strong>{product.name}</strong><small>{product.brand}</small></span><b>{money.format(product.price)}</b></span>
            </button>
          ))}
        </div>
      </section>

      <nav className="category-dock" aria-label="Browse mall stores">
        <div className="dock-label">FIND YOUR <strong>PLACE</strong></div>
        <div className="category-list">
          {categories.map((item, index) => (
            <button className={`category-tab${activeCategory === item.id ? " selected" : ""}`} key={item.id} onClick={() => { setActiveCategory(item.id); setSelectedProduct(null); }} aria-current={activeCategory === item.id ? "page" : undefined}>
              <span className={`category-symbol symbol-${item.id}`} aria-hidden="true">{["✳", "✧", "◈", "◌", "✿", "⌂"][index]}</span>
              <span>{item.name}</span>
            </button>
          ))}
          <button className="category-tab directory-tab" onClick={() => setPanel("directory")}><span className="category-symbol"><Plus aria-hidden="true" /></span><span>All stores</span></button>
        </div>
        <span className="dock-divider" aria-hidden="true" />
        <div className="mini-joystick" aria-label="Mall navigation">
          <button aria-label="Move forward" onClick={() => setNotice("You’re already in the heart of the mall.")}><ArrowUp /></button>
          <div><button aria-label="Explore to your left" onClick={() => changeCategory(-1)}><ArrowLeft /></button><span aria-hidden="true" /><button aria-label="Explore to your right" onClick={() => changeCategory(1)}><ArrowRight /></button></div>
          <button aria-label="Move back" onClick={() => setNotice("The atrium is right behind you.")}><ArrowDown /></button>
        </div>
      </nav>

      <div className={`neu-cart${notice ? " cart-confirmed" : ""}`}>
        <button className="cart-summary" onClick={() => setPanel("cart")} aria-label={`Open NEU CART, ${itemCount} items, ${money.format(total)}`}>
          <span className="cart-vehicle" aria-hidden="true"><span className="vehicle-canopy" /><span className="vehicle-body"><ShoppingCart /></span><span className="vehicle-wheel wheel-one" /><span className="vehicle-wheel wheel-two" /></span>
          <span className="cart-copy"><span className="cart-name">NEU CART <span className="cart-count">{itemCount}</span></span><strong>{money.format(total)}</strong></span>
          <span className="cart-open" aria-hidden="true"><ArrowRight /></span>
        </button>
        <span className="cart-tooltip" role="status">{notice || (itemCount ? "Your finds, all together" : "Your cart is waiting")}</span>
      </div>

      <div className="scene-bottom-note"><span className="scene-pin"><MapPin aria-hidden="true" /></span><span>ELEVENTH AVENUE <i>·</i> LEVEL ONE</span><span className="note-center-dot" />{category.name.toUpperCase()}</div>

      {panel && (
        <div className="panel-backdrop" onClick={() => setPanel(null)}>
          <section className={`side-panel${panel === "checkout" ? " checkout-panel" : ""}`} role="dialog" aria-modal="true" aria-label={getPanelTitle(panel)} onClick={(event) => event.stopPropagation()}>
            <div className="side-panel-header"><div><span className="panel-overline">ELEVENTH AVENUE</span><h2>{getPanelTitle(panel)}</h2></div><Button className="icon-button" variant="ghost" size="icon" aria-label="Close panel" onClick={() => setPanel(null)}><X /></Button></div>
            {panel === "cart" && <CartContents cart={cart} onQuantity={changeQuantity} onCheckout={() => setPanel("checkout")} onShop={() => { setPanel(null); setActiveCategory("grocery"); }} />}
            {panel === "checkout" && <CheckoutContents total={total} itemCount={itemCount} onBack={() => setPanel("cart")} onComplete={() => { setPanel(null); setCart({}); setNotice("Your visit is in the bag. Thank you!"); window.setTimeout(() => setNotice(""), 3000); }} />}
            {panel === "directory" && <DirectoryContents activeCategory={activeCategory} onVisit={(id) => { setActiveCategory(id); setSelectedProduct(null); setPanel(null); }} />}
            {panel === "friends" && <FriendsContents />}
            {panel === "rewards" && <RewardsContents />}
          </section>
        </div>
      )}
    </main>

  );

  function changeCategory(direction: number) {
    const currentIndex = categories.findIndex((item) => item.id === activeCategory);
    const nextIndex = (currentIndex + direction + categories.length) % categories.length;
    setActiveCategory(categories[nextIndex].id);
    setSelectedProduct(null);
  }
}

function getPanelTitle(panel: Exclude<Panel, null>) {
  return { cart: "Your NEU CART", directory: "The mall directory", friends: "Good company", rewards: "A little something back", checkout: "A lovely choice" }[panel];
}

function CartContents({ cart, onQuantity, onCheckout, onShop }: { cart: Record<string, number>; onQuantity: (id: string, amount: number) => void; onCheckout: () => void; onShop: () => void }) {
  const lines = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const total = calculateCartTotal(lines.map(([productId, quantity]) => ({ productId, quantity })));
  const merchants = [...new Set(lines.map(([id]) => products.find((product) => product.id === id)?.brand).filter((brand): brand is string => Boolean(brand)))];

  if (!lines.length) return <div className="empty-cart"><span className="empty-cart-icon"><ShoppingBag aria-hidden="true" /></span><h3>A little room for a lovely find.</h3><p>Pick up something special from any store. It all comes together right here.</p><Button className="add-button" onClick={onShop}>Explore the mall <ArrowRight aria-hidden="true" /></Button></div>;

  return <div className="cart-content"><div className="cart-merchant-note"><span className="merchant-dots"><i /><i /><i /></span><span>Collected from <strong>{merchants.length} {merchants.length === 1 ? "store" : "stores"}</strong>, all in one place.</span></div><div className="cart-lines">{lines.map(([id, quantity]) => { const product = products.find((item) => item.id === id); if (!product) return null; return <article className="cart-line" key={id}><img src={product.image} alt="" /><div className="cart-line-details"><span>{product.brand}</span><h3>{product.name}</h3><strong>{money.format(product.price * quantity)}</strong><div className="quantity-control"><Button size="icon" variant="ghost" aria-label={`Remove one ${product.name}`} onClick={() => onQuantity(id, -1)}><Minus /></Button><span>{quantity}</span><Button size="icon" variant="ghost" aria-label={`Add one ${product.name}`} onClick={() => onQuantity(id, 1)}><Plus /></Button></div></div><Button className="remove-line" variant="ghost" size="icon" aria-label={`Remove ${product.name} from cart`} onClick={() => onQuantity(id, -quantity)}><X /></Button></article>; })}</div><div className="cart-totals"><div><span>Items</span><span>{lines.reduce((count, [, quantity]) => count + quantity, 0)}</span></div><div><span>Delivery</span><span className="delivery-free">Thoughtfully arranged at checkout</span></div><div className="total-row"><strong>Cart total</strong><strong>{money.format(total)}</strong></div><Button className="checkout-button" onClick={onCheckout}>Continue to checkout <ArrowRight aria-hidden="true" /></Button><small>One happy cart. Many lovely stores.</small></div></div>;
}

function DirectoryContents({ activeCategory, onVisit }: { activeCategory: string; onVisit: (id: string) => void }) {
  return <div className="directory-content"><p className="panel-intro">Six lovely neighborhoods. Plenty of reasons to stay a little longer.</p>{categories.map((item, index) => <button className={`directory-entry${activeCategory === item.id ? " directory-active" : ""}`} key={item.id} onClick={() => onVisit(item.id)}><span className={`directory-thumb thumb-${item.id}`}><img src={item.image} alt="" /><span>{String(index + 1).padStart(2, "0")}</span></span><span className="directory-copy"><span>{item.aisle}</span><strong>{item.merchant}</strong><small>{item.description}</small></span><ChevronRight aria-hidden="true" /></button>)}</div>;
}

function FriendsContents() {
  const [invited, setInvited] = useState(false);
  return <div className="friends-content"><p className="panel-intro">Shopping is sweeter when you wander together.</p><div className="friends-presence"><span className="friend-avatar friend-one">J</span><span className="friend-avatar friend-two">M</span><span className="friend-avatar friend-three">S</span><span className="online-dot" /><span>3 friends are around today</span></div><div className="friend-session"><span className="session-label"><span className="status-dot" /> LIVE IN THE MALL</span><h3>{invited ? "Your invitation is on its way." : "Meet you by the atrium?"}</h3><p>{invited ? "Your friends can join you for a little browse and build a shared cart." : "Start a shared shopping stroll and compare your favorite finds together."}</p><Button className="add-button" onClick={() => setInvited(true)}>{invited ? <><Check aria-hidden="true" /> Invitation sent</> : <><Users aria-hidden="true" /> Invite a friend</>}</Button></div><div className="reaction-note"><span>Today's mall mood</span><div><span>♡</span><span>It's a lovely day for a wander.</span><b>12</b></div></div></div>;
}

function RewardsContents() {
  return <div className="rewards-content"><p className="panel-intro">A small thank-you for making the mall part of your day.</p><div className="rewards-card"><span>YOUR AVENUE POINTS</span><strong>1,240 <i>pts</i></strong><div><span>760 more points</span><span>for your next little treat</span></div><div className="points-track"><span /></div></div><h3 className="reward-section-title">Little thank-yous</h3><article className="reward-item"><span className="reward-icon"><Sparkles aria-hidden="true" /></span><span><strong>A coffee on us</strong><small>Redeem at The Daily Pour</small></span><b>800 pts</b></article><article className="reward-item"><span className="reward-icon"><BadgePercent aria-hidden="true" /></span><span><strong>A little extra</strong><small>10% off a store of your choice</small></span><b>1,500 pts</b></article><div className="reward-footnote"><Check aria-hidden="true" /> Your points grow with every mall find.</div></div>;
}

function CheckoutContents({ total, itemCount, onBack, onComplete }: { total: number; itemCount: number; onBack: () => void; onComplete: () => void }) {
  return <div className="checkout-content"><span className="checkout-checkmark"><Check aria-hidden="true" /></span><span className="checkout-caption">ONE CART, ALL YOUR FINDS</span><h3>All the good things, together.</h3><p>Your items from across the mall are ready to come with you.</p><div className="checkout-summary"><span>{itemCount} {itemCount === 1 ? "item" : "items"} · delivery arranged by each store</span><strong>{money.format(total)}</strong></div><Button className="checkout-button" onClick={onComplete}>Place a pretend order <ArrowRight aria-hidden="true" /></Button><p className="checkout-disclaimer">A demo checkout — no payment will be taken.</p><Button className="back-button" variant="ghost" onClick={onBack}><ArrowLeft aria-hidden="true" /> Back to your cart</Button></div>;
}
