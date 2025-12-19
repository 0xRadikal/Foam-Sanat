<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,50:06b6d4,100:16a34a&height=200&section=header&text=Foam%20Sanat%20Industrial%20Group%20🏭&fontSize=42&fontColor=ffffff&animation=twinkling&fontAlignY=38" width="100%" />
</p>

<h2 align="center">⚙️ Official Website — Next.js 14 + TypeScript + TailwindCSS</h2>

<p align="center">
  <a href="https://foamsanat.com"><img src="https://img.shields.io/badge/Website-FoamSanat.com-06b6d4?logo=vercel&logoColor=white"/></a>
  <a href="https://github.com/0xradikal"><img src="https://img.shields.io/badge/Author-0xradikal-7c3aed?logo=github&logoColor=white"/></a>
  <a href="mailto:info@foamsanat.com"><img src="https://img.shields.io/badge/Contact-info@foamsanat.com-16a34a?logo=gmail&logoColor=white"/></a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&size=20&duration=2800&pause=1200&color=06B6D4&center=true&vCenter=true&width=520&lines=Official+website+of+Foam+Sanat;Next.js+14+%2B+TailwindCSS+%2B+TypeScript;Bilingual+(Persian%2FEnglish)+UX;SEO+%2B+JSON-LD+Schema+%2B+Core+Web+Vitals" />
</p>

---

### 🧠 About

**Foam Sanat Industrial Group** is a leading Iranian manufacturer of **polyurethane foam injection machinery**. This repository contains its **official bilingual website**, built with **Next.js 14, TypeScript, TailwindCSS**, and **App Router architecture**, deployed on **Vercel**.

> The website integrates advanced SEO, structured data (JSON-LD), OpenGraph, and Twitter metadata — designed for speed, accessibility, and clarity.

---

### 🧩 Core Features

| Feature | Description |
|----------|-------------|
| 🌍 **Bilingual (FA / EN)** | Seamless dual-language UX with RTL/LTR support |
| ⚡ **Next.js 14 App Router** | Modern file-based routing and server components |
| 💅 **TailwindCSS** | Clean, scalable, responsive design system |
| 🧠 **TypeScript** | Strongly typed code for reliability |
| 🔍 **SEO Optimization** | JSON-LD, OpenGraph, Canonical URLs |
| 🌗 **Dark / Light Mode** | Theme toggle with animations |
| 🚀 **Vercel Deployment** | Optimized CI/CD hosting |

---

### 🧭 Navigation System

- Single source of truth powered by `app/lib/navigation-config.ts` for Home, Products, and About pages
- Shared helper API ensures consistent labels, href resolution, and button styling across every header

---

### 🧱 Tech Stack

```text
Framework:   Next.js 14 (App Router)
Language:    TypeScript
Styling:     TailwindCSS
SEO:         JSON-LD Schema, OpenGraph, Twitter Cards
Hosting:     Vercel
Icons:       Lucide React
```

---

### ⚙️ Installation

