const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reposRoutes = require('./routes/repos');
const authorsRoutes = require('./routes/authors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/repos', reposRoutes);
app.use('/api/authors', authorsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  OpenYellow API Server');
    console.log('========================================');
    console.log('');
    console.log(`  Server running at: http://localhost:${PORT}/`);
    console.log('');
    console.log('  Endpoints:');
    console.log('  - GET  /health');
    console.log('  - GET  /api/repos');
    console.log('  - GET  /api/repos/stats');
    console.log('  - GET  /api/repos/:id');
    console.log('  - GET  /api/authors');
    console.log('  - GET  /api/authors/:name');
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('');
    console.log('========================================');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server...');
    process.exit(0);
});
