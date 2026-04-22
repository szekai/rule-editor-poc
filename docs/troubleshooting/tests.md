# Running Tests

Learn how to run and manage tests for the application.

## Test Framework

The application uses:
- **Vitest** - Test runner
- **@testing-library/react** - React component testing

## Running Tests

### Basic Commands

```bash
# Run all tests in watch mode (default)
npm test

# Run tests once (for CI)
npm run test:run

# Run tests with UI
npm run test:ui
```

### Running Specific Tests

```bash
# Run specific test file
npx vitest run src/components/__tests__/RuleSetEditor.test.js

# Run tests matching a pattern
npx vitest run --grep "duplication"

# Run specific test
npx vitest run src/services/__tests__/spelValidationService.test.js
```

## Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── RuleSetEditor.test.js
│   │   └── RuleSetEditor.integration.test.jsx
│   └── RuleSetEditor.js
├── services/
│   ├── __tests__/
│   │   ├── spelValidationService.test.js
│   │   ├── spelValidationServiceFixed.test.js
│   │   └── spelValidationReal.test.js
│   └── spelValidationService.js
└── ...
```

## Writing Tests

### Test File Example

```javascript
import { describe, it, expect, beforeEach } from "vitest";

describe("Feature Name", () => {
  let state;
  
  beforeEach(() => {
    state = initialState;
  });
  
  it("should handle specific case", () => {
    const result = someFunction(input);
    expect(result).toHaveLength(expected);
    expect(result[0].name).toBe("Expected");
  });
});
```

## Test Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests in watch mode |
| `npm run test:run` | Run tests once (CI mode) |
| `npm run test:ui` | Run tests with Vitest UI |

### Vitest CLI Options

```bash
# Watch mode (default)
npx vitest

# Run once
npx vitest run

# Update snapshots
npx vitest -u

# Coverage
npx vitest --coverage
```

## Troubleshooting Tests

### Tests Not Running

**Issue:** `npm test` doesn't start.

**Solution:**
```bash
# Check vitest is installed
npx vitest --version

# Reinstall if needed
npm install
```

---

### All Tests Failing

**Issue:** All tests failing after changes.

**Common causes:**
- Breaking changes to shared code
- Test environment issues

**Solution:**
```bash
# Run tests in isolation
npm run test:run

# Check for console errors
```

---

### Watch Mode Issues

**Issue:** Tests not re-running on file changes.

**Solution:**
- Check file path is correct
- Ensure you're in project root
- Try restarting: Ctrl+C then `npm test`

---

## Test Configuration

### vitest.config.js

```javascript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.js"],
    globals: true,
  },
});
```

---

## Best Practices

### Writing Tests

1. **One concern per test** - Each test should verify one behavior
2. **Clear test names** - Name tests descriptively
3. **Arrange, Act, Assert** - Structure tests clearly
4. **Isolate tests** - Tests should not depend on each other

### Running Tests

1. **Run before committing** - Always run tests before pushing
2. **Fix failures immediately** - Don't let tests fail
3. **Use watch mode during development** - See results as you code

---

## CI Integration

For continuous integration:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
```

---

## Next Steps

- [Debug Mode](debug-mode.md)
