# Environment Variables Setup for Vercel

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### 1. Authentication
- `NEXTAUTH_URL` - Your production URL (e.g., https://probative-conversation-mastery.vercel.app)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### 2. Google OAuth
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

### 3. Database (REQUIRED)
- `POSTGRES_PRISMA_URL` - Your Postgres connection string with pooling
- `POSTGRES_URL_NON_POOLING` - Your Postgres connection string without pooling

## Setting up Database

If you haven't set up a database yet:

1. Create a free PostgreSQL database at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Copy the connection strings
3. Add them to Vercel environment variables

## Verifying Setup

After adding all variables:
1. Redeploy your application
2. Check the Functions logs in Vercel dashboard if errors persist
3. Ensure Google OAuth callback URL is set to: `https://your-app.vercel.app/api/auth/callback/google`