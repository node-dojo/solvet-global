---
name: Dashboard SOLVET Integration
overview: Integrate the CO-AUG Dashboard as a first-class component of the SOLVET system by creating a separate GitHub repository, adding it to the workspace, and implementing full SOLVET integration features including git operations, validation, sync status, and workspace detection.
todos:
  - id: repo-setup
    content: Create GitHub repository solvet-dashboard and clone into workspace
    status: pending
  - id: update-scripts
    content: Update status-all.sh and update-all.sh to include solvet-dashboard
    status: pending
  - id: workspace-detection
    content: Create solvetConfig service to detect SOLVET workspace and set default paths
    status: pending
  - id: git-service
    content: Create gitService with commit, push, pull, and status operations
    status: pending
  - id: git-ui
    content: Add GitStatus component and integrate into ProductTabs
    status: pending
  - id: validation-service
    content: Create validationService using SOLVET schemas for product validation
    status: pending
  - id: validation-ui
    content: Add ValidationStatus component with real-time validation feedback
    status: pending
  - id: sync-service
    content: Create syncStatusService to check Polar and website sync status
    status: pending
  - id: sync-ui
    content: Add SyncStatus component showing Polar and website integration status
    status: pending
  - id: template-service
    content: Create templateService to generate products from SOLVET templates
    status: pending
  - id: deployment-enhance
    content: Enhance deployment service with git operations and SOLVET workflow
    status: pending
  - id: scripts-integration
    content: Create solvetScripts service to integrate with status-all.sh and update-all.sh
    status: pending
  - id: workspace-status-ui
    content: Add WorkspaceStatus component showing all repo statuses
    status: pending
  - id: update-readme
    content: Update SOLVET README.md with dashboard documentation
    status: pending
  - id: dashboard-readme
    content: Create solvet-dashboard/README.md with integration guide
    status: pending
  - id: update-architecture-docs
    content: Update REPOSITORY_STRUCTURE.md and MULTI_REPO_ARCHITECTURE.md
    status: pending
---

# Dashboard SOLVET Integration Plan

## Overview

Integrate the CO-AUG Dashboard (`/Users/joebowers/.../CO-AUG Dashboard`) into the SOLVET system as `co-aug-dashboard`, making it a core component with full integration to product database, git operations, validation, and sync services. The dashboard maintains its CO-AUG branding and identity while becoming a first-class SOLVET component.

**Key Intent:** The CO-AUG Dashboard is intended to replace older methods of pushing from local files to GitHub where there is overlap in functionality. It becomes the primary interface for product management, replacing manual git operations, export/import workflows, and other manual processes.

## Phase 1: Repository Setup

### 1.1 Create GitHub Repository

- Create new repository: `github.com/node-dojo/co-aug-dashboard`
- Initialize with existing dashboard code from `/Users/joebowers/.../CO-AUG Dashboard`
- Set up repository structure matching SOLVET conventions
- Keep existing package name: `co-aug-dashboard`

### 1.2 Clone into Workspace

- Clone repository into `solvet-global/co-aug-dashboard/`
- OR: Move existing dashboard folder and initialize git if not already a repo
- Verify git remote is configured correctly
- Test that dashboard runs from new location
- Maintain existing dashboard branding and naming (CO-AUG Dashboard)

### 1.3 Update Workspace Scripts

- Update `status-all.sh` to include `co-aug-dashboard` in repos array (line 42)
- Update `update-all.sh` to include `co-aug-dashboard` in repos array (line 40)
- Test scripts work with new repo

## Phase 2: SOLVET Workspace Detection

### 2.1 Create SOLVET Config Service

**File:** `electron/services/solvetConfig.ts`

- Detect if running in SOLVET workspace:
- Check if `../no3d-tools-library` exists
- Check for `../README.md` with SOLVET content
- Check for `../status-all.sh` script
- Store SOLVET workspace root path
- Provide default paths:
- Product library: `../no3d-tools-library`
- SOLVET system: `../solvet-system`
- Scripts: `../scripts`

