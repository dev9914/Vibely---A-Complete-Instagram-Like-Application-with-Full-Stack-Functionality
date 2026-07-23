import "../src/config/env.js";

import {
  initializeRuntime,
  shutdownRuntime,
} from "../src/bootstrap/runtime.js";

import {
  startNotificationWorker,
  stopNotificationWorker,
} from "./startNotificationWorker.js";

const start = async () => {
  try {
    await initializeRuntime("notification-worker", {
      enableBullMQ: false,
    });

    await startNotificationWorker();

    console.log("✓ Worker started");
  } catch (err) {
    console.error("❌ Failed to start worker:", err?.stack || err);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`⚠️ Received ${signal}, shutting down worker`);

  await stopNotificationWorker();
  await shutdownRuntime("notification-worker");

  process.exit(0);
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

start();