#!/usr/bin/env python3
"""
AI Guides - Plan & Spec Stress-Test Auditor (plan_critic.py)
Analisa estaticamente planos de implementação e especificações (docs/ai/plans/, docs/ai/specs/)
sob as 7 lentes críticas de engenharia, avalia conformidade com os guias normativos
da Casa Publicadora Brasileira, calcula o Risk Score e gera a sabatina socrática.
"""

import argparse
import json
import re
import sys
from pathlib import Path


class PlanCriticAuditor:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content = ""
        self.artifact_type = "TECHNICAL_PLAN"
        self.findings = []
        self.score_penalties = 0
        self.detected_sections = {}
        self.compliance_checks = {}

    def load_content(self):
        try:
            self.content = self.file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            self.content = self.file_path.read_text(encoding="latin-1")

    def detect_artifact_type(self):
        content_lower = self.content.lower()
        product_indicators = [
            "prd", "product spec", "especificação de produto", "user stories",
            "histórias de usuário", "persona", "north star", "aarrr", "bdd",
            "given/when/then", "daci", "job to be done", "jtbd"
        ]
        product_count = sum(1 for ind in product_indicators if ind in content_lower)

        technical_indicators = [
            "plano de implementação", "implementation plan", "migração", "schema",
            "tabela", "endpoint", "api", "arquitetura", "rollback", "refatoração",
            "blast radius", "ci/cd", "script", "database", "sql"
        ]
        technical_count = sum(1 for ind in technical_indicators if ind in content_lower)

        if product_count > technical_count and "spec" in str(self.file_path).lower():
            self.artifact_type = "PRODUCT_SPEC"
        else:
            self.artifact_type = "TECHNICAL_PLAN"

    def audit_sections(self):
        content_lower = self.content.lower()

        # 1. Objetivo / O que está construindo
        has_goal = bool(re.search(r"(#+\s*(1\.|visão geral|objetivo|contexto|problema|escopo|motivação))", content_lower))
        self.detected_sections["goal_and_context"] = has_goal
        if not has_goal:
            self.findings.append({
                "lense": "Navalha de Ockham & Escopo",
                "severity": "HIGH",
                "message": "Falta definição clara do objetivo central e motivação do que está sendo construído.",
                "penalty": 20
            })

        # 2. Restrições Técnicas / Negócio
        has_constraints = bool(re.search(r"(restriç|constraint|limitaç|premissa|não-funcional)", content_lower))
        self.detected_sections["constraints"] = has_constraints
        if not has_constraints:
            self.findings.append({
                "lense": "Restrições & Limites",
                "severity": "MEDIUM",
                "message": "Nenhuma seção explícita de restrições (prazos, latência, concorrência, infraestrutura).",
                "penalty": 15
            })

        # 3. Casos de Borda & Invariantes
        has_edge_cases = bool(re.search(r"(borda|edge case|invariante|concorr|timeout|anômal|idempot|exceç|corner case)", content_lower))
        self.detected_sections["edge_cases"] = has_edge_cases
        if not has_edge_cases:
            self.findings.append({
                "lense": "Casos de Borda & Invariantes",
                "severity": "HIGH",
                "message": "Ausência de mapeamento de casos de borda (falhas parciais, condições de corrida, dados inválidos).",
                "penalty": 20
            })

        # 4. Modos de Falha & Pre-Mortem (Onde pode falhar)
        has_failure_modes = bool(re.search(r"(falh|pre-mortem|risco|blast radius|single point of failure|ponto único|incident)", content_lower))
        self.detected_sections["failure_modes"] = has_failure_modes
        if not has_failure_modes:
            self.findings.append({
                "lense": "Pre-Mortem & Blast Radius",
                "severity": "HIGH",
                "message": "Não há análise de modos de falha (Pre-Mortem) ou cálculo do blast radius do impacto.",
                "penalty": 20
            })

        # 5. Alternativas Exploradas
        has_alternatives = bool(re.search(r"(alternativ|opç|abordagem a|abordagem b|trade-off|tradeoff|comparativo)", content_lower))
        self.detected_sections["alternatives"] = has_alternatives
        if not has_alternatives:
            self.findings.append({
                "lense": "Matriz de Alternativas",
                "severity": "MEDIUM",
                "message": "O plano apresenta apenas uma única solução, sem contrastar alternativas lean ou robustas.",
                "penalty": 15
            })

        # 6. Reversibilidade & Rollback
        if self.artifact_type == "TECHNICAL_PLAN":
            has_rollback = bool(re.search(r"(rollback|revers|desfazer|plano de conting|fallback)", content_lower))
            self.detected_sections["rollback"] = has_rollback
            if not has_rollback:
                self.findings.append({
                    "lense": "Viabilidade & Rollback",
                    "severity": "CRITICAL",
                    "message": "Procedimento de rollback ou contingência ausente para deployment ou migração técnica.",
                    "penalty": 25
                })
        else:
            has_rollback = bool(re.search(r"(risco|mitigaç|conting|descarte)", content_lower))
            self.detected_sections["rollback"] = has_rollback

        # 7. Testabilidade & Critérios de Verificação
        has_tests = bool(re.search(r"(teste|test|verific|critério de aceit|dod|definition of done|cenário|bdd|gherkin)", content_lower))
        self.detected_sections["testing"] = has_tests
        if not has_tests:
            self.findings.append({
                "lense": "Testabilidade & Verificação",
                "severity": "HIGH",
                "message": "Estratégia de testes ou critérios de aceite mensuráveis não documentados.",
                "penalty": 20
            })

    def audit_guide_compliance(self):
        content_lower = self.content.lower()

        # 1. Harness & docs/ai/ path
        mentions_docs_ai = bool(re.search(r"docs/ai/(plans|specs|reports|sessions|chats)", content_lower))
        self.compliance_checks["harness_docs_ai"] = mentions_docs_ai
        if not mentions_docs_ai:
            self.findings.append({
                "lense": "Conformidade Normativa: Harness",
                "severity": "LOW",
                "message": "O plano não cita o padrão canônico de artefatos em docs/ai/ (plans, specs, reports).",
                "penalty": 5
            })

        # 2. Segurança Zero-Trust
        mentions_security = bool(re.search(r"(seguran|zero-trust|autentic|autoriz|jwt|sanitiz|validaç|secret|owasp|permiss)", content_lower))
        self.compliance_checks["zero_trust_security"] = mentions_security
        if not mentions_security and self.artifact_type == "TECHNICAL_PLAN":
            self.findings.append({
                "lense": "Conformidade Normativa: Zero-Trust",
                "severity": "MEDIUM",
                "message": "Nenhuma menção a validação defensiva de entrada, autorização ou proteção de dados.",
                "penalty": 10
            })

        # 3. Governança de ADRs
        mentions_adr = bool(re.search(r"(adr|architecture decision|decisão de arquitetura|docs/adrs?)", content_lower))
        self.compliance_checks["adr_governance"] = mentions_adr
        if not mentions_adr and self.artifact_type == "TECHNICAL_PLAN":
            self.findings.append({
                "lense": "Conformidade Normativa: ADRs",
                "severity": "LOW",
                "message": "Nenhum vínculo ou avaliação sobre necessidade de emissão de ADR para a mudança.",
                "penalty": 5
            })

    def calculate_score(self):
        total_penalty = sum(f["penalty"] for f in self.findings)
        # Pontuação de Risco: 0 = perfeito, 100 = risco máximo
        self.risk_score = min(100, total_penalty)

        if self.risk_score <= 25:
            self.risk_level = "BAIXO (Plano Robusto & Seguro)"
            self.badge = "🟢"
        elif self.risk_score <= 55:
            self.risk_level = "MODERADO (Requer Blindagem Pontual)"
            self.badge = "🟡"
        else:
            self.risk_level = "CRÍTICO (Inseguro para Implementar)"
            self.badge = "🔴"

    def generate_socratic_questions(self):
        questions = []

        # Pergunta 1: Escopo e Alternativas
        if not self.detected_sections.get("alternatives", False):
            questions.append({
                "topic": "Exploração de Alternativas & Ockham",
                "question": "Quais são duas ou três formas possíveis de resolver isso além desta abordagem? Qual delas você escolheria e por quê?",
                "why": "Evitar apego à primeira solução pensada e eliminar complexidade desnecessária."
            })
        else:
            questions.append({
                "topic": "Defesa de Trade-off",
                "question": "Por que a abordagem selecionada é superior a uma alternativa lean (menor código) ou a uma abordagem corporativa já pronta?",
                "why": "Garantir clareza nos trade-offs assumidos."
            })

        # Pergunta 2: Casos de Borda e Falhas
        if not self.detected_sections.get("edge_cases", False) or not self.detected_sections.get("failure_modes", False):
            questions.append({
                "topic": "Pre-Mortem & Modos de Falha",
                "question": "Assuma que este deployment quebrou em produção às 3h da manhã. O que causou o incidente, o que você deixou passar e quais são os casos de borda não tratados?",
                "why": "Identificar pontos únicos de falha e condições de corrida antes do commit."
            })
        else:
            questions.append({
                "topic": "Resiliência & Invariantes",
                "question": "O que acontece na condição de corrida mais extrema ou sob falha parcial de dependências downstream?",
                "why": "Validar comportamento assíncrono e isolamento de falhas."
            })

        # Pergunta 3: Rollback e Verificação
        if not self.detected_sections.get("rollback", False):
            questions.append({
                "topic": "Reversibilidade & Rollback",
                "question": "Se a implementação falhar no meio do processo ou corromper dados, qual é o procedimento exato de rollback sem causar downtime prolongado?",
                "why": "Garantir que toda alteração seja estritamente reversível."
            })
        else:
            questions.append({
                "topic": "Testabilidade & Evidências",
                "question": "Como você provará que o plano funciona antes de liberar para o usuário final, e quais métricas indicarão sucesso?",
                "why": "Assegurar critérios objetivos de aceite na pirâmide de testes."
            })

        return questions[:3]

    def audit(self):
        self.load_content()
        self.detect_artifact_type()
        self.audit_sections()
        self.audit_guide_compliance()
        self.calculate_score()
        self.questions = self.generate_socratic_questions()

    def to_dict(self):
        return {
            "file": str(self.file_path),
            "artifact_type": self.artifact_type,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "sections_detected": self.detected_sections,
            "compliance_checks": self.compliance_checks,
            "findings_count": len(self.findings),
            "findings": self.findings,
            "socratic_questions": self.questions
        }

    def to_markdown(self):
        md = []
        md.append(f"## 🛡️ Auditoria de Estresse de Plano: `/plan-criticize`\n")
        md.append(f"- **Artefato Avaliado:** `{self.file_path.name}`")
        md.append(f"- **Tipo de Artefato:** `{self.artifact_type}`")
        md.append(f"- **Risk Score:** **{self.risk_score}/100** — {self.badge} **{self.risk_level}**\n")

        md.append("### 🔍 Radar das 7 Lentes Críticas\n")
        md.append("| Lente de Auditoria | Status | Observação |")
        md.append("|---|:---:|---|")
        md.append(f"| 1. Objetivo & Escopo Core | {'✅ Presente' if self.detected_sections.get('goal_and_context') else '❌ Ausente'} | {'Definido' if self.detected_sections.get('goal_and_context') else 'Falta clareza do problema'} |")
        md.append(f"| 2. Restrições Técnicas | {'✅ Presente' if self.detected_sections.get('constraints') else '⚠️ Ausente'} | {'Mapeadas' if self.detected_sections.get('constraints') else 'Sem restrições declaradas'} |")
        md.append(f"| 3. Casos de Borda & Invariantes | {'✅ Presente' if self.detected_sections.get('edge_cases') else '❌ Ausente'} | {'Mapeados' if self.detected_sections.get('edge_cases') else 'Risco de falhas em concorrência/dados'} |")
        md.append(f"| 4. Pre-Mortem & Modos de Falha | {'✅ Presente' if self.detected_sections.get('failure_modes') else '❌ Ausente'} | {'Analisados' if self.detected_sections.get('failure_modes') else 'Pontos de falha não identificados'} |")
        md.append(f"| 5. Matriz de Alternativas | {'✅ Presente' if self.detected_sections.get('alternatives') else '⚠️ Ausente'} | {'Opções contrastadas' if self.detected_sections.get('alternatives') else 'Solução única apresentada'} |")
        md.append(f"| 6. Reversibilidade & Rollback | {'✅ Presente' if self.detected_sections.get('rollback') else '❌ Ausente'} | {'Plano de reversão pronto' if self.detected_sections.get('rollback') else 'Risco alto: sem rollback'} |")
        md.append(f"| 7. Testabilidade & Critérios | {'✅ Presente' if self.detected_sections.get('testing') else '❌ Ausente'} | {'Estratégia declarada' if self.detected_sections.get('testing') else 'Faltam critérios de aceite mensuráveis'} |\n")

        md.append("### 🏛️ Conformidade com Guias Normativos da CPB\n")
        md.append(f"- **Padrão de Artefatos (`docs/ai/`):** {'✅ Conforme' if self.compliance_checks.get('harness_docs_ai') else '⚠️ Não citado no documento'}")
        md.append(f"- **Segurança Defensiva Zero-Trust:** {'✅ Coberto' if self.compliance_checks.get('zero_trust_security') else '⚠️ Nenhuma menção a validação de borda/segredos'}")
        md.append(f"- **Governança de ADRs:** {'✅ Mencionada' if self.compliance_checks.get('adr_governance') else 'ℹ️ Não avaliado para ADR'}\n")

        if self.findings:
            md.append("### ⚠️ Apontamentos de Risco Identificados\n")
            for f in self.findings:
                md.append(f"- **[{f['severity']}] {f['lense']}:** {f['message']}")
            md.append("")

        md.append("### 🥊 Sabatina Socrática de Alto Impacto (Responda antes de Codar)\n")
        for i, q in enumerate(self.questions, 1):
            md.append(f"#### **{i}. {q['topic']}**")
            md.append(f"> 💬 *\"{q['question']}\"*")
            md.append(f"**Por que isso importa:** {q['why']}\n")

        return "\n".join(md)


def main():
    parser = argparse.ArgumentParser(description="Auditor Estático de Estresse de Planos e Specs (/plan-criticize)")
    parser.add_argument("target_file", help="Caminho do arquivo Markdown do plano ou spec")
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown", help="Formato de saída")
    parser.add_argument("--fail-on", choices=["low", "medium", "critical", "none"], default="none", help="Código de saída de erro baseado em severidade")

    args = parser.parse_args()
    path = Path(args.target_file)

    if not path.exists():
        print(f"Erro: Arquivo não encontrado: {path}", file=sys.stderr)
        sys.exit(1)

    auditor = PlanCriticAuditor(path)
    auditor.audit()

    if args.format == "json":
        print(json.dumps(auditor.to_dict(), indent=2, ensure_ascii=False))
    else:
        print(auditor.to_markdown())

    if args.fail_on != "none":
        severities = [f["severity"] for f in auditor.findings]
        if args.fail_on == "low" and severities:
            sys.exit(1)
        elif args.fail_on == "medium" and any(s in ["MEDIUM", "HIGH", "CRITICAL"] for s in severities):
            sys.exit(1)
        elif args.fail_on == "critical" and "CRITICAL" in severities:
            sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
