# PRD — Site IASD Mangueiras (Mangueiras Church Adventist Comms)

## 1. Visão Geral
Site oficial da Igreja Adventista do Sétimo Dia das Mangueiras, em Tatuí-SP. O produto cumpre três papéis num só endereço: **cartão de visitas oficial** (quem somos, horários, onde fica), **hub de conteúdo** (últimas transmissões ao vivo e séries do YouTube, como "Presente 7", puxadas automaticamente pela API) e **portal informativo** (comunicados, eventos e anúncios da igreja).

Sucesso é: um visitante de primeira vez encontra horário, local e um próximo passo de conexão em menos de 30 segundos no celular; e um membro acompanha lives, séries e avisos sem depender do algoritmo das redes sociais.

## 2. Problema
Hoje a presença digital da igreja está espalhada entre Instagram (@iasdmangueiras), Facebook, YouTube (@IASDMangueiras) e um Linktree. Não existe um endereço oficial, pesquisável no Google, que responda de forma imediata: "onde e quando é o culto?", "como assisto à programação?", "tem algum evento chegando?".

Sem o site, a igreja continua dependente do alcance de redes sociais, é difícil de encontrar para quem busca "igreja adventista Tatuí", e não oferece um ponto de chegada confiável e acolhedor para novos visitantes.

## 3. Usuários-alvo
- **Visitante de primeira vez** — no celular, buscando "igreja adventista perto de mim" ou "adventista Tatuí". Quer horário, endereço, como chegar e o que esperar.
- **Membro / frequentador** — quer a agenda da semana, o link da transmissão ao vivo, a lição da Escola Sabatina e os avisos.
- **Interessado à distância** — acompanha as lives e séries, busca conteúdo e um canal de pedido de oração.
- **Liderança / equipe de comunicação** — precisa publicar eventos e comunicados com o mínimo de fricção.

## 4. O que o produto É
- Site institucional + hub, **responsivo e mobile-first**, em pt-BR, com **SEO forte** (renderização no servidor) e dados estruturados de igreja para o Google.
- Página inicial com identidade da igreja, **próximo culto / próxima live** em destaque e caminhos claros: *Assista*, *Visite*, *Conecte-se*.
- **Horários e localização** com mapa e botão de rota.
- Seção **Ao vivo / Vídeos** integrada ao YouTube: últimas transmissões e séries via API, com atualização automática.
- **Eventos, comunicados e anúncios** (portal informativo).
- Página **Sou novo aqui** (primeira visita).
- **Ministérios**: Jovens, Desbravadores, Aventureiros, Ministério da Criança, Música, Família, entre outros.
- **Contato e pedidos de oração** (formulário → e-mail e/ou WhatsApp).
- **Rodapé** com redes sociais, WhatsApp, endereço e link de dízimos e ofertas (sistema oficial, externo).

## 5. O que o produto NÃO é
- Não é sistema de login nem portal de membros.
- Não é e-commerce nem gateway de pagamento — dízimos e ofertas apontam para o sistema oficial da Igreja via link externo.
- Não é rede social nem substituto do YouTube/Instagram — ele **agrega e organiza** o que já existe.
- Não é um blog pesado ou plataforma de artigos longos no MVP.
- Não é aplicativo nativo (iOS/Android).
- Não armazena dados sensíveis de membros no MVP.

## 6. Funcionalidades principais (MVP)

| Funcionalidade | Descrição | Prioridade |
|---|---|---|
| Página inicial | Hero com identidade, próximo culto/live, CTAs (Assista, Visite, Conecte-se) e destaques | P0 |
| Horários e localização | Escola Sabatina + culto de sábado, cultos de semana, mapa e botão "Como chegar" | P0 |
| Ao vivo / Vídeos | Embed do YouTube + últimas lives e série "Presente 7" via YouTube Data API | P0 |
| Eventos e comunicados | Lista de próximos eventos e avisos, editável por arquivo de conteúdo | P0 |
| Contato e oração | Formulário simples → e-mail/WhatsApp; sem armazenar dados sensíveis | P0 |
| Rodapé institucional | Redes sociais, WhatsApp, endereço, link de dízimos (externo) | P0 |
| Sou novo aqui | O que esperar na primeira visita, como se preparar, como chegar | P1 |
| Ministérios | Página com os ministérios e um breve descritivo de cada | P1 |
| SEO + dados estruturados | Meta tags por página, Open Graph e JSON-LD de igreja/eventos | P1 |

## 7. Métricas de sucesso
- **Primária:** visitantes que chegam à página de Horários/Localização e clicam em "Como chegar" + cliques em "Assistir ao vivo".
- **Secundárias:** sessões orgânicas vindas de busca (ex.: "igreja adventista Tatuí"); tempo na seção de conteúdo; envios de formulário (contato e oração); cliques no WhatsApp; taxa de retorno de visitantes.

## 8. Restrições e premissas
- **Orçamento de igreja:** priorizar serviços com plano gratuito; evitar custo alto de infraestrutura.
- **Mantido por voluntários:** o conteúdo precisa ser fácil de atualizar. No MVP fica em arquivos no repositório; a Fase 2 conecta um CMS headless (ver ARCHITECTURE).
- **YouTube Data API** tem cota diária — as respostas devem ser cacheadas no backend.
- **Idioma:** pt-BR. **Identidade visual:** adventista, sóbria e acolhedora.
- **Fidelidade editorial:** o conteúdo segue os princípios editoriais da comunicação adventista.
