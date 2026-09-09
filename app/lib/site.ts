/**
 * Canonical site URL for metadata, OG tags, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourdomain.com).
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return 'https://ghostlegion.online';
  return 'http://localhost:3000';
}

export const SITE_NAME = 'Ghost Legion';

export const SITE_TAGLINE = 'Online';

export const DEFAULT_DESCRIPTION =
  'Ghost Legion is a preparedness and community management platform: strategic location mapping, evacuation routes, alerts, resources, personnel coordination, and crisis checklists. Built for resilience, coordination, and public safety.';

export const SEO_KEYWORDS = [
  'preparedness',
  'crisis management',
  'emergency planning',
  'evacuation planning',
  'community resilience',
  'civil defense',
  'disaster preparedness',
  'strategic mapping',
  'bunker locations',
  'evacuation routes',
  'emergency alerts',
  'humanitarian logistics',
  'crisis coordination',
  'NATO preparedness',
  'European security',
  'crisis checklist',
  'war preparedness checklist',
  'emergency supplies tracking',
  'community management platform',
  'Ghost Legion',
] as const;

/** Default map / structured-data centroid. */
export const GEO = {
  latitude: 52.1326,
  longitude: 5.2913,
} as const;
