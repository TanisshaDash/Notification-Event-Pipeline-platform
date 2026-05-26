"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string(),
    REDIS_URL: zod_1.z.string().default("redis://localhost:6379"),
    JWT_SECRET: zod_1.z.string(),
    SENDGRID_API_KEY: zod_1.z.string().optional(),
    MSG91_API_KEY: zod_1.z.string().optional(),
    MSG91_SENDER_ID: zod_1.z.string().optional(),
    MSG91_TEMPLATE_ID: zod_1.z.string().optional(),
    FCM_SERVER_KEY: zod_1.z.string().optional(),
});
exports.env = schema.parse(process.env);
