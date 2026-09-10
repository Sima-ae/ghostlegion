import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE_NAME, SITE_TAGLINE } from '@/app/lib/site';

export const alt =
  'Ghost Legion';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/icon-512.png'));

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #111827 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString('base64')}`}
            width={96}
            height={96}
            alt=""
            style={{ objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: 'white',
                letterSpacing: -1,
              }}
            >
              {SITE_NAME}
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 900,
                lineHeight: 1.35,
              }}
            >
              {SITE_TAGLINE}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          Evacuation routes · Strategic mapping · Alerts · Resources · Emergency
          checklist.
        </div>
      </div>
    ),
    { ...size }
  );
}
