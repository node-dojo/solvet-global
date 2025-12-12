# SOLVET System V1 - Repository Structure

This document describes the standardized structure and organization of the SOLVET System, which coordinates multiple repositories for end-to-end digital asset publishing.

## Overview

The SOLVET System is a multi-repository workflow system that includes:
- **SOLVET Asset Management Add-on** (internal use, part of SOLVET workflow) - exports assets TO the library
- **NO3D Tools Asset Library** (customer-facing product offering) - imports/consumes assets FROM the library
- Asset database repository (GitHub serves as database)
- E-commerce website
- Validation and automation scripts

**Important:** These are two separate Blender add-ons serving different purposes:
- Internal add-on: For content creators to export assets (SOLVET workflow)
- Customer add-on: For subscribers to access and use assets (product offering)

## Repository Organization

```
SOLVET System V1/
├── schemas/                         # JSON schemas for validation
│   └── product-metadata.schema.json
├── scripts/                         # Utility scripts
│   ├── validate-products.py
│   └── optimize-media.py
├── templates/                       # Product templates
│   └── product-template/
├── solvet-asset-management-addon/   # SOLVET Asset Management Add-on (internal export tool)
├── no3d-tools-addon/                # NO3D Tools Asset Library (customer-facing add-on)
├── no3d-tools-site/                 # Website (Next.js)
├── no3d-tools-library/              # GitHub repo/database (separate repo)
│   └── Product Name/                # Individual product folders
│       ├── Product Name.blend       # Main Blender file
│       ├── Product Name.json        # Metadata file
│       ├── icon_Product Name.png    # Product thumbnail
│       ├── Product Name_desc.md     # Description (optional)
│       ├── Product Name.mp4         # Video preview (optional)
│       └── preview_Product Name.png # Additional previews (optional)
├── CONTRIBUTING.md                  # Contribution guidelines
├── REPOSITORY_STRUCTURE.md         # This file
├── requirements.txt                 # Python dependencies
└── master.plan.md                  # Project master plan
```

## Repository Architecture

### Component Structure

1. **SOLVET System V1** (This repository)
   - Contains system-wide schemas, scripts, and templates
   - Coordinates multiple repositories
   - Note: Add-ons are in separate repositories (see below)

