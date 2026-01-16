# Documentation metrics dashboard

**Last updated:** 2026-01-16

## Health metrics

| Metric | Definition | Target | Current | Notes |
| --- | --- | --- | --- | --- |
| Active docs | Number of non-archived Markdown files | +10% QoQ | TBD | Run monthly count script |
| Broken links | Failed link checks in CI | 0 | TBD | Tracked in CI |
| Average doc age | Days since last update | < 90 days | TBD | Use git log |
| TODO count | TODO tags in docs | < 10 | TBD | Use rg "TODO" |

## Quality metrics

| Metric | Definition | Target | Current | Notes |
| --- | --- | --- | --- | --- |
| CI pass rate | Docs-quality workflow success | 95%+ | TBD | Track via GitHub Actions |
| Review cycle time | Time from PR open to merge | < 5 days | TBD | GitHub insights |
| Issue resolution time | Time to close doc issues | < 14 days | TBD | GitHub insights |
| User satisfaction | Survey rating | 4/5+ | TBD | Quarterly survey |

## Usage metrics

| Metric | Definition | Target | Current | Notes |
| --- | --- | --- | --- | --- |
| Most viewed docs | Top 5 docs by views | Track trend | TBD | Requires analytics |
| Search queries | Top 5 search terms | Track trend | TBD | Requires search telemetry |
| Time on page | Median time per doc | Track trend | TBD | Requires analytics |
| Bounce rate | Single-page sessions | Track trend | TBD | Requires analytics |

## Collection cadence
- Update monthly in the first week.
- Capture CI pass rate per release.
- Review trends quarterly.
