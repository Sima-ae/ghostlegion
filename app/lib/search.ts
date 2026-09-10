export type SearchHitType = 'country' | 'location' | 'memo' | 'element';

export type SearchHit = {
  type: SearchHitType;
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  netherlands: ['holland', 'nederland', 'the netherlands', 'nl'],
  'united kingdom': ['uk', 'britain', 'great britain', 'england'],
  czechia: ['czech republic'],
  'north macedonia': ['macedonia'],
  moldova: ['republic of moldova'],
};

export function normalizePlaceQuery(q: string) {
  return q
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(the|a|an|het|de|van|of)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchNeedles(q: string) {
  const raw = q.trim();
  const normalized = normalizePlaceQuery(raw);
  const needles = new Set<string>();
  if (raw) needles.add(raw);
  if (normalized) needles.add(normalized);
  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    const names = [canonical, ...aliases].map(normalizePlaceQuery);
    if (names.includes(normalized) || names.some((name) => name === normalized)) {
      needles.add(canonical);
      aliases.forEach((alias) => needles.add(alias));
    }
  }
  return [...needles].filter((needle) => needle.length >= 2);
}

export function placeMatchScore(name: string, q: string) {
  const title = normalizePlaceQuery(name);
  const query = normalizePlaceQuery(q);
  if (!title || !query) return 99;
  if (title === query) return 0;
  for (const [canonical, aliases] of Object.entries(COUNTRY_ALIASES)) {
    const names = [canonical, ...aliases].map(normalizePlaceQuery);
    if (names.includes(query) && names.includes(title)) return 0;
  }
  if (title.startsWith(query)) return 1;
  if (title.split(' ').includes(query)) return 2;
  if (title.includes(query)) return 3;
  if (query.includes(title) && title.length >= 4) return 4;
  return 99;
}
