'use client';

import { SessionProvider } from 'next-auth/react';
import { PwaProvider } from './pwa/PwaProvider';
import { I18nProvider } from '../lib/i18n/I18nProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <PwaProvider>{children}</PwaProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
