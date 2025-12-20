# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/ghostlegion?schema=public"

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Admin User Seeding (Optional - for development)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

### 3. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 4. Set Up Database

#### Option A: Using PostgreSQL (Recommended)

1. Install PostgreSQL if you haven't already
2. Create a database:
   ```bash
   createdb ghostlegion
   ```
3. Update your `DATABASE_URL` in `.env.local`:
   ```bash
   DATABASE_URL="postgresql://your-username:your-password@localhost:5432/ghostlegion?schema=public"
   ```

#### Option B: Using Other Databases

The application uses Prisma, which supports:
- PostgreSQL (recommended)
- MySQL
- SQLite
- SQL Server

Update your `prisma/schema.prisma` file to change the provider if needed.

### 5. Run Database Migrations

```bash
# Push the schema to your database
npx prisma db push

# Or use migrations
npx prisma migrate dev
```

### 6. Seed the Database (Optional)

```bash
# Set admin credentials
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="your-secure-password"

# Run seed script
npm run db:seed
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Troubleshooting

### Error: "Failed to load locations: 500"

**Cause**: `DATABASE_URL` environment variable is not set or database is not accessible.

**Solution**:
1. Check that `.env.local` exists and contains `DATABASE_URL`
2. Verify your database is running
3. Test database connection:
   ```bash
   npx prisma db pull
   ```

### Error: "Database connection error"

**Cause**: Database URL is incorrect or database server is not running.

**Solution**:
1. Verify your `DATABASE_URL` format is correct
2. Ensure your database server is running
3. Check database credentials are correct
4. For PostgreSQL, verify the database exists:
   ```bash
   psql -l
   ```

### Error: "NEXTAUTH_SECRET is not set"

**Cause**: Missing `NEXTAUTH_SECRET` environment variable.

**Solution**:
1. Generate a secret: `openssl rand -base64 32`
2. Add it to your `.env.local` file
3. Restart your development server

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `NEXTAUTH_URL` | Yes | Application URL (e.g., http://localhost:3000) |
| `NEXTAUTH_SECRET` | Yes | Secret key for NextAuth (generate with `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | No | Admin user email (for seeding) |
| `ADMIN_PASSWORD` | No | Admin user password (for seeding) |
| `NODE_ENV` | No | Environment (development/production) |

## Next Steps

1. ✅ Set up environment variables
2. ✅ Configure database
3. ✅ Run migrations
4. ✅ Seed database (optional)
5. ✅ Start development server
6. ✅ Access application at http://localhost:3000

For production deployment, see `DEPLOYMENT_CHECKLIST.md`.

