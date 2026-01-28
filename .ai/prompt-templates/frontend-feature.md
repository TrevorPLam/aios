# Frontend Feature Template

When creating a new feature:

1. **Create feature package**: `packages/features/[feature-name]/`
2. **Structure**:
   - `data/` - Data access layer
   - `domain/` - Business logic and types
   - `ui/` - React components
   - `index.ts` - Public exports

3. **Follow DDD patterns**:
   - Domain layer is framework-agnostic
   - Data layer handles storage/API calls
   - UI layer handles presentation

4. **Use design system**: Import components from `packages/design-system/`
