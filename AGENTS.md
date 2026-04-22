# AGENTS.md - SpEL Rule Editor Development Guide

This document provides guidelines and instructions for agents working on this codebase.

## Project Overview

- **Framework**: Next.js 15 with React 19
- **Purpose**: SpEL (Spring Expression Language) Rule Editor with visual rule set composition
- **Key Libraries**: MUI v7, Monaco Editor, React DnD, TanStack React Query, spel2js
- **Styling**: MUI Theme + Emotion + Tailwind CSS v4

---

## Build / Test Commands

### Development
```bash
npm run dev          # Start dev server with turbopack on localhost:3000
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint (Next.js core-web-vitals config)
```

### Testing (Vitest)
```bash
npm test             # Run all tests in watch mode
npm run test:run     # Run all tests once (CI mode)
npm run test:ui      # Run tests with Vitest UI browser
```

#### Running a Single Test
```bash
# Run specific test file
npx vitest run src/components/__tests__/RuleSetEditor.test.js

# Run tests matching a pattern
npx vitest run --grep "duplication"

# Run specific test in watch mode
npx vitest src/components/__tests__/RuleSetEditor.test.js
```

### Path Aliases
Use `@/*` to reference files from `src/`:
```javascript
import { mockApi } from "@/utils/mockApi";
import spelValidationService from "@/services/spelValidationService";
```

---

## Code Style Guidelines

### General
- **Language**: JavaScript (no TypeScript in this project)
- **Line Length**: Soft limit ~100 characters; use judgment for readability
- **Semicolons**: Required
- **Quotes**: Double quotes for strings
- **Indentation**: 2 spaces

### Imports
- Group imports in this order:
  1. React/core imports (`react`, hooks)
  2. Third-party libraries (MUI, React Query, React DnD, etc.)
  3. Internal imports (services, hooks, utils)
  4. Relative imports (local components)
- Use named exports for utilities and hooks
- Use default exports for page components and main component files
- Alphabetize imports within each group

```javascript
// Example import ordering
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Paper, Typography, Box } from "@mui/material";
import { mockApi } from "@/utils/mockApi";
import { useSpelValidation } from "@/hooks/useSpelValidation";
import { SpelExpressionEvaluator } from "spel2js";
```

### Component Structure
- Functional components with hooks
- Destructuring props at function signature
- Use early returns for guard clauses (loading states, error states)
- Keep components focused; extract sub-components when complex

