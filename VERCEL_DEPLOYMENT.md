# Vercel Deployment Guide

## Prerequisites
- Vercel account (free or paid) at https://vercel.com
- GitHub repository connected (already done: https://github.com/fahim-mohammad/Steps-Website)

## Deployment Steps

### Option 1: Vercel Web Dashboard (Recommended for First-Time)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Steps-Website"** repository from GitHub
4. In **"Environment Variables"**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `BREVO_API_KEY`: Your Brevo (Sendinblue) API key (if email notifications enabled)
   - `WHATSAPP_API_TOKEN`: Your Meta WhatsApp API token (if WhatsApp notifications enabled)
   - `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Business Phone Number ID

5. Click **"Deploy"**
6. Wait for build to complete (~2-3 minutes)

### Option 2: Vercel CLI (For Advanced Users)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd "/Users/apple/Downloads/Steps website "
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... repeat for other variables

# Redeploy with env vars
vercel --prod
```

## Environment Variables Reference

Find these values in:

1. **Supabase** (https://supabase.com/dashboard):
   - Project Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` → `SUPABASE_SERVICE_KEY`

2. **Brevo** (https://app.brevo.com):
   - Settings → API Keys
   - Copy API Key → `BREVO_API_KEY`

3. **Meta WhatsApp Business** (https://developers.facebook.com):
   - App Settings → Messenger
   - Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
   - Access Token → `WHATSAPP_API_TOKEN`

## Post-Deployment

1. Visit your deployed URL (e.g., `https://steps-fund.vercel.app`)
2. Test login with demo credentials:
   - **Owner**: owner@fund.com / password
   - **Manager**: manager@fund.com / password
   - **Member**: member1@fund.com / password
3. Verify database connectivity
4. Check email notifications (if configured)

## Custom Domain

To use a custom domain:

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records at your domain registrar
4. Wait for DNS propagation (5-30 minutes)

## Troubleshooting

- **Build fails**: Check logs in Vercel Dashboard → Deployments
- **Database connection error**: Verify Supabase URLs and keys are correct
- **Email not sending**: Check Brevo API key and sender email configuration
- **Static regeneration issues**: Check ISR (Incremental Static Regeneration) settings

## Rollback

To rollback to a previous version:
1. Vercel Dashboard → Deployments
2. Find the deployment you want to rollback to
3. Click the three dots → Promote to Production

---

**Build Status**: ✅ Ready for Deployment
**Latest Commit**: 8f01f6e (Add .vercelignore for Vercel deployment)
