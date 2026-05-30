# Thumbnail Variant Migration - 2026-05-30

## Scope

Existing Azure Blob post thumbnails were migrated to responsive WebP variants.

## Commands

- Dry-run inventory: `dry-run-all.jsonl`
- Single-post execution: `execute-one.jsonl`
- `/m365` execution: `execute-m365.jsonl`
- Full execution: `execute-all.jsonl`
- Post-execution verification: `dry-run-post-execute.jsonl`

## Result

| Phase | Changed | Skipped | Failed |
|---|---:|---:|---:|
| single post | 1 | 0 | 0 |
| m365 | 21 | 1 | 0 |
| all | 53 | 22 | 0 |
| post-execute dry-run | 0 | 75 | 0 |

## Verification

- Public API returned signed `thumbnail.variants` URLs for the controlled single-post migration.
- `/m365` public API returned 22 posts with thumbnail variants after the category batch.
- Post-execution dry-run scanned 75 legacy Blob thumbnail documents and planned 0 additional migrations.

## Notes

- Cosmos DB public network access was temporarily enabled for IP `167.220.233.35`.
- The original Cosmos DB state before temporary access was `publicNetworkAccess: Disabled` with no IP rules.
- The raw JSONL audit files are operational artifacts and are not committed.
