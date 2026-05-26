"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const env_1 = require("./env");
const events_1 = require("./routes/events");
const delivery_logs_1 = require("./routes/delivery-logs");
const jobs_1 = require("./routes/jobs");
const metrics_1 = require("./routes/metrics");
const templates_1 = require("./routes/templates");
const app = (0, fastify_1.default)({ logger: true });
app.register(events_1.eventsRoute, { prefix: "/api/v1" });
app.register(delivery_logs_1.deliveryLogsRoute, { prefix: "/api/v1" });
app.register(jobs_1.jobsRoute, { prefix: "/api/v1" });
app.register(metrics_1.metricsRoute, { prefix: "/api/v1" });
app.register(templates_1.templatesRoute, { prefix: "/api/v1" });
app.get("/health", async () => ({ status: "ok" }));
app.listen({ port: env_1.env.PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
