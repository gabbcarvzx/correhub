# Final Security Audit

## Status Atual

Este documento registra o estado de seguranca preparado para piloto. Ele deve ser atualizado apos aplicar as migrations em staging e antes de qualquer deploy de producao.

## Controles Implementados Localmente

- Migration de RLS base para tabelas publicas.
- Helpers de JWT em schema privado `app_private`.
- Policies para dados publicos, usuario autenticado e admin por tenant.
- View `public_events` sem campos sensiveis de check-in.
- Repositorio publico de eventos consumindo `public_events`.
- Checklist de staging e validacao de RLS.

## Pontos Criticos Ainda Pendentes

- RLS ainda nao foi aplicado no projeto remoto conectado.
- Branch/projeto de staging ainda precisa ser confirmado.
- `CheckInToken` ainda precisa substituir QR fixo.
- Rate limit ainda precisa ser aplicado em login, attendance, check-in e geracao de QR.
- Testes multi-tenant tenant A versus tenant B ainda precisam ser implementados.
- Storage Supabase para uploads ainda precisa ser conectado.
- Observabilidade ainda precisa ser preparada sem envio real por padrao.
- Headers de seguranca e middleware ainda precisam de revisao final.

## RLS

- Tabelas com dados privados devem permanecer sem leitura anonima.
- `RunEvent` nao deve ter policy publica direta.
- `public_events` e a superficie publica permitida para eventos.
- Admin sempre exige claim `tenant_id` e `role = ADMIN`.

## Zod e Validacao

- Entradas de APIs devem continuar validadas por schema antes de mutacoes.
- Mutacoes admin devem validar tenant, role e status permitido.
- Check-in deve validar janela, token, usuario autenticado e idempotencia.

## CSRF, XSS e SQL Injection

- Mutacoes devem continuar em rotas server-side autenticadas.
- Queries dinamicas devem usar Prisma ou tagged templates de `$queryRaw`.
- Conteudo de feed deve ser tratado como texto, nao HTML.
- Uploads devem validar tipo, tamanho e tenant antes de persistir URL publica.

## Auditoria

Eventos que devem persistir em `AuditLog`:

- Geracao de QR/token.
- Check-in concluido.
- Check-in recusado.
- Token expirado ou invalido.
- Attendance confirmado ou cancelado.
- Grupo aprovado ou rejeitado.
- Parceiro aprovado ou rejeitado.

## Gate Para Piloto

- Staging validado com RLS ativo.
- Testes automatizados passando.
- Build passando.
- Typecheck passando.
- Fluxos runner, leader e admin testados manualmente.
- Backup e rollback documentados.
