# Setup Guide

## Production (VPS)

The live app runs on **https://ghostlegion.online** (VPS `89.116.38.197`), not Vercel.

See `DEPLOYMENT_CHECKLIST.md` for CyberPanel, MariaDB import, LiteSpeed proxy, and GitHub auto-deploy.

## Local development

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
DATABASE_URL="mysql://ghos_t_legion_online:PASSWORD@127.0.0.1:3306/ghos_t_legion_online"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Database (MariaDB)

Create the database (or use a tunnel to the VPS database), then either:

**Option A — import the full dump**
```bash
mysql -u ghos_t_legion_online -p ghos_t_legion_online < database/ghostlegion-mariadb-full.sql
```

**Option B — push schema and seed**
```bash
npx prisma db push
npm run db:seed
```

### 4. Start
```bash
npm run dev
```

App: http://localhost:3000

Default admin after SQL import: `admin@ghostlegion.online` / `ChangeMe!GhostLegion`

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MariaDB URL: `mysql://USER:PASS@127.0.0.1:3306/ghos_t_legion_online` |
| `NEXTAUTH_URL` | Yes | Public app URL |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | `https://ghostlegion.online` |
| `PORT` | Production | `3017` on the VPS |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No | Only for `scripts/seed-admin.js` |

## Troubleshooting

### "Failed to load locations: 500"
`DATABASE_URL` missing or MariaDB not reachable.

### NextAuth "Configuration" error
Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, then restart.
