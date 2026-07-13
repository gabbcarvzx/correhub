/**
 * Storage Factory — retorna o StorageProvider adequado ao ambiente.
 *
 * v2.8:
 * - Provider retorna signed URLs (não URLs públicas)
 * - Bucket privado por padrão ("correhub-private")
 * - Verificação completa de Supabase config antes de instanciar
 *
 * Para usar:
 *   import { getStorageProvider } from "@/features/uploads/storage-factory";
 *   const storage = getStorageProvider();
 *   const { storageKey, signedUrl, expiresIn } = await storage.upload({ ... });
 */

import type { StorageProvider } from "@/features/uploads/storage-provider";
import { SupabaseStorageProvider } from "@/features/uploads/supabase-storage-provider";
import { LocalStorageProvider } from "@/features/uploads/local-storage-provider";

let provider: StorageProvider | null = null;

function hasSupabaseConfig(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Retorna a instância singleton do StorageProvider.
 *
 * Ordem de preferência:
 * 1. SupabaseStorageProvider (se SUPABASE_URL + SERVICE_ROLE_KEY configurados)
 * 2. LocalStorageProvider (lança erro — sem fallback mock)
 */
export function getStorageProvider(): StorageProvider {
  if (provider) return provider;

  provider = hasSupabaseConfig()
    ? new SupabaseStorageProvider()
    : new LocalStorageProvider();

  return provider;
}

/**
 * Reseta o provider (útil para testes).
 */
export function resetStorageProvider(): void {
  provider = null;
}
