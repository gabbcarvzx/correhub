/**
 * Clientes Supabase estruturados para CorreHub.
 *
 * Arquitetura:
 * - `createServerClient()` → usado apenas em Server Components e Route Handlers
 * - `createServiceClient()` → usado apenas em Admin/Background (NUNCA exposto ao client)
 * - `createBrowserClient()` → usado apenas em Client Components
 *
 * Regras:
 * - NUNCA use service_role_key no client-side
 * - SEMPRE valide tenantId antes de queries multi-tenant
 * - TODO erro Supabase deve ser logado com logger.error()
 */

import { createServerClient as _createServerClient, createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { createClient as _createDirectClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { logger } from "@/features/observability/logger";

function getSupabaseUrl(label: string): string {
  const url = env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    const msg = `[Supabase] ${label}: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL não configurada`;
    logger.error("supabase.missing_url", { context: label });
    throw new Error(msg);
  }
  return url;
}

function getAnonKey(label: string): string {
  const key = env.SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    const msg = `[Supabase] ${label}: SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada`;
    logger.error("supabase.missing_anon_key", { context: label });
    throw new Error(msg);
  }
  return key;
}

function getServiceRoleKey(label: string): string {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    const msg = `[Supabase] ${label}: SUPABASE_SERVICE_ROLE_KEY não configurada`;
    logger.error("supabase.missing_service_role", { context: label });
    throw new Error(msg);
  }
  return env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Cria um cliente Supabase para uso em Server Components e API Routes.
 * Usa anon key (com RLS restrictions).
 */
export async function createServerClient() {
  const supabaseUrl = getSupabaseUrl("server");
  const supabaseAnonKey = getAnonKey("server");

  const cookieStore = await cookies();

  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
    auth: {
      flowType: "pkce",
    },
  });
}

/**
 * Cria um cliente Supabase para uso APENAS em Admin/Background.
 * NUNCA use em Route Handlers expostos ao client-side.
 * NUNCA retorne dados sensíveis.
 */
export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl("service");
  const serviceRoleKey = getServiceRoleKey("service");

  if (typeof window !== "undefined") {
    logger.error("supabase.service_role_on_client", {});
    throw new Error("[Supabase] createServiceClient() chamado no client-side!");
  }

  // Service client não precisa de cookies — usa createClient direto
  return _createDirectClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Cria um cliente Supabase para uso em Client Components.
 * Usa anon key (com RLS restrictions).
 * NUNCA faz operações que requeiram service_role.
 */
export function createBrowserClient() {
  const supabaseUrl = getSupabaseUrl("browser");
  const supabaseAnonKey = getAnonKey("browser");

  return _createBrowserClient(supabaseUrl, supabaseAnonKey);
}
