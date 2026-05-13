import { Worker, Job } from "bullmq";
import Handlebars from "handlebars";
import { env } from "../env";
import { prisma } from "../prisma/client";

type EmailJob = {
  eventId:    string;
  payload:    Record<string, unknown>;
  templateId: string;
};

const connection = { url: env.REDIS_URL };

async function sendEmail(to: string, subject: string, html: string) {
  // Swap for Nodemailer in dev, SendGrid in prod
  if (env.NODE_ENV === "production" && env.SENDGRID_API_KEY) {
    const sgMail = await import("@sendgrid/mail");
    sgMail.default.setApiKey(env.SENDGRID_API_KEY);
    await sgMail.default.send({ to, from: "noreply@yourdomain.com", subject, html });
  } else {
    // Dev: just log
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  }
}

new Worker<EmailJob>("email", async (job: Job<EmailJob>) => {
  const { eventId, payload, templateId } = job.data;

  const [template, log] = await Promise.all([
    prisma.notificationTemplate.findUniqueOrThrow({ where: { id: templateId } }),
    prisma.deliveryLog.findFirst({ where: { eventId, channel: "EMAIL" } }),
  ]);

  if (!log) throw new Error("DeliveryLog not found");

  await prisma.deliveryLog.update({
    where: { id: log.id },
    data:  { attempts: { increment: 1 }, status: "SENT" },
  });

  const html    = Handlebars.compile(template.body)(payload);
  const subject = template.subject ?? "Notification";
  const to      = payload.email as string;

  await sendEmail(to, subject, html);

  await prisma.deliveryLog.update({
    where: { id: log.id },
    data:  { status: "DELIVERED", sentAt: new Date() },
  });
}, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 }, // 5s → 25s → 125s
  },
});