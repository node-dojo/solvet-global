#!/usr/bin/env node
/**
 * Server for previewing subscribing member UX
 * Serves the no3d-tools-website directory on port 3003 with mocked API endpoints
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3003;
// Serve from no3d-tools-website directory (parent directory's sibling)
const BASE_DIR = path.join(__dirname, '..', 'no3d-tools-website');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// Mock data for subscribing member
const mockSubscriptionData = {
  user: {
    id: 'cust_1234567890abcdef',
    email: 'subscriber@example.com',
    subscription_tier: 'pro_monthly'
  },
  entitlements: {
    libraries: ['all'],
    features: [],
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  }
};

const mockCatalogVersion = {
  version: 42,
  lastUpdated: new Date().toISOString(),
  productCount: 150
};

// Handle API endpoints
function handleAPI(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // User entitlements endpoint
  if (url.pathname === '/api/v1/user/entitlements') {
    const customerId = url.searchParams.get('customer_id') || mockSubscriptionData.user.id;
    
    // Return mock subscription data
    res.writeHead(200);
    res.end(JSON.stringify({
      ...mockSubscriptionData,
      user: {
        ...mockSubscriptionData.user,
        id: customerId
      }
    }));
    return;
  }

  // Catalog version endpoint
  if (url.pathname === '/api/v1/catalog/version') {
    res.writeHead(200);
    res.end(JSON.stringify(mockCatalogVersion));
    return;
  }

  // Library download endpoint (mock - returns a ZIP file blob)
  if (url.pathname === '/api/v1/library/download') {
    // Create a mock ZIP file content (minimal valid ZIP structure)
    // This is a minimal ZIP file that browsers can download
    const mockZipContent = Buffer.from([
      0x50, 0x4B, 0x03, 0x04, // ZIP file signature
      0x14, 0x00, // Version needed
      0x00, 0x00, // General purpose bit flag
      0x08, 0x00, // Compression method (deflate)
      0x00, 0x00, 0x00, 0x00, // Last mod time/date
      0x00, 0x00, 0x00, 0x00, // CRC32
      0x00, 0x00, 0x00, 0x00, // Compressed size
      0x00, 0x00, 0x00, 0x00, // Uncompressed size
      0x0A, 0x00, // Filename length
      0x00, 0x00, // Extra field length
      // Filename: "README.txt"
      0x52, 0x45, 0x41, 0x44, 0x4D, 0x45, 0x2E, 0x74, 0x78, 0x74,
      // File data (empty for mock)
      // Central directory
      0x50, 0x4B, 0x01, 0x02, // Central file header signature
      0x14, 0x00, // Version made by
      0x14, 0x00, // Version needed
      0x00, 0x00, // General purpose bit flag
      0x08, 0x00, // Compression method
      0x00, 0x00, 0x00, 0x00, // Last mod time/date
      0x00, 0x00, 0x00, 0x00, // CRC32
      0x00, 0x00, 0x00, 0x00, // Compressed size
      0x00, 0x00, 0x00, 0x00, // Uncompressed size
      0x0A, 0x00, // Filename length
      0x00, 0x00, // Extra field length
      0x00, 0x00, // File comment length
      0x00, 0x00, // Disk number start
      0x00, 0x00, // Internal file attributes
      0x00, 0x00, 0x00, 0x00, // External file attributes
      0x00, 0x00, 0x00, 0x00, // Relative offset of local header
      // Filename: "README.txt"
      0x52, 0x45, 0x41, 0x44, 0x4D, 0x45, 0x2E, 0x74, 0x78, 0x74,
      // End of central directory
      0x50, 0x4B, 0x05, 0x06, // End of central directory signature
      0x00, 0x00, // Number of this disk
      0x00, 0x00, // Number of disk with start of central directory
      0x01, 0x00, // Total number of entries in central directory on this disk
      0x01, 0x00, // Total number of entries in central directory
      0x2E, 0x00, 0x00, 0x00, // Size of central directory
      0x2E, 0x00, 0x00, 0x00, // Offset of start of central directory
      0x00, 0x00 // ZIP file comment length
    ]);
    
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="no3d-tools-library-${mockCatalogVersion.version}.zip"`,
      'X-Catalog-Version': mockCatalogVersion.version.toString()
    });
    res.end(mockZipContent);
    return;
  }

  // Individual product download endpoint (mock - returns 404 for now)
  if (url.pathname === '/api/v1/library/download/product') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Individual product download not yet implemented' }));
    return;
  }

  // Library files endpoint (mock - returns list of files)
  if (url.pathname === '/api/v1/library/files') {
    const mockFiles = [
      { name: 'Dojo_Assets_001', path: 'DojoAssets/Dojo_Assets_001', files: ['asset.blend', 'metadata.json', 'icon.png'], category: 'Assets' },
      { name: 'Dojo_Assets_002', path: 'DojoAssets/Dojo_Assets_002', files: ['asset.blend', 'metadata.json', 'icon.png'], category: 'Assets' },
      { name: 'Dojo_Tools_001', path: 'DojoTools/Dojo_Tools_001', files: ['tool.blend', 'metadata.json', 'preview.png'], category: 'Tools' },
      { name: 'Dojo_Tools_002', path: 'DojoTools/Dojo_Tools_002', files: ['tool.blend', 'metadata.json', 'preview.png'], category: 'Tools' },
      { name: 'Dojo_Environments_001', path: 'DojoEnvironments/Dojo_Environments_001', files: ['env.blend', 'metadata.json', 'icon.png'], category: 'Environments' },
      { name: 'Dojo_Materials_001', path: 'DojoMaterials/Dojo_Materials_001', files: ['material.blend', 'metadata.json', 'preview.png'], category: 'Materials' },
      { name: 'Dojo_Materials_002', path: 'DojoMaterials/Dojo_Materials_002', files: ['material.blend', 'metadata.json', 'preview.png'], category: 'Materials' },
      { name: 'Dojo_Props_001', path: 'DojoProps/Dojo_Props_001', files: ['prop.blend', 'metadata.json', 'icon.png'], category: 'Props' },
    ];
    
    res.writeHead(200);
    res.end(JSON.stringify({ files: mockFiles }));
    return;
  }

  // GitHub contents endpoint - proxies to GitHub API
  if (url.pathname === '/api/get-github-contents') {
    handleGitHubContents(req, res, url);
    return;
  }

  // Unknown API endpoint
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Handle GitHub contents API request
async function handleGitHubContents(req, res, url) {
  try {
    // Get query parameters
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    const branch = url.searchParams.get('branch') || 'main';
    const path = url.searchParams.get('path') || '';

    if (!owner || !repo) {
      res.writeHead(400);
      res.end(JSON.stringify({
        error: 'Missing required parameters: owner and repo are required',
        contents: []
      }));
      return;
    }

    // Construct GitHub API URL
    const apiPath = path ? `/${path}` : '';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents${apiPath}?ref=${branch}`;

    // Prepare headers
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'NO3D-Tools-Website',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // Add GitHub token if available (from environment variable)
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }

    // Fetch from GitHub API
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error: ${response.status} ${response.statusText}`, errorText);
      
      res.writeHead(response.status);
      res.end(JSON.stringify({
        error: `GitHub API error: ${response.status} ${response.statusText}`,
        message: errorText,
        contents: []
      }));
      return;
    }

    const contents = await response.json();

    // Handle GitHub API error responses
    if (contents.message) {
      console.error(`GitHub API error message: ${contents.message}`);
      res.writeHead(404);
      res.end(JSON.stringify({
        error: contents.message,
        contents: []
      }));
      return;
    }

    // Return contents array
    res.writeHead(200);
    res.end(JSON.stringify({
      contents: Array.isArray(contents) ? contents : [contents],
      owner,
      repo,
      branch,
      path
    }));

  } catch (error) {
    console.error('Error fetching GitHub contents:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      contents: []
    }));
  }
}

const server = http.createServer((req, res) => {
  // Handle API endpoints
  if (req.url.startsWith('/api/')) {
    handleAPI(req, res);
    return;
  }

  // Parse URL for static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Auto-inject customer_id for account.html if not present
  if (filePath === '/account.html' || filePath.startsWith('/account.html')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (!url.searchParams.has('customer_id')) {
      url.searchParams.set('customer_id', mockSubscriptionData.user.id);
      res.writeHead(302, { 'Location': url.pathname + '?' + url.searchParams.toString() });
      res.end();
      return;
    }
  }
  
  filePath = path.join(BASE_DIR, filePath.split('?')[0]); // Remove query params for file path

  // Security: prevent directory traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if path exists and is a directory
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      // Path doesn't exist
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file was not found on this server.</p>
            <p><a href="/account.html">Go to Account Page</a></p>
          </body>
        </html>
      `);
      return;
    }

    // If it's a directory, try to serve index.html or redirect
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (indexErr) => {
        if (indexErr) {
          // No index.html, redirect to account.html
          res.writeHead(302, { 'Location': '/account.html' });
          res.end();
        } else {
          // Serve index.html
          filePath = indexPath;
          serveFile(filePath, res);
        }
      });
      return;
    }

    // It's a file, serve it
    serveFile(filePath, res);
  });
});

// Helper function to serve a file
function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>404 - Not Found</title></head>
            <body>
              <h1>404 - File Not Found</h1>
              <p>The requested file was not found on this server.</p>
              <p><a href="/account.html">Go to Account Page</a></p>
            </body>
          </html>
        `);
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n🚀 Subscriber Preview Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Subscribing Member UX:`);
  console.log(`   • Account Page: http://localhost:${PORT}/account.html`);
  console.log(`   • Subscribe Page: http://localhost:${PORT}/subscribe.html`);
  console.log(`   • Success Page: http://localhost:${PORT}/success.html`);
  console.log(`\n💡 Mock Data:`);
  console.log(`   • Customer ID: ${mockSubscriptionData.user.id}`);
  console.log(`   • Email: ${mockSubscriptionData.user.email}`);
  console.log(`   • Subscription: Active`);
  console.log(`   • Catalog Version: ${mockCatalogVersion.version}`);
  console.log(`\n📝 Note: API endpoints are mocked for preview purposes`);
  console.log(`   Press Ctrl+C to stop the server\n`);
});




