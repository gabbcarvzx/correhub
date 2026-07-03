# CorreHub

CorreHub e uma plataforma web para conectar grupos de corrida, corredores, lideres e parceiros locais em uma experiencia unica, premium e mobile-first. O projeto nasce com arquitetura multi-tenant por cidade, tendo Sao Lourenco da Mata como tenant piloto.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- Auth.js
- Motion
- React Hook Form
- Zod
- TanStack Table

## Como instalar

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

3. Ajuste as variaveis:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/correhub?schema=public"
AUTH_SECRET="uma-chave-segura"
AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Banco e Prisma

Gerar o client Prisma:

```bash
npm run db:generate
```

Rodar migracoes locais:

```bash
npm run db:migrate -- --name init_correhub
```

Popular o banco com dados premium de demonstracao:

```bash
npm run db:seed
```

## Rodando localmente

```bash
npm run dev
```

Acesse:

- `/`
- `/agenda`
- `/grupos`
- `/ranking`
- `/parceiros`
- `/comunidade`
- `/dashboard`

## Credenciais demo

- Corredor: `runner@correhub.local` / `runner123`
- Lider: `lider@correhub.local` / `lider123`
- Admin: `admin@correhub.local` / `admin123`

## Verificacao

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Deploy na Vercel

1. Crie um banco PostgreSQL ou Neon.
2. Configure `DATABASE_URL`, `AUTH_SECRET` e `AUTH_URL` no projeto da Vercel.
3. Se quiser Google Login, configure `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
4. Rode `prisma migrate deploy` no pipeline ou em etapa de release.
5. Faça o deploy do app Next.js normalmente.

## Observacoes arquiteturais

- `tenantId` foi preparado para isolamento por cidade.
- slugs de grupos, parceiros e eventos devem ser tratados como imutaveis apos publicacao.
- o projeto inclui base para `FeatureFlag`, `TenantSettings`, `StorageProvider` e logging estruturado.
- o app atual entrega um MVP apresentavel com auth local demo, paginas publicas premium e dashboards protegidos.
