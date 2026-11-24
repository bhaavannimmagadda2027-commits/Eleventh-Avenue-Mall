# **Virtual Retail OS — Complete Mall UI & Experience Specification**

The central idea behind the interface is:

**A shopping mall that behaves like a real physical place, with the convenience of a digital shopping platform.**

We are not building a conventional ecommerce application with a 3D background. We are building an immersive retail environment in which customers enter a mall, explore stores and aisles, discover products, move around using NEU CART, shop with friends and purchase products from multiple businesses through one universal cart.

The visual identity is **Daylight Luxury Retail**: bright, spacious, natural, premium, realistic and inviting.

Below is the complete UI specification, combining the design philosophy, mall architecture, spatial navigation, shopping experience, advertisements, cart, social shopping and supporting screens we have discussed.

# **1. Overall design philosophy**

[Dongguan Songshan Lake MixC | Woods Bagot](https://images.openai.com/static-rsc-4/PccwsWnkTM88dKPehLzrlZpwDyC0Trf3sJSs9vWsgz_sko9zAmKOqP3TQA-cZjIEirUzjA5veqasBzWJYVUtONy8BmAQ8ObzjuDPbVaufsEdVfW1sucmCllnuWC1lXYHQnvlJeYC7E7Q1Lomj-RZECqfQs0BggJAOzWrCNUl7Gg?purpose=inline)

[Morgenstern & Major Ltd | Morgenstern Financial | Global Investment Firm](https://images.openai.com/static-rsc-4/dEv4OaxADTKIU9U4qgp87pCPG10TGMEqNTbLRMZBwGdxo9dHYlC1YvbqEgkhNGjq3O0jiLmzokVJ0fxQh6hIMfk3quQ4u2H0DtOmBpDNAhYdGM4HUxnU6uVbv1lbeEC5VWbW9opejNhaYOc3h_NdpiZ8OCzZxkyYkuORx7q4UXA?purpose=inline)

[Avril - Griffintown | Projets | Aedifica](https://images.openai.com/static-rsc-4/nLS66lX3ooFBvfymRFNqXHBhKpvr0bvCEw-hkl9lm4dsIB-rOP8BPeIM_l0VxtZ0yyzMiWZzbys3lp7UCtUPexEb1YVNdWkQQBYMBygNsYd_Isf_bY88N9KOubuu2mGEU4ANEimk_v0E1FIMJGiiCJTywU99oSOja1Q-JHCILjY?purpose=inline)

15

## **1.1 Daylight Luxury Retail**

The mall should look like a beautiful, contemporary luxury shopping destination during the daytime.

The environment should communicate:

- Premium quality without appearing intimidating.
- Modern architecture without looking futuristic or artificial.
- Natural warmth without becoming rustic.
- Spaciousness without looking empty.
- Technology without making the experience feel like a science-fiction game.

Think of a high-end shopping mall with beautiful architecture, glass ceilings, natural daylight, well-designed retail stores and thoughtfully integrated technology.

The environment should make people want to explore.

## **1.2 Colour system**

| Element             | Colour / material            |
| ------------------- | ---------------------------- |
| Primary environment | Warm white `#FAFAF7`         |
| Secondary surfaces  | Ivory `#F5F2EA`              |
| Flooring            | Pale stone / beige           |
| Shelving            | Pale natural oak             |
| Typography          | Charcoal `#292A29`           |
| Secondary text      | Muted grey                   |
| Brand accent        | Restrained purple `#7764C8`  |
| Cart                | White / brushed silver       |
| Glass               | Transparent, lightly frosted |

Purple is a brand accent, not the dominant colour of the mall.

Use it for:

- Selected navigation states.
- Small highlights.
- Cart indicators.
- Interactive controls.
- Selected buttons and progress indicators.

Do not use purple gradients across the environment.

## **1.3 Lighting and materials**

[Blog | Cityland Mall Photos – A Nature-Inspired Visual Guide | Skyloov Property Portal](https://images.openai.com/static-rsc-4/RIVtuRgo-WJ4jUWeoy46fM2AjmbKu2Y-JJXyuYXRN13MKdgnHvSEHO_89dB1z3QphAdpc0KeLTvnnL_xv9sCmUbpeWlTuKaoBBF250Ps4pMHL4txhLxDUFdLjrwM08j0Q-N9_FdGJpLrj-sbIXgEM_2ouhY9mNiUsIk3oYhcY3U?purpose=inline)

[Land Development | MAAN Group Global](https://images.openai.com/static-rsc-4/VTP2VYnSUSIz4gyimgg08jnspe90d1ffbrxNDew-QJ5d7zez8ZhkAuziRohFfCKbkrgWfSQcgbsDLnP1KCx8xftr7HRNDEA9wdWnFq12sz_BalY0XV6n0VOzCvKreU-xXlrHO2ipNns-79VUHAy7SCHrGG-Nzbqw3sS-EgsDynI?purpose=inline)

[Modern luxury retail store interior | Free Photo  - rawpixel](https://images.openai.com/static-rsc-4/WaQuOyTsRlwgiag-lp_LBVYoNqhydqR_4zu-OrRovor00wRAabUq8Bh2cs45FqFdriqJpEF65b7nf5RnIWv3B81fZNX0tKRbvQs1NwjPIPbB0vITJCxdOMr6W8hhi7kihc7ajZgN0tjnD-Gl4J5pURnIBYRzv2JT3-OIZUWL2Lo?purpose=inline)

16

The mall should have:

- A large glass skylight.
- White or ivory structural beams.
- Warm-white architectural walls.
- Pale stone flooring.
- Natural wood shelving.
- Glass storefronts.
- Brushed metallic details.
- Carefully placed greenery.
- Soft natural shadows.
- Subtle reflections on the floor.

Avoid dark corners, dramatic spotlights, neon lighting, glossy plastic textures and cyberpunk aesthetics.

# **2. The mall's overall structure**

The mall should be a continuous spatial environment rather than a collection of unrelated shopping screens.

Imagine a customer entering a physical mall and moving between different retail zones.

[3D Plan of a mall :: Behance](https://images.openai.com/static-rsc-4/p3mN44Qdsy_No1XEGEIB3nk6X5HT6pExwEsB2W696iT14b_RcID2Y9uySnN6LKtHaJRSslBLBWLQLD1SwQ4Xnhp3y2jMu4CtUntTu8cfoemVqmj4pQ9Xlj8iSk0rIbjtSFrveSJnYZvk_vXzNjMHyTU7sexHqsTjJWz_Ztn_xU4?purpose=inline)

[Trezio - Gamified Treasure Hunts for Venues](https://images.openai.com/static-rsc-4/DScw9cIwFl-0_kL17jnfvgVjIOvb3KvGcBK1DRI4U4zSioX49RjQnGN_27J70Dd1wC_hSh6dEFZRI5UbYejGmkSjTvBWNB0u-I15GPpu6LynIlL8ar8I1EPAGXc08D8hrk58wPJ7nFWQKa7wKwtRx3_YoczVJmb-E-l9sQnRz1s?purpose=inline)

[Experiential Retail in India: Crafting Destinations, Not Just Shops | CBRE India](https://images.openai.com/static-rsc-4/vs6HP1M3xorQIAiBmSZS4bUfIb9ONiWAeNLRY8b-L5M2OEVCOLf1BH0HKfhQnslbQya3LTWVvkMnFAS4DbsH9BJR8c6LyBt1t_GcDpdGSQE_Nz3MLaua5V0arlF3aQjJvDEEMmG5LGBWgr1oubNq_LSNwzsBc0DsTgdDCnTusow?purpose=inline)

13

The mall should have five major spatial areas:

1. **Entrance and Lobby** — the first impression and starting point.
2. **Central Atrium** — the main navigation and discovery area.
3. **Retail Zones** — grocery, beauty, electronics, fashion, kids and home.
4. **Promotional Areas** — brand advertisements and curated discoveries.
5. **Connecting Corridors** — physical-looking paths connecting all the stores.

## **2.1 Spatial layout**

A possible high-level mall structure:

## **MALL ENTRANCE**

Welcome • Mall identity • Directory

## **CENTRAL ATRIUM**

Promotions • Discovery • Featured stores

**GROCERY**

Fresh • Daily essentials

**BEAUTY**

Skincare • Cosmetics

**ELECTRONICS**

Devices • Accessories

**FASHION**

Apparel • Footwear

**KIDS**

Toys • Baby • Clothing

**HOME**

Furniture • Essentials

### **CONNECTING CORRIDORS**

Storefronts • Aisles • Advertisements

Conceptual navigation diagram, not a final architectural floor plan.

The spatial layout should be designed so that customers can:

- Freely explore.
- Move directly to a particular category.
- Search for a product and navigate to it.
- Return to the central atrium.
- Switch between discovery and direct shopping.

The customer should never feel lost.

# **3. The main mall screen**

Most important screen

[Spending spree: How Melbourne's mega shopping centres are luring homebuyers to nearby neighbourhoods](https://images.openai.com/static-rsc-4/Fnmq2a1nVtjbVvJCxkF_F2reyUVuSw_Z4nge3MKaU57M6IaEqRGVAcE7Ag9xwU5HRVW9AeiBgET2Er7CZ-TGW0g7hO-Ga3rInAcgXaRJjVMqvc6u9sJbMeXU7P2PQlQMKUneGQ_duNcH5yv5r5RJ_ZClwlCs9wJD_U6RBlA4oF8?purpose=inline)

[EU Retail Window LED Display: Transparant, Heritage Boetiek | Chipshow EU](https://images.openai.com/static-rsc-4/sEnUZO-nY2EIULVjgsr5u4DqFqfazoIBi3h9K7LgYNp5zU0uAt4WHXV10ZcfNZ9Q8rVHJRKJNvSTxpaKMoGtXivqGm90RQkFegA4a5Zj0CvaVGOS2EjRzP0zGfA6li_A8YLEZ4qUkzu2kpXpsD5261RzyqRIvqrEvi-xec2fpy0?purpose=inline)

[Phuket & Koh Samui Shopping: A High-End Shopper's Guide](https://images.openai.com/static-rsc-4/sE0mUZx1hrkl5NWZYLTO60__K8gh17NTe9Cev_BP0bea5UNe5IZDpH0lObLvaxJlev9_m0thSsKy4jv07ej2uw01foeig8eyGMCVzNJmOK0MxlFRCEwPWXZZWbzw7BEdG3r6c5OV7VrJeSg1UrMKvd1QCbTx8si8LnKw7fjBRAw?purpose=inline)

16

This is the primary screen users see after entering a mall.

It should be the most visually impressive screen in the application.

## **3.1 Screen composition**

The screen has five layers:

| Layer           | Purpose                                        |
| --------------- | ---------------------------------------------- |
| Background      | Actual mall environment                        |
| Spatial objects | Storefronts, shelves, products, advertisements |
| Navigation      | Search, directory, categories                  |
| Movement        | NEU CART and joystick                          |
| Shopping status | Cart count, cart value, notifications          |

The mall environment should occupy approximately 75–85% of the available visual attention.

The UI should remain minimal.

## **3.2 Top navigation**

[Refined Icons for Seamless Tab Bar by KAYSAR ZAMI on Dribbble](https://images.openai.com/static-rsc-4/3aanCwKtxTdXq3CMhUZ7MSqkuWKU2xYDkR6T1Mvp9FYHclQAgpznvJr-YxYKVq-ugnA6AeG_aLyJOg_CNge_eMUV3L8HEl9UMZ0rdAuggJX7X5N5glITu4xbLbtFdWw1t7ctysnHaIpAFSfSvw6pz2iYvmcDPzpsX8Wr-XC6SDc?purpose=inline)

A floating navigation bar should sit near the top of the screen.

It should contain:

**Left**

- Mall logo / Virtual Retail OS identity.
- Current mall name.
- Small dropdown to change malls.

**Centre**

- Search bar.
- Search products, stores, brands and categories.

**Right**

- Friends.
- Rewards.
- Notifications.
- Profile.

The bar should have:

- Milky-white translucent background.
- Subtle border.
- Soft shadow.
- Rounded corners.
- Dark charcoal typography.
- Restrained purple active states.

It should not be a large opaque rectangle that hides the mall.

## **3.3 Search interface**

Search should be a primary navigation tool.

When users click the search bar, a compact search panel appears.

Users can search for:

- A product: iPhone, milk, face wash.
- A brand: Nike, Samsung, Titan.
- A store: electronics, grocery, beauty.
- A category: skincare, beverages, footwear.

Results should be organised by type.

For example, searching for "face wash" could display:

1. Matching products.
2. Relevant brands.
3. The beauty store.
4. The skincare aisle.

Clicking a result should navigate the user to the appropriate physical location.

This is important: **search should navigate the mall, not merely display a conventional product listing.**

# **4. The mall lobby and entrance**

[Elan Imperial Sector 82 Gurgaon | Luxury Commercial and Retail](https://images.openai.com/static-rsc-4/Pz4l5Jpl3sTDwdZ30BK6wqzFUO_glrPcSmeqiSAe-46PXLnZOhDDiQpdIiiaCY-z5TfnW3PjWB3lA70VtXoL66dzo1ZtFFTdlEll8r_cAfGt4M1X6ZJ07D2RRs3wqA1YgDCmty3N8rc9Yo-_S6L_hdJzKTPNyQgLfnHmxUSaNAQ?purpose=inline)

[All About Mall of Emirates | Property Finder](https://images.openai.com/static-rsc-4/o0hu_94TGY03xTxQ7-ESg8e7fFWikkfJOoiR6IZuwUS2voVdxvubPTP_K7xiRDCsrzeyJhbiU4l5ZfOlpVyrbVIRo7c_ZAY8aoGaKrVMIfkx7YP8ADVB0jyJ4DIHEusrbyzcg6emjERfJ7oD3bOh6kqfDIkUoySSE-AECgSMo38?purpose=inline)

[Familien-Abenteuer im Centro Oberhausen | Kribbelbunt](https://images.openai.com/static-rsc-4/nnvM6s0RF6u3nhQHjUjQoafsyYm_JEY2uVDqB02PHLR31Eg4UbMg2O4or9oyHVX0n1Cb9RUQXqdPsyXe42JVIy2jcBEdwyho0P7SlIJ5uX70i0BXloMMgmsmbcmzuZ06jxshXNAGPrShkGAyLWbUHIInjKV4ip9QkGrCFCOAuzs?purpose=inline)

15

The lobby is the user's introduction to the virtual mall.

It should include:

### **A. Mall identity**

A prominent but elegant mall name or brand sign.

Examples:

- Tata Mall
- Reliance Mall
- Birla Mall

These are illustrative mall concepts.

### **B. Central directory**

A physical-looking digital directory near the entrance.

It can display:

- Grocery.
- Fashion.
- Beauty.
- Electronics.
- Home.
- Kids.
- Food and dining.

The directory should look like a real information kiosk, not a floating app menu.

### **C. Featured storefronts**

Visible store entrances leading into different shopping zones.

Storefronts should have:

- Brand signage.
- Glass entrances.
- Display windows.
- Small promotional screens.
- Visible products or displays.

### **D. Featured promotions**

A small number of prominent promotional installations.

These should be architectural installations rather than giant web banners.

### **E. Entry experience**

A user should be able to:

- Start exploring.
- Select a category.
- Search for something.
- Open the mall directory.
- Enter a featured store.

# **5. The central atrium**

[The American Dream Mall: The Ultimate World Cup Final Fan Refuge | Complete Guide](https://images.openai.com/static-rsc-4/DdF-7pTN_k40bOiKy50Z8rG0G3kK90IwA-1ToshAJsSnA5ctqzOVCSrIy9KueMTs2dpIECkPVXObHgXuBxCNiFR_zVPO5dSnEkpYul2vG4IMR0qLEfwqB48dRPKjimlU3BQoSWD-u3vLZqV74pkB_u3eq0wldb1_COlH20bGm70?purpose=inline)

[더현대 서울 소개 | THE HYUNDAI SEOUL](https://images.openai.com/static-rsc-4/SrVwpYwvZzUGD166uvV2zzw-0QLu2GFX1ZvBcBNoqwrTI8PHjY65W9wOg_VjbqQ3LSxrcgDEkNIX-Uh1c1dMGrzMlymsqd-dN3VtiVntpjiE-R5WxIU6EJR6VR89BJWlGU9FcrW8xElwNhyHqluqiCxbfCFc-NcSEj42ltxuiJs?purpose=inline)

[Manila Bulletin - Ayala Malls reimagines the retail experience for the future](https://images.openai.com/static-rsc-4/xV_jdCQrIEAZO0tHAZOdIBCO0aSZC7HBLf70eA8kHCNzXiqblFnzeiS0-Nc_2n0nBF3vCsyP4cZXvoCyDPwGxBCSpQpepjfgBhwQWslK8-xQ3Wdd_ebZybZAz-0gEeylcpUlNxUxVygLxrPZKAGpa80msp8GrXaQMV0cgy-gNOE?purpose=inline)

10

The central atrium is the mall's discovery hub.

It should have:

- Open vertical space.
- Glass ceilings.
- Architectural columns.
- Storefronts around the perimeter.
- Greenery and seating.
- Digital promotional panels.
- Visible connecting corridors.

This area can host seasonal campaigns, new product launches and sponsored brand experiences.

It should also act as a natural navigation hub.

Users should be able to return to the atrium from any shopping zone.

# **6. The shopping aisles**

Core shopping experience

[Carrefour Damac Hills: Retail Hub Impact on Lifestyle](https://images.openai.com/static-rsc-4/3FZHmufHFq59kzJyF2xPSsYlNH2K7YuJNO4M9cG_Evh3XP_oea5WftK8qbU5MCvjJHHTgJbCOn8lo_uaOwTNwnEt_PJBHSZ4Ozu_PSAYjFxBjPhC5mCwRTpW6urzqXEohHdBFxYDDlLLhM0XG5LcBORmHnDh0fSkLgwZHfFTH7E?purpose=inline)

[매장진열 노하우 2026: 매출 올리는 골든존 법칙과 배치 공식 - 대한민국 냉장쇼케이스 점유율 1위 브랜드 한성쇼케이스 블로그](https://images.openai.com/static-rsc-4/zMPBQbZz038udQrg5NQS5mOmoj8WE6weLRnbse-JotQ4IKu73d4cWqZuNIdHTYUoO-hoMyaF8ttn7Qthsn34koZZg2w4JU2psnSLc88UzUDUjGEfNNQCGe_SXl6PA2rNqJ7nvSYc5Hwa0b3EETtFxvLDZ9B0h24eDi3g3BeJ4XY?purpose=inline)

[Projetos para Lojas, Franquias e Redes Varejistas | Studio Âmbito](https://images.openai.com/static-rsc-4/fCo3uVw3BKkxUeBHNx1YJL1zkvZcLHhxHXdv1Gs-CQQhhrdcNyRmgFgeYaZjWs9VLVvCifqf4Nbz9fSlAxZnVF2Ve6TfxqJbWGC1ebXeOtdad7EBWBGsHPTT3wbXf_gnVbCTf8AdFk07TS84nrzwv9HsMLEClpjBlDvMKZp_iAo?purpose=inline)

15

This is where the product becomes different from traditional ecommerce.

Aisles should look like real physical shopping aisles.

They must not resemble a grid of product cards.

## **6.1 Aisle structure**

Every aisle should have:

- Shelving along both sides.
- A central movement path.
- Visible products on multiple shelf levels.
- Aisle signage.
- Occasional promotional displays.
- Natural perspective towards the end of the aisle.
- Enough space for NEU CART to move.

The user should be able to see depth.

The nearest products should appear larger than distant products.

## **6.2 Shelf architecture**

Shelves should be made from:

- Pale oak.
- Matte ivory.
- White metal supports.
- Light stone or neutral display bases.

They should have realistic:

- Horizontal shelves.
- Vertical dividers.
- Depth.
- Product placement.
- Shelf shadows.

Products must sit on shelves, not float in front of them.

## **6.3 Product placement**

Products should be grouped logically.

For example:

| Shelf  | Products                    |
| ------ | --------------------------- |
| Top    | Larger packaged goods       |
| Second | Boxes and packaged products |
| Third  | Bottles, jars and cans      |
| Fourth | Smaller products            |
| Bottom | Larger packs and bulk items |

Use realistic product images wherever possible.

Avoid placeholder coloured rectangles, random product positioning and inconsistent product scales.

## **6.4 Aisle navigation**

Each aisle should have visible signage.

Examples:

- FRESH PRODUCE
- DAIRY & BREAKFAST
- SNACKS & BEVERAGES
- PERSONAL CARE
- SKINCARE
- FRAGRANCES
- SMARTPHONES
- AUDIO & ACCESSORIES

Signage should be integrated into the physical architecture.

# **7. Category-specific retail environments**

The architecture of the mall should remain consistent, but each category must feel like a different shopping environment.

## **7.1 Grocery**

[AI Shop Design - Shop Rendering Generator with AI](https://images.openai.com/static-rsc-4/NAZRWfzqwrcAhupeyM5e43od_T9fD-Ljp8oxyF-REBVbUepUanv3fUKlS7WkoQoznW9ndI8BGe186aHkA2x2aCFRI9k8YQ9jW2zRzzt2FSqRSf7iHWnPcQsG9HzMqxSfy5mTnecRnp-marz4Yl05H_vNgqvuxnaGD7yNrChsaWg?purpose=inline)

[Loja Continente Modelo Lagoa | Continente](https://images.openai.com/static-rsc-4/q9Y-Wjf7D3CEYzEAwtvsVrvfwCovKWZIkDyRrICYDy0Y0PBuNB4tuhGFU8Vtb-jqxNXxv-pf1f2a3YCEjz0fVPj7EZak2OY8TOeLspaAoAATV4qfLociy-2sBFSqUNyUIOe1qJngk_l0pgBQu--7bdiH5CefGql-j5EHhz9hLDE?purpose=inline)

[FOTO: Par 2,5 miljoniem eiro renovēta Stockmann Delikatess nodaļa :: Dienas Bizness](https://images.openai.com/static-rsc-4/RnlxJf0CeZu-ogM023GtFvoQP6J3VhbkCL2K-xwXnhiOPocc3iURcXK9jPnAk0Fi8EAp8whFUnAs-vwxqUanLuuwIU8jzJ7wwL5rP6Tocha6weaCqCHjxz4b4RL8vHK_lAgn-s4vbTYg-IBNSszd2U1b2tKoDz9IDXYZh6sll7E?purpose=inline)

12

The grocery environment should feel like a high-quality modern supermarket.

Include:

- Fresh fruit and vegetable displays.
- Refrigerated sections.
- Dairy.
- Packaged food.
- Snacks.
- Beverages.
- Breakfast products.
- Daily essentials.

Use natural greens, pale wood and neutral colours.

Fresh produce should be displayed in realistic trays and baskets.

The aisles should be organised by grocery subcategory.

An optional grocery feature we discussed is a live or frequently updated camera feed of actual produce in a store or dark store. This could let customers inspect the available vegetables before ordering. If introduced, clearly indicate whether the feed is live or a timestamped image, rather than implying continuous video when it is not.

## **7.2 Beauty and cosmetics**

[Premium Beauty Brands & Distribution | KOREOS GROUP](https://images.openai.com/static-rsc-4/6QkeCz0X3oMGOptd1zA7uswSYxDHv5FZwb6P8eKJl7HA8ny9jKlzx1eybBRpncEelT3Mfp9TX1E0NDYuDamQUEo_OooddSYmMIlhWjGw9KJwEY8HIDvLPkEjBGptJm1Z4Nkh-de2WnCtymcirkiMPCbLZuFQOq1RioiuIjk9KFY?purpose=inline)

[Why Are Retail Shop Racks Reshaping In-Store Profitability Models? - Xiamen Sintop Display Fixtures Co.,Ltd](https://images.openai.com/static-rsc-4/iP_el56PHTUskOFasvJYWo8uJ8z0dV9-DuIMY9lEYvkvXU3ryEJ41EoqYZ4_bOi-6ceE-KrXYcTGtlU0l8myqprAGyYIpvF0uQhKUsJhwmqHeBJ-Fn059BQeqbXNSoGwQCAmHIl12CdjuOIeiJf_IT7tCiu-a2zD3lqSx7eBtnU?purpose=inline)

[Jasa Desain Interior Toko Jogja Minimalis & Custom Eksterior Terbaik](https://images.openai.com/static-rsc-4/bEhyK5DGiW_l7y8gzS9kZFYrQsAM4yOiVTnDOMOdSUpZkBHb9uUfc-hw1Zgm_B5WNIID0-NXKms1Tbx_uSwP1S1CJT0NsmpUKDY0K5dM54krtUCBfdMn1-L7SosxAnSdMKuMaN0I1lDfRkjFwJzCsFw5V51reCkF4EfEtVGhWX4?purpose=inline)

17

Visual identity:

- Warm ivory.
- Pale stone.
- Glass displays.
- Champagne metallic details.
- Warm lighting.

Include:

- Skincare.
- Makeup.
- Perfumes.
- Haircare.
- Personal care.

Use premium product presentation, with elegant counters and organised displays.

Avoid excessive pink, childish graphics or generic ecommerce product grids.

## **7.3 Electronics**

[DVO | Lab9 Stores neemt 15 Apple-winkels over van Switch](https://images.openai.com/static-rsc-4/zm8r-DrRSb2PUvWCqEH7sh69I_qVk6vZ5Uc1dUFCvb9okxiluDqEnuoeLlpdpRjETNTae-FpebLw0_t8IU9yrfzl00RX385kobtRICNyr8C6g3sMotfW4v3v0h0mqcy_xOvXArRgNU_TSVrrUb6zii-KbImAbjoIn-EDl3rA9Tc?purpose=inline)

[Mi Greece](https://images.openai.com/static-rsc-4/zWIQaCPavdppCTErU2NPLZYbY_Sc8d2ZiW2vpXQ7MCjjbmCBrYu0SxqHvgwTDXekyOZD2R812E9Em5A25fQLIbdTPzWsBlx3eqB4KdMGlU6aWENelB554IVAVfV0MwdhJQmKOXQtpfhZfJXVOuWZskGxl-0BwtruM52LS83mNXw?purpose=inline)

[Your Ultimate Guide to Finding the Best Technology Store for Your Needs - IntelligentHQ](https://images.openai.com/static-rsc-4/-f4SWYITIJVK2Ys2I_l23DoLQBf_diQjc0vVk-JRlj7vP_0oN8lF57jGGSl2NxvpdnVl6ex_GgVjcMyLmZt5bt6O2fAzUQ-pSUiavoVIfPWbiTyRp_fMoos0GmudtBsTsfTt3O9BJz5J8yt0_vuWRd6QoQ9cL0sdhZjJkA1eYJQ?purpose=inline)

15

Include:

- Smartphones.
- Laptops.
- Audio.
- Smartwatches.
- Accessories.
- Smart home devices.

Use white display tables, product stands and slightly cooler neutral lighting.

Do not make the environment dark or blue.

## **7.4 Kids**

[Luminaria Lineal CCT Smart 12W para Carril Magnético 26mm - 48V  – Barcelona Led](https://images.openai.com/static-rsc-4/XpBYM0MCIrTrq2a_hykDs_pIImQpce32Qrn6OiXFA4-mlfDD5Oh29gVMGpPlQQ2uKSBv3H3vyBk16unE6JmC3jpPQW3wUquZZb6nPY_OWrjiGpkQ95QOtm9pOYxaRkmt-re1RsWSCpQMC6HJ4ijHiXbfJrBAa4Hs-82tFA8bFtM?purpose=inline)

[ETTOI](https://images.openai.com/static-rsc-4/4j4WFM7y2KXecpWPk39dcGV_LEZwHgjPXXJXNx7HKgNLJOcnW7aMWalaXlGks3NiBBLY3kCFuhAo2uGU8PCk5NgLp5dLuq7KZ_t-hY_bK-yEhNAF7uhmgdkjcqqy02EffyN0mcdE24_GRGNqUtSa21jL97jtW7HjA9MsePAQJfE?purpose=inline)

[Prénatal — Boksman](https://images.openai.com/static-rsc-4/mtQeNS0EnzCPo2mH9gNZeotG4Wask90-AavPA0ByxKSVOuOn1H9yYJq-1jyBIFuzqS_kLxbYz_NTwlDDUMX_8NUSYaXAdF8PNdQ-so6ssAfBIO0zawstgDudbD3q7C3XO5-wBDB-moZf6Hyn-gOqUG5jTr_Nc2inzPBjvMLDGY8?purpose=inline)

19

Include:

- Toys.
- Children's apparel.
- Baby products.
- Books.
- School essentials.

Use muted pastel accents, pale oak and cheerful but sophisticated displays.

## **7.5 Home essentials**

[The 10 Largest Furniture Companies in the World in 2025  – JUGLANA](https://images.openai.com/static-rsc-4/whWMy76HVj_3SPPcmk7U_mR1dje1cB1ZsiXeBVhfbzgogZahShGLH2EbWOED5QV-APzwPLjAAZXN5prip5lEW3qMgAX4Ct4qu37A4XYTXXPVgs1vpfSDsWMp51iXapqLhFnrGVx4iLeexA5UOHu63e0JVzp55dsAWY1LoqFppUo?purpose=inline)

[Elftes Manufactum Warenhaus in Hannover | Schwitzke](https://images.openai.com/static-rsc-4/V6E_OD7iBpNSlw6NWx5wM9vhR7c-MBT8eZ73F576_fAlVVkAKp8P-Ry91apR84EEmlqR4ANXEcbBo4qU9rk_mHUxIFfkBSx3x4bMYV_5sZIlUAjczGUzjDBCOdGH-GxCQ2oipCd80JTtbrOjexJzzm2CkNrfKrXWKnZSbAzJfuw?purpose=inline)

[RH](https://images.openai.com/static-rsc-4/jFv6YqcsXpuAzSiufrsgrAPxiJ9ZO-9A2jUb0RnpJs8W4xdg9eQcaaAljvpNXagJp_e6CVajNXx-JllnrwP7OdRVuW0mbgGWqvoJ3q5rFXnYkctOOqG2zAAL48h4BDjJLfGnDWN4rSeLqge3z6eyv1AsCP1x21O0S3vu6V19rw4?purpose=inline)

17

Include:

- Furniture.
- Kitchenware.
- Bedding.
- Storage.
- Home decor.
- Lifestyle products.

The environment should resemble a premium furniture showroom.

# **8. Advertisements and retail media**

Important business-model component

[DỰ ÁN VINCOM MEGA MALL SMART CITY](https://images.openai.com/static-rsc-4/h7iyW6k0zrOjML0Qdn2YnuGMXWxmOqUNdzgooyZtJzo8tpTJvQfam8NeIQc59O6w_5R5Tm1B5Sj25ahFqYXyO3MezVieys_oyEoSevHYZSkRBLEdQ2fyH_Gf5FSmwQ7XMgZHIMEXLgbyEci5clhv1V_M2bVUjRnDTWVLbIXYaeU?purpose=inline)

[LG Transparent OLED Art Display for Retail & Exhibitions](https://images.openai.com/static-rsc-4/4sywqeS4rD1iHTHMyodoFA7CV1iApgv2DwscBKK30Kpo86J7FY5dVOH_eiq0dHkeFgwndQs4f1gZ7x9g7WZQXj9d97Tq91dpPP9FZx_6cQO3BHASnnui8FeXpbdVhPxi3B19Y7Gk4po1o6bRsfyMDWy2A6TsoNuAqZlir0SFfDE?purpose=inline)

[Point of Purchase: How Retailers Can Influence Shoppers at the Right Moment](https://images.openai.com/static-rsc-4/u_j8K8jFKl6v0lE1K8RLlip4visV58oqZJbhILmGuE8Pv74kIY1XeLCUafRK6u-062TBx_eEPZFWuwpxcGDPANd__OOpl9Zk-_HnGP21zy0gwGykdKtGCnK0Id7HMDsBpk2ZSQYrK2PgpKve3A_r2tj1uWHGbhU__0bVABSZzY4?purpose=inline)

18

Advertisements are not ordinary popups.

They are part of the mall's physical architecture.

This is a fundamental design decision.

## **8.1 Advertising locations**

Use:

1. Digital panels on architectural columns.
2. Shelf-end promotional screens.
3. Small LED displays above selected shelves.
4. Storefront digital displays.
5. Promotional installations in the atrium.
6. Small screens near aisle intersections.

## **8.2 Advertisement design**

Each advertisement should contain:

- Brand logo.
- Product photography.
- Short headline.
- Minimal supporting copy.
- Optional offer or promotion.

Use white or warm-white backgrounds with colourful product photography.

Examples:

- A skincare campaign on a beauty aisle column.
- A beverage promotion near the grocery section.
- A smartphone launch near electronics.
- A fashion campaign near the apparel entrance.

## **8.3 Advertising hierarchy**

The visual hierarchy must remain:

1. Mall architecture.
2. Products and shelves.
3. NEU CART.
4. Store signage.
5. Advertisements.

Ads should never overpower the shopping experience.

Avoid:

- Giant black billboards.
- Flashing advertisements.
- Full-screen promotional popups.
- Excessive banners.
- Aggressive sale graphics.

# **9. NEU CART — The signature interaction**

Signature product feature

[普象网_普象工业设计小站_工业产品创意设计_原创分享交流   - 普象网](https://images.openai.com/static-rsc-4/1g6tqMbaunMcpNRVv-wQl7lmegvGbgtWgZPOAiNjF-AJBMsbiiTLTnAMWqbI0Sw6x-RzpL2rB_zMiZSuydoERafbDwN-ySRcMQ0fOVuKTcjjapGRAn8NkMBq5KMKDFiTbibnZOe7OnW-JHSgbe95dkHeCVMHQEy4aJ5pwlrcEpk?purpose=inline)

[Bengaluru’s Invento Robotics hopes to revolutionalise retail with its nifty Spody robots](https://images.openai.com/static-rsc-4/pIoV-2F7BrW0KcYx5C-zLZxsNF7iDS6L4z3uidVBEQo1TQoI33zQjN3ik1bZIDjk9KqItb0tRhNUVLeC03Eo1rIu0fd9oXqCwPoz-2PpJ2sf3RjnHPI5a0FSrV5UajZul3nkunhhZcmvUyOQ448Hphp5fIL8KS_pBM4IoAtJAIA?purpose=inline)

[Hardware, Power & Hand Tools - S600 Smart Shopping Cart](https://images.openai.com/static-rsc-4/X17eNE8KvqV26Mj_U5WEuetqGo02_DmnC1h66w9GvPiKxdGgcSerr02kligKzw4RCgDSYOJbxGoStBE9KAClCzR35mQaVuRZq8aCzqGBSa2E80-nwtTgEucfTGtp4wbLndud3EgfKyS7P1a9p2FntITRxPyY4DH1a1_KyPMXlSU?purpose=inline)

10

NEU CART is the user's physical presence inside the virtual mall.

It should look like a small, premium electric shopping vehicle.

## **9.1 Appearance**

The cart must have:

- Rounded white/silver body.
- Brushed aluminium details.
- Four wheels.
- Subtle black control console.
- Restrained purple lighting.
- Realistic shadows.
- Consistent proportions.

It should not look like a conventional shopping trolley.

It should not look like a toy.

It should look like a sophisticated miniature electric vehicle.

## **9.2 Cart behaviour**

The cart should:

- Move through the mall.
- Turn into aisles.
- Stop near products.
- Remain grounded on the floor.
- Maintain realistic proportions.
- Avoid collisions with shelves and architectural elements.

The camera should maintain a comfortable view of the cart and its surroundings.

A third-person follow camera is a good starting point, with a slightly elevated angle that lets users see the shelves and products ahead.

## **9.3 Joystick**

[Neumorphic Joystick by Voicu Apostol on Dribbble](https://images.openai.com/static-rsc-4/XNWFk6Tc_ffZzz0UX3KznIGxDrZlIJQ_zICsqQ2Ubu7D-5NyeHnvQC-BEIvYBw9438B3rEHxDEJTmyuWEqjBmz4KAatA4nr91JaRCezXp76GgD5DLHucHZIP4PCkjZgYGTNsYyeio8iz78W4HOxjjXv0w6cdbZDWkuRlYO2EYR0?purpose=inline)

Place a circular joystick near the bottom-left.

It should be:

- Milky white.
- Slightly translucent.
- Softly shadowed.
- Rounded.
- Minimal.

Directional controls:

- Forward.
- Backward.
- Left.
- Right.

Movement should have natural acceleration and deceleration.

The joystick should not cover important products.

## **9.4 Adding products**

When a customer adds a product:

1. The product is selected.
2. A small contextual preview appears.
3. The customer taps Add to NEU CART.
4. The product visually moves into the cart where technically feasible.
5. The cart count updates.
6. The cart value updates.
7. A small confirmation appears.

This should be a tactile interaction, not a large popup.

# **10. Product selection and product detail**

[Zenit Design | Shopware 6 Themes | Premium extension partner](https://images.openai.com/static-rsc-4/YlKSMzsIPq9rKhC-AFO2CIctjEK3eO1NjYRILFtRqGWvLzt9o8l0ESPO022V950uQJQZmbO3LOVzWjahJBGd--G54dZasHNBQuU-LLwfWJuEdYr3kymcQsp1JBkoFCj7Tyrxsuojv7QNcwPTGcAaNKtFRfk7tfLxusmTNWC-oNI?purpose=inline)

[Mobile App (5 Screens) by Ionut Zamfir | Dribbble](https://images.openai.com/static-rsc-4/Ijdl3MBclmENq4TnNGXfkqCSTAoRxkhossvhKIM4nEfGrDqlYf6dEFITSM-E9lgnJdth919HVRus7_ho-FRGd5qejtu64SL_oo6TTpShOhPuYLdQzphkOkdrGdlhJNswxElduTWOCVBcD5-lZtfYD2mgcozCg4Ei7mXEvHSb0NI?purpose=inline)

[Rimowa - Interaction :: Behance](https://images.openai.com/static-rsc-4/PaP3X0ynkxcHtnf34W-gQUyTfpnwh-jlJ5rY4T5ISw2B3JUF1MOm74a2PrLcP2XqYFzwhDwc2xECOuy9OxUNKlmDvRviLrOfEJYA-bb8zlefJXFaMX-uQk78784zQCdaI5vUiiyVCsNoWnoDNPFzXGPyB9WvQd9CABCt6uvPHh8?purpose=inline)

15

Clicking a product should open a contextual product preview.

It should contain:

- Product image.
- Product name.
- Brand.
- Price.
- Rating, if available.
- Short description.
- Quantity selector.
- Add to NEU CART button.

The panel should be compact and float near the selected product where possible.

It should not cover the entire mall.

A full product detail screen can be opened when the customer wants more information.

# **11. Bottom navigation and shopping controls**

The bottom portion of the screen should contain the main shopping controls.

It should not become a large permanent dashboard.

## **11.1 Category strip**

A horizontal category strip should sit near the bottom, above or alongside the joystick.

Categories:

- All.
- Grocery.
- Beauty.
- Electronics.
- Fashion.
- Kids.
- Home.

The active category should have a subtle purple highlight.

## **11.2 Cart summary**

Place a compact cart summary near the bottom-right.

It should display:

- Cart icon.
- Number of products.
- Total cart value.
- View cart action.

It should update in real time as products are added or removed.

## **11.3 Contextual controls**

Additional controls should appear only when relevant.

For example:

- Navigation instructions while travelling to a product.
- Aisle information when entering an aisle.
- Product preview when selecting an item.
- Promotional details when selecting an advertisement.

Keep the environment uncluttered.

# **12. Mall map and spatial navigation UI**

This is an important component of the experience.

The mall needs both a visually immersive environment and a practical way to understand its layout.

We should not rely entirely on users physically exploring every aisle.

The map should behave like a digital mall directory connected to the 3D environment.

[NavMap — Interactive 3D Wayfinding](https://images.openai.com/static-rsc-4/AxEPJBdFW2HKrj7v1KXMZ-Z8oXbjrOBHKYpcdF7fLuDW78oz4NaDNqlQSRQ3_doQqf8xRmj6Ti26P8Ct__tapR8MHi7OVUXvcHqXxuVunPHrsAXAlWvas0K5dQJQrf9Ta0lXTeXqBtgNTuOIetqLHJnrNZSX-w46SiyblumjCgI?purpose=inline)

[Başarsoft | LinkedIn](https://images.openai.com/static-rsc-4/RLxbD6JIQluhRbZ6VD9BuAn8mLR5SvHjsqBS8vgiajXbj-3Mv5kq-h_GeHK51ygnDK_JI5-EOFJkGJwjAJnFHYtGgvTCcomvXk9-3Vm8QA4Dqsg1PgoaONLQOivTOZtF9_w70n5L5ABolLwc2oKUNjHRfp_GSfwWwZKtW5_n57I?purpose=inline)

[全国10カ所のプレミアム・アウトレット全施設で公開開始！スマホを使って快適に回れるデジタルフロアマップ「メタマップ」導入 | ボールドライト株式会社のプレスリリース](https://images.openai.com/static-rsc-4/-Sl4mworxjijmYY8ovUrmAG4Mxxf_J7ZzEW5kXOBt3eiXrqZc2tb-S_faEZBKKS8qplz7XXeaYPRf0PinT73WN30N5ALeNvonM-pgHA-ZNaDHWLWGlksJTn05Mt1HNtwj9fsbgYXXcjcEYl-8JBStlKyOXVg77zy7AcB81TNDo0?purpose=inline)

16

## **12.1 Map access**

Add a map/directory icon to the top navigation.

When opened, it should reveal a floating or expanded map interface.

The map should contain:

- Mall floor layout.
- Current user position.
- NEU CART position.
- Store locations.
- Category zones.
- Main corridors.
- Entrances and connecting areas.

## **12.2 Map visual style**

The map should use the same colour language as the mall.

- Warm white background.
- Pale grey architectural outlines.
- Cream retail zones.
- Subtle purple active route.
- Clear charcoal labels.
- Minimal category icons.

Avoid a conventional dark navigation map.

## **12.3 Map interactions**

Users should be able to:

1. Zoom in and out.
2. Pan around the floor plan.
3. Select a store.
4. Search for a category.
5. Select a product destination.
6. View their current location.
7. Request directions.

When a destination is selected:

- Show a route from the current location.
- Highlight the route.
- Display the destination.
- Show relevant aisle and store labels.
- Provide a Start Navigation action.

Starting navigation should transition the main camera to the destination route and guide NEU CART through the mall.

The map and 3D environment must share the same underlying spatial layout. The map should not be an unrelated decorative graphic.

## **12.4 Map navigation example**

A customer searches for "moisturiser".

The application:

1. Finds relevant products.
2. Shows the stores selling them.
3. Lets the customer select a product.
4. Shows its aisle and location.
5. Highlights the route on the mall map.
6. Guides NEU CART to that location.
7. Opens the product preview on arrival.

This creates a much more meaningful relationship between search and physical exploration.

# **13. Universal cart**

[Shopping Cart UI Design - Day 58 of DailyUI by Pratham Singh on Dribbble](https://images.openai.com/static-rsc-4/xg94fg5_isNTu0fb-1j7i8eDCkndGBMB1XdO4joIVD0kM-jjbIUDlMDY9ghLO5QAla5--KIUWgz4OtEixMA8sR87qYGUn3UHQ4cuqaHvv1y6LYYORyxxvsCBSMrI_1B8MO4Re0DVKnShEAs8rDYnDfy8rJXA5vO1v38R_HPrjPY?purpose=inline)

[E-Commerce (Orders) Inspirations for Web UI](https://images.openai.com/static-rsc-4/hp7SPi8RPKjPoAgj7WZ9d9GYZWsaBSTNqbr4HMlOgQYi5OmAxoU934QoqJmJ13q0N6TbxaEKEbLwe7_3mDaoGJGtAEuwVxwPJBKhtWq3uroMdA1jf99gxEPpjOiI3blMc3PZBUPFGIC93Rx6alSpOeAFQcxmz23nqFoh5_v6Pr8?purpose=inline)

[Ecommerce Website Checkout Page by Musemind Branding & Web Design for Musemind on Dribbble](https://images.openai.com/static-rsc-4/-d1uNj4lMzGCp5Wa5b1zaP02ERQ81pMkyy8mOHKZJ9KttvhR_bTG7Qts6DXqAUexGsQuUK0jga4R2T69630-5b8fEzuDtCYvEjzizXKRuyM1RR_QHgjIPDTrHcbjUwKUNxNwZvL1sz89CG18-bwqYT1h1WkJuHOdGQAAYK6jDHU?purpose=inline)

13

The universal cart is the feature connecting the entire ecosystem.

Customers should be able to add products from different stores into one cart.

For example:

**NEU CART**

5 items

[Unlock Premium Savings: Times Prime vs CashKaro for Country Delight Offers](https://images.openai.com/static-rsc-4/bgOfWPZJPFLD97euM5vZ6hmwNcuFFNBWjz23B1MDN-TO5Ul91TFMOnO68xQuLrMqe1aqsm-9qEC-_jCqZd1PJYBLjHrhPdddUNQKtKbkMqaenxTOeQe-TcRn0sWphwjDqM_FLx76y0qWHraQ6HaRtEFwyIa-7gAZMFAZRQYCwp8?purpose=inline)

**Grocery**

Milk and daily essentials

**₹250**

[Buy Hydrating Face Wash and Moisturising Cream Products Online in India – Perenne Cosmetics](https://images.openai.com/static-rsc-4/2Lae2odGZYR2Krb4UEpnhZdxyCRTyVB40WKcaIvrkAQzUOxqIgAZ_P3YMK-WSpnyN5fQUZHiqREErHzQVO3woq7iuAUS1jsBfkfAS26AVW9tE3_c37WQ7lHQe71m2NNvWyiWBm7CV_DyLtzi4NDhGXPFOThYdO4AQj-CUN7d8oI?purpose=inline)

**Beauty**

Face wash and moisturiser

**₹850**

[Qwen Image 2 Generator | Polished High-Resolution Prompt-Driven Image Results](https://images.openai.com/static-rsc-4/LBmoiPjYLdhO3BbXGNUaUUWLOx1eX-o-BRsVprrjryfIZHB4lmC4MPhn_wXV0pKx3Al8EOldpWHuRrJnpQdjxGpuVa0IMU4_Xb5L0d_0r03QOuoVMXFOM5WjDFygQgJY5hreE7bgTGBVDSVsvJsOFT0LLTC2taygX4ZUdKwUFaA?purpose=inline)

**Electronics**

Wireless headphones

**₹1,999**

**Illustrative cart total**

# **₹3,099**

Illustrative products and prices, not live inventory.

The cart must distinguish merchants while maintaining one overall shopping experience.

Each merchant section should show:

- Merchant name.
- Product image.
- Product name.
- Quantity.
- Price.
- Subtotal.

The customer should be able to:

- Increase or decrease quantity.
- Remove products.
- Continue shopping.
- View the total.
- Proceed to checkout.

## **Checkout**

The checkout should present one consolidated order experience.

It should clearly communicate that products may be fulfilled by different merchants and may arrive in separate deliveries.

Do not imply that all merchants share one warehouse or delivery operation.

# **14. Social shopping**

[Squad App Design by Masudur Rahman  for Uigeek Studio on Dribbble](https://images.openai.com/static-rsc-4/RCbllvzRVbUvLeK1FSPQV-N1LJfnTO3U0xL4GSjyRbV3UXK1kjFHONHm648WVKBsn5SqD5Hvr4BsDvtdfS-DILI9vLPFkCMeP2xfiKMdqIU7V7SujLOG9QmBG__OHMuWedxEoDAMEY0Vb5PVYvkSfoYw7CH_haPFANsfElO0WvA?purpose=inline)

[Verishop Launches 'Shop Party' Feature for Online Video Shopping with Friends](https://images.openai.com/static-rsc-4/iS4Qn3bJSqIk430yM5yrSNQnybjWZZzEisOkc835dhrTXbJgJTdabmrQ4IVQVdRHfyRNjYuwq8H6FNtabxsRXQj9RZ-Ga-2mKAfYK1Nh5KgzrYYQKhTZArkW8fB00pXzWv0Zn_D3VsqHevs71Gj2m-YZvD5RvgDD83P2vv-RMWc?purpose=inline)

[Zabka Jush! by George Kvasnikov on Dribbble](https://images.openai.com/static-rsc-4/NQ-LykkFUn7I-Oigiq2VJdHXMT2IWy_0fOyRSfzfz85k48p5-9mgZoTluYIIBBQZiCHzVHMEiBacEc4KwSpu-BF87L_vhLe-k3nYlcJHq3aaKlxSadLxxHjVeA-YaKtQMEaQx3RAHX-MMsc1L0_LNHKpmhVbNLChlEEySmPKB4c?purpose=inline)

15

Social shopping should be accessible through the top navigation.

Features:

### **Friends**

- See friends currently shopping.
- Invite friends.
- Join a shared shopping session.

### **Shared shopping**

- Explore the mall together.
- Share product discoveries.
- View each other's selections.
- Add products to a shared cart.

### **Shared cart**

- Multiple people can contribute products.
- Members can see cart changes.
- Products can be assigned to different people.

### **Social interactions**

- Simple reactions.
- Voice chat as a future capability.
- Product sharing.
- Gifting.
- Split bills.

The social interface should feel light and contextual, not like a separate social-media app.

# **15. Rewards and loyalty**

[Wealthy: Loyalty Schemes Application (3) | Images :: Behance](https://images.openai.com/static-rsc-4/mfEwskQEtS931fbwYOy2X4j9b1-PQYdeEv5A-3u6OKajgZgfKeAwot2B-3gYyE5pIt7XtBYo18j2ishwoA9BFIEN4ZmDPp285b8N7OZ9pW_XrywrH_ehpbQNDFE5B1-fl_ALuP28zD6MwJw6cxP9nZeMSaX_k46kNlFSbBMZ0RQ?purpose=inline)

[Amber Loyalty Programme](https://images.openai.com/static-rsc-4/6TcBIUwcNnxxozCPLFKIutoAbbPLstB_DhnlhyfW7ndppUTWXTWLr3kW28jGpMQfZCK8KoK6OisdvWdSoqaNt2C5Ha7W3U9AWjFLh9HexIfvjBrmfh9iC8n44q_WhKiDkbJ2AJsaP3-gEBwpcB97ds244baBjHaJXDOaoxg8ZFo?purpose=inline)

[Alle | Join & Earn Rewards — Nourish Medical Spa](https://images.openai.com/static-rsc-4/HJcmnXsl99L4Z0-PSqlsdnaOqroSwODFS5QxYtK__l_EmuMchWX4nyRP3QflaE7pV3gpUlLa6JWh5jO159TJgwbjF1mxXR3G5Dr7XeM82s5MGpoAzMETK1nDG6_JuJ7OXQm7Tv-v-VcGpYZlcg0qjuUf4y5030NuHbMQh7R8DMw?purpose=inline)

14

The rewards interface should be accessible from the top navigation.

It should show:

- Current reward balance.
- Points earned.
- Recent transactions.
- Available rewards.
- Redemption opportunities.

The larger vision is to make rewards useful across participating businesses in the ecosystem.

For example, points could potentially be redeemed for:

- Shopping.
- Dining.
- Flights.
- Hotels.
- Other ecosystem services.

The interface should not promise cross-business redemption until the relevant partnerships and settlement arrangements exist.

# **16. AI shopping assistant**

An AI assistant could be integrated into the mall as a contextual shopping companion.

It should be accessible through a small assistant icon.

Potential use cases:

- Find a particular product.
- Compare two products.
- Recommend alternatives.
- Create a grocery list.
- Plan a meal and find ingredients.
- Find products within a budget.
- Suggest complementary products.
- Navigate to a particular store.

Example:

Customer: "I want to make pasta tonight."

Assistant:

- Suggests ingredients.
- Finds the relevant grocery aisle.
- Shows suitable products.
- Lets the customer add them to NEU CART.

The assistant should be helpful without taking over the shopping environment.

# **17. Multiple malls and conglomerates**

[Étiquette Digitale & Services Retail Tech au Maroc — displayR](https://images.openai.com/static-rsc-4/5KzOvXvJZMTskyE3nPWfUGlHUYbH1KY_3YvW4YEd6Eb4F2Umi7AVIcKUZTBV6ooEEkOZvpaJ5mQqc7PiV6l_bd1vPXaUBM9h7lahQbkAG76DyL6FSUvECCtxnbvhJNccW7j-isBS9r9b6EEgvw4ftVWHCO9ABm8foiLGREjW02s?purpose=inline)

[Gran Reno — Design International](https://images.openai.com/static-rsc-4/RaxcD__wVZAAC-fJEtbmqishZAd5g-6xmbNRDu_C3Eh1RwMzEFCq7mqTJ1bBiSpIIGqDNX3w3ifQlUg5jIyMxjNZLF7-GzRbXWxZtNf-ZhDYg9y5MKSHpe2gsTrhtiTW9nMhMGk-GD9uHWESNQMR_Arf6-lzM4UFC2MhITn1z8g?purpose=inline)

[MODE MALL — Website Design by Diana Isaieva on Dribbble](https://images.openai.com/static-rsc-4/s6YH5Gu_6Bmh14wZ99rp6kgHj0JmPSm2nffSeuag6Y8xjB4mlsXtnV-ux8BSTv6I8PuoCezxWCGBdGN3kwlPvbbSMWJdBfeMOzwdf-FRUyI0sMqRocUc4nqPT1gNM2WmhHiHrj-RSU8mjqCfXsBILk-mGfjaOKVxjeD9njFvHPc?purpose=inline)

13

Virtual Retail OS should support multiple mall environments.

Illustrative examples:

- Tata Mall.
- Reliance Mall.
- Birla Mall.

Each mall should have:

- Its own identity.
- Participating businesses.
- Category layout.
- Storefronts.
- Promotions.
- Retail directory.

However, the overall interaction model should remain consistent.

A user should not need to relearn how to navigate each mall.

The same NEU CART, map, search, universal cart and navigation should work across the platform.

# **18. Complete user journey**

This is how the different UI components should work together.

1. **Open Virtual Retail OS**

   User sees the available malls and selects one.
2. **Enter the mall**

   User arrives at the lobby, sees the architecture, featured stores and central directory.
3. **Start exploring**

   User sees the central atrium and nearby shopping zones.
4. **Navigate**

   User uses NEU CART, category navigation, mall map or search.
5. **Enter an aisle**

   User sees physical-looking shelves, products and architectural advertisements.
6. **Discover products**

   User selects a product and opens its contextual preview.
7. **Add to NEU CART**

   Product is added, cart count and price update.
8. **Explore another store**

   User moves to another category and continues shopping.
9. **Use social shopping**

   User can invite friends or share products.
10. **Universal checkout**

    User reviews products from multiple merchants and checks out once.
11. **Order tracking**

    User tracks the fulfilment of products from different merchants.

# **19. Full application screen inventory**

This is the complete UI inventory we should eventually build.

| Screen                | Main purpose                     | Priority |
| --------------------- | -------------------------------- | -------- |
| Mall selection        | Select a virtual mall            | High     |
| Mall lobby            | First impression and entry       | High     |
| Central atrium        | Main discovery hub               | High     |
| Mall environment      | Main spatial shopping experience | Critical |
| Grocery aisle         | Grocery shopping                 | Critical |
| Beauty aisle          | Cosmetics and skincare           | High     |
| Electronics store     | Electronics shopping             | High     |
| Kids' store           | Kids' products                   | Medium   |
| Home showroom         | Home essentials                  | Medium   |
| Mall directory        | Browse stores and categories     | High     |
| Interactive mall map  | Spatial navigation               | Critical |
| Search                | Product/store discovery          | Critical |
| Product preview       | Product selection                | Critical |
| Full product detail   | Product information              | Medium   |
| NEU CART controls     | Movement and shopping            | Critical |
| Universal cart        | Consolidated shopping basket     | Critical |
| Checkout              | Complete purchases               | High     |
| Order tracking        | Fulfilment visibility            | High     |
| Social shopping       | Collaborative shopping           | Medium   |
| Shared cart           | Collaborative purchases          | Medium   |
| Rewards wallet        | Loyalty and redemption           | Medium   |
| AI shopping assistant | Contextual assistance            | Medium   |
| Profile and settings  | User preferences                 | Medium   |

# **20. Interaction and visual behaviour rules**

The interface should behave consistently throughout the mall.

| User action              | Expected response                    |
| ------------------------ | ------------------------------------ |
| Select a category        | Navigate to its retail zone          |
| Select a store           | Enter its shopping environment       |
| Search for a product     | Show matching products and locations |
| Select a map destination | Highlight its location               |
| Start navigation         | Guide NEU CART towards destination   |
| Select a product         | Open contextual product preview      |
| Add product              | Animate addition and update cart     |
| Open cart                | Show universal cart                  |
| Invite a friend          | Open social shopping interface       |
| Select rewards           | Open loyalty wallet                  |
| Select advertisement     | Show campaign or product details     |
| Return to lobby          | Navigate back to mall entrance       |

All major interactions should be functional in the prototype, using realistic mock data where integrations are unavailable.

# **21. Motion and animation language**

The interface should feel responsive and polished.

Use:

- Smooth camera transitions.
- Natural cart acceleration and deceleration.
- Gentle joystick movement.
- Subtle product selection feedback.
- Product-to-cart animations.
- Smooth panel transitions.
- Soft hover states.
- Small navigation transitions.
- Subtle advertisements and display animations.

Avoid:

- Excessive bouncing.
- Constant movement.
- Abrupt teleportation.
- Unnecessary zooming.
- Aggressive popups.
- Distracting animations.

The movement should feel like a premium interactive environment, not a mobile game.

# **22. Technical architecture for the UI**

The most important architectural decision is to make the mall environment and the shopping interface communicate through a shared data model.

A recommended architecture:

\#chatgpt-mermaid-\_r_2d3\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_2d3\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2d3\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2d3\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_2d3\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_2d3\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_2d3\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_2d3\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_2d3\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_2d3\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_2d3\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_2d3\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_2d3\_ p{margin:0;}#chatgpt-mermaid-\_r_2d3\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_2d3\_ .label text,#chatgpt-mermaid-\_r_2d3\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ .node rect,#chatgpt-mermaid-\_r_2d3\_ .node circle,#chatgpt-mermaid-\_r_2d3\_ .node ellipse,#chatgpt-mermaid-\_r_2d3\_ .node polygon,#chatgpt-mermaid-\_r_2d3\_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .rough-node .label text,#chatgpt-mermaid-\_r_2d3\_ .node .label text,#chatgpt-mermaid-\_r_2d3\_ .image-shape .label,#chatgpt-mermaid-\_r_2d3\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_2d3\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .rough-node .label,#chatgpt-mermaid-\_r_2d3\_ .node .label,#chatgpt-mermaid-\_r_2d3\_ .image-shape .label,#chatgpt-mermaid-\_r_2d3\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_2d3\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_2d3\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_2d3\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_2d3\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_2d3\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_2d3\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_2d3\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_2d3\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_2d3\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_2d3\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_2d3\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_2d3\_ .icon-shape,#chatgpt-mermaid-\_r_2d3\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_2d3\_ .icon-shape p,#chatgpt-mermaid-\_r_2d3\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_2d3\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_2d3\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_2d3\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_2d3\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_2d3\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_2d3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_2d3\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_2d3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_2d3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2d3\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_2d3\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2d3\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_2d3\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_2d3\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_2d3\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_2d3\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .node rect,#chatgpt-mermaid-\_r_2d3\_ .node circle,#chatgpt-mermaid-\_r_2d3\_ .node ellipse,#chatgpt-mermaid-\_r_2d3\_ .node polygon,#chatgpt-mermaid-\_r_2d3\_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2d3\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_2d3\_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_2d3\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_2d3\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_2d3\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Virtual Retail OS3D Mall EnvironmentApplication UISpatial LayoutStorefronts and AislesProducts and AdsNEU CARTSearch and DirectoryMap NavigationProduct PreviewUniversal CartSocial and Rewards

### **Suggested technology**

| Layer              | Suggested technology          |
| ------------------ | ----------------------------- |
| Application        | React + TypeScript            |
| UI styling         | Tailwind CSS                  |
| 3D environment     | Three.js / React Three Fiber  |
| 3D assets          | GLTF / GLB                    |
| Motion             | Framer Motion                 |
| Cart state         | Shared application state      |
| Spatial navigation | Shared mall coordinate system |
| Physics            | Rapier, if required           |

The exact stack should depend on the current codebase. Do not introduce technologies just to follow this recommendation.

## **Essential technical rule**

The mall map, the 3D environment and the product locations must all use the same underlying spatial data.

For example, a product should have:

- Product ID.
- Merchant ID.
- Category.
- Store ID.
- Aisle ID.
- Shelf ID.
- Spatial coordinates.

That allows search, map navigation, camera movement and product interaction to work together.

# **23. Development sequence**

Do not attempt to build everything at once.

I recommend the following order:

## **Stage 1 — The foundation**

Start here

- Mall lobby and central atrium.
- One complete grocery aisle.
- Realistic shelving and products.
- Integrated advertisements.
- NEU CART.
- Camera and basic movement.

**Stage 2 — Spatial navigation**

- Mall floor plan.
- Interactive map.
- Store locations.
- Product locations.
- Search-to-navigation.
- Route highlighting.

**Stage 3 — Shopping**

- Product preview.
- Add-to-cart animation.
- Universal cart.
- Quantity and removal controls.
- Checkout prototype.

**Stage 4 — More retail environments**

- Beauty.
- Electronics.
- Kids.
- Home essentials.
- Fashion.

**Stage 5 — Ecosystem features**

- Multiple malls.
- Social shopping.
- Rewards.
- AI shopping assistant.
- Advanced advertisements.

# **24. Non-negotiable visual rules**

1. The mall environment is the hero.
2. The environment must look like a real premium mall.
3. Daylight luxury retail is the design philosophy.
4. The mall must be bright, spacious and naturally illuminated.
5. Warm white, cream, pale stone and pale oak dominate.
6. Purple is used only as a restrained accent.
7. Aisles must have realistic depth and physical shelves.
8. Products must be arranged on shelves, not displayed as floating ecommerce cards.
9. Advertisements must be integrated into architecture.
10. No giant black billboards.
11. No dark futuristic or cyberpunk design.
12. No excessive floating UI cards.
13. No large permanent sidebar.
14. NEU CART remains white/silver and consistent across all categories.
15. The map and 3D mall must share the same spatial layout.
16. Navigation must be intuitive even for a first-time customer.
17. The application must work on mobile as well as desktop.

# **25. What the finished experience should feel like**

When someone opens Virtual Retail OS, they should not feel like they have opened another shopping app.

They should feel as if they have entered a beautiful virtual shopping destination.

They should see a bright architectural environment, stores around them, shelves filled with products, small advertisements integrated into the mall and their NEU CART ready to move.

They should be able to explore for enjoyment or search for something specific and reach it quickly.

They should be able to shop across categories without having to restart their shopping experience every time they enter a different store.

The mall creates discovery.

The products create desire.

NEU CART creates interaction.

The map creates orientation.

The universal cart connects the ecosystem.

**Virtual Retail OS should make digital shopping feel like visiting a mall, without sacrificing the convenience of shopping online.**

## **My recommendation: what we should actually build first**

There is one important distinction between the complete vision and the first prototype.

I would not build 20 screens before proving that the central mall experience works.

The first demonstrable version should have just four excellent experiences:

[Prime Place Infra | Dr. Prafulla Mart - Premium Commercial Space in Katihar](https://images.openai.com/static-rsc-4/W4EbqB03twQpgFuJ3DIu5GQvXSulQdbUBlKRFOdlDXdNUhG9eCMkl7yBmON2DlG8r2wqthmEH92C-0oqikPVrg89DXNS2XWhK6eQjXDoRwntvoQYZ12QfMg5ULEgdavrTGRynaiz1oIRbZ9s_TZk4h-aKKeo5mZfpyRGRLExsOY?purpose=inline)

**1. Mall lobby and central atrium**

A beautiful entrance, visible storefronts, architectural depth and clear navigation.

[The largest grocery retail chains in Germany: top 10 retailers and market structure](https://images.openai.com/static-rsc-4/jaT9MiQUznBsm9ylzURMWwNcT6TD4mUk080dFtnoTjOYKLVjKIvhZCGxjF9hQjK0O6fH87UdW43h2__0nBnBQFn4o6EBY5YmZJW24sjxrOWRFmxprcXBAn9kYMCh3uFp7aJoMLPduSlf0r5xgFEPYnrzJu-ttI4nZcfJN91pZNo?purpose=inline)

**2. Grocery shopping environment**

One genuinely convincing aisle, products on shelves, advertisements and NEU CART.

[Parfümerie Becker - Rheinkreishelden](https://images.openai.com/static-rsc-4/JVt8aUaKGxmLlLHWPGBRwt3w0eR9VOJRTL4iEltH3OzM2uf9HNxEv0D3MIzvk6-muex6Tmn2T5KU7EZcDgNlF0hfkHMPkVTCPxTBjVeuJlBSPUpXew7zIbPIj4zj7aMFgNocBj53rwTZq2MSjqqRvmqfpBaq-UNYHlP_t9BtUnE?purpose=inline)

**3. Beauty shopping environment**

Demonstrate that the same mall architecture can transition into a different retail identity.

[Ecommerce mobile App by Amna Ishaque on Dribbble](https://images.openai.com/static-rsc-4/5phLUdVBwK8dhdbXnmZJiioUXGNHrgy4fyoyf01Pzg_FxSrxfo1zeg-AO7NlziqhfVpJB30_q4U0BCCnl-8RXTO3U5mrv7aEHZKOrPKXdkUSvht5GbL3OEO9AYWaxrV4i6G6RUhE5a6vgPQQh6PeR94yaa62yo7TboIkuSnHzfE?purpose=inline)

**4. Universal cart**

Demonstrate the core business proposition: products from different stores, one consolidated cart.

**The biggest product risk I would address early:** immersive exploration is attractive, but it must not make routine shopping slower. We should eventually support two complementary experiences:

- **Discovery mode:** explore aisles, browse shelves, encounter brands and shop socially.
- **Mission mode:** search directly, navigate to the product and check out quickly.

Both should exist within the same mall.

That is how we can make the experience feel like a mall without forcing every customer to walk through one every time they need milk.
