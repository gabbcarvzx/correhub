create or replace view public.public_events as
select
  e."id",
  e."tenantId",
  e."groupId",
  e."title",
  e."description",
  e."eventType",
  e."date",
  e."startTime",
  e."endTime",
  e."location",
  e."distance",
  e."level",
  e."suggestedPace",
  e."capacity"
from public."RunEvent" e
join public."Group" g
  on g."id" = e."groupId"
  and g."tenantId" = e."tenantId"
where e."deletedAt" is null
  and g."status" = 'APPROVED'
  and g."deletedAt" is null;

grant select on public.public_events to anon, authenticated;

drop policy if exists "RunEvent public read approved group" on public."RunEvent";
