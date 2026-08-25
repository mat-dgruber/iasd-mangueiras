import {
  getGoogleMapsUrl,
  getWazeUrl,
  getAppleMapsUrl,
  getUberUrl,
  getWhatsAppShareUrl,
} from './mobility-links.util';
import { TATUI_COORDINATES } from './solar-time.util';

describe('mobility-links.util', () => {
  const address = 'Rua Chiquinha Rodrigues, 1005 - Mangueiras, Tatuí - SP';
  const customLat = -23.3556;
  const customLng = -47.8569;

  it('deve gerar URLs corretas de rotas e navegação com coordenadas personalizadas', () => {
    expect(getGoogleMapsUrl(address, customLat, customLng)).toContain('https://www.google.com/maps/dir/?api=1');
    expect(getGoogleMapsUrl(address, customLat, customLng)).toContain(`destination=${customLat},${customLng}`);
    expect(getWazeUrl(customLat, customLng)).toBe(`https://waze.com/ul?ll=${customLat},${customLng}&navigate=yes`);
    expect(getAppleMapsUrl(address, customLat, customLng)).toContain(`https://maps.apple.com/?daddr=${customLat},${customLng}`);
    expect(getUberUrl(address, customLat, customLng)).toContain('https://m.uber.com/ul/?action=setPickup');
    expect(getUberUrl(address, customLat, customLng)).toContain(encodeURIComponent(String(customLat)));
    expect(getUberUrl(address, customLat, customLng)).toContain(encodeURIComponent(String(customLng)));
  });

  it('deve gerar URLs com as coordenadas padrão de Tatuí quando não fornecidas', () => {
    expect(getGoogleMapsUrl(address)).toContain(`destination=${TATUI_COORDINATES.latitude},${TATUI_COORDINATES.longitude}`);
    expect(getWazeUrl()).toBe(`https://waze.com/ul?ll=${TATUI_COORDINATES.latitude},${TATUI_COORDINATES.longitude}&navigate=yes`);
    expect(getAppleMapsUrl(address)).toContain(`daddr=${TATUI_COORDINATES.latitude},${TATUI_COORDINATES.longitude}`);
    expect(getUberUrl(address)).toContain(encodeURIComponent(String(TATUI_COORDINATES.latitude)));
  });

  it('deve gerar URL de compartilhamento no WhatsApp com dados do culto formatados', () => {
    const shareUrl = getWhatsAppShareUrl({
      title: 'Culto Divino',
      day: 'Sábado',
      time: '10:15',
      address,
    });
    expect(shareUrl).toContain('https://api.whatsapp.com/send?text=');
    expect(shareUrl).toContain(encodeURIComponent('Culto Divino'));
    expect(shareUrl).toContain(encodeURIComponent('10:15'));
    expect(shareUrl).toContain(encodeURIComponent('Sábado'));
    expect(shareUrl).toContain(encodeURIComponent(address));
  });
});
