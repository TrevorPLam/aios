# ADR-005: Analytics system architecture

**Status:** Accepted
**Date:** 2026-01-18
**Context:** PR #94 and earlier

## Context

AIOS requires comprehensive analytics to track user behavior, feature usage, and system performance. The analytics system needs to:

- Handle high-volume event tracking without impacting app performance
- Support advanced analytics features (A/B testing, funnels, user properties)
- Maintain user privacy and comply with data protection regulations
- Provide developer tools for testing and debugging
- Work across mobile platforms (iOS, Android, Web)

## Decision

Implement a custom analytics system (`apps/mobile/analytics/`) with the following architecture:

1. **Client-side SDK** (`client.ts`)
   - Event capture and validation
   - Queue management for offline support
   - Batching and retry logic

2. **Advanced Features** (`advanced/`)
   - A/B test assignment and tracking
   - Funnel analysis
   - Group analytics
   - Screen tracking with React Navigation
   - User properties management

3. **Privacy and Security** (`sanitizer.ts`)
   - PII detection and removal
   - Data anonymization
   - Consent management

4. **Developer Tools** (`devtools/`)
   - CLI for analytics inspection
   - CI integration for testing
   - Testing utilities and fixtures

5. **Quality Assurance**
   - Comprehensive test coverage (buckets, queue, sanitizer, taxonomy)
   - TypeScript for type safety
   - Event taxonomy validation

## Alternatives Considered

### 1. Third-party Analytics (e.g., Mixpanel, Amplitude)

#### Pros

- Mature, battle-tested systems
- Rich feature sets out of the box
- Professional support

### Cons

- Vendor lock-in
- Higher cost at scale
- Less control over data privacy
- Limited customization

**Why rejected:** Need full control over data handling and privacy compliance

### 2. Google Analytics / Firebase Analytics

#### Pros (2)

- Free for most use cases
- Integration with other Google services
- Mobile SDKs available

### Cons (2)

- Privacy concerns with data sharing
- Limited customization
- Complex API for advanced features

**Why rejected:** Privacy concerns and need for custom event taxonomy

### 3. Basic logging to own backend

#### Pros (3)

- Full control
- Simple implementation
- No external dependencies

### Cons (3)

- No advanced features (funnels, A/B testing, etc.)
- Manual implementation of all features
- Requires significant development effort

**Why rejected:** Insufficient feature set for product needs

## Consequences

### Positive

- **Full control** over data and privacy
- **Customizable** to exact product needs
- **Cost-effective** - no per-event pricing
- **Offline support** - queue and batch events
- **Developer-friendly** - CLI tools and testing utilities
- **Type-safe** - TypeScript throughout
- **Well-tested** - comprehensive test coverage

### Negative

- **Maintenance burden** - team owns the entire system
- **Feature development** - advanced features require custom implementation
- **No built-in dashboards** - requires separate visualization layer
- **Limited ecosystem** - can't leverage third-party integrations easily

### Mitigations

- Comprehensive testing to reduce maintenance issues
- Modular architecture allows incremental feature development
- Can integrate with visualization tools (e.g., Grafana, Metabase)
- Document thoroughly to enable team contributions

## Implementation Notes

Key files:

- `apps/mobile/analytics/client.ts` - Main analytics client
- `apps/mobile/analytics/advanced/` - Advanced analytics features
- `apps/mobile/analytics/devtools/` - Developer tooling
- `apps/mobile/analytics/__tests__/` - Test suite

Dependencies:

- TypeScript for type safety
- React Navigation for screen tracking
- AsyncStorage for queue persistence

## Related Decisions

- ADR-001: Use AsyncStorage (supports analytics queue)
- ADR-002: React Native (mobile analytics requirements)

## References

- Analytics implementation: `apps/mobile/analytics/`
- Documentation: `docs/analytics/`
- Tests: `apps/mobile/analytics/__tests__/`

---

**Accepted by:** Development team
**Implementation:** Complete in apps/mobile/analytics/

