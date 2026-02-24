#!/bin/bash
# =============================================================================
# Probr Documentation — Import vers BookStack / Import to BookStack
# =============================================================================
# Ce script importe automatiquement toute la documentation Probr dans BookStack
# via son API REST, en francais ou en anglais.
#
# This script automatically imports all Probr documentation into BookStack
# via its REST API, in French or English.
#
# Usage:
#   ./import-bookstack.sh <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET> [--lang fr|en]
#
# Examples:
#   ./import-bookstack.sh https://docs.probr.io abc123 def456            # French (default)
#   ./import-bookstack.sh https://docs.probr.io abc123 def456 --lang en  # English
#   ./import-bookstack.sh https://docs.probr.io abc123 def456 --lang fr  # French
#
# Prerequisites:
#   1. curl and jq installed
#   2. A BookStack API Token (Profile > API Tokens > Create Token)
#   3. The token user must have the "Admin" or "Editor" role
# =============================================================================

set -euo pipefail

# --- Arguments ---
BOOKSTACK_URL="${1:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET> [--lang fr|en]}"
TOKEN_ID="${2:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET> [--lang fr|en]}"
TOKEN_SECRET="${3:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET> [--lang fr|en]}"

# --- Language ---
# Supports: --lang en, --lang=en, en/fr (positional)
LANG_OPT="fr"
shift 3
while [[ $# -gt 0 ]]; do
  case "$1" in
    --lang)
      if [[ $# -ge 2 ]]; then
        LANG_OPT="$2"
        shift 2
      else
        echo "ERROR: --lang requires a value (fr or en)." >&2
        exit 1
      fi
      ;;
    --lang=*)
      LANG_OPT="${1#--lang=}"
      shift
      ;;
    en|fr)
      LANG_OPT="$1"
      shift
      ;;
    *)
      echo "WARNING: Unknown argument '$1', ignoring." >&2
      shift
      ;;
  esac
done

if [[ "$LANG_OPT" != "fr" && "$LANG_OPT" != "en" ]]; then
  echo "ERROR: Unsupported language '${LANG_OPT}'. Use 'fr' or 'en'." >&2
  exit 1
fi

# Remove trailing slash
BOOKSTACK_URL="${BOOKSTACK_URL%/}"
AUTH="Token ${TOKEN_ID}:${TOKEN_SECRET}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

DOCS_DIR="${SCRIPT_DIR}/${LANG_OPT}"

# Verify docs directory exists
if [[ ! -d "$DOCS_DIR/getting-started" ]]; then
  echo "ERROR: Documentation directory not found: ${DOCS_DIR}" >&2
  echo "Make sure the '${LANG_OPT}' documentation files exist." >&2
  exit 1
fi

# --- i18n strings ---
if [[ "$LANG_OPT" == "en" ]]; then
  # Book names
  BOOK1_NAME="Getting Started"
  BOOK2_NAME="GTM Listener"
  BOOK3_NAME="API Reference"
  BOOK4_NAME="Troubleshooting"
  # Book descriptions
  BOOK1_DESC="Discover Probr and set up monitoring in minutes."
  BOOK2_DESC="Configuration and advanced options for the Probr Server-Side Listener tag."
  BOOK3_DESC="Technical documentation for the Probr ingestion API."
  BOOK4_DESC="Problem solving and frequently asked questions."
  # Chapter names & descriptions
  CH_INTRO="Introduction";         CH_INTRO_DESC="Overview of the Probr platform"
  CH_INSTALL="Installation";       CH_INSTALL_DESC="Step-by-step installation guide"
  CH_CONFIG="Configuration";       CH_CONFIG_DESC="GTM tag parameters"
  CH_SEND="Send Modes";            CH_SEND_DESC="Per event vs Batched"
  CH_QUALITY="Data Quality";       CH_QUALITY_DESC="Data quality monitoring"
  CH_AUTH="Authentication";        CH_AUTH_DESC="API keys and security"
  CH_INGEST="Ingestion";           CH_INGEST_DESC="POST /ingest endpoint"
  CH_LIMITS="Limits";              CH_LIMITS_DESC="Rate limits and quotas by plan"
  CH_ISSUES="Common Issues";       CH_ISSUES_DESC="Debug and solutions"
  CH_FAQ="FAQ";                    CH_FAQ_DESC="Frequently asked questions"
  # Page names
  PAGE_INTRO="Introduction to Probr"
  PAGE_INSTALL="Prerequisites and Installation"
  PAGE_CONFIG="Tag Configuration"
  PAGE_SEND="Per event vs Batched"
  PAGE_QUALITY="User Data and E-commerce"
  PAGE_AUTH="API Keys and Security"
  PAGE_INGEST="POST /ingest"
  PAGE_LIMITS="Rate Limits and Quotas"
  PAGE_ISSUES="Debug and Solutions"
  PAGE_FAQ="Frequently Asked Questions"
  # Messages
  MSG_TESTING="Testing connection..."
  MSG_CONN_OK="Connection OK"
  MSG_CONN_FAIL="ERROR: Unable to connect"
  MSG_CHECK="Check the URL and credentials."
  MSG_CREATING_BOOK="Creating book"
  MSG_BOOK_CREATED="Book created"
  MSG_IMPORT_DONE="Import completed successfully!"
  MSG_BOOKS_CREATED="4 books created:"
  MSG_PAGES_IMPORTED="10 pages imported in total."
  MSG_ACCESS="Access your documentation"
  MSG_LANG_LABEL="Language: English"
