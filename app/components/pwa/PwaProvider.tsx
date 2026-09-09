'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isBeforeInstallPromptEvent, type BeforeInstallPromptEvent } from './pwa-types';

type PwaContextValue = {
  /** True when running as installed PWA / “Add to Home Screen” app */
  isStandalone: boolean;
  /** Chromium: install prompt is available */
  canUseNativePrompt: boolean;
  /** User chose Install and the browser accepted */
  justInstalled: boolean;
  registerComplete: boolean;
  runNativeInstall: () => Promise<void>;
};

const PwaContext = createContext<PwaContextValue | null>(null);

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)');
  if (mq.matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [justInstalled, setJustInstalled] = useState(false);
  const [registerComplete, setRegisterComplete] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());
  }, []);

  useEffect(() => {
    const onChange = () => setIsStandalone(isStandaloneDisplay());
    const mqs = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: window-controls-overlay)'),
    ];
    mqs.forEach((mq) => {
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onChange);
      } else {
        mq.addListener(onChange);
      }
    });
    return () =>
      mqs.forEach((mq) => {
        if (typeof mq.removeEventListener === 'function') {
          mq.removeEventListener('change', onChange);
        } else {
          mq.removeListener(onChange);
        }
      });
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setRegisterComplete(true);
      return;
    }

    const enableSw =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_PWA_DEV === '1';
    if (!enableSw) {
      setRegisterComplete(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        if (cancelled) return;
        await reg.update();
      } catch {
        /* ignore — PWA still partially usable */
      } finally {
        if (!cancelled) setRegisterComplete(true);
      }
    })();

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration().then((r) => r?.update());
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      if (!isBeforeInstallPromptEvent(e)) return;
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setDeferred(null);
      setJustInstalled(true);
      setIsStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const runNativeInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
    }
  }, [deferred]);

  const value = useMemo<PwaContextValue>(
    () => ({
      isStandalone,
      canUseNativePrompt: deferred !== null,
      justInstalled,
      registerComplete,
      runNativeInstall,
    }),
    [
      isStandalone,
      deferred,
      justInstalled,
      registerComplete,
      runNativeInstall,
    ]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

const PWA_FALLBACK: PwaContextValue = {
  isStandalone: false,
  canUseNativePrompt: false,
  justInstalled: false,
  registerComplete: false,
  runNativeInstall: async () => {},
};

export function usePwa() {
  return useContext(PwaContext) ?? PWA_FALLBACK;
}
