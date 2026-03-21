import type { Metadata } from 'next';
import { getSiteUrl } from '@/app/lib/site';

const title = 'Emergency Checklist — Netherlands War & Crisis Guide';
const description =
  'Step-by-step emergency checklist for residents of the Netherlands: stay informed, prepare supplies, evacuation awareness, communication plans, and safety during conflict or major crisis. From Ghost Legion.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Netherlands emergency checklist',
    'war preparation Netherlands',
    'crisis checklist Netherlands',
    'Dutch civil defense',
    'emergency supplies Netherlands',
    'evacuation awareness',
    'NL crisis planning',
  ],
  alternates: {
    canonical: `${getSiteUrl()}/emergency-checklist`,
  },
  openGraph: {
    title,
    description,
    url: '/emergency-checklist',
    type: 'article',
    locale: 'en_NL',
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
    spatialCoverage: {
      '@type': 'Place',
      name: 'Netherlands',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 52.1326,
        longitude: 5.2913,
      },
    },
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
