import '../config/env.js';

import connectDb, { disconnectDb } from '../db/DbConnect.js';
import { connectRedis, disconnectRedis } from '../../config/redis.js';
import { connectBullMQ, disconnectBullMQ } from '../../config/bullmq.js';
import { initializeFirebaseAdmin } from '../utils/firebaseAdmin.js';

const buildSteps = ({ enableBullMQ = true, enableFirebase = true } = {}) => {
  const steps = [
    { label: 'MongoDB', action: () => connectDb() },
    { label: 'Redis', action: () => connectRedis() },
  ];

  if (enableBullMQ) {
    steps.push({ label: 'BullMQ Redis', action: () => connectBullMQ() });
  }

  if (enableFirebase) {
    steps.push({ label: 'Firebase', action: () => initializeFirebaseAdmin() });
  }

  return steps;
};

export const initializeRuntime = async (
  role,
  { enableBullMQ = true, enableFirebase = true } = {}
) => {
  console.log(`▶ Starting ${role} runtime`);

  for (const step of buildSteps({ enableBullMQ, enableFirebase })) {
    try {
      await step.action();
    } catch (error) {
      console.error(`❌ ${role} failed while initializing ${step.label}:`, error?.stack || error);
      throw error;
    }
  }

  console.log(`✓ ${role} runtime initialized`);
};

export const shutdownRuntime = async (role) => {
  console.log(`⚠️ Shutting down ${role} runtime`);

  await Promise.allSettled([
    disconnectBullMQ(),
    disconnectRedis(),
    disconnectDb(),
  ]);

  console.log(`✓ ${role} runtime shutdown complete`);
};
