# Developer Guide: SpEL Rule Editor and Rule Set Builder (React + Monaco + DnD)

This guide walks you through setting up and ## 7. Sample Data Structure

For SpEL validation and testing, you can reference common data structures that rules might evaluate against. The specific structure will be provided based on your use case requirements.odebase for building a **SpEL Rule Editor** and **Rule Set Composer UI**, which allows users to:

- Create/edit/delete individual rules written in **Spring Expression Language (SpEL)**
- Validate SpEL expressions using the `spel2js` library (optional: backend validation)
- Drag and drop existing rules into new rule sets

---

## 1. Tech Stack

| Component           | Library / Tool                    |
| ------------------- | --------------------------------- |
| UI Framework        | React + MUI + Tailwind (optional) |
| Editor              | Monaco Editor                     |
| Drag & Drop         | react-dnd                         |
| API Calls & Caching | @tanstack/react-query             |
| SpEL Parser         | spel2js                           |

---

## 2. File Structure

```
project-root/
├── SpelRuleEditor.js     # Rule editor using Monaco Editor
├── RuleSetEditor.js      # Rule composer using drag-and-drop
├── index.js              # Entry component wiring everything
```

---

## 3. Installation

```bash
npm install @monaco-editor/react spel2js react-dnd react-dnd-html5-backend @mui/material @emotion/react @emotion/styled @tanstack/react-query
```

---

## 4. Components Overview

### 🔧 SpelRuleEditor.js

**Purpose:** Allow users to create/edit individual rules.

**Features:**

- Monaco Editor for rich editing of `condition`
- Input fields for `name`, `description`, `errorCode`, `ruleType`
- SpEL validation (currently mocked; optionally call backend or use `spel2js`)
- Save appends rule to local rule list

**Customizable:**

- Replace the `fetch('/api/rules')` and `handleSave()` with real API endpoints.

---

### 🔁 RuleSetEditor.js

**Purpose:** Compose rule sets visually by dragging individual rules and rule sets.

**Features:**

- Uses `react-dnd` for drag-and-drop
- Mocked rules/rule sets (replace with actual APIs)
- Drag rules/sets into a drop zone to form new rule sets
- Remove from drop zone
- Save the rule set

**Customization Points:**

- `fetchRules` and `fetchRuleSets` should call your backend
- `saveRuleSet()` can persist new rule sets

---

### 🧩 index.js

This is the root component where all parts are combined using React Query’s `QueryClientProvider`.

Components:

- `<RuleSetEditor />`
- `<SpelRuleEditor />`
- Optional: `<MakerCheckerTable />`

---

## 5. Future Enhancements

| Feature                       | Description                                                         |
| ----------------------------- | ------------------------------------------------------------------- |
| Backend SpEL Validation       | Add `/api/spel/validate` endpoint using Spring's `ExpressionParser` |
| Maker/Checker Integration     | Use MakerCheckerTable to track rule approvals                       |
| Syntax Highlighting Themes    | Enhance Monaco for better SpEL highlighting                         |
| Rule Type Awareness           | Conditional UI logic based on `ruleType` (validation/execution)     |
| Import/Export YAML/JSON Rules | Allow importing and exporting rules in YAML format                  |

---

## 6. Backend Implementation for SpEL Context Discovery (Spring Boot)

### 6.1. SpEL Context Discovery Controller

```java
@RestController
@RequestMapping("/api/spel")
@Slf4j
public class SpelContextController {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private SpelContextService spelContextService;

    /**
     * Get available SpEL context objects categorized by type
     */
    @GetMapping("/context")
    public ResponseEntity<Map<String, Object>> getSpelContext(
            @RequestParam(defaultValue = "business") String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "3") int maxDepth) {

        try {
            Map<String, Object> context = spelContextService.getContextByCategory(
                category, search, maxDepth);
            return ResponseEntity.ok(context);
        } catch (Exception e) {
            log.error("Error retrieving SpEL context", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all available Spring beans (filtered and organized)
     */
    @GetMapping("/beans")
    public ResponseEntity<Map<String, Object>> getAvailableBeans(
            @RequestParam(required = false) String filter,
            @RequestParam(defaultValue = "false") boolean includeFramework) {

        try {
            Map<String, Object> beans = spelContextService.getFilteredBeans(
                filter, includeFramework);
            return ResponseEntity.ok(beans);
        } catch (Exception e) {
            log.error("Error retrieving beans", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Validate SpEL expression with real context
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateSpel(
            @RequestBody SpelValidationRequest request) {

        try {
            SpelValidationResult result = spelContextService.validateExpression(
                request.getExpression(), request.getContextCategory());
            return ResponseEntity.ok(result.toMap());
        } catch (Exception e) {
            log.error("Error validating SpEL", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
```

### 6.2. SpEL Context Service Implementation

