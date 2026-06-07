import { FastifyInstance } from "fastify";
import { prisma } from "../../prisma/client";

type Fast2SMSEvent = {
  status:  string;  // "Delivered", "Failed", etc.
  mobile?: string;
  message_id?: string;
};

export async function fast2smsWebhook(app: FastifyInstance) {
  app.post("/webhooks/fast2sms", async (req, reply) => {
    const event = req.body as Fast2SMSEvent;

    const status =
      event.status === "Delivered" ? "DELIVERED" :
      event.status === "Failed"    ? "FAILED"    : null;

    if (!status) return reply.status(200).send({ received: true });

    // Find most recent SMS log
    const log = await prisma.deliveryLog.findFirst({
      where:   { channel: "SMS", provider: "fast2sms", status: "SENT" },
      orderBy: { createdAt: "desc" },
    });

    if (log) {
      await prisma.deliveryLog.update({
        where: { id: log.id },
        data: {
          status:      status as any,
          deliveredAt: status === "DELIVERED" ? new Date() : undefined,
        },
      });
    }

    return reply.status(200).send({ received: true });
  });
}