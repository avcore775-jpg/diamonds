# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Copy these to your Vercel project settings → Environment Variables:

```bash
# Database (Get from your .env file)
DATABASE_URL="your_database_url_with_pgbouncer=true&connect_timeout=10"

# NextAuth
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXTAUTH_SECRET="your_nextauth_secret_from_env_file"

# Email (Resend - Get from your .env file)
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="onboarding@resend.dev"
EMAIL_FROM="Luxe Diamonds <onboarding@resend.dev>"

# JWT (Get from your .env file)
JWT_SECRET="your_jwt_secret_from_env_file"

# App URLs (update with your actual Vercel domain)
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-vercel-domain.vercel.app"

# Stripe (Get these from your .env file - DO NOT commit actual secrets)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"
```

## Important Notes:

1. **NEXTAUTH_URL**: Replace `your-vercel-domain.vercel.app` with your actual Vercel domain
2. **NEXT_PUBLIC_APP_URL**: Same as NEXTAUTH_URL
3. **NEXT_PUBLIC_API_URL**: Same as NEXTAUTH_URL
4. **DATABASE_URL**: Uses pgbouncer for connection pooling - DO NOT CHANGE

## After Adding Environment Variables:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click "Redeploy" on the latest deployment
3. The build will run the seed script and populate the database with 26 products
