# Turnstar demo design notes

Reuse of the existing responsive sidebar, seven-card rental grid, table pagination, shared hierarchy, chart renderer, theme management and CSV safeguards. Added a separate financial overview and separate financial dataset. Compact text wordmark, one section title and one supporting line. Blue-led palette with green occupied and amber vacant states; neutral zero-event cards. Light and dark token sets also drive chart labels, grids and tooltips. No decorative gradients.

Published Group annual flows and reporting-date balances are separate from illustrative monthly rental records. Financial regional selection only updates verified rental measures. Demo portfolio counts describe the registry, not definitive company counts. Rental source assumptions and access limits are documented in README.md and the on-page Sources / About Data panel.

## October 2026 visual redesign

Used the attached tablet dashboard image for shell proportions, compact information grouping and chart hierarchy. The supplied Behance URL was inaccessible through the research tool. The Turnstar adaptation uses a 232px navy sidebar, restrained blue accents, white or dark cards, three headline KPIs plus four supporting KPIs on desktop, an 8/4 revenue and regional contribution composition, two supporting comparison panels, and an exact-value Group financial table. Regional pills replace the financial dropdown. Section heading actions contain the theme toggle and section-specific CSV export. Comparisons are labelled vs FY2025; higher finance costs remain an attention condition. Responsive layouts and reduced-motion rules are in assets/css/redesign.css. No figures or rental calculations were changed.

## Edge-to-edge dashboard
The dashboard spans the browser width with square outside edges and a full-height navy sidebar. The workspace has a 32px top-left curve where it meets the sidebar; that curve disappears when the sidebar is collapsed or mobile offcanvas. Internal padding and shared component corner tokens remain. The page scrolls normally, and only the existing table wrapper scrolls horizontally.

## Header space refinement
Removed the separate empty hamburger toolbar band. The hamburger now aligns beside the financial heading or rental breadcrumbs, with actions remaining alongside the heading where space allows. Main content uses the available workspace width. Narrow screens stack financial actions, retaining room for labels and a 44px menu target.

## Scroll-aware sidebar arrow
The existing sidebar toggle arrow stays visible on load and near the top, hides after about 60px of downward movement, and returns after 12px of upward movement. Its click handler is unchanged. The control becomes non-interactive and leaves keyboard navigation when hidden; focus prevents hiding. Visibility resets on section and rental hierarchy navigation. A single passive listener follows the active window or workspace scroller, and requestAnimationFrame coalesces updates. Motion uses a 180ms fade and vertical shift, disabled under reduced-motion preference.

## Manrope typography
Manrope weights 400, 500, 600 and 700 load with display=swap and are applied to the dashboard, Bootstrap components and Chart.js. The existing Turnstar wordmark keeps its Segoe UI face. Page titles are 30px (28px on narrow phones), section headings 18px, and KPI values 28?34px. Financial numerals use tabular lining figures. At narrow desktop widths financial KPIs use three columns; phones up to 440px use a single KPI column so larger amounts can wrap without clipping. Chart construction waits for the font and remeasures after loading.
