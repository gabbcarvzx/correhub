# Production Checklist — CorreHub

## Pre-Deploy

### Environment
- [ ] `AUTH_SECRET` set to 64+ char random value (run `openssl rand -base64 64`)
- [ ] `DATABASE_URL` pointing to production Supabase pooler
- [ ] `DIRECT_URL` pointing to production Supabase direct connection
- [ ] `NODE_ENV=production` set
- [ ] `AUTH_URL` set to production URL
- [ ] `AUTH_TRUST_HOST=1` if behind reverse proxy
- [ ] All secrets removed from `.env` — only use environment variables

### Database
- [ ] Run `prisma migrate deploy` (not `dev`)
- [ ] Run Supabase RLS migrations
- [ ] Verify all tables have RLS enabled (`FORCE ROW LEVEL SECURITY`)
- [ ] Verify no `using (true)` policies remain
- [ ] Database backups configured (daily minimum)

### Authentication
- [ ] Google OAuth credentials configured for production domain
- [ ] Demo users disabled/removed in production
- [ ] Rate limiting enabled with production thresholds
- [ ] Session maxAge set to 24h (production)

### Security
- [ ] Input validation (Zod) on all API routes
- [ ] Rate limiting on all public endpoints
- [ ] CORS configured for production domain only
- [ ] Security headers added (CSP, HSTS, X-Frame-Options)
- [ ] CSRF protection enabled (NextAuth built-in)
- [ ] No sensitive data in client-side code

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Structured logging enabled
- [ ] Health check endpoint available
- [ ] Database query monitoring active

### Build
- [ ] `next build` succeeds with no errors
- [ ] Bundle size optimized
- [ ] TypeScript strict mode passes
- [ ] All tests pass: `npm test`
- [ ] Lint passes: `npm run lint`

## Post-Deploy

- [ ] Smoke test all critical flows:
  - [ ] User registration
  - [ ] Login (credentials + OAuth)
  - [ ] Event listing
  - [ ] Attendance confirmation
  - [ ] Check-in
  - [ ] Admin moderation
- [ ] Verify RLS policies with test queries
- [ ] Check rate limiting with test requests
- [ ] Monitor error rates for first 24h
