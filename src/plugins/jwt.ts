import { FastifyRequest, FastifyReply } from "fastify";
import { createHmac } from "crypto";
import { env } from "../config";

type Payload = { userId: string; email: string };

// Minimal JWT implementation (no extra deps needed)
function base64url(str: string) {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function signToken(payload: Payload): string {
  const header  = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body    = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
  const sig     = createHmac("sha256", env.JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Payload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [header, body, sig] = parts;

  const expected = createHmac("sha256", env.JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (sig !== expected) throw new Error("Invalid signature");

  let decoded: any;
  try {
    decoded = JSON.parse(Buffer.from(body, "base64url").toString());
  } catch (e) {
    throw new Error("Malformed token payload");
  }

  if (typeof decoded.exp !== "number" || decoded.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired or invalid exp");
  return decoded as Payload;
}

// Fastify middleware — attach to protected routes
export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing or invalid Authorization header" });
  }
  try {
    const token = authHeader.slice(7);
    (req as any).user = verifyToken(token);
  } catch (e: any) {
    return reply.status(401).send({ error: e.message });
  }
}