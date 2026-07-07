# Rollback Plan — CorreHub

## When to Rollback
- Critical errors affecting all users
- Data corruption or loss
- Authentication failures
- Performance degradation >50%

## Rollback Procedures

### Option 1: Vercel Instant Rollback
```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-id>
```
**Time:** ~2 minutes

### Option 2: Git Revert
```bash
# Identify the problematic commit
git log --oneline -20

# Create revert commit
git revert HEAD

# Push to trigger new deploy
git push origin main
```
**Time:** ~10 minutes

### Option 3: Database Rollback
```bash
# List migrations
npx prisma migrate status

# Rollback last migration
npx prisma migrate down
```

**Important:** Database rollback is destructive. Only use if schema migration caused the issue.

## Recovery Steps
1. Identify issue from error logs
2. Choose rollback method
3. Execute rollback
4. Verify system health
5. Notify users of resolution

## Data Safety
- Database backups run daily
- Point-in-time recovery available via Supabase
- Migration files are version-controlled
