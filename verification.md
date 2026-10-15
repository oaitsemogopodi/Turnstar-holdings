# Verification ? Turnstar demo

Executed 13 October 2026:

- node tests/data.test.cjs: passed. FY2026 and FY2025 regional revenues reconcile to Group totals; seven Group metrics; no cash comparative; financial CSV scopes and years; 60 stable unit IDs; property links; charge sums; 36-month leases; escalations never beyond expiry; vacant tenant/date/rate rules; occupied-only income; upcoming 3/6/12-month events; every region, property and tenant selection; breadcrumb clearing; combined empty state.
- node tests/export.test.cjs: passed. Download blob, UTF-8 BOM, filenames, regional/property/unit scopes, combined filters, table search across pagination, vacant asking fields, added currency/data basis columns, CSV commas/quotes/newlines, spreadsheet formula guards, empty-export handling and URL cleanup.
- node --check for every application JS file: passed.
- Scanned active project files for previous branding and old source notes; removed unused original dataset and logo.

Limitations: no available browser surfaces were returned by computer-use inventory. Desktop/tablet/mobile rendering, interactive theme contrast, CDN availability and browser console were not visually verified. Existing responsive breakpoints and chart-theme event handling were retained. JavaScript syntax and isolated logic tests do not substitute for those browser checks.

The official 2026 annual-report link failed to load in research. Financial figures use the supplied detailed-statement values; independent PDF verification and any cash comparative remain outstanding.

## Redesign checks ? 15 October 2026

Executed node tests/data.test.cjs and node tests/export.test.cjs: passed. Executed node tests/presentation.test.cjs: verifies template generation, seven KPI cards, grouped financial series, contribution donut, pill selection, theme-button identity across rerenders, section navigation and Sources entry. The renderer is also exercised with a Chart.js test double for series, labels, tooltips and theme updates. All application JavaScript files pass node --check. Data structures and calculation code were retained.

The Behance URL was inaccessible; the attached screenshot was inspected for design direction. No browser-control tools are exposed in this session. Responsive rules cover desktop, tablet and mobile; rendered overflow, both-theme screenshots and browser console checks remain unverified. The presentation test uses a minimal DOM test double and does not claim browser rendering validation.

## Rounded layout checks
Existing data, CSV, presentation and chart-renderer checks passed after the frame change. All application JavaScript syntax checks passed. Structural checks confirmed balanced frame markup and CSS, shared corner tokens, desktop/mobile gutters, sticky navigation, collapsed-grid rules and unclipped frame/card containers. No financial data, calculations, filter logic or exports changed.

The supplied reference image was inspected in the conversation. Desktop/mobile screenshots and light/dark rendered inspection remain unverified because no browser-control or computer-use runtime tool is exposed in this session. Structural checks do not establish that rendered clipping and overflow are absent.

## Edge-to-edge layout update

The data, export, presentation and chart-renderer suites pass unchanged. Structural CSS checks confirm zero outer margin/padding, full viewport width and minimum height, square wrapper, flush desktop sidebar, inner workspace curve, and square collapsed/mobile workspace. No data or interaction code was modified. Rendered desktop/mobile inspection in light and dark themes remains unavailable because this session exposes no browser-control tool; structural checks cannot prove the absence of visual overflow.

## Scroll-aware arrow checks

Executed node tests/back-button-visibility.test.cjs: passed for initial and near-top visibility, 60px downward and 12px upward thresholds, small movement suppression, focus/blur behaviour, tabindex and aria restoration, navigation reset, passive listener replacement, and a scrollable workspace path. The data, presentation and CSV suites also pass. Browser scrolling and rendered mobile behaviour could not be visually inspected because this session has no browser-control tool.

## Manrope typography checks

The Google Fonts link requests 400/500/600/700 with display=swap; both preconnect links are present. node tests/font-loading.test.cjs passes, including delayed chart construction and remeasurement. Existing data, export, presentation and scroll-control suites pass. Static CSS inspection confirms tabular numerals and narrow-width KPI breakpoints. Rendered light/dark desktop and mobile clipping checks remain unverified because no browser-control tool is exposed in this session.
