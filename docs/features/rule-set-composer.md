# Rule Set Composer

The Rule Set Composer is a drag-and-drop interface for building complex rule sets by combining individual rules and existing rule sets.

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Rule Set Composer                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐   │
│  │     Rule Library        │  │      Composition Panel          │   │
│  │                         │  │                                   │   │
│  │  Available Rules        │  │  ┌───────────────────────────┐   │   │
│  │  ┌───────────────────┐  │  │  │ Priority: 1               │   │   │
│  │  │ Amount Validation│  │  │  │ ● Amount Validation       │   │   │
│  │  │ Currency Check   │  │  │  └───────────────────────────┘   │   │
│  │  │ Business Hours   │  │  │  ┌───────────────────────────┐   │   │
│  │  └───────────────────┘  │  │  │ Priority: 2               │   │   │
│  │                         │  │  │ ● Currency Check          │   │   │
│  │  Existing Rule Sets     │  │  │ ● Status Check (concurrent)│  │   │
│  │  ┌───────────────────┐  │  │  └───────────────────────────┘   │   │
│  │  │ Basic Validation  │  │  │                                   │   │
│  │  │ Enhanced Rules    │  │  │  [Save Rule Set] [Clear]         │   │
│  │  └───────────────────┘  │  │                                   │   │
│  └─────────────────────────┘  └─────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Interface Elements

### Rule Library Panel (Left)

Shows available rules and rule sets to drag from:

- **Available Rules**: Individual rules you can add
- **Existing Rule Sets**: Previously created rule sets

### Composition Panel (Right)

Shows rules and rule sets in the current composition:

- Priority numbers
- Drag handles for reordering
- Delete buttons
- Edit controls

## Drag and Drop

### Adding Items

1. Click and hold an item in the Library
2. Drag to the Composition Panel
3. Release to drop

```
┌─────────────────────────────────────────────┐
│  Library          →    Composition          │
│                                             │
│  ┌───────────┐      ┌───────────┐          │
│  │   Rule    │ ───▶ │   Rule    │          │
│  │ (drag me) │      │ (dropped) │          │
│  └───────────┘      └───────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### Visual Feedback

- **Dragging**: Item becomes semi-transparent
- **Over Drop Zone**: Drop zone highlights
- **Valid Drop**: Shows insertion point

## Priority Management

### Setting Priority

Each item has a priority number:

```
┌─────────────────────────────────────────────┐
│  Priority: 1          [▲] [▼] [2]          │
│  Amount Validation                           │
└─────────────────────────────────────────────┘
```

### Changing Priority

1. **Type directly**: Click the number and type new value
2. **Arrow buttons**: Use ▲ (higher priority) and ▼ (lower priority)

### Automatic Sorting

Items automatically sort by priority after changes.

### Concurrent Groups

Same priority = concurrent execution:

```
Priority: 2 (2 concurrent)
  ✓ Currency Check
  ✓ Status Check
```

## Reference Tracking

### What are References?

When you add a Rule Set to another Rule Set, it's added as a **reference**:

```
┌─────────────────────────────────────────────┐
│                                             │
│  [🔗] Enhanced Validation Set   (Reference)│
│                                             │
└─────────────────────────────────────────────┘
```

### Reference Badge

Rule Set references show:

- Link icon: `LinkIcon`
- "Reference" badge
- Secondary color coding

### Why References?

- Rules are not duplicated
- Changes to source rule set reflect everywhere
- Enables modular, reusable rule sets

## Duplicate Prevention

### Visual Indicators

Items that would create duplicates are **disabled**:

```
┌─────────────────────────────────────────────┐
│  ┌──────────────────────────────┐          │
│  │ ✗ Amount Validation          │  ← Grayed │
│  │   "Already in rule set"       │  ← Tooltip│
│  └──────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

### How It Works

- Tracks which rules are already in composition
- Prevents exact duplicates
- Allows non-duplicate rules from rule sets

## Cyclic Dependency Detection

### What are Cycles?

A cycle occurs when Rule Set A includes Rule Set B, which includes Rule Set A:

```
┌─────────────────────────────────────────────┐
│                                              │
│  Set A → Set B → Set A  (cycle!)           │
│                                              │
│  A includes B, but B includes A              │
│                                              │
└─────────────────────────────────────────────┘
```

### Prevention

The application prevents cycles:

1. Can't add a rule set to itself
2. Can't add if it would create a cycle
3. Disabled items show "Would create cycle"

### Handling Duplicates from Rule Sets

When dropping a Rule Set with some duplicates:

```
┌─────────────────────────────────────────────┐
│  Duplicate Rules Detected                   │
│                                              │
│  "Basic Validation Set" contains rules       │
│  that are already in your composition.      │
│                                              │
│  Duplicated:                                │
│  • Amount Validation                        │
│                                              │
│  New rules:                                 │
│  • Currency Check                           │
│                                              │
│  [Copy New Rules]  [Cancel]                │
│                                              │
└─────────────────────────────────────────────┘
```

## Editing Existing Rule Sets

### Edit Button

Each rule set in the library has an Edit button:

```
┌─────────────────────────────────────────────┐
│                              [✏️] [🗑️]     │
│  ┌─────────────────────────────────────────┐ │
│  │ Basic Validation Set                    │ │
│  │ 2 rules • Priority-based                │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Edit Mode

When editing:

- "EDIT MODE" badge appears
- Existing items load into composition
- Save becomes "Update Rule Set"

## Saving a Rule Set

### Save Dialog

```
┌─────────────────────────────────────────────┐
│  Save Rule Set                              │
│                                              │
│  Name: *                                     │
│  ┌─────────────────────────────────────┐    │
│  │ Basic Validation Set                │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Description:                                │
│  ┌─────────────────────────────────────┐    │
│  │ Standard validation rules           │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  Will contain:                               │
│  • Amount Validation (Rule)                  │
│  • Currency Check (Rule)                     │
│                                              │
│  [Cancel]  [Save]                            │
│                                              │
└─────────────────────────────────────────────┘
```

## Composition Summary

The top of the composer shows a summary:

```
┌─────────────────────────────────────────────┐
│  Composition Summary                         │
│                                              │
│  [2 Rules] [1 Rule Set] [2 Priority Levels] │
│  [1 Concurrent Group]                        │
│                                              │
└─────────────────────────────────────────────┘
```

## Best Practices

### Rule Set Design

1. **Single Responsibility**: Each rule set should have a clear purpose
2. **Reusability**: Design rule sets to be composed
3. **Appropriate Nesting**: Don't over-nest (2-3 levels is usually enough)

### Priority

1. **Critical First**: Security, fraud checks at priority 1
2. **Dependencies**: Lower priority = depends on higher
3. **Concurrent When Safe**: Independent rules can share priority

### References vs Copies

| Use Reference | Use Copy |
|---------------|----------|
| Want live updates | Don't want changes to affect this set |
| Reusable building blocks | One-off combinations |
| Shared business rules | Custom variations |

---

## Next Steps

- [Building a Rule Set Tutorial](../tutorials/building-ruleset.md)
- [Managing Priorities Tutorial](../tutorials/managing-priorities.md)
- [Concurrent Execution](../concepts/concurrent-execution.md)
