// Mock API utilities and in-memory storage
import { SpelExpressionEvaluator } from "spel2js";

// In-memory storage
let rulesStorage = [
  {
    id: "AmountValidation",
    name: "Amount Validation",
    description: "Check if transaction amount exceeds limit",
    condition: "transaction.amount > 10000",
    ruleType: "validation",
    errorCode: "ERR_AMOUNT_EXCEEDED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "CurrencyCheck",
    name: "Currency Check",
    description: "Validate supported currencies",
    condition: "transaction.currency in {'USD', 'EUR', 'GBP'}",
    ruleType: "validation",
    errorCode: "ERR_INVALID_CURRENCY",
    createdAt: new Date().toISOString(),
  },
  {
    id: "BusinessHours",
    name: "Business Hours",
    description: "Check if transaction is during business hours",
    condition:
      "transaction.timestamp.hour >= 9 && transaction.timestamp.hour <= 17",
    ruleType: "execution",
    errorCode: "ERR_OUTSIDE_BUSINESS_HOURS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "CurrencyNotEmpty",
    name: "Currency Not Empty",
    description: "Ensure currency field is not empty or null",
    condition: 'transaction.currency != null && transaction.currency != ""',
    ruleType: "validation",
    errorCode: "ERR_CURRENCY_EMPTY",
    createdAt: new Date().toISOString(),
  },
];

let ruleSetsStorage = [
  {
    id: "BasicValidationSet",
    name: "Basic Validation Set",
    description: "Standard validation rules for all transactions",
    rules: [
      { id: "AmountValidation", priority: 1, reference: false },
      { id: "CurrencyCheck", priority: 2, reference: false },
    ],
    type: "rule_set",
    createdAt: new Date().toISOString(),
  },
  {
    id: "EnhancedValidationSet",
    name: "Enhanced Validation Set",
    description: "Extended validation with business rules",
    rules: [
      { id: "AmountValidation", priority: 1, reference: false },
      { id: "CurrencyCheck", priority: 2, reference: false },
      { id: "BusinessHours", priority: 2, reference: false }, // Same priority as CurrencyCheck for concurrent execution
      { id: "CurrencyNotEmpty", priority: 3, reference: false },
    ],
    type: "rule_set",
    createdAt: new Date().toISOString(),
  },
  {
    id: "CompositeRuleSet",
    name: "Composite Rule Set",
    description:
      "Rule set that includes other rule sets with concurrent execution",
    rules: [
      { id: "BasicValidationSet", priority: 1, reference: true }, // Basic Validation Set
      { id: "AmountValidation", priority: 2, reference: false }, // Individual rule
      { id: "CurrencyCheck", priority: 2, reference: false }, // Concurrent with above rule
    ],
    type: "rule_set",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ComplexValidationSet",
    name: "Complex Validation Set",
    description: "Advanced rule set with multiple nested rule sets",
    rules: [
      { id: "EnhancedValidationSet", priority: 1, reference: true }, // Enhanced Validation Set
      { id: "CompositeRuleSet", priority: 2, reference: true }, // Composite Rule Set
    ],
    type: "rule_set",
    createdAt: new Date().toISOString(),
  },
];

