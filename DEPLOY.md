# 🚀 Soundwave — Vercel Deployment Guide

Complete step-by-step guide to deploy Soundwave to production on Vercel.

---

## Architecture on Vercel

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL PLATFORM                    │
│                                                      │
│   ┌──────────────────────────────────────────────┐  │
│   │   Next.js App (frontend/)                    │  │
│   │   ├── Pages & UI (React)                     │  │
│   │   ├── /api/* → Serverless Functions          │  │
│   │   │   ├── /api/auth/*  (JWT auth)            │  │
│   │   │   ├── /api/albums/* (CRUD)               │  │
│   │   │   ├── /api/tracks/* (streaming)          │  │
│   │   │   ├── /api/subscriptions/* (Stripe)      │  │
│   │   │   ├── /api/webhooks (Stripe events)      │  │
│   │   │   └── /api/upload/* (Vercel Blob)        │  │
│   │   └── Prisma ORM (w/ connection pooling)     │  │
│   └──────────────────────────────────────────────┘  │
│                                                      │
│   ┌──────────────┐  ┌────────────┐  ┌────────────┐  │
│   │ Vercel       │  │ Vercel     │  │  Vercel    │  │
│   │ Postgres     │  │ Blob       │  │  KV        │  │
│   │ (Neon DB)    │  │ (CDN files)│  │  (Redis)   │  │
│   └──────────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────┘

External services:
  ├── Stripe (billing & webhooks)
  └── GitHub (source + CI/CD)
```

---

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free tier works)
- [GitHub account](https://github.com) (for source + CI/CD)
- [Stripe account](https://stripe.com) (test mode is fine to start)
- [Node.js 20+](https://nodejs.org) on your machine
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

---

## Step 1 — Push to GitHub

```bash
cd soundwave

# Initialize git (if not already)
git init
git add .
git commit -m "feat: initial Soundwave commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/soundwave.git
git push -u origin main
```

---

## Step 2 — Create Vercel Project

### Option A: Vercel Dashboard (recommended for first deploy)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select your `soundwave` repo
3. Configure the project:
   - **Framework Preset:** Next.js ✓ (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `.next` (auto)
4. Click **Deploy** (will fail — environment variables not set yet, that's OK)

### Option B: CLI

```bash
cd soundwave
vercel link          # follow prompts to link/create project
vercel env pull      # (optional) pull any existing env vars
```

---

## Step 3 — Set Up Vercel Postgres

1. In your Vercel project dashboard → **Storage** tab → **Connect Store**
2. Click **Create New → Postgres**
3. Name it `soundwave-db`, select a region close to you
4. Click **Create & Continue**
5. Vercel auto-adds these env vars to your project:
   - `POSTGRES_PRISMA_URL` — used by Prisma at runtime (pgBouncer pooled)
   - `POSTGRES_URL_NON_POOLING` — used by Prisma migrations (direct)
   - `POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_DATABASE`

---

## Step 4 — Set Up Vercel Blob

1. In project dashboard → **Storage** → **Connect Store**
2. Click **Create New → Blob**
3. Name it `soundwave-media`
4. Click **Create**
5. Vercel auto-adds: `BLOB_READ_WRITE_TOKEN`

---

## Step 5 — Configure Stripe

### Get your keys
1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Enable **Test Mode** (toggle top-right)
3. Go to **Developers → API keys**
   - Copy **Secret key** → `sk_test_...`
   - Copy **Publishable key** → `pk_test_...`

### Create subscription products
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Create products and prices (run these commands)
stripe products create --name="Soundwave Premium" --description="Full access"
# Copy the product ID (prod_...)

stripe prices create \
  --product=prod_XXXXXX \
  --currency=usd \
  --unit-amount=999 \
  --recurring[interval]=month \
  --nickname="Premium Monthly"
# Copy price ID → price_premium_monthly

stripe prices create \
  --product=prod_XXXXXX \
  --currency=usd \
  --unit-amount=9990 \
  --recurring[interval]=year \
  --nickname="Premium Annual"
# Copy price ID → price_premium_annual

# Repeat for Family ($15.99/mo) and Student ($4.99/mo)
```

### Set up Stripe Webhook

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://YOUR-APP.vercel.app/api/webhooks`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`)

---

## Step 6 — Add Environment Variables to Vercel

In Vercel project → **Settings → Environment Variables**, add:

| Variable | Value | Environments |
|---|---|---|
| `JWT_SECRET` | `openssl rand -base64 64` output | All |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` output (different!) | All |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | All |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | All |
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_...` or `pk_live_...` | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

> **Note:** `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, and `BLOB_READ_WRITE_TOKEN` are added automatically by Vercel Storage in Step 3 & 4.

### Generate secure secrets (run locally):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# Run twice — once for JWT_SECRET, once for JWT_REFRESH_SECRET
```

---

## Step 7 — Run Database Migrations

```bash
cd frontend

# Pull environment variables from Vercel to local .env
vercel env pull .env.local

# Run Prisma migrations against the Vercel Postgres database
npx prisma migrate deploy

# Seed demo data (optional)
npx tsx prisma/seed.ts
```

---

## Step 8 — Update Prisma Seed with Real Stripe Price IDs

Open `frontend/prisma/seed.ts` and replace the placeholder `stripePriceId` values with the real ones you got from Stripe in Step 5:

```typescript
// Example — update these with your actual Stripe price IDs:
{ stripePriceId: "price_1OzXXXXXXXXXX" },  // Premium Monthly
{ stripePriceId: "price_1OzXXXXXXXXXX" },  // Premium Annual
```

Then re-run the seed: `npx tsx prisma/seed.ts`

---

## Step 9 — Deploy

### Trigger via Git (recommended)
```bash
git add .
git commit -m "feat: add vercel deployment config"
git push origin main
# Vercel auto-deploys on push to main ✓
```

### Or deploy manually via CLI
```bash
vercel --prod
```

---

## Step 10 — Verify Deployment

After deployment, test these endpoints:

```bash
BASE=https://your-app.vercel.app

# Health check
curl $BASE/api/genres

# Register user
curl -X POST $BASE/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser","displayName":"Test User"}'

# Search
curl "$BASE/api/search?q=luna"

# Albums
curl "$BASE/api/albums?sort=popular&limit=5"
```

---

## Step 11 — Set Up CI/CD (GitHub Actions)

Add these GitHub repository secrets (**Settings → Secrets → Actions**):

| Secret | How to get it |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link`, check `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Same file → `projectId` |
| `POSTGRES_URL_NON_POOLING` | Vercel Dashboard → Storage → your DB → `.env.local` tab |

Now every push to `main` auto-deploys to production, and every PR gets a preview URL.

---

## Step 12 — Set Up Local Stripe Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or: https://stripe.com/docs/stripe-cli#install

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks

# In a separate terminal — trigger a test event:
stripe trigger checkout.session.completed
```

---

## Custom Domain (Optional)

1. Vercel project → **Settings → Domains**
2. Add your domain (e.g., `soundwave.app`)
3. Update DNS at your registrar with the records Vercel provides
4. Update `NEXT_PUBLIC_APP_URL` env var to `https://soundwave.app`
5. Update Stripe webhook URL to `https://soundwave.app/api/webhooks`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_PRISMA_URL` | ✅ | Vercel Postgres (pooled, for runtime) |
| `POSTGRES_URL_NON_POOLING` | ✅ | Vercel Postgres (direct, for migrations) |
| `JWT_SECRET` | ✅ | 64-char random secret for access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Different 64-char secret for refresh tokens |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_KEY` | ✅ | Stripe publishable key (`pk_test_...`) |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Vercel Blob token (auto-set) |
| `NEXT_PUBLIC_APP_URL` | ✅ | App URL (e.g., `https://soundwave.app`) |

---

## Troubleshooting

**Build fails with "prisma generate" error**
```bash
# Make sure prisma is in dependencies (not just devDependencies)
# The package.json already handles this with vercel-build script
```

**"PrismaClientInitializationError" in serverless**
- Check that `POSTGRES_PRISMA_URL` is set in Vercel env vars
- Ensure it ends with `?pgbouncer=true&connect_timeout=15`

**Stripe webhooks not received**
- Verify the webhook URL is `https://your-app.vercel.app/api/webhooks` (no trailing slash)
- Check Stripe Dashboard → Webhooks → your endpoint → Recent deliveries

**File uploads failing**
- Check `BLOB_READ_WRITE_TOKEN` is set in Vercel env vars
- Verify file size is under Vercel's 4.5MB limit for API routes
  (for larger files, use Vercel Blob's client-side upload pattern)

**"Refresh token" errors on production**
- Verify `JWT_REFRESH_SECRET` is set and is different from `JWT_SECRET`

---

## Cost Estimate (Vercel hobby → pro)

| Service | Free Tier | Cost after |
|---|---|---|
| Vercel hosting | 100GB bandwidth | $20/mo (Pro) |
| Vercel Postgres | 256MB, 60 compute hrs | $0.10/GB-month |
| Vercel Blob | 500MB storage | $0.023/GB-month |
| Stripe | No monthly fee | 2.9% + 30¢ per transaction |

For most early-stage apps, **free tier is sufficient** to launch.
