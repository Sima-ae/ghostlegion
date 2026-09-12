'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Loader2, MapPin, Search, Shapes, StickyNote, X } from 'lucide-react';
import { emitMapFocus } from '../lib/map-focus';
import type { SearchHit, SearchHitType } from '../lib/search';
import { useI18n } from '../lib/i18n/I18nProvider';

const TYPE_META: Record<
  SearchHitType,
  { labelKey: string; badge: string; Icon: typeof Globe }
> = {
  country: {
    labelKey: 'search.countries',
    badge: 'bg-sky-500/20 text-sky-300',
    Icon: Globe,
  },
  location: {
    labelKey: 'search.locations',
    badge: 'bg-emerald-500/20 text-emerald-300',
    Icon: MapPin,
  },
  memo: {
    labelKey: 'search.memos',
    badge: 'bg-amber-500/20 text-amber-300',
    Icon: StickyNote,
  },
  element: {
    labelKey: 'search.elements',
    badge: 'bg-slate-500/20 text-slate-300',
    Icon: Shapes,
  },
};

const TYPE_ORDER: SearchHitType[] = ['country', 'location', 'memo', 'element'];

function groupHits(hits: SearchHit[]) {
  return TYPE_ORDER.map((type) => ({
    type,
    hits: hits.filter((hit) => hit.type === type),
  })).filter((group) => group.hits.length > 0);
}

export default function HeaderSearch({
  autoFocus = false,
  onSettled,
}: {
  autoFocus?: boolean;
  onSettled?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState('');

  const trimmed = query.trim();
  const groups = useMemo(() => groupHits(results), [results]);
  const flat = useMemo(() => groups.flatMap((group) => group.hits), [groups]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setResults([]);
          setError(data?.error || t('search.failed'));
          return;
        }
        const hits = Array.isArray(data?.results) ? (data.results as SearchHit[]) : [];
        setResults(hits);
        setActiveIndex(0);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setResults([]);
        setError(t('search.failed'));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const selectHit = useCallback(
    (hit: SearchHit) => {
      emitMapFocus({
        type: hit.type,
        id: hit.id,
        lat: hit.lat,
        lng: hit.lng,
        title: hit.title,
      });
      setOpen(false);
      inputRef.current?.blur();
      if (pathname !== '/') {
        router.push('/');
      }
      onSettled?.();
    },
    [onSettled, pathname, router]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      if (query) setQuery('');
      else onSettled?.();
      return;
    }
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter') && flat.length) {
      setOpen(true);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (flat.length ? (index + 1) % flat.length : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (flat.length ? (index - 1 + flat.length) % flat.length : 0));
      return;
    }
    if (event.key === 'Enter') {
      const hit = flat[activeIndex];
      if (hit) {
        event.preventDefault();
        selectHit(hit);
      }
    }
  };

  const showPanel = Boolean(open && (trimmed.length >= 1 || loading || error));
  let activeOffset = 0;

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flat[activeIndex] ? `${listId}-${flat[activeIndex].type}-${flat[activeIndex].id}` : undefined}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (trimmed.length >= 1) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="block w-full pl-8 sm:pl-10 pr-16 py-1.5 sm:py-2 text-sm border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-search-cancel-button]:hidden"
          placeholder={t('search.placeholder')}
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : null}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setError('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 mt-1 max-h-[min(24rem,70vh)] overflow-y-auto rounded-md border border-gray-700 bg-gray-800 shadow-xl z-[1100]"
        >
          {trimmed.length < 2 ? (
            <p className="px-3 py-2.5 text-sm text-gray-400">Type at least 2 characters to search.</p>
          ) : error ? (
            <p className="px-3 py-2.5 text-sm text-red-300">{error}</p>
          ) : loading && results.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-gray-400">{t('search.searching')}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-gray-400">No matches for “{trimmed}”.</p>
          ) : (
            groups.map((group) => {
              const meta = TYPE_META[group.type];
              return (
                <div key={group.type} className="py-1">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {t(meta.labelKey)}
                  </div>
                  {group.hits.map((hit) => {
                    const index = activeOffset;
                    activeOffset += 1;
                    const active = index === activeIndex;
                    const Icon = TYPE_META[hit.type].Icon;
                    return (
                      <button
                        key={`${hit.type}-${hit.id}`}
                        id={`${listId}-${hit.type}-${hit.id}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectHit(hit)}
                        className={`flex w-full items-start gap-2 px-3 py-2 text-left ${
                          active ? 'bg-gray-700' : 'hover:bg-gray-700/70'
                        }`}
                      >
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-white">{hit.title}</span>
                          <span className="block truncate text-xs text-gray-400">{hit.subtitle}</span>
                        </span>
                        <span
                          className={`mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${TYPE_META[hit.type].badge}`}
                        >
                          {hit.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
