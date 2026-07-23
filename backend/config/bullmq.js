import IORedis from "ioredis";
import "../src/config/env.js";

let redisConnection = null;
let handlersAttached = false;

const STARTUP_TIMEOUT_MS = 5000;

const withTimeout = (promise, timeoutMs, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);

const getBullMQConnection = () => {
  if (!redisConnection) {
    redisConnection = new IORedis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        lazyConnect: true,
        retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
      }
    );
  }

  if (!handlersAttached) {
    redisConnection.on("ready", () => {
      console.log("✓ BullMQ Redis ready");
    });

    redisConnection.on("reconnecting", () => {
      console.warn("⚠️ BullMQ Redis reconnecting");
    });

    redisConnection.on("error", (error) => {
      console.error("❌ BullMQ Redis error:", error);
    });

    handlersAttached = true;
  }

  return redisConnection;
};

export const connectBullMQ = async () => {
  const connection = getBullMQConnection();
  if (connection.status === "ready") {
    return connection;
  }

  try {
    if (connection.status === "wait" || connection.status === "end") {
      await withTimeout(connection.connect(), STARTUP_TIMEOUT_MS, "BullMQ Redis connect");
    }

    await withTimeout(connection.ping(), STARTUP_TIMEOUT_MS, "BullMQ Redis ping");
  } catch (error) {
    try {
      connection.disconnect(false);
    } catch {
      // ignore secondary disconnect errors
    }

    throw new Error(`BullMQ Redis startup failed: ${error?.message || error}`);
  }

  return connection;
};

export const disconnectBullMQ = async () => {
  const connection = getBullMQConnection();
  if (connection.status !== "end") {
    await connection.quit();
    console.log("✓ BullMQ Redis disconnected");
  }
};

export { getBullMQConnection, redisConnection };