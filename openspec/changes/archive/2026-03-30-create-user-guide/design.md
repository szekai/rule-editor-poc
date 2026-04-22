## Context

The SpEL Rule Editor is a React-based application for managing business rules using Spring Expression Language. It consists of three main features:
1. **SpEL Rule Editor** - Monaco-based editor for creating/editing SpEL rules with real-time validation
2. **Rule Set Composer** - Drag-and-drop interface for composing rule sets with priority management
3. **Maker/Checker Workflow** - Approval queue for rule changes

The current documentation is limited to a basic README.md. A comprehensive user guide is needed to help new users understand all features and workflows.

## Goals / Non-Goals

**Goals:**
- Create a comprehensive user guide in the `docs/` directory
- Document all features with step-by-step tutorials
- Include visual aids (ASCII diagrams, flowcharts)
- Provide troubleshooting guidance for common issues
- Make the guide accessible to both technical and non-technical users

**Non-Goals:**
- Code implementation or refactoring
- Backend API development
- Adding new features to the application
- Video tutorials or interactive demos

## Decisions

### Documentation Structure
**Decision**: Create a modular documentation structure in `docs/` rather than a single monolithic file.

**Rationale**: 
- Easier to maintain and update individual sections
- Allows for easy linking between sections
- Better navigation with table of contents

**Alternatives Considered:**
- Single README.md - too long, hard to navigate
- GitBook/docsite - requires additional tooling

### Content Format
**Decision**: Use Markdown with ASCII diagrams for visual content.

**Rationale**:
- Markdown is already used in the project (README.md)
- ASCII diagrams work in terminal and GitHub
- No additional rendering dependencies needed

### Section Organization
**Decision**: Organize guide into these main sections:
1. Getting Started (installation, setup)
2. Core Concepts (SpEL basics, rules vs rule sets)
3. Feature Guides (editor, composer, workflow)
4. Tutorials (common workflows)
5. Configuration
6. Troubleshooting

**Rationale**: Follows standard documentation pattern, builds from simple to advanced

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Documentation becoming outdated as features evolve | Medium | Add note about checking for latest version; keep guide modular |
| ASCII diagrams may not render well in all contexts | Low | Keep diagrams simple; provide text descriptions |
| Guide may be too long for quick reference | Low | Include quick start section and table of contents |
