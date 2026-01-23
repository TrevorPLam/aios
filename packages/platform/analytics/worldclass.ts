/**
 * World-Class Analytics Features
 *
 * This file exports all advanced analytics features.
 * Many features are stubs/TODO and require implementation.
 *
 * Implementation Status:
 * ✅ = Complete
 * 🚧 = In Progress / Partial
 * 📝 = Stub / TODO
 */

// ===== DATA QUALITY (Tier 1) =====
export { EventDeduplicator } from "./quality/deduplication"; // ✅ Complete
export { EventSampler } from "./quality/sampling"; // 📝 Stub
export { RuntimeValidator } from "./quality/validation"; // 📝 Stub

// ===== PERFORMANCE (Tier 1) =====
export { PayloadCompressor } from "./performance/compression"; // ✅ Complete
export { GeoRouter } from "./performance/geoRouting"; // 📝 Stub

// ===== ADVANCED FEATURES (Tier 1) =====
export { UserPropertiesManager } from "./advanced/userProperties"; // ✅ Complete
export { GroupAnalytics } from "./advanced/groups"; // 📝 Stub
export { ScreenTracker } from "./advanced/screenTracking"; // 📝 Stub
export { FunnelTracker } from "./advanced/funnels"; // 📝 Stub
export { ABTestTracker } from "./advanced/abTests"; // 📝 Stub

// ===== RELIABILITY (Tier 2) =====
export { CircuitBreaker, CircuitState } from "./reliability/circuitBreaker"; // ✅ Complete
export { DeadLetterQueue } from "./reliability/deadLetterQueue"; // ✅ Complete

// ===== OBSERVABILITY (Tier 2 - Critical) =====
export { EventInspector } from "./observability/inspector"; // 📝 Stub
export { MetricsCollector } from "./observability/metrics"; // 📝 Stub

// ===== PLUGINS / EXTENSIBILITY (Tier 2) =====
export { PluginManager, type Plugin } from "./plugins/manager"; // 📝 Stub
export { DestinationRouter, type Destination } from "./plugins/destinations"; // 📝 Stub

// ===== SCHEMA MANAGEMENT (Tier 2) =====
export { SchemaVersionManager } from "./schema/versioning"; // 📝 Stub

// ===== PRIVACY & COMPLIANCE (Tier 3) =====
export { ConsentManager } from "./privacy/consent"; // 📝 Stub
export { RetentionManager } from "./privacy/retention"; // 📝 Stub
export { DeletionManager } from "./privacy/deletion"; // 📝 Stub

// ===== DEVELOPER TOOLS (Tier 3) =====
export { MockAnalyticsClient } from "./devtools/testing"; // 📝 Stub
// CLI and CI tools are script-based, not exported

// ===== PRODUCTION READINESS (Tier 3) =====
export { ProductionMonitor } from "./production/monitoring"; // 📝 Stub
export { SLICalculator, ANALYTICS_SLOS } from "./production/slo"; // 📝 Stub
export { FeatureFlagManager } from "./production/featureFlags"; // 📝 Stub
