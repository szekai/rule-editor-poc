# API Configuration

Learn how to configure the SpEL validation API.

## Overview

The application can use either:
- **Mock API**: Built-in simulation (default)
- **Real API**: Backend service for validation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐      ┌─────────────────────┐      │
│  │  Rule Editor UI    │      │  Rule Set Composer │      │
│  └──────────┬──────────┘      └──────────┬──────────┘      │
│             │                             │                  │
│             ▼                             ▼                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           spelValidationService                      │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ Configuration (REACT_APP_USE_MOCK_SPEL)    │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │                        │                           │    │
│  │         ┌──────────────┴──────────────┐              │    │
│  │         ▼                             ▼              │    │
│  │  ┌─────────────────┐      ┌─────────────────────┐   │    │
│  │  │  Mock Service  │      │   Real API Client   │   │    │
│  │  │ (built-in)      │      │  (when configured) │   │    │
│  │  └─────────────────┘      └─────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Mock Mode (Default)

```javascript
// In code or environment
REACT_APP_USE_MOCK_SPEL=true
```

The mock service provides:
- Syntax validation using spel2js
- Simulated responses
- No network calls

### Real API Mode

```javascript
REACT_APP_USE_MOCK_SPEL=false
REACT_APP_SPEL_API_URL=https://api.example.com/spel
```

The application calls your backend for validation.

## API Endpoints

When using real API, the following endpoints are called:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/validate` | POST | Validate SpEL expression |
| `/validate/live` | POST | Real-time validation |
| `/validate/batch` | POST | Multiple expressions |
| `/context` | GET | Available context objects |
| `/health` | GET | Service availability |

### Request Format

```json
POST /api/spel/validate
{
  "expression": "transaction.amount > 10000",
  "contextCategory": "business"
}
```

### Response Format

```json
{
  "valid": true,
  "error": null,
  "result": "true",
  "resultType": "Boolean",
  "executionSuccessful": true,
  "executionTimeMs": 15
}
```

### Error Response

```json
{
  "valid": false,
  "error": "Cannot resolve property 'amounr'",
  "suggestions": ["Did you mean 'amount'?"]
}
```

## Switching Between Modes

### At Runtime

You can switch modes programmatically:

```javascript
import spelValidationService from "./services/spelValidationService";

// Switch to real API
spelValidationService.useRealApi("https://api.example.com");

// Switch back to mock
spelValidationService.useMockApi();
```

### Check Current Mode

```javascript
const config = spelValidationService.getConfig();
console.log(config);
// { useMock: true, baseUrl: "...", status: "mock" }
```

## CORS Configuration

When using real API, ensure your backend allows CORS:

```javascript
// Express example
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
```

---

## Next Steps

- [Mock vs Real Backend](mock-vs-real.md)
- [Troubleshooting](../troubleshooting/common-errors.md)
