# Gestão de Cronogramas e Liturgia do Culto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o gerenciamento completo de cronogramas e liturgia de culto no painel administrativo `/admin/escalas` com abas reativas, suporte a templates nativos (Sábado Manhã, Domingo Noite, Quarta, Culto Jovem, Santa Ceia e Batismo), criação de modelos customizados, reordenação sequencial de itens e exportação pronta para WhatsApp.

**Architecture:** Abas desacopladas em `AdminEscalasPage` (`activeTab = signal<'escalas' | 'cronogramas'>('escalas')`) integrando o componente modular `AdminCronogramasTabComponent`. Persistência em coleções dedicadas do Firestore (`cronogramas_culto` e `cronogramas_templates`) protegidas por `isAdmin()`. Operações reativas coordenadas por `AdminCronogramaService` e utilitários puros em `cronograma.utils.ts`.

**Tech Stack:** Angular 22 (Standalone Components, Signals, OnPush), Firebase Firestore Security Rules & SDK, Vitest, Tailwind CSS, Material Symbols Outlined.

## Global Constraints

- **Segurança Zero-Trust:** As coleções `cronogramas_culto` e `cronogramas_templates` devem permitir leitura e escrita estritamente se `isAdmin()`.
- **Qualidade e Estabilidade:** Zero erros de tipagem estática (`npx tsc --noEmit`) e 100% dos testes unitários passando (`npm test -- --watch=false`).
- **Padrão de Commits:** Conventional Commits em inglês (`<type>(<scope>): <subject>`).
- **Acessibilidade e Micro-UX:** Botões com área de toque mínima de 40px, estados de loading e feedback tátil/visual para cópia e ações.

---

### Task 1: Proteger Coleções de Cronogramas nas Regras do Firestore

**Files:**
- Modify: `firestore.rules:66`

**Interfaces:**
- Consumes: `isAdmin()` function in `firestore.rules`
- Produces: Locked `/cronogramas_culto/{document}` and `/cronogramas_templates/{document}` collections

- [ ] **Step 1: Atualizar `firestore.rules`**

Adicionar as regras para `cronogramas_culto` e `cronogramas_templates`:

```rules
    // Cronogramas de Culto e Templates de Liturgia (Admin-Only)
    match /cronogramas_culto/{document} {
      allow read, write: if isAdmin();
    }

    match /cronogramas_templates/{document} {
      allow read, write: if isAdmin();
    }
```

- [ ] **Step 2: Verificar sintaxe e diff do Firestore**

Executar: `git diff firestore.rules`
Esperado: Exibição das duas novas declarações de match logo após a regra de `match /escalas/{document}`.

- [ ] **Step 3: Commit das regras de segurança**

```bash
git add firestore.rules
git commit -m "feat(security): add admin-only firestore rules for worship schedules and templates"
```

---

### Task 2: Criar Modelos e Templates Nativos de Cronograma

**Files:**
- Create: `frontend/src/app/core/models/cronograma.models.ts`

**Interfaces:**
- Produces: `CronogramaItem`, `CronogramaCulto`, `CronogramaTemplate`, `TipoCulto`, `TEMPLATES_NATIVOS`

- [ ] **Step 1: Criar arquivo de modelos e templates nativos**

Criar `frontend/src/app/core/models/cronograma.models.ts`:

