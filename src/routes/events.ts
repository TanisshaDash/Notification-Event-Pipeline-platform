import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { fanoutQueue } from "../queues";

const ingestSchema = z.object({
  type:    z.string(),
  payload: z.record(z.unknown()),
});

export async function eventsRoute(app: FastifyInstance) {
  // POST /api/v1/events — ingest a new event
  app.post("/events", async (req, reply) => {
    const body = ingestSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const event = await prisma.event.create({
      data: { type: body.data.type, payload: body.data.payload },
    });

    await fanoutQueue.add("process", {
      eventId:   event.id,
      eventType: event.type,
      payload:   body.data.payload,
    });

    return reply.status(202).send({ eventId: event.id, status: "queued" });
  });

  // GET /api/v1/events — list with pagination
  app.get<{ Querystring: { page?: string; limit?: string } }>("/events", async (req) => {
    const page  = Math.max(1, parseInt(req.query.page  ?? "1"));
    const limit = Math.min(100, parseInt(req.query.limit ?? "20"));

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.count(),
    ]);

    return { events, total, page, limit };
  });
}