else
  # Book names
  BOOK1_NAME="Pour commencer"
  BOOK2_NAME="GTM Listener"
  BOOK3_NAME="Reference API"
  BOOK4_NAME="Depannage"
  # Book descriptions
  BOOK1_DESC="Decouvrez Probr et installez le monitoring en quelques minutes."
  BOOK2_DESC="Configuration et options avancees du tag Probr Server-Side Listener."
  BOOK3_DESC="Documentation technique de l'API d'ingestion Probr."
  BOOK4_DESC="Resolution de problemes et questions frequentes."
  # Chapter names & descriptions
  CH_INTRO="Introduction";         CH_INTRO_DESC="Presentation de la plateforme Probr"
  CH_INSTALL="Installation";       CH_INSTALL_DESC="Guide d'installation pas a pas"
  CH_CONFIG="Configuration";       CH_CONFIG_DESC="Parametres du tag GTM"
  CH_SEND="Modes d'envoi";         CH_SEND_DESC="Per event vs Batched"
  CH_QUALITY="Qualite des donnees"; CH_QUALITY_DESC="Monitoring de la qualite des donnees"
  CH_AUTH="Authentification";      CH_AUTH_DESC="Cles API et securite"
  CH_INGEST="Ingestion";           CH_INGEST_DESC="Endpoint POST /ingest"
  CH_LIMITS="Limites";             CH_LIMITS_DESC="Rate limits et quotas par plan"
  CH_ISSUES="Problemes courants";  CH_ISSUES_DESC="Debug et solutions"
  CH_FAQ="FAQ";                    CH_FAQ_DESC="Questions frequentes"
  # Page names
  PAGE_INTRO="Introduction a Probr"
  PAGE_INSTALL="Prerequis et installation"
  PAGE_CONFIG="Configuration du tag"
  PAGE_SEND="Per event vs Batched"
  PAGE_QUALITY="User data et E-commerce"
  PAGE_AUTH="Cles API et securite"
  PAGE_INGEST="POST /ingest"
  PAGE_LIMITS="Rate limits et quotas"
  PAGE_ISSUES="Debug et solutions"
  PAGE_FAQ="Questions frequentes"
  # Messages
  MSG_TESTING="Test de connexion..."
  MSG_CONN_OK="Connexion OK"
  MSG_CONN_FAIL="ERREUR: Impossible de se connecter"
  MSG_CHECK="Verifiez l'URL et les credentials."
  MSG_CREATING_BOOK="Creation du livre"
  MSG_BOOK_CREATED="Book cree"
  MSG_IMPORT_DONE="Import termine avec succes !"
  MSG_BOOKS_CREATED="4 livres crees:"
  MSG_PAGES_IMPORTED="10 pages importees au total."
  MSG_ACCESS="Accedez a votre documentation"
  MSG_LANG_LABEL="Langue: Francais"
fi

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
    echo "  ERROR HTTP ${http_code} on ${endpoint}:" >&2
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
echo "  Probr Docs -> BookStack Import"
echo "==========================================="
echo ""
echo "  URL:    ${BOOKSTACK_URL}"
echo "  Docs:   ${DOCS_DIR}"
echo "  ${MSG_LANG_LABEL}"
echo ""

# --- Test connection ---
echo "[0/4] ${MSG_TESTING}"
test_response=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BOOKSTACK_URL}/api/books" \
  -H "Authorization: ${AUTH}")

if [[ "$test_response" != "200" ]]; then
  echo "  ${MSG_CONN_FAIL} (HTTP ${test_response})" >&2
  echo "  ${MSG_CHECK}" >&2
  exit 1
fi
echo "  ${MSG_CONN_OK}"
echo ""

# =============================================================================
# Book 1: Getting Started
# =============================================================================
echo "[1/4] ${MSG_CREATING_BOOK}: ${BOOK1_NAME}..."

result=$(create_book "$BOOK1_NAME" "$BOOK1_DESC")
book1_id=$(extract_id "$result")
echo "  ${MSG_BOOK_CREATED} (id: ${book1_id})"

