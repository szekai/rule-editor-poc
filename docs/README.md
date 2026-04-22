# SpEL Rule Editor - Comprehensive User Guide

Welcome to the comprehensive user guide for the SpEL Rule Editor application. This guide covers all features, workflows, and configurations to help you get the most out of this powerful rule management tool.

## Table of Contents

### 1. Getting Started
- [Prerequisites](getting-started/prerequisites.md)
- [Installation](getting-started/installation.md)
- [Running the Application](getting-started/running.md)
- [Building for Production](getting-started/building.md)

### 2. Core Concepts
- [SpEL Basics](concepts/spel-basics.md)
- [Rules vs Rule Sets](concepts/rules-vs-rulesets.md)
- [Priority-Based Execution](concepts/priority-execution.md)
- [Concurrent Execution](concepts/concurrent-execution.md)

### 3. Feature Guides
- [SpEL Rule Editor](features/rule-editor.md)
- [Rule Set Composer](features/rule-set-composer.md)
- [Maker/Checker Workflow](features/maker-checker.md)

### 4. Tutorials
- [Your First Rule](tutorials/first-rule.md)
- [Building a Rule Set](tutorials/building-ruleset.md)
- [Managing Priorities](tutorials/managing-priorities.md)
- [Editing Existing Rule Sets](tutorials/editing-rulesets.md)
- [Approval Workflow](tutorials/approval-workflow.md)

### 5. Configuration
- [Environment Variables](configuration/environment-variables.md)
- [API Configuration](configuration/api-config.md)
- [Mock vs Real Backend](configuration/mock-vs-real.md)

### 6. Troubleshooting
- [Common Errors](troubleshooting/common-errors.md)
- [Running Tests](troubleshooting/tests.md)
- [Debug Mode](troubleshooting/debug-mode.md)

---

## Quick Start

If you're eager to get started immediately, follow these quick steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser to:** `http://localhost:3000`

4. **Click "Launch Rule Editor"** to access the main interface

For detailed instructions, see the [Installation](getting-started/installation.md) and [Running the Application](getting-started/running.md) guides.

---

## Application Overview

The SpEL Rule Editor provides three main capabilities:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SpEL Rule Editor                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │    Rule     │    │  Rule Set    │    │   Maker/     │     │
│  │   Editor    │    │   Composer   │    │   Checker    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│                                                                  │
│  Create & edit     Build rule sets     Approve rule            │
│  SpEL rules        with drag-drop      changes                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Need Help?

- **Troubleshooting**: Check the [Troubleshooting](troubleshooting/common-errors.md) section
- **Configuration**: See [Configuration](configuration/environment-variables.md)
- **Step-by-step**: Follow our [Tutorials](tutorials/first-rule.md)

---

*Last updated: 2026-03-28*
