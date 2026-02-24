#!/usr/bin/env python3
"""
fix-bookstack-links.py — Fix broken relative markdown links in BookStack pages.

When markdown docs are uploaded to BookStack, relative links like
./prerequisites.md or ../monitoring/alerts.md become broken because
BookStack uses its own URL structure.

This script connects to the BookStack API, finds all pages containing
broken relative .md links, and replaces them with correct BookStack
internal page links (/link/{page_id}).

Usage:
    # Dry run (default) — shows what would be changed
    python3 scripts/fix-bookstack-links.py

    # Apply changes
    python3 scripts/fix-bookstack-links.py --apply

Environment variables:
    BOOKSTACK_URL            Base URL (e.g. https://docs.probr.io)
    BOOKSTACK_TOKEN_ID       API Token ID
    BOOKSTACK_TOKEN_SECRET   API Token Secret
"""

import os
import sys
import re
import json
import argparse
import posixpath
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# ─── Mapping: markdown filepath → BookStack page title ───────────────────
# Derived from docs/en/INDEX.md and docs/fr/INDEX.md

FILENAME_TO_TITLE = {
    "en": {
        "getting-started/introduction.md": "Introduction to Probr",
        "getting-started/prerequisites.md": "Prerequisites and installation",
        "gtm-listener/configuration.md": "Tag configuration",
        "gtm-listener/send-modes.md": "Per event vs Batched",
        "gtm-listener/data-quality.md": "User data and E-commerce",
        "administration/clients-and-sites.md": "Client and site management",
        "administration/probes.md": "Probe configuration and management",
        "monitoring/dashboard.md": "Dashboard and control room",
        "monitoring/analytics.md": "Monitoring analytics",
        "monitoring/alerts.md": "Alert management and notifications",
        "troubleshooting/common-issues.md": "Debug and solutions",
        "troubleshooting/faq.md": "Frequently asked questions",
        "api-reference/endpoints-overview.md": "Complete API reference",
        "api-reference/authentication.md": "API keys and security",
        "api-reference/ingest-endpoint.md": "POST /ingest",
        "api-reference/management-api.md": "Clients, Sites, Probes, Alerts CRUD",
        "api-reference/monitoring-api.md": "Dashboard, Analytics, Flush",
        "api-reference/rate-limits.md": "Limits and quotas",
    },
    "fr": {
        "getting-started/introduction.md": "Introduction a Probr",
        "getting-started/prerequisites.md": "Prerequis et installation",
        "gtm-listener/configuration.md": "Configuration du tag",
        "gtm-listener/send-modes.md": "Per event vs Batched",
        "gtm-listener/data-quality.md": "User data et E-commerce",
        "administration/clients-and-sites.md": "Gestion des clients et sites",
        "administration/probes.md": "Configuration et gestion des probes",
        "monitoring/dashboard.md": "Dashboard et centre de controle",
        "monitoring/analytics.md": "Analytics de monitoring",
        "monitoring/alerts.md": "Gestion des alertes et notifications",
        "troubleshooting/common-issues.md": "Debug et solutions",
        "troubleshooting/faq.md": "Questions frequentes",
        "api-reference/endpoints-overview.md": "Reference API complete",
        "api-reference/authentication.md": "Cles API et securite",
        "api-reference/ingest-endpoint.md": "POST /ingest",
        "api-reference/management-api.md": "Clients, Sites, Probes, Alertes CRUD",
        "api-reference/monitoring-api.md": "Dashboard, Analytics, Flush",
        "api-reference/rate-limits.md": "Limites et quotas",
    },
}

# Reverse mapping: page title → markdown filepath (per language)
TITLE_TO_FILENAME = {
    lang: {title: filepath for filepath, title in mapping.items()}
    for lang, mapping in FILENAME_TO_TITLE.items()
}


# ─── BookStack API Client ────────────────────────────────────────────────

