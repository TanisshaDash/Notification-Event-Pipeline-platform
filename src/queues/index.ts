import { Queue } from "bullmq";
import { env } from "../env";

const connection = { url: env.REDIS_URL };

export const fanoutQueue = new Queue("fanout",    { connection });
export const emailQueue  = new Queue("email",     { connection });
export const smsQueue    = new Queue("sms",       { connection });
export const pushQueue   = new Queue("push",      { connection });

export type EventJob = {
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
};