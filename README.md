# WatchYourAPI

WatchYourAPI is an API monitoring SaaS that notifies you when your endpoints go down and when they recover. Instead of finding out your API is broken from a user complaint, you get an email the moment something fails.

## What problem it solves

If you run any web service, background job, or third-party integration, you need to know when it stops responding. WatchYourAPI continuously pings your URLs on a schedule you set, detects failures, and sends alerts to whoever needs to know without spamming you while the issue is ongoing.

## How it works

1. You add a monitor (URL + check interval)
2. The worker pings it on that interval (e.g. every 60 seconds)
3. If it returns a non-2xx response or times out, an incident opens and a down alert is sent
4. Checks keep running while it is down (no repeated emails)
5. When it recovers, a recovery email is sent and the incident closes
6. You can attach multiple email channels to a monitor so the right people get notified

## Features

- **Monitor management:** add, edit, pause, and delete monitors. Newest monitors appear first.
- **Incident tracking:** ongoing and historical incidents with duration
- **Alert channels:** attach/detach email channels per monitor
- **Multi-recipient:** attach multiple channels to one monitor
- **Immediate alerts:** attaching a channel to an already-down monitor fires an alert right away
- **No spam:** one email when a monitor goes down, one when it recovers, nothing in between
- **Response time chart:** visualize latency over recent checks
- **Check history pagination:** browse all past checks with previous/next paging
- **Public status page:** shareable URL at `/status/:userId` showing all monitors with no login required
- **Forgot/reset password:** full email-based password reset flow
- **Custom email domain:** alerts sent from `watchyourapi@vinrsr.com` via Resend
- **Rate limiting:** brute-force protection on login, register, and forgot-password endpoints

## Tech stack

### Frontend (`apps/web`)
- [Next.js 16](https://nextjs.org/) (App Router, server and client components)
- [Tailwind CSS v4](https://tailwindcss.com/) - glassmorphism UI with custom brand color
- [TanStack Query v5](https://tanstack.com/query) - server state and caching
- [Zustand](https://zustand-demo.pmnd.rs/) - auth state

### Backend (`apps/api`)
- [Express.js](https://expressjs.com/) - REST API
- [Drizzle ORM](https://orm.drizzle.team/) - type-safe queries
- [PostgreSQL](https://www.postgresql.org/) - primary database
- [Redis](https://redis.io/) - refresh token storage
- [Resend](https://resend.com/) - transactional email
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - password hashing (12 salt rounds)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) - rate limiting

### Infrastructure
- **API:** [Railway](https://railway.app/)
- **Web:** [Vercel](https://vercel.com/)
- **Database:** Railway PostgreSQL
- **Monorepo:** [Turborepo](https://turbo.build/)

## Project structure

```
watchyourapi/
├── apps/
│   ├── api/          # Express backend + background worker
│   │   └── src/
│   │       ├── db/           # Drizzle schema, migrations, queries
│   │       ├── lib/          # Mailer, JWT helpers
│   │       ├── middleware/   # Auth, error handler
│   │       ├── routes/       # REST endpoints
│   │       ├── services/     # Auth service
│   │       └── worker/       # Monitor scheduler + processor
│   └── web/          # Next.js frontend
│       └── src/
│           ├── app/          # Pages (App Router)
│           ├── components/   # Shared UI components
│           ├── lib/          # API client, query functions
│           └── store/        # Zustand auth store
└── packages/         # Shared configs (TypeScript, ESLint)
```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/register` | Create account |
| `/login` | Sign in |
| `/forgot-password` | Request password reset email |
| `/reset-password?token=` | Set new password |
| `/dashboard` | Overview with monitor summary and incident count |
| `/monitors` | List, create, edit, pause, delete monitors |
| `/monitors/:id` | Monitor detail with response time chart and check history |
| `/incidents` | Global incident log (ongoing and resolved) |
| `/settings` | Change password and manage alert channels |
| `/status/:userId` | Public status page (no login required) |

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Environment variables

**`apps/api/.env`**
```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
RESEND_API_KEY=
WEB_URL=http://localhost:3000
PORT=4000
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Running locally

```bash
# Install dependencies
npm install

# Run database migrations
cd apps/api && npx drizzle-kit migrate

# Start both apps
npm run dev
```

The API runs on `http://localhost:4000` and the web app on `http://localhost:3000`.
