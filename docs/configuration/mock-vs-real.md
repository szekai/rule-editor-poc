# Mock vs Real Backend

Understand when and how to use mock validation versus a real backend.

## Overview

| Mode | Use Case | Network Calls |
|------|----------|---------------|
| Mock | Development, testing | None |
| Real | Production, integration | Yes |

## Mock Mode

### What It Does

The mock service provides:

1. **Syntax Validation**: Uses spel2js library
   - Checks SpEL syntax
   - Reports parse errors
   - Validates expressions

2. **Simulated Responses**
   - Returns success for valid expressions
   - Returns errors for invalid ones

3. **Mock Context**
   - Provides sample context objects
   - Simulates available properties

### Advantages

- No backend required
- Fast response times
- Easy to develop locally
- No network dependencies

### Limitations

- No real semantic validation
- Limited context support
- Can't validate against actual data
- Mock data only

### When to Use

- Development
- Local testing
- POC/MVP
- Demo environments

### Example

```javascript
// Mock validation result
{
  valid: true,
  error: null,
  result: "true",
  executionTimeMs: 12
}
```

---

## Real Backend Mode

### What It Does

The real backend provides:

1. **Full SpEL Evaluation**
   - Actual expression execution
   - Context-aware validation
   - Runtime type checking

2. **Rich Error Messages**
   - Specific problem identification
   - Suggestions for fixes
   - Detailed error context

3. **Production Features**
   - Logging and monitoring
   - Rate limiting
   - Authentication

### Advantages

- Complete validation
- Real error messages
- Production-ready
- Integration with real systems

### Requirements

- Running backend service
- Proper API endpoints
- Network connectivity

### When to Use

- Production deployments
- Integration testing
- When real validation needed

### Example

```javascript
// Real backend response
{
  valid: true,
  result: "true",
  executionTimeMs: 25,
  context: {
    transaction: { amount: 15000, currency: "USD" },
    user: { role: "ADMIN" }
  }
}
```

---

## Comparison

| Feature | Mock | Real |
|---------|------|------|
| Syntax validation | ✓ | ✓ |
| Expression execution | ✗ | ✓ |
| Context validation | ✗ | ✓ |
| Error suggestions | Limited | Full |
| Response time | <50ms | Network + |
| Setup required | None | Backend |

## Decision Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                 When to Use What?                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ USE MOCK when:                                       │   │
│  │ • Developing locally                                 │   │
│  │ • No backend available                               │   │
│  │ • Testing UI/UX                                     │   │
│  │ • Running automated tests                           │   │
│  │ • Building a POC                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ USE REAL when:                                       │   │
│  │ • Deploying to production                            │   │
│  │ • Need actual business logic                        │   │
│  │ • Integrating with external systems                 │   │
│  │ • Full validation coverage needed                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Switching Modes

### Quick Switch in Code

```javascript
// Development - use mock
spelValidationService.useMockApi();

// Production - use real
spelValidationService.useRealApi("https://api.example.com/spel");
```

### Environment-Based

```javascript
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  spelValidationService.useRealApi(process.env.SPEL_API_URL);
} else {
  spelValidationService.useMockApi();
}
```

---

## Recommendations

### Development Workflow

1. **Start with Mock**: Develop features without backend
2. **Test with Mock**: UI and integration tests pass
3. **Connect Real**: Switch to real backend for integration
4. **Deploy Production**: Use real backend

### Testing Strategy

```javascript
// Test with mock
describe("Rule validation", () => {
  beforeEach(() => spelValidationService.useMockApi());
  // ... tests
});

// Integration tests with real
describe("API integration", () => {
  beforeEach(() => spelValidationService.useRealApi(TEST_URL));
  // ... tests
});
```

---

## Summary

| Need | Solution |
|------|----------|
| Fast local development | Mock |
| No backend available | Mock |
| Production deployment | Real |
| Full validation | Real |
| Integration testing | Real |

---

## Next Steps

- [Environment Variables](environment-variables.md)
- [Troubleshooting](../troubleshooting/common-errors.md)
