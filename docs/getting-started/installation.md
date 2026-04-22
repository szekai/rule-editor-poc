# Installation

Follow these steps to install and set up the SpEL Rule Editor on your local machine.

## Step 1: Clone or Download the Repository

If you have Git installed:

```bash
git clone <repository-url>
cd rule_editor
```

Or download and extract the source code from your preferred source.

## Step 2: Install Dependencies

The project uses npm for dependency management:

```bash
npm install
```

This will install all required packages defined in `package.json`:

- **next** - React framework
- **react** / **react-dom** - UI library
- **@mui/material** / **@mui/icons-material** - UI components
- **@monaco-editor/react** - Code editor
- **react-dnd** / **react-dnd-html5-backend** - Drag and drop
- **@tanstack/react-query** - Data fetching
- **spel2js** - SpEL expression parsing
- **vitest** - Testing framework

## Step 3: Verify Installation

Verify the installation was successful:

```bash
# Check that node_modules exists
ls node_modules | head -10

# Verify package.json is valid
cat package.json
```

## Project Structure

After installation, your project structure should look like:

```
rule_editor/
├── node_modules/        # Installed dependencies
├── src/                 # Source code
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── services/       # Business logic
│   └── utils/          # Utilities
├── docs/               # Documentation
├── package.json        # Dependencies
├── package-lock.json   # Lock file
├── next.config.mjs    # Next.js config
├── vitest.config.js   # Test config
└── ...
```

## Troubleshooting

### Common Installation Issues

**Error: "node: command not found"**
- Node.js is not installed or not in your PATH
- Restart your terminal after installing Node.js

**Error: "npm install failed"**
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and try again: `rm -rf node_modules && npm install`

**Error: "EACCES" permission errors**
- Use a Node version manager like nvm
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors

## Next Steps

- [Running the Application](running.md)
- [Building for Production](building.md)
