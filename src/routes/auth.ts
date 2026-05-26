import { FastifyInstance } from "fastify";
import { z } from "zod";
import { createHash } from "crypto";
import { prisma } from "../prisma/client";
import { signToken } from "../plugins/jwt";

// Simple SHA256 hash — swap for bcrypt in production
const hash = (password: string) =>
  createHash("sha256").update(password + process.env.JWT_SECRET).digest("hex");

const registerSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export async function authRoute(app: FastifyInstance) {
  // POST /api/v1/auth/register
  app.post("/auth/register", async (req, reply) => {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const existing = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (existing) return reply.status(409).send({ error: "Email already registered" });

    const user = await prisma.user.create({
      data: {
        email:    body.data.email,
        password: hash(body.data.password),
      },
    });

    const token = signToken({ userId: user.id, email: user.email });
    return reply.status(201).send({ token, email: user.email });
  });

  // POST /api/v1/auth/login
  app.post("/auth/login", async (req, reply) => {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const user = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (!user || user.password !== hash(body.data.password)) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return { token, email: user.email };
  });
}