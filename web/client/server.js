#!/usr/bin/env node

/**
 * Simple HTTP server for OpenYellow
 * Serves static files and proxies requests to openyellow.org
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// Proxy requests to openyellow.org
function proxyRequest(url, res) {
    const options = {
        hostname: 'openyellow.org',
        path: url,
        method: 'GET',
        headers: {
            'User-Agent': 'OpenYellow-Local-Server'
        }
    };

    console.log(`[PROXY] ${url} -> https://openyellow.org${url}`);

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': proxyRes.headers['content-type'] || 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error(`[PROXY ERROR] ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway: Could not connect to openyellow.org');
    });

    proxyReq.end();
}

// Serve static files
function serveFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
            return;
        }

        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}

// Create server
const server = http.createServer((req, res) => {
    const originalUrl = req.url;
    let url = req.url;
    
    // Remove query string for file path resolution
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
        url = url.substring(0, queryIndex);
    }

    console.log(`[${new Date().toISOString()}] ${req.method} ${originalUrl}`);

    // Proxy /data requests to openyellow.org
    if (url.startsWith('/data/')) {
        proxyRequest(originalUrl, res);
        return;
    }

    // Serve index.html for root
    if (url === '/') {
        url = '/index.html';
    }
    // Support URLs without .html extension
    else if (!path.extname(url)) {
        url = url + '.html';
    }

    // Build file path
    const filePath = path.join(__dirname, url);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        serveFile(filePath, res);
    });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log('');
    console.log('========================================');
    console.log('  OpenYellow Local Server');
    console.log('========================================');
    console.log('');
    console.log(`  Server running at: http://${HOST}:${PORT}/`);
    console.log('');
    console.log('  Features:');
    console.log('  - Serves static files');
    console.log('  - Proxies /data/* to openyellow.org');
    console.log('  - CORS enabled');
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('');
    console.log('========================================');
    console.log('');
});

// Handle errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\nError: Port ${PORT} is already in use.`);
        console.error('Try a different port: PORT=8001 node server.js\n');
    } else {
        console.error(`\nServer error: ${err.message}\n`);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server...');
    server.close(() => {
        console.log('Server stopped.\n');
        process.exit(0);
    });
});
