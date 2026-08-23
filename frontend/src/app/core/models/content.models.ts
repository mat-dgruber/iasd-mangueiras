export interface Horario {
  id?: string;
  titulo: string;
  dia: string;
  horario: string;
  descricao: string;
  ativo?: boolean;
}

export interface Evento {
  id?: string;
  titulo: string;
  data: string;
  horario: string;
  descricao: string;
  local?: string;
  imagem_url?: string;
  href?: string;
  status?: 'publicado' | 'rascunho' | 'encerrado';
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
}

