import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  description:
    'Ghost Legion administration — internal dashboard (not indexed by search engines).',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
