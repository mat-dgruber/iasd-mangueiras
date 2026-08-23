# Design — Enxugamento de escopo antes da documentação

Data: 2026-08-21

## Contexto

Os documentos `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/PLAN.md` e `docs/AI_RULES.md` já definem um produto coerente: site institucional da IASD Mangueiras, mobile-first, com Angular SSR, conteúdo institucional, YouTube e formulários.

A preparação antes de documentar deve reduzir risco de execução, não mudar o produto. O problema principal é a ordem: o plano atual antecipa backend/deploy antes de existir um skeleton navegável que prove rotas, layout e SSR.

## Decisões aprovadas

1. Usar a abordagem 1: skeleton completo primeiro.
2. Manter no MVP:
   - Angular 21+ com SSR/prerender;
   - Tailwind CSS 3.4.17;
   - PrimeNG 21+ apenas quando economizar complexidade real;
   - conteúdo JSON no repositório;
   - YouTube automático via API;
   - formulários reais com backend/e-mail ou WhatsApp.
3. Adiar o backend FastAPI até a fase de integração.
4. O primeiro slice deve entregar todas as rotas com placeholders navegáveis.
5. Deploy em branco não deve ser gate cedo; deploy entra depois do skeleton SSR navegável.

## Sequência alvo

### Fase 1 — Frontend SSR e base navegável

- Criar projeto Angular 21+ com SSR, standalone components e TypeScript strict.
- Configurar Tailwind CSS.
- Configurar PrimeNG somente provider/tema, se necessário para compatibilidade futura.
- Criar estrutura de pastas de `ARCHITECTURE.md`.
- Criar layout base com header/footer simples.
- Configurar todas as rotas do MVP.
- Criar páginas placeholder para home, horários, ao-vivo, eventos, ministérios, sou-novo e contato.
- Testar build/SSR e navegação local.

### Fase 2 — Conteúdo institucional via JSON

- Criar arquivos JSON iniciais.
- Criar interfaces tipadas.
- Criar `ContentService`.
- Preencher home, horários/localização, eventos/comunicados, ministérios e sou-novo.
- Testar prerender/HTML sem depender de JavaScript client-side.

### Fase 3 — Integração YouTube

- Iniciar backend FastAPI com `uv`.
- Criar endpoint de últimas lives/vídeos.
- Adicionar cache TTL simples em memória.
- Criar `YoutubeService` no frontend.
- Preencher página ao-vivo e destaques.

### Fase 4 — Contato e oração

- Criar endpoints FastAPI para contato e oração.
- Validar payloads com Pydantic.
- Enviar via provedor definido ou redirecionar para WhatsApp quando essa for a decisão operacional.
- Exibir estados de loading, sucesso e erro.

### Fase 5 — SEO, deploy e QA

- Metatags por rota.
- Dados estruturados de igreja/local business.
- Sitemap/robots.
- Deploy.
- Testes finais mobile, SSR, Lighthouse e links externos.

## Mudanças necessárias nos docs existentes

### `docs/PLAN.md`

- Reordenar o plano para que backend comece só na fase de integração.
- Mover deploy em branco para depois do skeleton navegável.
- Colocar criação de rotas/placeholders antes das páginas completas.
- Manter regra de um passo por vez e teste antes de concluir.

### `docs/ARCHITECTURE.md`

- Manter FastAPI como arquitetura do MVP, mas explicitar que ele é criado somente quando YouTube/formulários forem implementados.
- Evitar parecer que `backend/` precisa existir no setup inicial.
- Manter `ContentService` como fronteira para JSON agora e CMS depois.

### `docs/AI_RULES.md`

- Manter stack e regras absolutas.
- Ajustar qualquer regra operacional que force backend/deploy antes do frontend navegável, se existir.
- Preservar a regra de seguir `PLAN.md` passo a passo.

### `docs/PRD.md`

- Não requer mudança de escopo.
- Se alterado, apenas esclarecer que YouTube automático e formulários reais continuam no MVP, mas não no primeiro slice técnico.

## Fora de escopo desta preparação

- Implementar Angular, FastAPI ou qualquer código de produto.
- Escolher provedor final de e-mail.
- Criar CMS.
- Adicionar CI/CD, hooks, automações ou dependências além do que o setup exigir quando começar a implementação.

## Critérios de sucesso

- O próximo agente consegue iniciar pelo Passo 1 sem reinterpretar a ordem real.
- O backend não bloqueia o setup inicial do frontend.
- Todas as rotas do MVP existem cedo e validam navegação/SSR.
- Cada fase continua pequena, testável e marcada como concluída somente após verificação.
