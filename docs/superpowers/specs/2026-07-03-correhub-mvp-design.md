# CorreHub MVP Design

## Overview

CorreHub e um web app SaaS multi-tenant para conectar comunidades de corrida por cidade, com foco em descoberta de grupos, agenda de treinos e eventos, confirmacao de presenca, check-in, ranking, parceiros comerciais e operacao moderada por administradores locais.

O produto nasce com identidade nacional e arquitetura preparada para escalar para centenas de cidades. Sao Lourenco da Mata sera o tenant inicial de operacao e validacao.

## Product Goals

- Consolidar grupos de corrida locais em uma experiencia unica, moderna e mobile-first.
- Entregar um MVP apresentavel com acabamento visual premium e UX comparavel a produtos de startup.
- Permitir operacao segura com isolamento por tenant, aprovacao administrativa e RBAC claro.
- Preparar a base para monetizacao futura de grupos, parceiros e cidades operadoras.
- Manter a arquitetura simples de operar no MVP, mas organizada para crescimento nacional.

## Non-Goals For This Phase

- Integracao com wearables ou APIs de corrida.
- Integracao com gateways de pagamento.
- Push notifications em producao.
- Marketplace transacional.
- Chat em tempo real.

## Brand And Positioning

- Nome do produto: `CorreHub`
- Tenant inicial: `Sao Lourenco da Mata`
- Posicionamento: maior plataforma brasileira para comunidades de corrida, iniciando por uma cidade piloto.
- Slogan de referencia: `Encontre treinos, participe de grupos e acompanhe sua evolucao em um so lugar.`

Toda a identidade visual, URLs internas, modelagem e copy devem assumir expansao nacional. A cidade deixa de ser nome do produto e passa a ser contexto operacional do tenant.

## Architecture

O sistema sera um monolito modular em Next.js 15 com App Router. A aplicacao hospedara interface publica, areas privadas, autenticacao, route handlers, server actions e integracao com Prisma.

### Core Technical Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React
- Motion
- React Hook Form
- Zod
- TanStack Table
- Prisma ORM
- PostgreSQL local e Neon-ready
- Auth.js
- Vercel-ready deployment

### Monolith Boundaries

O monolito sera modularizado por dominio para evitar acoplamento precoce:

- `auth`
- `tenants`
- `users`
- `groups`
- `events`
- `attendance`
- `check-in`
- `rankings`
- `partners`
- `community`
- `notifications`
- `search`
- `admin`
- `billing`

Cada dominio tera separacao entre `components`, `data`, `policies`, `schemas`, `services` e `types`.

### Multi-Tenant Strategy

- `Tenant` representa uma cidade ou operacao municipal.
- Todas as entidades de negocio relevantes terao `tenantId`.
- Consultas de negocio sempre filtram por `tenantId`.
- Slugs sao unicos por tenant quando aplicavel.
- O MVP local resolve tenant padrao para `Sao Lourenco da Mata`.
- A arquitetura fica pronta para hostname customizado ou subdominio no futuro.

### Roles

- `RUNNER`
- `GROUP_LEADER`
- `PARTNER`
- `ADMIN`

O papel determina acesso global dentro do tenant atual. A extensao futura para `city moderator`, `ambassador` ou papeis mais granulares sera feita via membership/policy sem romper o modelo atual.

## Data Model

### Tenant

Campos principais:

- `id`
- `name`
- `slug`
- `status`
- `plan`
- `timezone`
- `createdAt`
- `updatedAt`

Uso:

- isolamento por cidade
- base para monetizacao por operacao
- ponto de corte para governanca e analytics

### User

Campos principais:

- `id`
- `tenantId`
- `name`
- `email`
- `passwordHash`
- `image`
- `role`
- `city`
- `paceAvg`
- `preferredDistance`
- `totalAttendances`
- `totalKm`
- `emailVerified`
- `createdAt`
- `updatedAt`

Uso:

- autenticacao
- perfil do corredor
- ranking
- administracao e ownership

### Account, Session, VerificationToken

Modelos padrao do Auth.js com Prisma Adapter.

### Group

Campos principais:

- `id`
- `tenantId`
- `slug`
- `name`
- `description`
- `logoUrl`
- `coverUrl`
- `meetingPoint`
- `meetingDays`
- `meetingTimes`
- `distances`
- `leaderUserId`
- `status`
- `reviewNotes`
- `reviewedById`
- `reviewedAt`
- `planType`
- `createdAt`
- `updatedAt`

Uso:

- entidade principal de comunidade
- moderacao obrigatoria
- base para treinos, membros e ranking interno

### GroupMember

Campos principais:

