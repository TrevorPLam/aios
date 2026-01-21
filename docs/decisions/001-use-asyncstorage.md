# ADR-001: Use AsyncStorage for local persistence

**Status:** Accepted
**Date:** 2026-01-16

## Context

AIOS needs offline-first persistence for mobile experiences. The storage solution must be available on both iOS and Android, integrate with React Native, and keep operational overhead low.

## Decision

Use AsyncStorage as the baseline local persistence layer for mobile data.

## Consequences

- Provides a cross-platform, React Native-native storage API.
- Works without backend connectivity for core workflows.
- Requires careful serialization and size management for larger datasets.
- Keeps options open to migrate to SQLite or a hybrid model later.
