import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'TK TeyaCollections';
const SITE_URL = 'https://teyacollections.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

/**
 * SEO component — drop-in <head> management via react-helmet-async.
 * Supports OpenGraph, Twitter Cards, and JSON-LD structured data.
 *
 * Props:
 *  title        — page title (appended with " | TK TeyaCollections")
 *  description  — meta description
 *  canonical    — canonical URL path (e.g. "/product/silk-saree")
 *  image        — OG image URL (absolute)
 *  type         — OG type: "website" | "article" | "product"
 *  jsonLd       — a JSON-LD object (will be stringified into <script> tag)
 *  noIndex      — if true, adds noindex meta tag
 */
export default function SEO({
  title,
  description = 'Discover TK TeyaCollections — premium handcrafted traditional Indian fashion. Exquisite sarees, salwar kameez, lehengas and bridal wear crafted with artisanal precision.',
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Premium Traditional Indian Fashion`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  return (
    <Helmet>
      {/* Primary meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data — supports single object or array */}
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

/* ---------------------------------------------------------------
   Pre-built JSON-LD helpers — import and use in page components
------------------------------------------------------------------ */

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TEYA COLLECTIONS',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://www.instagram.com/teyacollections',
      'https://www.facebook.com/teyacollections',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

export function buildProductSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.[0] || DEFAULT_IMAGE,
    brand: { '@type': 'Brand', name: 'TEYA COLLECTIONS' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };
}

export function buildBreadcrumbSchema(crumbs) {
  // crumbs: [{ name, url }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.url}`,
    })),
  };
}

export function buildFAQSchema(faqs) {
  // faqs: [{ question, answer }]
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
