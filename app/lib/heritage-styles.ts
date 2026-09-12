import type {
  HeritageDomain,
  HeritageEra,
  HeritageFeature,
  HeritageGeometry,
  HeritagePresence,
} from '../types';
import { translate, type Locale } from './i18n/messages';

export const WW2_PRESENCE: HeritagePresence[] = [
  'PRESENT',
  'POSSIBLE',
  'ABSENT',
  'UNKNOWN',
];

export const COLD_WAR_PRESENCE: HeritagePresence[] = [
  'PRESENT',
  'REMNANT',
  'GONE',
  'UNKNOWN',
];

export const OBSTACLE_LINE_KINDS = [
  'tankgracht',
  'tankmuur',
  'loopgraaf',
  'gang',
  'hoeckerhindernisse',
  'asperge',
  'prikkeldraad',
  'onbekend',
] as const;

export const ROUTE_LINE_KINDS = [
  'hoofdroute',
  'zijwaardse_route',
  'verbindingsroute',
  'oefenweg',
  'inundatiekade',
  'overige',
] as const;

/** WW1 linies. */
export const WW1_LINIE_KINDS = [
  'grebbelinie',
  'ijssellinie_pre_wo2',
  'linie_van_de_spees',
  'stelling_van_amsterdam',
  'nieuwe_hollandse_waterlinie',
  'stelling_monden_maas_haringvliet',
  'stelling_hollands_diep_volkerak',
  'verlengde_grebbelinie',
  'werken_westerschelde',
] as const;

/** Koude Oorlog only — not shown on WW1/WW2. */
export const COLD_WAR_LINIE_KINDS = [
  'ijssellinie',
  'kornwerderzand',
  'den_oever',
  'afsluitdijk',
] as const;

/** WW2 linies (excl. KO-only Afsluitdijk / Kornwerderzand / Den Oever / IJssellinie KO). */
export const WW2_LINIE_KINDS = [
  'atlantikwall',
  'bathstelling',
  'betuwestelling',
  'geullinie_grenslijn',
  'geullinie_vertragingslijn',
  'grebbelinie',
  'ijssellinie_duits',
  'ijssellinie_pre_wo2',
  'kazematlinie_oldeneel_haerst',
  'linie_van_de_spees',
  'maaslinie',
  'maas_rur_stellung',
  'maas_waal_stelling',
  'neue_landfront_atlantikwall',
  'nieuwe_hollandse_waterlinie',
  'overige_duitse_stellingen',
  'pantherstellung',
  'peel_raamstelling',
  'stelling_monden_maas_haringvliet',
  'stelling_hollands_diep_volkerak',
  'verlengde_grebbelinie',
  'vordere_wasserstellung',
  'waal_lingestelling',
  'weerstandslijn_nen_a',
  'weerstandslijn_nen_b',
  'weerstandslijn_nen_c',
  'weerstandslijn_nen_f',
  'weerstandslijn_nen_g',
  'weerstandslijn_nen_o',
  'weerstandslijn_nen_q',
  'werken_westerschelde',
  'wonsstelling',
  'zanddijkstelling',
  'zuidfront_holland',
] as const;

export const WW1_LINE_KINDS = [
  ...WW1_LINIE_KINDS,
  ...OBSTACLE_LINE_KINDS,
  ...ROUTE_LINE_KINDS,
] as const;

export const WW2_LINE_KINDS = [
  ...WW2_LINIE_KINDS,
  ...OBSTACLE_LINE_KINDS,
  ...ROUTE_LINE_KINDS,
] as const;

export const COLD_WAR_LINE_KINDS = [
  ...COLD_WAR_LINIE_KINDS,
  ...OBSTACLE_LINE_KINDS,
  ...ROUTE_LINE_KINDS,
] as const;

