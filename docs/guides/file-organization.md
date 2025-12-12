# File Organization Guide

This document describes the file organization structure for the SOLVET Global repository and provides a migration guide for understanding the new layout.

## Overview

The repository has been reorganized to follow industry best practices for:
- Security
- Maintainability
- Discoverability
- Scalability

## Directory Structure

```
solvet-global/
├── .github/                      # GitHub configuration
│   ├── workflows/                # GitHub Actions workflows
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   ├── CODEOWNERS               # Code ownership rules
│   └── dependabot.yml           # Dependency updates
├── docs/                         # All documentation
│   ├── architecture/            # Architecture docs
│   ├── guides/                  # How-to guides
│   ├── planning/                # Planning documents
│   └── api/                     # API documentation
├── scripts/                      # All executable scripts
│   ├── setup/                   # Setup/installation scripts
│   ├── maintenance/             # Maintenance utilities
│   ├── sync/                    # Sync operations
│   ├── utils/                   # General utilities
│   └── dev/                     # Development tools
├── config/                       # Configuration files
│   ├── libraries.config.json   # Library configuration
│   └── workspace/               # Workspace configs
├── assets/                       # Static assets
│   ├── renders/                 # Rendered images
│   └── previews/                # Preview files
├── tests/                        # Test files and utilities
├── tools/                        # Development tools
│   ├── threejs-dev/             # Three.js dev environment
│   └── solvet-cli/              # CLI (deprecated)
└── archive/                      # Deprecated/outdated files
    ├── deprecated/               # Deprecated code
    ├── old-docs/                 # Outdated documentation
    └── test-files/               # Old test files
```

## Migration Guide

### Documentation

**Old Location** → **New Location**

- `plan docs/` → `docs/planning/`
- `QUICK_START.md` → `docs/guides/quick-start.md`
- `GIT_WORKFLOW.md` → `docs/guides/git-workflow.md`
- `GITHUB_SETUP.md` → `docs/guides/github-setup.md`
- `IMPLEMENTATION_GUIDE.md` → `docs/guides/implementation.md`
- `POLAR_CHECKOUT_OPTIONS.md` → `docs/guides/polar-checkout.md`
- `MULTI_CART_IMPLEMENTATION.md` → `docs/guides/multi-cart.md`
- `PRODUCT_CARD_3D_VIEWER_FIX.md` → `docs/guides/product-card-3d.md`
- `VISITOR_FONT_SETUP.md` → `docs/guides/visitor-font.md`
- `BROWSER_MCP_SETUP.md` → `docs/guides/browser-mcp.md`
- `3D_EMBED_CONFIG_GUIDE.md` → `docs/guides/3d-embed.md`
- `figma-design-system-rules.md` → `docs/guides/figma-design-system.md`
- `solvet-stack-diagram.md` → `docs/architecture/stack-diagram.md`
- `UTILITY_VIEWER_SPEC.md` → `docs/api/utility-viewer.md`

### Scripts

**Old Location** → **New Location**

- `scripts/setup-github-token.sh` → `scripts/setup/setup-github-token.sh`
- `scripts/setup-polar-mcp.sh` → `scripts/setup/setup-polar-mcp.sh`
- `update-all.sh` → `scripts/maintenance/update-all.sh`
- `status-all.sh` → `scripts/maintenance/status-all.sh`
- `scripts/update-token-from-gh.sh` → `scripts/maintenance/update-token-from-gh.sh`
- `scripts/update-product-prices.js` → `scripts/sync/update-product-prices.js`
- `scripts/generate-polar-mapping.js` → `scripts/sync/generate-polar-mapping.js`
- `scripts/create-checkout-links.js` → `scripts/sync/create-checkout-links.js`
- `scripts/batch-update-prices.js` → `scripts/sync/batch-update-prices.js`
- `scripts/launch-arc-debug.sh` → `scripts/dev/launch-arc-debug.sh`
- All other utility scripts → `scripts/utils/`

### Configuration

- `libraries.config.json` → `config/libraries.config.json`

### Assets

- `renders/` → `assets/renders/`

### Test Files

- `check-glb-error.py` → `tests/check-glb-error.py`
- `test-embed-generation.py` → `tests/test-embed-generation.py`
- `preview-polar-checkout.html` → `tests/preview-polar-checkout.html`

### Tools

- `threejs-dev/` → `tools/threejs-dev/`
- `solvet-cli/` → `tools/solvet-cli/`

## Finding Files

### Documentation

- **Architecture docs**: `docs/architecture/`
- **How-to guides**: `docs/guides/`
- **Planning docs**: `docs/planning/`
- **API docs**: `docs/api/`
- **Documentation index**: `docs/README.md`

### Scripts

- **Setup scripts**: `scripts/setup/`
- **Maintenance**: `scripts/maintenance/`
- **Sync operations**: `scripts/sync/`
- **Utilities**: `scripts/utils/`
- **Development**: `scripts/dev/`
- **Script documentation**: `scripts/README.md`

### Configuration

- **Config files**: `config/`
- **Config documentation**: `config/README.md`

## File Naming Conventions

### Documentation

- Use kebab-case: `file-name.md`
- Be descriptive: `git-workflow.md` not `workflow.md`
- Include type when helpful: `quick-start.md`, `api-reference.md`

### Scripts

- Use kebab-case: `script-name.sh` or `script-name.js`
- Include purpose: `update-product-prices.js`
- Use extensions: `.sh` for bash, `.js` for Node.js, `.py` for Python

### Configuration

- Use kebab-case: `config-name.json`
- Be descriptive: `libraries.config.json`

## Benefits of New Structure

1. **Security**: Sensitive files properly organized and excluded
2. **Discoverability**: Clear organization makes files easy to find
3. **Maintainability**: Related files grouped together
4. **Scalability**: Structure supports growth
5. **Standards**: Follows industry best practices

## Updating References

After the reorganization, you may need to update:

1. **Script paths** in other scripts
2. **Documentation links** in markdown files
3. **Import statements** in code
4. **Configuration references**

See [update-references](#) for a complete list of updated paths.

## Questions?

- Check directory README files for specific information
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines
- Open an issue for questions about file organization

