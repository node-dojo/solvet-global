# SOLVET CLI - Quick Start Guide

## Installation

```bash
cd solvet-cli
npm install
npm link  # Makes 'solve' command available globally
```

## Usage

Make sure you're in the **SOLVET System V1** directory when running commands:

```bash
cd "/Users/joebowers/Library/CloudStorage/Dropbox/Caveman Creative/THE WELL_Digital Assets/The Well Code/SOLVET System V1"
```

## Basic Commands

### View Banner & Help
```bash
solve help                    # Show banner and all commands
solve                         # Same as solve help
```

### Product Management
```bash
solve product list            # List all products
solve product info <name>     # Show product details
solve product create <name>   # Create new product
solve product validate <name> # Validate product files
```

### Repository Management
```bash
solve repo status             # Check status of all repos
solve repo update             # Update all repositories
```

### Validation
```bash
solve validate all           # Validate all products
```

### System Information
```bash
solve info                    # Show system info
solve info products           # Product statistics
solve info repos              # Repository information
```

## Examples

```bash
# List all products
solve product list

# Check repository status
solve repo status

# Validate all products
solve validate all

# Create a new product
solve product create "Dojo New Tool"

# Get product details
solve product info "Dojo Knob"
```

## Development

To run directly without linking:

```bash
cd solvet-cli
node src/index.js product list
```

Or from parent directory:

```bash
node solvet-cli/src/index.js product list
```

## Next Steps

- See [SOLVET_CLI_COMMANDS.md](../SOLVET_CLI_COMMANDS.md) for complete command reference
- Commands are being added incrementally
- Sync, price, and deploy commands coming soon!

