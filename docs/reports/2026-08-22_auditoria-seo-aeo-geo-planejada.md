# Auditoria SEO/AEO/GEO planejada — IASD Mangueiras

Data: 2026-08-22

## Status dos módulos

| Módulo | Status | Evidência local |
| --- | --- | --- |
| Descoberta por IA | Planejado no skeleton | `llms.txt`, `llms-full.txt`, `link rel="describedby"` |
| Rastreamento | Planejado no skeleton | `robots.txt` com sitemap absoluto e bots de IA permitidos |
| Indexação | Planejado no skeleton | canonical absoluto, meta robots e rotas prerenderizadas |
| Links rastreáveis | Planejado no layout | navegação principal em `<a href>` |
| Identidade visual para Search | Parcial | favicon/logotipo dependem de asset final aprovado |
| Dados estruturados | Planejado no skeleton | JSON-LD Organization e WebSite |
| Core Web Vitals | Parcial | Tailwind, SSR e font-display; imagens finais dependem de conteúdo real |
| Headers HTTP | Pendente de hospedagem | configurar no provedor escolhido na Fase 5 |

## Próximas validações externas

- Google Search Console após domínio final.
- Teste de resultados ricos do Google após deploy.
- Lighthouse mobile após conteúdo e imagens finais.
- Inspeção de `robots.txt`, `sitemap.xml`, `llms.txt` e `llms-full.txt` no domínio público.
