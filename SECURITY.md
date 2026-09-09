# Security Documentation

## Security Updates Applied

### Critical Vulnerabilities Fixed

1. **React 19 CVEs (CVE-2025-55184, CVE-2025-55183)**
   - ✅ Updated React from 19.1.0 to 19.1.4
   - ✅ Updated react-dom from 19.1.0 to 19.1.4
   - These updates fix:
     - CVE-2025-55184: High-severity Denial of Service vulnerability
     - CVE-2025-55183: Medium-severity Source Code Exposure vulnerability

2. **Next.js Vulnerabilities**
   - ✅ Updated Next.js from 15.5.3 to 15.5.9
   - Fixes:
     - RCE in React flight protocol
     - Server Actions Source Code Exposure
     - Denial of Service with Server Components

3. **NextAuth.js**
   - ✅ Updated next-auth from 4.24.11 to 4.24.13
   - Fixes email misdelivery vulnerability

### Remaining Low-Severity Vulnerabilities

**Cookie Package (Low Severity)**
- Status: 3 low severity vulnerabilities in `cookie` package (dependency of `@auth/core`)
- Risk Level: Low - vulnerability is in internal dependency, not directly exposed
- Impact: Cookie parsing with out-of-bounds characters (unlikely to be exploitable in this context)
- Resolution: Will be fixed when next-auth 5 becomes stable (requires breaking changes)

## Security Best Practices Implemented

### 1. Environment Variables
- ✅ All secrets moved to environment variables
- ✅ No hardcoded passwords or API keys in codebase
- ✅ `.env` and `.env.local` are gitignored (only `.env.example` / `.env.vps.example` are committed)
- ✅ SQL dumps (`database/*.sql`) are gitignored and blocked from HTTP
- ✅ CI fails if a real `.env` file or SQL dump is tracked (`scripts/check-env-not-committed.sh`)
- ✅ HTTP requests for `/.env*`, `/database/*`, and `*.sql` return 404 (middleware + nginx)
- ✅ API errors never include connection strings or secrets
- ✅ Never prefix secrets with `NEXT_PUBLIC_` (that would expose them in the browser)
- ✅ Seed scripts require environment variables for admin credentials

### 2. Security Headers
- ✅ Added security headers in `next.config.ts`:
  - Strict-Transport-Security
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy

### 3. Input Sanitization
- ✅ No `dangerouslySetInnerHTML` usage found
- ✅ No `eval()` usage found
- ✅ User input handled through controlled React components
- ✅ No XSS vulnerabilities detected

### 4. Authentication
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT-based session management
- ✅ Credentials stored securely in database
- ✅ Active user validation

## Required Environment Variables

Create `/var/www/ghostlegion/shared/.env` on the VPS (see `.env.vps.example`):

```bash
# Database (MariaDB on the VPS)
DATABASE_URL="mysql://ghos_t_legion_online:PASSWORD@127.0.0.1:3306/ghos_t_legion_online"

# NextAuth Configuration
NEXTAUTH_URL="https://ghostlegion.online"
NEXTAUTH_SECRET="generate-using-openssl-rand-base64-32"

# Admin Seeding (development only)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password-here"

# Node Environment
NODE_ENV="production"
```

## Security Checklist for Deployment

- [x] All dependencies updated to latest secure versions
- [x] Hardcoded secrets removed from codebase
- [x] Security headers configured
- [x] Environment variables properly set
- [x] No XSS vulnerabilities
- [x] Authentication properly secured
- [x] Database credentials secured
- [x] Production build verified

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not open a public issue
2. Contact the maintainers directly
3. Allow time for the issue to be addressed before public disclosure

## Regular Security Maintenance

1. Run `npm audit` regularly
2. Update dependencies when security patches are released
3. Review and rotate secrets periodically
4. Monitor security advisories for React, Next.js, and other dependencies

