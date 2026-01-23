# Contributing to AIOS

Thank you for your interest in contributing to AIOS! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Agent Responsibility Model](#agent-responsibility-model)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Documentation](#documentation)

## Code of Conduct

Be respectful, inclusive, and professional in all interactions. Please read and follow the
[Code of Conduct](CODE_OF_CONDUCT.md) to help keep the community welcoming.

## Agent Responsibility Model

AIOS uses a **Unified AGENT Ownership** model for development. Understanding this model is essential for all contributors.

### AGENT

**Role:** Full-stack feature delivery across platforms

### Responsibilities

- Builds all original features, screens, components, and business logic
- Delivers iOS, Android, and Web compatibility as needed
- Owns architectural decisions
- Adds platform-specific adaptations when required
- Tests on the platforms relevant to the task scope

### Workflow

1. Receives task from P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md (Owner: AGENT)
2. Implements the feature with platform compatibility in mind
3. Tests on required platforms
4. Merges PR with implementation and documentation updates

### For Human Contributors

#### If you're contributing features

- Follow the unified AGENT workflow
- Keep platform compatibility requirements in scope from the start
- Document platform-specific decisions and test coverage

### See also

- [Constitution - Agent Responsibility Model](/.repo/policy/CONSTITUTION.md)
- [Best Practices Guide](BESTPR.md) - Token-optimized quick reference for agents
- [AI Contribution Policy](docs/ai/ai_contribution_policy.md)
- [Repository Policies](/.repo/policy/)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Expo CLI
- iOS Simulator (Mac) or Android Studio

### Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/aios.git
   cd aios
   ```text

3. Add upstream remote:

   ```bash
   git remote add upstream https://github.com/TrevorPowellLam/aios.git
   ```text

4. Install dependencies:

   ```bash
   npm install
   ```text

5. Copy environment variables:

   ```bash
   cp .env.example .env
   ```text

6. Start development:

   ```bash
   # Terminal 1 - Start mobile app
   npm run expo:dev

   # Terminal 2 - Start server
   npm run server:dev
   ```text

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name develop
```text

### Keeping Your Branch Updated

```bash
git fetch upstream
git rebase upstream/develop
```text

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all props and data structures
- Avoid `any` type - use `unknown` if type is truly unknown
- Use strict mode

### React / React Native

- Use functional components with hooks
- Use memo() for expensive component renders
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)

### Code Style

We use ESLint and Prettier for code formatting. Before committing:

```bash
npm run lint:fix
npm run format
```text

### Component Structure

```typescript
// 1. Imports
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

// 3. Component
export default function MyComponent({ title, onPress }: MyComponentProps) {
  // Hooks first
  const [state, setState] = useState('');

  // Event handlers
  const handlePress = () => {
    onPress?.();
  };

  // Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}

// 4. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```text

### Design System

Follow the design guidelines in `design_guidelines.md`:

- Use theme colors from `constants/theme.ts`
- Use spacing constants instead of magic numbers
- Follow the typography scale
- Use Feather icons (no emojis)
- Implement haptic feedback for interactions

## Commit Guidelines

### Commit Message Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```text

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(planner): add task priority sorting

Add ability to sort tasks by priority level in the planner view.
Includes new sorting toggle in header.

Closes #123
```text

```bash
fix(calendar): correct timezone handling

Fix incorrect timezone conversion for all-day events.
Events now display correctly across different timezones.
```text

## Pull Request Process

### Before Submitting

1. **Update from upstream:**

   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```text

1. **Run checks:**

   ```bash
   npm run lint
   npm run check:types
   npm run check:format
   ```text

1. **Test your changes:**
   - Test on iOS simulator/device
   - Test on Android emulator/device
   - Verify no console errors
   - Test edge cases

2. **Update documentation:**
   - Update README if needed
   - Add JSDoc comments to new functions
   - Update relevant .md files

### Creating the PR

1. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```text

1. Go to GitHub and create a Pull Request

2. Fill out the PR template:
   - **Title:** Clear, concise description
   - **Description:** What changes and why
   - **Screenshots:** For UI changes
   - **Testing:** How you tested
   - **Checklist:** Complete all items

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] All checks pass
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```text

### Review Process

- At least one approval required
- All CI checks must pass
- Address all review comments
- Keep the PR focused and small
- Be responsive to feedback

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```text

### Writing Tests

- Test user interactions, not implementation
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Aim for 70%+ coverage

### Test Structure

```typescript
describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };

    // Act
    const { getByText } = render(<MyComponent {...props} />);

    // Assert
    expect(getByText('Test')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    // Arrange
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent title="Test" onPress={onPress} />);

    // Act
    fireEvent.press(getByText('Test'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```text

## Documentation

### Code Documentation

Use JSDoc for functions and complex logic:

```typescript
/**
* Formats a date relative to now (e.g., "2 hours ago")
* @param date - ISO date string
* @returns Formatted relative date string
 */
export function formatRelativeDate(date: string): string {
  // implementation
}
```text

### Documentation Files

Update relevant documentation:

- `README.md` - For user-facing changes
- `MISSING_FEATURES.md` - When implementing missing features
- `IMPLEMENTATION_ROADMAP.md` - When completing roadmap items
- `design_guidelines.md` - For design system changes
- `CHANGELOG.md` - For user-facing changes, noteworthy fixes, and release notes

### Changelog updates

Why: consistent release notes keep releases auditable and reversible.

1. Add entries under **[Unreleased]** using the Added/Changed/Fixed/Removed/Security headings.
2. Include the TODO or PR reference in each bullet when available.
3. Move **[Unreleased]** entries into a dated version section during release.

### Documentation standards

- Follow the style guide in `docs/STYLE_GUIDE.md`.
- Use templates from `docs/.templates/` when creating new docs.
- Keep internal links relative and include the `.md` extension.

### Documentation review process

#### PR requirements
- [ ] Documentation changes pass the docs-quality GitHub Actions workflow
- [ ] Links validate (no broken links)
- [ ] Spelling checks pass or are documented
- [ ] Screenshots included for UI-related documentation updates

### Review checklist
- [ ] Accurate and up to date
- [ ] Clear and concise
- [ ] Consistent with the style guide
- [ ] Uses the appropriate template
- [ ] References updated or added

## Areas Needing Contributions

Check out these areas where we especially need help:

### High Priority

- [ ] Backend API implementation
- [ ] AI integration
- [ ] Test coverage
- [ ] Database integration
- [ ] Authentication system

### Medium Priority

- [ ] Search functionality
- [ ] Data export/import
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Error handling

### Low Priority

- [ ] Additional themes
- [ ] Animations and transitions
- [ ] AI personality onboarding (see P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md T-057)
- [ ] Settings enhancements

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Tag issues appropriately (bug, enhancement, question, etc.)
- Be patient and respectful

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to AIOS! 🚀
