# SpEL Rule Editor

The SpEL Rule Editor provides a comprehensive interface for creating, editing, and managing SpEL-based rules using the Monaco Editor.

## Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    SpEL Rule Editor                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Rules List                                          │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │ ✓ Amount Validation           [Edit][Delete]│    │    │
│  │  │ ✓ Currency Check            [Edit][Delete]  │    │    │
│  │  │ ✓ Business Hours            [Edit][Delete]  │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  [+ New Rule]                                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Interface Elements

### Rule List

The main view shows all existing rules:

- **Checkmark**: Indicates rule is valid
- **Name**: Rule identifier
- **Actions**: Edit and Delete buttons

### New Rule Button

Click "New Rule" to open the rule creation form.

## Creating a Rule

### Step 1: Open Rule Form

Click the **"+ New Rule"** button.

### Step 2: Fill in Rule Details

```
┌─────────────────────────────────────────────┐
│  Create New Rule                            │
├─────────────────────────────────────────────┤
│                                             │
│  Name: *                                    │
│  ┌─────────────────────────────────────┐    │
│  │ Amount Validation                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Description:                               │
│  ┌─────────────────────────────────────┐    │
│  │ Check if amount exceeds limit       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Rule Type:                                │
│  [▼ Validation]                             │
│                                             │
│  Error Code:                               │
│  ┌─────────────────────────────────────┐    │
│  │ ERR_AMOUNT_EXCEEDED                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### Step 3: Enter SpEL Condition

The Monaco Editor provides syntax highlighting:

```
┌─────────────────────────────────────────────┐
│  SpEL Condition:                           │
│  ┌─────────────────────────────────────────┐│
│  │ transaction.amount > 10000              ││
│  │                                         ││
│  │ ✓ Valid SpEL expression                ││
│  └─────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

### Step 4: Save

Click "Save Rule" to create the rule.

## Monaco Editor Features

The Monaco Editor provides a rich coding experience:

### Syntax Highlighting

Different SpEL elements are highlighted:

- **Strings**: Orange
- **Numbers**: Green
- **Operators**: Blue
- **Properties**: White

### Auto-Complete

Press `Ctrl+Space` to see available properties:

```
transaction.
├── amount
├── currency
├── type
├── status
└── timestamp.
```

### Real-Time Validation

```
┌─────────────────────────────────────────────┐
│  Expression: transaction.amount > 10000     │
│                                             │
│  ✓ Valid SpEL expression                   │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Expression: transaction.amounr > 10000     │
│                                             │
│  ✗ Error: Cannot resolve property 'amounr' │
│                                             │
└─────────────────────────────────────────────┘
```

### Error Highlighting

Syntax errors are underlined in red:

```
transaction.amount > 10000  ← "amounr" is red/wavy
```

## Rule Types

### Validation Rules

Used for input validation:

```spel
transaction.amount > 0
transaction.currency in {'USD', 'EUR', 'GBP'}
```

### Execution Rules

Used for action decisions:

```spel
user.permissions.contains('EXECUTE')
system.maintenance == false
```

## Editing a Rule

1. Click **Edit** on the rule in the list
2. Modify fields in the form
3. Click **Update Rule**

## Deleting a Rule

1. Click **Delete** on the rule
2. Confirm deletion in the dialog
3. Rule is removed

**Note**: Deleting a rule does not affect rule sets that reference it.

## Validation Features

### Syntax Validation

Checks SpEL syntax in real-time:

- Parenthesis matching
- Operator validity
- Property existence

### Error Messages

| Error | Meaning |
|-------|---------|
| `Unexpected token` | Invalid syntax |
| `Cannot resolve property` | Unknown field |
| `Expecting ')'` | Missing closing bracket |

### Suggestions

When errors occur, suggestions may appear:

```
Error: Cannot resolve property 'amnt'
Suggestion: Did you mean 'amount'?
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Trigger auto-complete |
| `Ctrl+S` | Save rule (when in form) |
| `Escape` | Close dialog |

## Best Practices

### Rule Naming

- Use descriptive names: `AmountValidation` not `Rule1`
- Include business context: `HighValueTransactionCheck`

### Conditions

- Keep conditions simple and readable
- Test thoroughly before saving
- Use comments in complex expressions

### Error Codes

- Use consistent prefix: `ERR_`, `VAL_`
- Descriptive: `ERR_AMOUNT_EXCEEDED` not `ERR_1`

---

## Next Steps

- [Your First Rule Tutorial](../tutorials/first-rule.md)
- [SpEL Basics](../concepts/spel-basics.md)
