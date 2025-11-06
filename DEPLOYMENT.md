# 🚀 Deployment Guide - Foam Sanat Website

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create production `.env.local` file
- [ ] Add Google Analytics ID
- [ ] Verify contact information
- [ ] Test all environment variables locally

### 2. Code Quality
```bash
# Run all checks before deployment
npm run lint           # ESLint validation
npm run type-check     # TypeScript checks
npm run build          # Test production build
npm run lighthouse     # Performance audit
npm run axe            # Accessibility check
```

### 3. Content Verification
- [ ] All text translations (FA/EN) complete
- [ ] Contact info matches business details
- [ ] Images optimized (WebP format recommended)
- [ ] Logo and favicon in place
- [ ] OpenGraph images (1200x630px)

---

## 🌟 Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ **Zero-config deployment**
- ✅ **Automatic HTTPS/SSL**
- ✅ **Global CDN**
- ✅ **Edge Functions**
- ✅ **Analytics built-in**
- ✅ **Preview deployments**

### Step-by-Step

#### Method A: GitHub Integration (Best)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - Foam Sanat website"
git branch -M main
git remote add origin https://github.com/yourusername/foamsanat.git
git push -u origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel auto-detects Next.js

3. **Configure Environment Variables**
In Vercel Dashboard → Project Settings → Environment Variables:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://foamsanat.com
NEXT_PUBLIC_CONTACT_PHONE=+989197302064
NEXT_PUBLIC_CONTACT_EMAIL=info@foamsanat.com
```

4. **Deploy**
- Click "Deploy"
- Wait ~2 minutes
- Get your live URL: `https://foamsanat.vercel.app`

5. **Custom Domain**
- Project Settings → Domains
- Add `foamsanat.com` and `www.foamsanat.com`
- Update DNS records as instructed:
  ```
  Type: A
  Name: @
  Value: 76.76.21.21
  
  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  ```

#### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

---

## 🐳 Option 2: Docker Deployment

### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t foamsanat:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX" \
  -e NEXT_PUBLIC_SITE_URL="https://foamsanat.com" \
  -e NEXT_PUBLIC_CONTACT_PHONE="+989197302064" \
  -e NEXT_PUBLIC_CONTACT_EMAIL="info@foamsanat.com" \
  foamsanat:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  web:
    image: foamsanat:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
      - NEXT_PUBLIC_SITE_URL=https://foamsanat.com
      - NEXT_PUBLIC_CONTACT_PHONE=+989197302064
      - NEXT_PUBLIC_CONTACT_EMAIL=info@foamsanat.com
    restart: unless-stopped
```

---

## ☁️ Option 3: VPS/Cloud Server

### Requirements
- Ubuntu 22.04 LTS or similar
- Nginx
- Node.js 18+
- SSL certificate (Let's Encrypt)

### Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone and setup
git clone https://github.com/yourusername/foamsanat.git /var/www/foamsanat
cd /var/www/foamsanat
npm install
npm run build

# Start with PM2
pm2 start npm --name "foamsanat" -- start
pm2 save
pm2 startup

# Install Nginx
sudo apt install nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/foamsanat
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name foamsanat.com www.foamsanat.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/foamsanat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d foamsanat.com -d www.foamsanat.com
```

---

## 🔒 SSL/HTTPS Setup

### Vercel (Automatic)
- SSL is automatic with Vercel
- HTTPS enforced by default

### Let's Encrypt (Manual)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d foamsanat.com -d www.foamsanat.com

# Auto-renewal (should be automatic)
sudo certbot renew --dry-run
```

---

## 📊 Post-Deployment Setup

### 1. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://foamsanat.com`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://foamsanat.com/sitemap.xml`

### 2. Google Analytics

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (G-XXXXXXXXX)
3. Add to environment variables
4. Redeploy

### 3. Performance Monitoring

```bash
# Test production site
lighthouse https://foamsanat.com --view

# Check mobile performance
lighthouse https://foamsanat.com --preset=mobile --view
```

### 4. SEO Verification

- Check robots.txt: `https://foamsanat.com/robots.txt`
- Check sitemap: `https://foamsanat.com/sitemap.xml`
- Test structured data: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: |
          npm run lint
          npm run type-check
          npm run build
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🆘 Troubleshooting

### Build Failures

**Error:** `ENOENT: no such file or directory`
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Error:** `Module not found`
```bash
# Check TypeScript paths
npm run type-check
```

### Performance Issues

**Slow loading:**
1. Check image optimization (use Next/Image)
2. Enable Gzip compression
3. Use CDN (Vercel automatic)
4. Minimize JavaScript bundles

**High CLS (Layout Shift):**
1. Add width/height to images
2. Reserve space for dynamic content
3. Use font-display: swap

### SSL/HTTPS Issues

**Mixed content warnings:**
- Ensure all resources use HTTPS
- Check external scripts/images
- Update environment NEXT_PUBLIC_SITE_URL

---

## 📞 Support

**Deployment Issues:**
- Vercel Status: [vercel-status.com](https://www.vercel-status.com)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

**Technical Support:**
- Email: info@foamsanat.com
- Developer: [@0xradikal](https://github.com/0xradikal)

---

**Last Updated:** January 2025  
**Next Review:** Before major version updates