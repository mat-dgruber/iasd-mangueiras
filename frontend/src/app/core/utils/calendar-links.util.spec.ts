import {
  buildGoogleCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
  CalendarEventInput,
} from './calendar-links.util';

describe('calendar-links.util', () => {
  const mockEvent: CalendarEventInput = {
    title: 'Culto Divino / Adoração',
    description: 'Momento solene de louvor e reflexão bíblica.',
    location: 'Rua Chiquinha Rodrigues, 1005 - Mangueiras, Tatuí - SP',
    dayOfWeek: 6, // Sábado
    time: '10:15',
    durationMinutes: 90,
  };

  it('deve gerar uma URL válida para o Google Calendar', () => {
    const url = buildGoogleCalendarUrl(mockEvent);
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('dates=');

    const parsed = new URL(url);
    expect(parsed.searchParams.get('action')).toBe('TEMPLATE');
    expect(parsed.searchParams.get('text')).toBe(mockEvent.title);
    expect(parsed.searchParams.get('details')).toBe(mockEvent.description);
    expect(parsed.searchParams.get('location')).toBe(mockEvent.location);
    expect(parsed.searchParams.get('dates')).toMatch(/^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/);
  });

  it('deve gerar conteúdo no formato VCALENDAR (RFC 5545)', () => {
    const ics = generateIcsContent(mockEvent);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//IASD Mangueiras//Calendario de Cultos//PT');
    expect(ics).toContain('CALSCALE:GREGORIAN');
    expect(ics).toContain('METHOD:PUBLISH');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain(`SUMMARY:${mockEvent.title}`);
    expect(ics).toContain(`LOCATION:${mockEvent.location}`);
    expect(ics).toContain(`DESCRIPTION:${mockEvent.description}`);
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('deve disparar o download do arquivo ICS no navegador', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const clickSpy = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    downloadIcsFile(mockEvent, 'teste-culto.ics');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

    vi.restoreAllMocks();
  });
});
