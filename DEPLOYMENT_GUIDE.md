# 🚀 Deployment Guide - Vercel

This guide will help you deploy your Diamond Store to Vercel and share it with friends.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free)
2. A [GitHub account](https://github.com/signup) (free)
3. Your database hosted online (Neon/Supabase/PlanetScale)

---

## Step 1: Prepare Your Environment Variables

Create a file called `.env.production` with your production values:

```bash
# Database
DATABASE_URL="your-production-database-url"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# App URLs
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_API_URL="https://your-app.vercel.app"

# Stripe (Production keys)
STRIPE_SECRET_KEY="your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Email (if using SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Google OAuth (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Apple OAuth (if using)
APPLE_ID="your-apple-id"
APPLE_SECRET="your-apple-secret"
```

---

## Step 2: Push to GitHub

### Option A: Using Git Commands

```bash
# Navigate to your project
cd /Users/av/diamonds/diamonds

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/diamond-store.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Open the app and add your repository
3. Commit and push your changes

---

## Step 3: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Easiest)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" and choose "Continue with GitHub"

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your `diamond-store` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (use `https://your-project-name.vercel.app`)
     - `NEXT_PUBLIC_APP_URL`
     - `STRIPE_SECRET_KEY`
     - etc.

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site is live! 🎉

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (choose your account)
# - Link to existing project? N
# - What's your project name? diamond-store
# - In which directory is your code? ./
# - Override settings? N

# Deploy to production
vercel --prod
```

---

## Step 4: Run Database Migrations

After deployment, run migrations on your production database:

```bash
# Set DATABASE_URL to your production database
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Seed the database (optional)
DATABASE_URL="your-production-db-url" npx tsx prisma/seed.ts
```

---

## Step 5: Configure Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `diamondstore.com`)
4. Follow DNS instructions provided by Vercel
5. Wait for SSL certificate to be issued (automatic)

---

## Step 6: Share Your Website

Your website is now live at:
- **Vercel URL**: `https://your-project-name.vercel.app`
- **Custom Domain** (if configured): `https://yourdomain.com`

Share this URL with your friends!

---

## Important Post-Deployment Steps

### 1. Update Stripe Webhooks
- Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
- Add new webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
- Select events: `checkout.session.completed`, `payment_intent.succeeded`
- Copy webhook signing secret to environment variables

### 2. Update OAuth Redirect URLs

**Google OAuth:**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

**Apple OAuth:**
- Go to [Apple Developer](https://developer.apple.com)
- Add return URL: `https://your-app.vercel.app/api/auth/callback/apple`

### 3. Test Your Deployment
- [ ] Test user registration
- [ ] Test email verification
- [ ] Test product browsing
- [ ] Test checkout flow
- [ ] Test admin panel

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Database Connection Issues
- Ensure DATABASE_URL is correct
- Check if your database allows connections from Vercel IPs
- For Neon: Enable "Pooling" connection string

### 404 Errors
- Make sure all pages are in `src/app/` directory
- Check file naming (lowercase vs uppercase)
- Verify routes in `next.config.ts`

### Environment Variables Not Working
- Variables starting with `NEXT_PUBLIC_` are exposed to browser
- Redeploy after changing environment variables
- Check variable names (case-sensitive)

---

## Continuous Deployment

Once connected to GitHub, every push to `main` branch will automatically deploy to production!

```bash
# Make changes locally
git add .
git commit -m "Update homepage"
git push

# Vercel automatically deploys! 🚀
```

---

## Monitoring & Analytics

1. **Vercel Analytics**
   - Go to your project → Analytics tab
   - View page views, performance metrics

2. **Vercel Logs**
   - Go to your project → Logs tab
   - View real-time application logs

3. **Speed Insights**
   - Enable Speed Insights in project settings
   - Monitor Core Web Vitals

---

## Cost Considerations

**Vercel Free Tier includes:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Analytics

**Neon Free Tier includes:**
- ✅ 0.5GB storage
- ✅ 10GB data transfer/month
- ✅ Branching and point-in-time restore

**Upgrade if needed:**
- More bandwidth: Vercel Pro ($20/month)
- More database: Neon Pro ($19/month)

---

## Quick Reference Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Promote preview to production
vercel promote

# Rollback to previous deployment
vercel rollback

# Remove deployment
vercel remove
```

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

🎉 **Congratulations!** Your Diamond Store is now live and accessible worldwide!