- `id`
- `tenantId`
- `groupId`
- `userId`
- `role`
- `status`
- `joinedAt`

Uso:

- participacao em grupo
- papeis internos de grupo
- evolucao futura para gestao local por cidade

### RunEvent

Campos principais:

- `id`
- `tenantId`
- `groupId`
- `slug`
- `title`
- `description`
- `eventType`
- `date`
- `startTime`
- `endTime`
- `location`
- `distance`
- `level`
- `suggestedPace`
- `capacity`
- `createdById`
- `checkInCode`
- `checkInOpensAt`
- `checkInClosesAt`
- `createdAt`
- `updatedAt`

Tipos de evento:

- `TRAINING`
- `OFFICIAL_RACE`
- `LONG_RUN`
- `MEETUP`
- `CHALLENGE`

Uso:

- agenda principal
- treinos e eventos oficiais
- base para presenca e check-in

### Attendance

Campos principais:

- `id`
- `tenantId`
- `runEventId`
- `userId`
- `status`
- `confirmedAt`
- `cancelledAt`

Uso:

- confirmacao de participacao
- previsao de volume do treino

### CheckIn

Campos principais:

- `id`
- `tenantId`
- `runEventId`
- `userId`
- `attendanceId`
- `method`
- `checkedInAt`
- `kmReported`

Uso:

- presenca efetiva
- contabilizacao de km
- base de ranking e conquistas

### Partner

Campos principais:

- `id`
- `tenantId`
- `name`
- `slug`
- `category`
- `logoUrl`
- `coverUrl`
- `gallery`
- `description`
- `address`
- `whatsapp`
- `instagram`
- `couponCode`
- `featured`
- `ownerUserId`
- `status`
- `reviewNotes`
- `reviewedById`
- `reviewedAt`
- `createdAt`
- `updatedAt`

Uso:

- vitrine de parceiros locais
- estrutura para plano comercial
- entidade publica com pagina propria

### Achievement

Campos principais:

- `id`
- `tenantId`
- `code`
- `name`
- `description`
- `icon`
- `ruleType`
- `ruleValue`

Conquistas iniciais:

- primeiro treino
- 50 km
- 100 km
- 10 check-ins
- 30 check-ins
- 1 lugar do mes
- participacao em evento

### UserAchievement

Campos principais:

- `id`
- `tenantId`
- `userId`
- `achievementId`
- `earnedAt`

### RankingSnapshot

Campos principais:

- `id`
- `tenantId`
- `periodType`
- `periodKey`
- `scopeType`
- `groupId`
- `userId`
- `attendanceCount`
- `kmTotal`
- `score`
- `position`

Uso:

- ranking geral
- ranking mensal
- ranking por grupo

### CommunityPost

Campos principais:

- `id`
- `tenantId`
- `groupId`
- `authorUserId`
- `title`
- `content`
- `imageUrl`
- `postType`
- `createdAt`
- `updatedAt`

Uso:

- feed da comunidade
- avisos
- mudancas de horario
- convites

### Notification

Campos principais:

- `id`
- `tenantId`
- `userId`
- `type`
- `title`
- `message`
- `actionUrl`
- `readAt`
- `createdAt`

Uso:

- inbox interno
- arquitetura futura para push e email transacional

### TenantSettings

Campos principais:

- `id`
- `tenantId`
- `cityDisplayName`
- `logoUrl`
- `primaryColor`
- `bannerUrl`
- `socialLinks`
- `whatsapp`
- `latitude`
- `longitude`
- `defaultEventRadiusKm`
- `createdAt`
- `updatedAt`

Uso:

- identidade visual por tenant
- configuracoes operacionais centralizadas
- base para customizacao por cidade

### FeatureFlag

Campos principais:

- `id`
- `tenantId`
- `key`
- `enabled`
- `description`
- `createdAt`
- `updatedAt`

Uso:

- liberacao gradual de funcionalidades
- rollout por tenant
- suporte a monetizacao e experimentacao

### AuditLog

Campos principais:

- `id`
- `tenantId`
- `actorUserId`
- `entityType`
- `entityId`
- `action`
- `metadata`
- `createdAt`

Uso:

- rastreabilidade
- seguranca operacional
- trilha de moderacao

### Key Enums

