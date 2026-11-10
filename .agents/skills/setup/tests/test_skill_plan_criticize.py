import json
import os
import subprocess
import sys
from pathlib import Path

_CRITIC = Path(__file__).resolve().parents[2] / "software-engineering" / "plan-criticize" / "scripts" / "plan_critic.py"


def _run_critic(target_file, *args):
    r = subprocess.run(
        [sys.executable, str(_CRITIC), str(target_file), *args],
        capture_output=True,
        encoding="utf-8",
        env={**os.environ, "PYTHONIOENCODING": "utf-8"}
    )
    assert "Traceback" not in r.stderr, r.stderr
    return r


def test_plan_critic_detecta_plano_deficiente(tmp_path):
    plano_ruim = tmp_path / "plano-ingenuo.md"
    plano_ruim.write_text(
        "# Implementação de Feature\n\nVou criar a rota /users e salvar no banco.\n",
        encoding="utf-8"
    )

    r = _run_critic(plano_ruim, "--format", "json")
    assert r.returncode == 0, r.stderr
    data = json.loads(r.stdout)

    assert data["artifact_type"] == "TECHNICAL_PLAN"
    assert data["risk_score"] >= 50, f"Score de risco esperado >= 50, obtido: {data['risk_score']}"
    assert data["risk_level"].startswith("CRÍTICO") or data["risk_level"].startswith("MODERADO")

    # Deve conter apontamentos sobre rollback e edge cases
    lenses = [f["lense"] for f in data["findings"]]
    assert any("Rollback" in l for l in lenses)
    assert any("Casos de Borda" in l for l in lenses)
    assert len(data["socratic_questions"]) >= 2


def test_plan_critic_aprova_plano_robusto(tmp_path):
    plano_bom = tmp_path / "plano-robusto.md"
    plano_bom.write_text(
        """# Plano de Implementação: Migração de Cache Redis

## 1. Visão Geral e Objetivo
Migração de armazenamento de sessão de memória local para cluster Redis distribuído.
Artefato salvo em docs/ai/plans/2026-10-04-cache.md.

## 2. Restrições Técnicas
- Latência máxima tolerada: 5ms por query.
- Concorrência de até 10.000 requisições simultâneas.

## 3. Casos de Borda e Invariantes
- Tratamento de timeout no Redis com fallback gracefully para degradar serviço sem crash.
- Condição de corrida em atualização de token com chave distribuída (redlock).

## 4. Modos de Falha e Pre-Mortem
- Se o cluster Redis cair, o sistema ativa circuit-breaker e opera em modo read-only.
- Blast radius confinado apenas ao subsistema de sessões.

## 5. Matriz de Alternativas
- Abordagem A: Cluster Redis gerenciado (Status Quo escolhido).
- Abordagem B: Memcached local (Lean, porém sem persistência).
- Abordagem C: DynamoDB (Enterprise, porém latência maior).

## 6. Procedimento de Rollback e Contingência
- Em caso de falha de conexão sustentada por 2 minutos, feature-flag chaveia tráfego de volta para cache local.

## 7. Estratégia de Testes
- Testes unitários com mock de conexão.
- Testes de carga e caos simulando desconexão abrupta da rede.
- Validação de segurança defensiva Zero-Trust para autenticação mTLS.
- Criação de ADR em docs/adrs/0042-redis-cache.md.
""",
        encoding="utf-8"
    )

    r = _run_critic(plano_bom, "--format", "json")
    assert r.returncode == 0, r.stderr
    data = json.loads(r.stdout)

    assert data["risk_score"] <= 25, f"Score de risco esperado <= 25, obtido: {data['risk_score']}"
    assert "BAIXO" in data["risk_level"]
    assert data["sections_detected"]["rollback"] is True
    assert data["sections_detected"]["edge_cases"] is True
    assert data["sections_detected"]["failure_modes"] is True
    assert data["compliance_checks"]["harness_docs_ai"] is True


def test_plan_critic_formato_markdown_saida(tmp_path):
    plano = tmp_path / "plano.md"
    plano.write_text("# Plano Básico\n\nObjetivo: Criar microsserviço.\n", encoding="utf-8")

    r = _run_critic(plano, "--format", "markdown")
    assert r.returncode == 0, r.stderr
    assert "Auditoria de Estresse de Plano: `/plan-criticize`" in r.stdout
    assert "Radar das 7 Lentes Críticas" in r.stdout
    assert "Sabatina Socrática" in r.stdout
