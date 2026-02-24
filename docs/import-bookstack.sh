#!/bin/bash
# =============================================================================
# Probr Documentation — Import vers BookStack / Import to BookStack
# =============================================================================
# Ce script importe automatiquement toute la documentation Probr dans BookStack
# via son API REST. Il cree 3 shelves :
#   - User Guide FR (5 books, 12 pages)
#   - User Guide EN (5 books, 12 pages)
#   - Developer / API (6 books, 6 pages — shared, EN)
#
# This script automatically imports all Probr documentation into BookStack
# via its REST API. It creates 3 shelves:
#   - User Guide FR (5 books, 12 pages)
#   - User Guide EN (5 books, 12 pages)
#   - Developer / API (6 books, 6 pages — shared, EN)
#
# Usage:
#   ./import-bookstack.sh <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>
#
# Examples:
#   ./import-bookstack.sh https://docs.probr.io abc123 def456
#
# Prerequisites:
#   1. curl and jq installed
#   2. A BookStack API Token (Profile > API Tokens > Create Token)
#   3. The token user must have the "Admin" or "Editor" role
# =============================================================================

set -euo pipefail

# --- Arguments ---
BOOKSTACK_URL="${1:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>}"
TOKEN_ID="${2:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>}"
TOKEN_SECRET="${3:?Usage: $0 <BOOKSTACK_URL> <TOKEN_ID> <TOKEN_SECRET>}"

# Remove trailing slash
BOOKSTACK_URL="${BOOKSTACK_URL%/}"
AUTH="Token ${TOKEN_ID}:${TOKEN_SECRET}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Verify docs directories exist
for lang_dir in en fr; do
  if [[ ! -d "${SCRIPT_DIR}/${lang_dir}/getting-started" ]]; then
    echo "ERROR: Documentation directory not found: ${SCRIPT_DIR}/${lang_dir}" >&2
    exit 1
  fi
done

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

create_shelf() {
  local name="$1"
  local description="${2:-}"
  local data
  data=$(jq -n --arg n "$name" --arg d "$description" '{name: $n, description: $d}')
  api_post "shelves" "$data"
}

assign_books_to_shelf() {
  local shelf_id="$1"
  shift
  local book_ids=("$@")
  local books_json
  books_json=$(printf '%s\n' "${book_ids[@]}" | jq -R 'tonumber' | jq -s '.')
  local data
  data=$(jq -n --argjson b "$books_json" '{books: $b}')
  curl -s -X PUT "${BOOKSTACK_URL}/api/shelves/${shelf_id}" \
    -H "Authorization: ${AUTH}" \
    -H "Content-Type: application/json" \
    -d "$data" > /dev/null
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
echo "  3 Shelves — 16 Books — 30 Pages"
echo "==========================================="
echo ""
echo "  URL: ${BOOKSTACK_URL}"
echo ""

# --- Test connection ---
echo "[0] Testing connection..."
test_response=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BOOKSTACK_URL}/api/books" \
  -H "Authorization: ${AUTH}")

if [[ "$test_response" != "200" ]]; then
  echo "  ERROR: Unable to connect (HTTP ${test_response})" >&2
  echo "  Check the URL and credentials." >&2
  exit 1
fi
echo "  Connection OK"
echo ""

# =============================================================================
# SHELF 1: Guide Utilisateur FR
# =============================================================================
echo "============================================"
echo "  SHELF 1: Guide Utilisateur FR"
echo "============================================"
echo ""

DOCS_FR="${SCRIPT_DIR}/fr"
shelf1_book_ids=()

# --- Book 1: Pour commencer ---
echo "[1/5] Creating book: 1 • Pour commencer..."
result=$(create_book "1 • Pour commencer" "Decouvrez Probr et installez le monitoring en quelques minutes.")
book_id=$(extract_id "$result")
shelf1_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Introduction" "Presentation de la plateforme Probr")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Introduction a Probr" "${DOCS_FR}/getting-started/introduction.md" > /dev/null
echo "    Page: Introduction a Probr"

result=$(create_chapter "$book_id" "Installation" "Guide d'installation pas a pas")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Prerequis et installation" "${DOCS_FR}/getting-started/prerequisites.md" > /dev/null
echo "    Page: Prerequis et installation"
echo ""

