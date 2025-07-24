import { describe, it, expect, beforeEach } from "vitest";

// Mock data matching the actual application data
const mockRules = [
  {
    id: "AmountValidation",
    name: "Amount Validation",
    description: "Check if transaction amount exceeds limit",
    condition: "transaction.amount > 10000",
    ruleType: "validation",
    errorCode: "ERR_AMOUNT_EXCEEDED",
  },
  {
    id: "CurrencyCheck",
    name: "Currency Check",
    description: "Validate supported currencies",
    condition: "transaction.currency in {'USD', 'EUR', 'GBP'}",
    ruleType: "validation",
    errorCode: "ERR_INVALID_CURRENCY",
  },
  {
    id: "BusinessHours",
    name: "Business Hours",
    description: "Check if transaction is during business hours",
    condition:
      "transaction.timestamp.hour >= 9 && transaction.timestamp.hour <= 17",
    ruleType: "execution",
    errorCode: "ERR_OUTSIDE_BUSINESS_HOURS",
  },
  {
    id: "CurrencyNotEmpty",
    name: "Currency Not Empty",
    description: "Ensure currency field is not empty or null",
    condition: 'transaction.currency != null && transaction.currency != ""',
    ruleType: "validation",
    errorCode: "ERR_CURRENCY_EMPTY",
  },
];

const mockRuleSets = [
  {
    id: "BasicValidationSet",
    name: "Basic Validation Set",
    description: "Standard validation rules for all transactions",
    rules: [
      { id: "AmountValidation", priority: 1, reference: false },
      { id: "CurrencyCheck", priority: 2, reference: false },
    ],
    type: "rule_set",
  },
  {
    id: "EnhancedValidationSet",
    name: "Enhanced Validation Set",
    description: "Extended validation with business rules",
    rules: [
      { id: "AmountValidation", priority: 1, reference: false },
      { id: "CurrencyCheck", priority: 2, reference: false },
      { id: "BusinessHours", priority: 2, reference: false },
      { id: "CurrencyNotEmpty", priority: 3, reference: false },
    ],
    type: "rule_set",
  },
];

const ItemType = {
  RULE: "rule",
  RULE_SET: "rule_set",
};

// Helper function to find non-duplicated rules within a rule set
const findNonDuplicatedRules = (ruleSet, newRuleSet, rules) => {
  if (!ruleSet.rules || ruleSet.rules.length === 0) return [];

  const nonDuplicatedRules = [];

  ruleSet.rules.forEach((ruleItem) => {
    // Handle both old format (just ID) and new format (object with id, priority, reference)
    const ruleId = typeof ruleItem === "object" ? ruleItem.id : ruleItem;
    const reference = typeof ruleItem === "object" ? ruleItem.reference : false;
    const priority = typeof ruleItem === "object" ? ruleItem.priority : 1;

    // Only check individual rules (not rule set references)
    if (!reference) {
      const rule = rules.find((r) => r.id === ruleId);
      if (rule) {
        // Check if this rule is not already in the composition
        const existsInComposition = newRuleSet.some(
          (item) => item.id === rule.id && item.sourceType === ItemType.RULE
        );

        if (!existsInComposition) {
          nonDuplicatedRules.push({
            ...rule,
            sourceType: ItemType.RULE,
            priority: priority,
            reference: false,
          });
        }
      }
    }
  });

  return nonDuplicatedRules;
};

// Function to check if duplication prompt should be shown
const shouldShowDuplicationPrompt = (item, newRuleSet, rules) => {
  if (item.sourceType !== ItemType.RULE_SET) return false;

  const nonDuplicatedRules = findNonDuplicatedRules(item, newRuleSet, rules);

  const totalRulesInRuleSet = item.rules
    ? item.rules.filter((ruleItem) => {
        const reference =
          typeof ruleItem === "object" ? ruleItem.reference : false;
        return !reference; // Count only individual rules, not rule set references
      }).length
    : 0;

  // Should prompt if some (but not all) rules are already in composition
  return (
    nonDuplicatedRules.length > 0 &&
    nonDuplicatedRules.length < totalRulesInRuleSet
  );
};

