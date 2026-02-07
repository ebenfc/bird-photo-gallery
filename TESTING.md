# Testing Guide

## Overview

This project now has automated testing set up using Jest and React Testing Library. The test suite includes unit tests for critical validation schemas and utility functions.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Current Test Coverage

### ✅ Validation Schemas ([src/lib/__tests__/validation.test.ts](src/lib/__tests__/validation.test.ts))
- **57 tests** covering all Zod validation schemas
- Tests for: Species, Photos, Pagination, Query Parameters, Bird Lookup
- Validates error messages, data transformations, and edge cases
- **High-value tests** that prevent API bugs before they reach production

### ✅ Image Processing ([src/lib/__tests__/image.test.ts](src/lib/__tests__/image.test.ts))
- Tests for image upload processing pipeline
- Mocks Sharp and EXIF libraries to avoid file system dependencies
- Validates filename generation, EXIF extraction, error handling
- **Security-critical** tests for file processing

## Test Structure

```
src/
├── lib/
│   ├── validation.ts
│   ├── image.ts
│   └── __tests__/
│       ├── validation.test.ts      # ✅ 56 tests
│       └── image.test.ts            # ✅ 13 tests
└── app/
    └── api/
        └── [route]/
            └── __tests__/
                └── route.test.ts    # 🔜 Add API route tests here
```

## Writing New Tests

### Unit Tests for Utilities

Create a `__tests__` directory next to the file you want to test:

```typescript
// src/lib/myutil.ts
export function multiply(a: number, b: number): number {
  return a * b;
}

// src/lib/__tests__/myutil.test.ts
import { multiply } from '../myutil';

describe('multiply', () => {
  it('should multiply two numbers', () => {
    expect(multiply(2, 3)).toBe(6);
  });
});
```

### Testing Validation Schemas

Use the existing validation tests as a template:

```typescript
import { MySchema } from '../validation';

describe('MySchema', () => {
  it('should accept valid data', () => {
    const result = MySchema.parse({ field: 'value' });
    expect(result.field).toBe('value');
  });

  it('should reject invalid data', () => {
    expect(() => MySchema.parse({ field: '' })).toThrow();
  });
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing API Routes (Advanced)

API route testing requires additional setup for Next.js server components. For now, focus on:
1. Testing the business logic functions used by routes
2. Testing validation schemas used by routes
3. Testing database queries in isolation

Example:
```typescript
// Instead of testing the route handler directly:
// ❌ import { GET } from '../route';

// Test the logic separately:
// ✅ import { processData } from '../logic';
```

## Next Steps to Expand Test Coverage

### High Priority (Security & Correctness)
1. **Test database query functions**
   - Mock the database layer
   - Test query building and data transformations

3. **Test Wikipedia lookup** ([src/lib/wikipedia.ts](src/lib/wikipedia.ts))
   - Mock fetch calls
   - Test data parsing

### Medium Priority (Reliability)
4. **Test Supabase integration** ([src/lib/supabase.ts](src/lib/supabase.ts))
   - Mock Supabase client
   - Test upload/delete operations

5. **Test activity tracking** ([src/lib/activity.ts](src/lib/activity.ts))
   - Test heatmap calculation
   - Test timeline generation

6. **Add component tests**
   - PhotoModal, UploadModal, SpeciesAssignModal
   - Use React Testing Library
   - Test user interactions

### Low Priority (Nice to Have)
7. **Add E2E tests** with Playwright
   - Full user workflows
   - Upload, tag, filter photos

8. **Integration tests for API routes**
   - Requires proper Next.js test environment
   - Test full request/response cycle

## Configuration Files

- [jest.config.ts](jest.config.ts) - Jest configuration with Next.js integration
- [jest.setup.ts](jest.setup.ts) - Global test setup and polyfills
- [package.json](package.json) - Test scripts and dependencies

## CI/CD Integration

Tests can be added to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
```

## Troubleshooting

### Tests fail with "Cannot find module"
- Check that Jest path aliases match [tsconfig.json](tsconfig.json)
- Ensure all imports use `@/*` for src files

### Tests fail with Web API errors (Request, Response, etc.)
- Check [jest.setup.ts](jest.setup.ts) has proper polyfills
- Next.js server components need Web API mocks

### Slow tests
- Use `jest.mock()` to mock external dependencies
- Avoid actual file system or network operations
- Use in-memory implementations

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [Zod Testing Patterns](https://zod.dev/)

## Coverage Goals

Current: **57 tests** covering validation and image processing

Target milestones:
- **Phase 1** (Current): Core utilities and validation ✅
- **Phase 2** (1-2 days): Auth, database, API integrations (aim for 100+ tests)
- **Phase 3** (1 week): Component tests (aim for 150+ tests)
- **Phase 4** (Ongoing): E2E tests with Playwright

## Known Issues & Future Improvements

1. **Validation Schema Bug**: Whitespace-only strings pass `min(1)` check before `.trim()`
   - Issue in [src/lib/validation.ts:11](src/lib/validation.ts#L11)
   - Should use `.trim().min(1)` order instead of `.min(1).transform(trim)`

2. **API Route Testing**: Requires additional setup for Next.js server environment
   - For now, test business logic separately from route handlers
   - Consider moving complex logic out of route files for easier testing

3. **Image Processing Security**: No magic byte validation before Sharp processing
   - Sharp provides some protection by failing on invalid images
   - Consider adding explicit magic byte checks in [src/lib/image.ts](src/lib/image.ts)

---

**Remember**: Tests are your safety net. Write them before you need them! 🧪
