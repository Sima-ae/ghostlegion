'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Eye, EyeOff, Filter, Layers, X } from 'lucide-react';
import type { HeritageEra, HeritageFeature } from '../types';
import {
  lineKindsForEra,
  HERITAGE_FILTER_FIELDS,
  defaultLayerVisibility,
  legendConfig,
  type HeritageFilterField,
  type HeritageFilters,
  type HeritageLayerKey,
} from '../lib/heritage-styles';
import { useI18n } from '../lib/i18n/I18nProvider';

type PanelTab = 'legend' | 'layers' | 'filters';
type LegendEra = HeritageEra | 'OPERATIONS';

const FILTER_KEYS: Record<HeritageFilterField, string> = {
  ensemble: 'legend.filter.ensemble',
  category: 'legend.filter.category',
  builder: 'legend.filter.builder',
  historicalUser: 'legend.filter.historicalUser',
  domain: 'legend.filter.domain',
  function: 'legend.filter.function',
  featureType: 'legend.filter.featureType',
  presence: 'legend.filter.presence',
  accessibility: 'legend.filter.accessibility',
  visibilityNote: 'legend.filter.visibilityNote',
};

function uniqueValues(features: HeritageFeature[], field: HeritageFilterField) {
  const values = new Set<string>();
  for (const feature of features) {
    const value = String((feature as unknown as Record<string, unknown>)[field] ?? '').trim();
    if (value) values.add(value);
  }
  return [...values].sort((a, b) => a.localeCompare(b));
}

