#!/bin/bash
# =============================================================================
# Probr Documentation — Import vers BookStack
# =============================================================================
# Ce script importe automatiquement toute la documentation Probr dans BookStack
# via son API REST.
#
# Usage:
#   ./import-bookstack.sh <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>
#
# Exemple:
#   ./import-bookstack.sh https://docs.probr.io abc123 def456
#
# Prérequis:
#   1. curl et jq installés
#   2. Un API Token BookStack (Profil > API Tokens > Create Token)
#   3. L'utilisateur du token doit avoir le rôle "Admin" ou "Editor"
# =============================================================================

set -euo pipefail

# --- Arguments ---
BOOKSTACK_URL="${1:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>}"
TOKEN_ID="${2:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>}"
TOKEN_SECRET="${3:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>}"

# Remove trailing slash
BOOKSTACK_URL="${BOOKSTACK_URL%/}"
AUTH="Token ${TOKEN_ID}:${TOKEN_SECRET}"
DOCS_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Helpers ---
api_post() {
  local endpoint="$1"
  local data="$2"
  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST "${BOOKSTACK_URL}/api/${endpoint}" \
    -H "Authorization: ${AUTH}" \
    -H "Content-Type: application/json" \
    -d "$data")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
    echo "$body"
  else
    echo "  ERREUR HTTP ${http_code} sur ${endpoint}:" >&2
    echo "  ${body}" >&2
    return 1
  fi
}

extract_id() {
  echo "$1" | jq -r '.id'
}

create_book() {
  local name="$1"
  local description="${2:-}"
  local data
  data=$(jq -n --arg n "$name" --arg d "$description" '{name: $n, description: $d}')
  api_post "books" "$data"
}

create_chapter() {
  local book_id="$1"
  local name="$2"
  local description="${3:-}"
  local data
  data=$(jq -n --argjson b "$book_id" --arg n "$name" --arg d "$description" \
    '{book_id: $b, name: $n, description: $d}')
  api_post "chapters" "$data"
}

create_page() {
  local chapter_id="$1"
  local name="$2"
  local markdown_file="$3"
  local content
  content=$(cat "$markdown_file")
  local data
  data=$(jq -n --argjson c "$chapter_id" --arg n "$name" --arg m "$content" \
    '{chapter_id: $c, name: $n, markdown: $m}')
  api_post "pages" "$data"
}

echo "==========================================="
echo "  Probr Docs → BookStack Import"
echo "==========================================="
echo ""
echo "  URL:    ${BOOKSTACK_URL}"
echo "  Docs:   ${DOCS_DIR}"
echo ""

# --- Test connection ---
echo "[0/4] Test de connexion..."
test_response=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BOOKSTACK_URL}/api/books" \
  -H "Authorization: ${AUTH}")

if [[ "$test_response" != "200" ]]; then
  echo "  ERREUR: Impossible de se connecter (HTTP ${test_response})" >&2
  echo "  Vérifiez l'URL et les credentials." >&2
  exit 1
fi
echo "  Connexion OK"
echo ""

# =============================================================================
# Book 1: Getting Started
# =============================================================================
echo "[1/4] Création du livre: Getting Started..."

result=$(create_book "Getting Started" "Découvrez Probr et installez le monitoring en quelques minutes.")
book1_id=$(extract_id "$result")
echo "  Book créé (id: ${book1_id})"

# Chapter: Introduction
result=$(create_chapter "$book1_id" "Introduction" "Présentation de la plateforme Probr")
ch_id=$(extract_id "$result")
echo "  Chapter: Introduction (id: ${ch_id})"
create_page "$ch_id" "Introduction à Probr" "${DOCS_DIR}/getting-started/introduction.md" > /dev/null
echo "    Page: Introduction à Probr ✓"

# Chapter: Installation
result=$(create_chapter "$book1_id" "Installation" "Guide d'installation pas à pas")
ch_id=$(extract_id "$result")
echo "  Chapter: Installation (id: ${ch_id})"
create_page "$ch_id" "Prérequis et installation" "${DOCS_DIR}/getting-started/prerequisites.md" > /dev/null
echo "    Page: Prérequis et installation ✓"

echo ""

# =============================================================================
# Book 2: GTM Listener
# =============================================================================
echo "[2/4] Création du livre: GTM Listener..."

result=$(create_book "GTM Listener" "Configuration et options avancées du tag Probr Server-Side Listener.")
book2_id=$(extract_id "$result")
echo "  Book créé (id: ${book2_id})"

