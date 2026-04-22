# Priority-Based Execution

Priority determines the order in which rules and rule sets are evaluated within a Rule Set.

## Understanding Priority

### Priority Values

- **Lower numbers** = Higher priority
- **Priority 1** executes before **Priority 2**
- Rules without explicit priority default to **Priority 1**

```
┌─────────────────────────────────────────────┐
│           Execution Order                    │
├─────────────────────────────────────────────┤
│                                              │
│  Priority 1  ──▶  Priority 2  ──▶  Priority 3
│                                              │
│  Earliest      Second          Latest        │
│  execution     execution        execution     │
│                                              │
└─────────────────────────────────────────────┘
```

### Setting Priority

In the Rule Set Composer:

```
┌─────────────────────────────────────────────┐
│  Priority Controls                           │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────┐ ┌─────────────┐                   │
│  │  1   │ │ ▲ ▼        │  ← Number input   │
│  └──────┘ └─────────────┘  ← Arrow buttons │
│                                              │
│  Use arrows or type directly                 │
│                                              │
└─────────────────────────────────────────────┘
```

### Priority Display

The composition panel shows priority clearly:

```
┌─────────────────────────────────────────────┐
│  Composition Panel                          │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─ Priority 1 ─────────────────────────┐  │
│  │  • Amount Validation                   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌─ Priority 2 ─────────────────────────┐  │
│  │  • Currency Check      (concurrent)  │  │
│  │  • Status Check        (concurrent)  │  │
│  └────────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘
```

## Priority Numbers

### Valid Range

- Minimum: **1**
- Maximum: **No hard limit** (use reasonable numbers like 1-100)
- Recommended: **1-10** for most use cases

### Examples

| Priority | Use Case |
|----------|----------|
| 1 | Critical validation (security, fraud) |
| 2 | Required validation |
| 3 | Business rules |
| 4+ | Optional/secondary rules |

## Priority Behavior

### Sequential Execution

Rules with different priorities execute sequentially:

```
Priority 1: Amount Check     ──▶  If passes
                                         │
Priority 2: Currency Check    ──▶  If passes
                                         │
Priority 3: Status Check      ───  Final result
```

### Sorting

Rules are automatically sorted by priority in the composition panel:

```javascript
// Internal representation
[
  { name: "Amount Check", priority: 1 },
  { name: "Currency Check", priority: 2 },
  { name: "Status Check", priority: 3 }
]
```

### Stable Sort

When priorities are equal (concurrent execution), items maintain their relative order:

```javascript
// Both priority 2 - order preserved from original
[
  { name: "Currency Check", priority: 2 },
  { name: "Status Check", priority: 2 }
]
```

## Visual Indicators

### Priority Badge

Each item shows its priority number:

```
┌─────────────────────────────────────────────┐
│                                             │
│  Priority: 1                                │
│  Amount Validation                          │
│                                             │
└─────────────────────────────────────────────┘
```

### Concurrent Group Indicator

When multiple items share the same priority:

```
┌─────────────────────────────────────────────┐
│  Priority: 2 (2 concurrent)                 │
│                                             │
│  [✓] Currency Check                          │
│  [✓] Status Check                            │
│                                             │
└─────────────────────────────────────────────┘
```

## Managing Priorities

### Using Arrow Buttons

- **Up Arrow**: Decrease priority number (higher priority)
- **Down Arrow**: Increase priority number (lower priority)

### Using Number Input

Click the priority number to type a new value directly.

### Automatic Sorting

After changing priorities, items automatically reorder in the display.

## Examples

### Example 1: Sequential Validation

```
Priority 1: Amount Validation     # Run first
Priority 2: Currency Check        # Run second  
Priority 3: Business Hours Check   # Run third
```

### Example 2: Mixed Execution

```
Priority 1: Fraud Check            # Critical - always first
Priority 2: Amount Validation     # Important
Priority 2: Currency Validation  # Concurrent with above
Priority 3: Audit Logging         # After validation
```

---

## Best Practices

1. **Start with 1-3 priorities** - Don't over-complicate
2. **Use sequential priorities for dependencies** - Rule B depends on Rule A = higher priority for A
3. **Group related checks** - Same priority = concurrent execution
4. **Document priority rationale** - Help future maintainers understand

---

## Next Steps

- [Concurrent Execution](concurrent-execution.md)
- [Managing Priorities Tutorial](../tutorials/managing-priorities.md)
