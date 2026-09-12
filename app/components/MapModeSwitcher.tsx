'use client';

import type { MapViewMode } from '../types';
import { useI18n } from '../lib/i18n/I18nProvider';

const MODE_KEYS: { id: MapViewMode; key: string }[] = [
  { id: 'operations', key: 'mode.operations' },
  { id: 'cold_war', key: 'mode.coldWar' },
  { id: 'ww2', key: 'mode.ww2' },
  { id: 'ww1', key: 'mode.ww1' },
];

export default function MapModeSwitcher({
  mode,
  onChange,
}: {
  mode: MapViewMode;
  onChange: (mode: MapViewMode) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="absolute z-[1100] top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
      <div className="flex divide-x divide-gray-300 rounded-lg border border-gray-300 bg-white/95 shadow-md overflow-hidden text-xs sm:text-sm">
        {MODE_KEYS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`px-2.5 sm:px-3 py-1.5 whitespace-nowrap transition-colors ${
              mode === item.id
                ? 'bg-slate-800 text-white'
                : 'bg-white/95 text-gray-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {t(item.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
