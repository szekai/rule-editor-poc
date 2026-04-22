# Tutorial: Editing Existing Rule Sets

Learn how to modify existing rule sets.

## Prerequisites

- Completed [Building a Rule Set](building-ruleset.md)
- Have an existing rule set to edit

## What You'll Do

Edit an existing rule set to:
- Add new rules
- Remove rules
- Change priorities

## Step-by-Step

### Step 1: Find the Rule Set

Navigate to Rule Set Composer.

Find your rule set in the "Existing Rule Sets" list:

```
Existing Rule Sets:
┌─────────────────────────────────────────────┐
│ Payment Validation          [✏️] [🗑️]      │
│ 3 rules • Priority-based                    │
└─────────────────────────────────────────────┘
```

### Step 2: Open Edit Mode

Click the **Edit** (✏️) button.

The composition loads into the editor:

```
┌─────────────────────────────────────────────┐
│  EDIT MODE: Payment Validation (3 items)   │
│  [Clear]  [Update Rule Set]                │
└─────────────────────────────────────────────┘
```

### Step 3: Modify the Composition

#### Adding a Rule

1. Drag a new rule from Available Rules
2. It drops into the composition

#### Removing a Rule

1. Find the rule in composition
2. Click the **X** (remove) button

```
┌─────────────────────────────────────────────┐
│ Priority: 1                                  │
│ ● Amount Validation           [ℹ] [✗]      │
│                                         ↑   │
│                                  Remove     │
└─────────────────────────────────────────────┘
```

#### Changing Priority

1. Click the priority number
2. Type new value
   - OR use arrow buttons

### Step 4: Save Changes

Click **"Update Rule Set"** button.

### Step 5: Verify

The rule set is updated with your changes.

## Self-Reference Prevention

### What is Self-Reference?

You cannot add a rule set to itself:

```
┌─────────────────────────────────────────────┐
│ Cannot add "Payment Validation" to itself   │
│                                              │
│ Reason: Would create self-reference         │
│                                              │
│ [OK]                                        │
└─────────────────────────────────────────────┘
```

### How to Handle

If you need the rules from the current rule set plus more:

1. Note which rules are in the current set
2. Add those individual rules to a new composition
3. Add additional rules
4. Save as a new rule set

## Edit Mode Features

### Edit Mode Badge

Shows you're editing:

```
EDIT MODE: Payment Validation (3 items)
```

### Cancel/Reset

Click **"Clear"** to reset the composition.

### Update vs Save

| Button | When to Use |
|--------|-------------|
| Save Rule Set | Creating new rule set |
| Update Rule Set | Modifying existing |

## Advanced: Handling Duplicates

### Duplicate Detection

When editing, duplicates are prevented:

```
┌─────────────────────────────────────────────┐
│ Duplicate Rules Detected                     │
│                                              │
│ "Amount Validation" is already in the       │
│ rule set.                                    │
│                                              │
│ [OK, Don't Add]                             │
└─────────────────────────────────────────────┘
```

### Copy from Rule Sets

If a rule set contains duplicates, you can copy non-duplicate rules:

1. Drag a rule set with some duplicates
2. Dialog shows what's duplicated and what's new
3. Choose "Copy New Rules"

## Best Practices

### Before Editing

1. Note current rules and priorities
2. Plan what changes to make
3. Consider dependencies

### During Editing

1. Save frequently
2. Test after each major change
3. Use "Clear" to start fresh if confused

### After Editing

1. Verify the rule set works
2. Check dependent rule sets
3. Update documentation

## Common Scenarios

### Add Rule to Existing Set

1. Edit the rule set
2. Drag new rule to composition
3. Set appropriate priority
4. Update

### Remove Rule from Set

1. Edit the rule set
2. Click X on the rule
3. Update

### Change Order

1. Edit the rule set
2. Adjust priorities with arrows
3. Update

## Next Steps

- [Approval Workflow Tutorial](approval-workflow.md)
