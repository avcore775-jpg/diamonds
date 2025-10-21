# Git Setup Guide for Diamond Store

## ✅ Git is Already Installed!

You have Git version 2.45.2 installed on your system.

---

## 🔧 Step 1: Configure Your Git Identity

I've temporarily set placeholder values. **Please replace them with your real information:**

```bash
# Set your real name
git config --global user.name "Your Real Name"

# Set your real email (use the same email as your GitHub account)
git config --global user.email "youremail@example.com"
```

### Check Your Current Configuration:
```bash
git config --global user.name
git config --global user.email
```

---

## 📦 Step 2: Initialize Your Repository (Already Done!)

Your project already has Git initialized. You can check the status:

```bash
cd /Users/av/diamonds/diamonds
git status
```

---

## 🚀 Step 3: Push to GitHub

### Option A: Using GitHub Desktop (Easiest for Beginners)

1. **Download GitHub Desktop**
   - Go to https://desktop.github.com/
   - Download and install

2. **Add Your Repository**
   - Open GitHub Desktop
   - Click "Add" → "Add Existing Repository"
   - Choose `/Users/av/diamonds/diamonds`

3. **Publish to GitHub**
   - Click "Publish repository"
   - Choose a name: `diamond-store`
   - Click "Publish repository"

### Option B: Using Command Line

1. **Create a GitHub Account**
   - Go to https://github.com/signup
   - Create a free account

2. **Create a New Repository on GitHub**
   - Go to https://github.com/new
   - Repository name: `diamond-store`
   - Make it Private or Public
   - **DO NOT** initialize with README
   - Click "Create repository"

3. **Connect and Push Your Code**
   ```bash
   cd /Users/av/diamonds/diamonds

   # Add all files
   git add .

   # Create first commit
   git commit -m "Initial commit - Diamond Store E-commerce"

   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/diamond-store.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Step 4: Deploy to Vercel

### Using Vercel Website (Recommended)

1. **Sign Up for Vercel**
   - Go to https://vercel.com/signup
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find your `diamond-store` repository
   - Click "Import"

3. **Configure Environment Variables**

   Add these in the Vercel dashboard:

   ```bash
   # Database
   DATABASE_URL=your-neon-database-url

   # Authentication
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   NEXTAUTH_URL=https://your-project.vercel.app

   # App URLs
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   NEXT_PUBLIC_API_URL=https://your-project.vercel.app

   # Stripe (get from https://dashboard.stripe.com)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

   # Email (optional - if using SendGrid)
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live! 🎉

---

## 🗄️ Step 5: Setup Production Database

### Using Neon (Recommended - Free Tier)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up with GitHub
   - Create a new project: "diamond-store-prod"

2. **Get Connection String**
   - Copy the connection string from dashboard
   - Should look like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

3. **Add to Vercel**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` with your Neon connection string

4. **Run Migrations**
   ```bash
   # Set DATABASE_URL to production database
   DATABASE_URL="your-neon-url" npx prisma migrate deploy

   # Seed the database
   DATABASE_URL="your-neon-url" npx tsx prisma/seed.ts
   ```

---

## 🔑 Generate Required Secrets

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

Copy the output and add it to Vercel environment variables.

---

## ✅ Post-Deployment Checklist

- [ ] Configure Git with your name and email
- [ ] Push code to GitHub
- [ ] Create Neon database
- [ ] Deploy to Vercel
- [ ] Add all environment variables
- [ ] Run database migrations
- [ ] Seed database with products
- [ ] Test the deployed site
- [ ] Share URL with friends!

---

## 🎯 Quick Commands Reference

```bash
# Check Git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Check current branch
git branch

# View commit history
git log --oneline
```

---

## 🆘 Need Help?

**Git Issues:**
- https://docs.github.com/en/get-started/quickstart

**Vercel Deployment:**
- https://vercel.com/docs/deployments/overview

**Next.js Deployment:**
- https://nextjs.org/docs/deployment

---

## 📧 Share Your Site

Once deployed, your URL will be:
**`https://diamond-store-[random].vercel.app`**

You can share this URL with anyone!

### Add Custom Domain (Optional)
1. Go to Vercel → Your Project → Settings → Domains
2. Add your domain (e.g., `diamondstore.com`)
3. Follow DNS instructions
4. Done! ✨

---

Good luck with your deployment! 🚀