// Debug test for duplicate rule set detection issue

// Simulating the exact scenario:
// 1. Empty composition []
// 2. Add RuleSet A -> composition becomes [RuleSetA]
// 3. Add RuleSet A again -> should detect duplicate

const ItemType = {
  RULE: "rule",
  RULE_SET: "rule_set",
};

// Mock rule set
const testRuleSet = {
  id: "TestRuleSet",
  name: "Test Rule Set",
  sourceType: ItemType.RULE_SET,
  rules: [
    { id: "Rule1", name: "Rule 1", reference: false },
    { id: "Rule2", name: "Rule 2", reference: false },
  ],
};

// Mock composition after first add
const compositionAfterFirstAdd = [
  {
    id: "TestRuleSet",
    name: "Test Rule Set",
    sourceType: ItemType.RULE_SET,
    priority: 1,
    reference: true,
    rules: [
      { id: "Rule1", name: "Rule 1", reference: false },
      { id: "Rule2", name: "Rule 2", reference: false },
    ],
  },
];

// Test duplicate detection logic
function testDuplicateDetection() {
  const currentRuleSet = compositionAfterFirstAdd;
  const item = testRuleSet;

  const exists = currentRuleSet.some(
    (existingItem) =>
      existingItem.id === item.id && existingItem.sourceType === item.sourceType
  );

  console.log("Testing duplicate detection:");
  console.log("Current composition:", JSON.stringify(currentRuleSet, null, 2));
  console.log("Item to add:", JSON.stringify(item, null, 2));
  console.log("Duplicate exists?", exists);

  if (exists) {
    console.log("✅ SHOULD show duplicate warning");
  } else {
    console.log(
      "❌ SHOULD NOT add duplicate but logic says no duplicate found"
    );
  }
}

testDuplicateDetection();