# --- Book 2: GTM Listener ---
echo "[2/5] Creating book: 2 • GTM Listener..."
result=$(create_book "2 • GTM Listener" "Configuration et options avancees du tag Probr Server-Side Listener.")
book_id=$(extract_id "$result")
shelf1_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Configuration" "Parametres du tag GTM")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Configuration du tag" "${DOCS_FR}/gtm-listener/configuration.md" > /dev/null
echo "    Page: Configuration du tag"

result=$(create_chapter "$book_id" "Modes d'envoi" "Per event vs Batched")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Per event vs Batched" "${DOCS_FR}/gtm-listener/send-modes.md" > /dev/null
echo "    Page: Per event vs Batched"

result=$(create_chapter "$book_id" "Qualite des donnees" "Monitoring de la qualite des donnees")
ch_id=$(extract_id "$result")
create_page "$ch_id" "User data et E-commerce" "${DOCS_FR}/gtm-listener/data-quality.md" > /dev/null
echo "    Page: User data et E-commerce"
echo ""

# --- Book 3: Administration ---
echo "[3/5] Creating book: 3 • Administration..."
result=$(create_book "3 • Administration" "Gerez les clients, sites et probes de monitoring.")
book_id=$(extract_id "$result")
shelf1_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Clients & Sites" "Gestion des clients et sites")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Clients et Sites" "${DOCS_FR}/administration/clients-and-sites.md" > /dev/null
echo "    Page: Clients et Sites"

result=$(create_chapter "$book_id" "Probes" "Configuration et gestion des probes")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Gestion des probes" "${DOCS_FR}/administration/probes.md" > /dev/null
echo "    Page: Gestion des probes"
echo ""

# --- Book 4: Monitoring & Alertes ---
echo "[4/5] Creating book: 4 • Monitoring & Alertes..."
result=$(create_book "4 • Monitoring & Alertes" "Dashboard, analytics temps reel et gestion des alertes.")
book_id=$(extract_id "$result")
shelf1_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Dashboard" "Dashboard et centre de controle")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Dashboard et centre de controle" "${DOCS_FR}/monitoring/dashboard.md" > /dev/null
echo "    Page: Dashboard et centre de controle"

result=$(create_chapter "$book_id" "Analytics" "Analytics de monitoring")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Analytics de monitoring" "${DOCS_FR}/monitoring/analytics.md" > /dev/null
echo "    Page: Analytics de monitoring"

result=$(create_chapter "$book_id" "Alertes" "Gestion des alertes et notifications")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Gestion des alertes" "${DOCS_FR}/monitoring/alerts.md" > /dev/null
echo "    Page: Gestion des alertes"
echo ""

# --- Book 5: Depannage ---
echo "[5/5] Creating book: 5 • Depannage..."
result=$(create_book "5 • Depannage" "Resolution de problemes et questions frequentes.")
book_id=$(extract_id "$result")
shelf1_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Problemes courants" "Debug et solutions")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Debug et solutions" "${DOCS_FR}/troubleshooting/common-issues.md" > /dev/null
echo "    Page: Debug et solutions"

result=$(create_chapter "$book_id" "FAQ" "Questions frequentes")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Questions frequentes" "${DOCS_FR}/troubleshooting/faq.md" > /dev/null
echo "    Page: Questions frequentes"
echo ""

# Create Shelf 1
echo "Creating shelf: Guide Utilisateur FR..."
result=$(create_shelf "Guide Utilisateur FR" "Documentation utilisateur Probr en francais.")
shelf1_id=$(extract_id "$result")
assign_books_to_shelf "$shelf1_id" "${shelf1_book_ids[@]}"
echo "  Shelf created (id: ${shelf1_id})"
echo ""

# =============================================================================
# SHELF 2: User Guide EN
# =============================================================================
echo "============================================"
echo "  SHELF 2: User Guide EN"
echo "============================================"
echo ""

DOCS_EN="${SCRIPT_DIR}/en"
shelf2_book_ids=()

