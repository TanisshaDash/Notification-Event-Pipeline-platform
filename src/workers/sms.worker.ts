import { Worker, Job } from "bullmq";
import Handlebars from "handlebars";
import { env } from "../env";
import { prisma } from "../prisma/client";

type SmsJob = {
  eventId:    string;
  payload:    Record<string, unknown>;
  templateId: string;
};

const connection = { url: env.REDIS_URL };

async function sendSms(to: string, body: string) {
  if (env.NODE_ENV === "production" && env.MSG91_API_KEY) {
    const response = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": env.MSG91_API_KEY,
      },
      body: JSON.stringify({
        template_id: env.MSG91_TEMPLATE_ID,
        short_url:   "0",
        recipients: [{ mobiles: to, body }],
      }),
    });
    if (!response.ok) throw new Error(`MSG91 error: ${response.statusText}`);
  } else {
    // Dev: just log
    console.log(`[SMS] To: ${to} | Body: ${body}`);
  }
}

new Worker<SmsJob>("sms", async (job: Job<SmsJob>) => {
  const { eventId, payload, templateId } = job.data;

  const [template, log] = await Promise.all([
    prisma.notificationTemplate.findUniqueOrThrow({ where: { id: templateId } }),
    prisma.deliveryLog.findFirst({ where: { eventId, channel: "SMS" } }),
  ]);

  if (!log) throw new Error("DeliveryLog not found");

  await prisma.deliveryLog.update({
    where: { id: log.id },
    data:  { attempts: { increment: 1 }, status: "SENT" },
  });

  const body = Handlebars.compile(template.body)(payload);
  const to   = payload.phone as string;

  await sendSms(to, body);

  await prisma.deliveryLog.update({
    where: { id: log.id },
    data:  { status: "DELIVERED", sentAt: new Date() },
  });
}, {
  connection,
});