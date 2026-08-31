# Design Doc: Componente Standalone DateTimePicker e Padronização nos Formulários

**Data:** 2026-08-31  
**Status:** Aprovado para Implementação  
**Autor:** OpenClaude / Matheus Diniz  
**Módulo:** `src/app/shared/ui/datetime-picker/` & `src/app/features/admin/horarios/`

---

## 1. Contexto e Motivação

Atualmente, o formulário de Avisos de Horário Especial em `admin-horarios.page.ts` utiliza campos heterogêneos para entrada de datas:
- `data_evento`: Campo de texto livre (`<input type="text" placeholder="Ex: 31/12 às 20h" />`).
- `expira_em`: Campo de data nativo (`<input type="date" />`).

Essa discrepância gera inconsistência na experiência do usuário, dificulta a ordenação e filtros de expiração no backend/Firestore e não fornece um seletor visual interativo e consistente para data e hora.

O objetivo é criar o componente corporativo **`DateTimePickerComponent`** (`app-ui-datetime-picker`) como componente standalone reativo em Angular 21, estilizado com Tailwind CSS e tokens do Design System Adventista, integrando tanto com formulários reativos (`ControlValueAccessor`) quanto com Signals (`model<string>()`), e aplicá-lo nos campos de data e horário dos formulários administrativos.

---

## 2. Requisitos e Escopo

### 2.1. Requisitos Funcionais
1. **Seleção de Data e Hora:**
   - Calendário visual com visualização mensal, navegação entre meses (`‹ ›`), seleção rápida de meses e grade de décadas (12 anos).
   - Seletor de horário com campos de Hora (`00-23`) e Minuto (`00-59`), com incrementadores/decrementadores (`▲/▼`) e botão de atalho **"Agora"**.
   - Atalho rápido **"Hoje"** para ir diretamente à data atual.
   - Botão **"Concluir"** para confirmar a seleção e fechar o popover.
   - Botão **"Limpar"** (`X`) direto no campo de entrada para remoção rápida do valor.
2. **Modo Opcional sem Horário (`[comHorario]="false"`):**
   - Suporte para campos estritamente de data pura (`YYYY-MM-DD` / `DD/MM/AAAA`).
3. **Formato Híbrido de Dados:**
   - **Persistência / Modelo:** Formato ISO padrão (`YYYY-MM-DDTHH:mm:ss` ou `YYYY-MM-DD`).
   - **Exibição Visual:** Formatação em Português do Brasil (`DD/MM/AAAA às HH:mm` ou `DD/MM/AAAA`).
   - **Compatibilidade Retroativa:** Tolerância a valores legados pré-existentes no Firestore / JSON.
4. **Integração com Formulários:**
   - Implementação de `ControlValueAccessor` (`NG_VALUE_ACCESSOR`) para uso nativo com `formControlName` e `[formControl]`.
   - Suporte nativo a Two-Way binding via Signals (`[(value)]="minhaData"`).
   - Propagação correta de estados `touched`, `dirty` e `disabled`.

### 2.2. Requisitos Não Funcionais & Acessibilidade (WCAG 2.2 AA)
1. **Acessibilidade:**
   - Alvos de toque (touch targets) ≥ 44px de altura.
   - Foco visível com `focus-visible:ring-2` e `focus-visible:ring-advent-blue`.
   - Fechamento com a tecla `Escape` e clique externo.
   - Semântica ARIA (`aria-expanded`, `aria-haspopup="dialog"`, `role="dialog"`).
2. **Multi-Tema:** Suporte a Tema Claro, Escuro e Alto Contraste via Tailwind CSS.
3. **Zero Dependências Externas:** Construção in-house sem bibliotecas pesadas de terceiros.

---

## 3. Arquitetura Técnica do Componente