```javascript
// Sub-component for complex UI patterns
const DraggableItem = ({ item, onDelete, disabled = false }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.RULE,
    canDrag: !disabled,
  }));
  
  if (disabled) return null;
  
  return (
    <Card ref={drag} sx={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* ... */}
    </Card>
  );
};

const MainComponent = () => {
  const [state, setState] = useState(initialValue);
  
  if (isLoading) {
    return <CircularProgress />;
  }
  
  // Helper functions defined as const
  const handleAction = useCallback(() => {
    setState(prev => ({ ...prev, updated: true }));
  }, []);
  
  return (
    <Box>
      <DraggableItem item={item} onDelete={handleAction} />
    </Box>
  );
};
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `RuleSetEditor`, `DraggableItem` |
| Hooks | camelCase with `use` prefix | `useSpelValidation`, `useSpelContext` |
| Services | camelCase | `spelValidationService`, `mockApi` |
| Utilities | camelCase | `findNonDuplicatedRules` |
| Constants | SCREAMING_SNAKE_CASE | `ItemType.RULE`, `SPEL_API_CONFIG` |
| Event handlers | `handle` prefix | `handleDrop`, `handleSaveClick` |
| Boolean variables | `is`/`has`/`can` prefix | `isLoading`, `hasError`, `canDrag` |
| CSS properties | kebab-case | `border-color`, `text-align` |

### State Management
- Use `useState` for local component state
- Use `useRef` for mutable values that don't trigger re-renders (avoid stale closures)
- Use `useCallback` for functions passed as props or used in effects
- Use `useQuery`/`useMutation` from React Query for server state
- Keep state as close to where it's used as possible

### Error Handling
- Always wrap async operations in try/catch
- Provide fallback values for failed operations
- Use meaningful error messages
- Show user-friendly error feedback via Snackbar/Alert components

```javascript
const createRuleSetMutation = useMutation({
  mutationFn: mockApi.createRuleSet,
  onSuccess: () => {
    queryClient.invalidateQueries(["ruleSets"]);
    showSnackbar("Rule set created successfully!");
  },
  onError: (error) => {
    showSnackbar("Error creating rule set: " + error.message, "error");
  },
});
```

### MUI Components
- Import specific components from `@mui/material` (tree-shaking)
- Import icons from `@mui/icons-material` with specific icon names
- Use `sx` prop for inline styling
- Use `Box` as a generic wrapper
- Use MUI color tokens: `primary.main`, `secondary.light`, `grey.500`, etc.

```javascript
import {
  Button,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";

<Box sx={{ display: "flex", gap: 2, p: 3 }}>
  <Typography variant="h4">Title</Typography>
  <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
    Save
  </Button>
</Box>
```

### React DnD Patterns
- Define `ItemType` constants for draggable item types
- Use `useDrag` hook for draggable items
- Use `useDrop` hook for drop targets
- Handle `collect` function for drag state

```javascript
const ItemType = {
  RULE: "rule",
  RULE_SET: "rule_set",
};

const [{ isDragging }, drag] = useDrag(() => ({
  type: ItemType.RULE,
  item: { ...item, sourceType: type },
  canDrag: !disabled,
  collect: (monitor) => ({
    isDragging: !!monitor.isDragging(),
  }),
}));
```

### Testing Patterns
- Use Vitest with `describe`/`it`/`expect` from `vitest`
- Use `@testing-library/react` for component tests
- Mock external dependencies (APIs, libraries)
- Test pure logic functions separately from UI components

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

### File Organization
```
src/
├── app/                    # Next.js app router pages
│   ├── page.js            # Home page
│   ├── layout.js          # Root layout
│   ├── globals.css        # Global styles + Tailwind
│   └── rule-editor/
│       └── page.js        # Rule editor page
├── components/            # React components
│   ├── RuleSetEditor.js  # Main component
│   ├── __tests__/        # Component tests
│   └── __tests__/*.test.jsx  # Can also use .jsx extension
├── services/             # Business logic/services
│   ├── spelValidationService.js
│   └── __tests__/        # Service tests
├── hooks/                # Custom React hooks
│   └── useSpelValidation.js
├── utils/                # Utility functions
│   └── mockApi.js
└── test-setup.js         # Vitest setup file
```

---

## Key Libraries Reference

### TanStack React Query
```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["rules"],
  queryFn: mockApi.getRules,
});

const mutation = useMutation({
  mutationFn: mockApi.createRule,
  onSuccess: () => queryClient.invalidateQueries(["rules"]),
});
```

### spel2js (SpEL Parser)
```javascript
import { SpelExpressionEvaluator } from "spel2js";

try {
  SpelExpressionEvaluator.compile(expression);
  return { valid: true };
} catch (error) {
  return { valid: false, error: error.message };
}
```

---

## Common Patterns

### Avoiding Stale Closures
Use refs to access current state in callbacks:
```javascript
const currentStateRef = useRef([]);
useEffect(() => {
  currentStateRef.current = currentState;
}, [currentState]);

const handleAction = () => {
  const current = currentStateRef.current;
  // Use current state without closure issues
};
```

### Debounced Operations
```javascript
const debounceRef = useRef(null);
useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    performOperation();
  }, debounceMs);
  return () => clearTimeout(debounceRef.current);
}, [dependency]);
```

### Stable Sort for Priority
```javascript
const sortedItems = [...items].sort((a, b) => {
  const priorityDiff = (a.priority || 0) - (b.priority || 0);
  if (priorityDiff !== 0) return priorityDiff;
  return a.id.localeCompare(b.id); // Stable secondary sort
});
```

---

## Environment Variables
```
REACT_APP_SPEL_API_URL      # Backend API URL (optional)
REACT_APP_USE_MOCK_SPEL     # Use mock validation (default: true)
```

---

## Important Notes

1. **No TypeScript**: This project uses plain JavaScript - do not add `.ts`/`.tsx` files
2. **React 19**: Uses the latest React with new patterns; check compatibility
3. **Next.js App Router**: Use `app/` directory for pages and layouts
4. **Tailwind v4**: Uses `@tailwindcss/postcss` with CSS-based config (`@import "tailwindcss"`)
5. **Mock Data**: All data is in-memory; persists only during session
