# Notification & Event Pipeline

A production-ready notification service that ingests events and fans them out to multiple delivery channels (email, SMS, push) via async job queues. Built with Node.js, Fastify, BullMQ, and PostgreSQL.

---

## Features

- **Event ingestion** — single `POST /events` endpoint accepts any event type
- **Fan-out routing** — rules-based dispatch to email, SMS, and push queues
- **Template engine** — per-channel Handlebars templates per event type
- **Retry + DLQ** — exponential backoff (3 attempts), dead letter queue with manual retry/discard
- **Delivery tracking** — full audit log per notification with provider responses
- **Live metrics** — Server-Sent Events stream of queue depths and delivery stats
- **Docker-first** — one command to spin up the entire stack locally

---

## Architecture

```
Event source (your app / webhook / cron)
        │
        ▼
  Fastify API ──► PostgreSQL (raw event stored)
        │
        ▼
  BullMQ fan-out queue (Redis)
        │
   ┌────┼────┐
   ▼    ▼    ▼
Email  SMS  Push   ◄── workers with retry + backoff
   │    │    │
   └────┴────┘
        │
        ▼
  DeliveryLog (Postgres) ◄── provider webhooks (SendGrid, Twilio)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS + TypeScript |
| Framework | Fastify 4 |
| Queue | BullMQ + Redis 7 |
| Database | PostgreSQL 15 + Prisma ORM |
| Email | SendGrid (Nodemailer in dev) |
| SMS | MSG91 / Twilio |
| Push | Firebase FCM |
| Validation | Zod |
| Testing | Vitest + Supertest |
| Deploy | Docker + PM2 + Nginx |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose

### Run locally

```bash
# 1. Clone and install
git clone https://github.com/yourusername/notification-pipeline.git
cd notification-pipeline
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — DATABASE_URL and REDIS_URL are pre-filled for Docker

# 3. Start infrastructure + services
docker-compose up

# 4. Run migrations (first time only)
npm run db:migrate
```

The API will be available at `http://localhost:3000`.

### Run without Docker

```bash
# Requires local Postgres and Redis running
npm run db:migrate
npm run dev          # starts API server
npm run worker       # starts fan-out + email workers (separate terminal)
```

---

## API Reference

All routes are prefixed `/api/v1`.

### Events

```
POST   /events                   Ingest a new event
GET    /events                   List events (paginated)
```

**Ingest an event**

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "otp.requested",
    "payload": {
      "email": "user@example.com",
      "otp": "482910",
      "name": "Rahul"
    }
  }'
```

Response:
```json
{ "eventId": "uuid", "status": "queued" }
```

### Delivery Logs

```
GET    /delivery-logs            List all delivery attempts
GET    /delivery-logs/:id        Single notification audit trail
```

### Job Management (DLQ)

```
POST   /jobs/:queue/:id/retry    Retry a failed job
DELETE /jobs/:queue/:id          Discard a dead job
```

Valid queue names: `fanout`, `email`, `sms`, `push`

### Metrics

```
GET    /metrics                  Queue stats snapshot
GET    /metrics/stream           Live SSE stream (poll every 3s)
```

**Subscribe to live metrics**

```javascript
const es = new EventSource('http://localhost:3000/api/v1/metrics/stream');
es.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## Event Types & Templates

Templates are stored in the database and matched by `eventType` + `channel`. Create one via Prisma Studio (`npm run db:studio`) or a future `/templates` API endpoint.

**Example template record**

```
eventType : "otp.requested"
channel   : EMAIL
subject   : "Your OTP code"
body      : "<p>Hi {{name}}, your OTP is <strong>{{otp}}</strong>. Valid for 5 minutes.</p>"
```

The `payload` from the event is passed directly into Handlebars — any key in `payload` is available as `{{key}}` in the template.

---

## Project Structure

```
src/
├── server.ts              # Fastify entry point
├── config/
│   └── env.ts             # Zod-validated environment variables
├── routes/
│   ├── events.ts          # Event ingestion + listing
│   ├── delivery-logs.ts   # Delivery audit log
│   ├── jobs.ts            # DLQ retry / discard
│   └── metrics.ts         # Queue stats + SSE stream
├── workers/
│   ├── fanout.worker.ts   # Routes events to channel queues
│   └── email.worker.ts    # Sends email via SendGrid
├── queues/
│   └── index.ts           # BullMQ queue definitions
├── services/              # Provider integrations (SendGrid, MSG91, FCM)
└── prisma/
    └── client.ts          # Prisma singleton
prisma/
└── schema.prisma          # DB schema
docker-compose.yml
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `SENDGRID_API_KEY` | No | SendGrid API key (email in prod) |
| `MSG91_API_KEY` | No | MSG91 API key (SMS) |
| `FCM_SERVER_KEY` | No | Firebase server key (push) |

Leave provider keys empty in development — workers will log to console instead of calling external APIs.

---

## Deployment (AWS EC2)

```bash
# On the server
git pull origin main
npm install
npm run build
npm run db:migrate

# Process management with PM2
pm2 start dist/server.js --name api
pm2 start dist/workers/fanout.worker.js --name worker-fanout
pm2 start dist/workers/email.worker.js  --name worker-email
pm2 save
```

Configure Nginx to reverse proxy port 3000, then SSL via Certbot — same pattern as a standard Django deployment.

---

## Roadmap

- [ ] SMS worker (MSG91)
- [ ] Push worker (FCM)
- [ ] Template CRUD API
- [ ] JWT auth middleware
- [ ] React dashboard with live queue monitor
- [ ] Provider webhook handlers (SendGrid events, Twilio callbacks)
- [ ] Rate limiting per event type
- [ ] Multi-tenant support (per-app API keys)