```typescript
export type TipoCulto =
  | 'sabado_manha'
  | 'domingo_noite'
  | 'quarta_oracao'
  | 'culto_ja'
  | 'santa_ceia'
  | 'batismo'
  | 'personalizado';

export interface CronogramaItem {
  id: string;
  ordem: number;
  horario: string;
  nomeQuadro: string;
  responsavel: string;
  descricao?: string;
  duracaoMinutos?: number;
}

export interface CronogramaCulto {
  id: string;
  data: string; // YYYY-MM-DD
  titulo: string;
  tipoCulto: TipoCulto;
  itens: CronogramaItem[];
  observacoesGerais?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CronogramaTemplate {
  id: string;
  nome: string;
  descricao?: string;
  tipoCulto: TipoCulto;
  itens: Omit<CronogramaItem, 'id'>[];
  criadoEm: string;
  isNativo?: boolean;
}

export const TEMPLATES_NATIVOS: readonly CronogramaTemplate[] = [
  {
    id: 'template-sabado-manha',
    nome: 'Sábado de Manhã (Escola Sabatina + Culto Divino)',
    descricao: 'Liturgia completa da programação matinal de sábado.',
    tipoCulto: 'sabado_manha',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '09:00', duracaoMinutos: 15, nomeQuadro: 'Louvor Congregacional', responsavel: 'Ministério de Louvor', descricao: 'Cânticos preparatórios' },
      { ordem: 1, horario: '09:15', duracaoMinutos: 5, nomeQuadro: 'Abertura e Boas-Vindas', responsavel: 'Diretoria da Escola Sabatina' },
      { ordem: 2, horario: '09:20', duracaoMinutos: 10, nomeQuadro: 'Informativo Mundial das Missões', responsavel: 'Comunicação / Sonoplastia', descricao: 'Vídeo Missionário' },
      { ordem: 3, horario: '09:30', duracaoMinutos: 50, nomeQuadro: 'Estudo da Lição em Unidades', responsavel: 'Professores da Escola Sabatina' },
      { ordem: 4, horario: '10:20', duracaoMinutos: 10, nomeQuadro: 'Intervalo e Avisos da Igreja', responsavel: 'Secretaria / Comunicação' },
      { ordem: 5, horario: '10:30', duracaoMinutos: 5, nomeQuadro: 'Prelúdio e Entrada dos Oficiantes', responsavel: 'Ancião de Dia e Pregador' },
      { ordem: 6, horario: '10:35', duracaoMinutos: 5, nomeQuadro: 'Doxologia e Oração de Invocação', responsavel: 'Ancião de Dia' },
      { ordem: 7, horario: '10:40', duracaoMinutos: 5, nomeQuadro: 'Dízimos e Ofertas', responsavel: 'Diaconato' },
      { ordem: 8, horario: '10:45', duracaoMinutos: 10, nomeQuadro: 'Adoração Infantil', responsavel: 'Ministério da Criança' },
      { ordem: 9, horario: '10:55', duracaoMinutos: 10, nomeQuadro: 'Oração Intercessória de Joelhos', responsavel: 'Ancião ou Líder de Oração' },
      { ordem: 10, horario: '11:05', duracaoMinutos: 5, nomeQuadro: 'Mensagem Musical Especial', responsavel: 'Ministério de Louvor / Convidado' },
      { ordem: 11, horario: '11:10', duracaoMinutos: 40, nomeQuadro: 'Sermão / Mensagem Bíblica', responsavel: 'Pastor / Orador Convidado' },
      { ordem: 12, horario: '11:50', duracaoMinutos: 10, nomeQuadro: 'Hino Final e Bênção Pastoral', responsavel: 'Orador e Congregação' },
    ],
  },
  {
    id: 'template-domingo-noite',
    nome: 'Domingo à Noite (Culto Evangelístico)',
    descricao: 'Ordem do culto evangelístico com louvor e mensagem bíblica.',
    tipoCulto: 'domingo_noite',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '19:30', duracaoMinutos: 15, nomeQuadro: 'Cânticos Iniciais de Louvor', responsavel: 'Ministério de Louvor' },
      { ordem: 1, horario: '19:45', duracaoMinutos: 5, nomeQuadro: 'Oração Inicial e Boas-Vindas', responsavel: 'Direção do Culto' },
      { ordem: 2, horario: '19:50', duracaoMinutos: 10, nomeQuadro: 'Testemunho / Momento de Gratidão', responsavel: 'Líder Designado' },
      { ordem: 3, horario: '20:00', duracaoMinutos: 10, nomeQuadro: 'Ofertório e Mensagem Musical', responsavel: 'Diaconato e Louvor' },
      { ordem: 4, horario: '20:10', duracaoMinutos: 40, nomeQuadro: 'Mensagem da Palavra de Deus', responsavel: 'Pregador' },
      { ordem: 5, horario: '20:50', duracaoMinutos: 10, nomeQuadro: 'Apelo, Hino e Oração Final', responsavel: 'Pregador' },
    ],
  },
  {
    id: 'template-quarta-oracao',
    nome: 'Quarta-feira (Culto de Oração)',
    descricao: 'Momento focado em oração intercessória e estudo bíblico.',
    tipoCulto: 'quarta_oracao',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '19:30', duracaoMinutos: 15, nomeQuadro: 'Louvor e Oração em Duplas', responsavel: 'Liderança de Oração' },
      { ordem: 1, horario: '19:45', duracaoMinutos: 30, nomeQuadro: 'Meditação na Palavra de Deus', responsavel: 'Orador' },
      { ordem: 2, horario: '20:15', duracaoMinutos: 15, nomeQuadro: 'Círculo de Oração Intercessória', responsavel: 'Toda a Igreja' },
      { ordem: 3, horario: '20:30', duracaoMinutos: 5, nomeQuadro: 'Oração Final e Despedida', responsavel: 'Dirigente' },
    ],
  },
  {
    id: 'template-culto-ja',
    nome: 'Culto Jovem (JA)',
    descricao: 'Programação dinâmica de sábado à tarde para a juventude.',
    tipoCulto: 'culto_ja',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '17:30', duracaoMinutos: 15, nomeQuadro: 'Louvor Jovem', responsavel: 'Banda JA' },
      { ordem: 1, horario: '17:45', duracaoMinutos: 15, nomeQuadro: 'Quebra-Gelo / Dinâmica', responsavel: 'Equipe Jovem' },
      { ordem: 2, horario: '18:00', duracaoMinutos: 25, nomeQuadro: 'Tema Jovem / Painel de Debate', responsavel: 'Convidados' },
      { ordem: 3, horario: '18:25', duracaoMinutos: 10, nomeQuadro: 'Momento de Oração / Louvor Especial', responsavel: 'Equipe Jovem' },
      { ordem: 4, horario: '18:35', duracaoMinutos: 30, nomeQuadro: 'Mensagem Inspiradora', responsavel: 'Orador JA' },
      { ordem: 5, horario: '19:05', duracaoMinutos: 10, nomeQuadro: 'Pôr do Sol e Oração de Encerramento', responsavel: 'Diretoria JA' },
    ],
  },
  {
    id: 'template-santa-ceia',
    nome: 'Santa Ceia (Cerimônia da Comunhão)',
    descricao: 'Liturgia solene com Lava-pés e celebração do Pão e Suco.',
    tipoCulto: 'santa_ceia',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '10:30', duracaoMinutos: 10, nomeQuadro: 'Abertura Solene e Mensagem de Comunhão', responsavel: 'Pastor e Anciãos' },
      { ordem: 1, horario: '10:40', duracaoMinutos: 30, nomeQuadro: 'Cerimônia do Lava-Pés', responsavel: 'Congregação e Diaconato' },
      { ordem: 2, horario: '11:10', duracaoMinutos: 15, nomeQuadro: 'Distribuição do Pão Ázimo', responsavel: 'Pastor, Anciãos e Diáconos' },
      { ordem: 3, horario: '11:25', duracaoMinutos: 15, nomeQuadro: 'Distribuição do Suco da Videira', responsavel: 'Pastor, Anciãos e Diáconos' },
      { ordem: 4, horario: '11:40', duracaoMinutos: 10, nomeQuadro: 'Canto do Hino de Gratidão e Bênção', responsavel: 'Congregação e Pastor' },
    ],
  },
  {
    id: 'template-batismo',
    nome: 'Cerimônia Batismal',
    descricao: 'Ordem de celebração para batismos com testemunhos e apelo.',
    tipoCulto: 'batismo',
    isNativo: true,
    criadoEm: '2026-01-01T00:00:00.000Z',
    itens: [
      { ordem: 0, horario: '11:00', duracaoMinutos: 10, nomeQuadro: 'Mensagem Pastoral sobre o Batismo', responsavel: 'Pastor' },
      { ordem: 1, horario: '11:10', duracaoMinutos: 10, nomeQuadro: 'Votos Batismais e Profissão de Fé', responsavel: 'Pastor e Candidatos' },
      { ordem: 2, horario: '11:20', duracaoMinutos: 25, nomeQuadro: 'Entrada no Batistério e Batismo', responsavel: 'Pastor e Diaconato' },
      { ordem: 3, horario: '11:45', duracaoMinutos: 10, nomeQuadro: 'Boas-Vindas aos Novos Membros e Oração', responsavel: 'Ancião e Igreja' },
    ],
  },
];
```