export default function MapLegendaPanel({
  era,
  features,
  layers,
  filters,
  onLayersChange,
  onFiltersChange,
}: {
  era: LegendEra;
  features: HeritageFeature[];
  layers: Record<HeritageLayerKey, boolean>;
  filters: HeritageFilters;
  onLayersChange: (layers: Record<HeritageLayerKey, boolean>) => void;
  onFiltersChange: (filters: HeritageFilters) => void;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<PanelTab>('legend');
  const legend = useMemo(() => legendConfig(era, locale), [era, locale]);

  const layerItems: { key: HeritageLayerKey; label: string }[] = useMemo(
    () => [
      { key: 'data1', label: t('legend.layer.civilMilitary') },
      { key: 'routes', label: t('legend.layer.routes') },
      { key: 'linies', label: t('legend.layer.linies') },
      { key: 'mud', label: t('legend.layer.mud') },
      { key: 'luchtwacht', label: t('legend.layer.luchtwacht') },
      { key: 'netwerk', label: t('legend.layer.netwerk') },
      { key: 'objecten', label: t('legend.layer.objectPoint') },
      { key: 'vlakken', label: t('legend.layer.objectArea') },
      { key: 'inundaties', label: t('legend.layer.inundatie') },
    ],
    [t]
  );

  const railBtn = (id: PanelTab, Icon: typeof BookOpen, label: string) => (
    <button
      key={id}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={open && tab === id}
      onClick={() => {
        if (open && tab === id) setOpen(false);
        else {
          setTab(id);
          setOpen(true);
        }
      }}
      className={`p-2 rounded-md ${
        open && tab === id ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="absolute z-[1100] top-[4.25rem] right-2 sm:top-14 sm:right-4 pointer-events-auto flex flex-row-reverse items-start gap-1.5 sm:gap-2 max-h-[min(75vh,48rem)]">
      <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white/95 shadow-md p-1">
        {railBtn('legend', BookOpen, t('legend.title'))}
        {railBtn('layers', Layers, t('legend.layers'))}
        {railBtn('filters', Filter, t('legend.filters'))}
      </div>

      {open ? (
        <div className="w-[min(25rem,calc(100vw-4.25rem))] sm:w-[min(25rem,calc(100vw-5.5rem))] rounded-lg border border-gray-200 bg-white/95 shadow-lg overflow-hidden flex flex-col max-h-[min(70vh,48rem)] sm:max-h-[min(88vh,48rem)]">
          <div className="flex flex-row-reverse items-center justify-between px-3 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 text-right">
              {tab === 'legend'
                ? t('legend.title')
                : tab === 'layers'
                  ? t('legend.layers')
                  : t('legend.filters')}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700"
              aria-label={t('legend.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-3 text-xs text-gray-700 text-right">
            {tab === 'legend' ? (
              <div className="space-y-5">
                <section className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-1">
                      {t('legend.civil')}
                    </p>
                    <ul className="space-y-0.5">
                      {legend.data1Civil.map((item) => (
                        <li
                          key={`c-${item.presence}`}
                          className="flex flex-row-reverse items-center justify-start gap-1.5"
                        >
                          <span
                            className="inline-block w-0 h-0 shrink-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent"
                            style={{ borderBottomColor: item.color }}
                          />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-1">
                      {t('legend.military')}
                    </p>
                    <ul className="space-y-0.5">
                      {legend.data1Military.map((item) => (
                        <li
                          key={`m-${item.presence}`}
                          className="flex flex-row-reverse items-center justify-start gap-1.5"
                        >
                          <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-gray-700"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section>
                  <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-2">
                    {t('legend.routes')}
                  </p>
                  <ul className="space-y-1.5">
                    {legend.routes.map((item) => (
                      <li
                        key={item.kind}
                        className="flex flex-row-reverse items-center justify-start gap-2 whitespace-nowrap"
                      >
                        <span
                          className="inline-block w-8 shrink-0 border-t-2"
                          style={{
                            borderColor: item.color,
                            borderTopWidth: Math.max(1, Math.min(4, item.weight)),
                            borderStyle: item.dashArray ? 'dashed' : 'solid',
                          }}
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-2">
                    {t('legend.linies')}
                  </p>
                  <ul className="space-y-1.5">
                    {legend.linies.map((item) => (
                      <li
                        key={item.kind}
                        className="flex flex-row-reverse items-center justify-start gap-2 whitespace-nowrap"
                      >
                        <span
                          className="inline-block w-8 shrink-0 border-t-2"
                          style={{
                            borderColor: item.color,
                            borderTopWidth: Math.max(1, Math.min(4, item.weight)),
                            borderStyle: item.dashArray ? 'dashed' : 'solid',
                          }}
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-2">
                    {t('legend.specialPins')}
                  </p>
                  <ul className="space-y-2">
                    {legend.data2Pins.map((item) => (
                      <li
                        key={item.kind}
                        className="flex flex-row-reverse items-start justify-start gap-2 whitespace-nowrap"
                      >
                        {item.kind === 'object' ? (
                          <span
                            className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 border border-white shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                        ) : item.kind === 'netwerk_groep' ? (
                          <span
                            className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-dashed text-[8px] font-bold"
                            style={{ borderColor: item.color, color: item.color }}
                          >
                            ·
                          </span>
                        ) : item.kind === 'netwerk_post' ? (
                          <span
                            className="mt-0.5 inline-block w-0 h-0 shrink-0 border-l-[5px] border-r-[5px] border-b-[9px] border-l-transparent border-r-transparent"
                            style={{ borderBottomColor: item.color }}
                          />
                        ) : (
                          <span
                            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.letter}
                          </span>
                        )}
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="font-semibold uppercase tracking-wide text-[10px] text-gray-500 mb-2">
                    {t('legend.areas')}
                  </p>
                  <ul className="space-y-1.5">
                    {legend.areas.map((item, index) => (
                      <li
                        key={`${item.label}-${index}`}
                        className="flex flex-row-reverse items-center justify-start gap-2"
                      >
                        <span
                          className="inline-block h-3 w-5 shrink-0 rounded-sm border border-gray-300"
                          style={{ backgroundColor: item.color, opacity: 0.7 }}
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}

            {tab === 'layers' ? (
              <ul className="space-y-2">
                {layerItems.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() =>
                        onLayersChange({ ...layers, [item.key]: !layers[item.key] })
                      }
                      className="flex w-full flex-row-reverse items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50 text-right"
                    >
                      <span className="capitalize">{item.label}</span>
                      {layers[item.key] ? (
                        <Eye className="h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => onLayersChange(defaultLayerVisibility(era))}
                    className="text-[11px] text-blue-600 hover:underline px-2 w-full text-right"
                  >
                    {t('legend.resetLayers')}
                  </button>
                </li>
              </ul>
            ) : null}

            {tab === 'filters' ? (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500">
                  {t('legend.filterHelp')}
                </p>
                {HERITAGE_FILTER_FIELDS.map((field) => {
                  const options = uniqueValues(features, field);
                  if (
                    field === 'presence' &&
                    options.length === 0
                  ) {
                    // still show presence always
                  } else if (field !== 'presence' && options.length === 0) {
                    return null;
                  }
                  const values =
                    field === 'presence'
                      ? [...new Set([...options, 'PRESENT', 'REMNANT', 'GONE', 'UNKNOWN'])]
                      : field === 'domain'
                        ? [...new Set([...options, 'MILITARY', 'CIVIL', 'COMBINED'])]
                        : options;
                  return (
                    <label key={field} className="block text-right">
                      <span className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1">
                        {t(FILTER_KEYS[field])}
                      </span>
                      <select
                        value={String(filters[field] || '')}
                        onChange={(event) =>
                          onFiltersChange({ ...filters, [field]: event.target.value })
                        }
                        className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-right"
                      >
                        <option value="">{t('legend.all')}</option>
                        {values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
                <button
                  type="button"
                  onClick={() => onFiltersChange({})}
                  className="text-[11px] text-blue-600 hover:underline w-full text-right"
                >
                  {t('legend.clearFilters')}
                </button>
                <p className="text-[10px] text-gray-400 pt-1">
                  {t('legend.lineKinds')} {lineKindsForEra(era).join(', ')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
