import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications',
  description:
    'Your Ghost Legion notifications — alerts and updates for the preparedness community (sign-in required).',
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