### 2.2 Update Directory Selector

**File:** `src/components/DirectorySelector.tsx`

- Auto-select `no3d-tools-library` when SOLVET workspace detected
- Show SOLVET workspace indicator in UI
- Add "Open SOLVET Workspace" quick action

## Phase 3: Git Operations Service (Replaces Manual Git Workflow)

### 3.1 Create Git Service

**File:** `electron/services/gitService.ts`

**Features:**

- `getStatus(projectPath)` - Get git status for product folder
- `commit(projectPath, message)` - Commit changes to product (replaces manual git commit)
- `push(projectPath)` - Push to remote (replaces manual git push)
- `pull(projectPath)` - Pull latest changes
- `getBranch(projectPath)` - Get current branch
- `getUncommittedChanges(projectPath)` - List modified files
- `isGitRepository(path)` - Check if path is git repo
- `batchCommit(products, message)` - Commit multiple products at once

**Implementation:**

- Use `child_process.exec` to run git commands
- Parse git output for status information
- Handle errors gracefully with user feedback
- **Purpose:** Replace manual terminal git operations with UI-driven workflow

### 3.2 Add Git UI Components

**File:** `src/components/ProductFullView/GitStatus.tsx` (new)

- Display git status badge (clean/modified/uncommitted)
- Show branch name
- Quick actions: Commit, Push, Pull (replaces terminal commands)
- Show uncommitted files list
- Batch operations for multiple products
- **Replaces:** Manual `git add`, `git commit`, `git push` in terminal

**File:** `src/components/ProductFullView/ProductTabs.tsx`

- Add "Git" tab to product view
- Integrate GitStatus component
- Make git operations primary workflow (not secondary)

## Phase 4: Validation Service

### 4.1 Create Validation Service

**File:** `electron/services/validationService.ts`

**Features:**

- `validateProduct(productPath)` - Validate product against SOLVET schema
- `validateJSON(jsonPath)` - Validate JSON file against schema
- `checkRequiredFiles(productPath)` - Check for required files (.blend, .json, icon)
- `getValidationErrors(productPath)` - Get detailed validation errors

**Implementation:**

- Load schema from `solvet-system/schemas/product-metadata.schema.json`
- Use JSON schema validation library (ajv or similar)
- Check file existence and naming conventions
- Return structured validation results

### 4.2 Add Validation UI

**File:** `src/components/ProductFullView/ValidationStatus.tsx` (new)

- Display validation status badge (valid/errors/warnings)
- Show validation errors list
- Link to fix suggestions
- Real-time validation on file changes

**File:** `src/components/ProductCard/ProductCard.tsx`

- Add validation status indicator to product cards
- Show validation errors in tooltip

## Phase 5: Sync Status Service

### 5.1 Create Sync Status Service

**File:** `electron/services/syncStatusService.ts`

**Features:**

- `checkPolarSync(productPath)` - Check if product synced to Polar
- `checkWebsiteSync(productPath)` - Check if product on website
- `getSyncStatus(productPath)` - Get overall sync status
- `triggerSync(productPath)` - Trigger sync workflows

**Implementation:**

- Read Polar mapping from `no3d-tools-website/polar-products.js`
- Check GitHub API for product in website repo
- Query Polar API for product existence
- Provide sync status indicators

### 5.2 Add Sync Status UI

**File:** `src/components/ProductFullView/SyncStatus.tsx` (new)

- Display sync status for Polar and Website
- Show last sync timestamp
- Quick sync actions
- Integration status indicators

## Phase 6: Product Template Service

### 6.1 Create Template Service

**File:** `electron/services/templateService.ts`

**Features:**

- `createFromTemplate(productName, templateType)` - Create product from SOLVET template
- `getAvailableTemplates()` - List available templates
- `applyTemplate(productPath, templatePath)` - Apply template to existing product

**Implementation:**