```bash
git clone https://github.com/0xradikal/foamsanat.git
cd foamsanat
npm install
npm run dev
```
Then open 👉 [http://localhost:3000](http://localhost:3000)

---

### 🛡️ Admin Panel & Database

The `/admin` panel is a protected Next.js App Router experience for internal admins (superadmin/admin/editor) to manage products, categories, inbox (comments + contact messages), and admin accounts.

- **Auth:** NextAuth credentials with bcrypt hashing and JWT sessions. Middleware enforces RBAC and sets a per-session CSRF cookie (`admin-csrf`) required on all `/api/admin` mutations.
- **Database:** Prisma + PostgreSQL (prod) with optional SQLite for local development. Schema lives in `prisma/schema.prisma` with SQL migration in `prisma/migrations/0001_init/migration.sql`.
- **Seed:** Create the first superadmin via env vars and the seed script.

#### Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (or SQLite file for local dev) |
| `AUTH_SECRET` | NextAuth secret for signing/encrypting JWT cookies |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Credentials for the initial superadmin |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `ADMIN_EMAIL_SENDER` | Optional email delivery for inbox replies |

Existing public-site variables (GA, GTM, Turnstile, etc.) remain unchanged; see `env.config.js` for the full matrix.

#### Database & seed

```bash
# generate Prisma client
npm run db:generate

# apply SQL migration (deploy safe for prod)
npm run db:migrate

# seed first superadmin (reads ADMIN_SEED_EMAIL/PASSWORD)
npm run db:seed
```

#### Running the admin panel locally

```bash
# start dev server
npm run dev

# sign in at
open http://localhost:3000/admin/login
```

Access control:
- **superadmin:** full permissions + manage admins + hard delete products
- **admin:** manage content/inbox (no admin management, no hard delete)
- **editor:** create/edit products, reply to inbox, cannot hard delete or manage admins

---

### 🚀 Deployment

This project is optimized for **Vercel**:
```bash
vercel deploy
```
Or simply connect your GitHub repo for **automatic builds and previews**.

#### Preview accessibility & performance gates
- Pull requests are gated by automated **Axe** (a11y) and **Lighthouse** (performance/SEO/best-practices) checks.
- Set `PREVIEW_URL` (or `VERCEL_BRANCH_URL`/`DEPLOYMENT_URL`) in CI so audits run against the active preview build.
- Thresholds: performance ≥ **0.90**, accessibility ≥ **0.98**, SEO ≥ **0.92**, best-practices ≥ **0.92**.
- Reports are saved to `reports/axe/axe-report.json` and `reports/lighthouse/preview.report.{json,html}` for download from CI artifacts.

#### Preview UI smoke tests
- Run `npm run preview:e2e` with `PREVIEW_URL` (or `DEPLOYMENT_URL`/`VERCEL_BRANCH_URL`) pointing at a live preview.
- Playwright scripts cover FA/EN locale toggling, navigation, and end-to-end comment submission in the product modal.
- CI workflow **Preview E2E** (manual/scheduled) provisions Chromium via Playwright and fails early when no preview URL is configured.

---

### 💬 Comment API & Moderation

Product reviews are served through REST endpoints under `/api/comments`:

- `GET /api/comments?productId=...` returns approved comments for a product.
- `POST /api/comments` submits a comment that enters the moderation queue with spam/rate-limit protection.
- Admin-only routes (`DELETE /api/comments/:id`, `PATCH /api/comments/:id`, `POST /api/comments/:id/replies`) require a bearer token.

**Storage + rate limiting**

- By default, comments are stored in a local SQLite database at `app/api/comments/data/comments.db`.
- On read-only hosts (e.g. serverless without persistent disks) set `COMMENTS_DATABASE_URL` or `DATABASE_URL` to point to a writable SQLite/SQL path; otherwise the API returns `503` to avoid data loss.
- Rate limiting uses Redis when `RATE_LIMIT_REDIS_URL`/`REDIS_URL` is present; otherwise an in-memory limiter is used for development.
- When the API responds with `Retry-After` (storage offline, CAPTCHA verification unavailable, or rate limits), clients should back off exponentially (e.g. start at 30s, double each retry up to 5m) before retrying to avoid hammering expensive upstream services.

Set the moderation token in your environment before starting the app:

```bash
export COMMENTS_ADMIN_TOKEN="super-secure-token"
```

Use the same token in the product modal's moderation panel to delete comments or send official replies.

---

### 🔎 SEO & Schema Integration
- `Organization` schema for company info
- `FAQPage` schema for customer questions
- `Product` schema for PU injection machines
- Verified metadata for Google, Yandex, and social previews

All schemas injected dynamically via `<Script type="application/ld+json">`.

---

### 🧪 Tests

Minimal validation and RBAC checks run via **Vitest**:

```bash
npm test
```

---

### 📸 Screenshots

| Light Mode | Dark Mode |
|-------------|------------|
| ![Light Mode](public/og-image.jpg) | ![Dark Mode](public/twitter-image.jpg) |

---

### 🧾 License

© 2025 **Foam Sanat Industrial Group** — All Rights Reserved.  
This project is **proprietary**. Unauthorized copying or redistribution is prohibited.

---

### 👤 Developer

**Mohammad Shirvani (Radikal)**  
Web3 Researcher • Security Engineer • Frontend Developer  
🌐 [radikal.eth](https://radikal.eth) | [GitHub](https://github.com/0xradikal) | [X](https://x.com/0xradikal)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,100:7c3aed&height=120&section=footer&animation=twinkling" width="100%" />
</p>
