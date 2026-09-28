import Redis from "ioredis";

/**
 * Global Redis connection singleton to prevent connection pool exhaustion during Next.js reloads.
 */
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

function createRedisInstance() {
  const isTls = REDIS_URL.startsWith("rediss://");

  const options = {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
    keepAlive: 10000, // Prevents cloud firewalls from dropping idle socket connections
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  };

  if (isTls) {
    options.tls = {
      // Allows connecting to Cloud Redis with TLS in-transit encryption
      rejectUnauthorized: process.env.REDIS_ALLOW_SELF_SIGNED ? false : true,
    };
  }

  const client = new Redis(REDIS_URL, options);

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
