import { createClient } from "redis";

let client: ReturnType<typeof createClient> | undefined;
export async function redisClient() {
  if (!process.env.REDIS_URL) return null;
  client ??= createClient({ url: process.env.REDIS_URL });
  if (!client.isOpen) await client.connect();
  return client;
}

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const redis = await redisClient();
  if (!redis) return { allowed: true, retryAfter: 0 };
  const count = await redis.incr(`rate-limit:${key}`);
  if (count === 1) await redis.expire(`rate-limit:${key}`, windowSeconds);
  return {
    allowed: count <= limit,
    retryAfter: count > limit ? await redis.ttl(`rate-limit:${key}`) : 0,
  };
}
export async function cacheGet<T>(key: string) {
  const redis = await redisClient();
  const value = redis ? await redis.get(key) : null;
  return value ? (JSON.parse(value) as T) : null;
}
export async function cacheSet(key: string, value: unknown, seconds: number) {
  const redis = await redisClient();
  if (redis) await redis.set(key, JSON.stringify(value), { EX: seconds });
}
