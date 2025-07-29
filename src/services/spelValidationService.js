/**
 * SpEL Validation Service
 * Handles API calls to backend for SpEL expression validation
 */

import { SpelExpressionEvaluator } from "spel2js";

// Configuration - you can easily change this to your real backend URL
const SPEL_API_CONFIG = {
  baseUrl:
    process.env.REACT_APP_SPEL_API_URL || "http://localhost:8080/api/spel",
  useMock: process.env.REACT_APP_USE_MOCK_SPEL === "true" || true, // Default to mock for now
  timeout: 5000, // 5 seconds timeout
};

/**
 * Real SpEL syntax validation using spel2js library
 */
const validateSpelSyntax = (expression) => {
  try {
    if (!expression || expression.trim() === "") {
      return {
        valid: false,
        error: "Expression cannot be empty",
        empty: true,
      };
    }

    // Attempt to compile the expression to check syntax
    SpelExpressionEvaluator.compile(expression);

    return {
      valid: true,
      error: null,
      syntaxValid: true,
    };
  } catch (error) {
    // Handle different error types from spel2js
    const errorMessage =
      error?.message || error?.toString() || "Unknown SpEL syntax error";

    return {
      valid: false,
      error: errorMessage,
      syntaxValid: false,
    };
  }
};

/**
 * Fixed mock SpEL validation with real syntax checking
 */
const mockValidateSpel = async (expression, contextCategory = "business") => {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 200)
  );

  // First, validate syntax using spel2js
  const syntaxResult = validateSpelSyntax(expression);

  if (!syntaxResult.valid) {
    return {
      ...syntaxResult,
      availableContext: {
        transaction: "Available with: amount, currency, type, status",
        user: "Available with: id, role, permissions, department",
        system: "Available with: environment, timestamp",
      },
    };
  }

  // If syntax is valid, return positive validation result
  return {
    valid: true,
    error: null,
    result: "true", // Mock result
    resultType: "Boolean",
    executionSuccessful: true,
    executionTimeMs: Math.random() * 50 + 10, // Random execution time 10-60ms
    suggestions: [],
    warnings: [],
    availableContext: {
      transaction: "Available with: amount, currency, type, status",
      user: "Available with: id, role, permissions, department",
      system: "Available with: environment, timestamp",
    },
  };
};

/**
 * Fixed mock live validation with real syntax checking
 */
const mockValidateLive = async (
  expression,
  contextCategory = "business",
  executeValidation = false
) => {
  // Simulate faster response for live validation
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 100)
  );

  // Return basic validation for empty expressions
  if (!expression.trim()) {
    return { valid: true, empty: true };
  }

  // First, validate syntax using spel2js
  const syntaxResult = validateSpelSyntax(expression);

  if (!syntaxResult.valid) {
    return {
      ...syntaxResult,
      suggestions: [],
      warnings: [],
    };
  }

  // If syntax is valid, return positive result
  return {
    valid: true,
    error: null,
    result: executeValidation ? "Sample result" : undefined,
    resultType: executeValidation ? "String" : undefined,
    executionSuccessful: executeValidation,
    executionTimeMs: executeValidation ? Math.random() * 30 + 5 : undefined,
    suggestions: [],
    warnings: [],
  };
};

/**
 * Mock context discovery
 */
const mockGetContext = async (
  category = "business",
  search = "",
  maxDepth = 3
) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const contexts = {
    business: {
      transaction: {
        id: "string - Transaction identifier",
        amount: "number - Transaction amount",
        currency: "string - Currency code (USD, EUR, etc.)",
        type: "string - Transaction type (TRANSFER, PAYMENT, etc.)",
        status: "string - Current status (PENDING, APPROVED, REJECTED)",
      },
      user: {
        id: "string - User identifier",
        role: "string - User role (ADMIN, USER, etc.)",
        permissions: "array - List of permissions",
        department: "string - User department",
      },
    },
    system: {
      environment: "string - Current environment (DEV, PROD, etc.)",
      timestamp: "number - Current timestamp",
      version: "string - Application version",
    },
  };

  return category === "all"
    ? { ...contexts.business, ...contexts.system }
    : contexts[category] || {};
};

/**
 * Real API call functions (for when you switch to real backend)
 */
