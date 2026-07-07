# Production Hardening Roadmap

## Objetivo

Preparar o CorreHub para piloto real em Sao Lourenco da Mata sem quebrar UX, fallback demo, arquitetura modular, Prisma server-side ou isolamento multi-tenant.

## Fase 1: Banco, RLS e Dados Publicos

- Aplicar RLS em staging antes de producao.
- Validar policies por papel: `anon`, usuario autenticado e admin.
- Expor eventos publicos por `public_events`.
- Manter segredos de check-in fora de consultas publicas.
- Criar testes de isolamento tenant A versus tenant B.

## Fase 2: Check-in Seguro

- Criar `CheckInToken`.
- Gerar token com entropia criptografica.
- Definir expiracao curta.
- Invalidar tokens expirados na validacao.
- Manter check-in idempotente por `runEventId + userId`.
- Auditar geracao, sucesso, falha e expiracao.

## Fase 3: Rate Limit e Auditoria

- Criar `src/lib/security/rate-limit/`.
- Usar memoria em desenvolvimento.
- Preparar driver Redis/Upstash para producao.
- Aplicar rate limit em login, attendance, check-in e geracao de QR.
- Persistir eventos sensiveis em `AuditLog`.

## Fase 4: Uploads

- Criar `src/lib/storage/`.
- Padronizar `StorageProvider`.
- Implementar drivers local, Supabase Storage, Cloudflare R2 e Amazon S3.
- Usar Supabase Storage no MVP.
- Cobrir avatar, logo/capa de grupo, parceiro e feed.

## Fase 5: Comunidade, Notificacoes e PWA

- Evoluir `CommunityPost` para texto, imagem, avisos e convites.
- Manter comentarios fora do MVP.
- Gerar notificacoes para aprovacao, eventos, conquistas e presencas.
- Implementar manifest, service worker e icones.

## Fase 6: Observabilidade, Performance e Auditoria Final

- Criar `src/lib/observability/`.
- Preparar Sentry, PostHog e Google Analytics sem envio real sem env vars.
- Rodar Lighthouse e corrigir gargalos.
- Revisar RLS, Zod, headers, CSRF, XSS e SQL injection.
- Atualizar `docs/security/final-audit.md`.

## Gates de Producao

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run typecheck`
- RLS aplicado e validado em staging.
- Backup feito antes de producao.
- Teste manual completo do fluxo runner, leader e admin.
