# GitHub Pages Performance After Thumbnail Variant Migration - 2026-05-30

## Scope

Production site: https://microsoft-elevate.com  
Measurement time: 2026-05-30 15:55-16:00 KST

The thumbnail variant data migration is complete in Cosmos DB. The current branch build succeeded in GitHub Actions, but the GitHub Pages deploy job failed when manually dispatched from `perf/github-pages-performance`; production HTML still referenced `/assets/index-CbPlHYwd.js` during this measurement.

## Comparison Against 2026-05-30 Baseline

| Route | Metric | Before | After | Change |
|---|---|---:|---:|---:|
| `/m365` mobile | Performance score | 71 | 73 | +2 |
| `/m365` mobile | LCP | 91.61s | 5.34s | -86.27s |
| `/m365` mobile | CLS | 0.000 | 0.123 | +0.123 |
| `/m365` mobile | Total byte weight | 36,039 KiB | 431 KiB | -35,608 KiB |
| `/program-news` mobile | Performance score | 94 | 97 | +3 |
| `/program-news` mobile | LCP | 1.87s | 1.85s | -0.02s |
| `/program-news` mobile | Total byte weight | 10,387 KiB | 621 KiB | -9,766 KiB |
| post detail desktop | Performance score | 89 | 88 | -1 |
| post detail desktop | LCP | 1.00s | 1.02s | +0.02s |
| post detail desktop | CLS | 0.205 | 0.205 | 0.000 |
| post detail desktop | Total byte weight | 1,255 KiB | 1,255 KiB | 0 KiB |

## Lighthouse Summary

| Route | Form Factor | Score | LCP | CLS | Total Byte Weight |
|---|---|---:|---:|---:|---:|
| `/m365` | Mobile | 73 | 5.34s | 0.123 | 431 KiB |
| `/program-news` | Mobile | 97 | 1.85s | 0.000 | 621 KiB |
| post detail | Desktop | 88 | 1.02s | 0.205 | 1,255 KiB |

## Verification

- Public API returned signed `thumbnail.variants` URLs after the single-post migration.
- `/m365` public API returned 22 posts with thumbnail variants.
- Post-execution dry-run scanned 75 legacy Blob thumbnail documents and planned 0 additional migrations.
- Lighthouse artifacts were generated under `lighthouse/`.

## Notes

- Existing thumbnails now expose `thumbnail.variants`.
- List pages materially reduced transferred image bytes after data migration.
- The branch deployment did not complete because GitHub Pages deploy failed on the manual workflow run from `perf/github-pages-performance` (`run 26677308988`); build succeeded, deploy failed before steps ran.
- Post detail desktop CLS remains above the 0.1 target because the frontend CLS fix is not yet deployed to production.