```java
@Service
@Slf4j
public class SpelContextService {

    @Autowired
    private ApplicationContext applicationContext;

    private final Set<String> FRAMEWORK_PACKAGES = Set.of(
        "org.springframework", "org.hibernate", "com.fasterxml",
        "org.apache", "javax", "java.lang", "java.util"
    );

    /**
     * Get context objects organized by business categories
     */
    public Map<String, Object> getContextByCategory(String category,
                                                  String search, int maxDepth) {
        Map<String, Object> result = new HashMap<>();

        switch (category.toLowerCase()) {
            case "business":
                result.put("transaction", createTransactionContext());
                result.put("user", createUserContext());
                result.put("account", createAccountContext());
                break;

            case "system":
                result.put("environment", createEnvironmentContext());
                result.put("security", createSecurityContext());
                result.put("timestamp", createTimestampContext());
                break;

            case "beans":
                result = getBusinessBeans();
                break;

            case "all":
                result.putAll(getContextByCategory("business", search, maxDepth));
                result.putAll(getContextByCategory("system", search, maxDepth));
                break;

            default:
                throw new IllegalArgumentException("Unknown category: " + category);
        }

        // Apply search filter if provided
        if (search != null && !search.trim().isEmpty()) {
            result = filterBySearch(result, search);
        }

        // Limit depth to prevent overwhelming UI
        return limitDepth(result, maxDepth);
    }

    /**
     * Get filtered Spring beans (exclude framework beans by default)
     */
    public Map<String, Object> getFilteredBeans(String filter, boolean includeFramework) {
        Map<String, Object> beans = new HashMap<>();

        String[] beanNames = applicationContext.getBeanDefinitionNames();

        for (String beanName : beanNames) {
            try {
                Object bean = applicationContext.getBean(beanName);
                Class<?> beanClass = bean.getClass();

                // Skip framework beans unless explicitly requested
                if (!includeFramework && isFrameworkBean(beanClass)) {
                    continue;
                }

                // Apply filter if provided
                if (filter != null && !beanName.toLowerCase().contains(filter.toLowerCase())) {
                    continue;
                }

                // Create bean metadata
                Map<String, Object> beanInfo = new HashMap<>();
                beanInfo.put("className", beanClass.getSimpleName());
                beanInfo.put("package", beanClass.getPackage().getName());
                beanInfo.put("methods", getPublicMethods(beanClass));
                beanInfo.put("fields", getPublicFields(beanClass));

                beans.put(beanName, beanInfo);

            } catch (Exception e) {
                log.warn("Could not inspect bean: {}", beanName, e);
            }
        }

        return beans;
    }

    /**
     * Validate SpEL expression against real application context with actual execution
     */
    public SpelValidationResult validateExpression(String expression, String contextCategory) {
        return validateExpressionWithExecution(expression, contextCategory, true);
    }

    /**
     * Enhanced validation method with real execution for comprehensive testing
     */
    public SpelValidationResult validateExpressionWithExecution(
            String expression, String contextCategory, boolean executeExpression) {

        try {
            SpelExpressionParser parser = new SpelExpressionParser();
            Expression spelExpression = parser.parseExpression(expression);

            // Create evaluation context with real beans and data
            StandardEvaluationContext context = createEvaluationContext(contextCategory);

            SpelValidationResult.SpelValidationResultBuilder resultBuilder =
                SpelValidationResult.builder().valid(true);

            if (executeExpression) {
                // Actually execute the expression to validate it works
                try {
                    Object result = spelExpression.getValue(context);
                    resultBuilder
                        .result(result)
                        .resultType(result != null ? result.getClass().getSimpleName() : "null")
                        .executionSuccessful(true);

                    // Add performance metrics
                    long startTime = System.nanoTime();
                    spelExpression.getValue(context); // Execute again for timing
                    long executionTime = System.nanoTime() - startTime;
                    resultBuilder.executionTimeNs(executionTime);

                } catch (SpelEvaluationException evalEx) {
                    // Expression parsed but failed to execute
                    return SpelValidationResult.builder()
                        .valid(false)
                        .error("Execution Error: " + evalEx.getMessage())
                        .executionSuccessful(false)
                        .suggestions(generateExecutionSuggestions(expression, evalEx, context))
                        .availableContext(getContextSummary(context))
                        .build();
                }
            }

            return resultBuilder.build();

        } catch (SpelParseException e) {
            return SpelValidationResult.builder()
                .valid(false)
                .error("Parse Error: " + e.getMessage())
                .position(e.getPosition())
                .suggestions(generateParseSuggestions(expression, e))
                .build();
        } catch (Exception e) {
            return SpelValidationResult.builder()
                .valid(false)
                .error("Unexpected Error: " + e.getMessage())
                .suggestions(List.of("Check expression syntax and available context objects"))
                .build();
        }
    }

    /**
     * Real-time validation endpoint for live feedback during typing
     */
    @PostMapping("/validate/live")
    public ResponseEntity<Map<String, Object>> validateLive(
            @RequestBody SpelLiveValidationRequest request) {

        try {
            // Quick syntax check first (no execution)
            if (request.getExpression().trim().isEmpty()) {
                return ResponseEntity.ok(Map.of("valid", true, "empty", true));
            }

            // Parse only for quick feedback
            SpelValidationResult syntaxResult = validateExpressionWithExecution(
                request.getExpression(), request.getContextCategory(), false);

            if (!syntaxResult.isValid()) {
                return ResponseEntity.ok(syntaxResult.toMap());
            }

            // If syntax is valid and user wants execution validation
            if (request.isExecuteValidation()) {
                SpelValidationResult executionResult = validateExpressionWithExecution(
                    request.getExpression(), request.getContextCategory(), true);
                return ResponseEntity.ok(executionResult.toMap());
            }

            return ResponseEntity.ok(syntaxResult.toMap());

        } catch (Exception e) {
            log.error("Error in live validation", e);
            return ResponseEntity.status(500).body(Map.of(
                "valid", false,
                "error", "Validation service error: " + e.getMessage()
            ));
        }
    }

    /**
     * Generate smart suggestions based on execution context
     */
    private List<String> generateExecutionSuggestions(String expression,
                                                     SpelEvaluationException error,
                                                     StandardEvaluationContext context) {
        List<String> suggestions = new ArrayList<>();
        String errorMessage = error.getMessage().toLowerCase();

        // Property not found suggestions
        if (errorMessage.contains("cannot be resolved")) {
            suggestions.addAll(findSimilarProperties(expression, context));
        }

        // Type mismatch suggestions
        if (errorMessage.contains("cannot be cast") || errorMessage.contains("type")) {
            suggestions.add("Check data types - ensure numbers aren't compared to strings");
            suggestions.add("Use proper type conversion: T(Integer).parseInt(value)");
        }

        // Method not found
        if (errorMessage.contains("method") && errorMessage.contains("cannot be found")) {
            suggestions.addAll(findSimilarMethods(expression, context));
        }

        // Collection access issues
        if (errorMessage.contains("index") || errorMessage.contains("collection")) {
            suggestions.add("Check if collection exists and has elements");
            suggestions.add("Use safe navigation: collection?.get(0)");
        }

        return suggestions;
    }

    /**
     * Find similar property names in context for better error messages
     */
    private List<String> findSimilarProperties(String expression, StandardEvaluationContext context) {
        List<String> suggestions = new ArrayList<>();

        // Extract property names from expression
        Pattern pattern = Pattern.compile("(\\w+)\\.(\\w+)");
        Matcher matcher = pattern.matcher(expression);

        while (matcher.find()) {
            String objectName = matcher.group(1);
            String propertyName = matcher.group(2);

            // Check if object exists in context
            if (context.lookupVariable(objectName) != null) {
                Object obj = context.lookupVariable(objectName);
                if (obj instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) obj;
                    List<String> availableKeys = map.keySet().stream()
                        .map(Object::toString)
                        .filter(key -> calculateSimilarity(key, propertyName) > 0.6)
                        .collect(Collectors.toList());

                    if (!availableKeys.isEmpty()) {
                        suggestions.add("Did you mean: " + objectName + "." + availableKeys.get(0) + "?");
                    }

                    suggestions.add("Available properties for " + objectName + ": " +
                        map.keySet().stream().limit(5).map(Object::toString)
                            .collect(Collectors.joining(", ")));
                }
            } else {
                // Suggest available context objects
                suggestions.add("Object '" + objectName + "' not found. Available objects: " +
                    context.getRootObject().getClass().getDeclaredFields().length > 0 ?
                    Arrays.stream(context.getRootObject().getClass().getDeclaredFields())
                        .map(Field::getName).collect(Collectors.joining(", ")) :
                    "transaction, user, system");
            }
        }

        return suggestions;
    }

    /**
     * Get summary of available context for error messages
     */
    private Map<String, Object> getContextSummary(StandardEvaluationContext context) {
        Map<String, Object> summary = new HashMap<>();

        // Add root object properties
        if (context.getRootObject() != null) {
            summary.put("rootObject", context.getRootObject().getClass().getSimpleName());
        }

        // Add variables (limited to avoid overwhelming response)
        Map<String, Object> variables = new HashMap<>();
        // Note: In real implementation, you'd iterate through context variables
        variables.put("transaction", "Available with: amount, currency, type, status");
        variables.put("user", "Available with: id, role, permissions, department");
        variables.put("system", "Available with: environment, timestamp");

        summary.put("availableVariables", variables);
        return summary;
    }

    /**
     * Simple string similarity calculation
     */
    private double calculateSimilarity(String s1, String s2) {
        int maxLength = Math.max(s1.length(), s2.length());
        if (maxLength == 0) return 1.0;

        return (maxLength - calculateLevenshteinDistance(s1, s2)) / (double) maxLength;
    }

    private int calculateLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i-1) == s2.charAt(j-1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1), dp[i-1][j-1] + cost);
            }
        }

        return dp[s1.length()][s2.length()];
    }

    /**
     * Create evaluation context with real Spring beans and sample data
     */
    private StandardEvaluationContext createEvaluationContext(String category) {
        StandardEvaluationContext context = new StandardEvaluationContext();

        // Add business domain objects
        context.setVariable("transaction", createSampleTransaction());
        context.setVariable("user", createSampleUser());
        context.setVariable("account", createSampleAccount());

        // Add system objects
        context.setVariable("environment", Environment.getActiveProfiles());
        context.setVariable("timestamp", Instant.now());

        // Add selected Spring beans (business logic only)
        if ("beans".equals(category) || "all".equals(category)) {
            addBusinessBeans(context);
        }

        return context;
    }

    /**
     * Add only business-relevant Spring beans to context
     */
    private void addBusinessBeans(StandardEvaluationContext context) {
        String[] beanNames = applicationContext.getBeanDefinitionNames();

        for (String beanName : beanNames) {
            try {
                Object bean = applicationContext.getBean(beanName);

                // Only include business beans (exclude framework beans)
                if (isBusinessBean(bean.getClass())) {
                    context.setVariable(beanName, bean);
                }
            } catch (Exception e) {
                log.debug("Skipping bean: {}", beanName);
            }
        }
    }

    /**
     * Check if bean is a business bean (not framework)
     */
    private boolean isBusinessBean(Class<?> beanClass) {
        String packageName = beanClass.getPackage().getName();

        // Include only beans from your application packages
        return packageName.startsWith("com.yourcompany") ||
               packageName.startsWith("com.yourdomain") ||
               (beanClass.isAnnotationPresent(Service.class) ||
                beanClass.isAnnotationPresent(Repository.class) ||
                beanClass.isAnnotationPresent(Component.class)) &&
               !isFrameworkBean(beanClass);
    }

    /**
     * Check if bean is from framework packages
     */
    private boolean isFrameworkBean(Class<?> beanClass) {
        String packageName = beanClass.getPackage().getName();
        return FRAMEWORK_PACKAGES.stream()
            .anyMatch(packageName::startsWith);
    }

    // Helper methods for creating sample contexts...
    private Object createTransactionContext() {
        return Map.of(
            "id", "TXN-001",
            "amount", 15000.0,
            "currency", "USD",
            "type", "TRANSFER",
            "status", "PENDING"
        );
    }

    private Object createUserContext() {
        return Map.of(
            "id", "USR-001",
            "role", "ADMIN",
            "permissions", List.of("READ", "WRITE", "APPROVE"),
            "department", "FINANCE"
        );
    }

    // Additional helper methods...
}
```

