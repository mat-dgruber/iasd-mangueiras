import { Router, Request, Response } from 'express';
import { ContatoIn, OracaoIn } from '../models/types';
import { notificationService } from '../services/notification.service';

export const formsRouter = Router();

formsRouter.post('/contato', async (req: Request, res: Response) => {
  try {
    const data = req.body as ContatoIn;
    if (!data.nome || !data.email || !data.mensagem) {
      return res.status(422).json({ error: 'Campos obrigatórios ausentes.' });
    }

    await notificationService.saveContato(data);
    await notificationService.sendTelegramAlert(
      `📩 <b>Novo Contato Recebido</b>\n<b>Nome:</b> ${data.nome}\n<b>E-mail:</b> ${data.email}\n<b>Assunto:</b> ${data.assunto}\n<b>Mensagem:</b> ${data.mensagem}`
    );

    return res.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Em breve entraremos em contato.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar formulário de contato' });
  }
});

formsRouter.post('/oracao', async (req: Request, res: Response) => {
  try {
    const data = req.body as OracaoIn;
    if (!data.nome || !data.pedido) {
      return res.status(422).json({ error: 'Campos obrigatórios ausentes.' });
    }

    await notificationService.saveOracao(data);
    await notificationService.sendTelegramAlert(
      `🙏 <b>Novo Pedido de Oração</b>\n<b>Nome:</b> ${data.nome}\n<b>Confidencial:</b> ${data.confidencial ? 'Sim' : 'Não'}\n<b>Pedido:</b> ${data.pedido}`
    );

    return res.json({
      success: true,
      message: 'Pedido de oração recebido! Nossa equipe e congregação estarão em oração por você.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar pedido de oração' });
  }
});

formsRouter.get('/licao/hoje', (req: Request, res: Response) => {
  return res.json({
    titulo: 'O Plano da Redenção e a Esperança Viva',
    tema: 'Mensagens de Esperança para os Nossos Dias',
    trimestre: '3º Trimestre de 2026',
    versiculo_dia:
      'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
    referencia: 'Jeremias 29:11',
    link_cpb: 'https://licoesbiblicas.cpb.com.br/',
    licao_numero: 8,
  });
});
