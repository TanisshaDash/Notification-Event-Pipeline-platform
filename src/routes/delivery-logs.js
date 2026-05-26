"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryLogsRoute = deliveryLogsRoute;
const client_1 = require("../prisma/client");
async function deliveryLogsRoute(app) {
    app.get("/delivery-logs", async (req) => {
        const page = Math.max(1, parseInt(req.query.page ?? "1"));
        const where = req.query.status ? { status: req.query.status } : {};
        const [logs, total] = await Promise.all([
            client_1.prisma.deliveryLog.findMany({
                where,
                skip: (page - 1) * 20,
                take: 20,
                orderBy: { createdAt: "desc" },
                include: { event: { select: { type: true } } },
            }),
            client_1.prisma.deliveryLog.count({ where }),
        ]);
        return { logs, total, page };
    });
    app.get("/delivery-logs/:id", async (req, reply) => {
        const log = await client_1.prisma.deliveryLog.findUnique({
            where: { id: req.params.id },
            include: { event: true },
        });
        if (!log)
            return reply.status(404).send({ error: "Not found" });
        return log;
    });
}
