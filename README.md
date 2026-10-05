# ANIMEVERSE — MUSEUM

A warm, museum-lit anime exhibition you can walk through. AnimeVerse is a React
single-page app that treats catalogue browsing like an exhibition: a timeline of
eras, a cinema for streaming, a first-person 3D museum hall, and a gallery of
3D character models you can orbit and upload to.

![Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
![Firebase](https://img.shields.io/badge/Firebase-12-ffca28)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Contents

- [Highlights](#highlights)
- [Design system](#design-system)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Architecture](#architecture)
- [Data & streaming pipeline](#data--streaming-pipeline)
- [Admin & security model](#admin--security-model)
- [Testing](#testing)
- [Known gaps](#known-gaps)
- [Tech stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Highlights

| Area | What it does |
| --- | --- |
| **Timeline** | Scroll-driven four-era history of anime, from local data |
| **Cinema** | Three rails — Trending, Popular, Critics' Choice — from AniList, plus debounced search |
| **Anime detail** | Synopsis, genres, studios, characters, episodes, trailer, lazy-loaded player |
| **Museum** | Real first-person 3D hall: WASD + pointer-lock, marble floor, lit pedestals, portals |
| **Gallery** | Orbitable 3D character models with Draco/KTX2 loading, grid view, wireframe toggle |
| **Support** | UPI QR donation page |
| **Admin** | Firebase email/password sign-in; upload `.glb` models straight to Cloud Storage |

**Zero-cost by design.** No keys, no accounts, no paywall. Everything degrades
gracefully — if Firebase is unreachable the Gallery falls back to its static
catalogue, and if the backend is down the streaming API walks a chain of public
mirrors.

### What actually works offline

Everything except streaming. The 3D museum, timeline, gallery, and all
navigation are pure client-side and need no network beyond the initial page
load.

---

## Design system

The visual language is **warm editorial minimalism** — a dark gallery lit by
warm light, not a neon cyberpunk UI. Think museum wall labels and exhibition
catalogues rather than streaming dashboards.

### Colour

The palette is defined once in `tailwind.config.js` under `anime.*`. Near-black
surfaces with cream type, and a single terracotta accent used sparingly.

| Token | Hex | Role |
| --- | --- | --- |
| `anime.dark` | `#0A0A0B` | Page base, canvas clear colour |
| `anime.dark-card` | `#1B1B1E` | Card and panel surfaces |
| `anime.cream` | `#E1E0CC` | Primary text — warm off-white, never pure `#FFF` |
| `anime.cream-muted` | `#A1A094` | Secondary text, captions, metadata |
| `anime.cream-dim` | `#71716A` | Disabled and tertiary text |
| `anime.terracotta` | `#D97A5C` | **The** accent: CTAs, focus, active nav |
| `anime.terracotta-soft` | `#E09A7F` | Hover state for the accent |
| `anime.line` | `rgba(225,224,204,0.08)` | Hairline borders |

> **Legacy aliases.** `anime.pink`, `anime.pink-light`, and the `pink.*` /
> `rose.*` scales are identical values to the terracotta ramp. Around 55 call
> sites still reference them. New code should use `anime.terracotta`. The
> aliases are deliberate, not an oversight.

Secondary hues (`purple`, `violet`, `cyan`, `blue`, `orange`, `amber`,
`emerald`) are all desaturated toward the same warm-neutral base so no accent
can feel out of place.

### Typography

Two families, loaded from Google Fonts in `index.html`:

- **Inter** — 400 to 900. All UI, body copy, and numerals. Tight tracking at
  `-0.01em` for body text.
- **Instrument Serif** — the display face. Used via the `.font-serif-accent`
  utility for headings, exhibit titles, and numerals-as-display. Its italic is
  available for editorial flourishes.

The 400-weight Inter with a muted cream is deliberately quiet; hierarchy comes
from **size, weight, and letter-spacing** rather than colour.

### Surfaces & texture

```css
--glass:           rgba(18, 18, 20, 0.72);   /* frosted panel fill   */
--glass-border:    rgba(225, 224, 204, 0.08);
--glass-highlight: rgba(225, 224, 204, 0.14); /* top-edge sheen       */
```

Two overlays sit above everything to stop the flat black from looking digital:

- **Film grain** — `.noise-overlay`, an SVG `feTurbulence` texture drifting on a
  `0.9s steps(2)` loop. This is the single most important detail in the design;
  it reads as paper and film rather than as a div.
- **Glass panels** — translucent charcoal with a one-pixel cream highlight on
  the top edge, so panels look lit from above.

### Motion

| Animation | Duration | Notes |
| --- | --- | --- |
| `fadeInUp` | 0.6s | Default entrance, 40px rise |
| `fadeInDown` | 0.8s | Hero and header entrances |
| `float` | 8s | Slow 8px bob with a 0.5° tilt, infinite |
| `grain` | 0.9s | Film grain drift, `steps(2)` for a filmic judder |

Route changes are wrapped in a GSAP `PageTransition` (`src/App.jsx`), so
navigating between halls cross-fades rather than hard-cuts.

### Components

Four button classes cover every action, defined in `src/index.css`:

- `.btn-modern` — shared base geometry and transitions
- `.btn-primary-modern` — filled terracotta, for the single primary action per view
- `.btn-secondary-modern` — outlined cream, for everything else

### Layout

- 4-column bento grid on the landing page, collapsing to 1 column on mobile
- Horizontal scroll rails of 15 cards in Cinema (`minmax(220px, 1fr)` grid)
- `drei`'s `Environment` presets plus contact shadows ground every 3D model, so
  nothing floats in a void

---

## Quick start

### Prerequisites

- **Node.js 18+** (Vite 5 requirement)
- npm

### 1. Clone and install

```bash
git clone https://github.com/namann5/Anime-muesuem.git
cd Anime-muesuem/animeverse-mvp
npm install
cd server && npm install && cd ..
```

### 2. Create your env file

```bash
cp .env.example .env
```

For local development the defaults in `.env.example` are already correct. You
do **not** need to set anything to run the app.

### 3. Start the backend (port 3001)

```bash
npm run dev:server
```

```
🚀 Backend server running on http://localhost:3001
✅ Consumet provider (AnimePahe) initialized successfully
```

On first boot the server probes seven AnimePahe domains to find one that
answers, then retries provider initialisation every 5 seconds. A cold start can
take up to 13 seconds before requests succeed.

### 4. Start the frontend (port 5173)

In a **second terminal**:

```bash
npm run dev
```

```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open <http://localhost:5173>. Navigation is hash-based, so you can deep-link
straight to `#museum` or `#gallery`.

### Optional: everything at once

```bash
npm run dev:all
```

> `dev:all` also starts Consumet from a sibling `../api.consumet.org` checkout.
> The backend imports Consumet itself, so that third process is not needed for
> this app to work. Prefer two terminals.

---

## Environment variables

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | `src/api/streamingApi.js` | `http://localhost:3001/api` | Backend base URL |
| `PORT` | `server/index.js` | `3001` | Backend listen port |
| `VITE_ADMIN_PASSWORD` | `src/config/adminPassword.js` | unset | **Legacy, unused** |

### About `VITE_ADMIN_PASSWORD`

This variable is **no longer read by any admin code path.** Admin access now
goes through Firebase Auth custom claims.

It is still documented in `.env.example` because the file doubles as a warning
about a real past incident: Vite inlines `VITE_*` variables into the public
client bundle, so anything you put here is readable by anyone who loads the
site. A default password was once committed to this repository and had to be
treated as compromised.

**Never reintroduce a build-time secret.** See [Admin & security
model](#admin--security-model) for the correct approach.

---

## Architecture

```
animeverse-mvp/
├── src/
│   ├── App.jsx              # Hash router, nav, route error boundary
│   ├── main.jsx             # React root
│   ├── index.css            # Design tokens, buttons, grain overlay
│   ├── api/
│   │   ├── anilistApi.js        # AniList GraphQL client
│   │   └── streamingApi.js      # Backend + public-mirror fallback chain
│   ├── services/
│   │   ├── animeService.js      # Cached AniList aggregation
│   │   ├── characterService.js  # Firestore/Storage model CRUD
│   │   ├── adminAuth.js         # Firebase auth + claim check
│   │   └── firebase.js          # Firebase initialisation
│   ├── components/          # 20 components — see below
│   ├── pages/               # 10 pages — see below
│   ├── data/                # Static catalogue: characters, eras
│   └── styles/              # global.css, timeline.css
├── server/
│   ├── index.js             # Express: metadata, watch, proxy
│   ├── ssrf-guard.js        # Outbound URL validator
│   ├── ssrf-guard.test.js   # 50 unit assertions
│   └── proxy.integration.test.js
├── scripts/
│   ├── set-admin-claim.mjs  # Mint the admin custom claim
│   └── rules.test.mjs       # 14 Firestore/Storage rules checks
├── firestore.rules
├── storage.rules
├── firebase.json            # Emulator config
└── vite.config.js
```

### Routing

There is no router library. `src/App.jsx` hand-rolls hash routing with a
`hashchange` listener.

| Hash | Page |
| --- | --- |
| `#home` | `Home.jsx` |
| `#gallery` | `Gallery.jsx` |
| `#watch-anime` | `WatchAnime.jsx` |
| `#anime/<malId>` | `AnimeDetail.jsx` |
| `#museum` | `Museum.jsx` |
| `#museum/<malId>` | `Museum.jsx`, filtered to one franchise |
| `#timeline` | `AnimeTimeline.jsx` |
| `#support` | `Support.jsx` |
| anything else | `NotFound` |

Notes worth knowing before you edit `App.jsx`:

- All seven routed pages are `React.lazy`, so the landing payload excludes both
  the streaming and the 3D code.
- `PreviewScene` — roughly 800 kB of WebGL — additionally defers loading until
  it scrolls into view, via `IntersectionObserver` with a 200px margin.
- "Cinema" stays highlighted while you are on an anime detail page.
- Every page renders inside a `RouteErrorBoundary` keyed on the route, so a
  crash in one hall cannot white-screen the app.
- Admin controls are hidden behind four deliberate clicks on the Gallery nav
  item.

---

## Data & streaming pipeline

### Metadata

`animeService.js` queries AniList's GraphQL API and caches responses in
`localStorage` for 24 hours.

### Streaming

Two tiers, tried in order:

1. **Your backend** at `VITE_API_URL`. If it returns a non-empty episode list,
   done.
2. **Four public Consumet mirrors** × two providers (`gogoanime`, `zoro`),
   first success wins.

Every request carries an `AbortController` timeout, and 5xx, timeout, and
network errors are all mapped to one tagged `JS_ANIMEPAHE_ERROR` so the UI can
tell "the server is down" apart from "this show has no episodes."

Playback prefers `hls.js` and falls back to native HLS on Safari, recovering
from fatal errors. The player picks 1080p before 720p and only routes backend
URLs through the proxy.

### Backend endpoints

Mounted at both `/api` and `/` so a host that strips a path prefix still works.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/search?q=` | Anime search |
| `GET` | `/info/:id` | Title metadata |
| `GET` | `/watch/:episodeId` | Episode source list |
| `GET` | `/proxy?url=` | Guarded media proxy |

---

## Admin & security model

### Authentication

Admin sign-in is real Firebase email/password auth using
`browserSessionPersistence`. No password is embedded in the bundle, and none is
compared in client code.

The actual write gate is an **`admin` custom claim**. Firestore and Storage
rules check that claim, so revoking it takes effect immediately, server-side,
without redeploying the frontend.

### Promoting an admin

```bash
# Requires a service-account key with Firebase Admin access.
node scripts/set-admin-claim.mjs you@example.com
```

The script merges the claim into existing claims rather than replacing them,
revokes the user's refresh tokens, and warns if your service-account key is not
gitignored.

### Rules

`firestore.rules` and `storage.rules` both follow the same shape:

- Reads on the public catalogue: **open**
- Writes and deletes: **`admin` claim required**
- Creates: require non-empty `name` and `modelUrl`
- Everything else: **deny by default**
- Storage paths outside `/models`: **denied**
- Uploads: capped at 50 MB

Because writes are authorised by a claim rather than by client state, an admin's
permissions cannot be escalated from the browser console — a self-registered
user may see the upload UI, but every write is rejected by the rules engine.

### The proxy is the hardened part

`/proxy` exists to avoid browser CORS on media requests, which makes it a
classic SSRF target. `server/ssrf-guard.js` is the most defensively written code
in the repository. It enforces:

- HTTP and HTTPS only — no `file:`, no `gopher:`
- DNS resolution, with **every** returned IP checked against loopback, private,
  CGNAT, link-local, and cloud-metadata ranges
- IPv4-mapped IPv6 and NAT64 representations, so `::ffff:127.0.0.1` is caught
- Per-hop redirect re-validation, capped at 3 hops
- A 32 MiB stream ceiling
- A 20 second timeout
- Byte-limit enforcement that destroys both request and response streams

---

## Testing

Plain Node and `assert`. No test framework — the suites are standalone scripts
that exit non-zero on failure.

```bash
npm run test:ssrf     # 50 unit assertions + 8 end-to-end proxy cases
npm run emulators     # terminal 1 — Firestore :8080, Storage :9199
npm run test:rules    # terminal 2 — 14 rules checks
```

| Suite | Coverage | Needs a running service |
| --- | --- | --- |
| `server/ssrf-guard.test.js` | 34 block cases, 7 allow cases, 5 redirect cases, 4 classifier checks | No |
| `server/proxy.integration.test.js` | Real Express app returns 400 for metadata, loopback, RFC1918, `file://`, and mapped-loopback targets | No |
| `scripts/rules.test.mjs` | 14 checks driving Firestore and Storage rules through their REST surface | **Yes — Firebase emulators** |

> **Note on `server/package.json`.** Its `test` script is a failing placeholder.
> Run the suites from the repository root with `npm run test:ssrf`.

> **Note on `npm run test:rules`.** It requires Java and the Firebase emulators.
> Without them the suite exits with `0/14 rules checks passed` and a fetch
> error — that is a missing service, not a rules regression.

> **Note on formatting.** `npm run format` ends in `|| true` by design, so it
> never fails a CI run.

---

## Known gaps

Documented honestly rather than hidden. These are all confirmed by reading the
current code.

### Dead code

- `Premium.jsx`, `PaymentSuccess.jsx`, and `PaymentCancel.jsx` have **zero
  importers**. There is no billing, subscription, or paywall in this project.
- `EnvironmentLoader.jsx` and `src/config/adminPassword.js` are unreferenced.
- `ModelViewer.jsx` is imported but never rendered, which leaves `GalleryUI`'s
  clip, playback, environment, and file-load props permanently inert.
- `studios.js`, `experienceZones.js`, and `mangaEvolution.js` point at
  `/assets/...` paths that do not ship. The only real asset is
  `public/models/hero.glb`.
- Unused dependencies: `@uiball/loaders`, `howler`, `react-lottie`.
- The Gallery sort option "RECENT" falls through to a no-op comparator.
- `WatchAnime.jsx` imports `SkeletonLoader` but renders its own spinner.

### Bugs

- **Static Museum exhibits collapse into one group.** `Museum.jsx` groups by
  `char.anime`, but the static data uses `animeTitle`, so everything lands in
  "Other". `Gallery.jsx` already handles both fields.
- **`Gallery.jsx` treats any signed-in user as an admin** — it should check the
  `admin` claim. Writes are still correctly rejected by the rules layer, so this
  is a UI-leak, not an authorisation hole.
- **Deleting a model leaves the Storage object behind**, with a TODO.
  `.gltf` uploads are also saved as `models/<id>.glb`.
- `AnimeDetail.jsx` fetches recommendations and never renders them.

### Not built

No user accounts, favourites, watchlist, or watch progress. No PWA manifest, no
analytics, and no error boundary above `main`. `dev:all` starts a Consumet
process the backend does not use, and the Vite dev proxy still forwards a
`/api/proxy` path the client stopped calling.

---

## Tech stack

**Frontend** — React 18.3, Vite 5, Tailwind CSS, GSAP, `three@0.160` with
`@react-three/fiber` and `@react-three/drei`, `hls.js`, Firebase 12 (Auth,
Firestore, Storage).

**Backend** — Express, axios, `@consumet/extensions`.

**Data** — AniList GraphQL, Consumet, AnimePahe.

**Deliberately absent** — TypeScript, a routing library, a state manager, a test
framework, and a linter. Prettier is configured but not enforced.

---

## Troubleshooting

**Backend logs `503`.** Expected on a cold start. The server retries provider
initialisation every 5 seconds; give it ~13 seconds.

**Episodes won't load.** Check `npm run dev:server` is up on port 3001, then
check the browser console for `JS_ANIMEPAHE_ERROR`. If the backend is down the
client should fall back to public mirrors — if that also fails, the mirrors may
be offline, since they are third-party and rotate without notice.

**`npm run test:rules` reports `0/14`.** The emulators are not running. Start
them with `npm run emulators` in another terminal.

**Blank screen after navigating.** Check the console. Each route has its own
error boundary that offers "Try again" — a genuine crash will say which hall
failed.

**The mouse does nothing in the Museum.** Click the canvas to capture the
pointer. `WASD` to move, `Shift` to sprint, `Esc` to release.

**Admin login rejected.** Verify the claim was actually minted with
`scripts/set-admin-claim.mjs`, and that `firestore.rules` and `storage.rules` are
deployed with `firebase deploy --only firestore:rules,storage`.

**Port already in use.** Vite picks the next free port automatically; set `PORT`
for the backend.

---

## Disclaimer

For educational use. All anime content comes from third-party providers —
support the official releases.

---

## Acknowledgments

- [AniList](https://anilist.co/) — GraphQL metadata API
- [Consumet](https://github.com/consumet/consumet.ts) — streaming aggregation
- [AnimePahe](https://animepahe.com/) — episode sources
- [three.js](https://threejs.org/), [drei](https://github.com/pmndrs/drei), and
  [GSAP](https://gsap.com/) — 3D and motion

---

MIT © [namann5](https://github.com/namann5)