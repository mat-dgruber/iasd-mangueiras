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
