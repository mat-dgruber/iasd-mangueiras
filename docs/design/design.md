# Design — Site IASD Mangueiras

## 1. Objetivo da experiência

O site deve permitir que um visitante de primeira vez encontre, no celular, horário, endereço e próximo passo de conexão em menos de 30 segundos.

Para membros e frequentadores, o site deve centralizar lives, agenda, avisos e conteúdos sem depender do algoritmo das redes sociais.

## 2. Princípios de produto

1. **Mobile-first real** — a experiência principal acontece no celular.
2. **Informação prática primeiro** — horário, endereço, culto ao vivo e contato vêm antes de conteúdo institucional longo.
3. **Sobriedade visual** — design limpo, adventista, acolhedor e sem estética genérica de landing page.
4. **Acessibilidade como base** — contraste, foco, headings e leitura simples são requisitos, não polimento.
5. **Site como fonte oficial** — redes sociais complementam, mas não substituem a informação do site.

## 3. Arquitetura recomendada da home

Ordem mínima recomendada:

1. **Header**
   - marca IASD Mangueiras;
   - navegação curta;
   - CTA para “Como chegar” ou “Assistir ao vivo”.

2. **Hero**
   - mensagem curta de boas-vindas;
   - próximo culto/horário principal;
   - CTAs: “Como chegar” e “Assistir ao vivo”.

3. **Horários e localização**
   - Escola Sabatina, culto, programação principal;
   - endereço completo;
   - link para rota.

4. **Transmissão e YouTube**
   - live atual quando disponível;
   - últimas mensagens/séries;
   - fallback claro quando não houver live.

5. **Eventos e avisos**
   - próximos eventos;
   - comunicados relevantes;
   - cards curtos com data, título e ação.

6. **Próximo passo**
   - pedido de oração;
   - falar com a igreja;
   - participar de um estudo bíblico;
   - conhecer a comunidade.

7. **Footer**
   - endereço, redes, horários, direitos e links essenciais.

## 4. Layout e espaçamento

- Usar grid responsivo simples.
- Basear espaçamento em escala de 4/8px.
- Priorizar blocos escaneáveis no mobile.
- Limitar largura de leitura em textos longos.
- Manter áreas de destaque com bastante respiro.

Tokens sugeridos:

| Token | Valor |
| --- | --- |
| Espaço mínimo | `4px` |
| Espaço base | `8px` |
| Espaço entre grupos | `24px` |
| Espaço entre seções | `48px` mobile / `72px` desktop |
| Radius discreto | `12px` |
| Radius grande | `20px` |
| Largura máxima | `1120px` |

## 5. Cores de interface

Usar a paleta definida em `docs/design/brand-guidelines.md`.

Aplicação recomendada:

- azul institucional para hero, CTAs principais e blocos de confiança;
- branco/neutros para áreas de leitura;
- preto/texto escuro para máxima legibilidade;
- acentos apenas quando houver função clara: estado, destaque ou ação.

Evitar:

- gradientes neon;
- excesso de sombras;
- cartões idênticos sem hierarquia;
- fundos escuros em todas as seções.

## 6. Tipografia de interface

- **AdventSans-Logo**: apenas marca/display curto.
- **Inter**: interface, leitura, navegação, cards e formulários.

Regras práticas:

- títulos devem informar, não decorar;
- subtítulos explicam o benefício da seção;
- parágrafos curtos;
- botões com verbo de ação claro: “Ver rota”, “Assistir ao vivo”, “Enviar pedido”.

## 7. Componentes mínimos

### Header

- Fixo apenas se não roubar espaço no mobile.
- Navegação curta: Início, Horários, Eventos, Ao vivo, Contato.
- CTA primário sempre visível no desktop; no mobile, priorizar menu simples + CTA no hero.

### Hero

Deve responder rapidamente:

- que igreja é esta;
- onde fica;
- quando acontece o próximo encontro;
- qual ação o visitante deve tomar.

### Card de horário

Conteúdo mínimo:

- nome da programação;
- dia e hora;
- breve descrição;
- ação opcional.

### Card de evento

Conteúdo mínimo:

- data;
- título;
- local/horário;
- CTA se houver inscrição ou detalhes.

### Bloco de live/YouTube

Estados obrigatórios:

- live disponível;
- sem live no momento;
- erro ao carregar;
- carregando.

### Formulário de contato/pedido de oração

- Campos mínimos.
- Mensagem de privacidade simples.
- Feedback de envio claro.
- Erros próximos ao campo.

## 8. Estados de interface

Cada conteúdo dinâmico deve ter estados definidos.

| Estado | Regra |
| --- | --- |
| Loading | skeleton ou mensagem curta; não travar layout |
| Empty | explicar ausência e oferecer próximo passo |
| Error | informar falha sem culpar usuário; oferecer retry ou canal alternativo |
| Success | confirmar ação e indicar o que acontece depois |
| Disabled | manter contraste e explicar quando necessário |

## 9. Interação e movimento

- Transições entre `150ms` e `300ms`.
- Animar preferencialmente `opacity` e `transform`.
- Usar `:focus-visible` em todos os elementos interativos.
- Hover deve reforçar clicabilidade, não virar efeito decorativo.
- Respeitar `prefers-reduced-motion`.

## 10. Acessibilidade e SEO

Requisitos mínimos:

- uma hierarquia de headings por página;
- landmarks semânticos (`header`, `main`, `nav`, `section`, `footer`);
- labels em formulários;
- alt text para imagens informativas;
- contraste AA;
- dados estruturados de igreja/local quando implementado;
- conteúdo principal renderizável no servidor.

## 11. Conteúdo e microcopy

Princípios:

- visitante não conhece a rotina interna da igreja;
- horários e localização devem ser explícitos;
- termos adventistas podem aparecer, mas precisam de contexto quando forem essenciais;
- chamadas devem ser acolhedoras e práticas.

Exemplos:

- “Venha nos visitar neste sábado”
- “Veja como chegar”
- “Assista à transmissão ao vivo”
- “Envie seu pedido de oração”
- “Conheça nossos horários”

Evitar:

- “Clique aqui”;
- “Saiba mais” sem contexto;
- blocos longos no hero;
- linguagem interna sem explicação.

## 12. Critérios de aceite visual

Antes de considerar uma tela pronta, verificar:

- horário, endereço e CTA principal aparecem no primeiro fluxo mobile;
- contraste passa WCAG AA;
- foco por teclado é visível;
- estados loading/empty/error existem para dados externos;
- marca não foi distorcida ou recolorida indevidamente;
- visual parece institucional/local, não template genérico;
- redes sociais aparecem como apoio, não como dependência para informação essencial.

## 13. Fontes consultadas

- Brand Guidelines local: `docs/design/brand-guidelines.md`
- PRD do projeto: `docs/PRD.md`
- Arquitetura: `docs/ARCHITECTURE.md`
- Regras editoriais: `docs/AI_RULES.md`
- Guia universal de UI/UX/acessibilidade: `docs/guides/guia-universal-design-ui-ux-acessibilidade.md`
- Visão da Comunicação Adventista: `https://www.adventistas.org/pt/comunicacao/visao-da-comunicacao-adventista/`
- Assets locais de marca: `docs/refs/`
