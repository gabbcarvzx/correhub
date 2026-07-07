# Supabase RLS Policies

## Objetivo

Esta camada de RLS protege acesso direto via Supabase `anon` e `authenticated` sem alterar a UX nem a service layer atual. O app continua acessando dados principalmente pelo servidor com Prisma.

## Arquivo SQL

- Migration: `supabase/migrations/20260706000000_enable_public_rls.sql`
- Escopo: todas as tabelas em `public`
- Decisao: nao usar `force row level security`, para evitar quebrar conexoes server-side controladas pelo Prisma/table owner.

## Claims Esperadas

As policies autenticadas usam claims opcionais no JWT do Supabase:

- `app_user_id`: id do usuario no modelo Prisma `User.id`
- `tenant_id`: id do tenant atual
- `role`: papel da aplicacao, com `ADMIN` para administradores

As funcoes em `app_private` procuram as claims no payload raiz, em `app_metadata` e em `user_metadata`. Se `app_user_id` nao existir, usam `auth.uid()::text` como fallback.

## Politicas Publicas

Estas tabelas ficam legiveis por `anon` e `authenticated`:

- `Group`: somente `status = APPROVED` e `deletedAt is null`
- `Partner`: somente `status = APPROVED` e `deletedAt is null`
- `RankingSnapshot`: rankings publicos
- `RunEvent`: somente eventos nao deletados cujo grupo esta `APPROVED`

Risco importante: RLS filtra linhas, nao colunas. Se `RunEvent.checkInCode` nao deve ser publico por API direta, o proximo passo correto e criar uma view publica sem essa coluna e remover a policy publica da tabela base.

## Politicas de Usuario Autenticado

Usuarios autenticados podem ler apenas:

- `User`: proprio perfil, dentro do proprio tenant e nao deletado
- `Attendance`: proprias presencas, dentro do proprio tenant e nao deletadas
- `CheckIn`: proprios check-ins, dentro do proprio tenant e nao deletados
- `Notification`: proprias notificacoes dentro do proprio tenant
- `UserAchievement`: proprias conquistas dentro do proprio tenant

Nao ha policy de escrita direta para usuario comum. Escritas continuam passando pelo servidor Prisma, onde ficam validacoes de produto, auditoria e regras de negocio.

## Politicas de Administrador

Administradores autenticados com `role = ADMIN` e `tenant_id` no JWT podem acessar somente dados do tenant atual nas tabelas com `tenantId`:

- `User`
- `Group`
- `GroupMember`
- `RunEvent`
- `Attendance`
- `CheckIn`
- `Partner`
- `Achievement`
- `UserAchievement`
- `RankingSnapshot`
- `CommunityPost`
- `Notification`
- `TenantSettings`
- `FeatureFlag`

Tambem podem acessar `Tenant` somente quando `Tenant.id = tenant_id`.

`AuditLog` tem apenas leitura para admin do tenant atual. Insercoes de auditoria devem continuar server-side.

## Tabelas Fechadas por Padrao

Com RLS ativo e sem policy publica, estas tabelas nao ficam acessiveis por `anon` nem por usuario autenticado comum:

- `Account`
- `Session`
- `VerificationToken`
- `_prisma_migrations`, quando existir em `public`
- qualquer outra tabela publica sem policy explicita

## Impacto Arquitetural

- Reduz risco de vazamento por uso acidental da anon key no frontend.
- Mantem isolamento por tenant para usuarios autenticados e administradores.
- Preserva o acesso server-side existente pelo Prisma, desde que a conexao use role proprietaria/service controlada.
- Cria uma base para evoluir de Prisma-only para Supabase client sem expor dados privados.

## Como Aplicar

Aplicar no Supabase:

```bash
supabase db push
```

Ou executar o SQL no editor SQL do Supabase em uma janela de manutencao curta.

Depois de aplicar, validar:

```bash
npm run lint
npm test
npm run build
```
