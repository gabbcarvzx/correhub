-- Production RLS baseline for CorreHub.
-- This migration is intentionally Supabase-specific because it depends on
-- anon/authenticated roles and auth.jwt().

create schema if not exists app_private;

revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated;

create or replace function app_private.jwt_text_claim(claim_name text)
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(auth.jwt() ->> claim_name, ''),
    nullif(auth.jwt() -> 'app_metadata' ->> claim_name, ''),
    nullif(auth.jwt() -> 'user_metadata' ->> claim_name, '')
  );
$$;

create or replace function app_private.current_app_user_id()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    app_private.jwt_text_claim('app_user_id'),
    nullif((select auth.uid())::text, '')
  );
$$;

create or replace function app_private.current_tenant_id()
returns text
language sql
stable
set search_path = ''
as $$
  select app_private.jwt_text_claim('tenant_id');
$$;

create or replace function app_private.current_app_role()
returns text
language sql
stable
set search_path = ''
as $$
  select upper(coalesce(app_private.jwt_text_claim('role'), ''));
$$;

create or replace function app_private.is_tenant_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select app_private.current_app_role() = 'ADMIN'
    and app_private.current_tenant_id() is not null;
$$;

revoke all on all functions in schema app_private from public;
grant execute on all functions in schema app_private to anon, authenticated;

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
      'alter table %I.%I enable row level security',
      table_record.schemaname,
      table_record.tablename
    );
  end loop;
end $$;

create index if not exists "Attendance_tenantId_userId_deletedAt_rls_idx"
  on public."Attendance" ("tenantId", "userId", "deletedAt");

create index if not exists "CheckIn_tenantId_userId_deletedAt_rls_idx"
  on public."CheckIn" ("tenantId", "userId", "deletedAt");

create index if not exists "RunEvent_tenantId_groupId_deletedAt_rls_idx"
  on public."RunEvent" ("tenantId", "groupId", "deletedAt");

create index if not exists "RankingSnapshot_tenantId_userId_rls_idx"
  on public."RankingSnapshot" ("tenantId", "userId");

drop policy if exists "Tenant admin access current tenant" on public."Tenant";
create policy "Tenant admin access current tenant"
  on public."Tenant"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "id" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "id" = app_private.current_tenant_id());

drop policy if exists "User can read own profile" on public."User";
create policy "User can read own profile"
  on public."User"
  for select
  to authenticated
  using (
    "id" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
    and "deletedAt" is null
  );

drop policy if exists "User admin access current tenant" on public."User";
create policy "User admin access current tenant"
  on public."User"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "Group public approved read" on public."Group";
create policy "Group public approved read"
  on public."Group"
  for select
  to anon, authenticated
  using ("status" = 'APPROVED' and "deletedAt" is null);

drop policy if exists "Group admin access current tenant" on public."Group";
create policy "Group admin access current tenant"
  on public."Group"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "GroupMember admin access current tenant" on public."GroupMember";
create policy "GroupMember admin access current tenant"
  on public."GroupMember"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "RunEvent public read approved group" on public."RunEvent";
create policy "RunEvent public read approved group"
  on public."RunEvent"
  for select
  to anon, authenticated
  using (
    "deletedAt" is null
    and exists (
      select 1
      from public."Group" g
      where g."id" = "RunEvent"."groupId"
        and g."tenantId" = "RunEvent"."tenantId"
        and g."status" = 'APPROVED'
        and g."deletedAt" is null
    )
  );

drop policy if exists "RunEvent admin access current tenant" on public."RunEvent";
create policy "RunEvent admin access current tenant"
  on public."RunEvent"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "Attendance user read own rows" on public."Attendance";
create policy "Attendance user read own rows"
  on public."Attendance"
  for select
  to authenticated
  using (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
    and "deletedAt" is null
  );

drop policy if exists "Attendance admin access current tenant" on public."Attendance";
create policy "Attendance admin access current tenant"
  on public."Attendance"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "CheckIn user read own rows" on public."CheckIn";
create policy "CheckIn user read own rows"
  on public."CheckIn"
  for select
  to authenticated
  using (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
    and "deletedAt" is null
  );

drop policy if exists "CheckIn admin access current tenant" on public."CheckIn";
create policy "CheckIn admin access current tenant"
  on public."CheckIn"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "Partner public approved read" on public."Partner";
create policy "Partner public approved read"
  on public."Partner"
  for select
  to anon, authenticated
  using ("status" = 'APPROVED' and "deletedAt" is null);

drop policy if exists "Partner admin access current tenant" on public."Partner";
create policy "Partner admin access current tenant"
  on public."Partner"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "Achievement admin access current tenant" on public."Achievement";
create policy "Achievement admin access current tenant"
  on public."Achievement"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "UserAchievement user read own rows" on public."UserAchievement";
create policy "UserAchievement user read own rows"
  on public."UserAchievement"
  for select
  to authenticated
  using (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
  );

drop policy if exists "UserAchievement admin access current tenant" on public."UserAchievement";
create policy "UserAchievement admin access current tenant"
  on public."UserAchievement"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "RankingSnapshot public read" on public."RankingSnapshot";
create policy "RankingSnapshot public read"
  on public."RankingSnapshot"
  for select
  to anon, authenticated
  using (true);

drop policy if exists "RankingSnapshot admin access current tenant" on public."RankingSnapshot";
create policy "RankingSnapshot admin access current tenant"
  on public."RankingSnapshot"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "CommunityPost admin access current tenant" on public."CommunityPost";
create policy "CommunityPost admin access current tenant"
  on public."CommunityPost"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "Notification user read own rows" on public."Notification";
create policy "Notification user read own rows"
  on public."Notification"
  for select
  to authenticated
  using (
    "userId" = app_private.current_app_user_id()
    and "tenantId" = app_private.current_tenant_id()
  );

drop policy if exists "Notification admin access current tenant" on public."Notification";
create policy "Notification admin access current tenant"
  on public."Notification"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "TenantSettings admin access current tenant" on public."TenantSettings";
create policy "TenantSettings admin access current tenant"
  on public."TenantSettings"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "FeatureFlag admin access current tenant" on public."FeatureFlag";
create policy "FeatureFlag admin access current tenant"
  on public."FeatureFlag"
  for all
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id())
  with check (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());

drop policy if exists "AuditLog admin read current tenant" on public."AuditLog";
create policy "AuditLog admin read current tenant"
  on public."AuditLog"
  for select
  to authenticated
  using (app_private.is_tenant_admin() and "tenantId" = app_private.current_tenant_id());
