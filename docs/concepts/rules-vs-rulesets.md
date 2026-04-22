# Rules vs Rule Sets

Understanding the difference between Rules and Rule Sets is fundamental to using the application effectively.

## Rules

A **Rule** is the fundamental unit of validation. It defines a single condition that evaluates to true or false.

### Rule Structure

```
┌─────────────────────────────────────────┐
│              Rule                         │
├─────────────────────────────────────────┤
│  Name:        Amount Validation          │
│  Description: Check if amount > 10000   │
│  Type:        Validation                │
│  Condition:   transaction.amount > 10000 │
│  Error Code:  ERR_AMOUNT_EXCEEDED       │
└─────────────────────────────────────────┘
```

### Rule Properties

| Property | Description | Required |
|----------|-------------|----------|
| Name | Human-readable name | Yes |
| Description | What the rule does | No |
| Type | validation or execution | Yes |
| Condition | SpEL expression | Yes |
| Error Code | Error identifier | No |

### Rule Types

#### Validation Rules

Validation rules check if data meets certain criteria. They typically:

- Return `true` if validation passes
- Return `false` if validation fails
- Are evaluated before processing

Example: `transaction.amount > 0`

#### Execution Rules

Execution rules determine whether an action should be executed. They:

- Are evaluated when an action is triggered
- Can perform more complex logic
- May have side effects in real implementations

Example: `user.permissions.contains('EXECUTE_PAYMENT')`

### Creating a Rule

1. Navigate to the Rule Editor
2. Click "New Rule"
3. Fill in the rule properties
4. Enter your SpEL condition
5. Click "Save Rule"

---

## Rule Sets

A **Rule Set** is a collection of Rules (or other Rule Sets) that are executed together.

### Rule Set Structure

```
┌─────────────────────────────────────────┐
│           Rule Set                        │
├─────────────────────────────────────────┤
│  Name:        Basic Validation Set       │
│  Description: Standard validation rules  │
│                                         │
│  Rules:                                   │
│  ├─ Amount Validation    (Priority: 1)  │
│  ├─ Currency Check       (Priority: 2)  │
│  └─ Business Hours      (Priority: 3)   │
└─────────────────────────────────────────┘
```

### Rule Set Properties

| Property | Description | Required |
|----------|-------------|----------|
| Name | Human-readable name | Yes |
| Description | What the rule set does | No |
| Rules | Array of rules/rule sets | Yes |

### Rule Set Members

Each member of a rule set has:

- **ID**: Reference to a rule or nested rule set
- **Priority**: Execution order (lower = higher priority)
- **Reference**: `true` for rule sets, `false` for individual rules

---

## When to Use Each

### Use Rules When

- You need a single, reusable validation condition
- The condition might be shared across multiple rule sets
- You want to test the rule in isolation
- The rule represents a single business constraint

### Use Rule Sets When

- You want to group related rules together
- You need to execute multiple rules in sequence
- You want to create reusable rule combinations
- You need to enforce execution order

---

## Composition Patterns

### Flat Composition

```
Rule Set: Payment Validation
├── Rule: Amount Check
├── Rule: Currency Check
└── Rule: Status Check
```

All rules at the same level, executed by priority.

### Nested Composition

```
Rule Set: Comprehensive Validation
├── Rule: Amount Check           (priority: 1)
├── Rule Set: Basic Validation   (priority: 2, reference)
│   ├── Rule: Currency Check
│   └── Rule: Status Check
└── Rule: Country Check          (priority: 3)
```

Rules can reference other rule sets for modularity.

---

## Benefits of Separation

### Reusability

```
Rule Set A          Rule Set B
├── Amount Check    ├── Amount Check (reused)
├── Currency Check ├── Currency Check (reused)
└── Status Check   └── Custom Rule
```

Rules can be shared across multiple rule sets.

### Maintainability

- Change a rule once, affects all rule sets using it
- Easier to test individual rules
- Clear ownership of business logic

### Organization

- Group rules by business domain
- Create hierarchical rule structures
- Enable parallel development

---

## Examples

### Single Rule

```json
{
  "id": "AmountValidation",
  "name": "Amount Validation",
  "condition": "transaction.amount > 10000",
  "ruleType": "validation",
  "errorCode": "ERR_AMOUNT_EXCEEDED"
}
```

### Rule Set with Rules

```json
{
  "id": "BasicValidationSet",
  "name": "Basic Validation Set",
  "rules": [
    { "id": "AmountValidation", "priority": 1, "reference": false },
    { "id": "CurrencyCheck", "priority": 2, "reference": false }
  ]
}
```

### Nested Rule Set

```json
{
  "id": "ComprehensiveValidation",
  "name": "Comprehensive Validation",
  "rules": [
    { "id": "AmountValidation", "priority": 1, "reference": false },
    { "id": "BasicValidationSet", "priority": 2, "reference": true }
  ]
}
```

---

## Next Steps

- [Priority-Based Execution](priority-execution.md)
- [Building a Rule Set Tutorial](../tutorials/building-ruleset.md)