### 6.3. Data Transfer Objects

```java
@Data
@Builder
public class SpelValidationRequest {
    private String expression;
    private String contextCategory;
    private Map<String, Object> additionalContext;
}

@Data
@Builder
public class SpelLiveValidationRequest {
    private String expression;
    private String contextCategory;
    private boolean executeValidation; // Whether to actually execute for validation
    private Map<String, Object> testData; // Optional test data override
}

@Data
@Builder
public class SpelValidationResult {
    private boolean valid;
    private String error;
    private Object result;
    private String resultType;
    private Integer position;
    private List<String> suggestions;
    private List<String> warnings;

    // Enhanced execution details
    private boolean executionSuccessful;
    private Long executionTimeNs;
    private Map<String, Object> availableContext;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("valid", valid);
        if (error != null) map.put("error", error);
        if (result != null) map.put("result", result);
        if (resultType != null) map.put("resultType", resultType);
        if (position != null) map.put("position", position);
        if (suggestions != null) map.put("suggestions", suggestions);
        if (warnings != null) map.put("warnings", warnings);
        if (executionTimeNs != null) map.put("executionTimeMs", executionTimeNs / 1_000_000.0);
        map.put("executionSuccessful", executionSuccessful);
        if (availableContext != null) map.put("availableContext", availableContext);
        return map;
    }
}
```

