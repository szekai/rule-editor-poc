# SpEL Rule Editor & Rule Set Builder POC

A comprehensive React-based application for creating, editing, and managing Spring Expression Language (SpEL) rules with visual rule set composition capabilities.

## 📚 Documentation

For comprehensive documentation, see the [User Guide](docs/README.md).

### Quick Links

- [Getting Started](docs/getting-started/installation.md)
- [Your First Rule](docs/tutorials/first-rule.md)
- [Building a Rule Set](docs/tutorials/building-ruleset.md)
- [Configuration](docs/configuration/environment-variables.md)
- [Troubleshooting](docs/troubleshooting/common-errors.md)

---

## 🚀 Features

### SpEL Rule Editor

- **Monaco Editor Integration**: Rich code editing experience for SpEL expressions
- **Real-time Validation**: Syntax and semantic validation using `spel2js`
- **CRUD Operations**: Create, read, update, and delete rules with in-memory storage
- **Rule Types**: Support for validation and execution rule types
- **Error Handling**: Comprehensive error feedback and suggestions

### Rule Set Composer

- **Drag & Drop Interface**: Visual composition using React DnD
- **Rule Library**: Browse and reuse existing rules and rule sets
- **Nested Composition**: Combine individual rules and existing rule sets
- **Priority Management**:
  - Assign execution priority to each rule/rule set member
  - Visual priority controls with up/down arrows
  - Automatic sorting by priority order with stable sort
  - Editable priority values for fine-grained control
  - **Concurrent Execution**: Allow same priority for parallel processing
  - Visual indicators for concurrent groups
- **Reference Tracking**:
  - Clear visual indicators for rule set references
  - Automatic marking of nested rule sets with reference flags
  - Reference badges and icons for easy identification
- **Real-time Preview**: See composition changes instantly
- **Advanced Validation**:
  - Prevent duplicate rules and rule sets
  - Block cyclic dependencies and self-inclusion
  - Visual feedback for disabled items
  - Smart error messaging with specific reasons
- **Edit Mode**: Modify existing rule sets with full validation
- **Details View**: Inspect rule and rule set contents inline

### Maker/Checker Workflow

- **Approval Queue**: Track pending rule changes
- **Action Types**: Support for CREATE, UPDATE, DELETE operations
- **Status Management**: Approve or reject pending changes
- **Audit Trail**: Track who requested what and when

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 18
- **UI Library**: Material-UI (MUI) v5
- **Code Editor**: Monaco Editor
- **Drag & Drop**: React DnD with HTML5 Backend
- **State Management**: TanStack React Query
- **SpEL Parsing**: spel2js library
- **Styling**: MUI Theme + CSS-in-JS

## 📦 Installation

```bash
# Dependencies are already installed
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.js                    # Home page with navigation
│   └── rule-editor/
│       └── page.js                # Rule editor page
├── components/
│   ├── App.js                     # Main application component
│   ├── SpelRuleEditor.js          # Rule creation/editing interface
│   ├── RuleSetEditor.js           # Visual rule set composer
│   └── MakerCheckerTable.js       # Approval workflow interface
└── utils/
    └── mockApi.js                 # Mock API and data utilities
```

## 🎯 Key Components

### SpelRuleEditor

- Form-based rule creation with validation
- Monaco Editor for SpEL condition editing
- Real-time syntax validation
- Rule management (CRUD operations)

### RuleSetEditor

- Drag-and-drop rule composition
- Library of available rules and rule sets
- Visual feedback for drop zones
- Composition validation and preview

### MakerCheckerTable

- Approval workflow management
- Status tracking (Pending, Approved, Rejected)
- Action buttons for approval/rejection

## 🔧 API Simulation

The application uses in-memory storage to simulate backend APIs:

### Mock Endpoints

- `GET /api/rules` - Fetch all rules
- `POST /api/rules` - Create new rule
- `PUT /api/rules/:id` - Update existing rule
- `DELETE /api/rules/:id` - Delete rule
- `GET /api/rule-sets` - Fetch all rule sets
- `POST /api/rule-sets` - Create new rule set
- `POST /api/spel/validate` - Validate SpEL expression

### Sample Data

- Pre-loaded with example rules and rule sets
- **Complex Rule Set Hierarchies**: Nested rule sets to test cyclic dependency detection
- **Priority-based Structure**: Each rule set member has priority and reference information
- Sample data structure for SpEL context
- Mock approval workflow data

## 🎨 SpEL Examples

The application supports complex SpEL expressions:

```javascript
// Simple comparisons
transaction.amount > 10000

// Collection operations
transaction.currency in {'USD', 'EUR', 'GBP'}

// Complex conditions
transaction.amount > 10000 && user.role == 'ADMIN'

// Date/time operations
transaction.timestamp.hour >= 9 && transaction.timestamp.hour <= 17

// Nested object access
transaction.from.country != transaction.to.country
```

## 📊 Data Structure

