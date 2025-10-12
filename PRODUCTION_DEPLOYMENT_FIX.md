# Production Deployment Fix for Ghost Legion

## Issue
The production site at https://ghostlegion.vercel.app shows a "Configuration" error when trying to login, redirecting to `/auth/error?error=Configuration`.

## Root Cause
NextAuth.js requires specific environment variables to be configured in production that are missing from your Vercel deployment.

## Solution

### 1. Required Environment Variables in Vercel

You need to add these environment variables in your Vercel dashboard:

#### Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
NEXTAUTH_URL=https://ghostlegion.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
DATABASE_URL=your-production-database-connection-string
```

### 2. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### 3. Database Setup

Make sure your production database is accessible and the `DATABASE_URL` is correct. If you're using a service like:

- **Supabase**: Get the connection string from your project settings
- **PlanetScale**: Get the connection string from your database
- **Railway**: Get the connection string from your service
- **Neon**: Get the connection string from your project

### 4. Deploy Database Schema

After setting up the environment variables, you need to run the database migrations:

```bash
# In your local project directory
npx prisma db push
# or
npx prisma migrate deploy
```

### 5. Create Admin User in Production

You'll need to create an admin user in your production database. You can either:

#### Option A: Use Prisma Studio (if accessible)
```bash
npx prisma studio
```

#### Option B: Create a production seed script
Create a script to add the admin user to production:

```bash
# Create a production admin user
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProdAdmin() {
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ghostlegion.com' },
    update: {},
    create: {
      email: 'admin@ghostlegion.com',
      name: 'Production Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    }
  });
  
  console.log('Production admin created:', admin.email);
  await prisma.\$disconnect();
}

createProdAdmin().catch(console.error);
"
```

### 6. Redeploy

After setting up the environment variables:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger a new deployment

### 7. Test Production Login

1. Go to https://ghostlegion.vercel.app/auth/signin
2. Use the admin credentials you created
3. Should redirect to `/admin` successfully

## Troubleshooting

### If you still get Configuration errors:

1. **Check Vercel Environment Variables**: Make sure all variables are set correctly
2. **Check Database Connection**: Ensure DATABASE_URL is correct and database is accessible
3. **Check NextAuth Secret**: Ensure NEXTAUTH_SECRET is set and not empty
4. **Check NEXTAUTH_URL**: Ensure it matches your production domain exactly

### Debug Steps:

1. Check Vercel function logs for errors
2. Use the error page I created at `/auth/error` for debugging
3. Check if the database is accessible from Vercel

## Environment Variables Summary

```bash
# Required for production
NEXTAUTH_URL=https://ghostlegion.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key
DATABASE_URL=your-production-database-url

# Optional (for debugging)
NODE_ENV=production
```

## Next Steps

1. Set up the environment variables in Vercel
2. Ensure your production database is running
3. Run database migrations
4. Create an admin user
5. Redeploy the application
6. Test the login functionality

The error should be resolved once these environment variables are properly configured in your Vercel deployment.