### 3.1. Assinatura e Metadados do Componente
```typescript
@Component({
  selector: 'app-ui-datetime-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class DateTimePickerComponent implements ControlValueAccessor {
  // Inputs
  readonly label = input<string>('');
  readonly placeholder = input<string>('Selecione a data...');
  readonly comHorario = input<boolean>(true);
  readonly minDate = input<string | null>(null);
  readonly maxDate = input<string | null>(null);
  readonly disabledInput = input<boolean>(false, { alias: 'disabled' });

  // Two-way Model Signal
  readonly value = model<string>('');

  // Internal Reactive Signals
  readonly isOpen = signal<boolean>(false);
  readonly selectedDate = signal<Date | null>(null);
  readonly currentViewMonth = signal<number>(new Date().getMonth());
  readonly currentViewYear = signal<number>(new Date().getFullYear());
  readonly selectedHour = signal<number>(0);
  readonly selectedMinute = signal<number>(0);
  readonly viewMode = signal<'days' | 'months' | 'years'>('days');
  readonly baseDecadeYear = signal<number>(Math.floor(new Date().getFullYear() / 12) * 12);
  readonly isControlDisabled = signal<boolean>(false);

  // Computed Properties
  readonly displayValue = computed(() => { ... });
  readonly isDisabled = computed(() => this.disabledInput() || this.isControlDisabled());
  readonly calendarDays = computed(() => { ... });
  readonly monthsList = [...]
  readonly yearsGrid = computed(() => { ... });
}
```

### 3.2. Fluxo de Dados e Reatividade
1. **Entrada de Valor (`writeValue`):** Converte a string ISO (`2026-12-31T20:00:00`) ou string de data em objeto `Date` e alimenta os signals de dia, mês, ano, hora e minuto.
2. **Seleção de Dia:** Atualiza `selectedDate()`. Caso `comHorario` seja falso, confirma o valor e fecha o popover. Caso seja verdadeiro, mantém o popover aberto para ajuste do horário.
3. **Ajuste de Horário:** Atualiza `selectedHour()` e `selectedMinute()`.
4. **Confirmação:** Monta a string ISO, emite via `onChange()` / `value.set(isoString)` e dispara `onTouched()`.

---

## 4. Plano de Integração e Telas Afetadas

### 4.1. `src/app/features/admin/horarios/admin-horarios.page.ts`
- Importar `DateTimePickerComponent`.
- No template do modal de Avisos Especiais (`isAvisoModalOpen`), substituir os inputs manuais de `data_evento` e `expira_em` por:
  ```html
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <app-ui-datetime-picker
      formControlName="data_evento"
      [label]="'Data / Ocasional'"
      [placeholder]="'Selecione a data e hora do evento...'"
      [comHorario]="true"
    />

    <app-ui-datetime-picker
      formControlName="expira_em"
      [label]="'Expira em'"
      [placeholder]="'Selecione a data e hora de expiração...'"
      [comHorario]="true"
    />
  </div>
  ```
- Atualizar a exibição da lista de avisos para formatar datas ISO com helper amigável (`formatDisplayDate`).

### 4.2. `src/app/features/horarios/horarios.page.ts` (Página Pública)
- Adicionar helper de formatação amigável para renderizar `data_evento` caso venha no padrão ISO (ex: `2026-12-31T20:00:00` → `31/12/2026 às 20:00`), mantendo compatibilidade com strings puras legadas.

---

## 5. Estratégia de Testes Automatizados

1. **`datetime-picker.component.spec.ts`:**
   - Renderização inicial com valores padrão e vazios.
   - Sincronização via `ControlValueAccessor` (`writeValue` e propagação de `onChange`).
   - Abertura e fechamento do popover (clique, `Escape`, clique externo).
   - Navegação entre meses, seleção de dia com persistência e *clamping*.
   - Incremento e alteração de horas e minutos.
   - Botões de atalho **"Hoje"** e **"Limpar"**.
2. **`admin-horarios.page.spec.ts`:**
   - Validação da integração dos controles do formulário com os novos pickers.
3. **Verificação de Build e Tipos:**
   - Execução de `npm run build` e `npx tsc --noEmit` sem erros.

---

## 6. Critérios de Aceite

- [x] O componente `DateTimePickerComponent` está implementado em `src/app/shared/ui/datetime-picker/`.
- [x] Suporta seleção de data e hora com interface intuitiva, rápida e acessível.
- [x] Integra transparentemente com formulários reativos (`ControlValueAccessor`) e Signals (`model()`).
- [x] Substitui com sucesso os campos `data_evento` e `expira_em` no modal de avisos de `admin-horarios.page.ts`.
- [x] Exibe datas formatadas tanto no admin quanto na página pública sem quebras de dados legados.
- [x] Suíte de testes unitários criada e passando com 100% de sucesso.
