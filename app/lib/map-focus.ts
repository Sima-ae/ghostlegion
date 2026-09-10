export const MAP_FOCUS_EVENT = 'gl-map-focus';
export const MAP_FOCUS_SETTLED_EVENT = 'gl-map-focus-settled';
const STORAGE_KEY = 'gl-map-focus';

export type MapFocusType = 'country' | 'location' | 'memo' | 'element';

export type MapFocusTarget = {
  type: MapFocusType;
  id: string;
  lat: number;
  lng: number;
  title?: string;
};

let memory: MapFocusTarget | null = null;

export function emitMapFocus(target: MapFocusTarget) {
  memory = target;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(MAP_FOCUS_EVENT, { detail: target }));
}

export function emitMapFocusSettled(target: MapFocusTarget) {
  window.dispatchEvent(new CustomEvent(MAP_FOCUS_SETTLED_EVENT, { detail: target }));
}

export function peekMapFocus(): MapFocusTarget | null {
  if (memory && Number.isFinite(memory.lat) && Number.isFinite(memory.lng) && memory.id) {
    return memory;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MapFocusTarget;
    if (
      !parsed ||
      typeof parsed.lat !== 'number' ||
      typeof parsed.lng !== 'number' ||
      !parsed.id
    ) {
      return null;
    }
    memory = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function hasStoredMapFocus() {
  return Boolean(peekMapFocus());
}

export function consumeMapFocus(): MapFocusTarget | null {
  const current = peekMapFocus();
  memory = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return current;
}

export function focusZoom(type: MapFocusType) {
  switch (type) {
    case 'country':
      return 7;
    case 'element':
      return 10;
    case 'location':
      return 13;
    case 'memo':
      return 14;
    default:
      return 10;
  }
}
