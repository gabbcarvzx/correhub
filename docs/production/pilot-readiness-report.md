# Pilot Readiness Report

## Funcionalidades Preparadas

- Multi-tenant por cidade.
- Auth.js com roles de aplicacao.
- Dashboards runner, leader e admin.
- Attendance e check-in server-side.
- Moderacao de grupos e parceiros.
- AuditLog disponivel no schema.
- RLS base local.
- View segura `public_events`.

## Migrations Locais Novas

- `supabase/migrations/20260706000000_enable_public_rls.sql`
- `supabase/migrations/20260706001000_create_public_events_view.sql`

## Tabelas Criadas Nesta Rodada

Nenhuma tabela nova foi criada nesta rodada. A mudanca de eventos publicos usa view SQL.

## Views Criadas Nesta Rodada

- `public.public_events`

## Politicas RLS

- Dados publicos: grupos aprovados, parceiros aprovados, rankings e view de eventos publicos.
- Dados privados: sem acesso anonimo.
- Usuario autenticado: proprio perfil, presencas, check-ins, notificacoes e conquistas.
- Admin: acesso limitado ao `tenant_id` atual.

## Pendencias

- Aplicar RLS em staging.
- Confirmar projeto ou branch de staging.
- Implementar `CheckInToken`.
- Implementar rate limit.
- Ampliar auditoria.
- Criar seed e testes multi-tenant.
- Implementar uploads com Supabase Storage.
- Completar feed, notificacoes, PWA e observabilidade.
- Rodar Lighthouse e auditoria final de headers.

## Riscos

- Projeto remoto conectado ainda reporta RLS desligado.
- Sem staging confirmado, aplicar RLS direto em producao e arriscado.
- QR fixo ainda deve ser substituido antes do piloto aberto.
- Rate limit ainda nao protege endpoints de abuso.

## Proximos Passos

1. Confirmar staging.
2. Aplicar migrations em staging.
3. Executar checklist de `docs/staging/supabase-rls-validation.md`.
4. Implementar `CheckInToken` com TDD.
5. Implementar rate limit e auditoria ampliada.
