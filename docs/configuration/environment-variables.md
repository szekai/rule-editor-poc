# Environment Variables

This guide documents all environment variables used by the application.

## Overview

Environment variables configure the application behavior without changing code.

## Setting Environment Variables

### Development

Create a `.env.local` file in the project root:

```
REACT_APP_USE_MOCK_SPEL=true
REACT_APP_SPEL_API_URL=http://localhost:8080
```

### Production

Set variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Docker: Use `-e` flag or docker-compose
- Node.js: Use process environment

## Available Variables

### REACT_APP_SPEL_API_URL

| Property | Value |
|----------|-------|
| Default | (none) |
| Required | No |
| Description | Backend API URL for SpEL validation |

**Usage:**

```bash
REACT_APP_SPEL_API_URL=https://api.example.com/spel
```

**When to set:**
- When connecting to a real backend
- Not needed when using mock validation

### REACT_APP_USE_MOCK_SPEL

| Property | Value |
|----------|-------|
| Default | `true` |
| Required | No |
| Values | `true`, `false` |

**Usage:**

```bash
# Use mock validation (default)
REACT_APP_USE_MOCK_SPEL=true

# Use real backend
REACT_APP_USE_MOCK_SPEL=false
```

**When to set:**
- `true`: Development and testing
- `false`: When real backend is available

## Example Configurations

### Development (Default)

```
# .env.local
REACT_APP_USE_MOCK_SPEL=true
```

Uses built-in mock validation - no backend needed.

### Development with Backend

```
# .env.local
REACT_APP_USE_MOCK_SPEL=false
REACT_APP_SPEL_API_URL=http://localhost:8080/api/spel
```

Uses local backend for validation.

### Production

```
# Production environment
REACT_APP_USE_MOCK_SPEL=false
REACT_APP_SPEL_API_URL=https://api.production.com/spel
```

Uses production backend.

## Viewing Current Config

The application displays the current configuration:

```
┌─────────────────────────────────────────────┐
│  SpEL Validation Service                   │
│  Status: Mock (development mode)            │
│  API URL: Not configured                     │
└─────────────────────────────────────────────┘
```

## Best Practices

### Security

- **Never commit secrets** to version control
- Use `.env.local` for local development
- Use secure secret storage in production

### Development

- Default to mock mode for development
- Test with real backend before deploying

### Production

- Use environment-specific configs
- Set all required variables
- Verify configuration on startup

---

## Next Steps

- [API Configuration](api-config.md)
- [Mock vs Real Backend](mock-vs-real.md)
