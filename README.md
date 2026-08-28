# FRONTIER — Premium Smart Gadgets Store

🔴 **Live demo: https://samoin-cloud.github.io/frontier/**

A complete, **zero-dependency** e-commerce frontend covering the full 34-page spec: 28 hand-built pages, 232 procedurally-generated products, a design system with light/dark themes, cart → checkout → order tracking, account dashboard and more. Every asset is local except Google Fonts (which degrades gracefully to system fonts offline).

## Run it

No build step. Either:

```bash
# Option A — just open it
start index.html          # Windows (or double-click)

# Option B — serve it
python -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`. All state lives in `localStorage` (`frontier:v1`), so you can reset the whole store from DevTools by clearing that key.

## Architecture

```
frontier/
├── index.html … accessibility.html   # 28 thin shells — chrome is JS-injected
├── css/
│   ├── base.css        # tokens, themes, layout shell, nav/footer/toasts, animations
│   ├── components.css  # buttons, forms, cards, tabs, accordions, tables…
│   └── pages.css       # hero, product detail, checkout, blog, auth, misc
├── js/
│   ├── icons.js        # ~50 stroke icons + logo mark (window.FR_ICON)
│   ├── data.js         # SEEDED generators: products/brands/blog/FAQs/team/reviews
│   ├── store.js        # localStorage state: cart, wishlist, compare, orders, auth
│   ├── ui.js           # primitives: productCard, quickView modal, toasts, tabs,
│   │                   # accordions, countdowns, count-up, reveal-on-scroll, ripple
│   ├── layout.js       # header w/ mega-menu & mini-cart, search overlay, theme,
│   │                   # footer, back-to-top ring, Nova chat widget, mobile drawer/tabbar
│   ├── main.js         # bootstrap + per-page dispatch
│   └── pages/*.js      # one module per page family (home, shop, commerce, account…)
├── tools/build-pages.mjs  # regenerates all 28 HTML shells: node tools/build-pages.mjs
└── robots.txt / sitemap.xml / README.md
```

**Why vanilla?** The brief suggested Next.js; this build delivers the identical UX surface with zero install/build dependencies so it runs anywhere instantly (also why there are no ES modules — classic scripts keep `file://` working). The layering (`data.js` ↔ `store.js` ↔ `ui.js` page modules) maps 1:1 onto a React port later.

## Demo data

- **232 products** across 8 categories, seeded deterministically (`mulberry32`) — identical on every load. Product art is procedurally generated SVG data-URIs (gradient + device glyph), swappable for real photography via `DATA.img(p)`.
- **30 journal articles**, **52 FAQs**, **22 testimonials**, **12 team members**, **32 brands**.
- Specs tables, reviews, star distributions all generated per-product from the same seed.

## Demo flows worth trying

| Flow | Where |
|---|---|
| Promo codes | Cart → `FRONTIER10` / `WELCOME15` / `FREESHIP` |
| Full purchase | Add to cart → checkout (4 steps, validated) → confirmation w/ confetti |
| Tracking | Confirmation → Track, or use demo code **FR-DEMO01** |
| Account | Login (any email) seeds addresses/cards; dashboard has 6 sections |
| Compare | Tick “Compare” on cards in shop → floating bar → comparison table (differences-only toggle) |
| Wishlist share | Wishlist → “Share list” copies a URL others can open read-only |
| Gift card checker | Try `GIFT-FR2K9X` ($75 balance) |
| Warranty serial | Any `FR-2024-K9XQ`-pattern serial returns live status |
| AI concierge | Chat bubble bottom-right asks about orders/returns/picks |

## Fidelity notes

- Dark/light theme follows system preference, persists via `localStorage`, 300 ms transitions.
- `prefers-reduced-motion` disables preloader, marquee, particles, parallax and confetti.
- Focus-trap modals, skip link, ARIA labels/live regions, visible focus rings throughout.
- Unique `<title>`/description/OG tags per page (edit `tools/build-pages.mjs`, then re-run).
- Product JSON-LD injected on detail pages; Organization schema on home.
- Fictional brand roster (Nexora, Voltrix…) keeps pricing plausible — swap real names in `DATA.brands` if preferred.
