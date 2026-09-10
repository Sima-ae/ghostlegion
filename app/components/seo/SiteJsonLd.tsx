import {
  GEO,
  SITE_NAME,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  getSiteUrl,
} from '@/app/lib/site';

export default function SiteJsonLd() {
  const url = getSiteUrl();
  const logo = `${url}/icon-512.png`;

  const organization = {
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'Ghost Legion Preparedness Platform',
    url,
    logo: { '@type': 'ImageObject', url: logo, width: 512, height: 512 },
    description: DEFAULT_DESCRIPTION,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
  };

  const website = {
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@type': 'Organization', name: SITE_NAME, url },
  };

  const webApp = {
    '@type': 'WebApplication',
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION,
    browserRequirements: 'Requires JavaScript. HTML5 browser.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    screenshot: `${url}/opengraph-image`,
  };

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organization, website, webApp],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
