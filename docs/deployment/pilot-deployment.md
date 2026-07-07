# Pilot Deployment

## Objetivo

Publicar o CorreHub para piloto real com usuarios de Sao Lourenco da Mata usando staging como gate obrigatorio.

## Ambientes

- Desenvolvimento: `.env` local com fallback demo preservado.
- Staging: Supabase separado ou branch Supabase com seed controlado.
- Producao: Supabase principal com RLS aplicado somente apos validacao.

## Ordem Recomendada

1. Criar ou confirmar staging.
2. Aplicar migrations em staging.
3. Rodar seed de staging.
4. Validar fluxos publicos e autenticados.
5. Rodar validacao local completa.
6. Fazer backup de producao.
7. Aplicar migrations em producao.
8. Validar smoke test em producao.

## Comandos

```bash
npm run lint
npm test
npm run build
npm run typecheck
```

## Rollback

- Se uma policy bloquear leitura publica esperada, remover somente a policy afetada.
- Se uma migration quebrar fluxo critico, restaurar backup de producao.
- Se o problema estiver no frontend, reverter deploy sem alterar banco.
