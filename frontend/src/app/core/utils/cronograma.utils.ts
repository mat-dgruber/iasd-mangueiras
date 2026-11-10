import { CronogramaItem, CronogramaCulto } from '../models/cronograma.models';

export function reordenarItens(
  itens: readonly CronogramaItem[],
  indiceOrigem: number,
  direcao: 'up' | 'down',
): CronogramaItem[] {
  const novoIndice = direcao === 'up' ? indiceOrigem - 1 : indiceOrigem + 1;
  if (novoIndice < 0 || novoIndice >= itens.length) {
    return [...itens];
  }

  const copia = [...itens];
  const [removido] = copia.splice(indiceOrigem, 1);
  copia.splice(novoIndice, 0, removido);

  return copia.map((item, index) => ({
    ...item,
    ordem: index,
  }));
}

export function calcularHorariosEmSequencia(
  horarioInicial: string,
  itens: readonly CronogramaItem[],
): CronogramaItem[] {
  if (!itens.length) return [];

  const partes = horarioInicial.split(':');
  let totalMinutos = (parseInt(partes[0], 10) || 0) * 60 + (parseInt(partes[1], 10) || 0);

  return itens.map((item, idx) => {
    if (idx === 0) {
      if (item.duracaoMinutos) {
        totalMinutos += item.duracaoMinutos;
      }
      return { ...item, horario: horarioInicial };
    }

    if (item.duracaoMinutos !== undefined && item.duracaoMinutos > 0) {
      const horas = Math.floor(totalMinutos / 60) % 24;
      const minutos = totalMinutos % 60;
      const horarioFormatado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      totalMinutos += item.duracaoMinutos;
      return { ...item, horario: horarioFormatado };
    }

    return { ...item };
  });
}

export function formatarCronogramaParaWhatsApp(cronograma: CronogramaCulto): string {
  const dataFormatada = cronograma.data
    ? cronograma.data.split('-').reverse().join('/')
    : 'Data a definir';

  const linhasItens = cronograma.itens
    .map((item) => {
      const desc = item.descricao ? `\n   📝 _${item.descricao}_` : '';
      return `⏰ *${item.horario}* — ${item.nomeQuadro}\n   👤 *Resp:* ${item.responsavel || 'A definir'}${desc}`;
    })
    .join('\n\n');

  const obs = cronograma.observacoesGerais
    ? `\n\n📌 *Observações:* ${cronograma.observacoesGerais}`
    : '';

  return `📋 *CRONOGRAMA DO CULTO — IASD MANGUEIRAS*
📅 *Data:* ${dataFormatada}
📖 *Culto:* ${cronograma.titulo}
────────────────────────
${linhasItens}${obs}
────────────────────────
_IASD Mangueiras — Secretaria & Pastoral_`;
}
