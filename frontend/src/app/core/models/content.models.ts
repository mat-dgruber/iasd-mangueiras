export interface Horario {
  id?: string;
  titulo: string;
  dia: string;
  horario: string;
  descricao: string;
  ativo?: boolean;
  ordem?: number;
}

export interface AvisoHorarioEspecial {
  id?: string;
  titulo: string;
  data_evento?: string;
  mensagem: string;
  ativo?: boolean;
  expira_em?: string; // Formato YYYY-MM-DD
  createdAt?: string;
}

export interface Evento {
  id?: string;
  titulo: string;
  data: string;
  horario: string;
  descricao: string;
  local?: string;
  imagem_url?: string;
  banner_url?: string;
  href?: string;
  destaque?: boolean;
  palestrante?: string;
  departamento?: string;
  valor_entrada?: string;
  link_inscricao?: string;
  publico_alvo?: string;
  status?: 'publicado' | 'rascunho' | 'encerrado';
  data_inicio?: string;
  data_fim?: string;
  endereco?: string;
  whatsapp_contato?: string;
}

export interface Comunicado {
  id?: string;
  titulo: string;
  descricao?: string;
  mensagem?: string;
  data: string;
  ativo?: boolean;
  tipo?: 'destaque_banner' | 'aviso_geral' | 'urgente';
}

export interface Ministerio {
  id?: string;
  nome: string;
  descricao: string;
  categoria?: string;
  lideres?: string;
  imagem_url?: string;
  banner_url?: string;
  reunioes_horario?: string;
  contato_whatsapp?: string;
  publico_alvo?: string;
  atividades?: string[];
  destaque?: boolean;
  ativo?: boolean;
}

export interface PequenoGrupo {
  id?: string;
  nome: string;
  lider: string;
  anfitriao?: string;
  telefone: string;
  bairro: string;
  dia: string;
  horario: string;
  perfil: 'Geral' | 'Jovens (JA)' | 'Famílias' | 'Casais' | 'Universitários' | 'Melhor Idade';
  descricao: string;
  ativo?: boolean;
}

export interface EscalaItem {
  id?: string;
  data: string; // Ex: '2026-08-29'
  dia_semana: string; // Ex: 'Sábado'
  departamento: 'Sonorização & Transmissão' | 'Diaconato' | 'Recepção' | 'Escola Sabatina' | 'Música & Louvor' | 'Ministério Infantil';
  oficiais: string[]; // Ex: ['Carlos Silva', 'Lucas Oliveira']
  observacoes?: string;
  horario?: string; // Ex: '09:00 e 10:15'
}

export interface CultoEscalaGroup {
  data: string; // YYYY-MM-DD
  dataFormatada: string; // Ex: '05 de Setembro de 2026'
  diaSemana: string; // Ex: 'Sábado'
  isHoje: boolean;
  isProximoCulto: boolean;
  isPassado: boolean;
  escalas: EscalaItem[];
}
