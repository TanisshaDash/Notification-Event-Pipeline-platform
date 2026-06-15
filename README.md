# NOTIFY — Notification & Event Pipeline

Fire one event. NOTIFY routes it to Email, SMS, and Push automatically.

> Node.js · Fastify · BullMQ · Redis · PostgreSQL · React

---


## How it works

```bash
POST /api/v1/events
{ "type": "otp.requested", "payload": { "email": "...", "otp": "123456" } }
# → Email + SMS sent automatically
```

---

## Features

- Multi-channel fan-out (Email, SMS, Push)
- Async job queues with retry + dead letter queue
- Handlebars templates per channel
- Template manager UI
- Per-user data scoping
- JWT auth + rate limiting (100 req/min)
- Live dashboard with queue stats + delivery logs
- Webhook handlers for delivery receipts

---

## Run locally

```bash
git clone https://github.com/TanisshaDash/Notification-Event-Pipeline-platform.git
cd Notification-Event-Pipeline-platform
cp .env.example .env   # fill in your values
docker compose up -d
docker compose exec api npx prisma migrate dev
cd dashboard && npm install && npm run dev
```

API → `http://localhost:3000`  
Dashboard → `http://localhost:5173`

---

## Stack

| | |
|---|---|
| Backend | Node.js + Fastify + TypeScript |
| Queue | BullMQ + Redis |
| DB | PostgreSQL + Prisma |
| Email | SendGrid |
| SMS | Fast2SMS |
| Frontend | React + Vite |