const realApiCall = async (endpoint, options = {}) => {
  const url = `${SPEL_API_CONFIG.baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    SPEL_API_CONFIG.timeout
  );

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout - SpEL validation service is not responding"
      );
    }
    throw error;
  }
};

const realValidateSpel = async (expression, contextCategory = "business") => {
  return await realApiCall("/validate", {
    method: "POST",
    body: JSON.stringify({
      expression,
      contextCategory,
    }),
  });
};

const realValidateLive = async (
  expression,
  contextCategory = "business",
  executeValidation = false
) => {
  return await realApiCall("/validate/live", {
    method: "POST",
    body: JSON.stringify({
      expression,
      contextCategory,
      executeValidation,
    }),
  });
};

const realGetContext = async (
  category = "business",
  search = "",
  maxDepth = 3
) => {
  const params = new URLSearchParams({
    category,
    maxDepth: maxDepth.toString(),
  });
  if (search) params.append("search", search);

  return await realApiCall(`/context?${params}`);
};

/**
 * Main SpEL Validation Service API
 * Automatically switches between mock and real API based on configuration
 */
export const spelValidationService = {
  /**
   * Validate SpEL expression with comprehensive validation
   * @param {string} expression - SpEL expression to validate
   * @param {string} contextCategory - Context category (business, system, all)
   * @returns {Promise<Object>} Validation result
   */
  async validateExpression(expression, contextCategory = "business") {
    try {
      if (SPEL_API_CONFIG.useMock) {
        console.log("🔧 Using mock SpEL validation service");
        return await mockValidateSpel(expression, contextCategory);
      } else {
        return await realValidateSpel(expression, contextCategory);
      }
    } catch (error) {
      console.error("SpEL validation error:", error);

      // Fallback to basic error response
      return {
        valid: false,
        error: `Validation service error: ${error.message}`,
        suggestions: [
          "Check your network connection",
          "Verify the SpEL validation service is running",
          "Try again in a moment",
        ],
      };
    }
  },

  /**
   * Live validation for real-time feedback (optimized for typing)
   * @param {string} expression - SpEL expression to validate
   * @param {string} contextCategory - Context category
   * @param {boolean} executeValidation - Whether to execute for full validation
   * @returns {Promise<Object>} Live validation result
   */
  async validateLive(
    expression,
    contextCategory = "business",
    executeValidation = false
  ) {
    try {
      if (SPEL_API_CONFIG.useMock) {
        return await mockValidateLive(
          expression,
          contextCategory,
          executeValidation
        );
      } else {
        return await realValidateLive(
          expression,
          contextCategory,
          executeValidation
        );
      }
    } catch (error) {
      console.error("Live validation error:", error);
      return {
        valid: false,
        error: `Live validation error: ${error.message}`,
        suggestions: ["Check expression syntax"],
      };
    }
  },

  /**
   * Get available SpEL context objects
   * @param {string} category - Context category (business, system, all)
   * @param {string} search - Search filter
   * @param {number} maxDepth - Maximum object depth
   * @returns {Promise<Object>} Available context objects
   */
  async getContext(category = "business", search = "", maxDepth = 3) {
    try {
      if (SPEL_API_CONFIG.useMock) {
        return await mockGetContext(category, search, maxDepth);
      } else {
        return await realGetContext(category, search, maxDepth);
      }
    } catch (error) {
      console.error("Context loading error:", error);

      // Fallback to minimal context
      return {
        error: "Context loading failed",
        fallback: true,
        basicContext: {
          transaction: { amount: "number", currency: "string" },
          user: { role: "string" },
        },
      };
    }
  },

  /**
   * Batch validate multiple expressions
   * @param {Array<string>} expressions - Array of SpEL expressions
   * @param {string} contextCategory - Context category
   * @returns {Promise<Array>} Array of validation results
   */
  async validateBatch(expressions, contextCategory = "business") {
    try {
      if (SPEL_API_CONFIG.useMock) {
        // Mock batch validation
        const results = await Promise.all(
          expressions.map((expr) => mockValidateSpel(expr, contextCategory))
        );
        return results;
      } else {
        return await realApiCall("/validate/batch", {
          method: "POST",
          body: JSON.stringify({
            expressions: expressions.map((expr) => ({
              expression: expr,
              contextCategory,
            })),
          }),
        });
      }
    } catch (error) {
      console.error("Batch validation error:", error);
      return expressions.map((expr) => ({
        expression: expr,
        valid: false,
        error: `Batch validation failed: ${error.message}`,
      }));
    }
  },

  /**
   * Test expression with custom data (uses same syntax validation)
   * @param {string} expression - SpEL expression
   * @param {Object} testData - Custom test data (for display purposes only in mock mode)
   * @param {string} contextCategory - Context category
   * @returns {Promise<Object>} Test result
   */
  async testExpression(expression, testData, contextCategory = "business") {
    try {
      if (SPEL_API_CONFIG.useMock) {
        // Use the same real syntax validation as other methods
        const syntaxResult = validateSpelSyntax(expression);

        if (!syntaxResult.valid) {
          return {
            ...syntaxResult,
            testData: testData,
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
        return {
          valid: true,
          error: null,
          result: "Test result with custom data",
          resultType: "String",
          executionSuccessful: true,
          testData: testData,
          availableContext: {
            transaction: "Available with: amount, currency, type, status",
            user: "Available with: id, role, permissions, department",
            system: "Available with: environment, timestamp",
          },
        };
      } else {
        return await realApiCall("/validate", {
          method: "POST",
          body: JSON.stringify({
            expression,
            contextCategory,
            additionalContext: testData,
          }),
        });
      }
    } catch (error) {
      console.error("Expression test error:", error);
      return {
        valid: false,
        error: `Test failed: ${error.message}`,
      };
    }
  },

  /**
   * Check if SpEL validation service is available
   * @returns {Promise<boolean>} Service availability status
   */
  async isServiceAvailable() {
    try {
      if (SPEL_API_CONFIG.useMock) {
        return true; // Mock is always available
      } else {
        await realApiCall("/health");
        return true;
      }
    } catch (error) {
      console.warn("SpEL validation service not available:", error.message);
      return false;
    }
  },

  /**
   * Get current configuration
   * @returns {Object} Current API configuration
   */
  getConfig() {
    return {
      ...SPEL_API_CONFIG,
      status: SPEL_API_CONFIG.useMock ? "mock" : "real",
    };
  },

  /**
   * Switch to real API (call this when you have a real backend URL)
   * @param {string} baseUrl - Real backend URL
   */
  useRealApi(baseUrl) {
    SPEL_API_CONFIG.baseUrl = baseUrl;
    SPEL_API_CONFIG.useMock = false;
    console.log(`🚀 Switched to real SpEL API: ${baseUrl}`);
  },

  /**
   * Switch back to mock API
   */
  useMockApi() {
    SPEL_API_CONFIG.useMock = true;
    console.log("🔧 Switched to mock SpEL API");
  },
};

export default spelValidationService;
