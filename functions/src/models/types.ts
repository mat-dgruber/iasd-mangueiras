export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  published_at: string;
  video_url: string;
}

export interface YouTubeLatestResponse {
  channel_id: string;
  videos: VideoItem[];
}

export interface YouTubeLiveResponse {
  is_live: boolean;
  live_video: VideoItem | null;
}

export interface ContatoIn {
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
}

export interface OracaoIn {
  nome: string;
  telefone?: string;
  pedido: string;
  confidencial?: boolean;
}

export interface FormResponse {
  success: boolean;
  message: string;
}

export interface LicaoHojeResponse {
  titulo: string;
  tema: string;
  trimestre: string;
  versiculo_dia: string;
  referencia: string;
  link_cpb: string;
  licao_numero: number;
}
