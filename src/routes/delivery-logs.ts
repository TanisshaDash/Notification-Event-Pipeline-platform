import { FastifyInstance } from "fastify";
import { prisma } from "../prisma/client";

export async function deliveryLogsRoute(app: FastifyInstance) {
  app.get<{ Querystring: { status?: string; page?: string } }>("/delivery-logs", async (req) => {
    const page  = Math.max(1, parseInt(req.query.page ?? "1"));
    const where = req.query.status ? { status: req.query.status as any } : {};

    const [logs, total] = await Promise.all([
      prisma.deliveryLog.findMany({
        where,
        skip:    (page - 1) * 20,
        take:    20,
        orderBy: { createdAt: "desc" },
        include: { event: { select: { type: true } } },
      }),
      prisma.deliveryLog.count({ where }),
    ]);

    return { logs, total, page };
  });

  app.get<{ Params: { id: string } }>("/delivery-logs/:id", async (req, reply) => {
    const log = await prisma.deliveryLog.findUnique({
      where:   { id: req.params.id },
      include: { event: true },
    });
    if (!log) return reply.status(404).send({ error: "Not found" });
    return log;
  });
}