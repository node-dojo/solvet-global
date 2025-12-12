#!/usr/bin/env node

/**
 * Simple test server for API endpoints
 * Tests endpoints without Vercel
 */

require('dotenv').config();
const http = require('http');
const url = require('url');

// Import API handlers
const catalogVersion = require('../api/v1/catalog/version.js');
const userEntitlements = require('../api/v1/user/entitlements.js');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    if (path === '/api/v1/catalog/version') {
      const handler = catalogVersion.default || catalogVersion;
      const result = await handler({ query });
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } else if (path === '/api/v1/user/entitlements') {
      const handler = userEntitlements.default || userEntitlements;
      const result = await handler({ query });
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Test endpoints:');
  console.log(`  curl http://localhost:${PORT}/api/v1/catalog/version`);
  console.log(`  curl http://localhost:${PORT}/api/v1/user/entitlements?customer_id=test`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});