export function lineKindsForEra(era: HeritageEra | 'OPERATIONS') {
  if (era === 'OPERATIONS') return [] as const;
  if (era === 'WW1') return WW1_LINE_KINDS;
  if (era === 'WW2') return WW2_LINE_KINDS;
  return COLD_WAR_LINE_KINDS;
}

export function isLinieLineKind(kind: string | null | undefined) {
  const value = String(kind || '');
  return (
    (WW1_LINIE_KINDS as readonly string[]).includes(value) ||
    (COLD_WAR_LINIE_KINDS as readonly string[]).includes(value) ||
    (WW2_LINIE_KINDS as readonly string[]).includes(value)
  );
}

export function isRouteLineKind(kind: string | null | undefined) {
  const value = String(kind || '');
  return (
    (ROUTE_LINE_KINDS as readonly string[]).includes(value) ||
    (OBSTACLE_LINE_KINDS as readonly string[]).includes(value)
  );
}

/** Combined Koude Oorlog point styles. */
export const COLD_WAR_PIN_KINDS = [
  'mud',
  'luchtwacht',
  'netwerk_post',
  'netwerk_groep',
  'object',
  'data1',
] as const;

export type ColdWarPinKind = (typeof COLD_WAR_PIN_KINDS)[number];

export const COLD_WAR_FEATURE_TYPES = [
  { value: 'militair', label: 'Militair object' },
  { value: 'civiel', label: 'Civiel object' },
  { value: 'mud', label: 'MUD-paal / bunker Mijnenuitkijkdienst' },
  { value: 'luchtwacht', label: 'Luchtwachtpost' },
  { value: 'netwerk_post', label: 'Netwerk luchtwachtpost' },
  { value: 'netwerk_groep', label: 'Luchtwachtgroep' },
  { value: 'object', label: 'Object (punt) Koude Oorlog' },
  { value: 'inundatie', label: 'Inundatiegebied' },
  { value: 'gebouwd', label: 'Vlak — gebouwd element' },
  { value: 'gebouwd_onzichtbaar', label: 'Vlak — gebouwd, niet meer zichtbaar' },
  { value: 'open_water', label: 'Vlak — open water' },
  { value: 'open_water_onzichtbaar', label: 'Vlak — open water, niet meer zichtbaar' },
  { value: 'overig_terrein', label: 'Vlak — overig terrein' },
  { value: 'overig_terrein_onzichtbaar', label: 'Vlak — overig terrein, niet meer zichtbaar' },
] as const;

export const HERITAGE_FILTER_FIELDS = [
  'ensemble',
  'category',
  'builder',
  'historicalUser',
  'domain',
  'function',
  'featureType',
  'presence',
  'accessibility',
  'visibilityNote',
] as const;

export type HeritageFilterField = (typeof HERITAGE_FILTER_FIELDS)[number];

const WW2_POINT_COLORS: Record<string, string> = {
  PRESENT: '#22c55e',
  POSSIBLE: '#f59e0b',
  ABSENT: '#ef4444',
  UNKNOWN: '#9ca3af',
};

const DATA2_GREEN = '#1b5e20';

/** Presence colors for civiel/militair points (militair = circle, civiel = triangle). */
const DATA1_POINT_COLORS: Record<string, string> = {
  PRESENT: '#6d28d9',
  REMNANT: '#a78bfa',
  GONE: '#f97316',
  UNKNOWN: '#e5e7eb',
};