# --- Book 1: Getting Started ---
echo "[1/5] Creating book: 1 • Getting Started..."
result=$(create_book "1 • Getting Started" "Discover Probr and set up monitoring in minutes.")
book_id=$(extract_id "$result")
shelf2_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Introduction" "Overview of the Probr platform")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Introduction to Probr" "${DOCS_EN}/getting-started/introduction.md" > /dev/null
echo "    Page: Introduction to Probr"

result=$(create_chapter "$book_id" "Installation" "Step-by-step installation guide")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Prerequisites and Installation" "${DOCS_EN}/getting-started/prerequisites.md" > /dev/null
echo "    Page: Prerequisites and Installation"
echo ""

# --- Book 2: GTM Listener ---
echo "[2/5] Creating book: 2 • GTM Listener..."
result=$(create_book "2 • GTM Listener" "Configuration and advanced options for the Probr Server-Side Listener tag.")
book_id=$(extract_id "$result")
shelf2_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Configuration" "GTM tag parameters")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Tag Configuration" "${DOCS_EN}/gtm-listener/configuration.md" > /dev/null
echo "    Page: Tag Configuration"

result=$(create_chapter "$book_id" "Send Modes" "Per event vs Batched")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Per event vs Batched" "${DOCS_EN}/gtm-listener/send-modes.md" > /dev/null
echo "    Page: Per event vs Batched"

result=$(create_chapter "$book_id" "Data Quality" "Data quality monitoring")
ch_id=$(extract_id "$result")
create_page "$ch_id" "User Data and E-commerce" "${DOCS_EN}/gtm-listener/data-quality.md" > /dev/null
echo "    Page: User Data and E-commerce"
echo ""

# --- Book 3: Administration ---
echo "[3/5] Creating book: 3 • Administration..."
result=$(create_book "3 • Administration" "Manage clients, sites, and monitoring probes.")
book_id=$(extract_id "$result")
shelf2_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Clients & Sites" "Client and site management")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Clients and Sites" "${DOCS_EN}/administration/clients-and-sites.md" > /dev/null
echo "    Page: Clients and Sites"

result=$(create_chapter "$book_id" "Probes" "Probe configuration and management")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Probe Management" "${DOCS_EN}/administration/probes.md" > /dev/null
echo "    Page: Probe Management"
echo ""

# --- Book 4: Monitoring & Alerts ---
echo "[4/5] Creating book: 4 • Monitoring & Alerts..."
result=$(create_book "4 • Monitoring & Alerts" "Dashboard, real-time analytics, and alert management.")
book_id=$(extract_id "$result")
shelf2_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Dashboard" "Dashboard and control room")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Dashboard and Control Room" "${DOCS_EN}/monitoring/dashboard.md" > /dev/null
echo "    Page: Dashboard and Control Room"

result=$(create_chapter "$book_id" "Analytics" "Monitoring analytics")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Monitoring Analytics" "${DOCS_EN}/monitoring/analytics.md" > /dev/null
echo "    Page: Monitoring Analytics"

result=$(create_chapter "$book_id" "Alerts" "Alert management and notifications")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Alert Management" "${DOCS_EN}/monitoring/alerts.md" > /dev/null
echo "    Page: Alert Management"
echo ""

# --- Book 5: Troubleshooting ---
echo "[5/5] Creating book: 5 • Troubleshooting..."
result=$(create_book "5 • Troubleshooting" "Problem solving and frequently asked questions.")
book_id=$(extract_id "$result")
shelf2_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Common Issues" "Debug and solutions")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Debug and Solutions" "${DOCS_EN}/troubleshooting/common-issues.md" > /dev/null
echo "    Page: Debug and Solutions"

result=$(create_chapter "$book_id" "FAQ" "Frequently asked questions")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Frequently Asked Questions" "${DOCS_EN}/troubleshooting/faq.md" > /dev/null
echo "    Page: Frequently Asked Questions"
echo ""

# Create Shelf 2
echo "Creating shelf: User Guide EN..."
result=$(create_shelf "User Guide EN" "Probr user documentation in English.")
shelf2_id=$(extract_id "$result")
assign_books_to_shelf "$shelf2_id" "${shelf2_book_ids[@]}"
echo "  Shelf created (id: ${shelf2_id})"
echo ""

# =============================================================================
# SHELF 3: Developer / API
# =============================================================================
echo "============================================"
echo "  SHELF 3: Developer / API"
echo "============================================"
echo ""

