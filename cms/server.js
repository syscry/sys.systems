#!/usr/bin/env node

/**
 * syscry.com - CMS Server
 *
 * Run with: node cms/server.js
 * Then open: http://localhost:3000/cms/editor.html
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.join(__dirname, '..');
const CONTENT_FILE = path.join(__dirname, 'content.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(data);
  });
}

function listImages(res) {
  const imagesDir = path.join(ROOT, 'images');
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      res.writeHead(500);
      res.end('Error reading images');
      return;
    }
    // Get all images except responsive variants (-p-500, -p-800, etc.)
    const images = files.filter(f =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f) && !/-p-\d+\./.test(f)
    ).sort();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(images));
  });
}

function saveContent(res, body) {
  try {
    const data = JSON.parse(body);
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API endpoints
  if (pathname === '/api/images') {
    listImages(res);
    return;
  }

  if (pathname === '/api/content' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => saveContent(res, body));
    return;
  }

  if (pathname === '/content.json') {
    serveFile(res, CONTENT_FILE);
    return;
  }

  // Static files
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  if (fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   syscry CMS Server                      ║
  ║                                          ║
  ║   Editor:  http://localhost:${PORT}/cms/editor.html  ║
  ║   Preview: http://localhost:${PORT}/                 ║
  ║                                          ║
  ║   Press Ctrl+C to stop                   ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});
