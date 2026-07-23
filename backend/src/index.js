import { server } from './utils/socket.js';
import './config/env.js';
import { initializeRuntime, shutdownRuntime } from './bootstrap/runtime.js';
import {
  startNotificationWorker,
  stopNotificationWorker,
} from "../queues/startNotificationWorker.js";

const port = process.env.PORT || 5000;

const shutdown = async (signal) => {
  console.log(`⚠️ Received ${signal}, shutting down server`);

  server.close(async () => {
    await shutdownRuntime('http-server');
    process.exit(0);
  });
};

const start = async () => {
  try {
    await initializeRuntime('http-server');

    await startNotificationWorker();

    server.listen(port, () => {
      console.log(`✓ HTTP server listening on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error?.stack || error);
    process.exit(1);
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

start();