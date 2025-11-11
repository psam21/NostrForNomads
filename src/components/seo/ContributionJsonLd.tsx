import React from 'react';
import Script from 'next/script';

export interface ContributionJsonLdProps {
  contribution: {
    id: string;
    dTag: string;
    title: string;
    description: string;
    category: string;
    contributionType?: string;
    location?: string;
    region?: string;
    country?: string;
    language?: string;
    publishedAt: number;
    updatedAt?: number;
    author?: {
      name?: string;
      npub?: string;
    };
    image?: string;
    tags?: string[];
  };
}

/**
 * ContributionJsonLd Component
 * 
 * Generates JSON-LD structured data for contribution content.
 * Improves SEO by providing search engines with structured metadata.
 * 
 * Based on Schema.org Article and CreativeWork types.
 */
export const ContributionJsonLd: React.FC<ContributionJsonLdProps> = ({ contribution }) => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://nostr-for-nomads.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${baseUrl}/explore/${contribution.dTag}`,
    headline: contribution.title,
    description: contribution.description,
    articleBody: contribution.description,
    genre: contribution.category,
    keywords: contribution.tags?.join(', ') || '',
    inLanguage: contribution.language || 'en',
    datePublished: new Date(contribution.publishedAt * 1000).toISOString(),
    dateModified: contribution.updatedAt 
      ? new Date(contribution.updatedAt * 1000).toISOString()
      : new Date(contribution.publishedAt * 1000).toISOString(),
    author: {
      '@type': 'Person',
      name: contribution.author?.name || 'Anonymous Nomad',
      identifier: contribution.author?.npub,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nostr for Nomads',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    ...(contribution.image && {
      image: {
        '@type': 'ImageObject',
        url: contribution.image,
        caption: contribution.title,
      },
    }),
    ...(contribution.location && {
      contentLocation: {
        '@type': 'Place',
        name: contribution.location,
        ...(contribution.region && {
          containedInPlace: {
            '@type': 'Place',
            name: contribution.region,
            ...(contribution.country && {
              containedInPlace: {
                '@type': 'Country',
                name: contribution.country,
              },
            }),
          },
        }),
      },
    }),
    about: {
      '@type': 'Thing',
      name: contribution.category,
      description: `${contribution.contributionType || 'Digital nomad'} contribution`,
    },
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/explore/${contribution.dTag}`,
    },
  };

  return (
    <Script
      id={`contribution-jsonld-${contribution.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
};
