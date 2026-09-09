#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const url = process.env.DATABASE_URL || '';
if (!url) {
  console.error('DATABASE_URL is missing. Copy .env.example to .env.local and set the MariaDB password.');
  process.exit(1);
}
if (url.includes('CHANGE_ME')) {
  console.error('DATABASE_URL still has CHANGE_ME. Paste the password from /var/www/ghostlegion/shared/.env on the VPS.');
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  await prisma.$queryRaw`SELECT 1`;
  const [locations, alerts, people, routes, resources, users] = await Promise.all([
    prisma.location.count(),
    prisma.alert.count(),
    prisma.people.count(),
    prisma.evacuationRoute.count(),
    prisma.resource.count(),
    prisma.user.count(),
  ]);
  console.log('MariaDB OK');
  console.log(`  users=${users} locations=${locations} people=${people} routes=${routes} resources=${resources} alerts=${alerts}`);
} catch (error) {
  console.error('MariaDB connection failed.');
  console.error(error instanceof Error ? error.message : error);
  console.error('Start the tunnel first: npm run db:tunnel');
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