- `UserRole`: `RUNNER`, `GROUP_LEADER`, `PARTNER`, `ADMIN`
- `ApprovalStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `TenantStatus`: `ACTIVE`, `SUSPENDED`
- `PlanType`: `FREE`, `GROUP_PRO`, `PARTNER`
- `AttendanceStatus`: `CONFIRMED`, `CANCELLED`
- `RunLevel`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `DistanceType`: `KM_5`, `KM_10`, `KM_15`, `KM_21`, `OPEN`
- `EventType`: `TRAINING`, `OFFICIAL_RACE`, `LONG_RUN`, `MEETUP`, `CHALLENGE`

### Data Rules

- indices compostos por `tenantId` em entidades de leitura frequente
- `slug` unico por tenant em `Group`, `Partner` e `RunEvent` quando necessario
- slugs de `Group`, `Partner` e `RunEvent` tornam-se imutaveis apos publicacao; alterar nome nao regenera slug automaticamente
- apenas `ADMIN` pode regenerar slug manualmente quando houver necessidade operacional
- somente `APPROVED` pode ser publico para grupos e parceiros
- `reviewNotes` obrigatorio em rejeicoes
- check-in deve ser idempotente por usuario e evento
- snapshots de ranking podem ser recalculados sem quebrar consistencia historica
- entidades principais devem usar soft delete com `deletedAt` e `deletedBy` em vez de exclusao fisica

## Core User Flows

### Public Discovery

1. Usuario acessa landing page.
2. Explora agenda, grupos, ranking e parceiros aprovados.
3. Decide criar conta ou entrar.

### Runner Onboarding

1. Usuario se cadastra por credentials.
2. Opcionalmente conecta Google se providers estiverem configurados.
3. Completa perfil com cidade, pace e distancia preferida.
4. Entra em grupo e confirma participacao em eventos.

### Group Submission

1. Lider cria solicitacao de grupo.
2. Grupo entra como `PENDING`.
3. Admin aprova ou rejeita com observacao.
4. Lider acompanha status no dashboard.
5. Quando aprovado, o grupo vira publico.

### Partner Submission

1. Parceiro cria ou envia perfil comercial.
2. Registro entra como `PENDING`.
3. Admin aprova ou rejeita com observacao.
4. Somente aprovados aparecem publicamente.

### Attendance And Check-In

1. Corredor confirma presenca em evento.
2. Lider gera QR code seguro.
3. Corredor autenticado acessa link/token do QR.
4. Sistema valida tenant, evento e janela de check-in.
5. Presenca efetiva e km informados alimentam dashboard, conquistas e ranking.

### Admin Moderation

1. Admin acessa painel privado.
2. Visualiza filas de aprovacao, usuarios, grupos, parceiros e metricas.
3. Aprova ou rejeita entidades.
4. Acao fica registrada em `AuditLog`.

## Page Map

### Public Pages

- `/`
- `/agenda`
- `/grupos`
- `/grupos/[slug]`
- `/ranking`
- `/parceiros`
- `/parceiros/[slug]`
- `/comunidade`
- `/buscar`
- `/login`
- `/cadastro`

### Private Pages

- `/perfil`
- `/dashboard`
- `/dashboard/grupo`
- `/dashboard/admin`
- `/check-in/[eventId]`
- `/notificacoes`

### Dashboard Expectations

#### Runner Dashboard

Deve mostrar logo na entrada:

- proximo treino
- ultimos check-ins
- quilometros do mes
- ranking atual
- grupo principal
- parceiros proximos
- eventos futuros
- conquistas desbloqueadas

#### Group Leader Dashboard

Deve permitir:

- criar treino ou evento
- editar treino ou evento
- ver confirmados
- gerar QR code
- editar informacoes do grupo
- acompanhar status de aprovacao
- publicar no feed da comunidade
- consultar metricas basicas do grupo

#### Admin Dashboard

Deve permitir:

- gerenciar usuarios
- aprovar e rejeitar grupos
- aprovar e rejeitar parceiros
- ver eventos e treinos
- acompanhar metricas agregadas
- registrar observacoes administrativas

## Design System

O projeto tera um design system proprio baseado em componentes reutilizaveis e consistentes com a identidade premium do produto.

Componentes minimos:

- `Button`
- `Card`
- `Badge`
- `Avatar`
- `Input`
- `Modal`
- `Drawer`
- `Sheet`
- `Toast`
- `EmptyState`
- `LoadingState`
- `Skeleton`
- `KpiCard`
- `RankingCard`
- `EventCard`
- `GroupCard`
- `PartnerCard`

Os componentes devem nascer documentados no codigo, composiveis e usados de forma consistente nas paginas publicas e dashboards.

### Design Tokens

Tokens centralizados devem governar:

- cores
- espacamentos
- tipografia
- sombras
- bordas
- radius
- animacoes

Esses tokens devem viver em uma camada unica para evitar variacoes ad hoc ao longo do produto.

## UX And Visual Strategy

### Design Direction

Inspiracao principal:

- Linear
- Vercel
- Stripe
- Arc Browser
- Raycast

### Visual Principles

- interface com aparencia de startup premium
- composicao limpa, contraste forte e tipografia expressiva
- mobile-first com sensacao de app nativo
- cards grandes, espacamento generoso e CTA claros
- motion suave e funcional, sem poluicao
- uso de blocos escuros com acentos verdes e areas claras de respiro

### Color Palette

- verde principal `#22C55E`
- verde escuro `#16A34A`
- slate profundo `#0F172A`
- cinza `#64748B`
- fundo `#F8FAFC`

