import type { MonthlyData } from "./timeAggUtils";

export interface CacheData {
  followerStats: MonthlyData;
  followStats: MonthlyData;
  timestamp: number;
}

export interface CloudflareEnv {
  BLUESKY_FUN_KV: KVNamespace;
}

export const CACHE_DURATION = 60 * 60; // 1 hour in seconds

export async function getCachedStats(
  actor: string,
  env: CloudflareEnv
): Promise<CacheData | null> {
  try {
    const cacheKey = `stats-${actor}`;
    const cached = await env.BLUESKY_FUN_KV.get(cacheKey, "json");

    if (cached) {
      const data = cached as CacheData;
      const age = Date.now() / 1000 - data.timestamp;

      // If cache is still fresh, return it
      if (age < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error("Cache error:", error);
    return null;
  }
}

export async function setCachedStats(
  actor: string,
  data: { followerStats: MonthlyData; followStats: MonthlyData },
  env: CloudflareEnv
): Promise<void> {
  try {
    const cacheKey = `stats-${actor}`;
    const cacheData: CacheData = {
      ...data,
      timestamp: Date.now() / 1000,
    };
    await env.BLUESKY_FUN_KV.put(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}
