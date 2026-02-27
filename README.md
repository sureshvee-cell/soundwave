# 🎵 Soundwave — Industry-Standard Music Streaming Platform

A full-stack, production-ready music streaming application built with the latest technologies. Artists publish albums, listeners subscribe and stream.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎵 **Music Player** | Full-featured player with play/pause, skip, shuffle, repeat, queue management, progress scrubbing, volume control |
| 💎 **Subscriptions** | Stripe-powered Free / Premium / Family / Student tiers with 7-day trial, billing portal, webhooks |
| 🎤 **Artist Dashboard** | Album publishing, track upload (S3), analytics, revenue reporting, stream charts |
| 🔍 **Discovery** | Hero banners, trending charts, new releases, genre browsing, full-text search |
| 📚 **Library** | Liked tracks/albums, playlists, recently played, followed artists |
| 🔐 **Auth** | JWT + refresh token rotation, bcrypt password hashing, role-based access (listener/artist/admin) |
| 📱 **Mobile-First** | Responsive design, bottom navigation, PWA manifest |

---

## 🏗 Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| **Next.js 14** (App Router) | SSR/SSG, routing, image optimization |
| **TypeScript** | Full type safety |
| **Tailwind CSS** | Utility-first dark theme styling |
| **Framer Motion** | Animations & transitions |
| **Zustand** | Music player global state |
| **TanStack Query** | Data fetching, caching, mutations |
| **Stripe.js** | Payment UI |

### Backend
| Tech | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access, migrations |
| **PostgreSQL** | Primary database |
| **Redis** | Caching, rate limiting |
| **Stripe** | Subscription billing, webhooks |
| **AWS S3** | Audio & image file storage |
| **JWT** | Authentication tokens |
| **Winston** | Structured logging |

### Infrastructure
| Tech | Purpose |
|---|---|
| **Docker + Compose** | Local dev & production containers |
| **GitHub Actions** | CI/CD pipeline |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Stripe account (test keys OK)
- AWS account with S3 bucket (or use local storage for dev)

### 1. Clone & install

```bash
git clone https://github.com/your-org/soundwave.git
cd soundwave

# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

**Minimum required for local dev:**
- `JWT_SECRET` — any 32+ character random string
- `JWT_REFRESH_SECRET` — different 32+ character string
- `STRIPE_SECRET_KEY` — from stripe.com dashboard (test key)
- `NEXT_PUBLIC_STRIPE_KEY` — from stripe.com dashboard (test publishable key)

### 3. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 4. Set up database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed       # (optional: seed demo data)
npx prisma studio        # (optional: browse data)
```

### 5. Start dev servers

```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

App available at: **http://localhost:3000**
API available at: **http://localhost:4000**

---

## 🐳 Production with Docker

```bash
# Build and start all services
docker compose up --build -d

# Run migrations
docker compose exec api npx prisma migrate deploy

