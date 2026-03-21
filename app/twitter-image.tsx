import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/app/lib/site';

export const alt =
  'Ghost Legion — Netherlands preparedness, mapping, and community coordination';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
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
          background: 'linear-gradient(145deg, #111827 0%, #1e3a5f 50%, #0f172a 100%)',
        }}
      >
        <span
          style={{
            fontSize: 58,
            fontWeight: 800,
            color: 'white',
            marginBottom: 20,
          }}
        >
          {SITE_NAME}
        </span>
        <span
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            maxWidth: 950,
            lineHeight: 1.35,
          }}
        >
          {SITE_TAGLINE}
        </span>
        <span
          style={{
            marginTop: 36,
            fontSize: 20,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          Netherlands · Crisis preparedness · PWA-ready
        </span>
      </div>
    ),
    { ...size }
  );
}
