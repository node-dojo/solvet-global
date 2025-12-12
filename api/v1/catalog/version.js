/**
 * Catalog Version Endpoint
 * 
 * Returns the current catalog version number
 * Used by frontend to check for library updates
 */

import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'node-dojo';
const GITHUB_REPO = 'no3d-tools-library';
const GITHUB_BRANCH = 'main';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

/**
 * Get catalog version from version.json or catalog.json
 * Falls back to timestamp-based version if file doesn't exist
 */
async function getCatalogVersion() {
  try {
    // Try to read version.json first
    try {
      const { data: versionFile } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: 'catalog.json',
        ref: GITHUB_BRANCH,
      });

      if (versionFile.content) {
        const content = JSON.parse(Buffer.from(versionFile.content, 'base64').toString());
        return {
          version: content.version || 1,
          lastUpdated: content.last_updated || content.lastUpdated,
          productCount: content.product_count || content.productCount,
        };
      }
    } catch (error) {
      // File doesn't exist, continue to fallback
    }

    // Fallback: Use timestamp-based version
    // In production, this would be maintained by GitHub webhook
    return {
      version: Math.floor(Date.now() / 1000), // Unix timestamp as version
      lastUpdated: new Date().toISOString(),
      productCount: null,
    };
  } catch (error) {
    console.error('Error getting catalog version:', error);
    // Return default version on error
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      productCount: null,
    };
  }
}

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const versionData = await getCatalogVersion();
    
    return res.status(200).json(versionData);
  } catch (error) {
    console.error('Error in version endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