# View logs
docker compose logs -f
```

---

## 📁 Project Structure

```
soundwave/
├── frontend/                    # Next.js 14 App
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Home / Discovery
│   │   │   ├── search/          # Search with genre browse
│   │   │   ├── album/[slug]/    # Album detail page
│   │   │   ├── artist/[slug]/   # Artist profile page
│   │   │   ├── library/         # User library
│   │   │   ├── subscribe/       # Subscription plans
│   │   │   ├── dashboard/       # Artist dashboard
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Registration page
│   │   ├── components/
│   │   │   ├── Player/          # MusicPlayer, PlayerQueue
│   │   │   ├── Layout/          # AppShell, Sidebar, TopNav, MobileNav
│   │   │   ├── Album/           # AlbumCard, AlbumGrid
│   │   │   ├── Track/           # TrackList, ChartList
│   │   │   └── UI/              # QueryProvider, shared UI
│   │   ├── context/
│   │   │   ├── player-store.ts  # Zustand player state
│   │   │   └── auth-context.tsx # Auth provider
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios API client (auto token refresh)
│   │   │   ├── utils.ts         # Formatting helpers
│   │   │   └── mock-data.ts     # Development mock data
│   │   └── types/
│   │       └── index.ts         # All TypeScript types
│   └── tailwind.config.ts       # Design system tokens
│
├── backend/                     # Express API
│   ├── prisma/
│   │   └── schema.prisma        # Full database schema
│   └── src/
│       ├── server.ts            # Express app bootstrap
│       ├── routes/
│       │   ├── auth.ts          # Register, login, refresh, me, logout
│       │   ├── albums.ts        # CRUD, publish, like/unlike, trending
│       │   ├── tracks.ts        # Stream, like, play count, charts
│       │   ├── artists.ts       # Profiles, follow, stats
│       │   ├── search.ts        # Full-text search
│       │   ├── subscriptions.ts # Stripe checkout, portal, cancel
│       │   ├── webhooks.ts      # Stripe webhook handler
│       │   ├── library.ts       # Liked, playlists, history
│       │   ├── upload.ts        # S3 file upload (audio + images)
│       │   ├── genres.ts        # Genre list
│       │   └── home.ts          # Featured, new releases
│       ├── middleware/
│       │   ├── auth.ts          # JWT verify, optional auth, role guard, premium guard
│       │   └── errorHandler.ts  # Global error handler + AppError class
│       └── config/
│           └── logger.ts        # Winston logger
│
├── docker-compose.yml           # Full stack (postgres, redis, api, frontend)
├── .env.example                 # Environment variable template
└── README.md
```

---

## 🔑 API Reference

### Authentication
```
POST /api/auth/register    — Create account
POST /api/auth/login       — Login
POST /api/auth/refresh     — Refresh access token
GET  /api/auth/me          — Get current user
POST /api/auth/logout      — Logout
```

### Albums
```
GET    /api/albums                      — List albums (filters: genre, sort, type)
GET    /api/albums/trending             — Trending albums
GET    /api/albums/new-releases         — Latest releases
GET    /api/albums/:id                  — Album detail with tracks
POST   /api/albums                      — Create album (artist only)
PATCH  /api/albums/:id                  — Update album
POST   /api/albums/:id/publish          — Publish album
POST   /api/albums/:id/like             — Like album
DELETE /api/albums/:id/like             — Unlike album
DELETE /api/albums/:id                  — Delete album
```

### Tracks
```
GET    /api/tracks/charts               — Top charts
GET    /api/tracks/:id                  — Track detail
GET    /api/tracks/:id/stream           — Get stream URL (premium check)
POST   /api/tracks/:id/play             — Record play (increments count)
POST   /api/tracks/:id/like             — Like track
DELETE /api/tracks/:id/like             — Unlike track
DELETE /api/tracks/:id                  — Delete track
```

### Subscriptions
```
GET  /api/subscriptions/plans           — List plans
GET  /api/subscriptions/current         — User's current subscription
POST /api/subscriptions/checkout        — Create Stripe checkout session
POST /api/subscriptions/portal          — Open billing portal
POST /api/subscriptions/cancel          — Cancel subscription
```

### Search
```
GET /api/search?q=query&limit=20        — Search tracks, albums, artists
```

---

## 💳 Stripe Setup

### Subscription Tiers

| Tier | Price | Stripe Price ID |
|---|---|---|
| Free | $0 | — |
| Premium | $9.99/mo | `price_premium_monthly` |
| Premium Annual | $99.90/yr | `price_premium_annual` |
| Family | $15.99/mo | `price_family_monthly` |
| Student | $4.99/mo | `price_student_monthly` |

### Webhook Events Handled
- `checkout.session.completed` — Activates subscription
- `invoice.payment_succeeded` — Renews subscription
- `invoice.payment_failed` — Sets status to PAST_DUE
- `customer.subscription.deleted` — Downgrades to FREE
- `customer.subscription.updated` — Updates tier/status

### Local Webhook Testing
```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

---

## 🎨 Design System

The dark theme uses a consistent token system defined in `tailwind.config.ts`:

- **Surfaces:** `surface-base` (#09090f) → `surface-raised` → `surface-overlay`
- **Content:** `content-primary` → `content-secondary` → `content-muted`
- **Brand:** Purple gradient (`brand-600` #7c3aed)
- **Accents:** Pink, Cyan, Green, Amber

---

## 🔒 Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens expire in 1 hour
- Refresh tokens rotate on each use
- Rate limiting on all endpoints (200 req/15min), stricter on auth (10 req/15min)
- Helmet.js security headers
- CORS restricted to configured origins
- Premium content gated behind subscription check on both frontend and backend
- File uploads validated by MIME type and size

---

## 📜 License

MIT — Build something amazing.
