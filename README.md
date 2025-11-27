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

### 🚀 Deployment

This project is optimized for **Vercel**:
```bash
vercel deploy
```
Or simply connect your GitHub repo for **automatic builds and previews**.

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
- Clients should respect `Retry-After` headers on `503`/`429` responses and implement exponential backoff to avoid repeated expensive verification or storage attempts.

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
