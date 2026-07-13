-- Storage Hardening v2.8 — Bucket privado para CorreHub
--
-- Cria o bucket 'correhub-private' com:
-- - public = false (bucket privado — sem acesso público)
-- - file_size_limit = 5MB (alinhado com UPLOAD_MAX_SIZE_BYTES do backend)
-- - allowed_mime_types = [image/png, image/jpeg, image/webp] (alinhado com upload-validator.ts)
--
-- Modelo de segurança:
-- - service_role (usado pelo backend) → bypass RLS, acesso total
-- - anon / authenticated → SEM acesso (bucket privado + sem políticas de grant)
-- - Frontend acessa arquivos via signed URLs (1h expiry)
--
-- NOTA: Não alteramos storage.objects (exigiria ownership).
--       RLS já está habilitado por padrão no Supabase Storage.
--       Bucket privado + sem políticas de grant = acesso negado a anon/authenticated.
--
-- Executar no Supabase Dashboard > SQL Editor:
--   (roda como postgres, que tem permissão total)

-- =============================================================================
-- 1. Criar bucket privado (idempotente)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'correhub-private',
  'correhub-private',
  false,
  5242880,  -- 5 MB em bytes
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']::text[];

-- =============================================================================
-- 2. Verificação de segurança
-- =============================================================================
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'correhub-private'
  ) then
    raise exception 'Bucket correhub-private não foi criado.';
  end if;

  if exists (
    select 1 from storage.buckets where id = 'correhub-private' and public = true
  ) then
    raise exception 'Bucket correhub-private está público — revise a migration.';
  end if;

  raise notice 'Bucket correhub-private criado com sucesso. Modo: privado.';
end $$;
