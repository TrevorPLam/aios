# Waiver: Boundary Exception for Shared Utility

**Waives**: Cross-feature import restriction (BOUNDARIES.md Article 13)  
**Why**: Shared date formatting utility needed by multiple features. Creating a new platform package would be over-engineering for a simple utility function.  
**Scope**: 
- File: `packages/features/calendar/utils/dateFormatter.ts`
- Imported by: `packages/features/contacts/ui/ContactCard.tsx`, `packages/features/tasks/ui/TaskItem.tsx`
- Impact: Low - utility function only, no business logic

**Owner**: [Human Name]  
**Expiration**: 2024-06-15  
**Remediation Plan**: 
- Extract to `packages/platform/utils/dateFormatter.ts` by 2024-06-01
- Update all imports to use platform package
- Remove waiver after migration complete

**Link**: PR #456 - Contact list UI enhancement

**Notes**: Auto-generated waiver for gate failure. Temporary exception while refactoring to platform layer.