describe("Rule Set Duplication Detection", () => {
  let newRuleSet;

  beforeEach(() => {
    newRuleSet = [];
  });

  describe("findNonDuplicatedRules", () => {
    it("should return all rules when composition is empty", () => {
      const basicValidationSet = mockRuleSets[0];
      const result = findNonDuplicatedRules(
        basicValidationSet,
        newRuleSet,
        mockRules
      );

      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual([
        "Amount Validation",
        "Currency Check",
      ]);
    });

    it("should return only non-duplicated rules when some rules are in composition", () => {
      // Add Currency Check to composition
      newRuleSet = [
        {
          id: "CurrencyCheck",
          name: "Currency Check",
          sourceType: ItemType.RULE,
          priority: 1,
          reference: false,
        },
      ];

      const basicValidationSet = mockRuleSets[0];
      const result = findNonDuplicatedRules(
        basicValidationSet,
        newRuleSet,
        mockRules
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Amount Validation");
    });

    it("should return empty array when all rules are in composition", () => {
      // Add both rules to composition
      newRuleSet = [
        {
          id: "AmountValidation",
          name: "Amount Validation",
          sourceType: ItemType.RULE,
          priority: 1,
          reference: false,
        },
        {
          id: "CurrencyCheck",
          name: "Currency Check",
          sourceType: ItemType.RULE,
          priority: 2,
          reference: false,
        },
      ];

      const basicValidationSet = mockRuleSets[0];
      const result = findNonDuplicatedRules(
        basicValidationSet,
        newRuleSet,
        mockRules
      );

      expect(result).toHaveLength(0);
    });

    it("should handle rule sets with no rules", () => {
      const emptyRuleSet = { id: "empty", name: "Empty", rules: [] };
      const result = findNonDuplicatedRules(
        emptyRuleSet,
        newRuleSet,
        mockRules
      );

      expect(result).toHaveLength(0);
    });
  });

  describe("shouldShowDuplicationPrompt", () => {
    it("should return false for individual rules", () => {
      const currencyCheckRule = {
        ...mockRules[1],
        sourceType: ItemType.RULE,
      };

      const result = shouldShowDuplicationPrompt(
        currencyCheckRule,
        newRuleSet,
        mockRules
      );
      expect(result).toBe(false);
    });

    it("should return false when no rules are in composition (should add all)", () => {
      const basicValidationSet = {
        ...mockRuleSets[0],
        sourceType: ItemType.RULE_SET,
      };

      const result = shouldShowDuplicationPrompt(
        basicValidationSet,
        newRuleSet,
        mockRules
      );
      expect(result).toBe(false);
    });

    it("should return TRUE when Currency Check is in composition and Basic Validation Set is dropped", () => {
      // This is the exact test scenario from the user
      newRuleSet = [
        {
          id: "CurrencyCheck",
          name: "Currency Check",
          sourceType: ItemType.RULE,
          priority: 1,
          reference: false,
        },
      ];

      const basicValidationSet = {
        ...mockRuleSets[0],
        sourceType: ItemType.RULE_SET,
      };

      const result = shouldShowDuplicationPrompt(
        basicValidationSet,
        newRuleSet,
        mockRules
      );

      console.log("Test Debug:");
      console.log(
        "- Current composition:",
        newRuleSet.map((r) => r.name)
      );
      console.log("- Rule set:", basicValidationSet.name);
      console.log("- Rule set rules:", basicValidationSet.rules);

      const nonDuplicatedRules = findNonDuplicatedRules(
        basicValidationSet,
        newRuleSet,
        mockRules
      );
      console.log(
        "- Non-duplicated rules:",
        nonDuplicatedRules.map((r) => r.name)
      );
      console.log("- Non-duplicated count:", nonDuplicatedRules.length);

      const totalRulesInRuleSet = basicValidationSet.rules.filter(
        (ruleItem) => {
          const reference =
            typeof ruleItem === "object" ? ruleItem.reference : false;
          return !reference;
        }
      ).length;
      console.log("- Total rules in rule set:", totalRulesInRuleSet);
      console.log("- Should prompt:", result);

      expect(result).toBe(true);
    });

    it("should return false when all rules are in composition (should only copy references)", () => {
      newRuleSet = [
        {
          id: "AmountValidation",
          name: "Amount Validation",
          sourceType: ItemType.RULE,
          priority: 1,
          reference: false,
        },
        {
          id: "CurrencyCheck",
          name: "Currency Check",
          sourceType: ItemType.RULE,
          priority: 2,
          reference: false,
        },
      ];

      const basicValidationSet = {
        ...mockRuleSets[0],
        sourceType: ItemType.RULE_SET,
      };

      const result = shouldShowDuplicationPrompt(
        basicValidationSet,
        newRuleSet,
        mockRules
      );
      expect(result).toBe(false);
    });

    it("should handle enhanced validation set with multiple duplicates", () => {
      // Add some rules to composition
      newRuleSet = [
        {
          id: "CurrencyCheck",
          name: "Currency Check",
          sourceType: ItemType.RULE,
          priority: 1,
          reference: false,
        },
        {
          id: "BusinessHours",
          name: "Business Hours",
          sourceType: ItemType.RULE,
          priority: 2,
          reference: false,
        },
      ];

      const enhancedValidationSet = {
        ...mockRuleSets[1],
        sourceType: ItemType.RULE_SET,
      };

      const result = shouldShowDuplicationPrompt(
        enhancedValidationSet,
        newRuleSet,
        mockRules
      );

      // Should prompt because 2 rules are duplicated, 2 are not (AmountValidation, CurrencyNotEmpty)
      expect(result).toBe(true);

      const nonDuplicatedRules = findNonDuplicatedRules(
        enhancedValidationSet,
        newRuleSet,
        mockRules
      );
      expect(nonDuplicatedRules).toHaveLength(2);
      expect(nonDuplicatedRules.map((r) => r.name)).toEqual([
        "Amount Validation",
        "Currency Not Empty",
      ]);
    });
  });

  describe("Real-world scenarios", () => {
    it("should properly detect Currency Check + Basic Validation Set scenario", () => {
      // Step 1: User drags Currency Check
      const currencyCheck = {
        ...mockRules[1],
        sourceType: ItemType.RULE,
        priority: 1,
        reference: false,
      };
      newRuleSet = [currencyCheck];

      // Step 2: User drags Basic Validation Set
      const basicValidationSet = {
        ...mockRuleSets[0],
        sourceType: ItemType.RULE_SET,
      };

      // This should trigger the duplication prompt
      const shouldPrompt = shouldShowDuplicationPrompt(
        basicValidationSet,
        newRuleSet,
        mockRules
      );
      expect(shouldPrompt).toBe(true);

      // The non-duplicated rules should be just "Amount Validation"
      const nonDuplicatedRules = findNonDuplicatedRules(
        basicValidationSet,
        newRuleSet,
        mockRules
      );
      expect(nonDuplicatedRules).toHaveLength(1);
      expect(nonDuplicatedRules[0].name).toBe("Amount Validation");
    });

    it("should handle reverse scenario: Basic Validation Set + Currency Check", () => {
      // Step 1: User drags Basic Validation Set
      const basicValidationSet = {
        ...mockRuleSets[0],
        sourceType: ItemType.RULE_SET,
        priority: 1,
        reference: true,
      };
      newRuleSet = [basicValidationSet];

      // Step 2: User drags Currency Check (individual rule)
      const currencyCheck = {
        ...mockRules[1],
        sourceType: ItemType.RULE,
      };

      // This should NOT trigger prompt (individual rules don't use this logic)
      const shouldPrompt = shouldShowDuplicationPrompt(
        currencyCheck,
        newRuleSet,
        mockRules
      );
      expect(shouldPrompt).toBe(false);
    });
  });
});
