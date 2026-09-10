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

/** Pins grow as you zoom in and shrink as you zoom out. Default map zoom is 7. */
export function locationPinScale(zoom: number) {
  const defaultZoom = 7;
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
