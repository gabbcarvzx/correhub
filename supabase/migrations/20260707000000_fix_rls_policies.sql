-- RLS Security Audit - Fix policies for production readiness
-- Issues addressed:
-- 1. RankingSnapshot: public read with "using (true)" exposes all tenants
-- 2. Group/Partner public read: missing tenantId filter
-- 3. CommunityPost: missing user read policy
-- 4. Achievement: missing user read policy
-- 5. CheckIn/Attendance: missing user insert/update policies
-- 6. AuditLog: missing insert policy (services create audit logs)
-- 7. Ensure FORCE ROW LEVEL SECURITY on all tables

-- =============================================================================
-- Fix 1: RankingSnapshot - scope by tenant
-- =============================================================================
drop policy if exists "RankingSnapshot public read" on public."RankingSnapshot";
create policy "RankingSnapshot public read"
  on public."RankingSnapshot"
  for select
  to anon, authenticated
  using ("tenantId" = app_private.current_tenant_id());

-- =============================================================================
-- Fix 2: Group - scope public read by tenant
-- =============================================================================
drop policy if exists "Group public approved read" on public."Group";
create policy "Group public approved read"
  on public."Group"
  for select
  to anon, authenticated
  using (
    "status" = 'APPROVED'
    and "deletedAt" is null
    and "tenantId" = app_private.current_tenant_id()
  );

-- =============================================================================
-- Fix 3: Partner - scope public read by tenant
-- =============================================================================
drop policy if exists "Partner public approved read" on public."Partner";
create policy "Partner public approved read"
  on public."Partner"
  for select
  to anon, authenticated
  using (
    "status" = 'APPROVED'
    and "deletedAt" is null
    and "tenantId" = app_private.current_tenant_id()
  );

-- =============================================================================
-- Fix 4: CommunityPost - add user read policy for own tenant
-- =============================================================================
drop policy if exists "CommunityPost user read own tenant" on public."CommunityPost";
create policy "CommunityPost user read own tenant"
  on public."CommunityPost"
  for select
  to authenticated
  using (
    "tenantId" = app_private.current_tenant_id()
    and "deletedAt" is null
  );

-- =============================================================================
-- Fix 5: Achievement - add user read policy for own tenant
-- =============================================================================
drop policy if exists "Achievement user read own tenant" on public."Achievement";
create policy "Achievement user read own tenant"
  on public."Achievement"
  for select
  to authenticated
  using ("tenantId" = app_private.current_tenant_id());

-- =============================================================================
-- Fix 6: CheckIn - add insert/update policy for user's own rows
-- =============================================================================
drop policy if exists "CheckIn user manage own rows" on public."CheckIn";
create policy "CheckIn user manage own rows"
  on public."CheckIn"
  for all
  to authenticated
  using (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
    and "deletedAt" is null
  )
  with check (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
  );

-- =============================================================================
-- Fix 7: Attendance - add insert/update policy for user's own rows
-- =============================================================================
drop policy if exists "Attendance user manage own rows" on public."Attendance";
create policy "Attendance user manage own rows"
  on public."Attendance"
  for all
  to authenticated
  using (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
    and "deletedAt" is null
  )
  with check (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
  );

-- =============================================================================
-- Fix 8: AuditLog - add insert policy for authenticated users
-- =============================================================================
drop policy if exists "AuditLog user insert own tenant" on public."AuditLog";
create policy "AuditLog user insert own tenant"
  on public."AuditLog"
  for insert
  to authenticated
  with check (
    "tenantId" = app_private.current_tenant_id()
    and (
      "actorUserId" = app_private.current_app_user_id()
      or app_private.is_tenant_admin()
    )
  );

-- =============================================================================
-- Fix 9: CommunityPost - add insert for authenticated users
-- =============================================================================
drop policy if exists "CommunityPost user insert own tenant" on public."CommunityPost";
create policy "CommunityPost user insert own tenant"
  on public."CommunityPost"
  for insert
  to authenticated
  with check (
    "tenantId" = app_private.current_tenant_id()
    and "authorUserId" = app_private.current_app_user_id()
  );

-- =============================================================================
-- Fix 10: User - add insert policy for registration (only non-admin users)
-- =============================================================================
drop policy if exists "User can insert own registration" on public."User";
create policy "User can insert own registration"
  on public."User"
  for insert
  to authenticated
  with check (
    "id" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
    and "role" = 'RUNNER'
  );

-- =============================================================================
-- Fix 11: Verify FORCE RLS is enabled on all tables
-- =============================================================================
do $$
declare
  table_record record;
begin
  for table_record in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'alter table %I.%I force row level security',
      table_record.schemaname,
      table_record.tablename
    );
  end loop;
end $$;

-- =============================================================================
-- Fix 12: Add RLS indexes for performance
-- =============================================================================
create index if not exists "User_tenantId_email_deletedAt_rls_idx"
  on public."User" ("tenantId", "email", "deletedAt");

create index if not exists "Group_tenantId_slug_deletedAt_rls_idx"
  on public."Group" ("tenantId", "slug", "deletedAt");

create index if not exists "Partner_tenantId_slug_deletedAt_rls_idx"
  on public."Partner" ("tenantId", "slug", "deletedAt");

create index if not exists "AuditLog_tenantId_actorUserId_rls_idx"
  on public."AuditLog" ("tenantId", "actorUserId");

create index if not exists "CommunityPost_tenantId_groupId_deletedAt_rls_idx"
  on public."CommunityPost" ("tenantId", "groupId", "deletedAt");
