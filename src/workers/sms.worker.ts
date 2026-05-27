import { Worker, Job } from "bullmq";
import Handlebars from "handlebars";
import { env } from "../config";
import { prisma } from "../prisma/client";

type SmsJob = {
  eventId:    string;
  payload:    Record<string, unknown>;
  templateId: string;
};

const connection = { url: env.REDIS_URL };

async function sendSms(to: string, body: string) {
  if (env.NODE_ENV === "production" && env.FAST2SMS_API_KEY) {
    // Fast2SMS — no template pre-approval needed
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": env.FAST2SMS_API_KEY,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        route:   "q",          // quick transactional route
        message: body,
        numbers: to,           // e.g. "9876543210" (no country code)
      }),
    });
    const data = await response.json();
    if (!data.return) throw new Error(`Fast2SMS error: ${JSON.stringify(data)}`);
  } else if (env.NODE_ENV === "production" && env.MSG91_API_KEY) {
    // MSG91 fallback
    const response = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey":       env.MSG91_API_KEY,
      },
      body: JSON.stringify({
        template_id: env.MSG91_TEMPLATE_ID,
        short_url:   "0",
        recipients:  [{ mobiles: to, body }],
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
}, { connection });