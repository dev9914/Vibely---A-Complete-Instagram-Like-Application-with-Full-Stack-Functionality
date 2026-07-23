import { createClient } from "redis";
import "../src/config/env.js";

let redisClient = null;
let eventHandlersAttached = false;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    });
  }

  if (!eventHandlersAttached) {
    redisClient.on("connect", () => {
      console.log("✓ Redis connected");
    });

    redisClient.on("ready", () => {
      console.log("✓ Redis ready");
    });

    redisClient.on("reconnecting", () => {
      console.warn("⚠️ Redis reconnecting");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis error:", err);
    });

    eventHandlersAttached = true;
  }

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

export const disconnectRedis = async () => {
  const client = getRedisClient();
  if (client.isOpen) {
    await client.quit();
    console.log("✓ Redis disconnected");
  }
};

export { getRedisClient };
export default getRedisClient();