const HERITAGE_LINE_STYLES: Record<string, { color: string; weight: number; dashArray?: string }> = {
  // Obstacles / routes (shared)
  tankgracht: { color: '#5b21b6', weight: 4 },
  tankmuur: { color: '#5b21b6', weight: 3, dashArray: '8 4' },
  loopgraaf: { color: '#dc2626', weight: 2, dashArray: '2 6' },
  gang: { color: '#ea580c', weight: 2, dashArray: '8 6' },
  hoeckerhindernisse: { color: '#d97706', weight: 2, dashArray: '1 4' },
  asperge: { color: '#2563eb', weight: 3 },
  prikkeldraad: { color: '#831843', weight: 2, dashArray: '1 3' },
  onbekend: { color: '#64748b', weight: 2 },
  hoofdroute: { color: '#111827', weight: 4 },
  zijwaardse_route: { color: '#94a3b8', weight: 2 },
  verbindingsroute: { color: '#0d9488', weight: 2, dashArray: '2 4' },
  oefenweg: { color: '#ec4899', weight: 2, dashArray: '8 4' },
  inundatiekade: { color: '#1e40af', weight: 3 },
  overige: { color: '#a16207', weight: 2 },
  // Koude Oorlog linies only
  ijssellinie: { color: '#7e57c2', weight: 4 },
  kornwerderzand: { color: '#4fc3f7', weight: 3 },
  den_oever: { color: '#c0ca33', weight: 3 },
  afsluitdijk: { color: '#8d6e63', weight: 3 },
  // WW2 linies
  atlantikwall: { color: '#2563eb', weight: 3 },
  bathstelling: { color: '#ea580c', weight: 3 },
  betuwestelling: { color: '#92400e', weight: 3 },
  geullinie_grenslijn: { color: '#f9a8d4', weight: 3 },
  geullinie_vertragingslijn: { color: '#86efac', weight: 3 },
  grebbelinie: { color: '#fdba74', weight: 3 },
  ijssellinie_duits: { color: '#c4b5fd', weight: 3 },
  ijssellinie_pre_wo2: { color: '#4ade80', weight: 3 },
  kazematlinie_oldeneel_haerst: { color: '#78716c', weight: 3 },
  linie_van_de_spees: { color: '#14b8a6', weight: 3 },
  stelling_van_amsterdam: { color: '#818cf8', weight: 3 },
  maaslinie: { color: '#7dd3fc', weight: 3 },
  maas_rur_stellung: { color: '#db2777', weight: 3 },
  maas_waal_stelling: { color: '#15803d', weight: 3 },
  neue_landfront_atlantikwall: { color: '#a3e635', weight: 3 },
  nieuwe_hollandse_waterlinie: { color: '#9f1239', weight: 3 },
  overige_duitse_stellingen: { color: '#fde68a', weight: 3 },
  pantherstellung: { color: '#bef264', weight: 3 },
  peel_raamstelling: { color: '#7c3aed', weight: 3 },
  stelling_monden_maas_haringvliet: { color: '#a8a29e', weight: 3 },
  stelling_hollands_diep_volkerak: { color: '#fbcfe8', weight: 3 },
  verlengde_grebbelinie: { color: '#4d7c0f', weight: 3 },
  vordere_wasserstellung: { color: '#d6d3d1', weight: 3 },
  waal_lingestelling: { color: '#38bdf8', weight: 3 },
  weerstandslijn_nen_a: { color: '#93c5fd', weight: 3 },
  weerstandslijn_nen_b: { color: '#a78bfa', weight: 3 },
  weerstandslijn_nen_c: { color: '#e11d48', weight: 3 },
  weerstandslijn_nen_f: { color: '#4338ca', weight: 3 },
  weerstandslijn_nen_g: { color: '#65a30d', weight: 3 },
  weerstandslijn_nen_o: { color: '#22d3ee', weight: 3 },
  weerstandslijn_nen_q: { color: '#f472b6', weight: 3 },
  werken_westerschelde: { color: '#166534', weight: 3 },
  wonsstelling: { color: '#1e3a8a', weight: 3 },
  zanddijkstelling: { color: '#84cc16', weight: 3 },
  zuidfront_holland: { color: '#ec4899', weight: 3 },
};

