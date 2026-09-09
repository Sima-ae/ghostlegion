# Production notes (VPS)

Ghost Legion is deployed on **https://ghostlegion.online** (VPS `89.116.38.197`). Vercel is not used.

## Login "Configuration" error

NextAuth needs these in `/var/www/ghostlegion/shared/.env`:

```
NEXTAUTH_URL=https://ghostlegion.online
NEXTAUTH_SECRET=<openssl rand -base64 32>
DATABASE_URL=mysql://ghos_t_legion_online:PASSWORD@127.0.0.1:3306/ghos_t_legion_online
```

Then:
```bash
systemctl restart ghostlegion
```

## Database

Generate a local dump (`npm run db:sql`) and import it privately into MariaDB database `ghos_t_legion_online` before the first start. Do not commit or publish `database/ghostlegion-mariadb-full.sql`.

Create the admin after import with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `node scripts/seed-admin.js`. Do not publish a default password.

## Logs

```bash
journalctl -u ghostlegion -n 80 --no-pager
curl -s http://127.0.0.1:3017/api/health
```
