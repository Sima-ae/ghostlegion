import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Ghost Legion — Preparedness & Community',
    short_name: 'Ghost Legion',
    description:
      'Preparedness and community management: mapping, evacuation plans, alerts, and coordination.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    orientation: 'any',
    background_color: '#111827',
    theme_color: '#111827',
    categories: ['navigation', 'utilities', 'government'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/pwa-icons/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icons/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icons/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
