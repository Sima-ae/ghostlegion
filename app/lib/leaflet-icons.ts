import L from 'leaflet';

/**
 * Leaflet's default marker PNGs resolve to broken node_modules paths in
 * Next.js standalone. Use inlined SVG data URIs so pins never 404 in production.
 */
let patched = false;

const DEFAULT_PIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path fill="#2563eb" stroke="#fff" stroke-width="1.5" d="M12.5 1.2C6.7 1.2 2 5.9 2 11.7 2 21.2 12.5 39 12.5 39S23 21.2 23 11.7C23 5.9 18.3 1.2 12.5 1.2z"/>
    <circle fill="#fff" cx="12.5" cy="12" r="5.2"/>
  </svg>`
);

const DEFAULT_PIN_URL = `data:image/svg+xml;charset=UTF-8,${DEFAULT_PIN_SVG}`;
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export function fixLeafletDefaultIcons() {
  if (patched || typeof window === 'undefined') return;

  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.imagePath = '/leaflet/';

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: DEFAULT_PIN_URL,
    iconUrl: DEFAULT_PIN_URL,
    shadowUrl: TRANSPARENT_PIXEL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [0, 0],
  });

  patched = true;
}

function safeEmoji(emoji: string) {
  return String(emoji).replace(/[<>&"'`]/g, '');
}

/** Pins grow as you zoom in and shrink as you zoom out. Default map zoom is 8. */
export function locationPinScale(zoom: number) {
  const defaultZoom = 8;
  const defaultScale = 0.41;
  const zoomOutFactor = 0.72;
  const zoomInFactor = 1.24;
  const minScale = 0.18;
  const maxScale = 1.9;
  const scale =
    zoom >= defaultZoom
      ? defaultScale * Math.pow(zoomInFactor, zoom - defaultZoom)
      : defaultScale * Math.pow(zoomOutFactor, defaultZoom - zoom);
  return Math.min(maxScale, Math.max(minScale, scale));
}

export function applyLocationPinScale(map: L.Map) {
  const scale = locationPinScale(map.getZoom());
  map.getContainer().style.setProperty('--gl-pin-scale', scale.toFixed(3));
}

export function locationMarkerIcon(emoji = '📍') {
  fixLeafletDefaultIcons();
  const mark = safeEmoji(emoji);
  return L.divIcon({
    className: 'ghostlegion-pin',
    html: `<div class="ghostlegion-pin-wrap" aria-hidden="true">
      <div class="ghostlegion-pin-body">
        <span class="ghostlegion-pin-emoji">${mark}</span>
      </div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -38],
  });
}

export function memoMarkerIcon() {
  fixLeafletDefaultIcons();
  return L.divIcon({
    className: 'ghostlegion-pin ghostlegion-memo-pin',
    html: `<div class="ghostlegion-pin-wrap" aria-hidden="true">
      <div class="ghostlegion-pin-body">
        <span class="ghostlegion-pin-emoji">📝</span>
      </div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -38],
  });
}

/** Presence-colored heritage markers: circle (military/WW2) or triangle (civil KO). */
export function heritagePointIcon(
  color: string,
  shape: 'circle' | 'triangle' = 'circle',
  outlined = false
) {
  fixLeafletDefaultIcons();
  const stroke = outlined || color === '#e5e7eb' ? '#111827' : '#ffffff';
  const fill = color;
  const svg =
    shape === 'triangle'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
          <path d="M9 2 L16 15 H2 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6.2" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
        </svg>`;
  return L.divIcon({
    className: 'ghostlegion-heritage-pin',
    html: `<div style="line-height:0;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))">${svg}</div>`,
    iconSize: shape === 'triangle' ? [18, 18] : [16, 16],
    iconAnchor: shape === 'triangle' ? [9, 14] : [8, 8],
    popupAnchor: [0, -10],
  });
}

/** Koude Oorlog specialty pins (MUD, luchtwacht, netwerk, object). */
export function data2ColdWarPinIcon(
  kind: 'mud' | 'luchtwacht' | 'netwerk_post' | 'netwerk_groep' | 'object',
  mark = ''
) {
  fixLeafletDefaultIcons();
  const green = '#1b5e20';
  const letter = String(mark || '')
    .slice(0, 2)
    .replace(/[<>&"'`]/g, '');

  if (kind === 'object') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
      <rect x="1.5" y="1.5" width="9" height="9" fill="#111827" stroke="#fff" stroke-width="1"/>
    </svg>`;
    return L.divIcon({
      className: 'ghostlegion-heritage-pin',
      html: `<div style="line-height:0;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))">${svg}</div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -8],
    });
  }

  if (kind === 'netwerk_groep') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="11" fill="none" stroke="${green}" stroke-width="2" stroke-dasharray="3 3"/>
      <text x="14" y="18" text-anchor="middle" font-size="10" font-family="Arial,sans-serif" font-weight="700" fill="${green}">${letter || '·'}</text>
    </svg>`;
    return L.divIcon({
      className: 'ghostlegion-heritage-pin',
      html: `<div style="line-height:0">${svg}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -12],
    });
  }

  if (kind === 'netwerk_post') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <path d="M11 3 L19 18 H3 Z" fill="${green}" stroke="#fff" stroke-width="1.2"/>
      <text x="11" y="16" text-anchor="middle" font-size="7" font-family="Arial,sans-serif" font-weight="700" fill="#fff">${letter || ''}</text>
    </svg>`;
    return L.divIcon({
      className: 'ghostlegion-heritage-pin',
      html: `<div style="line-height:0;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))">${svg}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 18],
      popupAnchor: [0, -14],
    });
  }

  // MUD / Luchtwacht teardrop pin with letter
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="34" viewBox="0 0 24 34">
    <path d="M12 1.5C6.7 1.5 2.5 5.7 2.5 11c0 7.2 9.5 20.5 9.5 20.5S21.5 18.2 21.5 11C21.5 5.7 17.3 1.5 12 1.5z" fill="${green}" stroke="#fff" stroke-width="1.4"/>
    <circle cx="12" cy="11" r="6.2" fill="${green}"/>
    <text x="12" y="14.5" text-anchor="middle" font-size="10" font-family="Arial,sans-serif" font-weight="700" fill="#fff">${letter || (kind === 'mud' ? 'M' : 'L')}</text>
  </svg>`;
  return L.divIcon({
    className: 'ghostlegion-heritage-pin',
    html: `<div style="line-height:0;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">${svg}</div>`,
    iconSize: [24, 34],
    iconAnchor: [12, 33],
    popupAnchor: [0, -30],
  });
}
