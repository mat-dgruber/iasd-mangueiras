# Design Doc: Gestão de Cronogramas e Liturgia do Culto no Painel Admin

- **Data:** 2026-09-02
- **Status:** Aprovado
- **Autor:** IASD Mangueiras Core Team

---

## 1. Contexto e Motivação

Além das escalas de voluntários por departamento (diaconato, recepção, sonoplastia, etc.), a liderança e equipe pastoral da IASD Mangueiras necessitam planejar a ordem e a liturgia de cada serviço de culto (horários detalhados, sequência de quadros, responsáveis e descrições/notas de palco).

Para manter a gestão unificada e de fácil acesso pelos administradores, essa funcionalidade será integrada diretamente à tela administrativa `/admin/escalas` através de um sistema de abas alternáveis ("Escalas Ministeriais" e "Cronogramas de Culto").

A funcionalidade incluirá templates nativos com a liturgia padrão da Igreja Adventista do Sétimo Dia, suporte a criação e salvamento de novos modelos personalizados, reordenação sequencial de itens e exportação pronta para WhatsApp.

---

## 2. Decisões Arquiteturais

1. **Localização e Navegação:**
   - Tela única `/admin/escalas` com seletor de abas reativo (`signal<'escalas' | 'cronogramas'>('escalas')`).
   - Rota e dados protegidos por autenticação de administrador (`authGuard` no frontend e `isAdmin()` no Firestore).

2. **Modelagem de Dados Independente no Firestore:**
   - Coleção `cronogramas_culto`: armazena os cronogramas específicos de cultos por data.
   - Coleção `cronogramas_templates`: armazena os modelos customizados criados pelos usuários, coexistindo com os modelos nativos pré-configurados no cliente.

3. **Reordenação e Interação Fluida:**
   - Reordenação sequencial de blocos com botões de subir e descer (`▲` / `▼`) e inserção direta em qualquer ponto da lista.
   - Cálculo automático ou manual de horários com base no horário inicial do culto e tempo estimado de cada momento.

4. **Templates Nativos Integrados:**
   - Seis modelos padrão pré-embarcados:
     1. Sábado de Manhã (Escola Sabatina + Culto Divino)
     2. Domingo à Noite (Culto Evangelístico)
     3. Quarta-feira (Culto de Oração)
     4. Culto Jovem (JA)
     5. Santa Ceia (Comunhão e Lava-pés)
     6. Batismo
   - Opção para iniciar do zero (em branco) e salvar qualquer cronograma editado como um novo modelo customizado.

5. **Compartilhamento Ágil:**
   - Gerador de mensagem formatada para WhatsApp e área de transferência com horários, títulos, nomes e observações.

---

## 3. Especificação Técnica e Modelos de Dados

### 3.1 Interfaces TypeScript

```typescript
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
  data: string;
  titulo: string;
  tipoCulto: 'sabado_manha' | 'domingo_noite' | 'quarta_oracao' | 'culto_ja' | 'santa_ceia' | 'batismo' | 'personalizado';
  itens: CronogramaItem[];
  observacoesGerais?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CronogramaTemplate {
  id: string;
  nome: string;
  descricao?: string;
  tipoCulto: CronogramaCulto['tipoCulto'];
  itens: Omit<CronogramaItem, 'id'>[];
  criadoEm: string;
  isNativo?: boolean;
}
```

### 3.2 Regras de Segurança no Firestore (`firestore.rules`)

```rules
    match /cronogramas_culto/{document} {
      allow read, write: if isAdmin();
    }
    match /cronogramas_templates/{document} {
      allow read, write: if isAdmin();
    }
```

### 3.3 Serviço Administrativo (`AdminCronogramaService`)

Arquivo: `frontend/src/app/core/services/admin-cronograma.service.ts`

- **Sinais Reativos:**
  - `cronogramas = signal<readonly CronogramaCulto[]>([])`
  - `cronogramaSelecionado = signal<CronogramaCulto | null>(null)`
  - `templatesCustomizados = signal<readonly CronogramaTemplate[]>([])`
  - `carregando = signal<boolean>(false)`
  - `templates = computed(() => [...TEMPLATES_NATIVOS, ...this.templatesCustomizados()])`

- **Operações Principais:**
  - `carregarCronogramas(): Promise<void>`
  - `carregarCronogramaPorData(data: string): Promise<CronogramaCulto | null>`
  - `salvarCronograma(cronograma: CronogramaCulto): Promise<void>`
  - `excluirCronograma(id: string): Promise<void>`
  - `salvarTemplateCustomizado(template: CronogramaTemplate): Promise<void>`
  - `excluirTemplateCustomizado(id: string): Promise<void>`

### 3.4 Utilitários de Cronograma (`cronograma.utils.ts`)

Arquivo: `frontend/src/app/core/utils/cronograma.utils.ts`

- `reordenarItens(itens: CronogramaItem[], indexOrigem: number, direcao: 'up' | 'down'): CronogramaItem[]`
- `calcularHorariosEmSequencia(horarioInicial: string, itens: CronogramaItem[]): CronogramaItem[]`
- `formatarCronogramaParaWhatsApp(cronograma: CronogramaCulto): string`

---

## 4. UI e Experiência do Usuário

### 4.1 Abas em `AdminEscalasPage`

- Barra de abas com estilo Adventista (azul `#002f6c`, dourado `#d4af37`, bordas suaves):
  - `[ Escalas de Voluntários ]`
  - `[ Cronogramas de Culto ]`

### 4.2 Painel de Cronogramas

- Seletor de data e lista de cultos cadastrados com badges de tipo de culto.
- Seção de edição com campos rápidos para adicionar novos blocos com horário, quadro, responsável e detalhes.
- Modais acessíveis:
  - "Novo Cronograma a partir de Template": seleção entre os 6 nativos ou modelos personalizados salvos.
  - "Salvar como Modelo": nome e descrição do modelo customizado.
- Botão "Copiar para WhatsApp" com feedback visual tátil (toast/banner "Copiado com sucesso!").

---

## 5. Plano de Testes e Validação

1. **Testes Unitários:**
   - `admin-cronograma.service.spec.ts`: Testar carregamento, salvamento, exclusão e computação de templates nativos e customizados.
   - `cronograma.utils.spec.ts`: Testar lógica de reordenação (`up`/`down`), cálculo de horários em cascata e geração do texto do WhatsApp.
   - `admin-escalas.page.spec.ts`: Testar alternância de abas, renderização dos blocos e ações de criação/edição.
2. **Build e Tipagem:**
   - `npx tsc --noEmit` sem nenhum erro de tipo.
   - `npm run test:ci` com 100% de aprovação.
