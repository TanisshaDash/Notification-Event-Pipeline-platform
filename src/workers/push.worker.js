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
async function sendPush(token, title, body) {
    if (env_1.env.NODE_ENV === "production" && env_1.env.FCM_SERVER_KEY) {
        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${env_1.env.FCM_SERVER_KEY}`,
            },
            body: JSON.stringify({
                to: token,
                notification: { title, body },
            }),
        });
        if (!response.ok)
            throw new Error(`FCM error: ${response.statusText}`);
    }
    else {
        console.log(`[PUSH] To: ${token} | Title: ${title} | Body: ${body}`);
    }
}
new bullmq_1.Worker("push", async (job) => {
    const { eventId, payload, templateId } = job.data;
    const [template, log] = await Promise.all([
        client_1.prisma.notificationTemplate.findUniqueOrThrow({ where: { id: templateId } }),
        client_1.prisma.deliveryLog.findFirst({ where: { eventId, channel: "PUSH" } }),
    ]);
    if (!log)
        throw new Error("DeliveryLog not found");
    await client_1.prisma.deliveryLog.update({
        where: { id: log.id },
        data: { attempts: { increment: 1 }, status: "SENT" },
    });
    const body = handlebars_1.default.compile(template.body)(payload);
    const title = template.subject ?? "Notification";
    const token = payload.fcmToken;
    await sendPush(token, title, body);
    await client_1.prisma.deliveryLog.update({
        where: { id: log.id },
        data: { status: "DELIVERED", sentAt: new Date() },
    });
}, {
    connection,
});
