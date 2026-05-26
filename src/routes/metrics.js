"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRoute = metricsRoute;
const bullmq_1 = require("bullmq");
const env_1 = require("../env");
const connection = { url: env_1.env.REDIS_URL };
const queueNames = ["fanout", "email", "sms", "push"];
const queues = queueNames.map((name) => ({ name, q: new bullmq_1.Queue(name, { connection }) }));
async function metricsRoute(app) {
    // GET /api/v1/metrics — snapshot
    app.get("/metrics", async () => {
        const stats = await Promise.all(queues.map(async ({ name, q }) => ({
            name,
            waiting: await q.getWaitingCount(),
            active: await q.getActiveCount(),
            completed: await q.getCompletedCount(),
            failed: await q.getFailedCount(),
            delayed: await q.getDelayedCount(),
        })));
        return { queues: stats, timestamp: new Date().toISOString() };
    });
    // GET /api/v1/metrics/stream — SSE live stream
    app.get("/metrics/stream", (req, reply) => {
        reply.raw.setHeader("Content-Type", "text/event-stream");
        reply.raw.setHeader("Cache-Control", "no-cache");
        reply.raw.setHeader("Connection", "keep-alive");
        reply.raw.flushHeaders();
        const send = async () => {
            const stats = await Promise.all(queues.map(async ({ name, q }) => ({
                name,
                waiting: await q.getWaitingCount(),
                active: await q.getActiveCount(),
                failed: await q.getFailedCount(),
                completed: await q.getCompletedCount(),
            })));
            reply.raw.write(`data: ${JSON.stringify({ queues: stats })}\n\n`);
        };
        const interval = setInterval(send, 3000);
        send();
        req.raw.on("close", () => clearInterval(interval));
    });
}
