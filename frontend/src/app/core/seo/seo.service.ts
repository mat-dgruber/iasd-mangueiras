import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_CONFIG } from '../site/site.config';
import { SeoPage } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  apply(page: SeoPage): void {
    const url = `${SITE_CONFIG.siteUrl}${page.path}`;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({
      name: 'robots',
      content: page.noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_CONFIG.name });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });

    const imageUrl = page.image || `${SITE_CONFIG.siteUrl}/og-image.png`;
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    this.setCanonical(url);
    this.setJsonLd('organization-jsonld', this.organizationJsonLd());
    this.setJsonLd('church-jsonld', this.churchJsonLd());
    this.setJsonLd('website-jsonld', this.websiteJsonLd());

    if (page.faqs && page.faqs.length > 0) {
      this.setJsonLd('faq-jsonld', this.faqJsonLd(page.faqs));
    }
  }

  faqJsonLd(faqs: { question: string; answer: string }[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  organizationJsonLd(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      legalName: SITE_CONFIG.legalName,
      url: SITE_CONFIG.siteUrl,
      sameAs: Object.values(SITE_CONFIG.social),
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE_CONFIG.address.locality,
        addressRegion: SITE_CONFIG.address.region,
        addressCountry: SITE_CONFIG.address.country,
      },
    };
  }

  churchJsonLd(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: SITE_CONFIG.legalName,
      alternateName: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
      sameAs: Object.values(SITE_CONFIG.social),
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE_CONFIG.address.locality,
        addressRegion: SITE_CONFIG.address.region,
        addressCountry: SITE_CONFIG.address.country,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '09:00',
          closes: '12:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Wednesday'],
          opens: '19:30',
          closes: '20:30',
        },
      ],
    };
  }

  private websiteJsonLd(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.siteUrl,
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
      inLanguage: 'pt-BR',
    };
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }

    link.href = url;
  }

  private setJsonLd(id: string, data: object): void {
    let script = this.document.getElementById(id) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.text = JSON.stringify(data);
  }
}
