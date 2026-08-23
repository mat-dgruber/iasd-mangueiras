import { SITE_CONFIG } from './site.config';

describe('SITE_CONFIG', () => {
  it('define identidade pública rastreável da igreja', () => {
    expect(SITE_CONFIG.name).toBe('IASD Mangueiras');
    expect(SITE_CONFIG.city).toBe('Tatuí');
    expect(SITE_CONFIG.social.youtube).toBe('https://www.youtube.com/c/IASDMangueiras');
    expect(SITE_CONFIG.social.instagram).toBe('https://www.instagram.com/iasdmangueiras/');
    expect(SITE_CONFIG.social.facebook).toBe('https://www.facebook.com/igrejadasmangueiras/?locale=pt_BR');
  });
});
