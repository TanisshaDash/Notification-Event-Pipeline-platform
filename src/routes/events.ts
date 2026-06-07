import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { fanoutQueue } from "../queues";
import { rateLimit } from "../plugins/rateLimit";

const ingestSchema = z.object({
  type:    z.string(),
  payload: z.record(z.unknown()),
});

export async function eventsRoute(app: FastifyInstance) {
  // POST /api/v1/events — rate limited to 100/min per user
  app.post("/events", {
    preHandler: rateLimit(100, 60),
  }, async (req, reply) => {
    const body = ingestSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const userId = (req as any).user.userId;

    const event = await prisma.event.create({
      data: {
        type:    body.data.type,
        payload: body.data.payload,
        userId,
      },
    });

    await fanoutQueue.add("process", {
      eventId:   event.id,
      eventType: event.type,
      payload:   body.data.payload,
      userId,
    });

    return reply.status(202).send({ eventId: event.id, status: "queued" });
  });

  // GET /api/v1/events
  app.get<{ Querystring: { page?: string; limit?: string } }>("/events", async (req) => {
    const userId = (req as any).user.userId;
    const page   = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limit  = Math.min(100, parseInt(req.query.limit ?? "20"));

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where:   { userId },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.count({ where: { userId } }),
    ]);

    return { events, total, page, limit };
  });
}