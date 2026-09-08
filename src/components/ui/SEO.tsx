import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SEO_CONFIG, SOCIAL_LINKS } from '@/config';
import {
  buildBreadcrumbSchema,
  buildWebSiteSchema,
  buildJobPostingSchema,
  getOrganizationSchema,
} from '@/utils/schema';
import type { BreadcrumbItem } from '@/types/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  type?: 'WebSite' | 'Organization' | 'FAQPage' | 'Service' | 'Article';
  breadcrumbs?: BreadcrumbItem[];
  jobPosting?: {
    title: string;
    description: string;
    datePosted?: string;
    validThrough?: string;
    hiringOrgName: string;
    hiringOrgUrl?: string;
    hiringOrgLogo?: string;
    city?: string;
    state?: string;
    employmentType?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryUnit?: string;
    benefits?: string[];
    requirements?: string;
    responsibilities?: string;
    slug: string;
  };
}

export function SEO({
  title,
  description,
  keywords,
  image,
  noindex = false,
  type = 'WebSite',
  breadcrumbs,
  jobPosting,
}: SEOProps) {
  const location = useLocation();
  const url = `${SEO_CONFIG.openGraph.url}${location.pathname}`;
  const pageTitle = title ?? SEO_CONFIG.title;
  const pageDesc = description ?? SEO_CONFIG.description;
  const pageKeywords = keywords ?? SEO_CONFIG.keywords;
  const pageImage = image ?? '/images/brand/og-image.svg';

  useEffect(() => {
    document.title = pageTitle;

    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(
        `meta[name="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let el = document.querySelector(
        `meta[property="${property}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', pageDesc);
    updateMeta('keywords', pageKeywords.join(', '));
    updateMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    updateProperty('og:title', pageTitle);
    updateProperty('og:description', pageDesc);
    updateProperty('og:url', url);
    updateProperty('og:image', pageImage);
    updateProperty('og:type', type);
    updateProperty('og:site_name', SEO_CONFIG.openGraph.siteName);
    updateProperty('og:locale', SEO_CONFIG.openGraph.locale);
    updateProperty('twitter:card', 'summary_large_image');
    updateProperty('twitter:title', pageTitle);
    updateProperty('twitter:description', pageDesc);
    updateProperty('twitter:image', pageImage);
    updateProperty('twitter:site', SEO_CONFIG.twitter.site);

    return () => {};
  }, [pageTitle, pageDesc, pageKeywords, pageImage, noindex, type, url]);

  const getSchemaOrg = () => {
    if (jobPosting) {
      return buildJobPostingSchema(jobPosting);
    }
    if (breadcrumbs) {
      return buildBreadcrumbSchema(breadcrumbs);
    }
    if (type === 'Organization') {
      return getOrganizationSchema();
    }
    if (type === 'WebSite') {
      return buildWebSiteSchema();
    }
    if (type === 'FAQPage') {
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        name: pageTitle,
        description: pageDesc,
        mainEntity: [],
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': type,
      name: pageTitle,
      description: pageDesc,
      url,
      sameAs: [
        SOCIAL_LINKS.instagram,
        SOCIAL_LINKS.facebook,
        SOCIAL_LINKS.linkedin,
      ],
    };
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchemaOrg()) }}
      />
      <link rel="canonical" href={url} />
    </>
  );
}
