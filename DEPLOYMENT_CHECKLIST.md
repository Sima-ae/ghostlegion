# Deployment Checklist for GitHub and Vercel

## Pre-Deployment Security Checklist

### ✅ Security Updates
- [x] React updated to 19.1.4 (fixes CVE-2025-55184, CVE-2025-55183)
- [x] Next.js updated to 15.5.9 (fixes RCE, Source Code Exposure, DoS)
- [x] NextAuth updated to 4.24.13 (fixes email misdelivery)
- [x] All hardcoded secrets removed
- [x] Security headers configured
- [x] No XSS vulnerabilities
- [x] Build successful

### ✅ Code Quality
- [x] No linter errors
- [x] TypeScript types valid
- [x] Production build tested
- [x] All dependencies installed

## GitHub Deployment Steps

### 1. Verify Git Configuration
```bash
# Check for any sensitive files
git status
git diff

# Ensure .env files are not tracked
git check-ignore .env .env.local .env.production
```

### 2. Commit Changes
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Security updates: React 19.1.4, Next.js 15.5.9, removed hardcoded secrets"

# Push to repository
git push origin main
```

### 3. Verify Repository Security
- [ ] No `.env` files in repository
- [ ] No hardcoded passwords in code
- [ ] No API keys in code
- [ ] `.gitignore` properly configured

## Vercel Deployment Steps

### 1. Environment Variables Setup

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add the following variables:

#### Required Variables:
```
DATABASE_URL=your-production-database-connection-string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key
```

#### Optional (for production seeding):
```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password
```

#### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Database Setup

1. **Ensure production database is accessible**
   - Verify `DATABASE_URL` is correct
   - Test connection from Vercel

2. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   # or
   npx prisma db push
   ```

3. **Create admin user** (if needed):
   ```bash
   # Set environment variables
   export ADMIN_EMAIL=admin@yourdomain.com
   export ADMIN_PASSWORD=your-secure-password
   
   # Run seed script
   npm run db:seed
   ```

### 3. Deploy to Vercel

#### Option A: Automatic Deployment (via GitHub)
1. Connect your GitHub repository to Vercel
2. Push changes to main branch
3. Vercel will automatically deploy

#### Option B: Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Post-Deployment Verification

- [ ] Application loads successfully
- [ ] Login page accessible at `/auth/signin`
- [ ] Admin dashboard accessible at `/admin` (after login)
- [ ] API routes responding correctly
- [ ] Database connections working
- [ ] No console errors in browser
- [ ] Security headers present (check in browser DevTools)

### 5. Security Verification

Check security headers in browser DevTools → Network → Response Headers:
- [x] `Strict-Transport-Security` present
- [x] `X-Frame-Options` set to `SAMEORIGIN`
- [x] `X-Content-Type-Options` set to `nosniff`
- [x] `X-XSS-Protection` present

### 6. Testing Checklist

- [ ] User authentication works
- [ ] Admin access works
- [ ] Map component loads
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] No 500 errors in logs
- [ ] Environment variables loaded correctly

## Troubleshooting

### Common Issues

#### 1. Configuration Error on Login
- **Cause**: Missing `NEXTAUTH_SECRET` or `NEXTAUTH_URL`
- **Fix**: Verify environment variables in Vercel dashboard

#### 2. Database Connection Error
- **Cause**: Incorrect `DATABASE_URL` or database not accessible
- **Fix**: Verify database URL and network access

#### 3. Build Failures
- **Cause**: Missing dependencies or TypeScript errors
- **Fix**: Run `npm install` and `npm run build` locally first

#### 4. Admin User Not Created
- **Cause**: Seed script not run or environment variables not set
- **Fix**: Run seed script with proper environment variables

## Production Best Practices

1. **Monitor Logs**: Regularly check Vercel function logs
2. **Update Dependencies**: Run `npm audit` regularly
3. **Rotate Secrets**: Change `NEXTAUTH_SECRET` periodically
4. **Backup Database**: Regular database backups
5. **Monitor Security**: Check for security advisories

## Support

If you encounter issues:
1. Check Vercel function logs
2. Review environment variables
3. Verify database connectivity
4. Check `SECURITY.md` for security information
5. Review `PRODUCTION_DEPLOYMENT_FIX.md` for common fixes

---

**Status**: ✅ Ready for deployment
**Last Updated**: 2025-01-20
**Security Status**: All critical vulnerabilities fixed

