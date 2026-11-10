import { TATUI_COORDINATES } from './solar-time.util';

export function getGoogleMapsUrl(
  address: string,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
}

export function getWazeUrl(
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

export function getAppleMapsUrl(
  address: string,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${encodeURIComponent('IASD Mangueiras')}`;
}

export function getUberUrl(
  address: string,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): string {
  const params = new URLSearchParams({
    action: 'setPickup',
    'dropoff[latitude]': String(lat),
    'dropoff[longitude]': String(lng),
    'dropoff[formatted_address]': address,
    'dropoff[nickname]': 'IASD Mangueiras',
  });
  return `https://m.uber.com/ul/?${params.toString()}`;
}

export function getWhatsAppShareUrl(info: {
  title: string;
  day: string;
  time: string;
  address: string;
}): string {
  const text = `Olá! Gostaria de convidar você e sua família para participar do *${info.title}* na IASD Mangueiras em Tatuí-SP.\n\n📅 *Dia:* ${info.day}\n⏰ *Horário:* ${info.time}\n📍 *Local:* ${info.address}\n\nSerá uma alegria receber você! Venha nos visitar.`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