const COLD_WAR_AREA_COLORS: Record<string, { color: string; fillColor: string }> = {
  inundatie: { color: '#64b5f6', fillColor: '#90caf9' },
  gebouwd: { color: '#c62828', fillColor: '#ef5350' },
  gebouwd_onzichtbaar: { color: '#81d4fa', fillColor: '#b3e5fc' },
  open_water: { color: '#0288d1', fillColor: '#29b6f6' },
  open_water_onzichtbaar: { color: '#81d4fa', fillColor: '#e1f5fe' },
  overig_terrein: { color: '#2e7d32', fillColor: '#66bb6a' },
  overig_terrein_onzichtbaar: { color: '#a5d6a7', fillColor: '#c8e6c9' },
};

export function presenceLabel(
  presence: HeritagePresence,
  _era: HeritageEra,
  locale: Locale = 'en'
) {
  switch (presence) {
    case 'PRESENT':
      return translate(locale, 'presence.present');
    case 'POSSIBLE':
      return translate(locale, 'presence.possible');
    case 'ABSENT':
      return translate(locale, 'presence.absent');
    case 'REMNANT':
      return translate(locale, 'presence.remnant');
    case 'GONE':
      return translate(locale, 'presence.gone');
    default:
      return translate(locale, 'presence.unknown');
  }
}

/** Route/obstacle labels follow locale; linie names stay Dutch. */
export function routeKindLabel(kind: string, locale: Locale = 'en') {
  const key = `route.${kind}`;
  const translated = translate(locale, key);
  if (translated !== key) return translated;
  return lineKindLabel(kind);
}

export function lineKindLabel(kind: string) {
  switch (kind) {
    case 'tankgracht':
      return 'Tankgracht';
    case 'tankmuur':
      return 'Tankmuur';
    case 'loopgraaf':
      return 'Loopgraaf';
    case 'gang':
      return 'Gang';
    case 'hoeckerhindernisse':
      return 'Hoeckerhindernisse';
    case 'asperge':
      return 'Asperge';
    case 'prikkeldraad':
      return 'Prikkeldraad';
    case 'onbekend':
      return 'Onbekend';
    case 'ijssellinie':
      return 'IJssellinie (Koude Oorlog)';
    case 'kornwerderzand':
      return 'Stelling Kornwerderzand';
    case 'den_oever':
      return 'Stelling van Den Oever';
    case 'afsluitdijk':
      return 'Stellingen bij de Afsluitdijk';
    case 'hoofdroute':
      return 'Hoofdroute';
    case 'zijwaardse_route':
      return 'Zijwaardse route';
    case 'verbindingsroute':
      return 'Verbindingsroute';
    case 'oefenweg':
      return 'Oefenweg';
    case 'inundatiekade':
      return 'Inundatiekade';
    case 'overige':
      return 'Overige';
    case 'atlantikwall':
      return 'Atlantikwall';
    case 'bathstelling':
      return 'Bathstelling';
    case 'betuwestelling':
      return 'Betuwestelling';
    case 'geullinie_grenslijn':
      return 'Geullinie - grenslijn';
    case 'geullinie_vertragingslijn':
      return 'Geullinie - vertragingslijn';
    case 'grebbelinie':
      return 'Grebbelinie';
    case 'ijssellinie_duits':
      return 'IJssellinie Duits';
    case 'ijssellinie_pre_wo2':
      return 'IJssellinie (pre WW2)';
    case 'kazematlinie_oldeneel_haerst':
      return 'Kazematlinie Oldeneel-Haerst';
    case 'linie_van_de_spees':
      return 'Linie van de Spees';
    case 'stelling_van_amsterdam':
      return 'Stelling van Amsterdam';
    case 'maaslinie':
      return 'Maaslinie';
    case 'maas_rur_stellung':
      return 'Maas-Rur-Stellung';
    case 'maas_waal_stelling':
      return 'Maas-Waal Stelling';
    case 'neue_landfront_atlantikwall':
      return 'Neue Landfront Atlantikwall';
    case 'nieuwe_hollandse_waterlinie':
      return 'Nieuwe Hollandse Waterlinie';
    case 'overige_duitse_stellingen':
      return 'Overige Duitse stellingen';
    case 'pantherstellung':
      return 'Pantherstellung';
    case 'peel_raamstelling':
      return 'Peel-Raamstelling';
    case 'stelling_monden_maas_haringvliet':
      return 'Stelling van de Monden van de Maas en het Haringvliet';
    case 'stelling_hollands_diep_volkerak':
      return 'Stelling van het Hollands Diep en het Volkerak';
    case 'verlengde_grebbelinie':
      return 'Verlengde Grebbelinie';
    case 'vordere_wasserstellung':
      return 'Vordere Wasserstellung';
    case 'waal_lingestelling':
      return 'Waal-Lingestelling';
    case 'weerstandslijn_nen_a':
      return 'Weerstandslinies Noord-Oost Nederland A-lijn';
    case 'weerstandslijn_nen_b':
      return 'Weerstandslinies Noord-Oost Nederland B-lijn';
    case 'weerstandslijn_nen_c':
      return 'Weerstandslinies Noord-Oost Nederland C-lijn';
    case 'weerstandslijn_nen_f':
      return 'Weerstandslinies Noord-Oost Nederland F-lijn';
    case 'weerstandslijn_nen_g':
      return 'Weerstandslinies Noord-Oost Nederland G-lijn';
    case 'weerstandslijn_nen_o':
      return 'Weerstandslinies Noord-Oost Nederland O-lijn';
    case 'weerstandslijn_nen_q':
      return 'Weerstandslinies Noord-Oost Nederland Q-lijn';
    case 'werken_westerschelde':
      return 'Werken aan de Westerschelde';
    case 'wonsstelling':
      return 'Wonsstelling';
    case 'zanddijkstelling':
      return 'Zanddijkstelling';
    case 'zuidfront_holland':
      return 'Zuidfront Holland';
    default: {
      const plain = kind.replaceAll('_', ' ');
      return plain ? plain.charAt(0).toUpperCase() + plain.slice(1) : plain;
    }
  }
}

