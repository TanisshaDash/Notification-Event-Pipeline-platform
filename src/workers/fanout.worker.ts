import { Worker } from "bullmq";
import { env } from "../env";
import { prisma } from "../prisma/client";
import { emailQueue, smsQueue, pushQueue, EventJob } from "../queues";

const connection = { url: env.REDIS_URL };

new Worker<EventJob>("fanout", async (job) => {
  const { eventId, eventType, payload } = job.data;

  // Find active templates for this event type
  const templates = await prisma.notificationTemplate.findMany({
    where: { eventType, active: true },
  });

  if (templates.length === 0) {
    console.warn(`No templates for event type: ${eventType}`);
    return;
  }

  await prisma.event.update({
    where: { id: eventId },
    data:  { status: "PROCESSING" },
  });

  // Fan out to per-channel queues
  for (const template of templates) {
    const jobData = { eventId, eventType, payload, templateId: template.id };

    if (template.channel === "EMAIL") await emailQueue.add("send", jobData);
    if (template.channel === "SMS")   await smsQueue.add("send",   jobData);
    if (template.channel === "PUSH")  await pushQueue.add("send",  jobData);

    // Create a delivery log entry
    await prisma.deliveryLog.create({
      data: {
        eventId,
        channel:  template.channel,
        provider: template.channel === "EMAIL" ? "sendgrid"
                : template.channel === "SMS"   ? "msg91"
                : "fcm",
        status: "QUEUED",
      },
    });
  }
}, { connection });