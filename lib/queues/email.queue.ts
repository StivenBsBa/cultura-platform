import { Queue } from "bullmq";
export const emailQueue = process.env.REDIS_URL
  ? new Queue("email", { connection: { url: process.env.REDIS_URL } })
  : null;
