import { FastifyRequest, FastifyReply } from "fastify";
import IORedis from "ioredis";
// Fallback to environment variable if ../config/env is not available.
// This avoids a hard dependency on a project-local env module.
const REDIS_URL = (() => {
  try {
    // attempt to require local config if it exists
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cfg = require("../config");
    return cfg?.env?.REDIS_URL ?? cfg?.REDIS_URL ?? process.env.REDIS_URL;
  } catch (e) {
    return process.env.REDIS_URL;
  }
})();

const redis = new IORedis(REDIS_URL ?? "redis://127.0.0.1:6379");

export function rateLimit(limit: number, windowSecs: number) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req as any).user?.userId ?? req.ip;
    const key    = `ratelimit:${req.routerPath}:${userId}`;

    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, windowSecs);

    reply.header("X-RateLimit-Limit",     String(limit));
    reply.header("X-RateLimit-Remaining", String(Math.max(0, limit - current)));

    if (current > limit) {
      return reply.status(429).send({
        error: `Rate limit exceeded. Max ${limit} requests per ${windowSecs}s.`,
      });
    }
  };
}