import Redis from "ioredis";

/**
 * Global Redis connection singleton to prevent connection pool exhaustion during Next.js reloads.
 */
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

function createRedisInstance() {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 5000,
    retryStrategy(times) {
      // Exponential backoff with a maximum delay of 3000ms
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  });

  client.on("connect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[REDIS] Successfully connected to in-memory store.");
    }
  });

  client.on("error", (error) => {
    console.error("[REDIS] Connection error encountered:", error.message);
  });

  return client;
}

const globalForRedis = globalThis;

export const redis = globalForRedis.redisInstance || createRedisInstance();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisInstance = redis;
}

/**
 * Validates connection health against Redis instance.
 * @returns {Promise<boolean>}
 */
export async function isRedisHealthy() {
  try {
    const pingResponse = await redis.ping();
    return pingResponse === "PONG";
  } catch {
    return false;
  }
}
