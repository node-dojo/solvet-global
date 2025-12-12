# Contributing to SOLVET Global

Thank you for your interest in contributing to SOLVET Global! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Report issues or concerns to maintainers

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- Python 3.8+
- Git
- GitHub account

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/solvet-global.git
   cd solvet-global
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `security/description` - Security improvements

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, readable code
   - Add comments for complex logic
   - Follow existing code style

3. **Test your changes**
   ```bash
   npm test  # If tests exist
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

**Examples:**
```
feat(scripts): add token masking utility
fix(security): sanitize error messages
docs(readme): update installation instructions
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Push your changes**
   ```bash
   git push origin your-branch
   ```

3. **Create a Pull Request**
   - Fill out the PR template completely
   - Link related issues
   - Request review from maintainers
   - Ensure all CI checks pass

4. **Address review feedback**
   - Make requested changes
   - Respond to comments
   - Update PR as needed

## Code Style Guidelines

### JavaScript/Node.js

- Use ES6+ features
- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments for functions
- Handle errors appropriately

### Shell Scripts

- Use `#!/usr/bin/env bash` shebang
- Include `set -euo pipefail` for error handling
- Validate inputs
- Mask tokens in output
- Add usage/help functions

### Documentation

- Use Markdown format
- Keep documentation up to date
- Include code examples
- Add diagrams when helpful

## Security Guidelines

### Secrets Management

- **Never commit secrets, tokens, or API keys**
- Use environment variables for sensitive data
- Mask tokens in logs (use `scripts/utils/security.js`)
- Sanitize error messages
- Review PRs for exposed secrets

### Input Validation

- Validate all user inputs
- Sanitize outputs
- Use parameterized queries (if applicable)
- Handle edge cases

### Error Handling

- Don't expose sensitive information in errors
- Use sanitized error messages
- Log errors appropriately
- Exit with proper error codes

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Write tests for new features
- Test edge cases
- Test error conditions
- Aim for good coverage

## Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Update inline code comments
- Add/update docstrings
- Update CHANGELOG.md

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots when helpful
- Keep structure consistent

## Review Process

1. **Automated Checks**
   - CI/CD pipelines must pass
   - Code must pass linting
   - No security vulnerabilities
   - Dependencies reviewed

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Ensure tests pass
   - Documentation updated

3. **Merge**
   - Squash and merge (preferred)
   - Delete feature branch after merge
   - Update CHANGELOG.md

## Questions?

- Open an issue for questions
- Check existing documentation
- Ask in discussions (if enabled)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (if maintained)
- Credited in release notes
- Acknowledged in the project

Thank you for contributing to SOLVET Global!

