import { readFileSync, existsSync } from 'node:fs';

const checks = [
  {
    file: 'dist/frontend/browser/index.html',
    expectedTexts: ['IASD Mangueiras', 'Escola Sabatina', 'Culto Divino', 'Ao vivo e mensagens', 'Nossos ministérios'],
  },
  {
    file: 'dist/frontend/browser/horarios/index.html',
    expectedTexts: ['Horários e Localização', 'Programação Semanal', 'Escola Sabatina', 'Como Chegar', 'Dúvidas Frequentes do Visitante'],
  },
  {
    file: 'dist/frontend/browser/ao-vivo/index.html',
    expectedTexts: ['Transmissões e Mensagens', 'Série Presente 7', 'IASD Mangueiras'],
  },
  {
    file: 'dist/frontend/browser/eventos/index.html',
    expectedTexts: ['Eventos e Comunicados', 'Próximos Eventos', 'Culto Jovem Especial de Louvor', 'Comunicados e Avisos Gerais'],
  },
  {
    file: 'dist/frontend/browser/ministerios/index.html',
    expectedTexts: ['Ministérios da Igreja', 'Serviço e Comunhão', 'Comunicação &amp; Acolhimento', 'Novas Gerações &amp; Família'],
  },
  {
    file: 'dist/frontend/browser/sou-novo/index.html',
    expectedTexts: ['Primeira vez conosco?', 'O que esperar na sua visita', 'Recepção Calorosa', 'Perguntas Frequentes de Visitantes'],
  },
  {
    file: 'dist/frontend/browser/contato/index.html',
    expectedTexts: ['Contato e Pedido de Oração', 'Fale Conosco', 'Pedido de Oração', 'IASD Mangueiras'],
  },
  {
    file: 'dist/frontend/browser/escalas/index.html',
    expectedTexts: ['Escalas &amp; Voluntários', 'Escalas Ministeriais', 'IASD Mangueiras'],
  },
];

for (const { file, expectedTexts } of checks) {
  if (!existsSync(file)) throw new Error(`Missing prerendered file: ${file}`);
  const html = readFileSync(file, 'utf8');
  for (const text of expectedTexts) {
    if (!html.includes(text)) throw new Error(`Missing text "${text}" in ${file}`);
  }
  if (!html.includes('rel="canonical"')) throw new Error(`Missing canonical in ${file}`);
  if (!html.includes('application/ld+json')) throw new Error(`Missing JSON-LD in ${file}`);
}

console.log('prerendered SEO & institutional content verified successfully');

