# Common Errors

This guide covers common errors and their solutions.

## SpEL Syntax Errors

### Unexpected Token

**Error:**
```
Unexpected token: <identifier>
```

**Cause:** Invalid syntax in expression.

**Fix:** Check for typos, missing operators, or invalid characters.

```
# Wrong
transaction.amount >

# Correct
transaction.amount > 10000
```

---

### Cannot Resolve Property

**Error:**
```
Cannot resolve property 'amounr'
```

**Cause:** Typo in property name or property doesn't exist.

**Fix:** Verify property name is correct.

```
# Wrong
transaction.amounr > 10000

# Correct
transaction.amount > 10000
```

---

### Expecting ')'

**Error:**
```
Expecting ')' at position 20
```

**Cause:** Missing closing parenthesis.

**Fix:** Add closing parenthesis.

```
# Wrong
(transaction.amount > 10000

# Correct
(transaction.amount > 10000)
```

---

## Application Errors

### Server Won't Start

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Port 3000 is already in use.

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or start on different port
PORT=3001 npm run dev
```

---

### Module Not Found

**Error:**
```
Error: Cannot find module 'spel2js'
```

**Cause:** Dependencies not installed.

**Solution:**
```bash
npm install
```

---

### Build Fails

**Error:**
```
Error: Build failed
```

**Common causes and solutions:**

| Cause | Solution |
|-------|----------|
| Outdated Node.js | Upgrade to Node.js 18+ |
| Corrupted node_modules | Delete and reinstall: `rm -rf node_modules && npm install` |
| Syntax errors | Check terminal for specific errors |
| Memory issues | Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build` |

---

## Rule Editor Errors

### Rule Won't Save

**Possible causes:**

1. **Empty name:** Fill in the rule name field
2. **Empty condition:** Enter a SpEL expression
3. **Invalid SpEL:** Fix syntax errors in the Monaco Editor

**Solution:** Check validation messages in the form.

---

### Validation Not Working

**Issue:** Real-time validation not showing errors.

**Possible causes:**

1. Using mock mode (expected behavior)
2. Network issues with real backend
3. spel2js library not loading

**Solution:**
- Verify in console: `console.log(spelValidationService.getConfig())`
- Check browser console for errors

---

## Rule Set Composer Errors

### Can't Drag Items

**Possible causes:**

1. Browser doesn't support HTML5 drag and drop
2. JavaScript error in console
3. Touch device (not supported)

**Solution:**
- Use a desktop browser
- Check console for errors
- Refresh the page

---

### Duplicate Not Allowed

**Error message:**
```
"Rule Name" is already in the rule set
```

**Cause:** Adding a rule that's already in the composition.

**Solution:**
- Remove the existing rule first
- Or add a different rule

---

### Cyclic Dependency

**Error message:**
```
Cannot add "Rule Set A" - would create circular dependency
```

**Cause:** Adding a rule set that would reference itself.

**Solution:**
- Choose a different rule set
- Copy individual rules instead

---

## Browser Compatibility

### Recommended Browsers

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Known Issues

- **Safari**: Some drag-and-drop issues on older versions
- **Firefox**: Occasional Monaco Editor rendering issues
- **IE**: Not supported

---

## Data Issues

### Data Not Persisting

**Issue:** Rules or rule sets disappear on refresh.

**Cause:** Mock data is in-memory only.

**Solution:** This is expected behavior in the POC. Data resets on each page refresh.

---

### Can't Find Rules

**Issue:** Previously created rules don't appear.

**Possible causes:**
1. Page was refreshed (data reset)
2. Different browser session
3. Cache issue

**Solution:** Clear browser cache or try incognito mode.

---

## Getting Help

If you encounter an error not listed here:

1. Check browser console (F12 → Console)
2. Check terminal for server errors
3. Search existing issues
4. Try refreshing the page

---

## Next Steps

- [Running Tests](tests.md)
- [Debug Mode](debug-mode.md)
