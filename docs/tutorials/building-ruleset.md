# Tutorial: Building a Rule Set

This tutorial teaches you how to create a rule set by combining individual rules.

## What You'll Create

A rule set called "Payment Validation" containing multiple rules:

```
Payment Validation Rule Set
├── High Amount Validation (Priority 1)
├── Currency Check (Priority 2)
└── Business Hours (Priority 3)
```

## Prerequisites

- Rules exist in the system (use sample data or create new ones)
- Completed [Your First Rule](first-rule.md)

## Step-by-Step

### Step 1: Navigate to Rule Set Composer

From the Rule Editor page:

1. Click the **"Rule Set Composer"** tab
2. You'll see the Library (left) and Composition (right) panels

### Step 2: Understand the Interface

```
┌─────────────────────────┬─────────────────────────┐
│   Rule Library          │   Composition Panel    │
│                         │                         │
│  Available Rules:       │  Drag rules here to     │
│  • Amount Validation    │  build your rule set   │
│  • Currency Check       │                         │
│  • Business Hours       │                         │
│                         │  [Empty state message]  │
│  Existing Rule Sets:    │                         │
│  • Basic Validation    │                         │
└─────────────────────────┴─────────────────────────┘
```

### Step 3: Add First Rule - Priority 1

1. Find "Amount Validation" in the Available Rules
2. Drag it to the Composition Panel
3. The rule appears with Priority 1

```
Composition:
┌─────────────────────────────────────────┐
│ Priority: 1                             │
│ ● Amount Validation                      │
└─────────────────────────────────────────┘
```

### Step 4: Add Second Rule - Priority 2

1. Find "Currency Check" in the Available Rules
2. Drag it to the Composition Panel
3. It appears at Priority 2 (default)

```
Composition:
┌─────────────────────────────────────────┐
│ Priority: 1                             │
│ ● Amount Validation                      │
├─────────────────────────────────────────┤
│ Priority: 2                             │
│ ● Currency Check                         │
└─────────────────────────────────────────┘
```

### Step 5: Add Third Rule - Priority 3

1. Find "Business Hours" in the Available Rules
2. Drag it to the Composition Panel
3. It appears at Priority 3

```
Composition:
┌─────────────────────────────────────────┐
│ Priority: 1                             │
│ ● Amount Validation                      │
├─────────────────────────────────────────┤
│ Priority: 2                             │
│ ● Currency Check                         │
├─────────────────────────────────────────┤
│ Priority: 3                             │
│ ● Business Hours                         │
└─────────────────────────────────────────┘
```

### Step 6: Save the Rule Set

1. Click **"Save Rule Set"** button
2. Fill in the dialog:

```
┌─────────────────────────────────────────────┐
│  Save Rule Set                              │
├─────────────────────────────────────────────┤
│                                              │
│  Name: *                                     │
│  ┌─────────────────────────────────────┐    │
│  │ Payment Validation                  │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Description:                                │
│  ┌─────────────────────────────────────┐    │
│  │ Standard payment validation rules   │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Will contain:                               │
│  • Amount Validation (Rule)                  │
│  • Currency Check (Rule)                     │
│  • Business Hours (Rule)                     │
│                                              │
│  [Cancel]  [Save]                            │
│                                              │
└─────────────────────────────────────────────┘
```

3. Click **"Save"**

### Step 7: Verify

Your rule set now appears in the "Existing Rule Sets" section:

```
Existing Rule Sets:
┌─────────────────────────────────────────────┐
│ Payment Validation          [✏️] [🗑️]      │
│ 3 rules • Priority-based                    │
└─────────────────────────────────────────────┘
```

## Execution Flow

Your rule set will execute like this:

```
1. Priority 1: Amount Validation
   └── If fails: Return ERR_AMOUNT_EXCEEDED

2. Priority 2: Currency Check
   └── If fails: Return ERR_INVALID_CURRENCY

3. Priority 3: Business Hours
   └── If fails: Return ERR_OUTSIDE_BUSINESS_HOURS
```

## Adding a Rule Set Reference

You can also include existing rule sets:

1. Drag "Basic Validation Set" from Existing Rule Sets
2. It appears with a Reference badge:

```
┌─────────────────────────────────────────────┐
│ Priority: 4                                 │
│ [🔗] Basic Validation Set  (Reference)      │
└─────────────────────────────────────────────┘
```

This includes all rules from that rule set by reference.

## Next Steps

- [Managing Priorities Tutorial](managing-priorities.md)
- [Editing Existing Rule Sets](editing-rulesets.md)
