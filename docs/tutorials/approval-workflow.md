# Tutorial: Approval Workflow

Learn how to use the Maker/Checker approval workflow.

## Overview

The Maker/Checker workflow ensures rules are reviewed before becoming active.

```
Maker creates → Pending Queue → Checker approves → Active
```

## Prerequisites

- Completed previous tutorials
- Understand rule creation

## Roles

| Role | Description |
|------|-------------|
| Maker | Creates/modifies rules |
| Checker | Reviews and approves changes |

## Step-by-Step

### Step 1: Create a Rule (as Maker)

1. Go to Rule Editor
2. Create a new rule (or modify existing)
3. Save the rule

**Note**: In this POC, the rule becomes active immediately since there's no actual approval queue integration. The Maker/Checker table shows mock data.

### Step 2: View the Maker/Checker Table

Navigate to the Maker/Checker tab.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Maker/Checker Table                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Action │ Type    │ Item        │ Requested │ Status    │   │
│  ├────────┼─────────┼─────────────┼───────────┼────────────┤   │
│  │ CREATE │ Rule    │ New Amount  │ Today     │ Pending    │   │
│  │ UPDATE │ RuleSet │ Payment Val │ Yesterday │ Approved   │   │
│  │ DELETE │ Rule    │ Old Check   │ 2 days    │ Rejected   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Review Pending Changes (as Checker)

Click on a pending item to see details:

```
┌─────────────────────────────────────────────┐
│  Change Details                              │
├─────────────────────────────────────────────┤
│                                              │
│  Action: CREATE                              │
│  Type:   Rule                                │
│  Name:   New Amount Validation              │
│                                              │
│  Condition:                                  │
│  transaction.amount > 5000                   │
│                                              │
│  Rule Type: validation                       │
│  Error Code: ERR_AMOUNT_5000                │
│                                              │
│  Requested: Today 10:30 AM                   │
│  Requested By: (mock user)                  │
│                                              │
└─────────────────────────────────────────────┘
```

### Step 4: Approve or Reject

#### Approve

1. Review the change
2. Verify correctness
3. Click **Approve**

```
┌─────────────────────────────────────────────┐
│  ✓ Change Approved                          │
│                                              │
│  The rule is now active.                    │
│                                              │
│  [Close]                                    │
└─────────────────────────────────────────────┘
```

#### Reject

1. Click **Reject**
2. Provide reason:
   ```
   The threshold should be 10000, not 5000.
   Please update and resubmit.
   ```
3. Click **Reject**

The maker will see the rejection and can modify and resubmit.

## Understanding the Table

### Columns

| Column | Description |
|--------|-------------|
| Action | CREATE, UPDATE, or DELETE |
| Type | Rule or Rule Set |
| Item | Name of the item |
| Requested | When change was submitted |
| Status | Current state |

### Status Values

- **Pending**: Awaiting review
- **Approved**: Accepted and active
- **Rejected**: Denied with feedback

## Audit Trail

Each change maintains an audit trail:

```
CREATE: New Amount Validation
  Created: 2026-03-28 10:30 AM
  Approved: 2026-03-28 02:15 PM
  By: jane.smith
```

## Best Practices

### For Makers

1. **Clear descriptions**: Help reviewers understand the change
2. **Test first**: Verify rules work before submitting
3. **Meaningful names**: Use descriptive rule names
4. **Error codes**: Provide clear error messages

### For Checkers

1. **Review thoroughly**: Check logic, not just syntax
2. **Check impacts**: Consider downstream effects
3. **Provide feedback**: Help makers improve rejected items
4. **Review promptly**: Don't let queue build up

### For Both

1. **Communication**: Use rejection reasons to improve
2. **Documentation**: Keep audit trail clear
3. **Consistency**: Follow naming conventions

## Production Considerations

In a production environment, you'd add:

- User authentication
- Role-based access
- Email notifications
- Delegation during absences
- SLA tracking
- Bulk approvals

---

## Summary

- **Maker** submits changes to queue
- **Checker** reviews pending items
- **Approved** changes become active
- **Rejected** changes return to maker

---

## Next Steps

- [Configuration](../configuration/environment-variables.md)
- [Troubleshooting](../troubleshooting/common-errors.md)
