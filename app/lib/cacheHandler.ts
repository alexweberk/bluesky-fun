import { type TimeAggregatedData } from "./timeAggUtils";

export interface CacheData {
  followerStats: TimeAggregatedData;
  followStats: TimeAggregatedData;
  weeklyFollowerStats: TimeAggregatedData;
  weeklyFollowStats: TimeAggregatedData;
  dailyFollowerStats: TimeAggregatedData;
  dailyFollowStats: TimeAggregatedData;
  timestamp: number;
}

export const CACHE_DURATION = 60 * 60; // 1 hour in seconds
const LIKES_KEY = "project_likes";

export async function getCachedStats(
  actor: string,
  env: Env
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
  data: {
    followerStats: TimeAggregatedData;
    followStats: TimeAggregatedData;
    weeklyFollowerStats: TimeAggregatedData;
    weeklyFollowStats: TimeAggregatedData;
    dailyFollowerStats: TimeAggregatedData;
    dailyFollowStats: TimeAggregatedData;
  },
  env: Env
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

export async function getLikesCount(env: Env): Promise<number> {
  try {
    const count = await env.BLUESKY_FUN_KV.get(LIKES_KEY);
    return count ? parseInt(count) : 0;
  } catch (error) {
    console.error("Error getting likes count:", error);
    return 0;
  }
}

export async function incrementLikes(env: Env): Promise<number | null> {
  try {
    const currentCount = await getLikesCount(env);
    const newCount = currentCount + 1;
    await env.BLUESKY_FUN_KV.put(LIKES_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error("Error incrementing likes:", error);
    return null;
  }
}

export async function clearCacheForActor(
  actor: string,
  env: Env
): Promise<void> {
  try {
    const cacheKey = `stats-${actor}`;
    await env.BLUESKY_FUN_KV.delete(cacheKey);
  } catch (error) {
    console.error("Error clearing cache:", error);
    throw error;
  }
}
