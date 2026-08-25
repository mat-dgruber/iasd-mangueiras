# Especificação de Design — Gerador de Versículos & Stories Inteligente

**Data:** 2026-08-25  
**Autor:** Equipe de Engenharia IASD Mangueiras  
**Status:** Aprovado para Planejamento  
**Escopo:** Frontend Angular (Standalone Components, Signals, Canvas 2D, TensorFlow.js)  

---

## 1. Visão Geral & Objetivos

Transformar a aba **"Versículo & Gerador de Stories"** na página de Estudos (`/estudos`) em um estúdio completo de criação, inspiração bíblica e evangelismo digital. A ferramenta combina:
1. **Inteligência Artificial Semântica Local:** Busca por sentimento/necessidade pessoal em linguagem natural (*ex.: "preciso de forças no luto", "ansioso com meu futuro", "gratidão por uma bênção"*) usando o `Universal Sentence Encoder` (TensorFlow.js) já integrado ao projeto.
2. **Imagens Reais & Personalização Visual:** Galeria curada de fotografias em alta resolução (natureza, alvorada, montanhas, céu estrelado, texturas) + gradientes nobres + suporte a upload de fotos do próprio usuário.
3. **Múltiplos Formatos de Mídia Social:** Suporte nativo a **Story (9:16 - 1080×1920)** para Instagram/WhatsApp Status e **Feed Quadrado (1:1 - 1080×1080)** para posts e WhatsApp, com adaptação automática de tipografia.
4. **Automação & Compartilhamento Simplificado:** Versículo do Dia automático calculado deterministicamente por data, botão de "Sortear Promessa", e compartilhamento direto via `navigator.share` (Web Share API) no celular ou download direto em PNG de alta resolução.

---

## 2. Arquitetura de Componentes & Serviços

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EstudosPage (/estudos)                       │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Aba 3: "Versículo & Stories"                 │  │
│  │                                                                  │  │
│  │  ┌────────────────────────┐       ┌───────────────────────────┐  │  │
│  │  │ 1. IA Semântica        │       │ 4. Preview em Tempo Real  │  │  │
│  │  │    (Sentimento/Busca)  │       │    - Frame Celular (9:16) │  │  │
│  │  ├────────────────────────┤       │    - Frame Feed (1:1)     │  │  │
│  │  │ 2. Seleção de Versículo│       │                           │  │  │
│  │  │    - Versículo do Dia  │       │    [ Compartilhar ]       │  │  │
│  │  │    - Categorias/Sorteio│       │    [ Baixar PNG ]         │  │  │
│  │  ├────────────────────────┤       └───────────────────────────┘  │  │
│  │  │ 3. Estúdio Visual      │                                      │  │
│  │  │    - Formato (9:16/1:1)│                                      │  │
│  │  │    - Fotos / Gradientes│                                      │  │
│  │  │    - Upload Próprio    │                                      │  │
│  │  │    - Overlay/Contraste │                                      │  │
│  │  └────────────────────────┘                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │     VerseAiService      │             │      BibleService       │
    │  - TF.js USE Embeddings │             │  - Acervo Curado (60+)  │
    │  - Cosine Similarity    │             │  - Categorias / Tags    │
    │  - Semantic Ranking     │             │  - Busca Externa API    │
    └─────────────────────────┘             └─────────────────────────┘
```

### 2.1 Módulos Principais

1. **`VerseAiService` (`frontend/src/app/core/services/verse-ai.service.ts`):**
   - Serviço Singleton com lazy loading do `@tensorflow/tfjs` e `@tensorflow-models/universal-sentence-encoder`.
   - Inicializa apenas quando o usuário foca ou interage com a busca por sentimento na aba de versículos.
   - Pré-processa ou calcula sob demanda os embeddings dos versículos com tags contextuais (ex: *"ansiedade", "paz", "esperança", "tristeza", "gratidão"*).
   - Retorna os versículos mais relevantes ordenados por pontuação de similaridade de cosseno.

2. **`BibleService` (`frontend/src/app/core/services/bible.service.ts`):**
   - Acervo expandido de versículos curados cobrindo os principais temas cristãos e promessas bíblicas.
   - Função determinística `getDailyVerse(date: Date)` para consistência diária entre visitantes.
   - Categorias: `paz`, `esperanca`, `oracao`, `coragem`, `amor`, `gratidao`, `fe`, `direcao`.

3. **`StoryCanvasService` / Engine de Renderização 2D:**
   - Gera dinamicamente o canvas em 1080×1920 (9:16) ou 1080×1080 (1:1).
   - Algoritmo de `cover` proporcional para desenhar imagens reais sem distorção.
   - Aplicação de camadas: (1) Imagem base / Gradiente, (2) Overlay escuro com opacidade ajustável (50% a 85%), (3) Vinheta perimétrica, (4) Molduras estéticas com cantoneiras, (5) Cabeçalho institucional com marca IASD Mangueiras, (6) Citações e texto com tipografia responsiva e quebra inteligente de linha, (7) Pílula de referência bíblica, (8) Rodapé com link oficial.

---

## 3. Modelos de Dados e Tipos

```typescript
export type StoryFormat = 'story' | 'feed'; // 9:16 (1080x1920) | 1:1 (1080x1080)

