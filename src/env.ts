import { z } from "zod";

const schema = z.object({
  NODE_ENV:      z.enum(["development", "production", "test"]).default("development"),
  PORT:          z.coerce.number().default(3000),
  DATABASE_URL:  z.string(),
  REDIS_URL:     z.string().default("redis://localhost:6379"),
  JWT_SECRET:    z.string(),

  SENDGRID_API_KEY: z.string().optional(),
  MSG91_API_KEY:    z.string().optional(),
  MSG91_SENDER_ID:  z.string().optional(),
  FCM_SERVER_KEY:   z.string().optional(),
});

export const env = schema.parse(process.env);