### Enhanced Rule Set Format

Rule sets now support priority-based execution and reference tracking:

```json
{
  "id": 1,
  "name": "Priority Validation Set",
  "description": "Rules executed in priority order",
  "rules": [
    {
      "id": 1,
      "priority": 1,
      "reference": false
    },
    {
      "id": 2,
      "priority": 2,
      "reference": true
    }
  ],
  "type": "rule_set",
  "createdAt": "2025-07-24T..."
}
```

**Key Features:**

- **Priority**: Determines execution order (1 = highest priority)
- **Concurrent Execution**: Rules/rule sets with the same priority execute in parallel
- **Reference**: `true` for rule set references, `false` for individual rules
- **Stable Sorting**: Items with same priority maintain consistent order
- **Flexible Structure**: Supports both old format (simple ID arrays) and new format
- **Backward Compatibility**: Legacy rule sets are automatically migrated

## 🔍 Validation Features

### Client-side Validation

- Syntax checking using `spel2js`
- Real-time feedback while typing
- Error highlighting and suggestions

### Rule Set Composition Validation

- **Duplicate Prevention**: Automatically prevents adding the same rule or rule set multiple times
- **Cyclic Dependency Detection**: Advanced recursive checking to prevent circular references
- **Self-Inclusion Prevention**: Rule sets cannot be added to themselves
- **Visual Feedback**: Disabled items appear grayed out with informative tooltips
- **Smart Error Messages**: Context-aware validation messages explaining why items cannot be added

### Mock Backend Validation

- Simulated comprehensive validation
- Semantic analysis
- Context-aware suggestions

## 🎛️ Configuration

### Theme Customization

- Material-UI theme configuration in `App.js`
- Consistent color scheme and typography
- Responsive design support

### Query Configuration

- React Query configuration for API calls
- Optimistic updates for better UX
- Error retry mechanisms

## 🚀 Getting Started

1. **Navigate to the application**: <http://localhost:3000>
2. **Click "Launch Rule Editor"** to access the main interface
3. **Explore the three main sections**:
   - **Rule Editor**: Create and edit individual SpEL rules
   - **Rule Set Composer**: Build rule sets using drag-and-drop
   - **Maker/Checker**: Review and approve rule changes

## 📝 Usage Examples

### Creating a Rule

1. Go to the "Rule Editor" tab
2. Click "New Rule"
3. Fill in rule details (name, description, error code)
4. Write your SpEL condition in the Monaco Editor
5. Wait for validation feedback
6. Click "Save Rule" when validation passes

### Building a Rule Set

1. Go to the "Rule Set Composer" tab
2. Drag rules from the library to the composition area
3. Add multiple rules to build complex rule sets
4. **Note**: Items that are already in the composition or would create cycles appear grayed out
5. **Adjust Priorities**: Use the number input or up/down arrows to set execution order
6. **Reference Indicators**: Rule sets are automatically marked with reference badges
7. Click "Save Rule Set" and provide a name
8. The new rule set appears in the library for reuse

### Managing Priorities

1. **Set Priority**: Click on the priority number input to manually set values
2. **Reorder Items**: Use the up/down arrow buttons for quick reordering
3. **Automatic Sorting**: Items are automatically sorted by priority in the composition area
4. **Concurrent Execution**: Set the same priority for rules that can execute in parallel
5. **Visual Feedback**: Priority 1 items appear first, with clear numbering and concurrent indicators

### Editing an Existing Rule Set

1. In the "Rule Set Composer" tab, find the rule set you want to edit
2. Click the "Edit" button (pencil icon) on the rule set
3. The rule set loads into the composition area for modification
4. Drag additional rules or remove existing ones
5. **Note**: The rule set being edited cannot be added to itself
6. Click "Update Rule Set" to save changes

### Approving Changes

1. Go to the "Maker/Checker" tab
2. Review pending approval requests
3. Click "Approve" or "Reject" for each item
4. Track the approval history

## 🔮 Future Enhancements

- **Real Backend Integration**: Replace mock APIs with actual Spring Boot endpoints
- **Advanced SpEL Features**: Support for more complex SpEL constructs
- **Rule Testing**: Execute rules against sample data
- **Import/Export**: YAML/JSON rule definitions
- **Version Control**: Rule versioning and change history
- **Advanced UI**: Custom Monaco themes for SpEL syntax highlighting

## 🐛 Known Limitations

- **Mock Data**: All data is stored in memory (resets on refresh)
- **SpEL Validation**: Limited to syntax checking (no runtime validation)
- **No Authentication**: No user management or permissions
- **SSR**: Monaco Editor requires client-side rendering

## 📚 Documentation References

- [SpEL Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions)
- [spel2js Library](https://github.com/SpelExpressionLanguage/spel2js)
- [Material-UI](https://mui.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [React DnD](https://react-dnd.github.io/react-dnd/)

---

Built with ❤️ for POC demonstration purposes