class BookStackAPI:
    """Minimal BookStack API client using only the standard library."""

    def __init__(self, base_url, token_id, token_secret):
        self.base_url = base_url.rstrip("/")
        self.auth = f"Token {token_id}:{token_secret}"

    def _request(self, method, endpoint, data=None):
        url = f"{self.base_url}/api/{endpoint}"
        headers = {
            "Authorization": self.auth,
            "Content-Type": "application/json",
        }
        body = json.dumps(data).encode("utf-8") if data else None
        req = Request(url, data=body, headers=headers, method=method)
        try:
            with urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as e:
            body_text = e.read().decode("utf-8", errors="replace")
            print(f"  API error {e.code} on {method} {endpoint}: {body_text}")
            raise

    def get(self, endpoint, **params):
        if params:
            qs = "&".join(f"{k}={v}" for k, v in params.items())
            endpoint = f"{endpoint}?{qs}"
        return self._request("GET", endpoint)

    def put(self, endpoint, data):
        return self._request("PUT", endpoint, data)


# ─── Core Logic ──────────────────────────────────────────────────────────

def fetch_all_pages(api):
    """Fetch all pages from BookStack (handles pagination)."""
    pages = []
    offset = 0
    while True:
        result = api.get("pages", count=500, offset=offset)
        pages.extend(result["data"])
        if len(pages) >= result["total"]:
            break
        offset += 500
    return pages


def detect_shelf_language(shelf_name):
    """Determine language from shelf name."""
    name = shelf_name.lower()
    if any(w in name for w in ["en", "english", "user guide"]):
        return "en"
    if any(w in name for w in ["fr", "utilisateur", "french"]):
        return "fr"
    return None


def build_book_lang_map(api):
    """Map book_id → language by inspecting shelves."""
    book_lang = {}
    shelves = api.get("shelves")["data"]
    for shelf in shelves:
        detail = api.get(f"shelves/{shelf['id']}")
        lang = detect_shelf_language(shelf["name"])
        for book in detail.get("books", []):
            book_lang[book["id"]] = lang
    return book_lang


def resolve_relative_link(href, source_filepath):
    """Resolve a relative .md link based on the source file's directory.

    Examples:
        resolve("./prerequisites.md", "getting-started/introduction.md")
        → "getting-started/prerequisites.md"

        resolve("../monitoring/alerts.md", "administration/probes.md")
        → "monitoring/alerts.md"

        resolve("authentication.md", "api-reference/endpoints-overview.md")
        → "api-reference/authentication.md"
    """
    source_dir = posixpath.dirname(source_filepath)
    resolved = posixpath.normpath(posixpath.join(source_dir, href))
    return resolved


def find_md_links_in_html(html):
    """Find all href="...*.md" patterns in HTML content."""
    return re.findall(r'href="([^"]*\.md)"', html)


def process_page(html, source_title, lang, title_to_page_id, base_url):
    """Scan a page's HTML for .md links and replace them with BookStack URLs.

    Returns (fixed_html, changes_list).
    """
    source_filepath = TITLE_TO_FILENAME.get(lang, {}).get(source_title, "")
    if not source_filepath:
        return html, []

    changes = []

    def replace_link(match):
        href = match.group(1)
        target_path = resolve_relative_link(href, source_filepath)
        target_title = FILENAME_TO_TITLE.get(lang, {}).get(target_path)

        if target_title and target_title in title_to_page_id:
            page_id = title_to_page_id[target_title]
            new_url = f"{base_url}/link/{page_id}"
            changes.append({"old": href, "new": new_url, "target": target_title})
            return f'href="{new_url}"'

        changes.append({
            "old": href,
            "new": None,
            "target": target_title or target_path,
            "error": "Page not found in BookStack",
        })
        return match.group(0)

    fixed = re.sub(r'href="([^"]*\.md)"', replace_link, html)
    return fixed, changes


