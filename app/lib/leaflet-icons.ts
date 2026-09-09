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

export function locationMarkerIcon(emoji = '📍') {
  fixLeafletDefaultIcons();
  const mark = safeEmoji(emoji);
  return L.divIcon({
    className: 'ghostlegion-pin',
    html: `<div style="width:36px;height:44px;display:flex;justify-content:center;pointer-events:none" aria-hidden="true">
      <div style="width:32px;height:32px;background:#fff;border:2px solid #1d4ed8;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35)">
        <span style="transform:rotate(45deg);font-size:16px;line-height:1">${mark}</span>
      </div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -38],
  });
}