### 6.4. Frontend API Integration

```javascript
// Frontend service to call backend SpEL APIs with real execution validation
export const spelContextApi = {
  // Get categorized context
  async getContext(category = "business", search = "", maxDepth = 3) {
    const params = new URLSearchParams({
      category,
      maxDepth: maxDepth.toString(),
    });
    if (search) params.append("search", search);

    const response = await fetch(`/api/spel/context?${params}`);
    return response.json();
  },

  // Get filtered beans
  async getBeans(filter = "", includeFramework = false) {
    const params = new URLSearchParams({
      includeFramework: includeFramework.toString(),
    });
    if (filter) params.append("filter", filter);

    const response = await fetch(`/api/spel/beans?${params}`);
    return response.json();
  },

  // Validate expression with real execution (comprehensive validation)
  async validateExpression(expression, contextCategory = "business") {
    const response = await fetch("/api/spel/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression, contextCategory }),
    });
    return response.json();
  },

  // Live validation for real-time feedback (optimized for typing)
  async validateLive(
    expression,
    contextCategory = "business",
    executeValidation = false
  ) {
    const response = await fetch("/api/spel/validate/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expression,
        contextCategory,
        executeValidation,
      }),
    });
    return response.json();
  },

  // Test expression with custom data
  async testExpression(expression, testData, contextCategory = "business") {
    const response = await fetch("/api/spel/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expression,
        contextCategory,
        additionalContext: testData,
      }),
    });
    return response.json();
  },

  // Batch validate multiple expressions
  async validateBatch(expressions, contextCategory = "business") {
    const response = await fetch("/api/spel/validate/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expressions: expressions.map((expr) => ({
          expression: expr,
          contextCategory,
        })),
      }),
    });
    return response.json();
  },
};
```

### 6.5. Real-Time SpEL Execution Validation

This approach validates SpEL expressions by actually executing them against real application context, providing the most accurate validation possible:

#### Enhanced Frontend Integration with Real Execution

```javascript
// Real-time validation hook for Monaco Editor
const useSpelValidation = (expression, contextCategory = "business") => {
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!expression.trim()) {
      setValidation(null);
      return;
    }

    const validateExpression = async () => {
      setIsValidating(true);
      try {
        // First do quick syntax validation
        const syntaxResult = await spelContextApi.validateLive(
          expression,
          contextCategory,
          false
        );

        if (!syntaxResult.valid) {
          setValidation(syntaxResult);
          return;
        }

        // Then do full execution validation
        const executionResult = await spelContextApi.validateLive(
          expression,
          contextCategory,
          true
        );

        setValidation(executionResult);
      } catch (error) {
        setValidation({
          valid: false,
          error: `Validation service error: ${error.message}`,
        });
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce validation calls
    const timeoutId = setTimeout(validateExpression, 300);
    return () => clearTimeout(timeoutId);
  }, [expression, contextCategory]);

  return { validation, isValidating };
};

// Enhanced SpEL Editor with real-time execution validation
const EnhancedSpelEditor = ({ value, onChange, contextCategory }) => {
  const { validation, isValidating } = useSpelValidation(
    value,
    contextCategory
  );
  const [showExecutionDetails, setShowExecutionDetails] = useState(false);

  const getValidationIcon = () => {
    if (isValidating) return <CircularProgress size={16} />;
    if (!validation) return null;
    if (validation.valid && validation.executionSuccessful) {
      return <CheckCircleIcon color="success" />;
    }
    if (validation.valid && !validation.executionSuccessful) {
      return <WarningIcon color="warning" />;
    }
    return <ErrorIcon color="error" />;
  };

  const getValidationMessage = () => {
    if (!validation) return "";
    if (validation.valid && validation.executionSuccessful) {
      return `✅ Valid & Executable (${validation.executionTimeMs?.toFixed(
        2
      )}ms)`;
    }
    if (validation.valid && !validation.executionSuccessful) {
      return `⚠️ Syntax OK, but execution failed: ${validation.error}`;
    }
    return `❌ ${validation.error}`;
  };

  return (
    <Box>
      {/* Validation Status Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          p: 1,
          bgcolor: validation?.valid ? "success.light" : "error.light",
          borderRadius: 1,
        }}
      >
        {getValidationIcon()}
        <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
          {getValidationMessage()}
        </Typography>
        {validation?.result !== undefined && (
          <Chip
            label={`Result: ${validation.result} (${validation.resultType})`}
            size="small"
            onClick={() => setShowExecutionDetails(true)}
          />
        )}
      </Box>

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

      {/* Smart Suggestions */}
      {validation?.suggestions?.length > 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="subtitle2">Suggestions:</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validation.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Box>
  );
};
```

