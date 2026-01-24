# Documentation metrics dashboard

**Last updated:** 2026-01-17

## Automation status

- ✅ Scheduled metrics updater workflow (monthly + on demand)
- ✅ Documentation issue auto-labeling and triage workflow
- ✅ Stale documentation issue management workflow

## Health metrics

| Metric | Definition | Target | Current | Notes |
| --- | --- | --- | --- | --- |
| Active docs | Number of non-archived Markdown files | +10% QoQ | 70 | Run monthly count script |
| Broken links | Failed link checks in CI | 0 | TBD | Auto-updated from docs-quality workflow |
| Average doc age | Days since last update | < 90 days | 0.2 days | Use git log |
| TODO count | TODO tags in docs | < 10 | 0 | Use rg "TODO" |

## Quality metrics

| Metric | Definition | Target | Current | Notes |
| --- | --- | --- | --- | --- |
| CI pass rate | Docs-quality workflow success | 95%+ | TBD | Auto-updated from last 20 runs |
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

## Feedback metrics

| Metric | Definition | Target | Current | Notes |
| --- | --- | --- | --- | --- |
| Issues opened | Documentation issues opened | Track trend | 0 | GitHub issues with [DOCS] tag |
| Issues closed | Documentation issues resolved | Track trend | 0 | Closed issues this month |
| Average resolution time | Time from open to close | < 7 days | N/A | Track median time |
| Discussion posts | GitHub discussion activity | Track trend | 0 | Doc-related discussions |
| High priority items | Critical doc issues | < 5 | 0 | Blocking issues |
