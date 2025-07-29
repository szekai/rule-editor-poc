import { useState, useEffect, useCallback, useRef } from "react";
import spelValidationService from "../services/spelValidationService";

/**
 * Custom hook for SpEL expression validation with real-time feedback
 * @param {string} expression - SpEL expression to validate
 * @param {string} contextCategory - Context category (business, system, all)
 * @param {Object} options - Validation options
 * @returns {Object} Validation state and methods
 */
export const useSpelValidation = (
  expression,
  contextCategory = "business",
  options = {}
) => {
  const {
    debounceMs = 300,
    enableLiveValidation = true,
    enableExecutionValidation = false,
    autoValidate = true,
  } = options;

  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);

  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  /**
   * Validate expression manually
   */
  const validateExpression = useCallback(
    async (expr = expression, category = contextCategory) => {
      // Cancel previous validation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!expr?.trim()) {
        setValidation(null);
        setIsValidating(false);
        return null;
      }

      setIsValidating(true);
      abortControllerRef.current = new AbortController();

      try {
        let result;

        if (enableLiveValidation) {
          // Use live validation for real-time feedback
          result = await spelValidationService.validateLive(
            expr,
            category,
            enableExecutionValidation
          );
        } else {
          // Use full validation
          result = await spelValidationService.validateExpression(
            expr,
            category
          );
        }

        setValidation(result);
        setIsServiceAvailable(true);
        return result;
      } catch (error) {
        console.error("Validation error:", error);

        const errorResult = {
          valid: false,
          error: `Validation failed: ${error.message}`,
          suggestions: [
            "Check your network connection",
            "Try again in a moment",
          ],
        };

        setValidation(errorResult);
        setIsServiceAvailable(false);
        return errorResult;
      } finally {
        setIsValidating(false);
        abortControllerRef.current = null;
      }
    },
    [
      expression,
      contextCategory,
      enableLiveValidation,
      enableExecutionValidation,
    ]
  );

  /**
   * Validate with custom test data
   */
  const testWithData = useCallback(
    async (testData) => {
      if (!expression?.trim()) return null;

      setIsValidating(true);
      try {
        const result = await spelValidationService.testExpression(
          expression,
          testData,
          contextCategory
        );
        return result;
      } catch (error) {
        console.error("Test validation error:", error);
        return {
          valid: false,
          error: `Test failed: ${error.message}`,
        };
      } finally {
        setIsValidating(false);
      }
    },
    [expression, contextCategory]
  );

  /**
   * Get available context
   */
  const getContext = useCallback(
    async (category = contextCategory, search = "") => {
      try {
        return await spelValidationService.getContext(category, search);
      } catch (error) {
        console.error("Context loading error:", error);
        return { error: "Failed to load context" };
      }
    },
    [contextCategory]
  );

  // Auto-validation with debouncing
  useEffect(() => {
    if (!autoValidate) return;

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce validation
    debounceRef.current = setTimeout(() => {
      validateExpression();
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    expression,
    contextCategory,
    validateExpression,
    autoValidate,
    debounceMs,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // State
    validation,
    isValidating,
    isServiceAvailable,

    // Methods
    validateExpression,
    testWithData,
    getContext,

    // Computed properties
    isValid: validation?.valid === true,
    hasError: validation?.valid === false,
    result: validation?.result,
    suggestions: validation?.suggestions || [],
    executionTime: validation?.executionTimeMs,
  };
};

/**
 * Hook for managing SpEL context discovery
 * @param {string} category - Initial context category
 * @returns {Object} Context state and methods
 */
export const useSpelContext = (category = "business") => {
  const [context, setContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadContext = useCallback(
    async (cat = category, search = "") => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await spelValidationService.getContext(cat, search);
        setContext(result);
        return result;
      } catch (err) {
        console.error("Context loading error:", err);
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [category]
  );

  // Load initial context
  useEffect(() => {
    loadContext();
  }, [loadContext]);

  return {
    context,
    isLoading,
    error,
    loadContext,

    // Helper methods
    refreshContext: () => loadContext(category),
    searchContext: (searchTerm) => loadContext(category, searchTerm),
  };
};

/**
 * Hook for batch validation of multiple expressions
 * @returns {Object} Batch validation methods
 */
export const useSpelBatchValidation = () => {
  const [results, setResults] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateBatch = useCallback(
    async (expressions, contextCategory = "business") => {
      if (!expressions?.length) return [];

      setIsValidating(true);
      try {
        const batchResults = await spelValidationService.validateBatch(
          expressions,
          contextCategory
        );
        setResults(batchResults);
        return batchResults;
      } catch (error) {
        console.error("Batch validation error:", error);
        const errorResults = expressions.map((expr) => ({
          expression: expr,
          valid: false,
          error: `Batch validation failed: ${error.message}`,
        }));
        setResults(errorResults);
        return errorResults;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    isValidating,
    validateBatch,
    clearResults,

    // Computed properties
    validCount: results.filter((r) => r.valid).length,
    errorCount: results.filter((r) => !r.valid).length,
    totalCount: results.length,
  };
};

/**
 * Hook for SpEL service configuration
 * @returns {Object} Service configuration and control methods
 */
export const useSpelServiceConfig = () => {
  const [config, setConfig] = useState(spelValidationService.getConfig());
  const [serviceStatus, setServiceStatus] = useState("unknown");

  const checkServiceStatus = useCallback(async () => {
    const isAvailable = await spelValidationService.isServiceAvailable();
    setServiceStatus(isAvailable ? "available" : "unavailable");
    return isAvailable;
  }, []);

  const switchToRealApi = useCallback((baseUrl) => {
    spelValidationService.useRealApi(baseUrl);
    setConfig(spelValidationService.getConfig());
  }, []);

  const switchToMockApi = useCallback(() => {
    spelValidationService.useMockApi();
    setConfig(spelValidationService.getConfig());
  }, []);

  // Check service status on mount
  useEffect(() => {
    checkServiceStatus();
  }, [checkServiceStatus]);

  return {
    config,
    serviceStatus,
    isMock: config.useMock,

    // Methods
    checkServiceStatus,
    switchToRealApi,
    switchToMockApi,
    refreshConfig: () => setConfig(spelValidationService.getConfig()),
  };
};

export default useSpelValidation;