- [ ] **Step 2: Verificar checagem de tipos estática**

Executar: `npx --prefix frontend tsc --noEmit`
Esperado: 0 erros de compilação.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/core/models/cronograma.models.ts
git commit -m "feat(cronogramas): define cronograma models and native worship service templates"
```

---

### Task 3: Utilitários de Cronograma (`cronograma.utils.ts`) e Testes Unitários

**Files:**
- Create: `frontend/src/app/core/utils/cronograma.utils.ts`
- Test: `frontend/src/app/core/utils/cronograma.utils.spec.ts`

**Interfaces:**
- Consumes: `CronogramaItem`, `CronogramaCulto`
- Produces: `reordenarItens`, `calcularHorariosEmSequencia`, `formatarCronogramaParaWhatsApp`

- [ ] **Step 1: Escrever teste unitário falhando (TDD)**

Criar `frontend/src/app/core/utils/cronograma.utils.spec.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { CronogramaItem, CronogramaCulto } from '../models/cronograma.models';
import {
  reordenarItens,
  calcularHorariosEmSequencia,
  formatarCronogramaParaWhatsApp,
} from './cronograma.utils';

describe('cronograma.utils', () => {
  const itensMock: CronogramaItem[] = [
    { id: '1', ordem: 0, horario: '09:00', duracaoMinutos: 15, nomeQuadro: 'Louvor', responsavel: 'Banda' },
    { id: '2', ordem: 1, horario: '09:15', duracaoMinutos: 10, nomeQuadro: 'Abertura', responsavel: 'Dirigente' },
    { id: '3', ordem: 2, horario: '09:25', duracaoMinutos: 30, nomeQuadro: 'Mensagem', responsavel: 'Pastor' },
  ];

  describe('reordenarItens', () => {
    it('move item para cima e atualiza ordens', () => {
      const resultado = reordenarItens(itensMock, 1, 'up');
      expect(resultado[0].id).toBe('2');
      expect(resultado[0].ordem).toBe(0);
      expect(resultado[1].id).toBe('1');
      expect(resultado[1].ordem).toBe(1);
    });

    it('move item para baixo e atualiza ordens', () => {
      const resultado = reordenarItens(itensMock, 1, 'down');
      expect(resultado[1].id).toBe('3');
      expect(resultado[1].ordem).toBe(1);
      expect(resultado[2].id).toBe('2');
      expect(resultado[2].ordem).toBe(2);
    });

    it('não move primeiro item para cima', () => {
      const resultado = reordenarItens(itensMock, 0, 'up');
      expect(resultado[0].id).toBe('1');
    });

    it('não move último item para baixo', () => {
      const resultado = reordenarItens(itensMock, 2, 'down');
      expect(resultado[2].id).toBe('3');
    });
  });

  describe('calcularHorariosEmSequencia', () => {
    it('calcula horários em cascata baseado na duração de cada quadro', () => {
      const resultado = calcularHorariosEmSequencia('09:00', itensMock);
      expect(resultado[0].horario).toBe('09:00');
      expect(resultado[1].horario).toBe('09:15');
      expect(resultado[2].horario).toBe('09:25');
    });

    it('mantém horário original se duração não for informada', () => {
      const semDuracao: CronogramaItem[] = [
        { id: '1', ordem: 0, horario: '10:00', nomeQuadro: 'Item 1', responsavel: 'Resp' },
        { id: '2', ordem: 1, horario: '10:20', nomeQuadro: 'Item 2', responsavel: 'Resp' },
      ];
      const resultado = calcularHorariosEmSequencia('10:00', semDuracao);
      expect(resultado[0].horario).toBe('10:00');
      expect(resultado[1].horario).toBe('10:20');
    });
  });

  describe('formatarCronogramaParaWhatsApp', () => {
    it('gera string formatada com emojis e detalhes do culto', () => {
      const cronograma: CronogramaCulto = {
        id: 'c1',
        data: '2026-09-05',
        titulo: 'Culto Divino',
        tipoCulto: 'sabado_manha',
        itens: itensMock,
        criadoEm: '2026-09-01T00:00:00.000Z',
        atualizadoEm: '2026-09-01T00:00:00.000Z',
      };

      const texto = formatarCronogramaParaWhatsApp(cronograma);
      expect(texto).toContain('CRONOGRAMA DO CULTO — IASD MANGUEIRAS');
      expect(texto).toContain('Culto Divino');
      expect(texto).toContain('09:00');
      expect(texto).toContain('Louvor');
      expect(texto).toContain('Banda');
    });
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha (TDD)**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/core/utils/cronograma.utils.spec.ts`
Esperado: FAIL ("Cannot find module './cronograma.utils'").

- [ ] **Step 3: Implementar `cronograma.utils.ts`**

Criar `frontend/src/app/core/utils/cronograma.utils.ts`:

```typescript
import { CronogramaItem, CronogramaCulto } from '../models/cronograma.models';

export function reordenarItens(
  itens: readonly CronogramaItem[],
  indiceOrigem: number,
  direcao: 'up' | 'down',
): CronogramaItem[] {
  const novoIndice = direcao === 'up' ? indiceOrigem - 1 : indiceOrigem + 1;
  if (novoIndice < 0 || novoIndice >= itens.length) {
    return [...itens];
  }

  const copia = [...itens];
  const [removido] = copia.splice(indiceOrigem, 1);
  copia.splice(novoIndice, 0, removido);

  return copia.map((item, index) => ({
    ...item,
    ordem: index,
  }));
}

export function calcularHorariosEmSequencia(
  horarioInicial: string,
  itens: readonly CronogramaItem[],
): CronogramaItem[] {
  if (!itens.length) return [];

  const partes = horarioInicial.split(':');
  let totalMinutos = (parseInt(partes[0], 10) || 0) * 60 + (parseInt(partes[1], 10) || 0);

  return itens.map((item, idx) => {
    if (idx === 0) {
      if (item.duracaoMinutos) {
        totalMinutos += item.duracaoMinutos;
      }
      return { ...item, horario: horarioInicial };
    }

    if (item.duracaoMinutos !== undefined && item.duracaoMinutos > 0) {
      const horas = Math.floor(totalMinutos / 60) % 24;
      const minutos = totalMinutos % 60;
      const horarioFormatado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      totalMinutos += item.duracaoMinutos;
      return { ...item, horario: horarioFormatado };
    }

    return { ...item };
  });
}

export function formatarCronogramaParaWhatsApp(cronograma: CronogramaCulto): string {
  const dataFormatada = cronograma.data
    ? cronograma.data.split('-').reverse().join('/')
    : 'Data a definir';

  const linhasItens = cronograma.itens
    .map((item) => {
      const desc = item.descricao ? `\n   📝 _${item.descricao}_` : '';
      return `⏰ *${item.horario}* — ${item.nomeQuadro}\n   👤 *Resp:* ${item.responsavel || 'A definir'}${desc}`;
    })
    .join('\n\n');

  const obs = cronograma.observacoesGerais
    ? `\n\n📌 *Observações:* ${cronograma.observacoesGerais}`
    : '';

  return `📋 *CRONOGRAMA DO CULTO — IASD MANGUEIRAS*
📅 *Data:* ${dataFormatada}
📖 *Culto:* ${cronograma.titulo}
────────────────────────
${linhasItens}${obs}
────────────────────────
_IASD Mangueiras — Secretaria & Pastoral_`;
}
```

- [ ] **Step 4: Executar os testes e confirmar aprovação**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/core/utils/cronograma.utils.spec.ts`
Esperado: PASS (100% dos testes passando).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/utils/cronograma.utils.ts frontend/src/app/core/utils/cronograma.utils.spec.ts
git commit -m "feat(cronogramas): implement scheduling utilities with reordering, time calculation and whatsapp formatting"
```

---

### Task 4: Serviço Administrativo (`AdminCronogramaService`) e Testes Unitários

**Files:**
- Create: `frontend/src/app/core/services/admin-cronograma.service.ts`
- Test: `frontend/src/app/core/services/admin-cronograma.service.spec.ts`

**Interfaces:**
- Consumes: `FirebaseService`, `cronograma.models.ts`
- Produces: `AdminCronogramaService` com sinais reativos e CRUD no Firestore

- [ ] **Step 1: Escrever teste unitário de `AdminCronogramaService` (TDD)**

Criar `frontend/src/app/core/services/admin-cronograma.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminCronogramaService } from './admin-cronograma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CronogramaCulto, CronogramaTemplate } from '../models/cronograma.models';

describe('AdminCronogramaService', () => {
  let service: AdminCronogramaService;
  let mockFirebaseService: Partial<FirebaseService>;

  beforeEach(() => {
    mockFirebaseService = {
      firestore: null as any,
    };

    TestBed.configureTestingModule({
      providers: [
        AdminCronogramaService,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    });

    service = TestBed.inject(AdminCronogramaService);
  });

  it('inicializa com sinais reativos e templates nativos', () => {
    expect(service.cronogramas()).toEqual([]);
    expect(service.cronogramaSelecionado()).toBeNull();
    expect(service.templates().length).toBeGreaterThanOrEqual(6);
    expect(service.carregando()).toBe(false);
  });

  it('retorna lista vazia quando firestore está indisponível', async () => {
    await service.carregarCronogramas();
    expect(service.cronogramas()).toEqual([]);
  });

  it('cria novo cronograma a partir de um template', () => {
    const template = service.templates()[0];
    const novo = service.criarNovoCronogramaDeTemplate(template, '2026-09-05');

    expect(novo.data).toBe('2026-09-05');
    expect(novo.titulo).toBe(template.nome);
    expect(novo.tipoCulto).toBe(template.tipoCulto);
    expect(novo.itens.length).toBe(template.itens.length);
    expect(novo.itens[0].id).toBeTruthy();
  });
});
```

- [ ] **Step 2: Executar o teste para verificar falha (TDD)**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/core/services/admin-cronograma.service.spec.ts`
Esperado: FAIL ("Cannot find module './admin-cronograma.service'").

- [ ] **Step 3: Implementar `AdminCronogramaService`**

Criar `frontend/src/app/core/services/admin-cronograma.service.ts`:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import {
  CronogramaCulto,
  CronogramaTemplate,
  TEMPLATES_NATIVOS,
} from '../models/cronograma.models';

@Injectable({ providedIn: 'root' })
export class AdminCronogramaService {
  private readonly firebase = inject(FirebaseService);

  private readonly _cronogramas = signal<readonly CronogramaCulto[]>([]);
  public readonly cronogramas = this._cronogramas.asReadonly();

  private readonly _cronogramaSelecionado = signal<CronogramaCulto | null>(null);
  public readonly cronogramaSelecionado = this._cronogramaSelecionado.asReadonly();

  private readonly _templatesCustomizados = signal<readonly CronogramaTemplate[]>([]);
  public readonly templatesCustomizados = this._templatesCustomizados.asReadonly();

  private readonly _carregando = signal<boolean>(false);
  public readonly carregando = this._carregando.asReadonly();

  public readonly templates = computed<readonly CronogramaTemplate[]>(() => {
    return [...TEMPLATES_NATIVOS, ...this._templatesCustomizados()];
  });

  public selecionarCronograma(cronograma: CronogramaCulto | null): void {
    this._cronogramaSelecionado.set(cronograma);
  }

  public criarNovoCronogramaDeTemplate(
    template: CronogramaTemplate,
    data: string,
  ): CronogramaCulto {
    const agora = new Date().toISOString();
    return {
      id: '',
      data,
      titulo: template.nome,
      tipoCulto: template.tipoCulto,
      observacoesGerais: template.descricao ?? '',
      itens: template.itens.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
        ordem: index,
      })),
      criadoEm: agora,
      atualizadoEm: agora,
    };
  }

  async carregarCronogramas(): Promise<void> {
    if (!this.firebase.firestore) return;
    this._carregando.set(true);
    try {
      const colRef = collection(this.firebase.firestore, 'cronogramas_culto');
      const q = query(colRef, orderBy('data', 'desc'));
      const snap = await getDocs(q);
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CronogramaCulto[];
      this._cronogramas.set(lista);
    } catch {
      this._cronogramas.set([]);
    } finally {
      this._carregando.set(false);
    }
  }

  async carregarTemplatesCustomizados(): Promise<void> {
    if (!this.firebase.firestore) return;
    try {
      const colRef = collection(this.firebase.firestore, 'cronogramas_templates');
      const snap = await getDocs(colRef);
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CronogramaTemplate[];
      this._templatesCustomizados.set(lista);
    } catch {
      this._templatesCustomizados.set([]);
    }
  }

  async salvarCronograma(cronograma: Partial<CronogramaCulto>, id?: string): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    this._carregando.set(true);
    try {
      if (id) {
        const docRef = doc(this.firebase.firestore, 'cronogramas_culto', id);
        await updateDoc(docRef, { ...cronograma, atualizadoEm: new Date().toISOString() });
        await this.carregarCronogramas();
        return id;
      } else {
        const colRef = collection(this.firebase.firestore, 'cronogramas_culto');
        const agora = new Date().toISOString();
        const res = await addDoc(colRef, {
          ...cronograma,
          criadoEm: agora,
          atualizadoEm: agora,
          created_at: serverTimestamp(),
        });
        await this.carregarCronogramas();
        return res.id;
      }
    } finally {
      this._carregando.set(false);
    }
  }

  async excluirCronograma(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    this._carregando.set(true);
    try {
      const docRef = doc(this.firebase.firestore, 'cronogramas_culto', id);
      await deleteDoc(docRef);
      if (this._cronogramaSelecionado()?.id === id) {
        this._cronogramaSelecionado.set(null);
      }
      await this.carregarCronogramas();
    } finally {
      this._carregando.set(false);
    }
  }

  async salvarTemplateCustomizado(template: Omit<CronogramaTemplate, 'id'>): Promise<string> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const colRef = collection(this.firebase.firestore, 'cronogramas_templates');
    const agora = new Date().toISOString();
    const res = await addDoc(colRef, {
      ...template,
      criadoEm: agora,
      isNativo: false,
    });
    await this.carregarTemplatesCustomizados();
    return res.id;
  }

  async excluirTemplateCustomizado(id: string): Promise<void> {
    if (!this.firebase.firestore) throw new Error('Firestore indisponível');
    const docRef = doc(this.firebase.firestore, 'cronogramas_templates', id);
    await deleteDoc(docRef);
    await this.carregarTemplatesCustomizados();
  }
}
```

- [ ] **Step 4: Executar testes do serviço**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/core/services/admin-cronograma.service.spec.ts`
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/core/services/admin-cronograma.service.ts frontend/src/app/core/services/admin-cronograma.service.spec.ts
git commit -m "feat(cronogramas): create AdminCronogramaService with signals and firestore CRUD"
```

---

### Task 5: Componente de Gestão de Cronogramas (`AdminCronogramasTabComponent`)

**Files:**
- Create: `frontend/src/app/features/admin/escalas/components/admin-cronogramas-tab.component.ts`
- Test: `frontend/src/app/features/admin/escalas/components/admin-cronogramas-tab.component.spec.ts`

**Interfaces:**
- Consumes: `AdminCronogramaService`, `cronograma.utils.ts`, `cronograma.models.ts`, `ToastService`
- Produces: `AdminCronogramasTabComponent` com UI completa de liturgia

- [ ] **Step 1: Escrever teste unitário do componente de aba (TDD)**

Criar `frontend/src/app/features/admin/escalas/components/admin-cronogramas-tab.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminCronogramasTabComponent } from './admin-cronogramas-tab.component';
import { AdminCronogramaService } from '../../../../core/services/admin-cronograma.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { TEMPLATES_NATIVOS } from '../../../../core/models/cronograma.models';

