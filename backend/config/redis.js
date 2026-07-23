import { createClient } from "redis";
import "../src/config/env.js";

let redisClient;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: process.env.REDIS_URL?.startsWith("rediss://")
        ? {
            tls: true,
          }
        : undefined,
    });

    redisClient.on("ready", () => {
      console.log("✓ Redis ready");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
    });

    redisClient.on("reconnecting", () => {
      console.warn("⚠ Redis reconnecting...");
    });
  }

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();

  if (client.isOpen) {
    return client;
  }

  await client.connect();

  return client;
};

export const disconnectRedis = async () => {
  const client = getRedisClient();

  if (client.isOpen) {
    await client.quit();
  }
};

export default getRedisClient;