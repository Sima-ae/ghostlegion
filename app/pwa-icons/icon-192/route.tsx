import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #111827 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: 28,
            border: '4px solid rgba(255,255,255,0.9)',
            background: 'transparent',
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            GL
          </span>
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
