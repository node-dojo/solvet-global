# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

We take the security of the SOLVET system seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public issue for security vulnerabilities
2. Email security concerns to: [security contact email] or create a private security advisory on GitHub
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Security Best Practices for Contributors

#### Secrets Management

- **Never commit secrets, tokens, or API keys** to the repository
- Use environment variables for sensitive configuration
- Store secrets in GitHub Secrets for CI/CD workflows
- Use `.env` files locally (already in `.gitignore`)
- Rotate tokens regularly (every 90 days recommended)

#### Code Security

- Validate all user inputs
- Sanitize outputs to prevent token exposure
- Use parameterized queries for database operations
- Follow principle of least privilege for API tokens
- Review dependencies for known vulnerabilities

#### Script Security

- All scripts should validate inputs
- Mask tokens in logs (show only first/last 4 characters)
- Use `set -euo pipefail` in bash scripts
- Handle errors gracefully without exposing sensitive information
- Exit with appropriate error codes

#### GitHub Security

- Enable branch protection on main/master branches
- Require pull request reviews before merging
- Use GitHub's dependency scanning (Dependabot)
- Enable secret scanning alerts
- Regularly review and rotate access tokens

#### API Token Scopes

When creating GitHub tokens:
- Use minimum required scopes
- Prefer fine-grained tokens over classic tokens
- Set expiration dates
- Review token usage regularly

For Polar API tokens:
- Store in environment variables only
- Never log full tokens
- Rotate regularly
- Use organization-level tokens when possible

### Known Security Considerations

1. **Token Storage**: Tokens are stored in environment variables and GitHub Secrets, never in code
2. **API Rate Limits**: Be aware of GitHub API rate limits (5,000 requests/hour authenticated)
3. **File Access**: Product files in `no3d-tools-library` are private; website only displays metadata
4. **Checkout Security**: Payment processing handled by Polar.sh (PCI compliant)

### Security Updates

Security updates will be:
- Documented in CHANGELOG.md
- Tagged with security labels
- Released as patches for supported versions

### Disclosure Policy

- Vulnerabilities will be disclosed after a fix is available
- Credit will be given to reporters (if desired)
- CVEs will be assigned for significant vulnerabilities

---

**Last Updated**: 2024