def main():
    parser = argparse.ArgumentParser(
        description="Fix broken relative .md links in BookStack pages"
    )
    parser.add_argument(
        "--apply", action="store_true",
        help="Apply changes (default is dry-run)",
    )
    parser.add_argument("--url", default=os.environ.get("BOOKSTACK_URL", ""))
    parser.add_argument("--token-id", default=os.environ.get("BOOKSTACK_TOKEN_ID", ""))
    parser.add_argument("--token-secret", default=os.environ.get("BOOKSTACK_TOKEN_SECRET", ""))
    args = parser.parse_args()

    if not all([args.url, args.token_id, args.token_secret]):
        print("Error: BookStack credentials required.")
        print()
        print("Set environment variables:")
        print("  export BOOKSTACK_URL=https://docs.probr.io")
        print("  export BOOKSTACK_TOKEN_ID=your_token_id")
        print("  export BOOKSTACK_TOKEN_SECRET=your_token_secret")
        print()
        print("Or use flags: --url, --token-id, --token-secret")
        sys.exit(1)

    base_url = args.url.rstrip("/")
    api = BookStackAPI(base_url, args.token_id, args.token_secret)
    mode = "APPLY" if args.apply else "DRY RUN"

    print(f"{'=' * 60}")
    print(f"  BookStack Link Fixer  [{mode}]")
    print(f"  Instance: {base_url}")
    print(f"{'=' * 60}")
    print()

    # ── Step 1: Map books to languages ────────────────────────────────
    print("[1/4] Mapping shelves and books to languages...")
    book_lang = build_book_lang_map(api)
    print(f"      {len(book_lang)} books mapped")

    # ── Step 2: Fetch all pages ───────────────────────────────────────
    print("[2/4] Fetching all pages...")
    all_pages = fetch_all_pages(api)
    print(f"      {len(all_pages)} pages found")

    # Build title → page_id mapping per language
    # Also identify which pages to inspect (those with known titles)
    title_to_page_id = {"en": {}, "fr": {}}
    pages_to_inspect = []

    for page in all_pages:
        lang = book_lang.get(page.get("book_id"))
        if lang is None:
            # Try to infer language from page title
            for l in ["en", "fr"]:
                if page["name"] in TITLE_TO_FILENAME.get(l, {}):
                    lang = l
                    break
        if lang is None:
            continue

        title_to_page_id[lang][page["name"]] = page["id"]

        # Check if this page's source file is known to have .md links
        source_filepath = TITLE_TO_FILENAME.get(lang, {}).get(page["name"], "")
        if source_filepath:
            pages_to_inspect.append({
                "id": page["id"],
                "name": page["name"],
                "lang": lang,
            })

    en_count = len(title_to_page_id["en"])
    fr_count = len(title_to_page_id["fr"])
    print(f"      Matched: {en_count} EN, {fr_count} FR")
    print()

    # ── Step 3: Scan pages for broken links ───────────────────────────
    print(f"[3/4] Scanning {len(pages_to_inspect)} pages for broken .md links...")
    all_changes = []
    pages_to_update = []

    for page_info in pages_to_inspect:
        detail = api.get(f"pages/{page_info['id']}")
        html = detail.get("html", "")

        if not html or ".md" not in html:
            continue

        fixed_html, changes = process_page(
            html, page_info["name"], page_info["lang"],
            title_to_page_id[page_info["lang"]], base_url,
        )

        if changes:
            all_changes.append({
                "lang": page_info["lang"].upper(),
                "title": page_info["name"],
                "page_id": page_info["id"],
                "changes": changes,
            })
            if any(c.get("new") for c in changes):
                pages_to_update.append({
                    "id": page_info["id"],
                    "title": page_info["name"],
                    "lang": page_info["lang"].upper(),
                    "html": fixed_html,
                })

    # Report
    print()
    total_links = sum(len(c["changes"]) for c in all_changes)
    resolved = sum(1 for c in all_changes for ch in c["changes"] if ch.get("new"))
    unresolved = total_links - resolved

    for group in all_changes:
        print(f"  [{group['lang']}] {group['title']} (page #{group['page_id']})")
        for ch in group["changes"]:
            if ch.get("new"):
                print(f"      {ch['old']}")
                print(f"        -> {ch['new']}")
            else:
                print(f"      {ch['old']}")
                print(f"        -> NOT FOUND ({ch.get('error', '?')})")
        print()

    print(f"  Total: {total_links} links | {resolved} resolved | {unresolved} unresolved")
    print()

    # ── Step 4: Apply or skip ─────────────────────────────────────────
    if args.apply and pages_to_update:
        print(f"[4/4] Updating {len(pages_to_update)} pages in BookStack...")
        success = 0
        for page in pages_to_update:
            try:
                api.put(f"pages/{page['id']}", {"html": page["html"]})
                print(f"      [{page['lang']}] {page['title']}  ...updated")
                success += 1
            except Exception as e:
                print(f"      [{page['lang']}] {page['title']}  ...FAILED ({e})")
        print()
        print(f"  Done! {success}/{len(pages_to_update)} pages updated.")
    elif not args.apply:
        print("[4/4] Dry run — no changes applied.")
        print("      Run with --apply to update BookStack pages.")
    else:
        print("[4/4] No pages need updating.")
    print()


if __name__ == "__main__":
    main()
