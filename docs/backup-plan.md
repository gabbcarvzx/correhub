# Backup Plan — CorreHub

## Database (Supabase PostgreSQL)

### Automatic Backups
- **Frequency:** Daily
- **Retention:** 7 days (Pro plan: 30 days)
- **Type:** Physical backup (WAL-based)
- **Point-in-time Recovery:** Supported (Supabase Pro+)

### Manual Backup
```bash
# Backup via pg_dump
pg_dump "$DATABASE_URL" --no-owner --no-acl -Fc > backup-$(date +%Y%m%d).dump

# Restore
pg_restore "$DATABASE_URL" --clean --if-exists backup-20260707.dump

# Backup with schema only
pg_dump "$DATABASE_URL" --schema-only > schema-$(date +%Y%m%d).sql
```

### Scheduled Tasks
- [ ] Verify daily backup completed
- [ ] Test restore quarterly
- [ ] Monitor backup storage usage

## Code & Configuration
- All code in GitHub (automatic)
- Environment variables in Vercel dashboard
- Migration files in git history
- Supabase config in `supabase/config.toml`

## Recovery Time Objectives
- **Database restore:** ~30 minutes
- **Full application recovery:** ~1 hour
- **Point-in-time recovery:** ~15 minutes
