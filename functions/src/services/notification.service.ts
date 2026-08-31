import * as admin from 'firebase-admin';
import { ContatoIn, OracaoIn } from '../models/types';
import { config } from '../config';

export class NotificationService {
  private get db() {
    return admin.firestore();
  }

  async saveContato(data: ContatoIn): Promise<void> {
    try {
      await this.db.collection('mensagens_contato').add({
        ...data,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        lido: false,
      });
    } catch (e) {
      console.error('Erro ao salvar contato no Firestore:', e);
    }
  }

  async saveOracao(data: OracaoIn): Promise<void> {
    try {
      await this.db.collection('pedidos_oracao').add({
        ...data,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        atendido: false,
      });
    } catch (e) {
      console.error('Erro ao salvar pedido de oração no Firestore:', e);
    }
  }

  /**
   * Converte caracteres especiais em entidades HTML seguras para evitar quebras de sintaxe
   * ou injeções indesejadas no parse_mode: 'HTML' da API de bots do Telegram.
   *
   * @param text String original de entrada
   * @returns String sanitizada com entidades HTML correspondentes
   */
  escapeHtml(text: string | undefined): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async sendTelegramAlert(text: string): Promise<void> {
    if (!config.telegram.botToken || !config.telegram.chatId) return;
    try {
      const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegram.chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
    } catch (e) {
      console.error('Erro ao enviar alerta via Telegram:', e);
    }
  }
}

export const notificationService = new NotificationService();
