# Supabase Staging e Validacao de RLS

## Estado Detectado via MCP

- Projeto conectado: `CorreHub`
- URL: `https://gpetswuqgfpmkkouimuy.supabase.co`
- Migration remota atual: `20260704022412_real_persistence_init`
- Tabelas publicas detectadas: 19
- RLS remoto detectado: desabilitado nas 19 tabelas publicas
- Branches/staging: o MCP retornou erro ao listar branches com `Project reference is missing when validating permissions`

## Regra Operacional

Nao aplicar RLS diretamente em producao sem staging. A mudanca bloqueia ou libera acesso via Supabase API e precisa ser validada com usuarios reais de teste.

## Se Ja Existir Staging

1. Configurar o CLI para o projeto de staging.
2. Aplicar migrations:

```bash
supabase db push
```

3. Conferir tabelas:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

4. Rodar seed de staging:

```bash
npm run db:seed
```

5. Rodar validacao local apontando `.env` para staging:

```bash
npm run lint
npm test
npm run build
npm run typecheck
```

## Se Nao Existir Staging

Opcao recomendada: criar um projeto Supabase separado para staging.

```bash
supabase projects create correhub-staging
supabase link --project-ref <staging-project-ref>
supabase db push
npm run db:seed
```

Opcao alternativa: usar Supabase branching se disponivel no plano.

```bash
supabase branches create staging
supabase db push
npm run db:seed
```

## Checklist Funcional

- [ ] Login com runner, leader e admin.
- [ ] Cadastro sem regressao visual.
- [ ] `/agenda` carregando eventos publicos pela view `public_events`.
- [ ] `/grupos` listando apenas grupos aprovados.
- [ ] `/parceiros` listando apenas parceiros aprovados.
- [ ] `/ranking` carregando ranking publico.
- [ ] `/dashboard` do runner carregando dados do proprio tenant.
- [ ] `/dashboard/grupo` carregando dados do leader.
- [ ] `/dashboard/admin` carregando apenas dados do tenant atual.
- [ ] Attendance continua idempotente.
- [ ] Check-in continua idempotente.
- [ ] Admin aprova/rejeita grupo e parceiro.

## Checklist de RLS

- [ ] `anon` nao le `Attendance`.
- [ ] `anon` nao le `CheckIn`.
- [ ] `anon` nao le `Notification`.
- [ ] `anon` nao le `AuditLog`.
- [ ] `anon` nao le `Account`, `Session` ou `VerificationToken`.
- [ ] `anon` le `public_events`, sem `checkInCode`, `checkInOpensAt` e `checkInClosesAt`.
- [ ] Usuario autenticado le somente proprio perfil.
- [ ] Usuario autenticado le somente proprias presencas.
- [ ] Usuario autenticado le somente proprios check-ins.
- [ ] Usuario autenticado le somente proprias notificacoes.
- [ ] Admin com `tenant_id=A` nao le linhas do tenant B.

## Relatorio de Validacao

Resultado desta execucao:

- RLS ainda nao foi aplicado remotamente.
- O projeto remoto atual ainda reporta RLS desabilitado nas tabelas publicas.
- A migration local de RLS existe em `supabase/migrations/20260706000000_enable_public_rls.sql`.
- A migration local da view segura existe em `supabase/migrations/20260706001000_create_public_events_view.sql`.
- A aplicacao local foi ajustada para consultas publicas de eventos usarem `public_events`.
