# Deployment Checklist — Ghost Legion on VPS

Production URL: **https://ghostlegion.online**  
Server: `89.116.38.197` (same VPS as catalogus / toyotas)  
App port: **3017** (must stay unique — catalogus uses 3001, toyotas 3009, etc.)  
MariaDB database / user: `ghos_t_legion_online`

## One-time VPS setup

1. **CyberPanel**
   - Create website `ghostlegion.online` (and `www`)
   - Create MariaDB database + user `ghos_t_legion_online`
   - Point DNS A records to `89.116.38.197`

2. **Import schema + data**
   - Generate the dump locally (`npm run db:sql`) — it is gitignored and must not be committed
   - Copy it privately to the VPS (scp), then in phpMyAdmin / SQL importer select `ghos_t_legion_online`
   - Import that file; do not publish it
   - Create the admin on the VPS with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and `node scripts/seed-admin.js` (do not use a shared default password)

3. **App directories and env**
   ```bash
   bash /var/www/ghostlegion/app/scripts/vps-first-setup.sh
   # then edit /var/www/ghostlegion/shared/.env
   ```
   Required keys (see `.env.vps.example`):
   ```
   DATABASE_URL=mysql://ghos_t_legion_online:PASSWORD@127.0.0.1:3306/ghos_t_legion_online
   NEXTAUTH_URL=https://ghostlegion.online
   NEXTAUTH_SECRET=<openssl rand -base64 32>
   NEXT_PUBLIC_SITE_URL=https://ghostlegion.online
   PORT=3017
   ```

4. **Reverse proxy + SSL**
   ```bash
   bash /var/www/ghostlegion/app/scripts/configure-litespeed-ghostlegion.sh
   bash /var/www/ghostlegion/app/scripts/fix-ssl-ghostlegion.sh
   ```

5. **GitHub auto-deploy**
   Repo secrets (same values as catalogus / toyotas):
   - `VPS_HOST` = `89.116.38.197`
   - `VPS_USER` = `root`
   - `VPS_SSH_KEY` = deploy private key
   - `VPS_APP_PATH` = `/var/www/ghostlegion/app` (optional)

   Push to `main` → GitHub Action **Deploy to VPS** SSHs in, pulls, builds, restarts systemd `ghostlegion`.

## After every push to main

- Workflow: `.github/workflows/deploy.yml`
- Remote script: `scripts/vps-deploy.sh`
- systemd: `ghostlegion` on `127.0.0.1:3017`

## Verify

- [ ] `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3017/`
- [ ] `curl -s http://127.0.0.1:3017/api/health`
- [ ] https://ghostlegion.online loads
- [ ] Login at `/auth/signin`
- [ ] Admin at `/admin`

## Troubleshooting

| Symptom | Fix |
|---|---|
| Login Configuration error | Missing `NEXTAUTH_SECRET` or `NEXTAUTH_URL` in `/var/www/ghostlegion/shared/.env` |
| Database connection error | Wrong password in `DATABASE_URL`; use `127.0.0.1` not localhost socket issues |
| Port already in use | `ss -tlnp \| grep 3017` — do not reuse 3000/3001/3004/3009/3019/3030/3066 |
| GitHub SSH timeout | On VPS: `bash scripts/vps-allow-github-actions-ssh.sh` |
| Deploy smoke fail | `journalctl -u ghostlegion -n 80` |

---

**Status**: Ready for VPS (Vercel is no longer used)
