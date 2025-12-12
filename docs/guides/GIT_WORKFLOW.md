# Git Workflow Guide - Solvet Global

This guide covers branch management and version control for the Solvet Global repository and its submodules.

## Table of Contents
- [Core Principles](#core-principles)
- [Initial Setup](#initial-setup)
- [Daily Workflow](#daily-workflow)
- [Working with Submodules](#working-with-submodules)
- [Pull Request Process](#pull-request-process)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

---

## Core Principles

### The Golden Rules
1. **Never commit directly to `main`** - Always work on feature branches
2. **Main branch = Production** - Main should always be deployable
3. **Submodules are independent** - Each submodule has its own branches and workflow
4. **Update submodules first** - Always commit/push submodule changes before updating parent repo
5. **Pull Requests required** - All merges to main go through PR review

---

## Initial Setup

### First Time Setup
```bash
# Clone the repository
git clone https://github.com/node-dojo/solvet-global-1.git
cd solvet-global-1

# Initialize all submodules
git submodule update --init --recursive

# Verify submodules are ready
git submodule status
```

### Configure Git (if not already done)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Daily Workflow

### Starting New Work

```bash
# 1. Make sure you're on main
git checkout main

# 2. Get latest changes
git pull origin main

# 3. Update all submodules to latest tracked versions
git submodule update --recursive

# 4. Create a new feature branch
git checkout -b feature/descriptive-name
```

### Branch Naming Conventions
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/what-refactoring` - Code improvements
- `docs/documentation-update` - Documentation only
- `update/submodule-name` - Submodule version updates

### Making Commits

```bash
# Stage your changes
git add <files>
# or
git add .

# Commit with clear message
git commit -m "Brief description of what and why"

# Push to remote
git push -u origin feature/your-branch-name
```

### Good Commit Messages
- ✅ "Add user authentication to API endpoints"
- ✅ "Fix null pointer exception in data validator"
- ✅ "Refactor database connection pooling for performance"
- ❌ "Update stuff"
- ❌ "Fixed it"
- ❌ "WIP"

---

## Working with Submodules

### Our Submodules
- `no3d-prints-library` - Printing functionality
- `solvet-system` - Core system components
- `no3d-tools-website` - Website/frontend
- `no3d-tools-library` - Tools library
- `no3d-tools-addon` - Add-on functionality
- `no3d-not3s-library` - Notes library

### Workflow: Changing Code Inside a Submodule

```bash
# 1. Navigate into the submodule
cd no3d-tools-library

# 2. Create a branch IN THE SUBMODULE
git checkout main
git pull origin main
git checkout -b feature/my-submodule-feature

# 3. Make changes and commit
git add .
git commit -m "Add new feature to tools library"
git push -u origin feature/my-submodule-feature

# 4. Create PR in the SUBMODULE'S repository
# (Wait for review and merge)

# 5. After merge, update to latest
git checkout main
git pull origin main

# 6. Return to parent repo
cd ..
```

### Workflow: Updating Parent to Use New Submodule Version

```bash
# After submodule PR is merged...

# 1. Create branch in parent repo
git checkout main
git pull origin main
git checkout -b update/no3d-tools-library

# 2. Update the submodule pointer
cd no3d-tools-library
git checkout main
git pull origin main
cd ..

# 3. Commit the submodule update in parent
git add no3d-tools-library
git commit -m "Update no3d-tools-library to v1.2.3 (or describe changes)"

# 4. Push and create PR in parent repo
git push -u origin update/no3d-tools-library
```

### Workflow: Changes in Both Submodule AND Parent Code

```bash
# STEP 1: Handle submodule changes first
cd solvet-system
git checkout -b feature/new-api
# ... make changes ...
git commit -m "Add new API endpoint"
git push -u origin feature/new-api
# Create PR, get reviewed, merge to main

# Update to merged version
git checkout main
git pull origin main
cd ..

# STEP 2: Handle parent repo changes
git checkout -b feature/integrate-new-api
git add solvet-system
git commit -m "Update solvet-system to include new API"

# Make parent code changes
# ... edit files ...
git add .
git commit -m "Integrate new API from solvet-system"
git push -u origin feature/integrate-new-api
# Create PR for parent repo
```

---

## Pull Request Process

### Creating a Pull Request

1. **Push your branch** to remote (GitHub)
   ```bash
   git push -u origin feature/your-branch
   ```

2. **Open PR on GitHub**
   - Go to repository on GitHub
   - Click "Pull Requests" → "New Pull Request"
   - Select your branch
   - Add clear title and description

3. **PR Description Should Include:**
   - What changed and why
   - Any breaking changes
   - Testing instructions
   - Related issues/tickets

4. **Request Reviews** from team members

5. **Address Feedback**
   ```bash
   # Make requested changes
   git add .
   git commit -m "Address PR feedback: fix error handling"
   git push
   ```

6. **After Approval:** Merge using GitHub interface
   - Usually use "Squash and merge" or "Merge commit"
   - Delete branch after merging

### After Your PR is Merged

```bash
# 1. Switch back to main
git checkout main

# 2. Pull the updates
git pull origin main

# 3. Delete local feature branch
git branch -d feature/your-branch
```

---

## Common Commands

### Checking Status

```bash
# Check parent repo status
git status

# Check all submodule status
git submodule status

# Check which branch you're on (in all submodules)
git submodule foreach 'echo "=== $name ===" && git branch'

# See what's changed in submodules
git diff --submodule
```

### Updating Everything

```bash
# Update parent repo
git pull origin main

# Update all submodules to tracked commits
git submodule update --recursive

# Pull latest in all submodules (advanced - updates beyond tracked commits)
git submodule foreach git pull origin main
```

### Undoing Mistakes (Before Push)

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to a file
git checkout -- <filename>

# Unstage files
git reset HEAD <filename>
```

### Cleaning Up Branches

```bash
# List all local branches
git branch

# Delete a local branch
git branch -d feature/old-branch

# Delete a remote branch
git push origin --delete feature/old-branch

# See merged branches
git branch --merged
```

---

## Troubleshooting

### "Detached HEAD" in Submodule

**Problem:** Submodule is not on any branch
```bash
cd <submodule>
# You'll see "HEAD detached at <commit>"
```

**Solution:**
```bash
# Create a branch from current state
git checkout -b feature/my-work

# OR checkout existing branch
git checkout main
git pull origin main
```

### Submodule Changes Not Showing

**Problem:** Made changes in submodule but parent repo doesn't see them

**Solution:**
```bash
# Make sure you committed in the submodule
cd <submodule>
git status
git add .
git commit -m "My changes"
cd ..

# Now parent repo should see the change
git status
```

### Merge Conflicts in Submodule Pointer

**Problem:** Two branches updated same submodule to different commits

**Solution:**
```bash
# 1. Decide which version to use
cd <submodule>
git checkout main
git pull origin main
cd ..

# 2. Stage the resolution
git add <submodule>
git commit -m "Resolve submodule conflict"
```

### "Modified Content" Warning on Submodule

**Problem:** `git status` shows submodule has "modified content"

**Solution:**
```bash
# Option 1: You made changes - commit them
cd <submodule>
git add .
git commit -m "Changes I made"
cd ..

# Option 2: Discard changes
cd <submodule>
git checkout .
cd ..

# Option 3: Stash changes for later
cd <submodule>
git stash
cd ..
```

### Someone Updated a Submodule and I'm Behind

```bash
# 1. Pull parent repo changes
git pull origin main

# 2. Update submodules to new tracked commits
git submodule update --recursive

# 3. Verify
git submodule status
```

---

## Quick Reference

### Never Do This
- ❌ `git push --force` to main (in parent or submodule)
- ❌ `git commit -a -m "stuff"` without reviewing changes
- ❌ Work directly on main branch
- ❌ Push submodule changes without committing them first
- ❌ Update parent repo to uncommitted submodule state

### Always Do This
- ✅ Create feature branches for all work
- ✅ Write descriptive commit messages
- ✅ Pull before starting new work
- ✅ Use Pull Requests for all merges to main
- ✅ Update submodules before and after pulling parent changes
- ✅ Check `git status` before committing
- ✅ Commit submodule changes before parent repo changes

### Daily Commands Checklist

**Starting your day:**
```bash
git checkout main
git pull origin main
git submodule update --recursive
git checkout -b feature/todays-work
```

**During work:**
```bash
git status                    # Check what changed
git add <files>              # Stage changes
git commit -m "message"      # Commit
git push                     # Push to remote
```

**End of day (if work incomplete):**
```bash
git add .
git commit -m "WIP: describe current state"
git push
```

---

## Getting Help

- Check this guide first
- `git status` - See current state
- `git log` - See commit history
- `git help <command>` - Get help on specific command
- Ask the team in Slack/Teams before forcing anything

---

**Remember:** When in doubt, ask before pushing! It's better to ask than to accidentally push to main or force-push and lose someone's work.
