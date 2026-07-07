# Deploy Plan — CorreHub

## Platform
Deploy to Vercel (recommended for Next.js) or Railway.

### Prerequisites
- Production Supabase project
- Vercel project linked to GitHub repository
- All environment variables set in Vercel dashboard

## Deployment Steps

### 1. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Apply migrations (NOT migrate dev)
npx prisma migrate deploy

# Apply Supabase RLS migrations
# Run through Supabase dashboard SQL editor
```

### 2. Build & Deploy
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy via Railway
railway up
```

### 3. Post-Deploy Verification
- Check Vercel deployment logs for errors
- Verify all pages load correctly
- Test authentication flow
- Test database connectivity
- Check Supabase pooler connection

### 4. DNS Configuration
- Point domain to Vercel nameservers
- Configure SSL (automatic with Vercel)
- Set up custom domain in Vercel dashboard

### 5. Monitoring Setup
- Enable Vercel Analytics
- Configure Sentry error tracking
- Set up uptime monitoring (e.g., Better Uptime)
