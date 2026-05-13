import { FastifyInstance } from "fastify";
import { Queue } from "bullmq";
import { env } from "../env";

const connection = { url: env.REDIS_URL };
const queues: Record<string, Queue> = {
  email:  new Queue("email",  { connection }),
  sms:    new Queue("sms",    { connection }),
  push:   new Queue("push",   { connection }),
  fanout: new Queue("fanout", { connection }),
};

export async function jobsRoute(app: FastifyInstance) {
  // Retry a failed/dead job
  app.post<{ Params: { queue: string; id: string } }>("/jobs/:queue/:id/retry", async (req, reply) => {
    const q = queues[req.params.queue];
    if (!q) return reply.status(400).send({ error: "Unknown queue" });

    const job = await q.getJob(req.params.id);
    if (!job) return reply.status(404).send({ error: "Job not found" });

    await job.retry();
    return { retried: true };
  });

  // Discard a dead job
  app.delete<{ Params: { queue: string; id: string } }>("/jobs/:queue/:id", async (req, reply) => {
    const q = queues[req.params.queue];
    if (!q) return reply.status(400).send({ error: "Unknown queue" });

    const job = await q.getJob(req.params.id);
    if (!job) return reply.status(404).send({ error: "Job not found" });

    await job.remove();
    return { removed: true };
  });
}