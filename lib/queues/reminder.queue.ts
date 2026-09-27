import { Queue } from "bullmq";
export const reminderQueue = process.env.REDIS_URL
  ? new Queue("reminder", { connection: { url: process.env.REDIS_URL } })
  : null;
