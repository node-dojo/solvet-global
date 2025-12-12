/**
 * GitHub Webhook Receiver
 * 
 * Receives webhook events from GitHub when products are added/updated
 * Increments catalog version to trigger update notifications
 */

import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const GITHUB_OWNER = 'node-dojo';
const GITHUB_REPO = 'no3d-tools-library';
const GITHUB_BRANCH = 'main';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

/**
 * Verify GitHub webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Signature from X-Hub-Signature-256 header
 * @returns {boolean} True if signature is valid
 */
function verifyWebhookSignature(payload, signature) {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn('⚠️  GITHUB_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // In development, allow without secret
  }

  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  const expectedSignature = `sha256=${digest}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Update catalog version file
 */
async function updateCatalogVersion() {
  try {
    // Get current catalog.json
    let currentVersion = 1;
    let catalogData = {
      version: 1,
      last_updated: new Date().toISOString(),
      product_count: null,
    };

    try {
      const { data: catalogFile } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: 'catalog.json',
        ref: GITHUB_BRANCH,
      });

      if (catalogFile.content) {
        catalogData = JSON.parse(Buffer.from(catalogFile.content, 'base64').toString());
        currentVersion = catalogData.version || 1;
      }
    } catch (error) {
      // File doesn't exist, create new one
      console.log('catalog.json does not exist, creating new file');
    }

    // Increment version
    catalogData.version = currentVersion + 1;
    catalogData.last_updated = new Date().toISOString();

    // Count products (simplified for MVP)
    // In Full Phase, this would count actual products
    try {
      const { data: rootContents } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: '',
        ref: GITHUB_BRANCH,
      });

      const productFolders = rootContents.filter(item => 
        item.type === 'dir' && item.name.startsWith('Dojo')
      );
      
      catalogData.product_count = productFolders.length;
    } catch (error) {
      console.warn('Could not count products:', error.message);
    }

    // Update catalog.json in repository
    const content = Buffer.from(JSON.stringify(catalogData, null, 2)).toString('base64');
    
    let sha = null;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: 'catalog.json',
        ref: GITHUB_BRANCH,
      });
      sha = existingFile.sha;
    } catch (error) {
      // File doesn't exist, will create new
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'catalog.json',
      message: `Update catalog version to ${catalogData.version}`,
      content: content,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    });

    console.log(`✅ Catalog version updated to ${catalogData.version}`);
    return catalogData;
  } catch (error) {
    console.error('Error updating catalog version:', error);
    throw error;
  }
}

/**
 * Process GitHub webhook event
 */
async function processWebhookEvent(event) {
  const { action, ref } = event;

  console.log(`📥 Received GitHub webhook event`);
  console.log(`   Action: ${action || 'push'}`);
  console.log(`   Ref: ${ref}`);

  // Only process pushes to main branch
  if (ref !== `refs/heads/${GITHUB_BRANCH}` && ref !== GITHUB_BRANCH) {
    console.log(`   ⏭️  Skipping - not main branch`);
    return;
  }

  // Check if products were modified
  const commits = event.commits || [];
  const productModified = commits.some(commit => 
    commit.added?.some(file => file.includes('Dojo')) ||
    commit.modified?.some(file => file.includes('Dojo')) ||
    commit.removed?.some(file => file.includes('Dojo'))
  );

  if (!productModified && commits.length > 0) {
    console.log(`   ⏭️  Skipping - no product changes detected`);
    return;
  }

  // Update catalog version
  await updateCatalogVersion();
}

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get signature from header
    const signature = req.headers['x-hub-signature-256'];
    if (!signature && GITHUB_WEBHOOK_SECRET) {
      console.warn('⚠️  Missing X-Hub-Signature-256 header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    // Verify webhook signature
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook event
    await processWebhookEvent(req.body);

    // Return success
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
