import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('aplica title, description, robots e canonical absoluto', () => {
    const service = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);

    service.apply({
      title: 'Horários — IASD Mangueiras',
      description: 'Conheça os horários da IASD Mangueiras em Tatuí-SP.',
      path: '/horarios',
    });

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');

    expect(document.title).toBe('Horários — IASD Mangueiras');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Conheça os horários');
    expect(robots?.getAttribute('content')).toBe('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    expect(canonical?.href).toBe('https://iasdmangueiras.org.br/horarios');
  });

  it('gera JSON-LD Organization com sameAs', () => {
    const service = TestBed.inject(SeoService);
    const json = service.organizationJsonLd() as { [key: string]: unknown; sameAs: string[] };

    expect(json['@type']).toBe('Organization');
    expect(json['name']).toBe('IASD Mangueiras');
    expect(json['url']).toBe('https://iasdmangueiras.org.br');
    expect(json.sameAs).toContain('https://www.instagram.com/iasdmangueiras/');
    expect(json.sameAs).toContain('https://www.youtube.com/c/IASDMangueiras');
  });

  it('gera JSON-LD Church com openingHoursSpecification', () => {
    const service = TestBed.inject(SeoService);
    const json = service.churchJsonLd() as { [key: string]: unknown; openingHoursSpecification: unknown[] };

    expect(json['@type']).toBe('Church');
    expect(json.openingHoursSpecification.length).toBeGreaterThan(0);
  });
});

