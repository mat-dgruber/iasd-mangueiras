---
name: animacao
description: "Hub unificado de Design e Animação do Claude Code. Disparado automaticamente sempre que o usuário mencionar 'animação', 'animar', 'motion', 'transição', 'micro-interações', 'efeitos visuais', '3D' ou quando usar o comando /animacao. Identifica o objetivo e orquestra o melhor conjunto de skills: motion-design (regras Disney, timing, easing), cast/genjutsu (creative coding e wow-factor), gsap-* (timelines e scroll), threejs-* (3D e WebGL) e design-dna (estilo e tokens visuais)."
---

# Hub Central de Design & Animação

Este hub centraliza e direciona automaticamente qualquer solicitação de animação ou design interativo para o conjunto ideal de ferramentas:

## Matriz de Roteamento de Skills:

1. **Princípios, Timing, Curvas e Micro-interações UI**:
   - **Skill**: `motion-design` (`~/.claude/skills/motion-design/SKILL.md`)
   - **Quando usar**: Regras de timing, curvas de easing, coreografia de elementos, feedback em botões, modais, transições de tela e princípios Disney adaptados para UI.

2. **Creative Coding, Efeito Wow & Ilusões Visuais (Genjutsu)**:
   - **Skills**: `cast` (efeito wow, parallax, micro-interações vivas), `paint` (direção de arte), `bunshin` (pipeline completo).
   - **Quando usar**: Elevar uma UI básica para um nível extraordinário ("anti-AI-slop"), animações expressivas e fluidas.

3. **Animações Web Complexas, Timelines e Scroll**:
   - **Skills**: `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-react`, `gsap-plugins`, `gsap-frameworks`
   - **Quando usar**: Efeitos guiados por scroll (ScrollTrigger), sequências cronometradas complexas, controle fino de timeline e SVG animation.

4. **3D, Canvas, Shaders e WebGL**:
   - **Skills**: `threejs-fundamentals`, `threejs-animation`, `threejs-shaders`, `threejs-geometry`, `threejs-materials`, etc.
   - **Quando usar**: Ambientes tridimensionais, shaders GLSL, partículas, modelos 3D interativos no navegador.

5. **Extração de DNA Visual & Design System**:
   - **Skill**: `design-dna` (`~/.claude/skills/design-dna/SKILL.md`)
   - **Quando usar**: Analisar referências visuais/screenshots e extrair tokens, estilo e efeitos visuais estruturados.
