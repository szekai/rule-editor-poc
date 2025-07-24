
// Test case to reproduce issue 2
// 1. Add existing rule set A (no duplications) 
// 2. Add existing rule set A again 
// Expected: Should show warning that rule set A already exists
// Actual: Adds rule set A twice

const testRuleSet = {
  id: 'TestRuleSet', 
  name: 'Test Rule Set',
  sourceType: 'rule_set',
  rules: [
    { id: 'TestRule1', name: 'Test Rule 1' },
    { id: 'TestRule2', name: 'Test Rule 2' }
  ]
};

// Current composition: []
// Add testRuleSet first time -> Should add successfully
// Add testRuleSet second time -> Should detect duplicate and warn

