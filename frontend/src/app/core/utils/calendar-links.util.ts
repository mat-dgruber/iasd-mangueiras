export interface CalendarEventInput {
  title: string;
  description: string;
  location: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  time: string; // "HH:mm" ex: "09:00" ou "19:30"
  durationMinutes?: number;
}

function getNextDateForDayOfWeek(
  dayOfWeek: number,
  timeStr: string,
  durationMinutes: number = 90
): { start: Date; end: Date } {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);

  const targetDate = new Date(now);
  targetDate.setHours(hours, minutes, 0, 0);

  const currentDay = now.getDay();
  let daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  if (daysToAdd === 0 && targetDate.getTime() <= now.getTime()) {
    daysToAdd = 7;
  }
  targetDate.setDate(now.getDate() + daysToAdd);

  const endDate = new Date(targetDate);
  endDate.setMinutes(targetDate.getMinutes() + durationMinutes);

  return { start: targetDate, end: endDate };
}

function formatIsoUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  const { start, end } = getNextDateForDayOfWeek(
    event.dayOfWeek,
    event.time,
    event.durationMinutes ?? 90
  );
  const startStr = formatIsoUtc(start);
  const endStr = formatIsoUtc(end);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startStr}/${endStr}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(event: CalendarEventInput): string {
  const { start, end } = getNextDateForDayOfWeek(
    event.dayOfWeek,
    event.time,
    event.durationMinutes ?? 90
  );
  const startStr = formatIsoUtc(start);
  const endStr = formatIsoUtc(end);
  const nowStr = formatIsoUtc(new Date());
  const uid = `iasd-mangueiras-${event.dayOfWeek}-${event.time.replace(':', '')}-${Date.now()}@iasdmangueiras.com.br`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IASD Mangueiras//Calendario de Cultos//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(
  event: CalendarEventInput,
  filename: string = 'culto-iasd-mangueiras.ics'
): void {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
