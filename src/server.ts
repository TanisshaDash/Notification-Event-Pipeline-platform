import Fastify from "fastify";
import { env } from "./env";
import { eventsRoute }       from "./routes/events";
import { deliveryLogsRoute } from "./routes/delivery-logs";
import { jobsRoute }         from "./routes/jobs";
import { metricsRoute }      from "./routes/metrics";

const app = Fastify({ logger: true });

app.register(eventsRoute,       { prefix: "/api/v1" });
app.register(deliveryLogsRoute, { prefix: "/api/v1" });
app.register(jobsRoute,         { prefix: "/api/v1" });
app.register(metricsRoute,      { prefix: "/api/v1" });

app.get("/health", async () => ({ status: "ok" }));

app.listen({ port: env.PORT, host: "0.0.0.0" }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
});