#### Performance Optimizations for Real-Time Validation

```java
// Cached validation service for better performance
@Service
public class CachedSpelValidationService {

    @Autowired
    private SpelContextService spelContextService;

    // Cache parsed expressions to avoid re-parsing
    private final LoadingCache<String, Expression> expressionCache =
        Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .build(expression -> {
                SpelExpressionParser parser = new SpelExpressionParser();
                return parser.parseExpression(expression);
            });

    // Cache validation results for identical expressions
    private final LoadingCache<String, SpelValidationResult> validationCache =
        Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(Duration.ofMinutes(10))
            .build(this::performValidation);

    public SpelValidationResult validateWithCache(String expression, String contextCategory) {
        String cacheKey = expression + ":" + contextCategory;
        return validationCache.get(cacheKey);
    }

    private SpelValidationResult performValidation(String cacheKey) {
        String[] parts = cacheKey.split(":", 2);
        return spelContextService.validateExpressionWithExecution(parts[0], parts[1], true);
    }

    // Async validation for non-blocking operation
    @Async
    public CompletableFuture<SpelValidationResult> validateAsync(String expression, String contextCategory) {
        return CompletableFuture.completedFuture(validateWithCache(expression, contextCategory));
    }
}
```

#### Benefits of Real-Time Execution Validation

1. **100% Accuracy**: Actually executes expressions, catching runtime issues
2. **Context Validation**: Verifies all referenced objects and properties exist
3. **Type Safety**: Catches type mismatches and conversion errors
4. **Performance Insights**: Measures actual execution time
5. **Smart Suggestions**: Context-aware error messages and fixes
6. **Real Data Testing**: Uses actual application context, not mock data

---

### 6.6. Performance Configuration & Disabling Features

For production environments with performance concerns, you can configure or disable the SpEL context discovery feature:

#### Configuration Properties

```yaml
# application.yml
spel:
  context:
    enabled: true # Enable/disable context discovery
    max-beans: 100 # Limit number of beans to inspect
    max-depth: 3 # Limit object nesting depth
    cache-enabled: true # Cache context results
    cache-duration: 300 # Cache duration in seconds
    include-framework-beans: false # Include Spring framework beans
    async-loading: true # Load context asynchronously
    lazy-initialization: true # Only load when requested
```

#### Conditional Bean Registration

```java
@Configuration
@ConditionalOnProperty(name = "spel.context.enabled", havingValue = "true", matchIfMissing = true)
public class SpelContextConfiguration {

    @Bean
    @ConditionalOnProperty(name = "spel.context.enabled", havingValue = "true")
    public SpelContextService spelContextService() {
        return new SpelContextService();
    }

    @Bean
    @ConditionalOnProperty(name = "spel.context.enabled", havingValue = "true")
    public SpelContextController spelContextController() {
        return new SpelContextController();
    }
}
```

#### Performance-Optimized Service Implementation

```java
@Service
@ConditionalOnProperty(name = "spel.context.enabled", havingValue = "true")
@Slf4j
public class SpelContextService {

    @Value("${spel.context.max-beans:100}")
    private int maxBeansToInspect;

    @Value("${spel.context.max-depth:3}")
    private int maxDepth;

    @Value("${spel.context.cache-enabled:true}")
    private boolean cacheEnabled;

    @Value("${spel.context.async-loading:true}")
    private boolean asyncLoading;

    // Cache for expensive operations
    @Cacheable(value = "spelContext", condition = "#root.target.cacheEnabled")
    public Map<String, Object> getContextByCategory(String category, String search, int maxDepth) {
        if (!isFeatureEnabled()) {
            return getStaticContext(); // Return minimal static context
        }

        return loadContextWithLimits(category, search, Math.min(maxDepth, this.maxDepth));
    }

    // Async loading for better performance
    @Async
    @ConditionalOnProperty(name = "spel.context.async-loading", havingValue = "true")
    public CompletableFuture<Map<String, Object>> getContextAsync(String category) {
        return CompletableFuture.completedFuture(getContextByCategory(category, null, maxDepth));
    }

    // Limited bean inspection
    public Map<String, Object> getFilteredBeans(String filter, boolean includeFramework) {
        if (!isFeatureEnabled()) {
            return Collections.emptyMap(); // Return empty if disabled
        }

        Map<String, Object> beans = new HashMap<>();
        String[] beanNames = applicationContext.getBeanDefinitionNames();

        // Limit the number of beans to inspect
        int inspected = 0;
        for (String beanName : beanNames) {
            if (inspected >= maxBeansToInspect) {
                log.warn("Reached maximum bean inspection limit: {}", maxBeansToInspect);
                break;
            }

            try {
                // Quick bean inspection with timeout
                Object bean = inspectBeanWithTimeout(beanName, 100); // 100ms timeout
                if (bean != null) {
                    beans.put(beanName, createLimitedBeanInfo(bean));
                    inspected++;
                }
            } catch (Exception e) {
                log.debug("Skipping bean due to inspection error: {}", beanName);
            }
        }

        return beans;
    }

    // Fallback static context for disabled scenarios
    private Map<String, Object> getStaticContext() {
        return Map.of(
            "transaction", Map.of("id", "sample", "amount", 0, "currency", "USD"),
            "user", Map.of("id", "sample", "role", "USER"),
            "system", Map.of("environment", "PROD")
        );
    }

    private boolean isFeatureEnabled() {
        return spelContextEnabled; // Injected from properties
    }

    // Bean inspection with timeout to prevent hanging
    private Object inspectBeanWithTimeout(String beanName, long timeoutMs) {
        try {
            return CompletableFuture
                .supplyAsync(() -> applicationContext.getBean(beanName))
                .get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            log.warn("Bean inspection timeout for: {}", beanName);
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
```

