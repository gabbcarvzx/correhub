# Monitoring Plan — CorreHub

## Error Tracking (Sentry)

```typescript
// src/lib/observability/sentry.ts
// Configuration for future Sentry integration:
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
  integrations: [
    // Browser profiling
    // Database query monitoring
  ]
});
```

**Setup steps:**
1. Create Sentry project
2. Set `SENTRY_DSN` in environment
3. Install `@sentry/nextjs`
4. Configure source maps upload

## Performance Monitoring

### Vercel Analytics
- Real User Monitoring (RUM)
- Web Vitals (LCP, FID, CLS)
- Route usage statistics

### Database Monitoring
- Supabase dashboard for query performance
- Prisma event logging for slow queries
- Connection pool monitoring

## Health Checks

```typescript
// GET /api/health
// Expected response: { status: "ok", timestamp, version }
```

**Checklist:**
- [ ] `/api/health` returns 200
- [ ] Database connection is alive
- [ ] Auth service is responsive
- [ ] Rate limiter is operational

## Alerting

### Critical Alerts (Pager)
- Application down >5 minutes
- Error rate >5%
- Database connection failures
- Authentication failures >10/minute

### Warning Alerts (Email/Slack)
- Response time >2s
- Error rate >1%
- Rate limiting triggered frequently
- Backup failures

### Logging
- Structured JSON logs (already configured)
- Correlation IDs on all requests
- Log levels: debug/info/warn/error
- Log retention: 30 days
