"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const handlebars_1 = __importDefault(require("handlebars"));
const env_1 = require("../env");
const client_1 = require("../prisma/client");
const connection = { url: env_1.env.REDIS_URL };
async function sendEmail(to, subject, html) {
    // Swap for Nodemailer in dev, SendGrid in prod
    if (env_1.env.NODE_ENV === "production" && env_1.env.SENDGRID_API_KEY) {
        const sgMail = await import("@sendgrid/mail");
        sgMail.default.setApiKey(env_1.env.SENDGRID_API_KEY);
        await sgMail.default.send({ to, from: "noreply@yourdomain.com", subject, html });
    }
    else {
        // Dev: just log
        console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    }
}
new bullmq_1.Worker("email", async (job) => {
    const { eventId, payload, templateId } = job.data;
    const [template, log] = await Promise.all([
        client_1.prisma.notificationTemplate.findUniqueOrThrow({ where: { id: templateId } }),
        client_1.prisma.deliveryLog.findFirst({ where: { eventId, channel: "EMAIL" } }),
    ]);
    if (!log)
        throw new Error("DeliveryLog not found");
    await client_1.prisma.deliveryLog.update({
        where: { id: log.id },
        data: { attempts: { increment: 1 }, status: "SENT" },
    });
    const html = handlebars_1.default.compile(template.body)(payload);
    const subject = template.subject ?? "Notification";
    const to = payload.email;
    await sendEmail(to, subject, html);
    await client_1.prisma.deliveryLog.update({
        where: { id: log.id },
        data: { status: "DELIVERED", sentAt: new Date() },
    });
}, {
    connection,
});
