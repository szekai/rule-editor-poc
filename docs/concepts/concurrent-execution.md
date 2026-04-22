# Concurrent Execution

Concurrent execution allows multiple rules with the same priority to run in parallel, improving performance while maintaining business logic correctness.

## Understanding Concurrency

### What is Concurrent Execution?

When two or more rules share the **same priority**, they can execute concurrently (in parallel) rather than sequentially.

```
┌─────────────────────────────────────────────┐
│      Sequential Execution (Different        │
│                Priorities)                  │
├─────────────────────────────────────────────┤
│                                              │
│  Priority 1:  Rule A  ──▶  Rule B  ──▶  Rule C
│                  │           │           │
│                  ▼           ▼           ▼
│               Run 1      Run 2       Run 3
│                                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Concurrent Execution (Same             │
│                Priority)                    │
├─────────────────────────────────────────────┤
│                                              │
│  Priority 2:  ┌─────────────────────────┐   │
│               │  Rule D  //  Rule E     │   │
│               │  Rule F  //  Rule G     │   │
│               └─────────────────────────┘   │
│                        │                     │
│                        ▼                     │
│                   Run together              │
│                                              │
└─────────────────────────────────────────────┘
```

### When to Use Concurrency

**Use concurrent execution when:**

- Rules are independent (no dependencies between them)
- Rules check different aspects of the same transaction
- Performance matters and parallelization is safe

**Avoid concurrent execution when:**

- One rule's output is needed by another
- Rules must execute in a specific order
- There's a dependency chain

## Visual Indicators

### Concurrent Group Badge

The UI shows when rules are concurrent:

```
┌─────────────────────────────────────────────┐
│                                             │
│  Priority: 2 (2 concurrent)                 │
│  ─────────────────────────────────────────  │
│  [✓] Currency Check                         │
│  [✓] Status Check                           │
│                                             │
└─────────────────────────────────────────────┘
```

### Priority Level Display

The composition summary shows priority levels:

```
Composition Summary:
┌─────┬──────────────┬────────────────┐
│ Qty │ Priority    │ Type          │
├─────┼──────────────┼────────────────┤
│  1  │ 1 Level     │ Rules         │
│  2  │ 2 Levels    │ Rules         │
│  3  │ 3 Levels    │ Mixed         │
└─────┴──────────────┴────────────────┘
```

## Examples

### Example 1: Independent Checks

All these checks can run concurrently:

```
┌─────────────────────────────────────────────┐
│  Rule Set: Transaction Validation           │
├─────────────────────────────────────────────┤
│                                              │
│  Priority 1 (All concurrent):               │
│  ├── Amount > 0                             │
│  ├── Currency is valid                      │
│  ├── Status is pending                      │
│  └── From/To accounts valid                  │
│                                              │
│  These are independent - order doesn't      │
│  matter, so they can run in parallel         │
│                                              │
└─────────────────────────────────────────────┘
```

### Example 2: Sequential Dependencies

These must run sequentially:

```
┌─────────────────────────────────────────────┐
│  Rule Set: Sequential Validation            │
├─────────────────────────────────────────────┤
│                                              │
│  Priority 1: Account exists                 │
│  Priority 2: Account has balance            │ ← Depends on #1
│  Priority 3: Amount <= balance              │ ← Depends on #2
│                                              │
│  Each rule depends on the previous one      │
│                                              │
└─────────────────────────────────────────────┘
```

### Example 3: Mixed

```
┌─────────────────────────────────────────────┐
│  Rule Set: Comprehensive Validation         │
├─────────────────────────────────────────────┤
│                                              │
│  Priority 1: Security Check                 │
│                                              │
│  Priority 2 (concurrent):                   │
│  ├── Amount Validation                      │
│  ├── Currency Check                         │
│  └── Status Check                           │
│                                              │
│  Priority 3: Audit Log                      │
│                                              │
└─────────────────────────────────────────────┘
```

## Performance Benefits

### Sequential (3 rules)

```
Time: ──────────────────────────────────────▶
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Rule A   │ │ Rule B   │ │ Rule C   │
       │ (100ms)  │ │ (100ms)  │ │ (100ms)  │
       └──────────┘ └──────────┘ └──────────┘

Total: 300ms
```

### Concurrent (3 rules at same priority)

```
Time: ──────────────────────────────────────▶
       ┌────────────────────────────────┐
       │ Rule A // Rule B // Rule C     │
       │ (all running in parallel)      │
       └────────────────────────────────┘

       └──────────────┘
           100ms

Total: 100ms (3x faster!)
```

## Configuring Concurrency

### Setting Same Priority

To make rules concurrent, give them the same priority number:

```
Rule A: Priority = 2
Rule B: Priority = 2  ← Same = concurrent
Rule C: Priority = 2  ← Same = concurrent
Rule D: Priority = 3  ← Different = sequential
```

### Viewing Concurrent Groups

The UI highlights concurrent groups:

1. Look for "(N concurrent)" badge
2. Items with same priority are grouped
3. Color coding shows related items

## Best Practices

### Do

- Use concurrency for independent validation rules
- Group related checks at the same priority
- Consider performance for high-volume rules

### Don't

- Don't make dependent rules concurrent
- Don't over-concurrent (10+ rules at once may not help)
- Don't sacrifice correctness for performance

### Example Patterns

| Pattern | Priority | Concurrency | Reason |
|---------|----------|-------------|--------|
| Security checks | 1 | No | Must run first, sequentially |
| Independent validations | 2 | Yes | Safe to parallelize |
| Business rules | 3 | Depends | Check dependencies |
| Audit logging | 10 | No | After everything else |

---

## Summary

- **Same priority = Concurrent execution**
- **Different priority = Sequential execution**
- **Visual indicator shows concurrent groups**
- **Use for independent, parallel-safe rules**

---

## Next Steps

- [Rule Set Composer Feature Guide](../features/rule-set-composer.md)
- [Managing Priorities Tutorial](../tutorials/managing-priorities.md)
