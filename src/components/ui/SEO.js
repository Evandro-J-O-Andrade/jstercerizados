import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { SEO_CONFIG, COMPANY, SOCIAL_LINKS } from '@/config';
export function SEO({ title, description, keywords, image, noindex = false, type = 'WebSite', }) {
    const location = useLocation();
    const url = `${SEO_CONFIG.openGraph.url}${location.pathname}`;
    const pageTitle = title ?? SEO_CONFIG.title;
    const pageDesc = description ?? SEO_CONFIG.description;
    const pageKeywords = keywords ?? SEO_CONFIG.keywords;
    const pageImage = image ?? '/images/brand/og-image.svg';
    useEffect(() => {
        document.title = pageTitle;
        const updateMeta = (name, content) => {
            let el = document.querySelector(`meta[name="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('name', name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };
        const updateProperty = (property, content) => {
            let el = document.querySelector(`meta[property="${property}"]`);
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
        return () => { };
    }, [pageTitle, pageDesc, pageKeywords, pageImage, noindex, type, url]);
    const getSchemaOrg = () => {
        const base = {
            '@context': 'https://schema.org',
            '@type': type,
            name: pageTitle,
            description: pageDesc,
            url,
            sameAs: [
                SEO_CONFIG.openGraph.url,
                SOCIAL_LINKS.instagram,
                SOCIAL_LINKS.facebook,
                SOCIAL_LINKS.linkedin,
            ],
        };
        if (type === 'Organization') {
            return {
                ...base,
                '@type': 'Organization',
                logo: '/images/brand/logo.svg',
                contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: `+55${COMPANY.whatsapp}`,
                    contactType: 'customer service',
                    availableLanguage: 'Portuguese',
                },
            };
        }
        if (type === 'FAQPage') {
            return {
                ...base,
                '@type': 'FAQPage',
                mainEntity: [],
            };
        }
        return base;
    };
    return (_jsxs(_Fragment, { children: [_jsx("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(getSchemaOrg()) } }), _jsx("link", { rel: "canonical", href: url })] }));
}