export type BackgroundType = 'gradient' | 'photo' | 'custom';

export interface StoryBackground {
  id: string;
  nome: string;
  tipo: BackgroundType;
  // Para gradientes
  bgGradientCss?: string;
  canvasColors?: [string, string, string];
  // Para fotos
  imageUrl?: string;
  thumbnailUrl?: string;
  // Cores de contraste padrão
  primaryTextColor: string;
  accentColor: string;
  defaultOverlayOpacity: number; // 0.3 a 0.8
}

export interface DailyVerse {
  id: string;
  texto: string;
  referencia: string;
  tema: string;
  categoria: 'paz' | 'esperanca' | 'oracao' | 'coragem' | 'amor' | 'gratidao' | 'fe' | 'direcao' | 'geral';
  tagsSemanticas?: string[]; // Palavras-chave de sentimento para matching neural
}

export interface SemanticVerseMatch {
  verse: DailyVerse;
  similarityScore: number;
  matchPercentage: number;
}
```

---

## 4. Galeria de Fundos Visuais & Presets

### 4.1 Presets Fotográficos de Alta Resolução (WebP otimizados)
1. **Alvorada nas Montanhas:** Nascer do sol suave sobre cordilheiras (Tema: Esperança, Fé, Novos Começos).
2. **Céu Noturno Estrelado:** Via Láctea com horizonte sereno (Tema: Paz, Eternidade, Criação).
3. **Floresta & Raios de Sol:** Natureza exuberante com iluminação divina (Tema: Vida, Paz, Descanso).
4. **Pôr do Sol Dourado:** Tons quentes e dourados sobre o mar/campina (Tema: Gratidão, Oração).
5. **Bíblia Aberta & Luz Suave:** Estudo reverente com textura quente (Tema: Sabedoria, Direção, Fé).
6. **Nuvens Celestes:** Céu azul com nuvens volumosas iluminadas (Tema: Coragem, Promessas).

### 4.2 Presets de Gradientes Nobres
1. **Azul Imperial:** Gradiente profundo de azul marinho e dourado.
2. **Dourado & Luz:** Gradiente de âmbar, terracota e ouro.
3. **Verde Esperança:** Esmeralda e verde floresta profundo.
4. **Noite Celestial:** Índigo profundo e violeta escuro.

### 4.3 Suporte a Upload Próprio
- Botão "Usar Minha Foto" permite carregar qualquer imagem do celular/computador.
- Validação client-side de formato (PNG, JPEG, WebP) e tamanho máximo (10MB).
- Pré-visualização instantânea via `FileReader` (`readAsDataURL`).

---

## 5. Especificação de UI/UX & Acessibilidade

1. **Design System & Acessibilidade:**
   - Compatível com os 3 modos de cores (Light, Dark, High-Contrast).
   - Botões e controles com touch target ≥ 44px e anéis de foco `:focus-visible`.
   - Textos sobre imagens com contraste calibrado (mínimo 7.0:1 — WCAG AAA) através de overlay escuro automático.
2. **Preview do Story / Feed:**
   - Visualizador interativo simulando o formato escolhido (moldura de smartphone para 9:16 ou moldura quadrada de post para 1:1).
   - Atualização em tempo real conforme o usuário altera versículo, imagem, formato ou opacidade.
3. **Ações de Exportação:**
   - **Compartilhar (Web Share API):** Converte o canvas para Blob de PNG e invoca `navigator.share({ files: [file], title, text })`. No mobile, abre diretamente a gaveta de apps (WhatsApp, Instagram Stories, Telegram).
   - **Baixar Imagem em Alta Resolução:** Faz download direto do arquivo PNG (`iasd-mangueiras-versiculo-<data>.png`).
   - **Copiar Texto:** Copia a citação bíblica e referência para a área de transferência com feedback em toast.

---

## 6. Tratamento de Erros & Robustez

1. **Fallback do Modelo de IA:** Se o dispositivo não suportar WebGL ou falhar ao carregar o TensorFlow.js, a interface degrada graciosamente para a busca textual clássica e filtros de categoria, sem travar a tela.
2. **Segurança no Canvas (Tainted Canvas):** Todas as imagens pré-configuradas e uploads utilizam origens seguras / data URLs locais para garantir que `canvas.toBlob()` ou `canvas.toDataURL()` nunca sejam bloqueados por restrições de CORS.
3. **SSR Safety:** O carregamento do TensorFlow.js, Canvas e APIs de imagem executa exclusivamente sob verificação de `isPlatformBrowser(this.platformId)`.

---

## 7. Estratégia de Testes

1. **Testes Unitários:**
   - `verse-ai.service.spec.ts`: Inicialização lazy, matching de similaridade cosseno, ordenação correta.
   - `bible.service.spec.ts`: Cobertura de versículo do dia determinístico, filtro por categorias, integridade do acervo.
   - `estudos.page.spec.ts`: Troca de abas, seleção de temas/formatos, chamada de exportação, manipulação de upload.
2. **Checagem Estática:** `npx tsc --noEmit` 100% limpo sem erros de tipagem.
