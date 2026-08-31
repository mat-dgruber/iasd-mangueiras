import { CultoEscalaGroup, EscalaItem } from '../../../core/models/content.models';

const CHURCH_LOCATION = 'Rua Chiquinha Rodrigues, 1005 - Mangueiras, Tatuí - SP';

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterEscalas(
  escalas: readonly EscalaItem[],
  searchTerm: string,
  department: string,
): EscalaItem[] {
  const normSearch = normalizeText(searchTerm);
  const isDeptAll = !department || department === 'todos';

  return escalas.filter((item) => {
    const matchDept = isDeptAll || item.departamento === department;
    if (!matchDept) return false;

    if (!normSearch) return true;

    const normDept = normalizeText(item.departamento);
    const normOficiais = item.oficiais.map(normalizeText);
    const normObs = item.observacoes ? normalizeText(item.observacoes) : '';

    return (
      normDept.includes(normSearch) ||
      normOficiais.some((o) => o.includes(normSearch)) ||
      normObs.includes(normSearch)
    );
  });
}

export function formatDateBr(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function groupEscalasByCulto(
  escalas: readonly EscalaItem[],
  referenceDate: Date = new Date(),
): CultoEscalaGroup[] {
  const groupsMap = new Map<string, EscalaItem[]>();

  for (const escala of escalas) {
    const list = groupsMap.get(escala.data) || [];
    list.push(escala);
    groupsMap.set(escala.data, list);
  }

  const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => a.localeCompare(b));

  const todayStr = referenceDate.toISOString().split('T')[0];
  let foundProximo = false;

  return sortedDates.map((dateStr) => {
    const items = groupsMap.get(dateStr) || [];
    const diaSemana = items[0]?.dia_semana || 'Culto';
    const isHoje = dateStr === todayStr;
    const isPassado = dateStr < todayStr;

    let isProximoCulto = false;
    if (!isPassado && !foundProximo) {
      isProximoCulto = true;
      foundProximo = true;
    }

    return {
      data: dateStr,
      dataFormatada: formatDateBr(dateStr),
      diaSemana,
      isHoje,
      isProximoCulto,
      isPassado,
      escalas: items,
    };
  });
}

function parseTimeToHoursMinutes(horarioStr?: string): { startHour: number; startMinute: number } {
  if (!horarioStr) return { startHour: 9, startMinute: 0 };
  const match = horarioStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return { startHour: parseInt(match[1], 10), startMinute: parseInt(match[2], 10) };
  }
  return { startHour: 9, startMinute: 0 };
}

export function generateGoogleCalendarUrl(escala: EscalaItem): string {
  const { startHour, startMinute } = parseTimeToHoursMinutes(escala.horario);
  const [year, month, day] = escala.data.split('-').map(Number);

  const startDate = new Date(Date.UTC(year, month - 1, day, startHour + 3, startMinute, 0)); // UTC+3 compensation
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const formatUtc = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;

  const title = `Escala: ${escala.departamento} — IASD Mangueiras`;
  const details = `Oficiais escalados: ${escala.oficiais.join(', ')}\n${escala.observacoes ? 'Obs: ' + escala.observacoes + '\n' : ''}IASD Mangueiras - Tatuí`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
    location: CHURCH_LOCATION,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsBlob(escala: EscalaItem): Blob {
  const { startHour, startMinute } = parseTimeToHoursMinutes(escala.horario);
  const [year, month, day] = escala.data.split('-').map(Number);

  const format2 = (n: number) => n.toString().padStart(2, '0');
  const dtStart = `${year}${format2(month)}${format2(day)}T${format2(startHour)}${format2(startMinute)}00`;
  const dtEnd = `${year}${format2(month)}${format2(day)}T${format2(startHour + 2)}${format2(startMinute)}00`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IASD Mangueiras//Escalas e Voluntarios//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:escala-${escala.id || escala.data}-${escala.departamento.replace(/\s+/g, '')}@iasdmangueiras.org.br`,
    `DTSTAMP:${year}${format2(month)}${format2(day)}T000000Z`,
    `DTSTART;TZID=America/Sao_Paulo:${dtStart}`,
    `DTEND;TZID=America/Sao_Paulo:${dtEnd}`,
    `SUMMARY:Escala: ${escala.departamento} — IASD Mangueiras`,
    `DESCRIPTION:Oficiais: ${escala.oficiais.join('\\, ')}\\n${escala.observacoes ? 'Obs: ' + escala.observacoes : ''}`,
    `LOCATION:${CHURCH_LOCATION}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

export function downloadIcsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateWhatsAppTrocaUrl(escala: EscalaItem, oficialNome?: string): string {
  const nomePart = oficialNome ? `Sou ${oficialNome}, e estou` : 'Estou';
  const msg = `Olá! ${nomePart} na escala de *${escala.departamento}* no dia *${formatDateBr(escala.data)}* (${escala.dia_semana}) e gostaria de verificar uma dúvida / solicitar uma troca na escala.`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export function formatEscalaShareText(group: CultoEscalaGroup): string {
  const lines: string[] = [
    `📋 *ESCALA DO CULTO — IASD MANGUEIRAS*`,
    `📅 *${group.diaSemana}, ${group.dataFormatada}*`,
    `📍 ${CHURCH_LOCATION}`,
    ``,
  ];

  for (const esc of group.escalas) {
    lines.push(`🔹 *${esc.departamento}*${esc.horario ? ` (${esc.horario})` : ''}`);
    lines.push(`   👥 ${esc.oficiais.join(', ')}`);
    if (esc.observacoes) {
      lines.push(`   ℹ️ _${esc.observacoes}_`);
    }
    lines.push(``);
  }

  lines.push(`Consulte a escala online: https://iasdmangueiras.org.br/escalas`);
  return lines.join('\n');
}