- Load templates from `solvet-system/templates/`
- Use product metadata template structure
- Generate proper file names and structure
- Create required files (.json, folder structure)

### 6.2 Update Product Creation

**File:** `src/components/Sidebar/NewProjectButton.tsx`

- Add "Create from SOLVET Template" option
- Show template selection dialog
- Use template service to create product

## Phase 7: Enhanced Deployment Service (Replaces Export/Import Workflow)

### 7.1 Update Deployment Service

**File:** `electron/services/deployment.ts`

**Enhancements:**

- Add `deployToGit(productPath, message)` - Direct git commit/push (replaces manual git operations)
- Add `deployToSOLVET(productPath)` - Full SOLVET deployment workflow
- Integrate with git service for commits
- Add validation before deployment
- Show deployment progress
- **Replace `apply-dashboard-changes.js` workflow** - Direct git operations eliminate need for export/import

### 7.2 Add Deployment UI

**File:** `src/components/ProductFullView/DeploymentActions.tsx` (new)

- "Deploy to SOLVET" button (primary workflow)
- Deployment workflow:

1. Validate product
2. Commit to git (replaces export step)
3. Push to remote (replaces import/apply step)
4. Show sync status

- Deployment history/log
- **Note:** This replaces the old export → apply-dashboard-changes.js → commit workflow

## Phase 8: Integration with SOLVET Scripts

### 8.1 Script Integration Service

**File:** `electron/services/solvetScripts.ts`

**Features:**

- `runStatusAll()` - Execute status-all.sh and parse output
- `runUpdateAll()` - Execute update-all.sh
- `runValidation(productPath)` - Run validation scripts
- `runSyncToPolar()` - Trigger Polar sync scripts

**Implementation:**

- Execute scripts via child_process
- Parse output for status information
- Handle errors and show progress
- Cache results for performance

### 8.2 Workspace Status View

**File:** `src/components/WorkspaceStatus.tsx` (new)

- Show status of all SOLVET repos
- Integration with status-all.sh output
- Quick actions for each repo
- Workspace health indicators

## Phase 9: Documentation Updates & Deprecation Notices

### 9.1 Update SOLVET README

**File:** `README.md`

- Add co-aug-dashboard to repository list
- Document dashboard as Component 3 (CO-AUG Dashboard)
- Add dashboard setup instructions
- Update architecture diagram
- Note: Dashboard is branded as CO-AUG Dashboard within SOLVET system
- **Mark dashboard as primary workflow** - Update workflow sections to prioritize dashboard over manual methods

### 9.4 Deprecate Old Workflows

**Files to update:**

**File:** `scripts/utils/apply-dashboard-changes.js`

- Add deprecation notice at top of file
- Document that CO-AUG Dashboard now handles this workflow directly
- Keep file for backward compatibility but mark as deprecated

**File:** `scripts/README.md`

- Update to note that dashboard replaces export/import workflow
- Document migration path from old workflow to dashboard
- Keep old scripts documented but marked as legacy

**File:** `docs/guides/QUICK_START.md`

- Update workflow to use dashboard as primary method
- Move manual git operations to "Advanced" or "Legacy" section

### 9.2 Create Dashboard Documentation

**File:** `co-aug-dashboard/README.md`

- Dashboard purpose and features
- SOLVET integration guide
- Setup instructions
- Usage examples
- Note: Dashboard maintains CO-AUG branding while integrating with SOLVET

### 9.3 Update Architecture Docs

**File:** `docs/planning/REPOSITORY_STRUCTURE.md`

- Add co-aug-dashboard to repository structure
- Document dashboard → product database flow
- Update integration points section
- Reference as CO-AUG Dashboard

**File:** `docs/planning/MULTI_REPO_ARCHITECTURE.md`

- Add dashboard repository details (co-aug-dashboard)
- Document dashboard connection patterns
- Update workflow diagrams
- Note CO-AUG Dashboard branding