### Typography

- `Geist Sans`
- `Geist Mono` para detalhes de sistema onde fizer sentido

### Landing Page Requirements

A landing page precisa parecer produto pronto, nao template generico.

Secoes obrigatorias:

- hero premium
- estatisticas animadas
- cards modernos
- depoimentos ficticios
- CTA destacado
- como funciona
- para corredores
- para lideres
- para parceiros
- FAQ
- footer profissional

### Mobile Experience

Requisitos:

- bottom navigation nas areas privadas principais
- alvos de toque confortaveis
- drawers e sheets em vez de modais grandes quando adequado
- skeletons e estados vazios bem trabalhados
- transicoes fluidas
- leitura rapida de dashboard

### Accessibility

Requisitos obrigatorios:

- navegacao por teclado
- contraste AA
- labels semanticos
- `aria-*` quando aplicavel
- foco visivel

## Search

Havera busca global inicial para:

- grupo
- corredor
- evento
- parceiro

No MVP, a busca pode ser simples com consulta no banco e UX refinada. A arquitetura deve permitir evoluir para indexacao dedicada depois.

## SEO

Configuracoes obrigatorias:

- Metadata API do Next.js
- Open Graph
- Twitter cards, se util
- robots
- sitemap
- canonical
- schema.org
- favicons

Objetivo:

- excelente indexacao organica para grupos, eventos e parceiros por cidade

## Security And Authorization

### Authentication

- Auth.js com strategy segura
- credentials funcionando localmente
- Google provider habilitado apenas se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` existirem
- hash de senha com `bcryptjs`

### Authorization

As regras de acesso devem passar por policies por dominio e checagem de tenant.

Regras criticas:

- nenhum usuario acessa dados de outro tenant
- lider so administra grupo sob sua responsabilidade
- apenas `ADMIN` aprova ou rejeita grupo e parceiro
- grupos e parceiros pendentes nao aparecem publicamente
- feed comunitario respeita ownership e tenant
- pagina de check-in exige autenticacao
- QR code nao efetiva presenca sem confirmacao autenticada

### Operational Safety

- validacao Zod no client e no server
- tratamento global de erro
- logs administrativos
- sanitizacao de links externos
- protecao server-side de rotas privadas
- soft delete para preservar historico e auditoria

## Storage Abstraction

O projeto deve nascer com uma abstracao `StorageProvider` para uploads e assets.

Requisitos:

- no MVP pode usar armazenamento local, `public/` controlado ou mock provider
- a logica de negocio nao pode depender do provider concreto
- deve ser facil trocar para `Cloudflare R2`, `Amazon S3` ou `Supabase Storage`

Casos de uso:

- logos de grupos
- capas
- imagens de parceiros
- imagens do feed

## Observability

Criar interfaces e pontos de integracao para observabilidade desde o inicio.

Camadas previstas:

- logging estruturado
- captura de erros
- analytics de produto

Integracoes futuras preparadas:

- `Sentry`
- `PostHog`
- `Google Analytics`

No MVP, a implementacao pode permanecer local e desacoplada, mas a arquitetura nao deve espalhar logs e telemetria de forma ad hoc.

## Tenant Settings

Criar entidade `TenantSettings` para concentrar configuracoes de identidade e operacao do tenant.

Campos de referencia:

- `tenantId`
- `cityDisplayName`
- `logoUrl`
- `primaryColor`
- `bannerUrl`
- `socialLinks`
- `whatsapp`
- `coordinates`
- `defaultEventRadiusKm`

Objetivo:

- evitar configuracoes espalhadas
- permitir personalizacao por cidade
- sustentar operacoes com identidade local sem bifurcar codigo

## Feature Flags

Criar estrutura de `FeatureFlag` desde o inicio.

Flags iniciais de referencia:

- `community_feed`
- `rankings`
- `partners`
- `notifications`
- `challenges`
- `premium`

Uso:

- habilitacao gradual por tenant
- testes controlados de funcionalidade
- monetizacao e rollout futuro sem fork de codigo

## API Versioning

Mesmo em monolito, as rotas de API devem nascer organizadas em versao:

- `/api/v1/...`

Objetivo:

- evolucao de contratos sem dor
- separacao clara entre rotas internas e externas

## Performance Strategy

Metas:

- Lighthouse acima de 95 nas paginas principais
- boa performance mobile

Diretrizes:

- Server Components por padrao
- Client Components somente quando necessarios
- streaming quando agregar UX
- image optimization
- lazy loading para secoes pesadas
- cache inteligente de leituras publicas
- tabelas e listas com renderizacao eficiente

## Folder Structure

```text
src/
  app/
    (public)/
    (auth)/
    (private)/
    api/
  components/
    layout/
    marketing/
    shared/
    data-table/
    forms/
    feedback/
    navigation/
  features/
    admin/
    attendance/
    auth/
    billing/
    check-in/
    community/
    events/
    groups/
    notifications/
    partners/
    rankings/
    search/
    tenants/
    users/
  hooks/
  lib/
    auth/
    db/
    env/
    security/
    utils/
    validations/
  styles/
