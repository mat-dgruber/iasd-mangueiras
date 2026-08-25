/**
 * Utilitário determinístico para cálculo astronômico do pôr do sol em Tatuí-SP.
 * Coordenadas padrão da IASD Mangueiras: Latitude -23.3556, Longitude -47.8569, Fuso UTC-3.
 */

export const TATUI_COORDINATES = {
  latitude: -23.3556,
  longitude: -47.8569,
  timezoneOffsetHours: -3,
};

export interface SunsetResult {
  hours: number;
  minutes: number;
  formatted: string;
}

/**
 * Calcula o pôr do sol astronômico para uma data e coordenadas usando aproximação NOAA.
 */
export function getSunsetTime(
  date: Date,
  lat: number = TATUI_COORDINATES.latitude,
  lng: number = TATUI_COORDINATES.longitude,
): SunsetResult {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Ângulo fracionário do ano em radianos
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);

  // Equação do tempo em minutos
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Declinação solar em radianos
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = (lat * Math.PI) / 180;
  // Ângulo zenital para pôr do sol padrão (90.833° incluindo refração atmosférica)
  const zenithRad = (90.833 * Math.PI) / 180;

  const cosHourAngle =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));

  let hourAngleDeg = 90;
  if (cosHourAngle >= -1 && cosHourAngle <= 1) {
    hourAngleDeg = (Math.acos(cosHourAngle) * 180) / Math.PI;
  }

  // Minutos a partir da meia-noite UTC para o pôr do sol
  const sunsetUtcMinutes = 720 - 4 * lng - eqtime + 4 * hourAngleDeg;

  // Ajuste para horário local (Tatuí UTC-3)
  let localMinutes = sunsetUtcMinutes + TATUI_COORDINATES.timezoneOffsetHours * 60;
  while (localMinutes < 0) localMinutes += 1440;
  while (localMinutes >= 1440) localMinutes -= 1440;

  const totalMinutes = Math.round(localMinutes);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { hours, minutes, formatted };
}

/**
 * Retorna o pôr do sol de hoje formatado como HH:mm.
 */
export function getTodaySunset(): string {
  return getSunsetTime(new Date()).formatted;
}

/**
 * Retorna os dados do pôr do sol de sexta e sábado para a semana de referência,
 * e se o momento atual corresponde às horas sagradas do sábado.
 */
export function getSabbathSunsets(referenceDate: Date = new Date()): {
  fridaySunset: string;
  saturdaySunset: string;
  isSabbathNow: boolean;
} {
  const currentDay = referenceDate.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado
  const diffToFriday = 5 - currentDay;

  const friday = new Date(referenceDate);
  friday.setDate(referenceDate.getDate() + diffToFriday);

  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);

  const friSunset = getSunsetTime(friday);
  const satSunset = getSunsetTime(saturday);

  // Instantes exatos em timestamp
  const fridaySunsetDate = new Date(friday);
  fridaySunsetDate.setHours(friSunset.hours, friSunset.minutes, 0, 0);

  const saturdaySunsetDate = new Date(saturday);
  saturdaySunsetDate.setHours(satSunset.hours, satSunset.minutes, 0, 0);

  const isSabbathNow =
    referenceDate.getTime() >= fridaySunsetDate.getTime() &&
    referenceDate.getTime() <= saturdaySunsetDate.getTime();

  return {
    fridaySunset: friSunset.formatted,
    saturdaySunset: satSunset.formatted,
    isSabbathNow,
  };
}
