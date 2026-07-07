# CorreHub

Plataforma web para conectar grupos de corrida, corredores, lideres e parceiros locais. Arquitetura multi-tenant por cidade, com Sao Lourenco da Mata como tenant piloto.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL (Supabase)
- Auth.js (NextAuth v5)
- Zod
- React Hook Form
- TanStack Table

## Requisitos

- Node.js >= 18
- npm
- PostgreSQL (Supabase recomendado)
- Docker Desktop (para Supabase local, opcional)

## Instalacao

```bash
npm install
```

## Configuracao das envs

Copie o arquivo de exemplo e preencha as variaveis:

```bash
cp .env.example .env
```

As variaveis necessarias estao documentadas em `.env.example`. Nenhuma credencial real deve ser commitada.

## Execucao local

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Comandos disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm start` | Inicia servidor de producao |
| `npm run lint` | Verifica codigo com ESLint |
| `npm test` | Executa testes unitarios |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run db:generate` | Gera cliente Prisma |
| `npm run db:migrate` | Executa migrations Prisma |
| `npm run db:seed` | Popula banco com dados de exemplo |

## Estrutura do projeto

```
src/
  app/              # Rotas e paginas (App Router)
  components/       # Componentes compartilhados
  features/         # Modulos por dominio
    auth/           # Autenticacao
    check-in/       # Check-in em eventos
    attendance/     # Confirmacao de presenca
    events/         # Eventos
    groups/         # Grupos de corrida
    partners/       # Parceiros locais
    rankings/       # Rankings
    dashboard/      # Dashboards
    admin/          # Moderacao
    observability/  # Logging
  lib/              # Utilidades e config
    auth/           # Helpers de autenticacao
    security/       # Seguranca multi-tenant
  middleware.ts     # Edge middleware
prisma/
  schema.prisma     # Schema do banco
  migrations/       # Migrations
supabase/
  migrations/       # RLS policies
docs/               # Documentacao
```

## Credenciais demo (desenvolvimento)

As credenciais de desenvolvimento estao definidas em `prisma/seed.ts` e no arquivo `src/auth.ts` para fallback. NUNCA utilize estas contas em producao.

## Testes

```bash
npm test
```

## Seguranca

- RLS (Row Level Security) no Supabase
- Multi-tenant com isolamento por tenantId
- Validacao de input com Zod em todas APIs
- Rate limiting em endpoints criticos
- Logger estruturado com correlation IDs
- Security headers via middleware

Veja `docs/production-checklist.md` para o checklist completo de producao.
