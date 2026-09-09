'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePwa } from './PwaProvider';

type BrowserHint =
  | 'chrome'
  | 'edge'
  | 'opera'
  | 'firefox'
  | 'firefox-android'
  | 'safari-ios'
  | 'safari-macos'
  | 'generic';

function detectBrowserHint(): BrowserHint {
  if (typeof navigator === 'undefined') return 'generic';
  const ua = navigator.userAgent;
  const maxTouch =
    'maxTouchPoints' in navigator ? navigator.maxTouchPoints : 0;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && maxTouch > 1);

  if (isIOS || /CriOS|FxiOS/.test(ua)) return 'safari-ios';
  if (/Firefox\//.test(ua) && !/Seamonkey/i.test(ua)) {
    return /Android/i.test(ua) ? 'firefox-android' : 'firefox';
  }
  if (/Edg\//.test(ua)) return 'edge';
  if (/OPR\//.test(ua) || /Opera|OPiOS/i.test(ua)) return 'opera';
  if (/Chrome\//.test(ua) && !/Edg|OPR/.test(ua)) return 'chrome';
  if (/Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Android/i.test(ua))
    return 'safari-macos';
  return 'generic';
}

function ManualSteps({ hint }: { hint: BrowserHint }) {
  const rows: Record<BrowserHint, string[]> = {
    chrome: [
      'Chrome: open the menu (⋮) → Install Ghost Legion… or Save and share → Install page as app.',
      'If you do not see Install, confirm the site is served over HTTPS and try again after a short wait.',
    ],
    edge: [
      'Microsoft Edge: menu (⋯) → Apps → Install this site as an app.',
    ],
    opera: [
      'Opera: menu → Go to full site settings → Install app (wording may vary by version).',
    ],
    firefox: [
      'Firefox (desktop): open the application menu (☰) → Install.',
      'If Install is missing, your Firefox build may not expose PWAs — use Chrome or Edge for one-click install.',
    ],
    'firefox-android': [
      'Firefox for Android: Menu → Add to Home screen.',
    ],
    'safari-ios': [
      'Safari on iPhone/iPad: tap Share → Add to Home Screen → Add.',
      'Chrome on iOS uses the same system WebKit — use Share → Add to Home Screen.',
    ],
    'safari-macos': [
      'Safari on Mac (macOS Sonoma or newer): File → Add to Dock…',
      'Older Safari: use Chrome or Edge for a full install prompt.',
    ],
    generic: [
      'Look for “Install app”, “Add to Home screen”, or “Create shortcut” in the browser menu.',
      'The site must be served over HTTPS (except on localhost).',
    ],
  };

  return (
    <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc pl-5">
      {rows[hint].map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default function PwaInstallButton() {
  const {
    isStandalone,
    canUseNativePrompt,
    justInstalled,
    registerComplete,
    runNativeInstall,
  } = usePwa();
  const [open, setOpen] = useState(false);
  const hint = useMemo(() => detectBrowserHint(), []);

  const onInstallClick = useCallback(async () => {
    if (canUseNativePrompt) {
      await runNativeInstall();
      return;
    }
    setOpen(true);
  }, [canUseNativePrompt, runNativeInstall]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (isStandalone) {
    return (
      <span
        className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-900/50 text-emerald-200 border border-emerald-700/50"
        title="Running as installed app"
      >
        <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
        In app
      </span>
    );
  }

  if (!registerComplete) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={onInstallClick}
        className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        title={
          canUseNativePrompt
            ? 'Install Ghost Legion as an app'
            : 'Install or add to home screen'
        }
        aria-label={
          canUseNativePrompt
            ? 'Install Ghost Legion app'
            : 'Open install instructions for Ghost Legion app'
        }
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">
          {justInstalled ? 'Installed' : 'Install app'}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white text-gray-900 w-full sm:max-w-md sm:rounded-lg shadow-xl max-h-[90vh] overflow-y-auto rounded-t-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 p-4 border-b border-gray-200">
              <div>
                <h2
                  id="pwa-install-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Install Ghost Legion
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add this site as an app for quick access and a full-screen
                  experience.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 pb-6">
              <ManualSteps hint={hint} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
