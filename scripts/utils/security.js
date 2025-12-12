/**
 * Security utilities for scripts
 * Provides token masking and validation functions
 */

/**
 * Mask a token for safe display
 * Shows first 4 and last 4 characters
 * @param {string} token - The token to mask
 * @returns {string} Masked token
 */
function maskToken(token) {
  if (!token || typeof token !== 'string') {
    return '****';
  }
  if (token.length <= 8) {
    return '****';
  }
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

/**
 * Validate required environment variables
 * @param {string[]} requiredVars - Array of required environment variable names
 * @throws {Error} If any required variable is missing
 */
function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Safely log token information without exposing the full token
 * @param {string} varName - Name of the environment variable
 * @param {string} token - The token value
 */
function logTokenInfo(varName, token) {
  if (token) {
    console.log(`${varName}: ${maskToken(token)} (${token.length} chars)`);
  } else {
    console.log(`${varName}: not set`);
  }
}

/**
 * Sanitize error messages to avoid exposing tokens
 * @param {Error|string} error - Error object or message
 * @returns {string} Sanitized error message
 */
function sanitizeError(error) {
  let message = typeof error === 'string' ? error : error.message || String(error);
  
  // Remove potential token patterns
  message = message.replace(/ghp_[a-zA-Z0-9]{36}/g, 'ghp_***');
  message = message.replace(/gho_[a-zA-Z0-9]{36}/g, 'gho_***');
  message = message.replace(/polar_[a-zA-Z0-9_-]+/g, 'polar_***');
  message = message.replace(/Bearer\s+[a-zA-Z0-9_-]+/gi, 'Bearer ***');
  
  return message;
}

module.exports = {
  maskToken,
  validateEnvVars,
  logTokenInfo,
  sanitizeError
};

