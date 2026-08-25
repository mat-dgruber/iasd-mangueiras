import { getSunsetTime, getTodaySunset, getSabbathSunsets } from './solar-time.util';

describe('solar-time.util', () => {
  it('deve calcular o horário de pôr do sol para Tatuí-SP em uma data específica', () => {
    // Solstício de Inverno no Hemisfério Sul (21 de Junho) ~ 17:30 a 17:40
    const winterDate = new Date(2026, 5, 21); // 21/06/2026
    const sunsetWinter = getSunsetTime(winterDate);
    expect(sunsetWinter.hours).toBe(17);
    expect(sunsetWinter.minutes).toBeGreaterThanOrEqual(30);
    expect(sunsetWinter.minutes).toBeLessThanOrEqual(45);
    expect(sunsetWinter.formatted).toMatch(/^17:\d{2}$/);

    // Solstício de Verão no Hemisfério Sul (21 de Dezembro) ~ 18:50 a 19:10
    const summerDate = new Date(2026, 11, 21); // 21/12/2026
    const sunsetSummer = getSunsetTime(summerDate);
    expect(sunsetSummer.hours).toBe(18);
    expect(sunsetSummer.minutes).toBeGreaterThanOrEqual(45);
    expect(sunsetSummer.formatted).toMatch(/^18:\d{2}$/);
  });

  it('deve retornar string formatada para o pôr do sol de hoje', () => {
    const todayStr = getTodaySunset();
    expect(todayStr).toMatch(/^\d{2}:\d{2}$/);
  });

  it('deve retornar horários de pôr do sol de sexta e sábado da semana', () => {
    const midWeek = new Date(2026, 7, 26); // Quarta-feira, 26/08/2026
    const sabbathInfo = getSabbathSunsets(midWeek);
    expect(sabbathInfo.fridaySunset).toMatch(/^\d{2}:\d{2}$/);
    expect(sabbathInfo.saturdaySunset).toMatch(/^\d{2}:\d{2}$/);
    expect(typeof sabbathInfo.isSabbathNow).toBe('boolean');
  });

  it('deve identificar corretamente quando está dentro das horas do sábado', () => {
    // Sexta-feira às 20:00 (após o pôr do sol)
    const fridayNight = new Date(2026, 7, 28, 20, 0, 0);
    const sabbathCheck = getSabbathSunsets(fridayNight);
    expect(sabbathCheck.isSabbathNow).toBe(true);

    // Domingo às 10:00 (fora do sábado)
    const sundayMorning = new Date(2026, 7, 30, 10, 0, 0);
    const nonSabbathCheck = getSabbathSunsets(sundayMorning);
    expect(nonSabbathCheck.isSabbathNow).toBe(false);
  });

  it('deve arredondar minutos no limite de virada de hora sem gerar minutos inválidos (ex: 60)', () => {
    // Datas com frações de minutos próximas a 59.5+ (ex: 2026-08-29, 2026-08-30, 2026-01-31)
    const boundaryDates = [
      new Date(2026, 0, 31, 12, 0, 0), // 31/01/2026
      new Date(2026, 3, 14, 12, 0, 0), // 14/04/2026
      new Date(2026, 7, 29, 12, 0, 0), // 29/08/2026
      new Date(2026, 7, 30, 12, 0, 0), // 30/08/2026
      new Date(2026, 11, 29, 12, 0, 0), // 29/12/2026
    ];

    for (const d of boundaryDates) {
      const sunset = getSunsetTime(d);
      expect(sunset.minutes).toBeGreaterThanOrEqual(0);
      expect(sunset.minutes).toBeLessThan(60);
      expect(sunset.formatted).not.toContain(':60');
      expect(sunset.formatted).toMatch(/^\d{2}:[0-5]\d$/);
    }
  });
});
