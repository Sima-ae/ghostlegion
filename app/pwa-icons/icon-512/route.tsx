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
            width: 400,
            height: 400,
            borderRadius: 80,
            border: '12px solid rgba(255,255,255,0.92)',
            background: 'transparent',
          }}
        >
          <span
            style={{
              fontSize: 160,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-8px',
            }}
          >
            GL
          </span>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
