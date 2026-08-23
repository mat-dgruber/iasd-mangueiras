export interface ContatoPayload {
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
}

export interface OracaoPayload {
  nome: string;
  telefone?: string;
  pedido: string;
  confidencial: boolean;
}

export interface FormResponse {
  success: boolean;
  message: string;
}
