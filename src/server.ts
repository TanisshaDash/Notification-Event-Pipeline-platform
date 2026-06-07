import Fastify from "fastify";
import { env } from "./config";
import { authenticate } from "./plugins/jwt";
import { authRoute }         from "./routes/auth";
import { eventsRoute }       from "./routes/events";
import { deliveryLogsRoute } from "./routes/delivery-logs";
import { jobsRoute }         from "./routes/jobs";
import { metricsRoute }      from "./routes/metrics";
import { templatesRoute }    from "./routes/templates";
import { sendgridWebhook }   from "./routes/webhooks/sendgrid";
import { fast2smsWebhook }   from "./routes/webhooks/fast2sms";

const app = Fastify({ logger: true });

// Public routes
app.register(authRoute,        { prefix: "/api/v1" });
app.register(sendgridWebhook,  { prefix: "/api/v1" });
app.register(fast2smsWebhook,  { prefix: "/api/v1" });

// Protected routes
app.register(async (protectedApp) => {
  protectedApp.addHook("preHandler", authenticate);
  protectedApp.register(eventsRoute,       { prefix: "/api/v1" });
  protectedApp.register(deliveryLogsRoute, { prefix: "/api/v1" });
  protectedApp.register(jobsRoute,         { prefix: "/api/v1" });
  protectedApp.register(metricsRoute,      { prefix: "/api/v1" });
  protectedApp.register(templatesRoute,    { prefix: "/api/v1" });
});

app.get("/health", async () => ({ status: "ok" }));

app.listen({ port: env.PORT, host: "0.0.0.0" }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
});