describe('AdminCronogramasTabComponent', () => {
  let component: AdminCronogramasTabComponent;
  let fixture: ComponentFixture<AdminCronogramasTabComponent>;
  let mockService: any;
  let mockToast: any;

  beforeEach(async () => {
    mockService = {
      cronogramas: vi.fn().mockReturnValue([]),
      cronogramaSelecionado: vi.fn().mockReturnValue(null),
      templates: vi.fn().mockReturnValue(TEMPLATES_NATIVOS),
      carregando: vi.fn().mockReturnValue(false),
      carregarCronogramas: vi.fn().mockResolvedValue(undefined),
      carregarTemplatesCustomizados: vi.fn().mockResolvedValue(undefined),
      criarNovoCronogramaDeTemplate: vi.fn(),
      salvarCronograma: vi.fn().mockResolvedValue('c1'),
      excluirCronograma: vi.fn().mockResolvedValue(undefined),
      salvarTemplateCustomizado: vi.fn().mockResolvedValue('t1'),
      selecionarCronograma: vi.fn(),
    };

    mockToast = {
      show: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminCronogramasTabComponent],
      providers: [
        { provide: AdminCronogramaService, useValue: mockService },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCronogramasTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cria o componente com sucesso', () => {
    expect(component).toBeTruthy();
  });

  it('exibe botão de criar novo cronograma', () => {
    const btn = fixture.nativeElement.querySelector('button[data-testid="btn-novo-cronograma"]');
    expect(btn).toBeTruthy();
  });
});
```

- [ ] **Step 2: Executar teste para verificar falha (TDD)**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/features/admin/escalas/components/admin-cronogramas-tab.component.spec.ts`
Esperado: FAIL ("Cannot find module './admin-cronogramas-tab.component'").

- [ ] **Step 3: Implementar `AdminCronogramasTabComponent`**

Criar `frontend/src/app/features/admin/escalas/components/admin-cronogramas-tab.component.ts`:
- Gerenciamento de estado com Signals (`cronogramaEditando`, `modalTemplateAberto`, `modalSalvarTemplateAberto`).
- Seleção e aplicação de templates nativos ou customizados.
- Lista reordenável com `▲` e `▼` chamando `reordenarItens()`.
- Cálculo sequencial automático com `calcularHorariosEmSequencia()`.
- Botão "Copiar para WhatsApp" chamando `navigator.clipboard.writeText(formatarCronogramaParaWhatsApp(...))`.
- Salvar no Firestore e feedback com `ToastService`.

- [ ] **Step 4: Executar testes do componente**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/features/admin/escalas/components/admin-cronogramas-tab.component.spec.ts`
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/admin/escalas/components/admin-cronogramas-tab.component.ts frontend/src/app/features/admin/escalas/components/admin-cronogramas-tab.component.spec.ts
git commit -m "feat(admin): build AdminCronogramasTabComponent with template selection, item reordering and export"
```

---

### Task 6: Integrar Abas em `AdminEscalasPage`

**Files:**
- Modify: `frontend/src/app/features/admin/escalas/admin-escalas.page.ts`
- Modify: `frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts`

**Interfaces:**
- Consumes: `AdminEscalasPage`, `AdminCronogramasTabComponent`
- Produces: Rota `/admin/escalas` com abas reativas "Escalas Ministeriais" e "Cronogramas de Culto"

- [ ] **Step 1: Atualizar `admin-escalas.page.spec.ts` para testar alternância de abas**

Adicionar testes:
1. Verifica se a aba inicial é "escalas".
2. Clica na aba "cronogramas" e verifica se o container de cronogramas é exibido.

- [ ] **Step 2: Executar teste para verificar falha (TDD)**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/features/admin/escalas/admin-escalas.page.spec.ts`
Esperado: FAIL (o seletor de abas ainda não foi implementado).

- [ ] **Step 3: Modificar `admin-escalas.page.ts`**

1. Importar `AdminCronogramasTabComponent`.
2. Adicionar sinal: `activeTab = signal<'escalas' | 'cronogramas'>('escalas');`.
3. Inserir barra de navegação por abas no topo da página.
4. Envolver o conteúdo de escalas existente em `@if (activeTab() === 'escalas') { ... } @else { <app-admin-cronogramas-tab /> }`.

- [ ] **Step 4: Executar testes de `AdminEscalasPage`**

Executar: `npm --prefix frontend test -- --watch=false --include=src/app/features/admin/escalas/admin-escalas.page.spec.ts`
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/features/admin/escalas/admin-escalas.page.ts frontend/src/app/features/admin/escalas/admin-escalas.page.spec.ts
git commit -m "feat(admin): integrate worship schedule tabs into AdminEscalasPage"
```

---

### Task 7: Validação Completa de Build, Tipagem e Testes

**Files:**
- Repository-wide

**Interfaces:**
- All features and tests

- [ ] **Step 1: Executar checagem de tipos estática**

Comando: `npx --prefix frontend tsc --noEmit`
Esperado: Zero erros de tipagem.

- [ ] **Step 2: Executar suíte completa de testes unitários**

Comando: `npm --prefix frontend run test:ci`
Esperado: 100% dos testes passando sem falhas.

- [ ] **Step 3: Executar build de produção do Angular**

Comando: `npm --prefix frontend run ng -- build --no-watch`
Esperado: Sucesso no build e geração de bundles.
