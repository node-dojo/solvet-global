# Configuration

This directory contains configuration files for the SOLVET Global workspace.

## Files

### `libraries.config.json`
Configuration for managing multiple product libraries in the SOLVET system.

Defines:
- Library metadata (names, descriptions, types)
- GitHub repository connections
- Product folder structures
- Polar integration settings
- UI configuration

## Workspace Configuration

The `workspace/` subdirectory contains workspace-specific configurations (if any).

## Security

**Important**: Never commit sensitive configuration data to version control.

- Use environment variables for secrets
- Add sensitive configs to `.gitignore`
- Use `.env` files for local development
- Store production secrets in GitHub Secrets

## Updating Configuration

1. Edit the configuration file
2. Test changes locally
3. Commit with clear message
4. Update documentation if structure changes

## Questions?

See [CONTRIBUTING.md](../CONTRIBUTING.md) or open an issue for questions about configuration.

