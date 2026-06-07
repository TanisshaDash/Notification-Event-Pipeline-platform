import { FastifyInstance } from "fastify";
import { prisma } from "../../prisma/client";

// SendGrid sends an array of events
type SendGridEvent = {
  event:      string;  // delivered, bounce, dropped, etc.
  email:      string;
  timestamp:  number;
  sg_message_id?: string;
  reason?:    string;
};

export async function sendgridWebhook(app: FastifyInstance) {
  app.post("/webhooks/sendgrid", async (req, reply) => {
    const events = req.body as SendGridEvent[];
    if (!Array.isArray(events)) return reply.status(400).send({ error: "Invalid payload" });

    for (const event of events) {
      // Find the delivery log by provider message id or email
      // In production you'd store sg_message_id when sending
      const status =
        event.event === "delivered" ? "DELIVERED" :
        event.event === "bounce"    ? "FAILED"    :
        event.event === "dropped"   ? "FAILED"    : null;

      if (!status) continue;

      // Update the most recent EMAIL log for this recipient
      const log = await prisma.deliveryLog.findFirst({
        where:   { channel: "EMAIL", provider: "sendgrid", status: "SENT" },
        include: { event: { select: { payload: true } } },
        orderBy: { createdAt: "desc" },
      });

      if (log) {
        await prisma.deliveryLog.update({
          where: { id: log.id },
          data: {
            status:      status as any,
            deliveredAt: status === "DELIVERED" ? new Date() : undefined,
            error:       event.reason ?? null,
          },
        });
      }
    }

    return reply.status(200).send({ received: true });
  });
}