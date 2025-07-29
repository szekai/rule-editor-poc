# SpEL Validation Service Integration Guide

This guide explains how to integrate and use the SpEL validation service in your React application.

## Overview

The SpEL validation service provides:

- **Mock API** (default) - Always returns positive validation results for development
- **Real API** - Connects to your Spring Boot backend for actual SpEL validation
- **Automatic fallback** - Graceful degradation when service is unavailable
- **Real-time validation** - Live feedback as users type
- **Context discovery** - Shows available objects and properties for SpEL expressions

## Quick Start

### 1. Install Dependencies

```bash
npm install @monaco-editor/react @mui/material @emotion/react @emotion/styled
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Start with mock API for development
REACT_APP_USE_MOCK_SPEL=true
REACT_APP_SPEL_API_URL=http://localhost:8080/api/spel
```

### 3. Basic Usage

```javascript
import spelValidationService from "./services/spelValidationService";

// Validate an expression
const result = await spelValidationService.validateExpression(
  "transaction.amount > 1000",
  "business"
);

console.log(result);
// { valid: true, result: true, executionSuccessful: true, ... }
```

### 4. Using React Hooks

```javascript
import { useSpelValidation } from "./hooks/useSpelValidation";

function MyComponent() {
  const { validation, isValidating, isValid } = useSpelValidation(
    "transaction.amount > 1000",
    "business"
  );

  return (
    <div>
      {isValidating && <p>Validating...</p>}
      {validation && (
        <p>{validation.valid ? "✅ Valid" : `❌ ${validation.error}`}</p>
      )}
    </div>
  );
}
```

## API Methods

### Core Validation Methods

#### `validateExpression(expression, contextCategory)`

Comprehensive validation with execution testing.

```javascript
const result = await spelValidationService.validateExpression(
  "transaction.amount > 1000",
  "business"
);
```

#### `validateLive(expression, contextCategory, executeValidation)`

Optimized for real-time feedback during typing.

```javascript
const result = await spelValidationService.validateLive(
  "transaction.amount > 1000",
  "business",
  true // Execute for full validation
);
```

#### `testExpression(expression, testData, contextCategory)`

Test with custom data.

```javascript
const result = await spelValidationService.testExpression(
  "transaction.amount > user.limit",
  {
    transaction: { amount: 1500 },
    user: { limit: 1000 },
  },
  "business"
);
```

### Context Discovery

#### `getContext(category, search, maxDepth)`

Get available SpEL context objects.

```javascript
const context = await spelValidationService.getContext("business");
// Returns available objects like transaction, user, etc.
```

### Batch Operations

#### `validateBatch(expressions, contextCategory)`

Validate multiple expressions at once.

```javascript
const results = await spelValidationService.validateBatch(
  [
    "transaction.amount > 1000",
    "user.role == 'ADMIN'",
    "transaction.currency in {'USD', 'EUR'}",
  ],
  "business"
);
```

## React Hooks

### `useSpelValidation(expression, contextCategory, options)`

Real-time validation hook with debouncing.

```javascript
const {
  validation, // Validation result object
  isValidating, // Loading state
  isServiceAvailable, // Service status
  validateExpression, // Manual validation function
  testWithData, // Test with custom data
  getContext, // Get available context
  isValid, // Boolean: is expression valid
  hasError, // Boolean: has validation error
  suggestions, // Array of suggestions
  executionTime, // Execution time in ms
} = useSpelValidation(expression, contextCategory, {
  debounceMs: 300, // Debounce delay
  enableLiveValidation: true, // Use live validation
  enableExecutionValidation: true, // Test execution
  autoValidate: true, // Auto-validate on change
});
```

### `useSpelContext(category)`

Context discovery hook.

```javascript
const {
  context, // Available context objects
  isLoading, // Loading state
  error, // Error message
  loadContext, // Load context function
  refreshContext, // Refresh current context
  searchContext, // Search context with filter
} = useSpelContext("business");
```

### `useSpelBatchValidation()`

Batch validation hook.

```javascript
const {
  results, // Array of validation results
  isValidating, // Loading state
  validateBatch, // Validate function
  clearResults, // Clear results
  validCount, // Number of valid expressions
  errorCount, // Number of invalid expressions
  totalCount, // Total expressions validated
} = useSpelBatchValidation();
```

### `useSpelServiceConfig()`

Service configuration hook.

