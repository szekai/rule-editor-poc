# SpEL Basics

This guide provides an introduction to Spring Expression Language (SpEL) for use in the Rule Editor.

## What is SpEL?

Spring Expression Language (SpEL) is a powerful expression language that supports querying and manipulating an object graph at runtime. It's used extensively in Spring applications for configuration, validation, and business rule definition.

## SpEL Syntax Overview

### Literals

```spel
# Strings
'Hello World'
"Double quoted strings"

# Numbers
42
3.14
-9.5

# Booleans
true
false
```

### Comparisons

```spel
# Equality
transaction.amount == 1000
user.role == 'ADMIN'

# Greater/Less than
transaction.amount > 10000
system.loadFactor < 0.8

# Range checks
transaction.amount >= 100 && transaction.amount <= 10000
```

### Logical Operations

```spel
# AND, OR, NOT
transaction.amount > 1000 && user.role == 'ADMIN'
transaction.status == 'PENDING' || transaction.status == 'PROCESSING'
!(user.role == 'GUEST')
```

### Collection Operations

```spel
# 'in' operator - check if value is in a list
transaction.currency in {'USD', 'EUR', 'GBP'}

# Collection selection
accounts.?[balance > 1000]

# Collection projection
accounts.![name]
```

### Object Access

```spel
# Property access
transaction.amount
user.permissions
transaction.from.country

# Method calls
transaction.currency.toUpperCase()
'Hello'.length()
```

### Null Safety

```spel
# Null-safe navigation
transaction?.currency?.toUpperCase()

# Null checks
transaction.currency != null
```

## Common Patterns in Rule Editor

### Transaction Validation

```spel
# Amount threshold check
transaction.amount > 10000

# Currency validation
transaction.currency in {'USD', 'EUR', 'GBP', 'JPY'}

# Status check
transaction.status == 'PENDING'
```

### User-Based Rules

```spel
# Role check
user.role == 'ADMIN'

# Permission check
user.permissions.contains('APPROVE')

# Department check
user.department == 'FINANCE'
```

### Time-Based Rules

```spel
# Business hours
transaction.timestamp.hour >= 9 && transaction.timestamp.hour <= 17

# Day of week
transaction.timestamp.dayOfWeek == 'MONDAY'
```

### Cross-Field Validation

```spel
# Cross-field comparison
transaction.amount > 1000 && user.role == 'PREMIUM'

# Country validation
transaction.from.country != transaction.to.country
```

## SpEL in the Rule Editor

### Real-Time Validation

The Rule Editor provides real-time syntax validation as you type:

```
┌─────────────────────────────────────────┐
│  SpEL Expression:                       │
│  ┌─────────────────────────────────┐   │
│  │ transaction.amount > 10000     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✓ Valid SpEL expression               │
└─────────────────────────────────────────┘
```

### Error Messages

Common validation errors and their meanings:

| Error | Cause | Fix |
|-------|-------|-----|
| `Expecting ')'` | Missing closing parenthesis | Add `)` to close expression |
| `Invalid token` | Unknown operator or syntax | Check SpEL syntax |
| `Cannot resolve property` | Unknown property name | Verify property path |

### Context Variables

The following context objects are available:

```spel
# Transaction object
transaction.id          # Transaction ID
transaction.amount      # Transaction amount
transaction.currency    # Currency code
transaction.type        # Transaction type
transaction.status      # Current status

# User object
user.id                 # User ID
user.role               # User role
user.permissions        # User permissions
user.department         # User department

# System object
system.environment      # Environment (DEV, PROD)
system.maintenance      # Maintenance mode
system.loadFactor       # System load
```

## Examples

### Example 1: High Value Transaction

```spel
transaction.amount > 10000
```
Validates that a transaction exceeds $10,000.

### Example 2: Supported Currency

```spel
transaction.currency in {'USD', 'EUR', 'GBP', 'JPY'}
```
Checks if the transaction currency is in the allowed list.

### Example 3: Business Hours Only

```spel
transaction.timestamp.hour >= 9 && transaction.timestamp.hour <= 17
```
Ensures the transaction occurred during business hours (9 AM - 5 PM).

### Example 4: Role-Based Access

```spel
user.role == 'ADMIN' || user.permissions.contains('APPROVE_HIGH_VALUE')
```
Allows admins or users with specific permission.

## Next Steps

- [Rules vs Rule Sets](rules-vs-rulesets.md)
- [Your First Rule Tutorial](../tutorials/first-rule.md)