#### Circuit Breaker Pattern for Stability

```java
@Component
public class SpelContextCircuitBreaker {

    private final CircuitBreaker circuitBreaker;

    public SpelContextCircuitBreaker() {
        this.circuitBreaker = CircuitBreaker.ofDefaults("spelContext");
        circuitBreaker.getEventPublisher()
            .onStateTransition(event ->
                log.info("SpEL Context Circuit Breaker: {}", event));
    }

    public Map<String, Object> getContextWithCircuitBreaker(String category) {
        return circuitBreaker.executeSupplier(() -> {
            // Your expensive context loading logic
            return spelContextService.getContextByCategory(category, null, 3);
        });
    }
}
```

#### Graceful Degradation Strategy

```java
@RestController
@RequestMapping("/api/spel")
public class SpelContextController {

    @Value("${spel.context.enabled:true}")
    private boolean contextEnabled;

    @GetMapping("/context")
    public ResponseEntity<Map<String, Object>> getSpelContext(
            @RequestParam(defaultValue = "business") String category) {

        if (!contextEnabled) {
            // Return minimal static context when disabled
            Map<String, Object> staticContext = Map.of(
                "message", "Context discovery is disabled for performance",
                "available", List.of("transaction.amount", "transaction.currency", "user.role")
            );
            return ResponseEntity.ok(staticContext);
        }

        try {
            // Full context loading with timeout
            Map<String, Object> context = contextService.getContextByCategory(category, null, 3);
            return ResponseEntity.ok(context);
        } catch (Exception e) {
            log.error("Context loading failed, falling back to static context", e);
            return getStaticFallbackContext();
        }
    }

    private ResponseEntity<Map<String, Object>> getStaticFallbackContext() {
        Map<String, Object> fallback = Map.of(
            "error", "Dynamic context unavailable",
            "fallback", true,
            "basicContext", getBasicSpelContext()
        );
        return ResponseEntity.ok(fallback);
    }
}
```

#### Frontend Handling for Disabled Features

```javascript
// Frontend service with fallback handling
export const spelContextApi = {
  async getContext(category = "business", search = "", maxDepth = 3) {
    try {
      const response = await fetch(`/api/spel/context?category=${category}`);
      const data = await response.json();

      // Handle disabled feature
      if (data.fallback || data.message) {
        console.warn("SpEL context discovery is disabled or degraded");
        return this.getStaticContext();
      }

      return data;
    } catch (error) {
      console.error("Context API failed, using static fallback");
      return this.getStaticContext();
    }
  },

  // Static fallback context
  getStaticContext() {
    return {
      transaction: {
        id: "TXN-XXX",
        amount: "number",
        currency: "string",
        type: "string",
      },
      user: {
        id: "USR-XXX",
        role: "string",
        permissions: "array",
      },
      system: {
        environment: "string",
      },
    };
  },

  // Check if full context features are available
  async isContextEnabled() {
    try {
      const response = await fetch("/api/spel/context?category=business");
      const data = await response.json();
      return !data.fallback && !data.message;
    } catch {
      return false;
    }
  },
};
```

#### Monitoring and Metrics

```java
@Component
public class SpelContextMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter contextRequests;
    private final Timer contextLoadTime;

    public SpelContextMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.contextRequests = Counter.builder("spel.context.requests")
            .description("Number of context requests")
            .register(meterRegistry);
        this.contextLoadTime = Timer.builder("spel.context.load.time")
            .description("Time to load context")
            .register(meterRegistry);
    }

    public Map<String, Object> getContextWithMetrics(String category) {
        contextRequests.increment();

        return Timer.Sample.start(meterRegistry)
            .stop(contextLoadTime)
            .recordCallable(() -> spelContextService.getContextByCategory(category, null, 3));
    }
}
```

#### Quick Disable Options

```bash
# Environment variable to disable completely
export SPEL_CONTEXT_ENABLED=false

# JVM argument
-Dspel.context.enabled=false

# Application argument
--spel.context.enabled=false
```

---

## 7. Sample Transaction Structure

The SpEL conditions refer to objects like `['transaction'].currency`. Here’s a reference:

```js
const transactions = {
  header: { status: "Success" },
  body: [
    {
      serviceType: "TT MBB Currency",
      payload: '{"currencyCode":"USD","ouCountry":"LBN"}',
      status: "PENDING",
      actionType: "UPDATE",
    },
  ],
};
```

Ensure the condition syntax matches this structure.

---

## 8. SpEL Editor User Experience Enhancements

### 8.1. Smart Auto-Completion

Implement intelligent auto-completion in Monaco Editor for SpEL expressions:

