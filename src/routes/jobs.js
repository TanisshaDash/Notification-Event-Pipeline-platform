"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRoute = jobsRoute;
const bullmq_1 = require("bullmq");
const env_1 = require("../env");
const connection = { url: env_1.env.REDIS_URL };
const queues = {
    email: new bullmq_1.Queue("email", { connection }),
    sms: new bullmq_1.Queue("sms", { connection }),
    push: new bullmq_1.Queue("push", { connection }),
    fanout: new bullmq_1.Queue("fanout", { connection }),
};
async function jobsRoute(app) {
    // Retry a failed/dead job
    app.post("/jobs/:queue/:id/retry", async (req, reply) => {
        const q = queues[req.params.queue];
        if (!q)
            return reply.status(400).send({ error: "Unknown queue" });
        const job = await q.getJob(req.params.id);
        if (!job)
            return reply.status(404).send({ error: "Job not found" });
        await job.retry();
        return { retried: true };
    });
    // Discard a dead job
    app.delete("/jobs/:queue/:id", async (req, reply) => {
        const q = queues[req.params.queue];
        if (!q)
            return reply.status(400).send({ error: "Unknown queue" });
        const job = await q.getJob(req.params.id);
        if (!job)
            return reply.status(404).send({ error: "Job not found" });
        await job.remove();
        return { removed: true };
    });
}
