# Turnstar Holdings Limited financial and rental portfolio demo

Frontend-only HTML, Bootstrap 5, external CSS and vanilla JavaScript. No backend, APIs, database, authentication or live data. This workspace copy is the only project edited.

## Run
Open index.html directly, or use VS Code Live Server. Bootstrap 5.3.3, Bootstrap Icons, Chart.js 4.4.7 and Manrope load from CDNs and require internet access. Charts show a fallback if Chart.js cannot load. Run checks with node tests/export.test.cjs and node tests/data.test.cjs.

## Published financial data
Financial Overview opens by default. Seven cards always show consolidated Group results, in BWP, for the year ended 31 January 2026. Property and cash are reporting-date balances; other headline figures are annual flows. YoY is percentage change. Cash has no comparative because none was verified. Operating profit uses the supplied detailed consolidated statement definition, including exchange losses. Regional selection affects only rental revenue; other Group metrics are never allocated to fictional properties or tenants. Financial CSV includes all Group metrics and the selected regional rental figures with year, scope, unit, data basis and source URL.

Sources reviewed: https://turnstar.co.bw/ and https://turnstar.co.bw/annual-reports/ and https://www.linkedin.com/company/turnstar-holdings-limited . The linked https://turnstar.co.bw/turnstar-annual-report-2026/ failed to load through the research tool. Figures therefore use the user-supplied verified detailed-statement values; independent PDF verification remains outstanding. No inconsistent website summary figures were substituted. A text wordmark is used because a verified logo asset was not obtained. Suggested blue UI colours are not an official brand specification.

## Rental assumptions
The registry contains 12 selectable property/components in Botswana, Tanzania and UAE. Mlimani City is a separate parent development with four components; the parent is not counted again. Demo portfolio counts do not claim to be the definitive public property inventory. Geography is not treated as subsidiary ownership.

60 deterministic fictional sample units are linked to the registry; these are not a complete unit inventory. All monetary values are BWP-equivalent demo amounts, not actual foreign lease currencies or live conversions. Occupied rental income excludes vacant asking amounts. Service charges vary independently of rent (P300 to P1,040); parking and other charges also vary. No uniform levy percentage is assumed. Fictional totals do not reconcile to published annual revenue.

The fixed calculation reference is 12 October 2026. Occupied leases have 36-month terms with expiries and final scheduled escalations spread from November 2026 to October 2027. Demonstration escalations occur on expiry dates, never after expiry; rates vary from 3% to 6%. Vacant records have no tenant or active dates and a zero escalation rate.

## Interaction
Rental hierarchy: company → region → property/component → tenant/unit. A shared selection state sets parents and clears incompatible descendants. Occupancy, expiry and escalation filters combine using AND. Breadcrumbs clear descendants while retaining restrictions; Clear filters clears restrictions; Reset also clears hierarchy and table search. Table search is table-only and applies to CSV across all pages. Both exports use UTF-8 BOM, CSV escaping and formula-injection protection, preserving navigation, filters and theme. Theme preference uses turnstar-theme.

See verification.md for executed checks and limitations, and design-notes.md for UI decisions.

## Dashboard styling update
The external assets/css/redesign.css stylesheet refines the shell, section heading actions, three-plus-four financial KPI layout, regional pills, grouped annual comparisons, contribution donut and financial summary table. Light remains the default; saved theme preferences and toggle remain available. Run node tests/presentation.test.cjs for focused presentation integration checks. See verification.md for browser QA limitations.
