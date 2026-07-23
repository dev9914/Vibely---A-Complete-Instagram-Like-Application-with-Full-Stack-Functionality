import { Queue } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";

const notificationQueueName = "notifications";

let notificationQueue = null;

const getQueue = () => {
  if (!notificationQueue) {
    notificationQueue = new Queue(notificationQueueName, {
      connection: getBullMQConnection(),
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 500,
        },
        removeOnFail: {
          age: 86400,
          count: 1000,
        },
      },
    });

    notificationQueue.on("error", (err) => {
      console.warn("⚠ Notification Queue Error:", err.message);
    });
  }

  return notificationQueue;
};

export const getNotificationQueue = () => getQueue();

export const enqueueNotificationJob = async (
  userId,
  notification,
  jobOptions = {}
) => {
  try {
    const queue = getQueue();

    const job = await queue.add(
      "send-notification",
      {
        userId,
        notification,
      },
      jobOptions
    );

    console.log("✓ Notification job queued", {
      queue: notificationQueueName,
      jobId: job.id,
      userId,
      type: notification?.type,
    });

    return job;
  } catch (err) {
    console.warn(
      "⚠ Notification queue unavailable. Skipping notification.",
      err.message
    );

    return null;
  }
};

export { notificationQueue };
export { notificationQueueName };