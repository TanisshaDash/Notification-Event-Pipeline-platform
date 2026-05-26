"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const env_1 = require("../env");
const client_1 = require("../prisma/client");
const queues_1 = require("../queues");
const connection = { url: env_1.env.REDIS_URL };
new bullmq_1.Worker("fanout", async (job) => {
    const { eventId, eventType, payload } = job.data;
    // Find active templates for this event type
    const templates = await client_1.prisma.notificationTemplate.findMany({
        where: { eventType, active: true },
    });
    if (templates.length === 0) {
        console.warn(`No templates for event type: ${eventType}`);
        return;
    }
    await client_1.prisma.event.update({
        where: { id: eventId },
        data: { status: "PROCESSING" },
    });
    // Fan out to per-channel queues
    for (const template of templates) {
        const jobData = { eventId, eventType, payload, templateId: template.id };
        if (template.channel === "EMAIL")
            await queues_1.emailQueue.add("send", jobData);
        if (template.channel === "SMS")
            await queues_1.smsQueue.add("send", jobData);
        if (template.channel === "PUSH")
            await queues_1.pushQueue.add("send", jobData);
        // Create a delivery log entry
        await client_1.prisma.deliveryLog.create({
            data: {
                eventId,
                channel: template.channel,
                provider: template.channel === "EMAIL" ? "sendgrid"
                    : template.channel === "SMS" ? "msg91"
                        : "fcm",
                status: "QUEUED",
            },
        });
    }
}, { connection });
