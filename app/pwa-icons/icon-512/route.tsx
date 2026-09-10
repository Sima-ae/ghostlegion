import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function GET() {
  const data = await readFile(join(process.cwd(), 'public/icon-512.png'));
  return new Response(Uint8Array.from(data), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
