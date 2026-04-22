# Tutorial: Your First Rule

This step-by-step tutorial will guide you through creating your first SpEL rule.

## Prerequisites

- Application running at `http://localhost:3000`
- Completed [Getting Started](../getting-started/running.md)

## What You'll Create

A validation rule that checks if a transaction amount exceeds $10,000.

```
Rule: High Amount Validation
Condition: transaction.amount > 10000
Type: Validation
Error Code: ERR_HIGH_AMOUNT
```

## Step-by-Step

### Step 1: Navigate to Rule Editor

1. Open your browser to `http://localhost:3000`
2. Click **"Launch Rule Editor"**
3. You're now on the Rule Editor page

### Step 2: Open New Rule Form

1. Click the **"+ New Rule"** button
2. A form dialog appears

### Step 3: Fill in Rule Details

Fill in the form fields:

```
┌─────────────────────────────────────────────┐
│  Create New Rule                            │
├─────────────────────────────────────────────┤
│                                             │
│  Name: *                                    │
│  ┌─────────────────────────────────────┐    │
│  │ High Amount Validation              │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Description:                               │
│  ┌─────────────────────────────────────┐    │
│  │ Validates transaction amount        │    │
│  │ exceeds $10,000                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Rule Type: [▼ Validation]                 │
│                                             │
│  Error Code:                                │
│  ┌─────────────────────────────────────┐    │
│  │ ERR_HIGH_AMOUNT                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 4: Enter SpEL Condition

In the Monaco Editor, type:

```spel
transaction.amount > 10000
```

You should see a green checkmark indicating valid SpEL:

```
✓ Valid SpEL expression
```

### Step 5: Save the Rule

1. Click **"Save Rule"** button
2. The dialog closes
3. Your rule appears in the list

### Step 6: Verify

You should see your new rule in the list:

```
┌─────────────────────────────────────────────┐
│  ✓ High Amount Validation    [Edit][Delete]│
│    Validates amount > 10000                  │
└─────────────────────────────────────────────┘
```

## Understanding What Happened

### Rule Structure

Your rule now looks like this:

```json
{
  "id": "HighAmountValidation",
  "name": "High Amount Validation",
  "description": "Validates transaction amount exceeds $10,000",
  "condition": "transaction.amount > 10000",
  "ruleType": "validation",
  "errorCode": "ERR_HIGH_AMOUNT"
}
```

### What It Does

This rule evaluates:

- **If** `transaction.amount > 10000` → Rule passes
- **If** `transaction.amount <= 10000` → Rule fails

### Usage

Now you can use this rule in Rule Sets!

## Next Steps

- [Building a Rule Set Tutorial](building-ruleset.md)
- [SpEL Basics](../concepts/spel-basics.md)
