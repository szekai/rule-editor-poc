# Debug Mode

Learn how to debug the application effectively.

## Browser DevTools

### Opening DevTools

| Browser | Shortcut |
|---------|----------|
| Chrome | F12 or Cmd+Option+I |
| Firefox | F12 or Cmd+Option+I |
| Safari | Cmd+Option+I (enable first) |

### Console

View logs, errors, and warnings:

```javascript
// Your code
console.log("Debug info:", someValue);
console.error("Error:", error);
console.warn("Warning:", warning);
```

### Network Tab

Inspect API calls:

1. Open DevTools → Network
2. Perform action in app
3. View requests/responses

### React DevTools

Install React DevTools browser extension:

- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Use to:
- Inspect component tree
- View props and state
- Debug rendering issues

---

## Debugging SpEL Validation

### Enable Debug Logging

```javascript
// In spelValidationService.js, logging is enabled by default
// Check console output:

// You should see:
console.log("🔧 Using mock SpEL validation service");
```

### Check Configuration

```javascript
import spelValidationService from "./services/spelValidationService";

const config = spelValidationService.getConfig();
console.log("Current config:", config);
```

### Validation Flow

```javascript
// Check each step

// 1. Check service availability
const isAvailable = await spelValidationService.isServiceAvailable();
console.log("Service available:", isAvailable);

// 2. Validate expression
const result = await spelValidationService.validateExpression(
  "transaction.amount > 10000"
);
console.log("Validation result:", result);
```

---

## Debugging Drag and Drop

### Common Issues

1. **Items not draggable**
   - Check console for errors
   - Verify ItemType constants defined

2. **Drop zone not responding**
   - Check drop handler is bound
   - Verify accept types match

### Debug Tips

```javascript
// Add logging in drop handler
const handleDrop = (item) => {
  console.log("Dropped item:", item);
  console.log("Current composition:", newRuleSet);
  // ... rest of handler
};
```

---

## Debug State Issues

### React State

Use React DevTools to:

1. Inspect component state
2. Find re-render causes
3. Trace state changes

### useRef for Debugging

```javascript
// Add ref to track state
const stateRef = useRef([]);

useEffect(() => {
  console.log("State changed:", newRuleSet);
  stateRef.current = newRuleSet;
}, [newRuleSet]);
```

---

## Network Debugging

### API Calls Not Working

1. Open Network tab
2. Perform action
3. Look for failed requests

### Common Issues

| Issue | Check |
|-------|-------|
| CORS error | Backend allows your origin |
| 404 | Endpoint URL correct |
| 500 | Backend server logs |

---

## VS Code Debugging

### Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Logging Best Practices

### Use Appropriate Log Levels

```javascript
// Debug info
console.debug("Details:", detail);

// General info
console.log("Action:", action);

// Warnings
console.warn("Warning:", warning);

// Errors
console.error("Error:", error);
```

### Remove in Production

Consider removing debug logs before production, or use a logging library with levels.

---

## Common Debug Scenarios

### Issue: Rule Not Validating

1. Check console for errors
2. Verify SpEL syntax
3. Check validation service config

### Issue: Drop Not Working

1. Open console
2. Try dragging
3. Check for errors in drop handler

### Issue: State Not Updating

1. Open React DevTools
2. Check component state
3. Verify state setter is called

---

## Getting Help

When stuck:

1. Check browser console
2. Check terminal for server errors
3. Search for similar issues
4. Try: refresh page, clear cache

---

## Summary

| Tool | Use For |
|------|---------|
| Console | Logs, errors |
| Network | API calls |
| React DevTools | Component state |
| VS Code | Server-side debugging |

---

## Next Steps

- Review [Common Errors](common-errors.md)
