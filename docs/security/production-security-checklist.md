# Production Security Checklist

## Supabase RLS

- [ ] Aplicar `supabase/migrations/20260706000000_enable_public_rls.sql` em staging.
- [ ] Confirmar que todas as tabelas em `public` estao com RLS habilitado.
- [ ] Confirmar que `anon` nao consegue ler `Attendance`, `CheckIn`, `Notification`, `AuditLog`, `TenantSettings`, `FeatureFlag`, `Account`, `Session` e `VerificationToken`.
- [ ] Confirmar que `anon` le apenas `Group` e `Partner` com `APPROVED`.
- [ ] Confirmar que `anon` le apenas `RunEvent` de grupo aprovado e nao deletado.
- [ ] Confirmar que `authenticated` sem claims `app_user_id` e `tenant_id` nao le dados privados.
- [ ] Confirmar que usuario autenticado le apenas proprio `User`, `Attendance`, `CheckIn`, `Notification` e `UserAchievement`.
- [ ] Confirmar que admin com `role = ADMIN` e `tenant_id` acessa apenas dados do tenant atual.
- [ ] Confirmar que admin do tenant A nao acessa linhas do tenant B.
- [ ] Confirmar que `AuditLog` e somente leitura para admin via Supabase.

## Claims e Autenticacao

- [ ] Definir como claims Supabase serao emitidas se o frontend passar a usar Supabase client autenticado.
- [ ] Incluir `app_user_id`, `tenant_id` e `role` no JWT do Supabase para usuarios autenticados.
- [ ] Garantir que `app_user_id` corresponde a `User.id` do Prisma.
- [ ] Garantir que `tenant_id` corresponde ao tenant ativo da sessao.
- [ ] Nunca confiar em tenant vindo apenas de parametro de rota para operacoes privadas.
- [ ] Manter hash de senha com bcrypt ou migrar para argon2id quando houver janela segura.

## Prisma Server-Side

- [ ] Confirmar que `DATABASE_URL` usada pelo servidor nao usa a anon key nem role anon/authenticated.
- [ ] Confirmar que o servidor nao executa queries multi-tenant sem filtro por `tenantId`.
- [ ] Confirmar que endpoints admin validam role e tenant antes de mutacoes.
- [ ] Manter logs estruturados para mutacoes sensiveis.
- [ ] Inserir eventos em `AuditLog` apenas pelo servidor.

## Dados Publicos

- [ ] Revisar se `RunEvent.checkInCode` pode aparecer em leitura publica direta.
- [ ] Se `checkInCode` for sensivel, criar view publica sem essa coluna e remover policy publica da tabela `RunEvent`.
- [ ] Revisar campos publicos de `Partner`, especialmente `whatsapp`, `couponCode` e `gallery`.
- [ ] Revisar rankings para garantir que nao exponham dados pessoais alem do planejado.

## Deploy e Validacao

- [ ] Aplicar primeiro em staging.
- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm test`.
- [ ] Rodar `npm run build`.
- [ ] Testar login runner, admin e leader.
- [ ] Testar paginas publicas: grupos, parceiros, ranking e agenda.
- [ ] Testar dashboards autenticados.
- [ ] Testar uma tentativa de acesso cross-tenant.
- [ ] Fazer backup antes de aplicar em producao.
- [ ] Documentar rollback: remover policies especificas ou restaurar backup caso algum acesso direto via Supabase dependa de policy nao mapeada.
