import { SpelExpressionEvaluator } from "spel2js";

describe("Real SpEL Validation with spel2js", () => {
  describe("Valid Syntax", () => {
    test("should validate simple expressions", () => {
      const validExpressions = [
        "transaction.amount > 1000",
        'user.role == "ADMIN"',
        'transaction.currency == "USD"',
        'user.permissions.contains("APPROVE")',
        "transaction.amount >= 0",
        "user.name != null",
        'transaction.status in {"PENDING", "APPROVED"}',
        "transaction.amount + 100",
        'user.email.indexOf("@") > 0',
        "transaction.tags.size() > 0",
      ];

      validExpressions.forEach((expression) => {
        expect(() => {
          SpelExpressionEvaluator.compile(expression);
        }).not.toThrow();
      });
    });

    test("should validate complex expressions", () => {
      const complexExpressions = [
        '(transaction.amount > 10000 && user.role == "ADMIN") || user.permissions.contains("OVERRIDE")',
        "transaction.amount > (user.dailyLimit * 0.8)",
        'user.role == "MANAGER" ? transaction.amount < 50000 : transaction.amount < 10000',
        'transaction.tags.stream().anyMatch(tag -> tag.startsWith("VIP"))',
        'user.department == "FINANCE" && transaction.type in {"WIRE", "ACH"}',
      ];

      complexExpressions.forEach((expression) => {
        expect(() => {
          SpelExpressionEvaluator.compile(expression);
        }).not.toThrow();
      });
    });
  });

  describe("Invalid Syntax Detection", () => {
    test("should catch incomplete expressions", () => {
      const incompleteExpressions = [
        "transaction.amount >", // Missing right operand
        "user.role ==", // Missing comparison value
        "transaction.amount &&", // Incomplete logical expression
        "user.permissions.contains(", // Missing closing parenthesis and value
        "transaction.", // Trailing dot
        ".transaction.amount", // Leading dot
        "transaction..amount", // Double dots
        "user.role.", // Property access with trailing dot
      ];

      incompleteExpressions.forEach((expression) => {
        expect(() => {
          SpelExpressionEvaluator.compile(expression);
        }).toThrow();
      });
    });

    test("should catch syntax errors", () => {
      const syntaxErrors = [
        'transaction.currency == "USD', // Missing closing quote
        'user.permissions.contains("APPROVE"', // Missing closing parenthesis
        "transaction.amount > 1000)", // Extra closing parenthesis
        "(transaction.amount > 1000", // Missing closing parenthesis
        'user.role = "ADMIN"', // Single = instead of ==
        "transaction.amount & 1000", // Single & instead of &&
        'user.role | "ADMIN"', // Single | instead of ||
        "transaction.amount ++ 1000", // Invalid ++ operator
        "user..role", // Double dots
        "transaction[amount", // Missing closing bracket
        "user.role]", // Missing opening bracket
      ];

      syntaxErrors.forEach((expression) => {
        expect(() => {
          SpelExpressionEvaluator.compile(expression);
        }).toThrow();
      });
    });

    test("should catch empty and whitespace-only expressions", () => {
      const emptyExpressions = ["", "   ", "\t", "\n", "  \t  \n  "];

      emptyExpressions.forEach((expression) => {
        expect(() => {
          SpelExpressionEvaluator.compile(expression);
        }).toThrow();
      });
    });

    test("should provide error details for debugging", () => {
      const invalidExpression = "transaction.amount >";

      try {
        SpelExpressionEvaluator.compile(invalidExpression);
        fail("Expected compilation to throw an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Validation Helper Function", () => {
    const validateSpelExpression = (expression) => {
      try {
        if (!expression || expression.trim() === "") {
          return {
            valid: false,
            error: "Expression cannot be empty",
          };
        }

        SpelExpressionEvaluator.compile(expression);
        return {
          valid: true,
          error: null,
        };
      } catch (error) {
        return {
          valid: false,
          error: error.message,
        };
      }
    };

    test("should return valid for correct expressions", () => {
      const result = validateSpelExpression("transaction.amount > 1000");

      expect(result).toEqual({
        valid: true,
        error: null,
      });
    });

    test("should return invalid for syntax errors", () => {
      const result = validateSpelExpression("transaction.amount >");

      expect(result).toEqual({
        valid: false,
        error: expect.any(String),
      });
      expect(result.error.length).toBeGreaterThan(0);
    });

    test("should handle empty expressions", () => {
      const result = validateSpelExpression("");

      expect(result).toEqual({
        valid: false,
        error: "Expression cannot be empty",
      });
    });

    test("should handle whitespace-only expressions", () => {
      const result = validateSpelExpression("   ");

      expect(result).toEqual({
        valid: false,
        error: "Expression cannot be empty",
      });
    });
  });

  describe("Performance Tests", () => {
    test("should validate complex expressions quickly", () => {
      const complexExpression =
        '(transaction.amount > 10000 && user.role == "ADMIN") || (user.permissions.contains("OVERRIDE") && transaction.department in {"FINANCE", "TREASURY"})';

      const startTime = performance.now();

      expect(() => {
        SpelExpressionEvaluator.compile(complexExpression);
      }).not.toThrow();

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 100ms
      expect(executionTime).toBeLessThan(100);
    });

    test("should handle batch validation efficiently", () => {
      const expressions = Array(100)
        .fill()
        .map((_, i) => `transaction.amount > ${i * 100}`);

      const startTime = performance.now();

      expressions.forEach((expression) => {
        expect(() => {
          SpelExpressionEvaluator.compile(expression);
        }).not.toThrow();
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete 100 validations within 1 second
      expect(executionTime).toBeLessThan(1000);
    });
  });
});