shelf3_book_ids=()

# --- Book 1: API Overview ---
echo "[1/6] Creating book: 1 • API Overview..."
result=$(create_book "1 • API Overview" "Complete endpoint reference for the Probr API.")
book_id=$(extract_id "$result")
shelf3_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Overview" "Complete API reference")
ch_id=$(extract_id "$result")
create_page "$ch_id" "API Endpoints Overview" "${DOCS_EN}/api-reference/endpoints-overview.md" > /dev/null
echo "    Page: API Endpoints Overview"
echo ""

# --- Book 2: Authentication ---
echo "[2/6] Creating book: 2 • Authentication..."
result=$(create_book "2 • Authentication" "API keys, ingest key authentication, and security recommendations.")
book_id=$(extract_id "$result")
shelf3_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Authentication" "API keys and security")
ch_id=$(extract_id "$result")
create_page "$ch_id" "API Authentication" "${DOCS_EN}/api-reference/authentication.md" > /dev/null
echo "    Page: API Authentication"
echo ""

# --- Book 3: Ingest API ---
echo "[3/6] Creating book: 3 • Ingest API..."
result=$(create_book "3 • Ingest API" "POST /ingest endpoint for receiving monitoring data from GTM Listener.")
book_id=$(extract_id "$result")
shelf3_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Ingestion" "POST /ingest endpoint")
ch_id=$(extract_id "$result")
create_page "$ch_id" "POST /ingest" "${DOCS_EN}/api-reference/ingest-endpoint.md" > /dev/null
echo "    Page: POST /ingest"
echo ""

# --- Book 4: Management API ---
echo "[4/6] Creating book: 4 • Management API..."
result=$(create_book "4 • Management API" "CRUD endpoints for clients, sites, probes, and alerts.")
book_id=$(extract_id "$result")
shelf3_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Management" "Clients, Sites, Probes, Alerts CRUD")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Management API" "${DOCS_EN}/api-reference/management-api.md" > /dev/null
echo "    Page: Management API"
echo ""

# --- Book 5: Monitoring API ---
echo "[5/6] Creating book: 5 • Monitoring API..."
result=$(create_book "5 • Monitoring API" "Dashboard overview, monitoring analytics, and flush endpoints.")
book_id=$(extract_id "$result")
shelf3_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Monitoring" "Dashboard, Analytics, Flush")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Monitoring API" "${DOCS_EN}/api-reference/monitoring-api.md" > /dev/null
echo "    Page: Monitoring API"
echo ""

# --- Book 6: Limits & Quotas ---
echo "[6/6] Creating book: 6 • Limits & Quotas..."
result=$(create_book "6 • Limits & Quotas" "Rate limits, aggregation behavior, and self-hosted recommendations.")
book_id=$(extract_id "$result")
shelf3_book_ids+=("$book_id")
echo "  Book created (id: ${book_id})"

result=$(create_chapter "$book_id" "Limits" "Limits and quotas")
ch_id=$(extract_id "$result")
create_page "$ch_id" "Limits and Quotas" "${DOCS_EN}/api-reference/rate-limits.md" > /dev/null
echo "    Page: Limits and Quotas"
echo ""

# Create Shelf 3
echo "Creating shelf: Developer / API..."
result=$(create_shelf "Developer / API" "Technical API documentation for Probr developers and integrators.")
shelf3_id=$(extract_id "$result")
assign_books_to_shelf "$shelf3_id" "${shelf3_book_ids[@]}"
echo "  Shelf created (id: ${shelf3_id})"
echo ""

# =============================================================================
# Summary
# =============================================================================
echo "==========================================="
echo "  Import completed successfully!"
echo "==========================================="
echo ""
echo "  3 shelves created:"
echo "    - Guide Utilisateur FR  (id: ${shelf1_id}) — 5 books, 12 pages"
echo "    - User Guide EN         (id: ${shelf2_id}) — 5 books, 12 pages"
echo "    - Developer / API       (id: ${shelf3_id}) — 6 books, 6 pages"
echo ""
echo "  Total: 16 books, 30 pages"
echo ""
echo "  Access your documentation: ${BOOKSTACK_URL}"
echo ""
