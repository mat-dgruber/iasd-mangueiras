<!-- 
=================================================================================
LOG DE MANUTENÇÃO E ALTERAÇÕES DO DOCUMENTO
=================================================================================
Data       | Autor          | Descrição da Alteração
-----------|----------------|--------------------------------------------------
2026-08-19 | OpenClaude     | Documentação técnica completa do DatepickerComponent com melhorias de UX
=================================================================================
-->

# Guia Oficial do Componente: DatepickerComponent

**Domínio:** `src/app/shared/components/datepicker/`  
**Framework:** Angular v21 (Standalone + Signals) + Tailwind CSS v4.3  
**Status:** Produção / DX Aprovado  

---

## 1. Visão Geral

O **`DatepickerComponent`** é o componente corporativo unificado de seleção de datas e horários do **meuCPB**. Ele foi projetado sob os princípios de simplicidade, alta acessibilidade e excelente performance, utilizando reatividade puramente nativa baseada em Angular Signals (`model()`, `signal()`, `computed()`, `effect()`).

### Principais Funcionalidades & Otimizações:
- 📅 **Seleção em Grade de Décadas (4x3):** Substituição de dropdowns `<select>` HTML gigantes por uma navegação elegante em blocos de 12 anos que se ajusta a qualquer tela.
- 🔄 **Persistência Reativa do Dia Selecionado:** Ao navegar entre meses (`‹ ›`) ou selecionar um novo ano, o dia ativo permanece selecionado (com *clamping* automático para o último dia válido em meses curtos, ex: 31 de Jan → 28 de Fev).
- 🎯 **Indicador Visual de "Hoje":** Marcador sutil sob o dia atual do calendário para localização temporal imediata.
- ⏱️ **Modo de Horário Opcional (`[comHorario]="false"`):** Suporte tanto para campos puramente de data (ex: Data de Nascimento no Perfil/Cadastro) quanto campos de agendamento completo (ex: Mensageria e Votações).
- 📐 **Posicionamento Inteligente:** Detecção dinâmica da viewport (abertura para cima se o espaço inferior for `< 340px`).
- ⌨️ **Acessibilidade Completa:** Fechamento com a tecla `Escape`, controle de clique externo e atributos `aria-*`.

---

## 2. API do Componente (Inputs & Models)

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :---: | :---: | :--- |
| `value` | `ModelSignal<string>` | `''` | Modelo Two-Way para a data no formato ISO (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:MM:SS`). |
| `comHorario` | `InputSignal<boolean>` | `true` | Habilita os inputs numéricos de horas (`00-23`) e minutos (`00-59`). |
| `placeholder` | `InputSignal<string>` | `'Selecione uma data...'` | Texto exibido quando nenhum valor estiver selecionado. |

---

## 3. Exemplos Práticos de Uso

### 3.1. Seleção de Data Pura (Perfil e Formulários de Cadastro)
```html
<app-datepicker
  [(value)]="editDataNascimento"
  [comHorario]="false"
  [placeholder]="'Selecione sua data de nascimento...'"
></app-datepicker>
```

### 3.2. Seleção de Data e Hora Limite (Mensageria / Agendamento)
```html
<app-datepicker
  [(value)]="campanhaDataLimite"
  [comHorario]="true"
  [placeholder]="'Selecione a data e hora limite...'"
></app-datepicker>
```

---

## 4. Arquitetura Interna & Estrutura de Seções (`MARK:`)

O arquivo TypeScript (`datepicker.ts`) está estruturado rigorosamente em divisores lógicos:

```
// MARK: - Imports & Dependencies
// MARK: - Component Definition & Metadata
// MARK: - Injected Dependencies
// MARK: - Inputs & Two-Way Model Signals
// MARK: - Reactive Internal State (Signals)
// MARK: - Constants & Calendário Data
// MARK: - Computed Signals & Performance
// MARK: - Lifecycle & Sincronização Reativa
// MARK: - Métodos de Controle do Popover e Posicionamento
// MARK: - Parsing, Validação e Utilitários de Data
// MARK: - Métodos de Seleção, Persistência e Clamping
// MARK: - Manipulação de Horário & Formatação
// MARK: - Listeners Globais & Acessibilidade
```

---

## 5. Algoritmos Chave

### 5.1. Clamping e Persistência de Data (`atualizarDataComPreservacao`)
```typescript
atualizarDataComPreservacao(novoMes?: number, novoAno?: number): void {
  const ano = novoAno ?? this.datepickerAno();
  const mes = novoMes ?? this.datepickerMes();

  this.datepickerAno.set(ano);
  this.datepickerMes.set(mes);
  this.anoBaseDecada.set(Math.floor(ano / 12) * 12);

  const dataAtual = this.datepickerDataSelecionada();
  if (dataAtual) {
    const diaOriginal = dataAtual.getDate();
    const maxDiasNoNovoMes = new Date(ano, mes + 1, 0).getDate();
    const diaAjustado = Math.min(diaOriginal, maxDiasNoNovoMes);

    const novaData = new Date(ano, mes, diaAjustado);
    this.datepickerDataSelecionada.set(novaData);
    this.atualizarValorDataLimite();
  }
}
```

---

## 6. Conformidade e Segurança (Zero-Trust)
- **Sanitização de Entrada:** Inputs de horário limitados numericamente a dígitos válidos (`\D` filtrado, hora `0-23`, minuto `0-59`).
- **Prevenção XSS:** Todo texto e valores são renderizados exclusivamente via interpolação de dados nativa do Angular, sem manipulação insegura de DOM (`innerHTML`).
- **Conformidade de Build:** 100% aprovado pelo `npm run build` e `npm run security-audit`.
