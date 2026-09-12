'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n/I18nProvider';
import { LOCALE_META, type Locale } from '../lib/i18n/messages';

const OPTIONS: Locale[] = ['nl', 'en'];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={t('header.language')}
        aria-label={t('header.language')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none" aria-hidden>
          {LOCALE_META[locale].flag}
        </span>
        <span className="hidden sm:inline text-xs font-medium uppercase tracking-wide">
          {locale}
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={t('header.language')}
          className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-[9999]"
        >
          {OPTIONS.map((id) => {
            const meta = LOCALE_META[id];
            const active = id === locale;
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-base leading-none" aria-hidden>
                  {meta.flag}
                </span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
