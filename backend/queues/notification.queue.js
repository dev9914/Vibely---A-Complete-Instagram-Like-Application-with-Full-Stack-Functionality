import { Queue } from "bullmq";
import { getBullMQConnection } from "../config/bullmq.js";

const notificationQueueName = "notifications";

let notificationQueue = null;

const queueOptions = {
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
};

export const getNotificationQueue = () => {
  if (!notificationQueue) {
    notificationQueue = new Queue(notificationQueueName, queueOptions);
  }

  return notificationQueue;
};

export const enqueueNotificationJob = async (userId, notification, jobOptions = {}) => {
  const queue = getNotificationQueue();

  const job = await queue.add(
    "send-notification",
    { userId, notification },
    jobOptions,
  );

  console.log("✓ Notification job queued", {
    queue: notificationQueueName,
    jobId: job.id,
    userId,
    type: notification?.type,
  });

  return job;
};

export { notificationQueue };
export { notificationQueueName };