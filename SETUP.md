# Setup Guide

## Production (VPS)

The live app runs on **https://ghostlegion.online** (VPS `89.116.38.197`), not Vercel.

See `DEPLOYMENT_CHECKLIST.md` for CyberPanel, MariaDB import, LiteSpeed proxy, and GitHub auto-deploy.

## Local development (same MariaDB as production)

Do **not** use a separate local database. Localhost talks to `ghos_t_legion_online` on the VPS through an SSH tunnel.

### 1. Install dependencies
```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` (already created if you pulled this repo).

On the VPS:
```bash
grep DATABASE_URL /var/www/ghostlegion/shared/.env
```

Put that password into `.env.local` (keep host `127.0.0.1` and port **3307**):
```bash
DATABASE_URL="mysql://ghos_t_legion_online:YOUR_VPS_PASSWORD@127.0.0.1:3307/ghos_t_legion_online"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Open the MariaDB tunnel (leave this running)
```bash
npm run db:tunnel
```

### 4. Check + start
```bash
npm run db:check
npm run dev
```

App: http://localhost:3000 — locations, alerts, people, routes, and resources come from the same MariaDB as https://ghostlegion.online.

Create an admin with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`, then `node scripts/seed-admin.js`. Do not share a default password.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Local tunnel: `mysql://USER:PASS@127.0.0.1:3307/ghos_t_legion_online` |
| `NEXTAUTH_URL` | Yes | Public app URL |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | `https://ghostlegion.online` |
| `PORT` | Production | `3017` on the VPS |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No | Only for `scripts/seed-admin.js` |

## Troubleshooting

### Locations / alerts look like old demo data
Local was using `sampleData.ts` instead of MariaDB. Use the tunnel (`npm run db:tunnel`) and a real `DATABASE_URL` in `.env.local`.

### "Failed to load locations: 500" / DB_NOT_CONFIGURED
`DATABASE_URL` missing, still `CHANGE_ME`, or tunnel not running.

### NextAuth "Configuration" error
Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, then restart.
