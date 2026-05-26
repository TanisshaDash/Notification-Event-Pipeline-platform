import { Worker, Job } from "bullmq";
import Handlebars from "handlebars";
import { env } from "../env";
import { prisma } from "../prisma/client";

type PushJob = {
  eventId:    string;
  payload:    Record<string, unknown>;
  templateId: string;
};

const connection = { url: env.REDIS_URL };

async function sendPush(token: string, title: string, body: string) {
  if (env.NODE_ENV === "production" && env.FCM_SERVER_KEY) {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `key=${env.FCM_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: token,
        notification: { title, body },
      }),
    });
    if (!response.ok) throw new Error(`FCM error: ${response.statusText}`);
  } else {
    console.log(`[PUSH] To: ${token} | Title: ${title} | Body: ${body}`);
  }
}

new Worker<PushJob>("push", async (job: Job<PushJob>) => {
  const { eventId, payload, templateId } = job.data;

  const [template, log] = await Promise.all([
    prisma.notificationTemplate.findUniqueOrThrow({ where: { id: templateId } }),
    prisma.deliveryLog.findFirst({ where: { eventId, channel: "PUSH" } }),
  ]);

  if (!log) throw new Error("DeliveryLog not found");

  await prisma.deliveryLog.update({
    where: { id: log.id },
    data:  { attempts: { increment: 1 }, status: "SENT" },
  });

  const body  = Handlebars.compile(template.body)(payload);
  const title = template.subject ?? "Notification";
  const token = payload.fcmToken as string;

  await sendPush(token, title, body);

  await prisma.deliveryLog.update({
    where: { id: log.id },
    data:  { status: "DELIVERED", sentAt: new Date() },
  });
}, {
  connection,
});