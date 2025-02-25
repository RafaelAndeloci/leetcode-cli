# LeetCode Solutions Repository

A personal repository for LeetCode exercises and solutions, organized by categories with an interactive CLI interface.

## Key Features

- ✅ Organized by categories and numbered problems
- ✅ Interactive CLI using React and Ink
- ✅ Support for TypeScript, JavaScript, and Python
- ✅ Automated scripts for creating and running solutions
- ✅ Visual interactive menus for easier navigation

## Repository Structure

```
leetcode/
├── categories/             # Problems organized by categories
├── problems/               # Problems organized by problem number
├── scripts/                # Utility scripts (legacy)
├── templates/              # Templates for new problems
├── cli/                    # Interactive command-line interface
│   ├── components/         # React components for the CLI
│   ├── commands/           # CLI commands
│   └── utils/              # CLI utilities
└── docs/                   # Documentation
```

## Quick Start

### Setup

```bash
# Install dependencies
pnpm install

# Configure the environment
pnpm setup
```

### Interactive CLI Interface

```bash
# Run the CLI
pnpm cli
```

### Global CLI Installation

```bash
# Install globally
pnpm install -g .

# Run from anywhere
leetcode-cli
```

## Documentation

For detailed instructions on using this repository, please check the [Usage Guide](./docs/USAGE.md).

## Available Categories

- arrays
- strings
- linked-list
- trees
- graphs
- dynamic-programming
- greedy
- backtracking
- math
- binary-search
- hash-table
- stack
- queue
- heap
- bit-manipulation
- design
- database
- shell
