"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRoute = eventsRoute;
const zod_1 = require("zod");
const client_1 = require("../prisma/client");
const queues_1 = require("../queues");
const ingestSchema = zod_1.z.object({
    type: zod_1.z.string(),
    payload: zod_1.z.record(zod_1.z.unknown()),
});
async function eventsRoute(app) {
    // POST /api/v1/events — ingest a new event
    app.post("/events", async (req, reply) => {
        const body = ingestSchema.safeParse(req.body);
        if (!body.success)
            return reply.status(400).send({ error: body.error.flatten() });
        const event = await client_1.prisma.event.create({
            data: { type: body.data.type, payload: body.data.payload },
        });
        await queues_1.fanoutQueue.add("process", {
            eventId: event.id,
            eventType: event.type,
            payload: body.data.payload,
        });
        return reply.status(202).send({ eventId: event.id, status: "queued" });
    });
    // GET /api/v1/events — list with pagination
    app.get("/events", async (req) => {
        const page = Math.max(1, parseInt(req.query.page ?? "1"));
        const limit = Math.min(100, parseInt(req.query.limit ?? "20"));
        const [events, total] = await Promise.all([
            client_1.prisma.event.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            client_1.prisma.event.count(),
        ]);
        return { events, total, page, limit };
    });
}
