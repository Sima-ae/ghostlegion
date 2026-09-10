import { existsSync, readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { elementFocusLatLng, mainlandPolygonParts } from '../app/lib/map-geometry';

function loadEnvFile(path: string) {
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

function ringCount(coords: unknown) {
  if (!Array.isArray(coords) || !coords.length) return 0;
  const first = coords[0];
  if (Array.isArray(first) && typeof first[0] === 'number') return 1;
  if (Array.isArray(first) && Array.isArray(first[0])) return coords.length;
  return 0;
}

async function main() {
  loadEnvFile('.env.local');
  const apply = process.argv.includes('--apply');
  const prisma = new PrismaClient();
  const rows = await prisma.mapElement.findMany({
    where: {
      OR: [{ category: 'Country' }, { description: { startsWith: 'Country outline:' } }],
    },
    select: { id: true, label: true, coordinates: true },
    orderBy: { label: 'asc' },
  });

  let updated = 0;
  for (const row of rows) {
    const before = ringCount(row.coordinates);
    const parts = mainlandPolygonParts(row.coordinates);
    const next = parts.length === 1 ? parts[0] : parts;
    const after = parts.length;
    const focus = elementFocusLatLng(next);
    if (before === after) continue;
    console.log(
      `${row.label}: ${before} rings -> ${after} rings; focus ${
        focus ? `${focus[0].toFixed(2)}, ${focus[1].toFixed(2)}` : 'none'
      }`
    );
    if (apply) {
      await prisma.mapElement.update({
        where: { id: row.id },
        data: { coordinates: next },
      });
      updated += 1;
    }
  }

  console.log(apply ? `Updated ${updated} countries` : 'Dry run only (pass --apply to save)');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
