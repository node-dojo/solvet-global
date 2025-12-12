/**
 * Library Download Endpoint
 * 
 * Generates a ZIP file containing all products from the no3d-tools-library repository
 * Verifies user has active Polar subscription before allowing download
 */

import { hasLibraryAccess } from '../../utils/polar-auth.js';
import archiver from 'archiver';
import { Octokit } from '@octokit/rest';
import { Readable } from 'stream';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'node-dojo';
const GITHUB_REPO = 'no3d-tools-library';
const GITHUB_BRANCH = 'main';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Cache for ZIP file (in production, use Redis or similar)
let zipCache = {
  version: null,
  buffer: null,
  timestamp: null,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get all products from GitHub repository
 */
async function getAllProducts() {
  try {
    const products = [];
    
    // Get root directory contents
    const { data: rootContents } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: '',
      ref: GITHUB_BRANCH,
    });

    // Find all Dojo* folders (product categories)
    const productFolders = rootContents.filter(item => 
      item.type === 'dir' && item.name.startsWith('Dojo')
    );

    // Get products from each folder
    for (const folder of productFolders) {
      try {
        const { data: folderContents } = await octokit.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: folder.name,
          ref: GITHUB_BRANCH,
        });

        // Each subfolder is a product
        const productDirs = folderContents.filter(item => item.type === 'dir');
        
        for (const productDir of productDirs) {
          try {
            const { data: productFiles } = await octokit.repos.getContent({
              owner: GITHUB_OWNER,
              repo: GITHUB_REPO,
              path: `${folder.name}/${productDir.name}`,
              ref: GITHUB_BRANCH,
            });

            // Collect product files
            const product = {
              path: `${folder.name}/${productDir.name}`,
              files: productFiles.filter(file => 
                file.type === 'file' && (
                  file.name.endsWith('.blend') ||
                  file.name.endsWith('.json') ||
                  file.name.endsWith('.png') ||
                  file.name.endsWith('.jpg') ||
                  file.name.endsWith('.jpeg') ||
                  file.name.endsWith('.mp4') ||
                  file.name.endsWith('.md')
                )
              ),
            };

            products.push(product);
          } catch (error) {
            console.warn(`Error reading product ${productDir.name}:`, error.message);
          }
        }
      } catch (error) {
        console.warn(`Error reading folder ${folder.name}:`, error.message);
      }
    }

    return products;
  } catch (error) {
    console.error('Error fetching products from GitHub:', error);
    throw new Error('Failed to fetch products from repository');
  }
}

/**
 * Generate ZIP file from products
 */
async function generateZipFile(products) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    const chunks = [];
    
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    archive.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    archive.on('error', (error) => {
      reject(error);
    });

    // Add each product file to the archive
    (async () => {
      for (const product of products) {
        for (const file of product.files) {
          try {
            // Get file content from GitHub
            const { data: fileData } = await octokit.repos.getContent({
              owner: GITHUB_OWNER,
              repo: GITHUB_REPO,
              path: `${product.path}/${file.name}`,
              ref: GITHUB_BRANCH,
            });

            // Decode base64 content
            const content = Buffer.from(fileData.content, 'base64');
            
            // Add to archive
            archive.append(content, {
              name: `${product.path}/${file.name}`,
            });
          } catch (error) {
            console.warn(`Error adding file ${file.name}:`, error.message);
          }
        }
      }

      // Finalize archive
      archive.finalize();
    })();
  });
}

/**
 * Get or generate cached ZIP file
 */
async function getCachedZip() {
  const now = Date.now();
  
  // Check if cache is valid
  if (zipCache.buffer && zipCache.timestamp && (now - zipCache.timestamp) < CACHE_DURATION) {
    return zipCache.buffer;
  }

  // Generate new ZIP
  console.log('Generating new ZIP file...');
  const products = await getAllProducts();
  const zipBuffer = await generateZipFile(products);
  
  // Update cache
  zipCache = {
    version: await getCatalogVersion(),
    buffer: zipBuffer,
    timestamp: now,
  };

  return zipBuffer;
}

/**
 * Get current catalog version (simplified - would come from version tracking)
 */
async function getCatalogVersion() {
  // For MVP, use timestamp as version
  // In Full Phase, this would read from catalog.json
  return Math.floor(Date.now() / 1000);
}

/**
 * Create signed download URL
 * In production, upload to S3/Cloudflare R2 and generate presigned URL
 * For MVP, we'll return the ZIP directly or use a temporary storage solution
 */
function createDownloadUrl(zipBuffer) {
  // For MVP, we'll return the buffer directly via API
  // In production, upload to storage and return presigned URL
  return {
    method: 'direct', // Indicates direct download
    buffer: zipBuffer,
  };
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
    // Get customer ID from query parameter
    const customerId = req.query.customer_id;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' });
    }

    // Verify subscription
    const hasAccess = await hasLibraryAccess(customerId);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Active subscription required',
        message: 'You need an active subscription to download the library'
      });
    }

    // Get ZIP file (from cache or generate)
    const zipBuffer = await getCachedZip();
    const catalogVersion = await getCatalogVersion();

    // For MVP: Return ZIP file directly
    // In production: Upload to storage and return presigned URL
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="no3d-tools-library-${catalogVersion}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.setHeader('X-Catalog-Version', catalogVersion.toString());
    
    return res.send(zipBuffer);
    
    // Alternative: Return download URL (for production)
    // const downloadUrl = createDownloadUrl(zipBuffer);
    // return res.status(200).json({
    //   downloadUrl: downloadUrl.url,
    //   expiresAt: downloadUrl.expiresAt,
    //   catalogVersion: catalogVersion,
    // });
    
  } catch (error) {
    console.error('Error in download endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