/** Era + locale aware linie labels. Linies stay Dutch in NL; EN translates terms like Duits→German. */
export function linieKindLabel(
  kind: string,
  era: HeritageEra | 'OPERATIONS' = 'COLD_WAR',
  locale: Locale = 'en'
) {
  if (kind === 'ijssellinie') {
    return locale === 'nl' ? 'IJssellinie (Koude Oorlog)' : 'IJssellinie (Cold War)';
  }
  if (kind === 'ijssellinie_pre_wo2') {
    if (era === 'WW1') {
      return 'IJssellinie (pre WW2)';
    }
    return locale === 'nl' ? 'IJssellinie (pre Koude Oorlog)' : 'IJssellinie (pre Cold War)';
  }
  if (kind === 'ijssellinie_duits') {
    return locale === 'nl' ? 'IJssellinie Duits' : 'IJssellinie (German)';
  }
  if (kind === 'overige_duitse_stellingen') {
    return locale === 'nl' ? 'Overige Duitse stellingen' : 'Other German fortifications';
  }

  const dutch = lineKindLabel(kind);
  if (locale === 'nl') return dutch;

  // Light EN substitutions for common Dutch adjectives in linie names
  return dutch
    .replace(/\bDuitse\b/g, 'German')
    .replace(/\bDuits\b/g, 'German')
    .replace(/\bKoude Oorlog\b/g, 'Cold War');
}

