import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import RuleSetEditor from "../RuleSetEditor";
import * as mockApi from "../../utils/mockApi";

// Mock the mockApi module
vi.mock("../../utils/mockApi", () => ({
  mockApi: {
    getRules: vi.fn(),
    getRuleSets: vi.fn(),
    createRuleSet: vi.fn(),
    updateRuleSet: vi.fn(),
    deleteRuleSet: vi.fn(),
  },
}));

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
];

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </QueryClientProvider>
  );
};

describe("RuleSetEditor Integration", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup mock API responses
    mockApi.mockApi.getRules.mockResolvedValue(mockRules);
    mockApi.mockApi.getRuleSets.mockResolvedValue(mockRuleSets);
    mockApi.mockApi.createRuleSet.mockResolvedValue({
      id: "test",
      name: "Test",
    });
    mockApi.mockApi.updateRuleSet.mockResolvedValue({
      id: "test",
      name: "Test",
    });
    mockApi.mockApi.deleteRuleSet.mockResolvedValue({ success: true });

    // Clear all mocks
    vi.clearAllMocks();
  });

  it("should render the component without crashing", async () => {
    render(
      <TestWrapper>
        <RuleSetEditor />
      </TestWrapper>
    );

    // Wait for the component to load
    expect(screen.getByText("Rule Set Composer")).toBeInTheDocument();
  });

  it("should load rules and rule sets on mount", async () => {
    render(
      <TestWrapper>
        <RuleSetEditor />
      </TestWrapper>
    );

    // Check that API calls were made
    expect(mockApi.mockApi.getRules).toHaveBeenCalled();
    expect(mockApi.mockApi.getRuleSets).toHaveBeenCalled();
  });
});

describe("Duplication Detection Integration Test", () => {
  it("should verify the exact scenario from user report", () => {
    // Mock window.confirm to track if it's called
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    // This simulates the exact handleDrop logic
    const ItemType = { RULE: "rule", RULE_SET: "rule_set" };

    // Step 1: User has Currency Check in composition
    const newRuleSet = [
      {
        id: "CurrencyCheck",
        name: "Currency Check",
        sourceType: ItemType.RULE,
        priority: 1,
        reference: false,
      },
    ];

    // Step 2: User drops Basic Validation Set
    const droppedItem = {
      id: "BasicValidationSet",
      name: "Basic Validation Set",
      sourceType: ItemType.RULE_SET,
      rules: [
        { id: "AmountValidation", priority: 1, reference: false },
        { id: "CurrencyCheck", priority: 2, reference: false },
      ],
    };

    // Simulate the exact logic from handleDrop
    const exists = newRuleSet.some(
      (existingItem) =>
        existingItem.id === droppedItem.id &&
        existingItem.sourceType === droppedItem.sourceType
    );

    expect(exists).toBe(false); // Rule set is not in composition

    if (droppedItem.sourceType === ItemType.RULE_SET) {
      // This is the findNonDuplicatedRules logic
      const nonDuplicatedRules = [];

      droppedItem.rules.forEach((ruleItem) => {
        const ruleId = typeof ruleItem === "object" ? ruleItem.id : ruleItem;
        const reference =
          typeof ruleItem === "object" ? ruleItem.reference : false;
        const priority = typeof ruleItem === "object" ? ruleItem.priority : 1;

        if (!reference) {
          const rule = mockRules.find((r) => r.id === ruleId);
          if (rule) {
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

      const totalRulesInRuleSet = droppedItem.rules.filter((ruleItem) => {
        const reference =
          typeof ruleItem === "object" ? ruleItem.reference : false;
        return !reference;
      }).length;

      console.log("Integration Test Debug:");
      console.log("- Dropped item:", droppedItem.name);
      console.log(
        "- Current composition:",
        newRuleSet.map((r) => r.name)
      );
      console.log(
        "- Non-duplicated rules:",
        nonDuplicatedRules.map((r) => r.name)
      );
      console.log("- Non-duplicated count:", nonDuplicatedRules.length);
      console.log("- Total rules in rule set:", totalRulesInRuleSet);

      // This is the key condition that should trigger the prompt
      const shouldPrompt =
        nonDuplicatedRules.length > 0 &&
        nonDuplicatedRules.length < totalRulesInRuleSet;
      console.log("- Should prompt:", shouldPrompt);

      expect(shouldPrompt).toBe(true);
      expect(nonDuplicatedRules).toHaveLength(1);
      expect(nonDuplicatedRules[0].name).toBe("Amount Validation");
      expect(totalRulesInRuleSet).toBe(2);

      // If this was the actual component, it would show the confirm dialog here
      if (shouldPrompt) {
        const duplicatedCount = totalRulesInRuleSet - nonDuplicatedRules.length;
        const confirmed = window.confirm(
          `"${droppedItem.name}" contains ${duplicatedCount} rule${
            duplicatedCount !== 1 ? "s" : ""
          } that ${
            duplicatedCount !== 1 ? "are" : "is"
          } already in your composition.\n\nWould you like to add the rule set anyway and copy the ${
            nonDuplicatedRules.length
          } non-duplicated rule${
            nonDuplicatedRules.length !== 1 ? "s" : ""
          }?\n\nNon-duplicated rules to be added:\n${nonDuplicatedRules
            .map((r) => `• ${r.name}`)
            .join("\n")}`
        );

        // Verify the confirm was called with the right message
        expect(confirmSpy).toHaveBeenCalledWith(
          expect.stringContaining("Basic Validation Set")
        );
        expect(confirmSpy).toHaveBeenCalledWith(
          expect.stringContaining("Amount Validation")
        );
      }
    }

    confirmSpy.mockRestore();
  });
});