# Chapter: Introduction
result=$(create_chapter "$book1_id" "$CH_INTRO" "$CH_INTRO_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_INTRO} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_INTRO" "${DOCS_DIR}/getting-started/introduction.md" > /dev/null
echo "    Page: ${PAGE_INTRO}"

# Chapter: Installation
result=$(create_chapter "$book1_id" "$CH_INSTALL" "$CH_INSTALL_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_INSTALL} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_INSTALL" "${DOCS_DIR}/getting-started/prerequisites.md" > /dev/null
echo "    Page: ${PAGE_INSTALL}"

echo ""

# =============================================================================
# Book 2: GTM Listener
# =============================================================================
echo "[2/4] ${MSG_CREATING_BOOK}: ${BOOK2_NAME}..."

result=$(create_book "$BOOK2_NAME" "$BOOK2_DESC")
book2_id=$(extract_id "$result")
echo "  ${MSG_BOOK_CREATED} (id: ${book2_id})"

# Chapter: Configuration
result=$(create_chapter "$book2_id" "$CH_CONFIG" "$CH_CONFIG_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_CONFIG} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_CONFIG" "${DOCS_DIR}/gtm-listener/configuration.md" > /dev/null
echo "    Page: ${PAGE_CONFIG}"

# Chapter: Send Modes
result=$(create_chapter "$book2_id" "$CH_SEND" "$CH_SEND_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_SEND} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_SEND" "${DOCS_DIR}/gtm-listener/send-modes.md" > /dev/null
echo "    Page: ${PAGE_SEND}"

# Chapter: Data Quality
result=$(create_chapter "$book2_id" "$CH_QUALITY" "$CH_QUALITY_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_QUALITY} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_QUALITY" "${DOCS_DIR}/gtm-listener/data-quality.md" > /dev/null
echo "    Page: ${PAGE_QUALITY}"

echo ""

# =============================================================================
# Book 3: API Reference
# =============================================================================
echo "[3/4] ${MSG_CREATING_BOOK}: ${BOOK3_NAME}..."

result=$(create_book "$BOOK3_NAME" "$BOOK3_DESC")
book3_id=$(extract_id "$result")
echo "  ${MSG_BOOK_CREATED} (id: ${book3_id})"

# Chapter: Authentication
result=$(create_chapter "$book3_id" "$CH_AUTH" "$CH_AUTH_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_AUTH} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_AUTH" "${DOCS_DIR}/api-reference/authentication.md" > /dev/null
echo "    Page: ${PAGE_AUTH}"

# Chapter: Ingestion
result=$(create_chapter "$book3_id" "$CH_INGEST" "$CH_INGEST_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_INGEST} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_INGEST" "${DOCS_DIR}/api-reference/ingest-endpoint.md" > /dev/null
echo "    Page: ${PAGE_INGEST}"

# Chapter: Limits
result=$(create_chapter "$book3_id" "$CH_LIMITS" "$CH_LIMITS_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_LIMITS} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_LIMITS" "${DOCS_DIR}/api-reference/rate-limits.md" > /dev/null
echo "    Page: ${PAGE_LIMITS}"

echo ""

# =============================================================================
# Book 4: Troubleshooting
# =============================================================================
echo "[4/4] ${MSG_CREATING_BOOK}: ${BOOK4_NAME}..."

result=$(create_book "$BOOK4_NAME" "$BOOK4_DESC")
book4_id=$(extract_id "$result")
echo "  ${MSG_BOOK_CREATED} (id: ${book4_id})"

# Chapter: Common Issues
result=$(create_chapter "$book4_id" "$CH_ISSUES" "$CH_ISSUES_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_ISSUES} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_ISSUES" "${DOCS_DIR}/troubleshooting/common-issues.md" > /dev/null
echo "    Page: ${PAGE_ISSUES}"

# Chapter: FAQ
result=$(create_chapter "$book4_id" "$CH_FAQ" "$CH_FAQ_DESC")
ch_id=$(extract_id "$result")
echo "  Chapter: ${CH_FAQ} (id: ${ch_id})"
create_page "$ch_id" "$PAGE_FAQ" "${DOCS_DIR}/troubleshooting/faq.md" > /dev/null
echo "    Page: ${PAGE_FAQ}"

echo ""
echo "==========================================="
echo "  ${MSG_IMPORT_DONE}"
echo "==========================================="
echo ""
echo "  ${MSG_BOOKS_CREATED}"
echo "    - ${BOOK1_NAME}  (id: ${book1_id})"
echo "    - ${BOOK2_NAME}  (id: ${book2_id})"
echo "    - ${BOOK3_NAME}  (id: ${book3_id})"
echo "    - ${BOOK4_NAME}  (id: ${book4_id})"
echo ""
echo "  ${MSG_PAGES_IMPORTED}"
echo ""
echo "  ${MSG_ACCESS}: ${BOOKSTACK_URL}"
echo ""