export function coldWarPinKind(
  feature: Pick<HeritageFeature, 'featureType' | 'category' | 'function' | 'name'> & {
    domain?: HeritageDomain | null;
  }
): ColdWarPinKind {
  const hay = `${feature.featureType || ''} ${feature.category || ''} ${feature.function || ''} ${feature.name || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  if (/(mud|mijnenuitkijk|mijnen)/.test(hay)) return 'mud';
  if (/luchtwachtgroep|netwerk_groep/.test(hay)) return 'netwerk_groep';
  if (/netwerk_post/.test(hay)) return 'netwerk_post';
  if (/luchtwacht/.test(hay)) return 'luchtwacht';
  if (/netwerk/.test(hay)) return 'netwerk_post';
  if (/\bobject\b/.test(hay) && !/civiel|militair|data1/.test(hay)) return 'object';
  return 'data1';
}

export function coldWarPinLetter(kind: ColdWarPinKind) {
  if (kind === 'mud') return 'M';
  if (kind === 'luchtwacht') return 'L';
  return '';
}

export function data1PointColor(presence: HeritagePresence) {
  return DATA1_POINT_COLORS[presence] || DATA1_POINT_COLORS.UNKNOWN;
}

export function pointColor(feature: Pick<HeritageFeature, 'era' | 'presence' | 'color'>) {
  if (feature.color) return feature.color;
  if (feature.era === 'WW2') return WW2_POINT_COLORS[feature.presence] || WW2_POINT_COLORS.UNKNOWN;
  return data1PointColor(feature.presence);
}

export function isInundatie(feature: Pick<HeritageFeature, 'featureType' | 'lineKind' | 'category'>) {
  const hay = `${feature.featureType || ''} ${feature.lineKind || ''} ${feature.category || ''}`.toLowerCase();
  return hay.includes('inundatie');
}

export function areaStyle(
  feature: Pick<HeritageFeature, 'era' | 'presence' | 'color' | 'featureType' | 'category'>
) {
  const key = String(feature.featureType || feature.category || '')
    .toLowerCase()
    .replace(/\s+/g, '_');
  if (isInundatie(feature) || key.includes('inundatie')) {
    const style = COLD_WAR_AREA_COLORS.inundatie;
    return { ...style, fillOpacity: 0.4, weight: 1, dashArray: '4 3' };
  }
  const match = COLD_WAR_AREA_COLORS[key] || null;
  if (match) {
    return { ...match, fillOpacity: 0.45, weight: 1 };
  }
  const fill = pointColor(feature);
  return {
    color: fill,
    fillColor: fill,
    fillOpacity: 0.28,
    weight: 2,
  };
}

export function lineStyle(feature: Pick<HeritageFeature, 'era' | 'lineKind' | 'color' | 'size'>) {
  const base = HERITAGE_LINE_STYLES[feature.lineKind || ''] || { color: '#6b7280', weight: 2 };
  return {
    color: feature.color || base.color,
    weight: feature.size || base.weight,
    dashArray: base.dashArray,
  };
}

export type HeritageLayerKey =
  | 'punten'
  | 'lijnen'
  | 'linies'
  | 'routes'
  | 'vlakken'
  | 'inundaties'
  | 'mud'
  | 'luchtwacht'
  | 'netwerk'
  | 'objecten'
  | 'data1';

export function defaultLayerVisibility(_era: HeritageEra | 'OPERATIONS'): Record<HeritageLayerKey, boolean> {
  return {
    punten: false,
    lijnen: true,
    linies: true,
    routes: true,
    vlakken: true,
    inundaties: true,
    mud: true,
    luchtwacht: true,
    netwerk: true,
    objecten: true,
    data1: true,
  };
}

export function featureMatchesLayers(
  feature: HeritageFeature,
  layers: Record<HeritageLayerKey, boolean>
) {
  if (feature.geometry === 'LINE') {
    if (isLinieLineKind(feature.lineKind)) return layers.linies;
    if (isRouteLineKind(feature.lineKind)) return layers.routes;
    return layers.lijnen || layers.linies || layers.routes;
  }
  if (feature.geometry === 'AREA') {
    if (isInundatie(feature)) return layers.inundaties;
    return layers.vlakken;
  }
  const kind = coldWarPinKind(feature);
  if (kind === 'mud') return layers.mud;
  if (kind === 'luchtwacht') return layers.luchtwacht;
  if (kind === 'netwerk_post' || kind === 'netwerk_groep') return layers.netwerk;
  if (kind === 'object') return layers.objecten;
  return layers.data1;
}

export type HeritageFilters = Partial<
  Record<HeritageFilterField, string> & { domain: HeritageDomain | ''; presence: HeritagePresence | '' }
>;

export function featureMatchesFilters(feature: HeritageFeature, filters: HeritageFilters) {
  for (const [key, raw] of Object.entries(filters)) {
    const value = String(raw || '').trim();
    if (!value) continue;
    const field = key as HeritageFilterField;
    const current = String(
      (feature as unknown as Record<string, unknown>)[field] ?? ''
    ).trim();
    if (current.toLowerCase() !== value.toLowerCase()) return false;
  }
  return true;
}

export function legendConfig(era: HeritageEra | 'OPERATIONS', locale: Locale = 'en') {
  const linieKinds =
    era === 'OPERATIONS'
      ? ([] as readonly string[])
      : era === 'WW1'
        ? WW1_LINIE_KINDS
        : era === 'WW2'
          ? WW2_LINIE_KINDS
          : COLD_WAR_LINIE_KINDS;
  const routeKinds = [...OBSTACLE_LINE_KINDS, ...ROUTE_LINE_KINDS] as const;

  return {
    style: 'combined' as const,
    data1Civil: COLD_WAR_PRESENCE.map((presence) => ({
      presence,
      label: presenceLabel(presence, 'COLD_WAR', locale),
      color: DATA1_POINT_COLORS[presence],
      shape: 'triangle' as const,
      domain: 'CIVIL' as HeritageDomain,
    })),
    data1Military: COLD_WAR_PRESENCE.map((presence) => ({
      presence,
      label: presenceLabel(presence, 'COLD_WAR', locale),
      color: DATA1_POINT_COLORS[presence],
      shape: 'circle' as const,
      domain: 'MILITARY' as HeritageDomain,
    })),
    data2Pins: [
      {
        kind: 'mud' as const,
        letter: 'M',
        label: translate(locale, 'pin.mud'),
        color: DATA2_GREEN,
      },
      {
        kind: 'luchtwacht' as const,
        letter: 'L',
        label: translate(locale, 'pin.luchtwacht'),
        color: DATA2_GREEN,
      },
      {
        kind: 'netwerk_post' as const,
        letter: '',
        label: translate(locale, 'pin.netwerkPost'),
        color: DATA2_GREEN,
      },
      {
        kind: 'netwerk_groep' as const,
        letter: '',
        label: translate(locale, 'pin.netwerkGroep'),
        color: DATA2_GREEN,
      },
      {
        kind: 'object' as const,
        letter: '',
        label: translate(locale, 'pin.object'),
        color: '#111827',
      },
    ],
    linies: linieKinds.map((kind) => ({
      kind,
      label: linieKindLabel(kind, era, locale),
      ...HERITAGE_LINE_STYLES[kind],
    })),
    routes: routeKinds.map((kind) => ({
      kind,
      label: routeKindLabel(kind, locale),
      ...HERITAGE_LINE_STYLES[kind],
    })),
    areas: [
      { label: translate(locale, 'area.inundatie'), color: '#90caf9' },
      { label: translate(locale, 'area.gebouwd'), color: '#ef5350' },
      { label: translate(locale, 'area.gebouwdOnzichtbaar'), color: '#b3e5fc' },
      { label: translate(locale, 'area.openWater'), color: '#29b6f6' },
      { label: translate(locale, 'area.overigTerrein'), color: '#66bb6a' },
    ],
  };
}

export function eraFromMode(mode: 'ww1' | 'ww2' | 'cold_war'): HeritageEra {
  if (mode === 'ww1') return 'WW1';
  if (mode === 'ww2') return 'WW2';
  return 'COLD_WAR';
}

export function geometryLabel(geometry: HeritageGeometry) {
  switch (geometry) {
    case 'POINT':
      return 'punt';
    case 'LINE':
      return 'lijn';
    case 'AREA':
      return 'vlak';
  }
}