```javascript
// Monaco Editor configuration for SpEL auto-completion
const spelCompletionProvider = {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    return {
      suggestions: [
        // Business objects
        {
          label: "transaction",
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: "transaction",
          range: range,
          documentation:
            "Transaction object with amount, currency, type properties",
        },
        {
          label: "transaction.amount",
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: "transaction.amount",
          range: range,
          documentation: "Transaction amount (number)",
        },
        // Common SpEL operators
        {
          label: "in",
          kind: monaco.languages.CompletionItemKind.Operator,
          insertText: "in {'value1', 'value2'}",
          range: range,
          documentation: "Check if value is in collection",
        },
        // Functions
        {
          label: "matches",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "matches('[regex]')",
          range: range,
          documentation: "Check if string matches regex pattern",
        },
      ],
    };
  },
};

monaco.languages.registerCompletionItemProvider(
  "javascript",
  spelCompletionProvider
);
```

### 8.2. Real-Time Expression Preview

Show live evaluation results as users type:

```javascript
// Live preview component
const SpelPreview = ({ expression, context }) => {
  const [previewResult, setPreviewResult] = useState(null);

  useEffect(() => {
    const evaluateExpression = async () => {
      if (!expression.trim()) return;

      try {
        const result = await spelContextApi.validateExpression(expression);
        setPreviewResult(result);
      } catch (error) {
        setPreviewResult({ error: error.message });
      }
    };

    const debounced = debounce(evaluateExpression, 500);
    debounced();
  }, [expression]);

  return (
    <Paper sx={{ p: 2, mt: 1, bgcolor: "grey.50" }}>
      <Typography variant="subtitle2">Live Preview:</Typography>
      {previewResult?.valid ? (
        <Chip
          label={`Result: ${previewResult.result} (${previewResult.resultType})`}
          color="success"
          size="small"
        />
      ) : (
        <Chip
          label={`Error: ${previewResult?.error}`}
          color="error"
          size="small"
        />
      )}
    </Paper>
  );
};
```

### 8.3. Expression Templates & Snippets

Provide common expression templates:

```javascript
const SPEL_TEMPLATES = {
  "Amount Validation": {
    template: "transaction.amount > ${threshold}",
    description: "Check if transaction amount exceeds threshold",
    placeholders: ["threshold"],
  },
  "Currency Check": {
    template: "transaction.currency in {'${currencies}'}",
    description: "Validate against allowed currencies",
    placeholders: ["currencies"],
  },
  "Date Range": {
    template:
      "transaction.date >= ${startDate} && transaction.date <= ${endDate}",
    description: "Check if transaction is within date range",
    placeholders: ["startDate", "endDate"],
  },
  "User Permission": {
    template: "user.permissions.contains('${permission}')",
    description: "Check if user has specific permission",
    placeholders: ["permission"],
  },
};

// Template selector component
const TemplateSelector = ({ onSelectTemplate }) => (
  <Box>
    <Typography variant="subtitle2" gutterBottom>
      Expression Templates:
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {Object.entries(SPEL_TEMPLATES).map(([name, template]) => (
        <Chip
          key={name}
          label={name}
          onClick={() => onSelectTemplate(template)}
          variant="outlined"
          size="small"
        />
      ))}
    </Box>
  </Box>
);
```

### 8.4. Visual Expression Builder

Drag-and-drop visual builder for non-technical users:

```javascript
const VisualExpressionBuilder = () => {
  const [conditions, setConditions] = useState([]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Date.now(),
        field: "",
        operator: "",
        value: "",
        connector: "AND",
      },
    ]);
  };

  const generateSpelExpression = () => {
    return conditions
      .map(
        (condition) =>
          `${condition.field} ${condition.operator} ${condition.value}`
      )
      .join(` ${condition.connector} `);
  };

  return (
    <Box>
      {conditions.map((condition, index) => (
        <Box key={condition.id} sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Select
            value={condition.field}
            onChange={(e) =>
              updateCondition(condition.id, "field", e.target.value)
            }
          >
            <MenuItem value="transaction.amount">Amount</MenuItem>
            <MenuItem value="transaction.currency">Currency</MenuItem>
            <MenuItem value="user.role">User Role</MenuItem>
          </Select>

          <Select
            value={condition.operator}
            onChange={(e) =>
              updateCondition(condition.id, "operator", e.target.value)
            }
          >
            <MenuItem value=">">Greater than</MenuItem>
            <MenuItem value="==">Equals</MenuItem>
            <MenuItem value="in">In list</MenuItem>
          </Select>

          <TextField
            value={condition.value}
            onChange={(e) =>
              updateCondition(condition.id, "value", e.target.value)
            }
            placeholder="Value"
          />

          {index > 0 && (
            <Select
              value={condition.connector}
              onChange={(e) =>
                updateCondition(condition.id, "connector", e.target.value)
              }
            >
              <MenuItem value="AND">AND</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
            </Select>
          )}
        </Box>
      ))}

      <Button onClick={addCondition}>Add Condition</Button>
      <Typography variant="body2" sx={{ mt: 1, fontFamily: "monospace" }}>
        Generated: {generateSpelExpression()}
      </Typography>
    </Box>
  );
};
```

### 8.5. Interactive Documentation Panel

Context-aware help panel:

```javascript
const SpelDocumentation = ({ currentExpression }) => {
  const [selectedTopic, setSelectedTopic] = useState("operators");

  const documentation = {
    operators: [
      { symbol: ">", description: "Greater than", example: "amount > 1000" },
      { symbol: "==", description: "Equals", example: "currency == 'USD'" },
      {
        symbol: "in",
        description: "Contains in collection",
        example: "status in {'PENDING', 'APPROVED'}",
      },
    ],
    functions: [
      {
        name: "matches()",
        description: "Regex matching",
        example: "email.matches('.*@company.com')",
      },
      {
        name: "contains()",
        description: "String contains",
        example: "description.contains('urgent')",
      },
    ],
    objects: [
      {
        name: "transaction",
        properties: ["amount", "currency", "type", "status"],
      },
      { name: "user", properties: ["id", "role", "permissions", "department"] },
    ],
  };

  return (
    <Paper sx={{ p: 2, maxHeight: 300, overflow: "auto" }}>
      <Tabs value={selectedTopic} onChange={(e, v) => setSelectedTopic(v)}>
        <Tab label="Operators" value="operators" />
        <Tab label="Functions" value="functions" />
        <Tab label="Objects" value="objects" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {documentation[selectedTopic].map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              {item.symbol || item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
            {item.example && (
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", bgcolor: "grey.100", p: 0.5 }}
              >
                {item.example}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
```