## Phase 10: Testing & Validation

### 10.1 Test Workspace Detection

- Verify auto-detection in SOLVET workspace
- Test path resolution
- Verify default directory selection

### 10.2 Test Git Operations

- Test commit/push/pull from dashboard
- Verify git status display
- Test error handling

### 10.3 Test Validation

- Test with valid products
- Test with invalid products
- Verify schema loading
- Test real-time validation

### 10.4 Test Sync Status

- Verify Polar sync detection
- Verify website sync detection
- Test sync triggers

### 10.5 Test Integration Scripts

- Test status-all.sh integration
- Test update-all.sh integration
- Verify script output parsing

## Implementation Order

1. **Phase 1** - Repository setup (foundation)
2. **Phase 2** - Workspace detection (enables other features)
3. **Phase 3** - Git operations (core functionality - replaces manual git)
4. **Phase 4** - Validation (quality assurance)
5. **Phase 5** - Sync status (visibility)
6. **Phase 6** - Templates (product creation)
7. **Phase 7** - Enhanced deployment (workflow completion - replaces export/import)
8. **Phase 8** - Script integration (workspace coordination)
9. **Phase 9** - Documentation & deprecation notices (knowledge transfer)
10. **Phase 10** - Testing (quality assurance)

## Migration Strategy

### Phase A: Parallel Operation (During Development)

- Dashboard and old methods work side-by-side
- Users can choose either workflow
- Dashboard marked as "beta" or "preferred"

### Phase B: Dashboard as Primary (After Full Implementation)

- Dashboard becomes recommended workflow
- Old methods marked as deprecated but still functional
- Documentation updated to prioritize dashboard

### Phase C: Legacy Support (Long-term)

- Old methods kept for backward compatibility
- Dashboard is only supported workflow for new features
- Old scripts maintained but not enhanced

## Key Files to Modify

**Dashboard Files:**

- `electron/main.ts` - Add SOLVET service initialization
- `electron/preload.ts` - Expose SOLVET APIs
- `src/components/DirectorySelector.tsx` - Auto-detect workspace
- `src/components/ProductFullView/ProductTabs.tsx` - Add new tabs
- `package.json` - Add validation dependencies (ajv)

**SOLVET Files:**

- `status-all.sh` - Add co-aug-dashboard
- `update-all.sh` - Add co-aug-dashboard
- `README.md` - Document dashboard (refer to as CO-AUG Dashboard)
- `docs/planning/REPOSITORY_STRUCTURE.md` - Update structure
- `docs/planning/MULTI_REPO_ARCHITECTURE.md` - Update architecture

## Dependencies to Add

**Dashboard package.json:**

- `ajv` - JSON schema validation
- `simple-git` (optional) - Git operations wrapper
- `node-fetch` - For API calls to Polar/GitHub

## Configuration

**Dashboard electron-store keys:**

- `solvet.workspaceRoot` - SOLVET workspace path
- `solvet.libraryPath` - Product library path
- `solvet.enabled` - SOLVET integration enabled
- `solvet.gitAutoCommit` - Auto-commit on save (optional)

## Success Criteria

1. Dashboard detects SOLVET workspace automatically
2. Git operations work from dashboard UI (replaces manual terminal commands)
3. Validation shows real-time feedback
4. Sync status displays correctly
5. Products can be created from templates
6. Deployment workflow completes successfully (replaces export/import workflow)
7. Integration scripts work from dashboard
8. All documentation updated with dashboard as primary method
9. Dashboard appears in workspace status scripts (as co-aug-dashboard)
10. Full workflow: Edit → Validate → Commit → Push → Sync works end-to-end
11. CO-AUG Dashboard branding and naming preserved throughout
12. **Old workflows properly deprecated** - apply-dashboard-changes.js marked as legacy
13. **Migration path documented** - Clear instructions for moving from old to new workflow
14. **Dashboard handles all use cases** - No functionality gaps requiring fallback to old methods