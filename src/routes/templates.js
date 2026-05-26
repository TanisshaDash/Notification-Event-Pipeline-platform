"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templatesRoute = templatesRoute;
const zod_1 = require("zod");
const client_1 = require("../prisma/client");
const createSchema = zod_1.z.object({
    eventType: zod_1.z.string(),
    channel: zod_1.z.enum(["EMAIL", "SMS", "PUSH"]),
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string(),
    active: zod_1.z.boolean().default(true),
});
async function templatesRoute(app) {
    // GET /api/v1/templates
    app.get("/templates", async () => {
        return client_1.prisma.notificationTemplate.findMany({
            orderBy: { createdAt: "desc" },
        });
    });
    // GET /api/v1/templates/:id
    app.get("/templates/:id", async (req, reply) => {
        const t = await client_1.prisma.notificationTemplate.findUnique({ where: { id: req.params.id } });
        if (!t)
            return reply.status(404).send({ error: "Not found" });
        return t;
    });
    // POST /api/v1/templates
    app.post("/templates", async (req, reply) => {
        const body = createSchema.safeParse(req.body);
        if (!body.success)
            return reply.status(400).send({ error: body.error.flatten() });
        const t = await client_1.prisma.notificationTemplate.create({ data: body.data });
        return reply.status(201).send(t);
    });
    // PATCH /api/v1/templates/:id
    app.patch("/templates/:id", async (req, reply) => {
        const body = createSchema.partial().safeParse(req.body);
        if (!body.success)
            return reply.status(400).send({ error: body.error.flatten() });
        const t = await client_1.prisma.notificationTemplate.update({
            where: { id: req.params.id },
            data: body.data,
        });
        return t;
    });
    // DELETE /api/v1/templates/:id
    app.delete("/templates/:id", async (req, reply) => {
        await client_1.prisma.notificationTemplate.delete({ where: { id: req.params.id } });
        return reply.status(204).send();
    });
}
