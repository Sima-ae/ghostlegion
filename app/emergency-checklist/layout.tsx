import type { Metadata } from 'next';
import { getSiteUrl } from '@/app/lib/site';

const title = 'Emergency Checklist — War & Crisis Guide';
const description =
  'Step-by-step emergency checklist: stay informed, prepare supplies, evacuation awareness, communication plans, and safety during conflict or major crisis. From Ghost Legion.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'emergency checklist',
    'war preparation',
    'crisis checklist',
    'civil defense',
    'emergency supplies',
    'evacuation awareness',
    'crisis planning',
  ],
  alternates: {
    canonical: `${getSiteUrl()}/emergency-checklist`,
  },
  openGraph: {
    title,
    description,
    url: '/emergency-checklist',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

function EmergencyChecklistJsonLd() {
  const url = `${getSiteUrl()}/emergency-checklist`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'Ghost Legion', url: getSiteUrl() },
    about: {
      '@type': 'Thing',
      name: 'Emergency preparedness and civil safety',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function EmergencyChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EmergencyChecklistJsonLd />
      {children}
    </>
  );
}