2. **no3d-tools-library/** (Separate GitHub repository)
   - GitHub repository: `github.com/node-dojo/no3d-tools-library`
   - Serves as the digital asset database
   - Contains all product folders with assets
   - Accessed by website via GitHub API
   - Receives exports from SOLVET Asset Management Add-on (internal)
   - Provides assets to NO3D Tools Asset Library (customer-facing)

### Multi-Repository Flow

```
SOLVET Asset Management Add-on (internal, exports TO library)
    ↓ exports to
Asset Database (no3d-tools-library repo)
    ↓ accessed via GitHub API
Website (no3d-tools-site in this repo)
    ↓ provides assets to
NO3D Tools Asset Library (customer-facing, imports FROM library)
```

See [MULTI_REPO_ARCHITECTURE.md](./MULTI_REPO_ARCHITECTURE.md) for detailed connection patterns.

## Product Folder Structure

Each product is contained in its own folder with the following structure:

### Required Files

#### `{ProductName}.blend`
- The main Blender file containing the asset
- Should be clean and optimized
- Proper scene units (metric, 0.001 scale, millimeters)
- Asset properly marked in Asset Browser

#### `{ProductName}.json`
- Product metadata in standardized JSON format
- Must validate against `schemas/product-metadata.schema.json`
- Contains product information, pricing, and technical details
- Compatible with both Shopify and Polar e-commerce platforms

#### `icon_{ProductName}.png`
- Product thumbnail/icon image
- Recommended size: 512x512px or 1024x1024px
- PNG format with transparency support
- Should clearly represent the product

### Optional Files

#### `{ProductName}_desc.md`
- Detailed product description in Markdown format
- Can include usage instructions, features, examples
- Used for website product pages
- Includes frontmatter with metadata

#### `{ProductName}.mp4` or `{ProductName}.gif`
- Video preview showing the product in action
- Helps users understand functionality
- MP4 preferred for quality, GIF for compatibility
- Keep file size reasonable (< 10MB)

#### `preview_{ProductName}.png`
- Additional preview images
- Can show different angles or use cases
- Multiple previews can be numbered: `preview_{ProductName}_1.png`, etc.

## Metadata Schema

The JSON metadata files follow a standardized schema that includes:

### Core Product Information
- `title`: Product name
- `handle`: URL-friendly identifier
- `description`: Product description
- `vendor`: Always "The Well Tarot"
- `product_type`: Type of Blender asset
- `tags`: Array of categorization tags
- `status`: active, draft, or archived

### Pricing and Inventory
- `variants`: Array of pricing variants
- SKU format: `NO3D-TOOLS-{PRODUCT-NAME}`
- Price format: `XX.XX`
- Inventory management: polar or shopify

### Technical Metadata (metafields)
- `asset_type`: Type of asset (GEOMETRY, MATERIAL, etc.)
- `blender_version`: Minimum Blender version required
- `export_date`: When the asset was exported
- `source_file`: Original source .blend file
- `blend_file`: This product's .blend file
- `thumbnail`: Icon file name
- `catalog_name`: Which catalog it belongs to
- `geometry_stats`: Mesh statistics (for geometry assets)

## Validation

### Automated Validation

Run the validation script to check all products:

```bash
python3 scripts/validate-products.py
```

This validates:
- JSON schema compliance
- Required files presence
- Business rule compliance
- File naming conventions

### Pre-commit Hooks

Install pre-commit hooks to validate on every commit:

```bash
pip install pre-commit
pre-commit install
```

## Naming Conventions

### Product Names
- Use PascalCase with spaces: "Dojo Bolt Gen v05"
- Be descriptive but concise
- Include version numbers when applicable
- Avoid special characters except spaces and hyphens

### File Names
- **Blend file**: Same as product name
- **JSON file**: Same as product name
- **Icon file**: `icon_{ProductName}.png`
- **Description file**: `{ProductName}_desc.md`
- **Video files**: `{ProductName}.mp4` or `{ProductName}.gif`

### JSON Fields
- **handle**: URL-friendly version (lowercase, hyphens): "dojo-bolt-gen-v05"
- **sku**: Uppercase with NO3D-TOOLS prefix: "NO3D-TOOLS-DOJO-BOLT-GEN-V05"
- **tags**: Use existing tags when possible

## Product Types

Supported product types:
- **Blender Add-on**: Python add-ons
- **Geometry Node**: Node groups for geometry
- **Material**: Shader materials
- **Collection**: Asset collections
- **Mesh Object**: 3D mesh objects
- **Node Group**: Reusable node groups

## Standard Tags

Use these standard tags when applicable:
- `blender` (always)
- `addon` (for add-ons)
- `3d` (always)
- `asset` (always)
- `geometry` (for geometry nodes)
- `material` (for materials)
- `node` (for node groups)
- `modeling` (for modeling tools)
- `texturing` (for texturing tools)
- `animation` (for animation tools)

## Quality Standards

### Blender Files
- Clean, optimized geometry
- Proper naming conventions
- No unnecessary data
- Proper scene units
- Asset properly marked

### Images
- High quality and clear
- Consistent style with existing products
- Appropriate file sizes
- Proper aspect ratios

### Documentation
- Clear, helpful descriptions
- Accurate technical details
- Usage instructions
- Examples when helpful

## Integration Points

This repository structure supports:

1. **SOLVET Asset Management Add-on Export**: Internal add-on exports assets directly from Blender to the `no3d-tools-library` repository (part of SOLVET workflow)
2. **NO3D Tools Asset Library Import**: Customer-facing add-on imports/consumes assets from the `no3d-tools-library` repository (product offering)
3. **Website Data Fetching**: Website reads product data from `no3d-tools-library` via GitHub API
4. **E-commerce Sync**: Automated sync from `no3d-tools-library` to Polar and other platforms
5. **Bundle Generation**: Automated product bundle creation based on metadata tags
6. **Validation**: Continuous validation of product integrity in the asset database

### Cross-Repository Connections

- **SOLVET Asset Management Add-on → Asset Database**: Internal export add-on exports products to `no3d-tools-library` repo
- **NO3D Tools Asset Library ← Asset Database**: Customer-facing add-on imports products from `no3d-tools-library` repo
- **Website → Asset Database**: Website fetches products via GitHub API from `no3d-tools-library` repo

**Important Distinction:**
- **SOLVET Asset Management Add-on** (internal use): Exports assets TO the library
- **NO3D Tools Asset Library** (customer-facing): Imports/consumes assets FROM the library
- These are two separate add-ons in separate repositories
- **Schemas → All Components**: Shared schemas validate data across all repositories

See [MULTI_REPO_ARCHITECTURE.md](./MULTI_REPO_ARCHITECTURE.md) and [REPO_CONNECTION_PATTERNS.md](./REPO_CONNECTION_PATTERNS.md) for implementation details.

## Maintenance

### Adding New Products
1. Follow the product folder structure
2. Use the templates in `templates/product-template/`
3. Validate with the validation script
4. Follow naming conventions
5. Include proper documentation

### Updating Existing Products
1. Maintain backward compatibility
2. Update metadata as needed
3. Re-validate after changes
4. Update documentation

### Repository Maintenance
1. Regular validation runs
2. Schema updates as needed
3. Template updates
4. Documentation updates

## Support

For questions about the repository structure:
- Check existing products for examples
- Review the validation script output
- Consult the CONTRIBUTING.md file
- Contact the maintainers
