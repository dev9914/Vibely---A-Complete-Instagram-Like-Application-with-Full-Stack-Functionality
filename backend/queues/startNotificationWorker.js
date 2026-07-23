import { Worker } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";
import { sendNotificationToUser } from "../src/services/notifications/notification.service.js";
import { notificationQueueName } from "./notification.queue.js";

let worker = null;

const parseConcurrency = () => {
  const raw = Number.parseInt(
    process.env.NOTIFICATION_WORKER_CONCURRENCY || "5",
    10
  );

  return Number.isFinite(raw) && raw > 0 ? raw : 5;
};

const validateJobData = (jobData) => {
  if (!jobData || typeof jobData !== "object") {
    throw new Error("Job data is missing");
  }

  const { userId, notification } = jobData;

  if (!userId) {
    throw new Error("Notification job is missing userId");
  }

  if (!notification || typeof notification !== "object") {
    throw new Error("Notification job is missing notification payload");
  }

  return { userId, notification };
};

export const startNotificationWorker = async () => {
  if (worker) {
    return worker;
  }

  worker = new Worker(
    notificationQueueName,
    async (job) => {
      console.log("✓ Job received", {
        id: job.id,
        name: job.name,
        attemptsMade: job.attemptsMade,
      });

      const { userId, notification } = validateJobData(job.data);

      const result = await sendNotificationToUser(userId, notification);

      console.log("✓ Notification created", {
        jobId: job.id,
        notificationId: result?.notification?._id,
        pushSent: result?.pushSent,
      });

      if (result?.pushSent) {
        console.log("✓ Push sent", {
          jobId: job.id,
        });
      }

      return result;
    },
    {
      connection: getBullMQConnection(),
      concurrency: parseConcurrency(),
    }
  );

  worker.on("completed", (job) => {
    console.log("✓ Job completed", {
      id: job.id,
      name: job.name,
    });
  });

  worker.on("failed", (job, err) => {
    console.error("❌ Job failed", {
      id: job?.id,
      name: job?.name,
      attemptsMade: job?.attemptsMade,
      error: err?.stack || err?.message || err,
    });
  });

  worker.on("error", (err) => {
    console.error("❌ Worker runtime error:", err);
  });

  console.log("✓ Notification worker started");

  return worker;
};

export const stopNotificationWorker = async () => {
  if (!worker) return;

  try {
    await worker.close();
    console.log("✓ Notification worker stopped");
  } catch (err) {
    console.error("❌ Error closing worker:", err);
  }

  worker = null;
};