# Verification ? Turnstar demo

Executed 13 October 2026:

- node tests/data.test.cjs: passed. FY2026 and FY2025 regional revenues reconcile to Group totals; seven Group metrics; no cash comparative; financial CSV scopes and years; 60 stable unit IDs; property links; charge sums; 36-month leases; escalations never beyond expiry; vacant tenant/date/rate rules; occupied-only income; upcoming 3/6/12-month events; every region, property and tenant selection; breadcrumb clearing; combined empty state.
- node tests/export.test.cjs: passed. Download blob, UTF-8 BOM, filenames, regional/property/unit scopes, combined filters, table search across pagination, vacant asking fields, added currency/data basis columns, CSV commas/quotes/newlines, spreadsheet formula guards, empty-export handling and URL cleanup.
- node --check for every application JS file: passed.
- Scanned active project files for previous branding and old source notes; removed unused original dataset and logo.

Limitations: no available browser surfaces were returned by computer-use inventory. Desktop/tablet/mobile rendering, interactive theme contrast, CDN availability and browser console were not visually verified. Existing responsive breakpoints and chart-theme event handling were retained. JavaScript syntax and isolated logic tests do not substitute for those browser checks.

The official 2026 annual-report link failed to load in research. Financial figures use the supplied detailed-statement values; independent PDF verification and any cash comparative remain outstanding.
