import "../config/env.js";

import connectDb, { disconnectDb } from "../db/DbConnect.js";
import { connectRedis, disconnectRedis } from "../../config/redis.js";
import { connectBullMQ, disconnectBullMQ } from "../../config/bullmq.js";
import { initializeFirebaseAdmin } from "../utils/firebaseAdmin.js";

export const initializeRuntime = async (
  role,
  { enableBullMQ = true, enableFirebase = true } = {}
) => {
  console.log(`▶ Starting ${role} runtime`);

  // ==========================
  // MongoDB (Required)
  // ==========================
  try {
    await connectDb();
    console.log("✓ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    throw err;
  }

  // ==========================
  // Redis (Optional)
  // ==========================
  let redisAvailable = false;

  try {
    await connectRedis();
    redisAvailable = true;
    console.log("✓ Redis connected");
  } catch (err) {
    console.warn("⚠ Redis unavailable. Queue features disabled.");
  }

  // ==========================
  // BullMQ (Optional)
  // ==========================
  if (enableBullMQ && redisAvailable) {
    try {
      await connectBullMQ();
      console.log("✓ BullMQ connected");
    } catch (err) {
      console.warn("⚠ BullMQ unavailable.");
    }
  }

  // ==========================
  // Firebase (Optional)
  // ==========================
  if (enableFirebase) {
    try {
      await initializeFirebaseAdmin();
      console.log("✓ Firebase initialized");
    } catch (err) {
      console.warn("⚠ Firebase initialization failed.");
    }
  }

  console.log(`✓ ${role} runtime initialized`);
};

export const shutdownRuntime = async (role) => {
  console.log(`⚠ Shutting down ${role} runtime`);

  await Promise.allSettled([
    disconnectBullMQ(),
    disconnectRedis(),
    disconnectDb(),
  ]);

  console.log(`✓ ${role} runtime shutdown complete`);
};