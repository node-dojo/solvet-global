# Branch Protection Policy

This document outlines the branch protection rules and requirements for the SOLVET Global repository.

## Protected Branches

### Main Branch (`main`)

The `main` branch is the production branch and has the following protections:

#### Required Status Checks
- CI workflow must pass
- Dependency review must pass
- Secret scanning must pass
- Code review required

#### Branch Protection Rules
- **Require pull request reviews**: At least 1 approval required
- **Dismiss stale reviews**: Enabled
- **Require status checks**: All checks must pass
- **Require branches to be up to date**: Enabled
- **Do not allow bypassing**: Enabled (except for repository administrators)
- **Restrict pushes**: Only via pull requests
- **Require linear history**: Optional (recommended)

#### Pull Request Requirements
- PR must be reviewed by at least one maintainer
- All CI checks must pass
- No merge conflicts
- PR must be up to date with `main`

### Develop Branch (`develop`)

The `develop` branch is the integration branch and has similar protections:

#### Required Status Checks
- CI workflow must pass
- Dependency review must pass

#### Branch Protection Rules
- **Require pull request reviews**: At least 1 approval required
- **Require status checks**: All checks must pass
- **Restrict pushes**: Only via pull requests

## Workflow

### Creating Features

1. Create feature branch from `main` or `develop`
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Address review feedback
6. Merge after approval

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `security/description` - Security improvements

## Enforcement

Branch protection rules are enforced at the repository level. Administrators can:
- Temporarily bypass rules for emergency fixes (with documentation)
- Adjust rules as needed (with team approval)
- Review and update rules quarterly

## Exceptions

Emergency fixes may bypass normal procedures with:
- Administrator approval
- Documentation of the emergency
- Follow-up PR to address any technical debt
- Post-mortem review

## Best Practices

1. **Keep branches small** - Easier to review and merge
2. **Update frequently** - Rebase on main/develop regularly
3. **Clear commit messages** - Follow conventional commits
4. **Test before PR** - Ensure all tests pass locally
5. **Document changes** - Update README/CHANGELOG as needed

## Questions?

Contact repository administrators or open an issue for questions about branch protection.

