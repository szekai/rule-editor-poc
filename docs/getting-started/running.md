# Running the Application

This guide explains how to start and run the SpEL Rule Editor application in development mode.

## Development Server

### Starting the Server

To start the development server:

```bash
npm run dev
```

This command will:
1. Compile the application
2. Start the Next.js development server
3. Enable hot-reloading for instant changes

### Accessing the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3000
```

You should see the home page with a "Launch Rule Editor" button.

```
┌─────────────────────────────────────────┐
│           SpEL Rule Editor               │
│                                          │
│   Welcome to SpEL Rule Editor POC       │
│                                          │
│   [🚀 Launch Rule Editor]               │
│                                          │
└─────────────────────────────────────────┘
```

### Development Server Features

| Feature | Description |
|---------|-------------|
| Hot Reloading | Changes to code automatically reload the page |
| Error Overlay | Shows compilation errors in the browser |
| Source Maps | Debug with original source code |

## Available npm Scripts

The following npm scripts are available:

```bash
# Development
npm run dev          # Start dev server (turbopack on localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:ui      # Run tests with UI

# Linting
npm run lint         # Run ESLint
```

## Running Tests

To run the test suite:

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run
```

For more details, see [Running Tests](../troubleshooting/tests.md).

## Environment Variables

By default, the application uses mock data. To configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_SPEL_API_URL` | (none) | Backend API URL |
| `REACT_APP_USE_MOCK_SPEL` | `true` | Use mock validation |

For more details, see [Environment Variables](../configuration/environment-variables.md).

## Stopping the Server

To stop the development server:

- Press `Ctrl + C` (or `Cmd + C` on macOS) in the terminal

## Next Steps

- [Building for Production](building.md)
- [First Rule Tutorial](../tutorials/first-rule.md)