// Mock API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Rules CRUD
  async getRules() {
    await delay(300);
    return rulesStorage;
  },

  async createRule(rule) {
    await delay(500);

    // Check for duplicate rule names (case-insensitive)
    const existingRule = rulesStorage.find(
      (r) => r.name.toLowerCase().trim() === rule.name.toLowerCase().trim()
    );
    if (existingRule) {
      throw new Error(
        `A rule with the name "${rule.name}" already exists. Rule names must be unique.`
      );
    }

    // Generate new ID based on rule name (camelCase)
    const generateIdFromName = (name) => {
      return name
        .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
        .split(" ")
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    };

    let newId = generateIdFromName(rule.name);

    // Check for duplicates and add suffix if needed
    const existingIds = rulesStorage.map((r) => r.id);
    let counter = 1;
    let originalId = newId;

    while (existingIds.includes(newId)) {
      newId = `${originalId}${counter}`;
      counter++;
    }

    const newRule = {
      ...rule,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    rulesStorage.push(newRule);
    return newRule;
  },

  async updateRule(id, updates) {
    await delay(500);
    const index = rulesStorage.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error("Rule not found");
    }

    // If name is being updated, check for duplicates (excluding current rule)
    if (updates.name) {
      const existingRule = rulesStorage.find(
        (r) =>
          r.id !== id &&
          r.name.toLowerCase().trim() === updates.name.toLowerCase().trim()
      );
      if (existingRule) {
        throw new Error(
          `A rule with the name "${updates.name}" already exists. Rule names must be unique.`
        );
      }
    }

    rulesStorage[index] = { ...rulesStorage[index], ...updates };
    return rulesStorage[index];
  },

  async deleteRule(id) {
    await delay(300);
    rulesStorage = rulesStorage.filter((r) => r.id !== id);
    return { success: true };
  },

  // Rule Sets CRUD
  async getRuleSets() {
    await delay(300);
    return ruleSetsStorage;
  },

  async createRuleSet(ruleSet) {
    await delay(500);

    // Check for duplicate rule set names (case-insensitive)
    const existingRuleSet = ruleSetsStorage.find(
      (rs) => rs.name.toLowerCase().trim() === ruleSet.name.toLowerCase().trim()
    );
    if (existingRuleSet) {
      throw new Error(
        `A rule set with the name "${ruleSet.name}" already exists. Rule set names must be unique.`
      );
    }

    // Generate new ID based on rule set name (camelCase)
    const generateIdFromName = (name) => {
      return name
        .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
        .split(" ")
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    };

    let newId = generateIdFromName(ruleSet.name);

    // Check for duplicates and add suffix if needed
    const existingIds = ruleSetsStorage.map((rs) => rs.id);
    let counter = 1;
    let originalId = newId;

    while (existingIds.includes(newId)) {
      newId = `${originalId}${counter}`;
      counter++;
    }

    const newRuleSet = {
      ...ruleSet,
      id: newId,
      type: "rule_set",
      createdAt: new Date().toISOString(),
    };
    ruleSetsStorage.push(newRuleSet);
    return newRuleSet;
  },

  async updateRuleSet(id, updates) {
    await delay(500);
    const index = ruleSetsStorage.findIndex((rs) => rs.id === id);
    if (index === -1) {
      throw new Error("Rule set not found");
    }

    // If name is being updated, check for duplicates (excluding current rule set)
    if (updates.name) {
      const existingRuleSet = ruleSetsStorage.find(
        (rs) =>
          rs.id !== id &&
          rs.name.toLowerCase().trim() === updates.name.toLowerCase().trim()
      );
      if (existingRuleSet) {
        throw new Error(
          `A rule set with the name "${updates.name}" already exists. Rule set names must be unique.`
        );
      }
    }

    ruleSetsStorage[index] = {
      ...ruleSetsStorage[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return ruleSetsStorage[index];
  },

  async deleteRuleSet(id) {
    await delay(300);
    ruleSetsStorage = ruleSetsStorage.filter((rs) => rs.id !== id);
    return { success: true };
  },

  // NOTE: SpEL validation has been moved to spelValidationService.js
  // to maintain single source of truth and avoid conflicts
};

// NOTE: SpEL validation has been moved to spelValidationService.js
// Use spelValidationService.validateSpelSyntax() instead of this function

// Sample data structure for SpEL context
export const sampleDataStructure = {
  transaction: {
    id: "TXN-001",
    amount: 15000,
    currency: "USD",
    type: "TRANSFER",
    status: "PENDING",
    timestamp: {
      hour: 14,
      minute: 30,
      day: "MONDAY",
    },
    from: {
      accountId: "ACC-001",
      country: "US",
    },
    to: {
      accountId: "ACC-002",
      country: "CA",
    },
  },
  user: {
    id: "USR-001",
    role: "ADMIN",
    permissions: ["READ", "WRITE", "APPROVE"],
    department: "FINANCE",
  },
  system: {
    environment: "PROD",
    maintenance: false,
    loadFactor: 0.7,
  },
};
