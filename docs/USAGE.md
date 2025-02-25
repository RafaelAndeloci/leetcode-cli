# Usage Guide

## Table of Contents

1. [Installation](#installation)
2. [CLI Commands](#cli-commands)
3. [Working with Problems](#working-with-problems)
4. [Customization](#customization)
5. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js (v14+)
- pnpm, npm, or yarn

### Basic Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/leetcode-solutions.git
cd leetcode-solutions

# Install dependencies
pnpm install
```

### Global Installation

```bash
# Install globally for command-line access from anywhere
pnpm install -g .
```

## CLI Commands

### Interactive CLI

The easiest way to use this repository is through the interactive CLI:

```bash
pnpm cli
```

This launches an interactive menu where you can:

- Create new problems
- Run solutions
- List problems by category
- Search problems
- Configure your environment

### Using the CLI

The CLI provides an intuitive interface with the following main functions:

#### Create a New Problem

Guided process to create a new problem with:

- Problem ID input
- Category selection from available categories
- Programming language selection

#### Run a Solution

Select and run existing solutions with:

- Problem selection
- Language selection
- Real-time execution feedback

#### List Problems

Browse problems by category with an interactive list.

#### Search Problems

Search for problems using keywords.

## Working with Problems

### Problem Structure

Each problem is structured as follows:

```
problems/
└── 0123-problem-name/
    ├── README.md              # Problem description
    └── typescript/            # Language-specific folder
        └── solution.ts        # Solution implementation
```

Additionally, there's a reference in the categories folder:

```
categories/
└── dynamic-programming/
    └── 0123-problem-name.md  # Link to the problem
```

### Solution Templates

Standard templates are available for different languages:

- TypeScript: `templates/solution-template.ts`
- Python: `templates/solution-template.py`
- JavaScript: `templates/solution-template.js`

## Customization

### Adding New Commands

To add new commands to the CLI:

1. Create a React component in `cli/commands/`
2. Add the component in the `cli/index.tsx` file
3. Update the main menu in `cli/components/MainMenu.tsx`

### Adding New Languages

To support a new programming language:

1. Add a new template in `templates/`
2. Update the language list in `cli/commands/CreateProblem.tsx`
3. Update the run logic in `cli/utils/problem-creator.ts`

## Troubleshooting

### Module Resolution Errors

If you encounter module resolution errors:

- Check `tsconfig.json`: It should use `"moduleResolution": "bundler"` for imports without extensions
- Verify `package.json`: The `cli` script should use `tsx` for better TSX file compatibility

### TypeScript Compilation Errors

If you encounter compilation errors:

```bash
# Clear ts-node cache
rm -rf node_modules/.cache/ts-node

# Reinstall dependencies
pnpm install
```

### Script Execution Errors

The CLI implements functions directly in TypeScript to avoid Bash script execution issues:

- To modify problem creation logic, edit `cli/utils/problem-creator.ts`
- To change solution execution behavior, modify `cli/commands/RunSolution.tsx`

### Common Errors and Solutions

| Error                           | Solution                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `Unknown file extension ".tsx"` | Use `tsx` instead of `ts-node` in package.json CLI script                     |
| `Cannot find module 'ink'`      | Run `pnpm install` to ensure dependencies are installed                       |
| `Command failed with code 1`    | Check console logs for details and ensure correct permissions on script files |
| `importMeta` errors             | Update to use proper ES module configuration in tsconfig.json                 |