prisma/
  schema.prisma
  seed.ts
public/
docs/
```

Adicoes estruturais relevantes:

- `features/uploads/` para `StorageProvider` e seus adapters
- `features/observability/` para logger, tracing hooks e analytics ports
- `features/feature-flags/` para avaliacao de flags
- `features/tenant-settings/` para configuracoes do tenant

## Seed Data

O seed deve entregar ambiente demonstravel, com:

- 1 tenant inicial: Sao Lourenco da Mata
- 1 admin
- 4 a 6 lideres de grupo
- 20+ corredores
- 6 a 10 grupos
- eventos passados e futuros entre treinos e corridas
- 8+ parceiros completos
- posts no feed
- presencas e check-ins
- snapshots de ranking
- conquistas concedidas
- notificacoes geradas
- dashboards com dados plausiveis

O objetivo do seed nao e apenas testar CRUD. O sistema deve parecer vivo e em uso real.

## Testing Strategy

Cobertura minima desta fase:

- validacoes Zod
- policies de autorizacao
- servicos criticos de presenca e check-in
- feature flags
- storage provider contracts
- smoke tests de paginas principais quando viavel
- validacao de build e lint sem warnings

## Business Readiness

Estrutura de monetizacao preparada:

- `PlanType` nas entidades relevantes
- campos para billing customer/subscription futuros
- limites e feature flags modelaveis por plano

Planos previstos:

- `FREE`
- `GROUP_PRO`
- `PARTNER`

Nao havera cobranca agora, mas a arquitetura nao pode bloquear essa evolucao.

## Implementation Phases

### Phase 1: Foundation

- scaffold do app
- Tailwind v4
- shadcn/ui
- env e providers
- Prisma e Auth.js

### Phase 2: Data And Domain

- schema Prisma
- migracoes
- seed nacional com tenant piloto
- services, policies e schemas por dominio

### Phase 3: Public Product Experience

- landing premium
- grupos
- eventos
- ranking
- parceiros
- SEO base

### Phase 4: Auth And Runner Experience

- cadastro e login
- perfil
- dashboard do corredor
- notificacoes base

### Phase 5: Group Operations

- dashboard do lider
- criacao e edicao de eventos
- confirmacao de presenca
- QR code e check-in
- feed comunitario

### Phase 6: Admin Operations

- moderacao de grupos
- moderacao de parceiros
- metricas gerais
- auditoria basica

### Phase 7: Polish And Verification

- estados vazios e loading
- refinamento mobile
- acessibilidade
- README
- lint
- build

## Risks And Tradeoffs

- O MVP mantera busca simples, sem engine dedicada.
- O tenant local sera resolvido por default; resolucao por dominio fica preparada, mas nao precisa estar completa nesta fase.
- O feed comunitario sera leve e sem comentarios.
- A pagina de parceiros e o feed exigem cuidado com uploads; no MVP, URLs fake ou imagens publicas podem ser usadas para seed e demos.
- A observabilidade sera preparada por interfaces; integracoes completas ficam para fase posterior.
- O uso de soft delete exige cuidado em queries administrativas e publicas para nao expor registros removidos.

## Success Criteria

Esta fase sera considerada bem sucedida quando:

- o projeto rodar localmente do zero
- houver seed completo para demonstracao
- a experiencia publica parecer produto premium, nao template
- autenticacao credentials estiver funcional
- Google login estiver preparado por env
- grupos e parceiros aprovados forem moderados corretamente
- check-in por QR/link estiver funcional
- dashboard do corredor, lider e admin estiverem navegaveis e coerentes
- lint e build passarem sem erro
- a base estiver preparada para expansao nacional
