# ADR-0004: Information Architecture

- Status: Accepted
- Date: 2026-07-14
- Provenance: plan §11; ratified in issue #3 grilling (2026-07-14).

## Decision

OKF v0.1 is the canonical knowledge record: provenance-bearing Markdown versioned by Git. A derived SQLite index (full-text and metadata) is rebuildable from the canonical record at any time. OKF Markdown follows Obsidian-compatible rules: flat Markdown files, frontmatter, and optional wikilinks. Canonical and derived are never confused: loss of the derived index is recoverable; loss of canonical Markdown is not.

## Consequences

This realizes the "biri hafıza, biri işlemci" stance: Git-versioned Markdown is the durable memory; the SQLite index is a fast derived view. Obsidian compatibility keeps the knowledge human-navigable outside the app. The derived index can be deleted and rebuilt without data loss.