# Maker/Checker Workflow

The Maker/Checker workflow provides an approval system for managing rule changes with proper oversight and audit trails.

## Overview

The Maker/Checker pattern separates rule creation (Maker) from rule approval (Checker):

```
┌─────────────────────────────────────────────────────────────┐
│              Maker/Checker Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐         ┌─────────┐         ┌─────────────┐   │
│   │ Maker   │         │ Queue   │         │  Checker   │   │
│   │ Creates │ ──────▶ │ Pending │ ──────▶ │  Approves  │   │
│   │ Changes │         │ Approval│         │  or Rejects│   │
│   └─────────┘         └─────────┘         └─────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts

### Maker

The **Maker** is anyone who creates or modifies rules:

- Creates new rules
- Updates existing rules
- Requests rule deletions

### Checker

The **Checker** is the approver who reviews changes:

- Reviews pending changes
- Approves valid changes
- Rejects invalid changes
- Provides feedback on rejections

### Approval Queue

A centralized list of all pending changes waiting for review.

## Interface Elements

### Maker/Checker Table

```
┌─────────────────────────────────────────────────────────────────┐
│                    Maker/Checker Table                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Action │ Type    │ Item      │ Requested   │ Status     │   │
│  ├────────┼─────────┼───────────┼─────────────┼────────────┤   │
│  │ CREATE │ Rule    │ AmountVal │ 2026-03-28  │ [✓][✗]     │   │
│  │ UPDATE │ RuleSet │ BasicVal  │ 2026-03-27  │ [✓][✗]     │   │
│  │ DELETE │ Rule    │ OldRule   │ 2026-03-26  │ Approved   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Action Types

| Action | Description |
|--------|-------------|
| CREATE | New rule or rule set proposed |
| UPDATE | Existing rule/rule set modified |
| DELETE | Proposed removal |

### Status Values

| Status | Meaning |
|--------|---------|
| Pending | Awaiting review |
| Approved | Accepted by checker |
| Rejected | Denied by checker |

## Workflow Steps

### 1. Maker Creates Change

1. Navigate to Rule Editor or Rule Set Composer
2. Create or modify a rule/rule set
3. Submit the change (automatic to queue)

### 2. Change Enters Queue

The change appears in the Maker/Checker table with status **Pending**.

### 3. Checker Reviews

The checker reviews:
- Rule validity
- Business logic correctness
- Impact assessment

### 4. Decision

**Approve**: Change takes effect
**Reject**: Change returns to maker with feedback

## Viewing Pending Changes

### Details View

Click on a pending item to see full details:

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
│  Requested: 2026-03-28 10:30 AM             │
│  Requested By: john.doe                     │
│                                              │
│  [Approve]  [Reject]  [Request Info]         │
│                                              │
└─────────────────────────────────────────────┘
```

## Approving Changes

### Approval Process

1. Review the change details
2. Verify the rule logic is correct
3. Click **Approve**
4. Change takes effect immediately

### Approval Confirmation

```
┌─────────────────────────────────────────────┐
│  ✓ Change Approved                          │
│                                              │
│  "New Amount Validation" has been approved. │
│  The rule is now active.                    │
│                                              │
│  [Close]                                    │
│                                              │
└─────────────────────────────────────────────┘
```

## Rejecting Changes

### Rejection Process

1. Review the change details
2. Identify issues
3. Click **Reject**
4. Provide rejection reason

### Rejection Dialog

```
┌─────────────────────────────────────────────┐
│  Reject Change                              │
├─────────────────────────────────────────────┤
│                                              │
│  Reason for rejection:                       │
│  ┌─────────────────────────────────────┐    │
│  │ The threshold of 5000 is too low.   │    │
│  │ Please increase to 10000 and        │    │
│  │ resubmit.                           │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  [Cancel]  [Reject]                         │
│                                              │
└─────────────────────────────────────────────┘
```

## Audit Trail

### What is Tracked

Every change maintains an audit trail:

- **Who**: User who made the request
- **When**: Timestamp of request
- **What**: Details of the change
- **Decision**: Approver/rejecter and timestamp
- **Why**: Reason for rejection (if applicable)

### Audit History

```
┌─────────────────────────────────────────────┐
│  Audit History                              │
├─────────────────────────────────────────────┤
│                                              │
│  Created:  2026-03-28 10:30 AM by john.doe  │
│  Approved: 2026-03-28 02:15 PM by jane.smith│
│                                              │
└─────────────────────────────────────────────┘
```

## Benefits

### Why Use Maker/Checker?

1. **Quality Control**: Second set of eyes catches errors
2. **Accountability**: Clear audit trail
3. **Segregation of Duties**: Different people create vs. approve
4. **Compliance**: Many regulations require approval workflows

### When to Use

| Scenario | Benefit |
|----------|---------|
| Financial rules | Prevent erroneous payments |
| Security rules | Ensure proper access control |
| Regulatory compliance | Maintain audit trail |
| Team workflows | Distribute responsibility |

## Best Practices

### For Makers

- Provide clear, descriptive rule names
- Include meaningful descriptions
- Test rules before submitting
- Add clear error codes

### For Checkers

- Review all details thoroughly
- Check rule logic for correctness
- Consider downstream impacts
- Provide constructive feedback on rejections

### General

- Review pending items regularly
- Don't approve your own changes
- Document rejection reasons
- Keep audit records

---

## Configuration

The Maker/Checker table uses mock data in this POC version. In a production environment:

- Connect to real user authentication
- Integrate with notification system
- Add email/Slack notifications
- Support delegation when away

---

## Next Steps

- [Approval Workflow Tutorial](../tutorials/approval-workflow.md)