# Chapter: Configuration
result=$(create_chapter "$book2_id" "Configuration" "Paramètres du tag GTM")
ch_id=$(extract_id "$result")
echo "  Chapter: Configuration (id: ${ch_id})"
create_page "$ch_id" "Configuration du tag" "${DOCS_DIR}/gtm-listener/configuration.md" > /dev/null
echo "    Page: Configuration du tag ✓"

# Chapter: Modes d'envoi
result=$(create_chapter "$book2_id" "Modes d'envoi" "Per event vs Batched")
ch_id=$(extract_id "$result")
echo "  Chapter: Modes d'envoi (id: ${ch_id})"
create_page "$ch_id" "Per event vs Batched" "${DOCS_DIR}/gtm-listener/send-modes.md" > /dev/null
echo "    Page: Per event vs Batched ✓"

# Chapter: Qualité des données
result=$(create_chapter "$book2_id" "Qualité des données" "Monitoring de la qualité des données")
ch_id=$(extract_id "$result")
echo "  Chapter: Qualité des données (id: ${ch_id})"
create_page "$ch_id" "User data et E-commerce" "${DOCS_DIR}/gtm-listener/data-quality.md" > /dev/null
echo "    Page: User data et E-commerce ✓"

echo ""

# =============================================================================
# Book 3: API Reference
# =============================================================================
echo "[3/4] Création du livre: API Reference..."

result=$(create_book "API Reference" "Documentation technique de l'API d'ingestion Probr.")
book3_id=$(extract_id "$result")
echo "  Book créé (id: ${book3_id})"

# Chapter: Authentification
result=$(create_chapter "$book3_id" "Authentification" "Clés API et sécurité")
ch_id=$(extract_id "$result")
echo "  Chapter: Authentification (id: ${ch_id})"
create_page "$ch_id" "Clés API et sécurité" "${DOCS_DIR}/api-reference/authentication.md" > /dev/null
echo "    Page: Clés API et sécurité ✓"

# Chapter: Ingestion
result=$(create_chapter "$book3_id" "Ingestion" "Endpoint POST /ingest")
ch_id=$(extract_id "$result")
echo "  Chapter: Ingestion (id: ${ch_id})"
create_page "$ch_id" "POST /ingest" "${DOCS_DIR}/api-reference/ingest-endpoint.md" > /dev/null
echo "    Page: POST /ingest ✓"

# Chapter: Limites
result=$(create_chapter "$book3_id" "Limites" "Rate limits et quotas par plan")
ch_id=$(extract_id "$result")
echo "  Chapter: Limites (id: ${ch_id})"
create_page "$ch_id" "Rate limits et quotas" "${DOCS_DIR}/api-reference/rate-limits.md" > /dev/null
echo "    Page: Rate limits et quotas ✓"

echo ""

# =============================================================================
# Book 4: Troubleshooting
# =============================================================================
echo "[4/4] Création du livre: Troubleshooting..."

result=$(create_book "Troubleshooting" "Résolution de problèmes et questions fréquentes.")
book4_id=$(extract_id "$result")
echo "  Book créé (id: ${book4_id})"

# Chapter: Problèmes courants
result=$(create_chapter "$book4_id" "Problèmes courants" "Debug et solutions")
ch_id=$(extract_id "$result")
echo "  Chapter: Problèmes courants (id: ${ch_id})"
create_page "$ch_id" "Debug et solutions" "${DOCS_DIR}/troubleshooting/common-issues.md" > /dev/null
echo "    Page: Debug et solutions ✓"

# Chapter: FAQ
result=$(create_chapter "$book4_id" "FAQ" "Questions fréquentes")
ch_id=$(extract_id "$result")
echo "  Chapter: FAQ (id: ${ch_id})"
create_page "$ch_id" "Questions fréquentes" "${DOCS_DIR}/troubleshooting/faq.md" > /dev/null
echo "    Page: Questions fréquentes ✓"

echo ""
echo "==========================================="
echo "  Import terminé avec succès !"
echo "==========================================="
echo ""
echo "  4 livres créés:"
echo "    - Getting Started    (id: ${book1_id})"
echo "    - GTM Listener       (id: ${book2_id})"
echo "    - API Reference      (id: ${book3_id})"
echo "    - Troubleshooting    (id: ${book4_id})"
echo ""
echo "  10 pages importées au total."
echo ""
echo "  Accédez à votre documentation: ${BOOKSTACK_URL}"
echo ""
