export type TipoCulto =
  | 'sabado_manha'
  | 'domingo_noite'
  | 'quarta_oracao'
  | 'culto_ja'
  | 'santa_ceia'
  | 'batismo'
  | 'personalizado';

export interface CronogramaItem {
  id: string;
  ordem: number;
  horario: string;
  nomeQuadro: string;
  responsavel: string;
  descricao?: string;
  duracaoMinutos?: number;
}

export interface CronogramaCulto {
  id: string;
  data: string; // YYYY-MM-DD
  titulo: string;
  tipoCulto: TipoCulto;
  itens: CronogramaItem[];
  observacoesGerais?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CronogramaTemplate {
  id: string;
  nome: string;
  descricao?: string;
  tipoCulto: TipoCulto;
  itens: Omit<CronogramaItem, 'id'>[];
  criadoEm: string;
  isNativo?: boolean;
}

export const TEMPLATES_NATIVOS: readonly CronogramaTemplate[] = [
  {
    id: 'template-sabado-manha',
    nome: 'Sábado de Manhã (Escola Sabatina + Culto Divino)',
    descricao: 'Liturgia completa da programação matinal de sábado.',
    tipoCulto: 'sabado_manha',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '09:00', duracaoMinutos: 15, nomeQuadro: 'Louvor Congregacional', responsavel: 'Ministério de Louvor', descricao: 'Cânticos preparatórios' },
      { ordem: 1, horario: '09:15', duracaoMinutos: 5, nomeQuadro: 'Abertura e Boas-Vindas', responsavel: 'Diretoria da Escola Sabatina' },
      { ordem: 2, horario: '09:20', duracaoMinutos: 10, nomeQuadro: 'Informativo Mundial das Missões', responsavel: 'Comunicação / Sonoplastia', descricao: 'Vídeo Missionário' },
      { ordem: 3, horario: '09:30', duracaoMinutos: 50, nomeQuadro: 'Estudo da Lição em Unidades', responsavel: 'Professores da Escola Sabatina' },
      { ordem: 4, horario: '10:20', duracaoMinutos: 10, nomeQuadro: 'Intervalo e Avisos da Igreja', responsavel: 'Secretaria / Comunicação' },
      { ordem: 5, horario: '10:30', duracaoMinutos: 5, nomeQuadro: 'Prelúdio e Entrada dos Oficiantes', responsavel: 'Ancião de Dia e Pregador' },
      { ordem: 6, horario: '10:35', duracaoMinutos: 5, nomeQuadro: 'Doxologia e Oração de Invocação', responsavel: 'Ancião de Dia' },
      { ordem: 7, horario: '10:40', duracaoMinutos: 5, nomeQuadro: 'Dízimos e Ofertas', responsavel: 'Diaconato' },
      { ordem: 8, horario: '10:45', duracaoMinutos: 10, nomeQuadro: 'Adoração Infantil', responsavel: 'Ministério da Criança' },
      { ordem: 9, horario: '10:55', duracaoMinutos: 10, nomeQuadro: 'Oração Intercessória de Joelhos', responsavel: 'Ancião ou Líder de Oração' },
      { ordem: 10, horario: '11:05', duracaoMinutos: 5, nomeQuadro: 'Mensagem Musical Especial', responsavel: 'Ministério de Louvor / Convidado' },
      { ordem: 11, horario: '11:10', duracaoMinutos: 40, nomeQuadro: 'Sermão / Mensagem Bíblica', responsavel: 'Pastor / Orador Convidado' },
      { ordem: 12, horario: '11:50', duracaoMinutos: 10, nomeQuadro: 'Hino Final e Bênção Pastoral', responsavel: 'Orador e Congregação' },
    ],
  },
  {
    id: 'template-domingo-noite',
    nome: 'Domingo à Noite (Culto Evangelístico)',
    descricao: 'Ordem do culto evangelístico com louvor e mensagem bíblica.',
    tipoCulto: 'domingo_noite',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '19:30', duracaoMinutos: 15, nomeQuadro: 'Cânticos Iniciais de Louvor', responsavel: 'Ministério de Louvor' },
      { ordem: 1, horario: '19:45', duracaoMinutos: 5, nomeQuadro: 'Oração Inicial e Boas-Vindas', responsavel: 'Direção do Culto' },
      { ordem: 2, horario: '19:50', duracaoMinutos: 10, nomeQuadro: 'Testemunho / Momento de Gratidão', responsavel: 'Líder Designado' },
      { ordem: 3, horario: '20:00', duracaoMinutos: 10, nomeQuadro: 'Ofertório e Mensagem Musical', responsavel: 'Diaconato e Louvor' },
      { ordem: 4, horario: '20:10', duracaoMinutos: 40, nomeQuadro: 'Mensagem da Palavra de Deus', responsavel: 'Pregador' },
      { ordem: 5, horario: '20:50', duracaoMinutos: 10, nomeQuadro: 'Apelo, Hino e Oração Final', responsavel: 'Pregador' },
    ],
  },
  {
    id: 'template-quarta-oracao',
    nome: 'Quarta-feira (Culto de Oração)',
    descricao: 'Momento focado em oração intercessória e estudo bíblico.',
    tipoCulto: 'quarta_oracao',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '19:30', duracaoMinutos: 15, nomeQuadro: 'Louvor e Oração em Duplas', responsavel: 'Liderança de Oração' },
      { ordem: 1, horario: '19:45', duracaoMinutos: 30, nomeQuadro: 'Meditação na Palavra de Deus', responsavel: 'Orador' },
      { ordem: 2, horario: '20:15', duracaoMinutos: 15, nomeQuadro: 'Círculo de Oração Intercessória', responsavel: 'Toda a Igreja' },
      { ordem: 3, horario: '20:30', duracaoMinutos: 5, nomeQuadro: 'Oração Final e Despedida', responsavel: 'Dirigente' },
    ],
  },
  {
    id: 'template-culto-ja',
    nome: 'Culto Jovem (JA)',
    descricao: 'Programação dinâmica de sábado à tarde para a juventude.',
    tipoCulto: 'culto_ja',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '17:30', duracaoMinutos: 15, nomeQuadro: 'Louvor Jovem', responsavel: 'Banda JA' },
      { ordem: 1, horario: '17:45', duracaoMinutos: 15, nomeQuadro: 'Quebra-Gelo / Dinâmica', responsavel: 'Equipe Jovem' },
      { ordem: 2, horario: '18:00', duracaoMinutos: 25, nomeQuadro: 'Tema Jovem / Painel de Debate', responsavel: 'Convidados' },
      { ordem: 3, horario: '18:25', duracaoMinutos: 10, nomeQuadro: 'Momento de Oração / Louvor Especial', responsavel: 'Equipe Jovem' },
      { ordem: 4, horario: '18:35', duracaoMinutos: 30, nomeQuadro: 'Mensagem Inspiradora', responsavel: 'Orador JA' },
      { ordem: 5, horario: '19:05', duracaoMinutos: 10, nomeQuadro: 'Pôr do Sol e Oração de Encerramento', responsavel: 'Diretoria JA' },
    ],
  },
  {
    id: 'template-santa-ceia',
    nome: 'Santa Ceia (Cerimônia da Comunhão)',
    descricao: 'Liturgia solene com Lava-pés e celebração do Pão e Suco.',
    tipoCulto: 'santa_ceia',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '10:30', duracaoMinutos: 10, nomeQuadro: 'Abertura Solene e Mensagem de Comunhão', responsavel: 'Pastor e Anciãos' },
      { ordem: 1, horario: '10:40', duracaoMinutos: 30, nomeQuadro: 'Cerimônia do Lava-Pés', responsavel: 'Congregação e Diaconato' },
      { ordem: 2, horario: '11:10', duracaoMinutos: 15, nomeQuadro: 'Distribuição do Pão Ázimo', responsavel: 'Pastor, Anciãos e Diáconos' },
      { ordem: 3, horario: '11:25', duracaoMinutos: 15, nomeQuadro: 'Distribuição do Suco da Videira', responsavel: 'Pastor, Anciãos e Diáconos' },
      { ordem: 4, horario: '11:40', duracaoMinutos: 10, nomeQuadro: 'Canto do Hino de Gratidão e Bênção', responsavel: 'Congregação e Pastor' },
    ],
  },
  {
    id: 'template-batismo',
    nome: 'Cerimônia Batismal',
    descricao: 'Ordem de celebração para batismos com testemunhos e apelo.',
    tipoCulto: 'batismo',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '11:00', duracaoMinutos: 10, nomeQuadro: 'Mensagem Pastoral sobre o Batismo', responsavel: 'Pastor' },
      { ordem: 1, horario: '11:10', duracaoMinutos: 10, nomeQuadro: 'Votos Batismais e Profissão de Fé', responsavel: 'Pastor e Candidatos' },
      { ordem: 2, horario: '11:20', duracaoMinutos: 25, nomeQuadro: 'Entrada no Batistério e Batismo', responsavel: 'Pastor e Diaconato' },
      { ordem: 3, horario: '11:45', duracaoMinutos: 10, nomeQuadro: 'Boas-Vindas aos Novos Membros e Oração', responsavel: 'Ancião e Igreja' },
    ],
  },
];
