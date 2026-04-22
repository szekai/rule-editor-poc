# Tutorial: Managing Priorities

Learn how to manage rule priorities for sequential and concurrent execution.

## What You'll Learn

- Change priority numbers
- Reorder rules with arrows
- Create concurrent groups
- Understand execution behavior

## Prerequisites

- Completed [Building a Rule Set](building-ruleset.md)

## Understanding Priority

### Sequential Execution

Rules with different priorities run in order:

```
Priority 1 → Priority 2 → Priority 3
```

### Concurrent Execution

Rules with the same priority run in parallel:

```
Priority 1 (concurrent):
  Rule A // Rule B // Rule C
```

## Step-by-Step

### Step 1: Create a Rule Set with Multiple Rules

1. Go to Rule Set Composer
2. Create a new composition with at least 3 rules
3. Each should have different priorities

```
┌─────────────────────────────────────────────┐
│ Priority: 1                                  │
│ ● Amount Validation                          │
├─────────────────────────────────────────────┤
│ Priority: 2                                  │
│ ● Currency Check                            │
├─────────────────────────────────────────────┤
│ Priority: 3                                  │
│ ● Status Check                              │
└─────────────────────────────────────────────┘
```

### Step 2: Change Priority Using Number Input

1. Click on the priority number for "Currency Check"
2. Change from `2` to `1`

The composition reorders:

```
┌─────────────────────────────────────────────┐
│ Priority: 1                                  │
│ ● Amount Validation                          │
│ ● Currency Check        (concurrent)        │
├─────────────────────────────────────────────┤
│ Priority: 3                                  │
│ ● Status Check                              │
└─────────────────────────────────────────────┘
```

Notice:
- "Currency Check" moved to Priority 1
- Shows "(concurrent)" badge with Amount Validation

### Step 3: Use Arrow Buttons

1. Find "Status Check" at Priority 3
2. Click the **▲** (up arrow) button
3. It changes to Priority 2

```
┌─────────────────────────────────────────────┐
│ Priority: 1                                  │
│ ● Amount Validation                          │
│ ● Currency Check                            │
├─────────────────────────────────────────────┤
│ Priority: 2                                  │
│ ● Status Check                              │
└─────────────────────────────────────────────┘
```

### Step 4: Create Concurrent Group

Let's make all three rules concurrent:

1. Change Amount Validation to Priority 2
2. Change Currency Check to Priority 2
3. Change Status Check to Priority 2

Result:

```
┌─────────────────────────────────────────────┐
│ Priority: 2 (3 concurrent)                   │
│ ● Amount Validation                          │
│ ● Currency Check                            │
│ ● Status Check                              │
└─────────────────────────────────────────────┘
```

All three now run in parallel!

### Step 5: Separate Concurrent Groups

1. Change Amount Validation back to Priority 1
2. Keep Currency Check and Status Check at Priority 2

```
┌─────────────────────────────────────────────┐
│ Priority: 1                                  │
│ ● Amount Validation                          │
├─────────────────────────────────────────────┤
│ Priority: 2 (2 concurrent)                   │
│ ● Currency Check                            │
│ ● Status Check                              │
└─────────────────────────────────────────────┘
```

## Visual Indicators

### Priority Badge

Shows priority number:

```
Priority: 1
```

### Concurrent Badge

Shows when multiple items share priority:

```
Priority: 2 (2 concurrent)
```

### Composition Summary

Top of the page shows:

```
[1 Rule] [2 Rules] [2 Priority Levels] [1 Concurrent Group]
```

## Execution Examples

### Example 1: Sequential

```
Priority 1: Security Check
Priority 2: Validation A
Priority 3: Validation B
```

Execution: Security → Validation A → Validation B

### Example 2: Concurrent

```
Priority 1: Security Check
Priority 2 (concurrent):
  - Validation A
  - Validation B
  - Validation C
Priority 3: Audit Log
```

Execution: Security → (A, B, C in parallel) → Audit Log

## Best Practices

### Do

- Put critical security rules at Priority 1
- Use concurrent for independent validations
- Document why priorities are set that way

### Don't

- Don't create deeply nested priorities (10+ levels)
- Don't make dependent rules concurrent
- Don't forget to test priority changes

## Next Steps

- [Editing Existing Rule Sets](editing-rulesets.md)
- [Concurrent Execution](../concepts/concurrent-execution.md)
