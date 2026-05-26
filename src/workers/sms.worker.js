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
async function sendSms(to, body) {
    if (env_1.env.NODE_ENV === "production" && env_1.env.MSG91_API_KEY) {
        const response = await fetch("https://api.msg91.com/api/v5/flow/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authkey": env_1.env.MSG91_API_KEY,
            },
            body: JSON.stringify({
                template_id: env_1.env.MSG91_TEMPLATE_ID,
                short_url: "0",
                recipients: [{ mobiles: to, body }],
            }),
        });
        if (!response.ok)
            throw new Error(`MSG91 error: ${response.statusText}`);
    }
    else {
        // Dev: just log
        console.log(`[SMS] To: ${to} | Body: ${body}`);
    }
}
new bullmq_1.Worker("sms", async (job) => {
    const { eventId, payload, templateId } = job.data;
    const [template, log] = await Promise.all([
        client_1.prisma.notificationTemplate.findUniqueOrThrow({ where: { id: templateId } }),
        client_1.prisma.deliveryLog.findFirst({ where: { eventId, channel: "SMS" } }),
    ]);
    if (!log)
        throw new Error("DeliveryLog not found");
    await client_1.prisma.deliveryLog.update({
        where: { id: log.id },
        data: { attempts: { increment: 1 }, status: "SENT" },
    });
    const body = handlebars_1.default.compile(template.body)(payload);
    const to = payload.phone;
    await sendSms(to, body);
    await client_1.prisma.deliveryLog.update({
        where: { id: log.id },
        data: { status: "DELIVERED", sentAt: new Date() },
    });
}, {
    connection,
});