```javascript
const {
  config, // Current configuration
  serviceStatus, // Service availability
  isMock, // Is using mock API
  checkServiceStatus, // Check if service is available
  switchToRealApi, // Switch to real backend
  switchToMockApi, // Switch to mock API
  refreshConfig, // Refresh configuration
} = useSpelServiceConfig();
```

## Switching Between Mock and Real API

### Programmatically

```javascript
// Switch to real API
spelValidationService.useRealApi("http://localhost:8080/api/spel");

// Switch back to mock
spelValidationService.useMockApi();

// Check current configuration
const config = spelValidationService.getConfig();
console.log(config.status); // "mock" or "real"
```

### Environment Variables

```bash
# Development (mock)
REACT_APP_USE_MOCK_SPEL=true

# Production (real API)
REACT_APP_USE_MOCK_SPEL=false
REACT_APP_SPEL_API_URL=https://api.yourcompany.com/api/spel
```

### Runtime Switching (in UI)

```javascript
function ApiConfigPanel() {
  const { isMock, switchToRealApi, switchToMockApi } = useSpelServiceConfig();

  const handleSwitchToReal = () => {
    const url = prompt("Enter API URL:", "http://localhost:8080/api/spel");
    if (url) switchToRealApi(url);
  };

  return (
    <div>
      <p>Current mode: {isMock ? "Mock" : "Real"}</p>
      <button onClick={handleSwitchToReal}>Switch to Real API</button>
      <button onClick={switchToMockApi}>Switch to Mock API</button>
    </div>
  );
}
```

## Integration with Monaco Editor

```javascript
import { Editor } from "@monaco-editor/react";
import { useSpelValidation } from "./hooks/useSpelValidation";

function SpelEditor({ value, onChange }) {
  const { validation, isValidating, suggestions } = useSpelValidation(value);

  return (
    <div>
      {/* Validation Status */}
      {validation && (
        <div className={validation.valid ? "success" : "error"}>
          {validation.valid ? "✅ Valid" : `❌ ${validation.error}`}
        </div>
      )}

      {/* Monaco Editor */}
      <Editor
        height="200px"
        language="javascript"
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          lineNumbers: "on",
          automaticLayout: true,
        }}
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h4>Suggestions:</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Backend Integration

When you're ready to connect to your real Spring Boot backend:

1. **Update environment variables:**

   ```bash
   REACT_APP_USE_MOCK_SPEL=false
   REACT_APP_SPEL_API_URL=http://localhost:8080/api/spel
   ```

2. **Ensure your backend implements these endpoints:**

   - `POST /api/spel/validate` - Full validation
   - `POST /api/spel/validate/live` - Live validation
   - `GET /api/spel/context` - Context discovery
   - `POST /api/spel/validate/batch` - Batch validation

3. **Backend should return this format:**
   ```json
   {
     "valid": true,
     "error": null,
     "result": "true",
     "resultType": "Boolean",
     "executionSuccessful": true,
     "executionTimeMs": 15.5,
     "suggestions": [],
     "warnings": []
   }
   ```

## Error Handling

The service automatically handles errors and provides fallbacks:

```javascript
try {
  const result = await spelValidationService.validateExpression(expression);
  // Use result
} catch (error) {
  // Service automatically returns error structure:
  // { valid: false, error: "Service unavailable", suggestions: [...] }
}
```

## Testing the Integration

Use the provided example component:

```javascript
import SpelValidationExample from "./components/SpelValidationExample";

function App() {
  return (
    <div>
      <SpelValidationExample />
    </div>
  );
}
```

This component demonstrates all validation methods and allows you to test API switching.

## Production Checklist

- [ ] Set `REACT_APP_USE_MOCK_SPEL=false`
- [ ] Configure correct `REACT_APP_SPEL_API_URL`
- [ ] Test backend connectivity
- [ ] Verify error handling
- [ ] Check performance with real data
- [ ] Monitor validation service availability

## Troubleshooting

### Service Not Available

- Check if backend is running
- Verify API URL configuration
- Check network connectivity
- Review CORS settings

### Validation Errors

- Check expression syntax
- Verify available context objects
- Review backend logs
- Test with simpler expressions

### Performance Issues

- Increase debounce delay
- Disable execution validation for live feedback
- Use batch validation for multiple expressions
- Implement caching in backend

## Support

For issues and questions:

1. Check browser console for detailed error logs
2. Use `spelValidationService.getConfig()` to verify configuration
3. Test with mock API to isolate issues
4. Review backend API documentation
