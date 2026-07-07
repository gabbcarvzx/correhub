import { cache } from "react";
import { unstable_cache as nextCache } from "next/cache";
import { env } from "@/lib/env";

const CACHE_DURATIONS = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 300,
  VERY_LONG: 3600
} as const;

type CacheDuration = (typeof CACHE_DURATIONS)[keyof typeof CACHE_DURATIONS];

const tagPrefixes = {
  events: "events",
  groups: "groups",
  partners: "partners",
  rankings: "rankings",
  users: "users",
  dashboard: "dashboard"
} as const;

type TagPrefix = keyof typeof tagPrefixes;

function getRevalidationTags(prefix: TagPrefix, ...ids: string[]): string[] {
  return ids.length > 0
    ? ids.map((id) => `${tagPrefixes[prefix]}:${id}`)
    : [tagPrefixes[prefix]];
}

/**
 * Wraps a data-fetching function with React cache() and Next.js unstable_cache.
 *
 * @param fn - The async function to cache
 * @param keyParts - Unique key parts for cache identification
 * @param tags - Revalidation tags
 * @param duration - Cache duration in seconds
 */
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyParts: string[],
  tags: TagPrefix[],
  duration: CacheDuration = CACHE_DURATIONS.MEDIUM
): T {
  const reactCached = cache(fn);

  if (env.NODE_ENV === "development") {
    return reactCached;
  }

  return nextCache(
    async (...args: Parameters<T>) => reactCached(...args),
    keyParts,
    {
      revalidate: duration,
      tags: tags.flatMap((prefix) => getRevalidationTags(prefix))
    }
  ) as unknown as T;
}

export { CACHE_DURATIONS, getRevalidationTags };
