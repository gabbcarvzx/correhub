/**
 * @deprecated
 *
 * Serviços enterprise não utilizam mais fallback para dados demo.
 * Erros devem ser lançados e tratados explicitamente.
 *
 * Mantido apenas como stub para evitar breaking imports até
 * que todos os consumers sejam atualizados.
 */

export async function withFallback<T>(): Promise<T> {
  throw new Error(
    "withFallback was removed. Configure a real database connection " +
    "instead of relying on demo/mock data fallbacks."
  );
}
