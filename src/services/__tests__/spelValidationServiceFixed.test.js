import spelValidationService from "../spelValidationService";

// Note: This is testing the FIXED validation service after applying the patch

describe("Fixed SpEL Validation Service - Unit Tests", () => {
  const invalidExpressions = [
    "transaction.amount >", // Missing right operand
    "user.role ==", // Missing comparison value
    "transaction.amount &&", // Incomplete logical expression
    'transaction.currency == "USD', // Missing closing quote
    'user.permissions.contains("APPROVE"', // Missing closing parenthesis
    "transaction..amount", // Double dots
    "user.role.", // Trailing dot
    ".transaction.amount", // Leading dot
    "", // Empty expression
    "   ", // Whitespace only
  ];

  const validExpressions = [
    "transaction.amount > 1000",
    'user.role == "ADMIN"',
    'transaction.currency == "USD"',
    'user.permissions.contains("APPROVE")',
    "amount + 100",
    "name != null",
    'status == "ACTIVE"',
  ];

  describe("Invalid Expression Detection (Bug Fix)", () => {
    test("should correctly identify syntax errors", async () => {
      for (const expression of invalidExpressions) {
        const result = await spelValidationService.validateExpression(
          expression
        );

        if (expression.trim() === "") {
          // Empty expressions should be invalid but handled specially
          expect(result.valid).toBe(false);
          expect(result.error).toContain("empty");
        } else {
          expect(result.valid).toBe(false);
          expect(result.error).toBeTruthy();
          expect(typeof result.error).toBe("string");
        }

        console.log(
          `✅ FIXED: "${expression}" correctly identified as invalid`
        );
      }
    }, 30000); // Allow time for async operations

    test("should provide meaningful error messages", async () => {
      const testCases = [
        { expr: "amount >", expectedKeywords: ["position", "parse"] },
        { expr: "name ==", expectedKeywords: ["position", "parse"] },
        { expr: "", expectedKeywords: ["empty"] },
      ];

      for (const testCase of testCases) {
        const result = await spelValidationService.validateExpression(
          testCase.expr
        );

        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();

        // Check that error message contains helpful keywords
        const errorLower = result.error.toLowerCase();
        const hasExpectedKeyword = testCase.expectedKeywords.some((keyword) =>
          errorLower.includes(keyword.toLowerCase())
        );
        expect(hasExpectedKeyword).toBe(true);
      }
    }, 15000);
  });

  describe("Valid Expression Handling", () => {
    test("should validate correct expressions", async () => {
      for (const expression of validExpressions) {
        const result = await spelValidationService.validateExpression(
          expression
        );

        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();

        console.log(`✅ "${expression}" correctly validated as valid`);
      }
    }, 30000);

    test("should provide execution context for valid expressions", async () => {
      const result = await spelValidationService.validateExpression(
        "amount > 100"
      );

      expect(result.valid).toBe(true);
      expect(result).toHaveProperty("availableContext");
      expect(result.availableContext).toHaveProperty("transaction");
      expect(result.availableContext).toHaveProperty("user");
    }, 10000);
  });

  describe("Live Validation", () => {
    test("should handle empty expressions in live mode", async () => {
      const result = await spelValidationService.validateLive(
        "",
        "business",
        false
      );
      expect(result.valid).toBe(true);
      expect(result.empty).toBe(true);
    });

    test("should catch syntax errors in live mode", async () => {
      const result = await spelValidationService.validateLive(
        "amount >",
        "business",
        false
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("should validate correct expressions in live mode", async () => {
      const result = await spelValidationService.validateLive(
        "amount > 100",
        "business",
        false
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe("Batch Validation", () => {
    test("should handle mixed valid and invalid expressions", async () => {
      const mixedExpressions = [
        "amount > 100", // Valid
        "name ==", // Invalid
        'status == "ACTIVE"', // Valid
        "price >", // Invalid
      ];

      const results = await spelValidationService.validateBatch(
        mixedExpressions
      );

      expect(results).toHaveLength(4);
      expect(results[0].valid).toBe(true); // amount > 100
      expect(results[1].valid).toBe(false); // name ==
      expect(results[2].valid).toBe(true); // status == "ACTIVE"
      expect(results[3].valid).toBe(false); // price >
    }, 20000);
  });

  describe("Performance", () => {
    test("should validate expressions within reasonable time", async () => {
      const startTime = Date.now();

      await spelValidationService.validateExpression("amount > 100");

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test("should handle multiple concurrent validations", async () => {
      const promises = [
        spelValidationService.validateExpression("amount > 100"),
        spelValidationService.validateExpression("name =="), // Invalid
        spelValidationService.validateExpression('status == "ACTIVE"'),
      ];

      const results = await Promise.all(promises);

      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
      expect(results[2].valid).toBe(true);
    }, 10000);
  });

  describe("Regression Tests", () => {
    test("should no longer return valid=true for all expressions", async () => {
      // This was the original bug - ALL expressions returned valid=true
      const definitelyInvalidExpressions = [
        "this is not spel at all",
        "((((incomplete",
        "amount >>>>>> 100",
        "//not-an-expression",
      ];

      for (const expr of definitelyInvalidExpressions) {
        const result = await spelValidationService.validateExpression(expr);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      }
    }, 15000);

    test("should maintain backward compatibility for valid expressions", async () => {
      const result = await spelValidationService.validateExpression(
        "amount > 100"
      );

      // Should still have the same response structure
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("error");
      expect(result).toHaveProperty("availableContext");
      expect(result.valid).toBe(true);
    });
  });
});
