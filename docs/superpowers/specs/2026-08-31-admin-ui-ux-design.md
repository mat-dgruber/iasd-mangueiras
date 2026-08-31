# Especificação de Design — Aprimoramento de UI/UX do Domínio Admin (IASD-Mangueiras)

- **Data:** 2026-08-31
- **Status:** Aprovado para Planejamento
- **Abordagem Selecionada:** Smart-Assist & Harmonização Atômica (Opção 1)
- **Foco Principal:** Simplicidade máxima para voluntários e leigos, sem burocracia ou complexidade excessiva.

---

## 1. Contexto e Objetivos de Negócio

O painel administrativo da IASD Mangueiras atende voluntários de departamentos (Comunicação, Diaconato, Ministério Jovem, Escola Sabatina, Secretaria e Pastoral) com perfis variados de letramento digital.

### Objetivos Principais:
1. **Eliminar o medo de errar:** Substituir caixas de diálogo nativas do navegador (`window.confirm`) por modais humanizados (`ConfirmDialogComponent`) que explicam as consequências da ação no site público.
2. **Formulários Claros e Amigáveis:** Fornecer validação visual inline imediata (com bordas e textos auxiliares em português direto) e desabilitar botões apenas com indicação explícita dos motivos.
3. **Upload de Imagens Descomplicado:** Criar um componente único (`ImagePickerComponent`) com área de drop, pré-visualização instantânea e upload direto ao Firebase Storage com progresso visual.
4. **Completude dos 5 Estados de UI:**
   - **Loading:** Skeletons animados (`SkeletonComponent`) substituindo mensagens de texto "Carregando...".
   - **Empty State:** Caixas ilustradas com botão direto de ação rápida (`+ Criar Primeiro Item`).
   - **Error com Retry:** Banners explicativos com botão "Tentar Novamente" em caso de falhas de conexão.
   - **Success Feedback:** Padronização 100% no `ToastService` global.
   - **Disabled com Motivo:** Rótulos auxiliares explicando dependências não preenchidas.
5. **Agilidade no Módulo de Escalas:** Manter fluxos em 1 clique para exportação de WhatsApp e geração de cartões PNG para Stories.

---

## 2. Arquitetura e Novos Componentes Compartilhados

Todos os novos componentes residirão em `frontend/src/app/shared/ui/` seguindo a arquitetura Standalone + Signals e respeitando o design system in-house (Tailwind CSS, Inter, Material Symbols Outlined, Multi-tema e WCAG AA/AAA).

### 2.1 `ConfirmDialogComponent` (`app-ui-confirm-dialog`)
- **Localização:** `frontend/src/app/shared/ui/confirm-dialog/confirm-dialog.component.ts`
- **Inputs:**
  - `isOpen: boolean | Signal<boolean>` — Controla visibilidade.
  - `title: string` — Título do diálogo (ex: *"Excluir este evento?"*).
  - `message: string` — Explicação clara do impacto (ex: *"O evento deixará de ser exibido na agenda do site público."*).
  - `confirmText: string` — Rótulo do botão afirmativo (padrão: *"Sim, excluir"* ou *"Confirmar"*).
  - `cancelText: string` — Rótulo do botão de cancelamento (padrão: *"Cancelar"* ou *"Voltar"*).
  - `variant: 'danger' | 'warning' | 'primary'` — Estilo semântico.
  - `isLoading: boolean` — Estado de carregamento com spinner no botão.
- **Outputs:**
  - `confirmed: EventEmitter<void>`
  - `cancelled: EventEmitter<void>`

### 2.2 `ImagePickerComponent` (`app-ui-image-picker`)
- **Localização:** `frontend/src/app/shared/ui/image-picker/image-picker.component.ts`
- **Funcionalidades:**
  - Área de drop e botão "Selecionar Imagem do Computador/Celular".
  - Pré-visualização instantânea da imagem (atual ou recém-selecionada).
  - Suporte a compressão/redimensionamento simples no cliente se necessário.
  - Validação amigável de extensões (`.jpg`, `.png`, `.webp`) e limite de tamanho (ex: 5MB).
  - Opção secundária colapsável para colar URL externa direta se desejado.
- **Inputs / Outputs:**
  - `value: string` (URL atual)
  - `imageSelected: EventEmitter<File>`
  - `imageRemoved: EventEmitter<void>`

---

## 3. Escopo de Melhorias por Módulo do Painel

### 3.1 Escalas dos Oficiais (`/admin/escalas`)
- Adicionar `ConfirmDialogComponent` para exclusão de escalas.
- Inserir `SkeletonComponent` para carregamento da tabela de escalas.
- Garantir que o botão "+ Nova Escala" esteja acessível dentro do empty state quando não houver escalas no mês.
- Toast feedback padronizado ao copiar escala para WhatsApp e ao gerar imagem PNG.

### 3.2 Eventos & Agenda (`/admin/eventos`)
- Integrar `ImagePickerComponent` para banner do evento.
- Validação visual em tempo real nos campos de título, data e palestrante.
- Diálogo de confirmação para exclusão e desativação.
- Loading com Skeletons pulsantes no grid de eventos.

### 3.3 Comunicados (`/admin/comunicados`)
- Substituir alertas locais de `setTimeout` por chamadas a `ToastService.success()`.
- Toggle rápido de visibilidade com feedback instantâneo.
- `ConfirmDialogComponent` para exclusão de avisos.

### 3.4 Pedidos de Oração & Contatos (`/admin/oracoes` e `/admin/contatos`)
- Destaque com `BadgeComponent` especial (amber/vermelho) para pedidos de oração confidenciais.
- Ações rápidas de 1 clique: "Marcar como Orado", "Falar no WhatsApp" e "Marcar como Lido".
- `ConfirmDialogComponent` para arquivamento ou exclusão.

### 3.5 Pequenos Grupos, Horários & Ministérios (`/admin/pgs`, `/admin/horarios`, `/admin/ministerios`)
- Skeletons de carregamento.
- Validações de campos obrigatórios com mensagens humanas.
- `ImagePickerComponent` na gestão de ministérios.

---

## 4. Requisitos de Acessibilidade & Design System (WCAG 2.2 AA)
- Touch targets com altura mínima de 44px em todos os botões e controles.
- Anéis de foco visíveis (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- Contraste semântico adequado em todos os 3 modos: Tema Claro, Tema Escuro e Alto Contraste.
- Suporte a `prefers-reduced-motion` nas animações de transição de modais e skeletons.

---

## 5. Estratégia de Testes e Validação
- **Testes Unitários:**
  - `confirm-dialog.component.spec.ts` (testar abertura, emissão de eventos, acessibilidade do modal, foco e variantes).
  - `image-picker.component.spec.ts` (testar seleção de arquivo, validação de tipo/tamanho, preview e emissão).
- **Validação de Tipos:**
  - Execução de `npx tsc --noEmit` garantindo zero erros de tipagem estática.
- **Testes de Integração de Telas:**
  - Executar suites de teste das páginas administrativas atualizadas (`admin-*.page.spec.ts`).