### 8.6. Expression Validation with Suggestions

Enhanced validation with smart suggestions:

```javascript
const validateExpressionWithSuggestions = async (expression) => {
  try {
    const result = await spelContextApi.validateExpression(expression);

    if (!result.valid) {
      // Generate context-aware suggestions
      const suggestions = generateSmartSuggestions(expression, result.error);
      return { ...result, suggestions };
    }

    return result;
  } catch (error) {
    return { valid: false, error: error.message, suggestions: [] };
  }
};

const generateSmartSuggestions = (expression, error) => {
  const suggestions = [];

  // Common typos
  if (error.includes("cannot be resolved")) {
    if (expression.includes("trasaction")) {
      suggestions.push("Did you mean 'transaction'?");
    }
    if (expression.includes("ammount")) {
      suggestions.push("Did you mean 'amount'?");
    }
  }

  // Missing quotes
  if (error.includes("string literal")) {
    suggestions.push("String values need quotes: 'USD' instead of USD");
  }

  // Operator suggestions
  if (expression.includes("=") && !expression.includes("==")) {
    suggestions.push("Use '==' for equality comparison, not '='");
  }

  return suggestions;
};
```

### 8.7. Expression Testing Playground

Interactive testing environment:

```javascript
const SpelPlayground = () => {
  const [testData, setTestData] = useState({
    transaction: { amount: 1500, currency: "USD" },
    user: { role: "ADMIN" },
  });
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);

  const testExpression = async () => {
    try {
      const result = await spelContextApi.validateExpression(
        expression,
        testData
      );
      setResult(result);
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography variant="h6">Test Data</Typography>
        <TextField
          multiline
          fullWidth
          rows={8}
          value={JSON.stringify(testData, null, 2)}
          onChange={(e) => setTestData(JSON.parse(e.target.value))}
        />
      </Grid>

      <Grid item xs={6}>
        <Typography variant="h6">Expression</Typography>
        <TextField
          fullWidth
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Enter SpEL expression..."
        />

        <Button onClick={testExpression} sx={{ mt: 1 }}>
          Test Expression
        </Button>

        {result && (
          <Alert severity={result.valid ? "success" : "error"} sx={{ mt: 1 }}>
            {result.valid
              ? `Result: ${result.result}`
              : `Error: ${result.error}`}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
};
```

### 8.8. Expression History & Favorites

Save and reuse expressions:

```javascript
const ExpressionHistory = () => {
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const addToHistory = (expression) => {
    setHistory((prev) => [
      { expression, timestamp: new Date(), id: Date.now() },
      ...prev.slice(0, 19), // Keep last 20
    ]);
  };

  const addToFavorites = (expression, name) => {
    setFavorites((prev) => [...prev, { expression, name, id: Date.now() }]);
  };

  return (
    <Box>
      <Tabs>
        <Tab label="History" />
        <Tab label="Favorites" />
      </Tabs>

      <List>
        {(selectedTab === "history" ? history : favorites).map((item) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={item.expression}
              secondary={item.name || item.timestamp?.toLocaleString()}
            />
            <IconButton onClick={() => onSelectExpression(item.expression)}>
              <AddIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
```

### 8.9. Syntax Highlighting for SpEL

Custom Monaco theme for SpEL:

```javascript
const SPEL_SYNTAX_RULES = [
  { token: "spel.operator", foreground: "0000FF" },
  { token: "spel.string", foreground: "A31515" },
  { token: "spel.number", foreground: "098658" },
  { token: "spel.keyword", foreground: "AF00DB" },
  { token: "spel.function", foreground: "795E26" },
];

monaco.editor.defineTheme("spel-theme", {
  base: "vs",
  inherit: true,
  rules: SPEL_SYNTAX_RULES,
});

// Custom language definition
monaco.languages.register({ id: "spel" });
monaco.languages.setMonarchTokensProvider("spel", {
  tokenizer: {
    root: [
      [/\b(and|or|not|in|matches|contains)\b/, "spel.keyword"],
      [/\b\d+(\.\d+)?\b/, "spel.number"],
      [/'[^']*'/, "spel.string"],
      [/[><=!&|]+/, "spel.operator"],
      [/\b\w+\(/, "spel.function"],
    ],
  },
});
```

---

## 9. Best Practices

- Validate expressions using `spel2js` **before saving**
- Implement undo or preview functionality for rules
- Allow syntax hints or templates for common expressions

---

## 9. Developer Notes

- Monaco Editor doesn't understand SpEL, but using JS language mode helps with editing experience.
- `spel2js` only parses, it doesn't evaluate. Use backend for actual expression execution if needed.
- Drag-and-drop types are defined in `ItemType`. You can extend this for rule groups, templates, etc.

---

## 10. Screenshots (optional for README)

Consider adding screenshots to demonstrate:

- Rule editor form
- SpEL validation feedback
- Drag-and-drop building of rule sets

---

## ✅ Ready to Extend

With this setup, your team can visually author and manage dynamic validation or execution rules that can be interpreted by your Spring Boot backend — powering real-time dynamic workflows.

Let me know if you'd like this exported as a Markdown file, PDF, or if you'd like a README version!
