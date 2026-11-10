#!/usr/bin/env bash
# ==============================================================================
# IASD Mangueiras — Script de Configuração de Segredos (Firebase Cloud Secret Manager)
# ==============================================================================
# Executa a criação e injeção de segredos no GCP Secret Manager vinculado ao Firebase.
#
# Uso:
#   chmod +x scripts/setup-firebase-secrets.sh
#   ./scripts/setup-firebase-secrets.sh
# ==============================================================================

set -euo pipefail

echo "=================================================="
echo "🔐 Configuração de Segredos: IASD Mangueiras"
echo "=================================================="

# 1. Definir projeto ativo
PROJECT_ID="iasd-mangueiras-web"
echo "📌 Configurando projeto Firebase: $PROJECT_ID..."
firebase use "$PROJECT_ID"

echo ""
echo "👉 Para cada segredo, informe o valor real quando solicitado pelo Firebase CLI:"
echo ""

# 2. Configurar YOUTUBE_API_KEY
echo "--- [1/3] Configurando YOUTUBE_API_KEY ---"
firebase functions:secrets:set YOUTUBE_API_KEY

# 3. Configurar TELEGRAM_BOT_TOKEN
echo "--- [2/3] Configurando TELEGRAM_BOT_TOKEN ---"
firebase functions:secrets:set TELEGRAM_BOT_TOKEN

# 4. Configurar TELEGRAM_CHAT_ID
echo "--- [3/3] Configurando TELEGRAM_CHAT_ID ---"
firebase functions:secrets:set TELEGRAM_CHAT_ID

echo ""
echo "✅ Todos os segredos foram definidos com sucesso no Secret Manager!"
echo "🚀 Agora você pode rodar 'npm run deploy' para publicar funções e frontend com 100% de funcionalidade."
