# DealCard Test Suite

This directory contains end-to-end tests for the DealCard application using Playwright.

## Test Coverage

### Authentication Tests (`auth.spec.ts`)
- Login page display and validation
- Signup page display and validation
- Navigation between login and signup
- Form validation (empty fields, required fields)

### Kid Creation Tests (`kid-creation.spec.ts`)
- Add kid form display and validation
- Required field validation (child name)
- Field constraints (name max length, age range, PIN format)
- Navigation (cancel, back to dashboard)
- Form submission with all fields and required fields only

### Navigation Tests (`navigation.spec.ts`)
- Home page display and navigation
- Kid mode page access
- Dashboard navigation
- Responsive design testing (mobile, tablet, desktop)
- Form accessibility (proper labels)

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in CI mode
```bash
npm run test:ci
```

## Test Configuration

Tests are configured in `playwright.config.ts` with:
- Base URL: `http://localhost:3000` (or `PLAYWRIGHT_TEST_BASE_URL` env var)
- Automatic dev server startup
- Screenshots on failure
- Trace on first retry

## CI/CD Integration

Tests run automatically:
- Before every build (`npm run build`)
- On every push to main (GitHub Actions)
- On every pull request (GitHub Actions)

To skip tests during build (not recommended):
```bash
npm run build:no-test
```

## Writing New Tests

1. Create a new file in `tests/` with `.spec.ts` extension
2. Import test utilities: `import { test, expect } from '@playwright/test'`
3. Group related tests with `test.describe()`
4. Write individual test cases with `test()`
5. Use Playwright locators and assertions

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

## Best Practices

- Use semantic locators (role, label, text) instead of CSS selectors
- Test user flows, not implementation details
- Keep tests independent and isolated
- Use descriptive test names
- Test critical paths and edge cases
- Don't test external services (mock them if needed)
