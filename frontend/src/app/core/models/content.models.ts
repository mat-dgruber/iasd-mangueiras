export interface Horario {
  titulo: string;
  dia: string;
  horario: string;
  descricao: string;
}

export interface Evento {
  titulo: string;
  data: string;
  horario: string;
  descricao: string;
  href?: string;
}

export interface Comunicado {
  titulo: string;
  descricao: string;
  data: string;
}

export interface Ministerio {
  nome: string;
  descricao: string;
}
