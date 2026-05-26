import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma/client";

const createSchema = z.object({
  eventType: z.string(),
  channel:   z.enum(["EMAIL", "SMS", "PUSH"]),
  subject:   z.string().optional(),
  body:      z.string(),
  active:    z.boolean().default(true),
});

export async function templatesRoute(app: FastifyInstance) {
  // GET /api/v1/templates
  app.get("/templates", async () => {
    return prisma.notificationTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
  });

  // GET /api/v1/templates/:id
  app.get<{ Params: { id: string } }>("/templates/:id", async (req, reply) => {
    const t = await prisma.notificationTemplate.findUnique({ where: { id: req.params.id } });
    if (!t) return reply.status(404).send({ error: "Not found" });
    return t;
  });

  // POST /api/v1/templates
  app.post("/templates", async (req, reply) => {
    const body = createSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const t = await prisma.notificationTemplate.create({ data: body.data });
    return reply.status(201).send(t);
  });

  // PATCH /api/v1/templates/:id
  app.patch<{ Params: { id: string } }>("/templates/:id", async (req, reply) => {
    const body = createSchema.partial().safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
    const t = await prisma.notificationTemplate.update({
      where: { id: req.params.id },
      data:  body.data,
    });
    return t;
  });

  // DELETE /api/v1/templates/:id
  app.delete<{ Params: { id: string } }>("/templates/:id", async (req, reply) => {
    await prisma.notificationTemplate.delete({ where: { id: req.params.id } });
    return reply.status(204).send();
  });
}